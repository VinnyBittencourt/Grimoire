import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState } from '../../ui/layout'
import { NumberField, TextField, SelectField } from '../../ui/fields'
import { Button, IconButton } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { ABILITIES } from '../../../shared/constants/abilities.js'

// Ataques/armas (repeating_weapons do Roll20)
export function AttacksPanel({ ch, sheet, actions }) {
  const { t, signed, distance } = useLang()
  const [open, setOpen] = useState(null)
  const abilityOptions = ABILITIES.map(a => ({ value: a, label: t(`abilities.${a}`) }))

  return (
    <Section title={t('core.attacks')} actions={
      <Button size="sm" onClick={async () => {
        const row = await actions.create('attacks', { name: t('core.attack.name'), kind: 'melee', damage_ability: 'str' })
        if (row) setOpen(row.id)
      }}>{t('core.addAttack')}</Button>
    }>
      {ch.attacks.length === 0 && <EmptyState title={t('core.attack.none')} className="py-4" />}
      <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
        {ch.attacks.map(a => {
          const calc = sheet.attacks.find(x => x.id === a.id)
          const dmg = `${a.damage_dice || '—'}${calc.damage ? signed(calc.damage) : ''}`
          const crit = `${a.crit_range < 20 ? `${a.crit_range}–20` : '20'}/×${a.crit_mult}`
          const expanded = open === a.id
          const set = values => actions.update('attacks', a.id, values)
          return (
            <li key={a.id} className="rounded-sm border border-subtle bg-sunken">
              <div className="flex items-center gap-3 px-3 py-2">
                <button type="button" onClick={() => setOpen(expanded ? null : a.id)} aria-expanded={expanded}
                  className="flex-1 min-w-0 flex items-center gap-3 text-left cursor-pointer">
                  <span aria-hidden>{a.kind === 'ranged' ? '🏹' : '⚔️'}</span>
                  <span className="font-display text-parchment truncate flex-1">{a.name || '—'}</span>
                  <span className="font-display text-gold">{calc.iterative.map(signed).join('/')}</span>
                  <span className="text-body text-xs w-20 text-right">{dmg}</span>
                  <span className="text-muted text-xs w-16 text-right">{crit}</span>
                  {a.range_ft ? <span className="text-dim text-[11px] w-14 text-right">{distance(a.range_ft)}</span> : <span className="w-14" />}
                </button>
                <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad px-1 text-xs" onConfirm={() => actions.remove('attacks', a.id)}>✕</ConfirmButton>
              </div>
              {expanded && (
                <div className="grid grid-cols-6 gap-2 px-3 pb-3 pt-1 border-t border-subtle">
                  <TextField className="col-span-2" label={t('core.attack.name')} value={a.name} nullable={false} onCommit={v => set({ name: v })} />
                  <SelectField label={t('core.attack.kind')} value={a.kind} onCommit={v => set({ kind: v })}
                    options={[{ value: 'melee', label: t('core.attack.melee') }, { value: 'ranged', label: t('core.attack.ranged') }]} />
                  <SelectField label={t('core.attack.ability')} value={a.ability} placeholder={a.kind === 'ranged' ? t('abilities.dex') : t('abilities.str')}
                    options={abilityOptions} onCommit={v => set({ ability: v })} />
                  <NumberField label={t('core.attack.enh')} value={a.enh} onCommit={v => set({ enh: v })} />
                  <NumberField label={t('core.attack.misc')} value={a.misc} onCommit={v => set({ misc: v })} />
                  <TextField label={t('core.attack.dice')} value={a.damage_dice} placeholder="1d8" onCommit={v => set({ damage_dice: v })} />
                  <SelectField label={t('core.attack.damageAbility')} value={a.damage_ability} placeholder={t('common.none')} options={abilityOptions}
                    onCommit={v => set({ damage_ability: v })} />
                  <SelectField label={t('core.attack.mult')} value={a.damage_mult == null ? '' : String(a.damage_mult)} placeholder="×1"
                    options={[{ value: '0.5', label: '×½' }, { value: '1.5', label: '×1½' }]} onCommit={v => set({ damage_mult: v == null ? null : Number(v) })} />
                  <NumberField label={`${t('core.attack.dice')} ${t('common.misc')}`} value={a.damage_misc} onCommit={v => set({ damage_misc: v })} />
                  <NumberField label={`${t('core.attack.crit')} (min)`} value={a.crit_range} min={2} max={20} onCommit={v => set({ crit_range: v })} />
                  <NumberField label="×" value={a.crit_mult} min={1} max={6} onCommit={v => set({ crit_mult: v })} />
                  <NumberField label={`${t('core.attack.range')} (ft)`} value={a.range_ft} nullable min={0} onCommit={v => set({ range_ft: v })} />
                  <TextField label={t('core.attack.type')} value={a.damage_type} placeholder="P/S/B" onCommit={v => set({ damage_type: v })} />
                  <NumberField label={t('core.attack.ammo')} value={a.ammo} nullable min={0} onCommit={v => set({ ammo: v })} />
                  <TextField className="col-span-5" label={t('common.notes')} value={a.notes} onCommit={v => set({ notes: v })} />
                  <div className="col-span-6 flex justify-end"><IconButton label={t('common.close')} onClick={() => setOpen(null)}>▴</IconButton></div>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
