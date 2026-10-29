import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState } from '../../ui/layout'
import { Button, IconButton } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { NumberField, TextField } from '../../ui/fields'
import { RESOURCES } from '../../../shared/rules/resources.js'

/**
 * Recursos de classe por dia. 'uses' = fichas clicáveis (cada uso pode ter anotação);
 * 'pool' = reserva numérica (ex.: Cura pelas Mãos em PV).
 */
export function ResourcesPanel({ ch, sheet, actions }) {
  const { t, className } = useLang()
  const [noteFor, setNoteFor] = useState(null) // { rid, idx }
  const [editing, setEditing] = useState(null)
  const totals = new Map(sheet.resources.map(r => [r.id, r.total]))

  return (
    <Section title={t('resources.title')} actions={
      <Button size="sm" onClick={() => actions.create('resources', { name: t('resources.add').replace('+ ', ''), icon: '✨', kind: 'uses', total_override: 1 })}>
        {t('resources.add')}
      </Button>
    }>
      {ch.resources.length === 0 && <EmptyState title={t('common.empty')} className="py-4" />}
      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {ch.resources.map(r => {
          const def = r.key ? RESOURCES[r.key] : null
          const total = totals.get(r.id) ?? 0
          const name = r.name || (r.key ? t(`resources.names.${r.key}`) : '—')
          const used = r.uses.filter(u => u.used).length
          const classRow = ch.classes.find(c => c.id === r.class_row_id)
          const isEditing = editing === r.id
          const set = values => actions.update('resources', r.id, values)
          return (
            <li key={r.id} className="rounded-sm border border-subtle bg-sunken px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-lg" aria-hidden>{r.icon ?? def?.icon ?? '✨'}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-display text-parchment">{name}</span>
                  {classRow && <span className="text-dim text-[10px] ml-2">{className(classRow)} {classRow.level}</span>}
                  {def?.verified === false && <span className="text-warn text-[10px] ml-2" title={t('resources.unverified')}>⚠</span>}
                </div>
                <span className="text-muted text-[11px]">
                  {r.kind === 'pool' ? `${total - r.pool_used}/${total}` : t('resources.uses', { used, total })}
                </span>
                <IconButton label={t('resources.reset')} onClick={() => actions.resetResource(r.id)}>↺</IconButton>
                <IconButton label={t('common.edit')} onClick={() => setEditing(isEditing ? null : r.id)}>⚙</IconButton>
              </div>

              {r.kind === 'pool' ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-2 rounded-full bg-sunken overflow-hidden border border-subtle">
                    <div className="h-full bg-[var(--color-success)]" style={{ width: `${total ? ((total - r.pool_used) / total) * 100 : 0}%` }} />
                  </div>
                  <NumberField label={t('resources.poolUsed')} compact value={r.pool_used} min={0} max={total}
                    onCommit={v => set({ pool_used: v })} />
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-2" role="group" aria-label={name}>
                  {Array.from({ length: total }, (_, idx) => {
                    const use = r.uses.find(u => u.idx === idx)
                    const on = Boolean(use?.used)
                    return (
                      <button key={idx} type="button" aria-pressed={on} title={use?.note || undefined}
                        onClick={() => actions.setUse(r.id, idx, { used: !on })}
                        onContextMenu={e => { e.preventDefault(); setNoteFor({ rid: r.id, idx }) }}
                        onDoubleClick={() => setNoteFor({ rid: r.id, idx })}
                        className={`relative w-7 h-7 rounded-full border-2 transition-colors cursor-pointer ${on
                          ? 'border-[var(--color-wood-border)] bg-[var(--color-wood-medium)] opacity-50'
                          : 'border-gold bg-[radial-gradient(circle,var(--color-gold-glow),transparent_70%)] hover:bg-gold-faint'}`}>
                        {use?.note && <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--color-magic)]" aria-hidden />}
                      </button>
                    )
                  })}
                </div>
              )}

              {noteFor?.rid === r.id && (
                <NoteEditor initial={r.uses.find(u => u.idx === noteFor.idx)?.note ?? ''} placeholder={t('resources.notePlaceholder')}
                  onSave={note => { actions.setUse(r.id, noteFor.idx, { note: note || null }); setNoteFor(null) }}
                  onCancel={() => setNoteFor(null)} />
              )}
              {r.uses.some(u => u.note) && (
                <ul className="mt-2 mb-0 pl-4 text-[11px] text-body list-disc">
                  {r.uses.filter(u => u.note).map(u => <li key={u.idx}>#{u.idx + 1}: {u.note}</li>)}
                </ul>
              )}

              {isEditing && (
                <div className="grid grid-cols-4 gap-2 mt-3 pt-2 border-t border-subtle">
                  <TextField className="col-span-2" label={t('common.name')} value={r.name} placeholder={r.key ? t(`resources.names.${r.key}`) : ''} onCommit={v => set({ name: v })} />
                  <TextField label={t('resources.icon')} value={r.icon} onCommit={v => set({ icon: v })} />
                  <NumberField label={t('resources.total')} value={r.total_override} nullable min={0} max={200}
                    placeholder={String(total)} title={r.key ? t('common.computed', { n: total }) : undefined}
                    onCommit={v => set({ total_override: v })} />
                  <TextField className="col-span-3" label={t('common.notes')} value={r.notes} onCommit={v => set({ notes: v })} />
                  <div className="flex items-end justify-end">
                    <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad text-xs px-2 py-1" onConfirm={() => actions.remove('resources', r.id)}>{t('common.delete')}</ConfirmButton>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function NoteEditor({ initial, placeholder, onSave, onCancel }) {
  const [text, setText] = useState(initial)
  return (
    <input autoFocus className="field field-sm mt-2" value={text} placeholder={placeholder} onChange={e => setText(e.target.value)}
      onKeyDown={e => { if (e.key === 'Enter') onSave(text.trim()); if (e.key === 'Escape') onCancel() }}
      onBlur={() => onSave(text.trim())} />
  )
}
