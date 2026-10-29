import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge, EmptyState } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { TextField } from '../../ui/fields'
import { FeatPicker } from './FeatPicker'
import { ResourcesPanel } from './ResourcesPanel'
import { formatEffect } from './formatEffect'

export default function FeatsTab(props) {
  const { ch, actions, refFeats } = props
  const { t, signed } = useLang()
  const [picker, setPicker] = useState(null) // 'feat' | 'flaw' | null
  const [editing, setEditing] = useState(null)

  const feats = ch.feats.filter(f => f.kind !== 'flaw')
  const flaws = ch.feats.filter(f => f.kind === 'flaw')

  const list = items => (
    <ul className="flex flex-col gap-2 list-none p-0 m-0">
      {items.map(f => {
        const ref = f.ref_id ? refFeats.get(f.ref_id) : null
        const effects = ref?.efeitos ?? []
        const isEditing = editing === f.id
        return (
          <li key={f.id} className="rounded-sm border border-subtle bg-sunken px-3 py-2">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="font-display text-parchment">{f.name}</span>
                  {ref?.nome_en && ref.nome_en !== f.name && <span className="text-dim text-[11px]">{ref.nome_en}</span>}
                  {ref?.livro && <span className="text-dim text-[10px]">· {ref.livro}</span>}
                  {!ref && <Badge>{t('feats.custom')}</Badge>}
                </div>
                {effects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {effects.map((e, i) => <Badge key={i} tone={e.tipo === 'especial' ? 'gold' : 'magic'}>{formatEffect(e, { t, signed })}</Badge>)}
                  </div>
                )}
                {isEditing ? (
                  <div className="flex flex-col gap-2 mt-2">
                    {!ref && <TextField label={t('common.name')} value={f.name} nullable={false} onCommit={v => actions.update('feats', f.id, { name: v })} />}
                    <TextField label={t('common.description')} value={f.description} multiline rows={3} onCommit={v => actions.update('feats', f.id, { description: v })} />
                  </div>
                ) : (
                  (f.description || ref?.descricao) && <p className="text-body text-xs mt-1 mb-0 whitespace-pre-line">{f.description || ref?.descricao}</p>
                )}
                {ref?.prerequisitos && <p className="text-dim text-[10px] mt-1 mb-0">{t('feats.prerequisites')}: {ref.prerequisitos}</p>}
              </div>
              <button type="button" className="text-dim hover:text-gold text-xs cursor-pointer px-1" onClick={() => setEditing(isEditing ? null : f.id)}>
                {isEditing ? t('common.close') : t('common.edit')}
              </button>
              <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad px-1 text-xs" onConfirm={() => actions.remove('feats', f.id)}>✕</ConfirmButton>
            </div>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="grid gap-4 xl:grid-cols-2 items-start">
      <div className="flex flex-col gap-4">
        <Section title={t('feats.title')} actions={<Button size="sm" onClick={() => setPicker('feat')}>{t('feats.add')}</Button>}>
          {feats.length ? list(feats) : <EmptyState title={t('feats.none')} className="py-4" />}
        </Section>
        <Section title={t('feats.flaws')} actions={<Button size="sm" onClick={() => setPicker('flaw')}>{t('feats.addFlaw')}</Button>}>
          {flaws.length ? list(flaws) : <EmptyState title={t('common.empty')} className="py-3" />}
        </Section>
      </div>
      <ResourcesPanel {...props} />
      <FeatPicker open={Boolean(picker)} kind={picker} onClose={() => setPicker(null)} ch={ch} actions={actions} />
    </div>
  )
}
