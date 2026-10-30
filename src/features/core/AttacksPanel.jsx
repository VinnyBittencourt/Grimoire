import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState } from '../../ui/layout'
import { NumberField, TextField, SelectField } from '../../ui/fields'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { QuickAdd, SegmentedControl } from '../../ui/controls'
import { Breakdown, Explain } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { ABILITIES } from '../../../shared/constants/abilities.js'
import { labelParts } from '../sheet/breakdownLabels'

const COLS = 'grid grid-cols-[1.25rem_1fr_6rem_6rem_5rem_4.5rem_1.75rem_1.75rem] items-center gap-2'

// Ataques/armas (repeating_weapons do Roll20)
export function AttacksPanel({ ch, sheet, actions }) {
  const { t, signed, distance, className, metric, toDisplayDistance, fromDisplayDistance } = useLang()
  const [open, setOpen] = useState(null)
  const abilityOptions = ABILITIES.map(a => ({ value: a, label: t(`abilities.${a}`) }))
  const lp = parts => labelParts(parts, { t, className, ch })

  async function add(name) {
    const row = await actions.create('attacks', { name, kind: 'melee', damage_ability: 'str' })
    if (row) setOpen(row.id)
    return row
  }

  return (
    <Section title={t('core.attacks')} actions={<QuickAdd collapsed label={t('core.addAttackShort')} placeholder={t('core.attack.namePlaceholder')} onSubmit={add} />}>
      {ch.attacks.length === 0 ? (
        <EmptyState icon="sword" title={t('core.attack.none')} hint={t('core.attack.noneHint')} className="py-5" />
      ) : (
        <div className={`${COLS} px-3 pb-1`} aria-hidden>
          <span />
          <span className="col-head">{t('core.attack.name')}</span>
          <span className="col-head text-right">{t('core.attack.colAttack')}</span>
          <span className="col-head text-right">{t('core.attack.colDamage')}</span>
          <span className="col-head text-right">{t('core.attack.crit')}</span>
          <span className="col-head text-right">{t('core.attack.range')}</span>
        </div>
      )}
      <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
        {ch.attacks.map(a => {
          const calc = sheet.attacks.find(x => x.id === a.id)
          const dmg = `${a.damage_dice || '—'}${calc.damage ? signed(calc.damage) : ''}`
          const crit = `${a.crit_range < 20 ? `${a.crit_range}–20` : '20'}/×${a.crit_mult}`
          const expanded = open === a.id
          const set = values => actions.update('attacks', a.id, values)
          const seq = calc.iterative.map(signed).join('/')
          return (
            <li key={a.id} className={`rounded-sm border bg-sunken ${expanded ? 'border-gold-lo' : 'border-subtle'}`}>
              <div className={`${COLS} px-3 py-1.5`}>
                <Icon name={a.kind === 'ranged' ? 'bow' : 'sword'} size={16} className="text-gold-lo" />
                <button type="button" onClick={() => setOpen(expanded ? null : a.id)} aria-expanded={expanded}
                  className="min-w-0 text-left cursor-pointer font-display text-parchment truncate hover:text-gold">{a.name || '—'}</button>
                <span className="text-right">
                  <Explain value={seq} label={`${t('core.attack.colAttack')}: ${a.name}`} align="end" className="font-display text-gold tabular-nums">
                    <Breakdown title={a.name} total={signed(calc.total)} parts={lp(sheet.breakdown.attacks[a.id] ?? [])} />
                  </Explain>
                </span>
                <span className="text-body text-sm text-right tabular-nums truncate">{dmg}</span>
                <span className="text-muted text-sm text-right tabular-nums">{crit}</span>
                <span className="text-muted text-sm text-right">{a.range_ft ? distance(a.range_ft) : '—'}</span>
                <button type="button" aria-label={expanded ? t('common.close') : t('common.edit')} aria-expanded={expanded}
                  onClick={() => setOpen(expanded ? null : a.id)} className="inline-flex items-center justify-center w-7 h-7 rounded-sm text-muted hover:text-gold hover:bg-gold-faint cursor-pointer">
                  <Icon name={expanded ? 'chevronUp' : 'chevronDown'} />
                </button>
                <ConfirmButton icon label={t('common.delete')} onConfirm={() => actions.removeUndoable('attacks', a, t('common.removed', { name: a.name }))} />
              </div>
              {expanded && (
                <div className="border-t border-subtle px-3 pt-3 pb-3 flex flex-col gap-3">
                  <div className="grid grid-cols-6 gap-2 items-end">
                    <TextField className="col-span-3" label={t('core.attack.name')} value={a.name} nullable={false} onCommit={v => set({ name: v })} />
                    <div className="col-span-2">
                      <span className="label block mb-1">{t('core.attack.kind')}</span>
                      <SegmentedControl label={t('core.attack.kind')} value={a.kind} onChange={v => set({ kind: v })}
                        options={[{ value: 'melee', label: t('core.attack.melee'), icon: 'sword' }, { value: 'ranged', label: t('core.attack.ranged'), icon: 'bow' }]} />
                    </div>
                    <SelectField label={t('core.attack.ability')} value={a.ability} placeholder={a.kind === 'ranged' ? t('abilities.dex') : t('abilities.str')}
                      options={abilityOptions} onCommit={v => set({ ability: v })} />
                  </div>
                  <FieldGroup title={t('core.attack.groupAttack')}>
                    <NumberField label={t('core.attack.enh')} value={a.enh} onCommit={v => set({ enh: v })} />
                    <NumberField label={t('core.attack.misc')} value={a.misc} onCommit={v => set({ misc: v })} />
                  </FieldGroup>
                  <FieldGroup title={t('core.attack.groupDamage')}>
                    <TextField label={t('core.attack.dice')} value={a.damage_dice} placeholder={t('core.attack.dicePlaceholder')} onCommit={v => set({ damage_dice: v })} />
                    <SelectField label={t('core.attack.damageAbility')} value={a.damage_ability} placeholder={t('common.none')} options={abilityOptions}
                      onCommit={v => set({ damage_ability: v })} />
                    <SelectField label={t('core.attack.mult')} value={a.damage_mult == null ? '' : String(a.damage_mult)} placeholder="×1"
                      options={[{ value: '0.5', label: `×½ — ${t('core.attack.offHand')}` }, { value: '1.5', label: `×1½ — ${t('core.attack.twoHanded')}` }]}
                      onCommit={v => set({ damage_mult: v == null ? null : Number(v) })} />
                    <NumberField label={t('core.attack.damageMisc')} value={a.damage_misc} onCommit={v => set({ damage_misc: v })} />
                    <TextField label={t('core.attack.type')} value={a.damage_type} placeholder={t('core.attack.typePlaceholder')} onCommit={v => set({ damage_type: v })} />
                  </FieldGroup>
                  <FieldGroup title={t('core.attack.groupCritRange')}>
                    <NumberField label={t('core.attack.critFrom')} value={a.crit_range} min={2} max={20} onCommit={v => set({ crit_range: v })} />
                    <NumberField label={t('core.attack.critMult')} value={a.crit_mult} min={1} max={6} onCommit={v => set({ crit_mult: v })} />
                    <NumberField label={`${t('core.attack.range')} (${t('units.distance')})`} value={a.range_ft == null ? null : toDisplayDistance(a.range_ft)}
                      nullable min={0} step={metric ? 0.1 : 1} onCommit={v => set({ range_ft: v == null ? null : fromDisplayDistance(v) })}
                      hint={metric && a.range_ft ? `${a.range_ft} ft` : undefined} />
                    <NumberField label={t('core.attack.ammo')} value={a.ammo} nullable min={0} onCommit={v => set({ ammo: v })} />
                  </FieldGroup>
                  <TextField label={t('common.notes')} value={a.notes} onCommit={v => set({ notes: v })} />
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}

function FieldGroup({ title, children }) {
  return (
    <fieldset className="m-0 p-0 border-0">
      <legend className="col-head mb-1.5">{title}</legend>
      <div className="grid grid-cols-5 gap-2">{children}</div>
    </fieldset>
  )
}
