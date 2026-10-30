import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState, Badge } from '../../ui/layout'
import { Button, IconButton } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { NumberField, TextField } from '../../ui/fields'
import { QuickAmount, SegmentedControl, TokenTrack } from '../../ui/controls'
import { Notice } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { RESOURCES } from '../../../shared/rules/resources.js'

/**
 * Recursos de classe por dia. 'uses' = fichas clicáveis (cada uso pode ter anotação);
 * 'pool' = reserva numérica (ex.: Cura pelas Mãos em PV).
 */
export function ResourcesPanel({ ch, sheet, actions }) {
  const { t, className } = useLang()
  const [noteFor, setNoteFor] = useState(null) // { rid, idx }
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const totals = new Map(sheet.resources.map(r => [r.id, r.total]))

  return (
    <Section title={t('resources.title')} actions={
      !creating && <Button size="sm" onClick={() => setCreating(true)}><Icon name="plus" size={14} />{t('resources.addShort')}</Button>
    }>
      {creating && <NewResource onCancel={() => setCreating(false)} onCreate={async values => {
        const row = await actions.create('resources', values)
        if (row) setCreating(false)
        return row
      }} />}
      {ch.resources.length === 0 && !creating && (
        <EmptyState icon="sparkle" title={t('resources.none')} hint={t('resources.noneHint')} className="py-6" />
      )}
      <ul className="flex flex-col gap-2 list-none p-0 m-0">
        {ch.resources.map(r => {
          const def = r.key ? RESOURCES[r.key] : null
          const total = totals.get(r.id) ?? 0
          const name = r.name || (r.key ? t(`resources.names.${r.key}`) : '—')
          const used = r.uses.filter(u => u.used).length
          const classRow = ch.classes.find(c => c.id === r.class_row_id)
          const isEditing = editing === r.id
          const set = values => actions.update('resources', r.id, values)
          const hasNotes = r.uses.some(u => u.note)
          const lastUsed = [...r.uses].filter(u => u.used).sort((a, b) => b.idx - a.idx)[0]
          const left = r.kind === 'pool' ? total - r.pool_used : total - used
          return (
            <li key={r.id} className={`rounded-sm border bg-sunken px-3 py-2.5 ${isEditing ? 'border-gold-lo' : 'border-subtle'}`}>
              <div className="flex items-center gap-2">
                <Icon name="sparkle" size={18} className="text-gold" />
                <div className="flex-1 min-w-0">
                  <span className="font-display text-parchment">{name}</span>
                  {classRow && <span className="caption ml-2">{className(classRow)} {classRow.level}</span>}
                  {r.period !== 'day' && <Badge tone="gold" className="ml-2" icon={r.period === 'week' ? 'calendar' : 'wand'}>{t(`resources.periods.${r.period}`)}</Badge>}
                </div>
                <span className={`text-sm tabular-nums ${left > 0 ? 'text-parchment' : 'text-muted'}`}>
                  {r.kind === 'pool' ? t('resources.poolLeft', { n: left, total }) : t('resources.left', { n: left, total })}
                </span>
                {hasNotes
                  ? <ConfirmButton label={t('resources.reset')} confirmLabel={t('resources.resetConfirm')} className="!px-1.5 min-h-7" onConfirm={() => actions.resetResource(r.id)}><Icon name="reset" size={15} /></ConfirmButton>
                  : <IconButton label={t('resources.reset')} onClick={() => actions.resetResource(r.id)}><Icon name="reset" size={15} /></IconButton>}
                <IconButton label={isEditing ? t('common.close') : t('resources.settings')} aria-expanded={isEditing} onClick={() => setEditing(isEditing ? null : r.id)}>
                  <Icon name={isEditing ? 'chevronUp' : 'settings'} size={15} />
                </IconButton>
              </div>
              {def?.verified === false && <Notice tone="warn" compact className="mt-2">{t('resources.unverified')}</Notice>}

              {r.kind === 'pool' ? (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="h-2.5 rounded-full bg-sunken overflow-hidden border border-subtle" role="meter" aria-label={name}
                    aria-valuemin={0} aria-valuemax={total} aria-valuenow={left}>
                    <div className="h-full bg-[var(--color-success)]" style={{ width: `${total ? (left / total) * 100 : 0}%` }} />
                  </div>
                  <QuickAmount ariaLabel={`${name} — ${t('vitals.amount')}`}
                    onApply={(kind, n) => set({ pool_used: Math.max(0, Math.min(total, r.pool_used + (kind === 'spend' ? n : -n))) })}
                    actions={[{ id: 'spend', label: t('resources.spend'), icon: 'minus', tone: 'danger' }, { id: 'recover', label: t('resources.recover'), icon: 'plus', tone: 'success' }]} />
                </div>
              ) : (
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <TokenTrack total={total} label={name}
                    isUsed={i => Boolean(r.uses.find(u => u.idx === i)?.used)}
                    hasNote={i => Boolean(r.uses.find(u => u.idx === i)?.note)}
                    noteOf={i => r.uses.find(u => u.idx === i)?.note}
                    onToggle={i => actions.setUse(r.id, i, { used: !r.uses.find(u => u.idx === i)?.used })}
                    onContext={i => setNoteFor({ rid: r.id, idx: i })} />
                  <button type="button" disabled={!lastUsed} onClick={() => setNoteFor({ rid: r.id, idx: lastUsed.idx })}
                    title={lastUsed ? undefined : t('resources.noteNeedsUse')}
                    className="inline-flex items-center gap-1 min-h-6 px-1.5 rounded-sm text-xs text-gold hover:bg-gold-faint cursor-pointer disabled:text-muted disabled:cursor-not-allowed disabled:hover:bg-transparent">
                    <Icon name="pencil" size={13} />{t('resources.noteAction')}
                  </button>
                </div>
              )}

              {noteFor?.rid === r.id && (
                <NoteEditor label={t('resources.noteFor', { n: noteFor.idx + 1 })} initial={r.uses.find(u => u.idx === noteFor.idx)?.note ?? ''} placeholder={t('resources.notePlaceholder')}
                  onSave={note => { actions.setUse(r.id, noteFor.idx, { note: note || null }); setNoteFor(null) }}
                  onCancel={() => setNoteFor(null)} />
              )}
              {hasNotes && (
                <ul className="mt-2 mb-0 pl-0 list-none flex flex-col gap-0.5">
                  {r.uses.filter(u => u.note).map(u => (
                    <li key={u.idx} className="flex items-center gap-2 text-sm text-body">
                      <Badge tone="magic">#{u.idx + 1}</Badge><span className="flex-1 min-w-0 truncate">{u.note}</span>
                      <IconButton size="sm" label={t('resources.editNote', { n: u.idx + 1 })} onClick={() => setNoteFor({ rid: r.id, idx: u.idx })}><Icon name="pencil" size={13} /></IconButton>
                    </li>
                  ))}
                </ul>
              )}

              {isEditing && (
                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-subtle">
                  <TextField className="col-span-2" label={t('common.name')} value={r.name} placeholder={r.key ? t(`resources.names.${r.key}`) : ''} onCommit={v => set({ name: v })} />
                  <NumberField label={t('resources.total')} value={r.total_override} nullable min={0} max={200}
                    placeholder={String(total)} hint={r.key ? t('common.computed', { n: total }) : undefined}
                    onCommit={v => set({ total_override: v })} />
                  {r.kind === 'pool' && <NumberField label={t('resources.poolUsed')} value={r.pool_used} min={0} max={total} onCommit={v => set({ pool_used: v })} />}
                  <div className="col-span-4">
                    <span className="label block mb-1">{t('resources.period')}</span>
                    <PeriodPicker value={r.period} onChange={v => set({ period: v })} />
                  </div>
                  <TextField className="col-span-3" label={t('common.notes')} value={r.notes} onCommit={v => set({ notes: v })} />
                  <div className="flex items-end justify-end">
                    <ConfirmButton label={t('resources.delete')} onConfirm={() => actions.remove('resources', r.id)}>
                      <Icon name="trash" size={14} />{t('common.delete')}
                    </ConfirmButton>
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

// Criação inline: nome, tipo e total antes de gravar (nada de "Recurso" com 1 uso automático)
function NewResource({ onCreate, onCancel }) {
  const { t } = useLang()
  const [name, setName] = useState('')
  const [kind, setKind] = useState('uses')
  const [total, setTotal] = useState(1)
  const [period, setPeriod] = useState('day')
  return (
    <form className="mb-3 rounded-sm border border-gold-lo bg-sunken p-3 flex flex-col gap-2"
      onSubmit={e => { e.preventDefault(); if (name.trim()) onCreate({ name: name.trim(), kind, total_override: total, period }) }}
      onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }}>
      <div className="grid grid-cols-[1fr_auto_6rem] gap-2 items-end">
        <label><span className="label block mb-1">{t('common.name')}</span>
          <input className="field" value={name} onChange={e => setName(e.target.value)} placeholder={t('resources.namePlaceholder')} autoFocus /></label>
        <div><span className="label block mb-1">{t('resources.kind')}</span>
          <SegmentedControl label={t('resources.kind')} value={kind} onChange={setKind}
            options={[{ value: 'uses', label: t('resources.kindUses') }, { value: 'pool', label: t('resources.kindPool') }]} /></div>
        <NumberField label={t('resources.total')} value={total} min={1} max={200} onCommit={setTotal} />
      </div>
      <div><span className="label block mb-1">{t('resources.period')}</span><PeriodPicker value={period} onChange={setPeriod} /></div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="subtle" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button size="sm" type="submit" variant="gold" disabled={!name.trim()}>{t('common.add')}</Button>
      </div>
    </form>
  )
}

function NoteEditor({ label, initial, placeholder, onSave, onCancel }) {
  const [text, setText] = useState(initial)
  return (
    <label className="block mt-2">
      <span className="label block mb-1">{label}</span>
      <input autoFocus className="field field-sm" value={text} placeholder={placeholder} onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(text.trim()); if (e.key === 'Escape') { e.stopPropagation(); onCancel() } }}
        onBlur={() => onSave(text.trim())} />
    </label>
  )
}

// Quando o recurso renova: só os diários voltam no Novo Dia; semanais e cargas, no "Restaurar"
function PeriodPicker({ value, onChange }) {
  const { t } = useLang()
  return (
    <div className="flex flex-col gap-1">
      <SegmentedControl label={t('resources.period')} value={value} onChange={onChange}
        options={['day', 'week', 'charges'].map(p => ({ value: p, label: t(`resources.periods.${p}`) }))} />
      <span className="caption">{t(`resources.periodHints.${value}`)}</span>
    </div>
  )
}
