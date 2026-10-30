import { useState } from 'react'
import { useLang } from '../../i18n'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { EmptyState } from '../../ui/layout'
import { Icon } from '../../ui/Icon'
import { RichText } from '../../ui/RichText'

const today = () => new Date().toISOString().slice(0, 10)
// Mesma ordem do servidor (session_date DESC, id DESC): o create otimista faz append e a nota nova sumia no fim
const byDateDesc = (a, b) => (b.session_date ?? '').localeCompare(a.session_date ?? '') || b.id - a.id

// Notas de sessão: lista por data (mais recente primeiro) + editor rico com autosave
export function NotesPanel({ data, actions, selectedId, onSelect }) {
  const { t, lang } = useLang()
  const notes = [...data.notes].sort(byDateDesc)
  const [query, setQuery] = useState('')
  const [createdId, setCreatedId] = useState(null)
  const selected = notes.find(n => n.id === selectedId) ?? (selectedId == null ? notes[0] : null) ?? null
  const strip = html => (html ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  const filtered = notes.filter(n => !query || `${n.title} ${strip(n.content)}`.toLowerCase().includes(query.toLowerCase()))
  const fmt = d => (d ? new Date(`${d}T12:00:00`).toLocaleDateString(lang === 'en' ? 'en-US' : 'pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

  async function add() {
    const row = await actions.create('notes', { title: '', session_date: today() })
    if (row) { setCreatedId(row.id); setQuery(''); onSelect(row.id) }
  }

  async function remove(note) {
    const next = notes.find(n => n.id !== note.id)?.id ?? null
    if (await actions.removeUndoable('notes', note, t('journal.noteRemoved', { name: note.title || fmt(note.session_date) }))) onSelect(next)
  }

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4 h-full min-h-0">
      <div className="panel flex flex-col min-h-0">
        <div className="flex gap-2 p-3 border-b border-subtle">
          <label className="relative flex-1">
            <Icon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input className="field field-sm pl-7" placeholder={t('journal.searchNotes')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('journal.searchNotes')} />
          </label>
          <Button size="sm" onClick={add}><Icon name="plus" size={14} />{t('journal.newNoteShort')}</Button>
        </div>
        <ul className="flex-1 overflow-y-auto list-none p-0 m-0">
          {filtered.map(n => (
            <li key={n.id}>
              <button type="button" onClick={() => onSelect(n.id)} aria-current={n.id === selected?.id}
                className={`w-full text-left px-3 py-2.5 border-b border-subtle cursor-pointer ${n.id === selected?.id ? 'bg-gold-faint border-l-2 border-l-gold' : 'row-hover'}`}>
                <span className="flex items-center gap-1 text-xs text-gold font-display"><Icon name="calendar" size={12} />{fmt(n.session_date)}</span>
                <span className="block text-sm text-parchment truncate mt-0.5">{n.title || t('journal.untitled')}</span>
                {strip(n.content) && <span className="block caption truncate">{strip(n.content).slice(0, 90)}</span>}
              </button>
            </li>
          ))}
          {notes.length === 0 && <li><EmptyState icon="scroll" title={t('journal.noNotes')} hint={t('journal.noNotesHint')} /></li>}
          {notes.length > 0 && filtered.length === 0 && (
            <li><EmptyState title={t('common.notFound', { q: query })}
              action={<button type="button" className="text-gold text-xs underline cursor-pointer" onClick={() => setQuery('')}>{t('common.clearSearch')}</button>} /></li>
          )}
        </ul>
      </div>
      <div className="panel p-5 flex flex-col min-h-0">
        {selected ? (
          <>
            <div className="flex items-end gap-3 mb-3">
              <label className="flex-1"><span className="label block mb-1">{t('journal.title')}</span>
                <input key={`t${selected.id}`} className="field font-display text-base" defaultValue={selected.title} placeholder={t('journal.titlePlaceholder')}
                  autoFocus={createdId === selected.id}
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
              <ConfirmButton label={t('common.delete')} className="min-h-8 border border-transparent hover:border-[var(--color-hp-border)]" onConfirm={() => remove(selected)}>
                <Icon name="trash" size={14} />{t('common.delete')}
              </ConfirmButton>
            </div>
            <RichText className="flex-1" docKey={selected.id} value={selected.content} placeholder={t('journal.notePlaceholder')}
              onSave={html => actions.update('notes', selected.id, { content: html })} />
          </>
        ) : <EmptyState icon="scroll" title={notes.length ? t('journal.selectItem') : t('journal.noNotes')}
              action={<Button variant="gold" onClick={add}><Icon name="plus" size={14} />{t('journal.newNoteToday')}</Button>} />}
      </div>
    </div>
  )
}
