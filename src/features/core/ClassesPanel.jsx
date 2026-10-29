import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section } from '../../ui/layout'
import { NumberField, TextField, SelectField } from '../../ui/fields'
import { Button, IconButton } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { CLASSES, CLASS_IDS } from '../../../shared/constants/classes.js'
import { ABILITIES } from '../../../shared/constants/abilities.js'
import { classDef } from '../../../shared/rules/progression.js'

// Classes do personagem: nível, conjuração, domínios e overrides (homebrew / classe livre)
export function ClassesPanel({ ch, sheet, actions }) {
  const { t, className } = useLang()
  const [open, setOpen] = useState(null)
  const classes = [...ch.classes].sort((a, b) => a.position - b.position)
  const casterRows = classes.filter(c => classDef(c).caster)
  const prog = v => ({ value: v, label: t(`core.progression.${v}`) })

  return (
    <Section title={t('core.classes')} actions={
      <Button size="sm" onClick={() => actions.create('classes', { class_id: 'fighter', level: 1 })}>{t('core.addClass')}</Button>
    }>
      <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
        {classes.map(c => {
          const def = classDef(c)
          const expanded = open === c.id
          const set = values => actions.update('classes', c.id, values)
          return (
            <li key={c.id} className="rounded-sm border border-subtle bg-sunken">
              <div className="flex items-center gap-2 px-3 py-1.5">
                <SelectField className="flex-1" value={c.class_id} aria-label={t('core.classFields.class')}
                  options={CLASS_IDS.map(id => ({ value: id, label: `${t(`classes.${id}`)}${CLASSES[id].prestige ? ' ★' : ''}` }))}
                  onCommit={v => set({ class_id: v ?? 'custom' })} />
                <NumberField compact value={c.level} min={0} max={40} aria-label={t('core.classFields.level')} onCommit={v => set({ level: v })} />
                <span className="text-dim text-[10px] w-10 text-center" title={t('core.classFields.hd')}>d{def.hd}</span>
                <IconButton label={t('common.edit')} aria-expanded={expanded} onClick={() => setOpen(expanded ? null : c.id)}>{expanded ? '▴' : '▾'}</IconButton>
                <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad px-1 text-xs" disabled={classes.length === 1}
                  onConfirm={() => actions.remove('classes', c.id)}>✕</ConfirmButton>
              </div>
              {expanded && (
                <div className="grid grid-cols-4 gap-2 px-3 pb-3 pt-1 border-t border-subtle">
                  {c.class_id === 'custom' && (
                    <TextField className="col-span-4" label={t('core.classFields.customName')} value={c.custom_name} onCommit={v => set({ custom_name: v })} />
                  )}
                  <NumberField label={t('core.classFields.hd')} value={c.hd} nullable min={2} max={20} placeholder={String(CLASSES[c.class_id]?.hd ?? '')} onCommit={v => set({ hd: v })} />
                  <SelectField label={t('core.classFields.bab')} value={c.bab_prog} placeholder={t('core.classFields.default', { v: t(`core.progression.${CLASSES[c.class_id]?.bab ?? 'avg'}`) })}
                    options={['good', 'avg', 'poor'].map(prog)} onCommit={v => set({ bab_prog: v })} />
                  {['fort', 'ref', 'will'].map(s => (
                    <SelectField key={s} label={t(`core.classFields.${s}`)} value={c[`${s}_prog`]}
                      placeholder={t('core.classFields.default', { v: t(`core.progression.${CLASSES[c.class_id]?.saves[s] ?? 'poor'}`) })}
                      options={['good', 'poor'].map(prog)} onCommit={v => set({ [`${s}_prog`]: v })} />
                  ))}
                  {def.caster && (
                    <SelectField label={t('core.classFields.casterAbility')} value={c.caster_ability}
                      placeholder={t('core.classFields.default', { v: t(`abilities.${def.caster.ability}`) })}
                      options={ABILITIES.map(a => ({ value: a, label: t(`abilities.${a}`) }))} onCommit={v => set({ caster_ability: v })} />
                  )}
                  {def.caster?.domain && (
                    <TextField className="col-span-2" label={t('core.classFields.domains')} value={c.domains} onCommit={v => set({ domains: v })} />
                  )}
                  {!def.caster && casterRows.length > 0 && (
                    <>
                      <SelectField className="col-span-2" label={t('core.classFields.advances')} value={c.advances_id == null ? '' : String(c.advances_id)}
                        placeholder={t('common.none')} options={casterRows.map(r => ({ value: String(r.id), label: className(r) }))}
                        onCommit={v => set({ advances_id: v == null ? null : Number(v) })} />
                      {c.advances_id != null && (
                        <NumberField label={t('core.classFields.advanceLevels')} value={c.advance_levels} nullable min={0} max={40}
                          placeholder={String(c.level)} onCommit={v => set({ advance_levels: v })} />
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <p className="text-dim text-[11px] mt-2 mb-0">{t('core.totalLevel', { n: sheet.level })} · {t('core.hpSuggested', { n: sheet.hp.suggestedMax })}</p>
    </Section>
  )
}
