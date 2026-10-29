import { useLang } from '../../i18n'
import { Section, StatBox } from '../../ui/layout'
import { NumberField } from '../../ui/fields'
import { IconButton } from '../../ui/Button'

export function CombatPanel({ ch, sheet, actions }) {
  const { t, signed } = useLang()
  const patch = actions.patchCharacter
  return (
    <Section title={t('core.combat')}>
      <div className="grid grid-cols-5 gap-2">
        <StatBox label={t('vitals.init')} value={signed(sheet.initiative)} />
        <StatBox label={t('vitals.bab')} value={signed(sheet.bab.total)} sub={sheet.bab.overridden ? t('common.manual') : null} />
        <StatBox label={t('vitals.grapple')} value={signed(sheet.grapple)} />
        <StatBox label={t('vitals.melee')} value={sheet.attack.meleeIterative.map(signed).join('/')} />
        <StatBox label={t('vitals.ranged')} value={sheet.attack.rangedIterative.map(signed).join('/')} />
      </div>
      <div className="grid grid-cols-5 gap-2 mt-2 items-end">
        <NumberField label={`${t('vitals.init')} ${t('common.misc')}`} compact inputClassName="!w-full" value={ch.init_misc} onCommit={v => patch({ init_misc: v })} />
        <div className="flex items-end gap-1">
          <NumberField label={`${t('vitals.bab')} ${t('common.manual')}`} compact nullable inputClassName="!w-full" className="flex-1"
            value={ch.bab_override} onCommit={v => patch({ bab_override: v })} title={t('common.computed', { n: sheet.bab.computed })} />
          {sheet.bab.overridden && <IconButton label={t('common.clearOverride')} onClick={() => patch({ bab_override: null })}>↺</IconButton>}
        </div>
        <NumberField label={`${t('vitals.grapple')} ${t('common.misc')}`} compact inputClassName="!w-full" value={ch.grapple_misc} onCommit={v => patch({ grapple_misc: v })} />
        <NumberField label={`${t('vitals.melee')} ${t('common.misc')}`} compact inputClassName="!w-full" value={ch.melee_misc} onCommit={v => patch({ melee_misc: v })} />
        <NumberField label={`${t('vitals.ranged')} ${t('common.misc')}`} compact inputClassName="!w-full" value={ch.ranged_misc} onCommit={v => patch({ ranged_misc: v })} />
      </div>
    </Section>
  )
}
