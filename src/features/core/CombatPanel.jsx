import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section } from '../../ui/layout'
import { NumberField } from '../../ui/fields'
import { Button } from '../../ui/Button'
import { Notice } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { labelParts } from '../sheet/breakdownLabels'
import { Equation } from './Equation'

export function CombatPanel({ ch, sheet, actions }) {
  const { t, signed, className } = useLang()
  const [editing, setEditing] = useState(false)
  const patch = actions.patchCharacter
  const lp = parts => labelParts(parts, { t, className, ch })
  const bd = sheet.breakdown
  const seq = list => list.map(signed).join('/')

  return (
    <Section title={t('core.combat')} editing={editing} onToggleEdit={() => setEditing(e => !e)}>
      <Equation label={t('vitals.init')} total={signed(sheet.initiative)} parts={lp(bd.initiative)} />
      <Equation label={t('vitals.bab')} total={seq(sheet.bab.iterative)} parts={lp(bd.bab)}
        extra={sheet.bab.overridden ? <span className="text-warn"> · {t('core.babManual')}</span> : null} />
      <Equation label={t('vitals.grapple')} total={signed(sheet.grapple)} parts={lp(bd.grapple)} />
      <Equation label={t('vitals.melee')} total={seq(sheet.attack.meleeIterative)} parts={lp(bd.melee)} />
      <Equation label={t('vitals.ranged')} total={seq(sheet.attack.rangedIterative)} parts={lp(bd.ranged)} />

      {sheet.bab.overridden && (
        <Notice tone="warn" compact className="mt-2" title={t('core.babOverrideTitle', { n: signed(sheet.bab.total) })}
          action={<Button size="sm" variant="ghost" onClick={() => patch({ bab_override: null })}><Icon name="reset" size={14} />{t('common.clearOverride')}</Button>}>
          {t('common.computed', { n: signed(sheet.bab.computed) })}
        </Notice>
      )}

      {editing && (
        <div className="mt-3 rounded-sm border border-subtle bg-sunken p-3 grid grid-cols-3 gap-2">
          <NumberField label={t('core.initMisc')} value={ch.init_misc} onCommit={v => patch({ init_misc: v })} />
          <NumberField label={t('core.grappleMisc')} value={ch.grapple_misc} onCommit={v => patch({ grapple_misc: v })} />
          <NumberField label={t('core.babManual')} nullable value={ch.bab_override} onCommit={v => patch({ bab_override: v })}
            hint={t('common.computed', { n: signed(sheet.bab.computed) })} />
          <NumberField label={t('core.meleeMisc')} value={ch.melee_misc} onCommit={v => patch({ melee_misc: v })} />
          <NumberField label={t('core.rangedMisc')} value={ch.ranged_misc} onCommit={v => patch({ ranged_misc: v })} />
        </div>
      )}
    </Section>
  )
}
