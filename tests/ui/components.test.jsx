// @vitest-environment jsdom
// Componentes novos do refinamento de UX (docs/ux/PLANO_UX.md): guarda de rascunho do Modal,
// Popover, criação inline, fichas de uso, desfazer dano e ordem das sessões.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { LangProvider } from '../../src/i18n'
import { ToastProvider } from '../../src/ui/Toast'
import { Modal } from '../../src/ui/Modal'
import { Popover } from '../../src/ui/Popover'
import { QuickAdd, TokenTrack } from '../../src/ui/controls'
import { HpTracker } from '../../src/features/sheet/HpTracker'
import { NotesPanel } from '../../src/features/journal/NotesPanel'

afterEach(() => cleanup())
const wrap = ui => render(<LangProvider><ToastProvider><MemoryRouter>{ui}</MemoryRouter></ToastProvider></LangProvider>)

describe('Modal com confirmClose', () => {
  function Harness({ dirty, onClose }) {
    const [open, setOpen] = useState(true)
    return <Modal open={open} onClose={() => { onClose(); setOpen(false) }} confirmClose={dirty} title="Preparar"><input aria-label="campo" /></Modal>
  }

  it('com alterações, Esc pede confirmação; "Continuar editando" mantém aberto e "Descartar" fecha', () => {
    const onClose = vi.fn()
    wrap(<Harness dirty onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Descartar as alterações não salvas?')).toBeTruthy()
    fireEvent.click(screen.getByText('Continuar editando'))
    expect(screen.queryByText('Descartar as alterações não salvas?')).toBeNull()
    fireEvent.keyDown(document, { key: 'Escape' })
    fireEvent.click(screen.getByText('Descartar'))
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('sem alterações, Esc fecha direto (comportamento antigo)', () => {
    const onClose = vi.fn()
    wrap(<Harness dirty={false} onClose={onClose} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('Popover', () => {
  it('abre no clique, fecha com Esc e devolve o foco ao gatilho', () => {
    wrap(<Popover label="CA: 18" trigger="18"><p>composição</p></Popover>)
    const trigger = screen.getByRole('button', { name: 'CA: 18' })
    fireEvent.click(trigger)
    expect(screen.getByText('composição')).toBeTruthy()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByText('composição')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
})

describe('QuickAdd (nada de linha com nome falso)', () => {
  it('Enter cria com o nome digitado; vazio não chama; falha mantém o texto', async () => {
    const onSubmit = vi.fn().mockResolvedValueOnce(undefined).mockResolvedValueOnce({ id: 1 })
    wrap(<QuickAdd placeholder="Nome do item" onSubmit={onSubmit} />)
    const input = screen.getByLabelText('Nome do item')
    fireEvent.submit(input.closest('form'))
    expect(onSubmit).not.toHaveBeenCalled()

    fireEvent.change(input, { target: { value: 'Corda' } })
    await act(async () => { fireEvent.submit(input.closest('form')) })
    expect(onSubmit).toHaveBeenLastCalledWith('Corda', { qty: 1 })
    expect(input.value).toBe('Corda') // falhou: o texto fica para tentar de novo

    await act(async () => { fireEvent.submit(input.closest('form')) })
    expect(input.value).toBe('')
  })
})

describe('TokenTrack', () => {
  it('um clique = um toggle, com estado anunciado', () => {
    const onToggle = vi.fn()
    wrap(<TokenTrack total={3} label="Fúria" isUsed={i => i === 0} onToggle={onToggle} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].getAttribute('aria-pressed')).toBe('true')
    expect(buttons[1].getAttribute('aria-label')).toContain('uso 2 de 3, disponível')
    fireEvent.click(buttons[1])
    expect(onToggle).toHaveBeenCalledTimes(1)
    expect(onToggle).toHaveBeenCalledWith(1)
  })
})

describe('HpTracker', () => {
  const sheet = { hp: { status: 'ok', suggestedMax: 20 } }

  it('dano consome temporários e "Desfazer" devolve os valores anteriores', async () => {
    const ch = { id: 1, hp_current: 10, hp_max: 20, hp_temp: 3, nonlethal: 0 }
    const patchCharacter = vi.fn().mockResolvedValue(true)
    wrap(<HpTracker ch={ch} sheet={sheet} actions={{ patchCharacter }} />)
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '5' } })
    await act(async () => { fireEvent.click(screen.getByText('Dano')) })
    expect(patchCharacter).toHaveBeenLastCalledWith({ hp_temp: 0, hp_current: 8 })
    expect(await screen.findByText('−5 PV (3 nos temporários)')).toBeTruthy()
    // o componente não recebeu o ch novo (sem servidor): os PV "mudaram depois" → desfazer é recusado
    fireEvent.click(screen.getByText('Desfazer'))
    expect(await screen.findByText('Não dá para desfazer: os PV mudaram depois.')).toBeTruthy()
  })

  it('desfazer restaura quando ninguém mexeu nos PV depois', async () => {
    let ch = { id: 1, hp_current: 10, hp_max: 20, hp_temp: 0, nonlethal: 0 }
    const patchCharacter = vi.fn(async v => { ch = { ...ch, ...v }; view.rerender(<LangProvider><ToastProvider><MemoryRouter><HpTracker ch={ch} sheet={sheet} actions={{ patchCharacter }} /></MemoryRouter></ToastProvider></LangProvider>); return true })
    const view = wrap(<HpTracker ch={ch} sheet={sheet} actions={{ patchCharacter }} />)
    fireEvent.change(screen.getByLabelText('Valor'), { target: { value: '4' } })
    await act(async () => { fireEvent.click(screen.getByText('Dano')) })
    await act(async () => { fireEvent.click(await screen.findByText('Desfazer')) })
    expect(patchCharacter).toHaveBeenLastCalledWith({ hp_temp: 0, hp_current: 10 })
  })
})

describe('NotesPanel', () => {
  it('lista as sessões da mais recente para a mais antiga (mesmo com append otimista)', async () => {
    const data = { notes: [
      { id: 1, title: 'Antiga', session_date: '2026-01-01', content: '' },
      { id: 2, title: 'Recente', session_date: '2026-03-01', content: '' },
      { id: 3, title: 'Do meio', session_date: '2026-02-01', content: '' },
    ] }
    wrap(<NotesPanel data={data} actions={{}} selectedId={null} onSelect={() => {}} />)
    await waitFor(() => expect(screen.getAllByText(/Antiga|Recente|Do meio/).length).toBeGreaterThan(0))
    const order = screen.getAllByRole('button').map(b => b.textContent).filter(t => /Antiga|Recente|Do meio/.test(t))
    expect(order.map(t => t.match(/Antiga|Recente|Do meio/)[0]).slice(0, 3)).toEqual(['Recente', 'Do meio', 'Antiga'])
  })
})
