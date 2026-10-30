import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge, EmptyState } from '../../ui/layout'
import { Button, IconButton } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { TextField } from '../../ui/fields'
import { Icon } from '../../ui/Icon'
import { FeatPicker } from './FeatPicker'
import { ResourcesPanel } from './ResourcesPanel'
import { formatEffect } from './formatEffect'

export default function FeatsTab(props) {
  const { ch, actions, refFeats } = props
  const { t, signed } = useLang()
  const [picker, setPicker] = useState(null) // 'feat' | 'flaw' | null
  const [editing, setEditing] = useState(null)
  const [expanded, setExpanded] = useState(() => new Set())
  const [query, setQuery] = useState('')

  const match = f => !query || `${f.name} ${refFeats.get(f.ref_id)?.nome_en ?? ''}`.toLowerCase().includes(query.toLowerCase())
  const feats = ch.feats.filter(f => f.kind !== 'flaw')
  const flaws = ch.feats.filter(f => f.kind === 'flaw')
  const toggle = id => setExpanded(s => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n })

  const list = items => (
    <ul className="flex flex-col gap-2 list-none p-0 m-0">
      {items.filter(match).map(f => {
        const ref = f.ref_id ? refFeats.get(f.ref_id) : null
        const effects = ref?.efeitos ?? []
        const isEditing = editing === f.id
        const text = f.description || ref?.descricao
        const long = text && text.length > 160
        const open = expanded.has(f.id)
        return (
          <li key={f.id} className={`rounded-sm border bg-sunken px-3 py-2.5 ${isEditing ? 'border-gold-lo' : 'border-subtle'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display text-parchment">{f.name}</span>
                  {ref?.nome_en && ref.nome_en !== f.name && <span className="caption">{ref.nome_en}</span>}
                  {ref?.livro && <span className="caption">· {ref.livro}</span>}
                  {!ref && <Badge>{t('feats.custom')}</Badge>}
                </div>
                {effects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {effects.map((e, i) => <Badge key={i} tone={e.tipo === 'especial' ? 'gold' : 'magic'}>{formatEffect(e, { t, signed })}</Badge>)}
                  </div>
                )}
                {isEditing ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {!ref && <TextField label={t('common.name')} value={f.name} nullable={false} onCommit={v => actions.update('feats', f.id, { name: v })} />}
                    <TextField label={t('feats.myNotes')} hint={ref ? t('feats.myNotesHint') : undefined} value={f.description} multiline rows={3}
                      onCommit={v => actions.update('feats', f.id, { description: v })} />
                  </div>
                ) : text && (
                  <p className={`text-body text-sm mt-1.5 mb-0 whitespace-pre-line ${long && !open ? 'line-clamp-2' : ''}`}>{text}</p>
                )}
                {!isEditing && long && (
                  <button type="button" className="text-xs text-gold hover:text-gold-hi cursor-pointer mt-0.5" aria-expanded={open} onClick={() => toggle(f.id)}>
                    {open ? t('common.showLess') : t('common.showMore')}
                  </button>
                )}
                {ref?.prerequisitos && <p className="caption mt-1 mb-0">{t('feats.prerequisites')}: {ref.prerequisitos}</p>}
              </div>
              <IconButton size="sm" label={isEditing ? t('common.close') : t('common.edit')} aria-expanded={isEditing} onClick={() => setEditing(isEditing ? null : f.id)}>
                <Icon name={isEditing ? 'check' : 'pencil'} size={14} />
              </IconButton>
              <ConfirmButton icon label={t('common.delete')} onConfirm={() => actions.removeUndoable('feats', f, t('common.removed', { name: f.name }))} />
            </div>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="grid gap-4 xl:grid-cols-2 items-start">
      <div className="flex flex-col gap-4">
        <Section title={t('feats.title')} subtitle={feats.length ? String(feats.length) : null}
          actions={<Button size="sm" onClick={() => setPicker('feat')}><Icon name="plus" size={14} />{t('feats.addShort')}</Button>}>
          {feats.length > 8 && (
            <input className="field field-sm mb-3" placeholder={t('feats.search')} aria-label={t('feats.search')} value={query} onChange={e => setQuery(e.target.value)} />
          )}
          {feats.length
            ? list(feats)
            : <EmptyState icon="star" title={t('feats.none')} hint={t('feats.noneHint')} className="py-6"
                action={<Button size="sm" variant="gold" onClick={() => setPicker('feat')}>{t('feats.picker')}</Button>} />}
        </Section>
        <Section title={t('feats.flaws')} actions={<Button size="sm" onClick={() => setPicker('flaw')}><Icon name="plus" size={14} />{t('feats.addFlawShort')}</Button>}>
          {flaws.length ? list(flaws) : <EmptyState title={t('feats.flawsEmpty')} className="py-4" />}
        </Section>
      </div>
      <ResourcesPanel {...props} />
      <FeatPicker open={Boolean(picker)} kind={picker} onClose={() => setPicker(null)} ch={ch} actions={actions} />
    </div>
  )
}
