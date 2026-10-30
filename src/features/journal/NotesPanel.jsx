import { useState } from 'react'
import { useLang } from '../../i18n'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { EmptyState } from '../../ui/layout'
import { RichText } from '../../ui/RichText'

const today = () => new Date().toISOString().slice(0, 10)

// Notas de sessão: lista por data (mais recente primeiro) + editor rico com autosave
export function NotesPanel({ data, actions }) {
  const { t, lang } = useLang()
  const notes = data.notes
  const [selectedId, setSelectedId] = useState(notes[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const selected = notes.find(n => n.id === selectedId) ?? null
  const strip = html => (html ?? '').replace(/<[^>]+>/g, ' ')
  const filtered = notes.filter(n => !query || `${n.title} ${strip(n.content)}`.toLowerCase().includes(query.toLowerCase()))
  const fmt = d => (d ? new Date(`${d}T12:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR') : '—')

  async function add() {
    const row = await actions.create('notes', { title: '', session_date: today() })
    if (row) setSelectedId(row.id)
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 h-full min-h-0">
      <div className="panel flex flex-col min-h-0">
        <div className="flex gap-2 p-3 border-b border-subtle">
          <input className="field field-sm flex-1" placeholder={t('common.search')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('common.search')} />
          <Button size="sm" onClick={add}>{t('journal.newNote')}</Button>
        </div>
        <ul className="flex-1 overflow-y-auto list-none p-0 m-0">
          {filtered.map(n => (
            <li key={n.id}>
              <button type="button" onClick={() => setSelectedId(n.id)} aria-current={n.id === selectedId}
                className={`w-full text-left px-3 py-2 border-b border-subtle cursor-pointer ${n.id === selectedId ? 'bg-gold-faint' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}>
                <span className="block text-[10px] text-gold font-display">{fmt(n.session_date)}</span>
                <span className="block text-sm text-parchment truncate">{n.title || t('journal.untitled')}</span>
                <span className="block text-[10px] text-dim truncate">{strip(n.content).slice(0, 80)}</span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li><EmptyState title={t('common.empty')} /></li>}
        </ul>
      </div>
      <div className="panel p-4 flex flex-col min-h-0">
        {selected ? (
          <>
            <div className="flex items-end gap-3 mb-3">
              <label className="flex-1"><span className="label block mb-1">{t('common.name')}</span>
                <input key={`t${selected.id}`} className="field font-display text-base" defaultValue={selected.title} placeholder={t('journal.untitled')}
                  onBlur={e => e.target.value !== selected.title && actions.update('notes', selected.id, { title: e.target.value })}
                  onKeyDown={e => { if (e.key === 'Enter') e.currentTarget.blur() }} />
              </label>
              <label className="w-44"><span className="label block mb-1">{t('journal.sessionDate')}</span>
                <input key={`d${selected.id}`} type="date" className="field" defaultValue={selected.session_date ?? ''}
                  onBlur={e => {
                    const v = e.target.value || null
                    if (v !== (selected.session_date ?? null)) actions.update('notes', selected.id, { session_date: v })
                  }} />
              </label>
              <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad text-xs px-2 py-2"
                onConfirm={() => { actions.remove('notes', selected.id); setSelectedId(notes.find(n => n.id !== selected.id)?.id ?? null) }}>
                {t('common.delete')}
              </ConfirmButton>
            </div>
            <RichText className="flex-1" docKey={selected.id} value={selected.content} placeholder={t('journal.notePlaceholder')}
              onSave={html => actions.update('notes', selected.id, { content: html })} />
          </>
        ) : <EmptyState title={t('journal.selectItem')} action={<Button onClick={add}>{t('journal.newNote')}</Button>} />}
      </div>
    </div>
  )
}
