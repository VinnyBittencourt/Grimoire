// @vitest-environment jsdom
// Testes de interação (DOM real via jsdom): campos, Modal, RichText e o contrato das mutações.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act, renderHook, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LangProvider } from '../../src/i18n'
import { ToastProvider } from '../../src/ui/Toast'
import { TextField, NumberField } from '../../src/ui/fields'
import { Modal } from '../../src/ui/Modal'
import { RichText } from '../../src/ui/RichText'
import { useSheetActions, keys } from '../../src/queries/characters'

afterEach(() => { cleanup(); vi.unstubAllGlobals() })

describe('campos (salvam no blur/Enter, cancelam com Esc)', () => {
  it('passar por um campo vazio (null) não dispara commit', () => {
    const onCommit = vi.fn()
    render(<TextField label="Nome" value={null} onCommit={onCommit} />)
    const input = screen.getByLabelText('Nome')
    fireEvent.focus(input)
    fireEvent.blur(input)
    expect(onCommit).not.toHaveBeenCalled()
  })

  it('edita, confirma com Enter e cancela com Esc', () => {
    const onCommit = vi.fn()
    render(<TextField label="Nome" value="Bonar" onCommit={onCommit} />)
    const input = screen.getByLabelText('Nome')
    fireEvent.change(input, { target: { value: 'Bonar II' } })
    fireEvent.blur(input)
    expect(onCommit).toHaveBeenCalledWith('Bonar II')

    fireEvent.change(input, { target: { value: 'descartar' } })
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(input.value).toBe('Bonar')
  })

  it('apagar o texto de um campo nullable manda null', () => {
    const onCommit = vi.fn()
    render(<TextField label="Nome" value="x" onCommit={onCommit} />)
    const input = screen.getByLabelText('Nome')
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.blur(input)
    expect(onCommit).toHaveBeenCalledWith(null)
  })

  it('número limitado por max mostra o valor limitado, mesmo sem mudança no servidor', () => {
    const onCommit = vi.fn()
    render(<NumberField label="Nível" value={20} max={20} onCommit={onCommit} />)
    const input = screen.getByLabelText('Nível')
    fireEvent.change(input, { target: { value: '99' } })
    fireEvent.blur(input)
    expect(onCommit).not.toHaveBeenCalled() // 99 → 20, igual ao atual
    expect(input.value).toBe('20')
  })

  it('número inválido volta ao valor anterior', () => {
    const onCommit = vi.fn()
    render(<NumberField label="PV" value={7} onCommit={onCommit} />)
    const input = screen.getByLabelText('PV')
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.blur(input)
    expect(onCommit).not.toHaveBeenCalled()
    expect(input.value).toBe('7')
  })
})

describe('Modal', () => {
  function Harness({ onClose = () => {} }) {
    const [open, setOpen] = useState(false)
    return (
      <LangProvider>
        <button onClick={() => setOpen(true)}>abrir</button>
        <Modal open={open} onClose={() => { onClose(); setOpen(false) }} title="Teste">
          <input aria-label="primeiro" />
          <input aria-label="alvo" data-autofocus />
        </Modal>
      </LangProvider>
    )
  }

  it('foca [data-autofocus], fecha com Esc e devolve o foco a quem abriu', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    const opener = screen.getByText('abrir')
    opener.focus()
    fireEvent.click(opener)
    expect(document.activeElement).toBe(screen.getByLabelText('alvo'))
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(opener)
  })

  it('sem closeOnBackdrop, clicar fora não fecha', () => {
    const onClose = vi.fn()
    render(<Harness onClose={onClose} />)
    fireEvent.click(screen.getByText('abrir'))
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement)
    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('RichText', () => {
  const editorEl = () => document.querySelector('.ProseMirror')

  it('foco e blur sem editar não regravam a nota (HTML antigo do v1)', async () => {
    const onSave = vi.fn()
    render(<LangProvider><RichText value={'<div>nota v1<br><font color="red">x</font></div>'} onSave={onSave} docKey={1} /></LangProvider>)
    await waitFor(() => expect(editorEl()).toBeTruthy())
    fireEvent.focus(editorEl())
    fireEvent.blur(editorEl())
    cleanup() // desmontar também não salva
    expect(onSave).not.toHaveBeenCalled()
  })
})

describe('useSheetActions: contrato de retorno', () => {
  function setup(fetchImpl) {
    vi.stubGlobal('fetch', vi.fn(fetchImpl))
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    qc.setQueryData(keys.sheet(1), { id: 1, name: 'Bonar', attacks: [{ id: 5, name: 'Maça' }] })
    const wrapper = ({ children }) => (
      <QueryClientProvider client={qc}><LangProvider><ToastProvider>{children}</ToastProvider></LangProvider></QueryClientProvider>
    )
    const { result } = renderHook(() => useSheetActions(1), { wrapper })
    return { qc, actions: () => result.current }
  }
  const json = (status, body) => Promise.resolve(new Response(body == null ? null : JSON.stringify(body), { status }))

  it('falha: resolve undefined, desfaz o otimista e mostra o erro', async () => {
    const { qc, actions } = setup(() => json(400, { error: { code: 'validation', message: 'Dados inválidos' } }))
    let out
    await act(async () => { out = await actions().patchCharacter({ name: 'Outro' }) })
    expect(out).toBeUndefined()
    expect(qc.getQueryData(keys.sheet(1)).name).toBe('Bonar')
    expect(await screen.findByText('Dados inválidos')).toBeTruthy()
  })

  it('sucesso: resolve com o corpo; sem corpo (204), resolve true', async () => {
    const { qc, actions } = setup((url, init) => (init.method === 'DELETE' ? json(204) : json(200, { id: 1, name: 'Novo' })))
    let out
    await act(async () => { out = await actions().patchCharacter({ name: 'Novo' }) })
    expect(out).toEqual({ id: 1, name: 'Novo' })
    expect(qc.getQueryData(keys.sheet(1)).name).toBe('Novo')
    await act(async () => { out = await actions().remove('attacks', 5) })
    expect(out).toBe(true)
  })

  it('servidor fora do ar também resolve undefined (nunca rejeita)', async () => {
    const { actions } = setup(() => Promise.reject(new TypeError('fetch failed')))
    let out
    await act(async () => { out = await actions().replacePrepared(3, []) })
    expect(out).toBeUndefined()
  })

  it('imagem ilegível no upload vira toast, sem exceção solta', async () => {
    const { actions } = setup(() => json(200, {}))
    vi.stubGlobal('createImageBitmap', () => Promise.reject(new Error('bad image')))
    let out
    await act(async () => { out = await actions().uploadPhoto(new Blob(['x'])) })
    expect(out).toBeUndefined()
    expect(await screen.findByText('Não foi possível ler a imagem')).toBeTruthy()
    expect(fetch).not.toHaveBeenCalled()
  })
})
