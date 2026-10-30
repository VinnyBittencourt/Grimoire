import { useLang } from '../../i18n'
import { Section, StatBox } from '../../ui/layout'
import { NumberField, TextField } from '../../ui/fields'
import { IconButton } from '../../ui/Button'
import { SAVES } from '../../../shared/constants/abilities.js'

const AC_MANUAL = ['armor', 'shield', 'natural', 'deflection', 'dodge', 'misc']

// CA decomposta (com contribuição dos itens equipados) + testes de resistência + RM/RD
export function DefensePanel({ ch, sheet, actions }) {
  const { t, signed } = useLang()
  const { ac, equipment } = sheet
  const patch = actions.patchCharacter

  return (
    <Section title={t('core.ac')}>
      <div className="flex gap-3 items-stretch">
        <div className="grid grid-cols-1 gap-1.5 w-24 shrink-0">
          <StatBox tone="ac" label={t('vitals.ac')} value={ac.total} className="py-2" />
          <StatBox tone="ac" label={t('vitals.touch')} value={ac.touch} />
          <StatBox tone="ac" label={t('vitals.flatFooted')} value={ac.flatFooted} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-8 gap-1 text-center text-[10px] text-dim uppercase tracking-wide">
            <span>10</span>
            {['armor', 'shield', 'dex', 'size', 'natural', 'deflection', 'dodge'].map(p => <span key={p} className="truncate" title={t(`core.acParts.${p}`)}>{t(`core.acParts.${p}`)}</span>)}
          </div>
          <div className="grid grid-cols-8 gap-1 text-center font-display text-parchment mt-0.5">
            <span>10</span>
            {['armor', 'shield', 'dex', 'size', 'natural', 'deflection', 'dodge'].map(p => <span key={p}>{signed(ac.parts[p])}</span>)}
          </div>
          <p className="text-dim text-[10px] mt-2 mb-1">{t('core.acFromItems')}{equipment.maxDex != null ? ` · ${t('core.maxDex', { n: equipment.maxDex })}` : ''}</p>
          {ac.ignored.length > 0 && (
            <p className="text-warn text-[10px] mt-0 mb-1">
              {t('core.acIgnored', { list: ac.ignored.map(x => `${t(`core.acParts.${x.type}`)} ${signed(x.value)} (${x.name ?? t('core.acManualSource')})`).join(' · ') })}
            </p>
          )}
          <div className="grid grid-cols-6 gap-1.5">
            {AC_MANUAL.map(p => (
              <NumberField key={p} label={t(`core.acParts.${p}`)} compact inputClassName="!w-full" value={ch[`ac_${p}`]}
                onCommit={v => patch({ [`ac_${p}`]: v })} />
            ))}
          </div>
          <div className="flex items-end gap-2 mt-2">
            <NumberField label={t('common.temp')} compact value={ch.ac_temp} onCommit={v => patch({ ac_temp: v })} />
            <NumberField label={t('common.override')} compact nullable value={ch.ac_override} onCommit={v => patch({ ac_override: v })}
              title={t('common.computed', { n: ac.computed })} />
            {ac.overridden && <IconButton label={t('common.clearOverride')} onClick={() => patch({ ac_override: null })}>↺</IconButton>}
            {ac.overridden && <span className="text-warn text-[10px] pb-1">{t('common.computed', { n: ac.computed })}</span>}
          </div>
        </div>
      </div>

      <div className="divider-gold my-4" />
      <h4 className="section-title mt-0 mb-2">{t('core.saves')}</h4>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="text-dim text-[10px] uppercase tracking-wider">
            <th />
            <th className="font-normal">{t('common.total')}</th>
            <th className="font-normal">{t('core.saveBase')}</th>
            <th className="font-normal">{t('core.saveAbility')}</th>
            <th className="font-normal">{t('core.saveMagic')}</th>
            <th className="font-normal">{t('common.misc')}</th>
            <th className="font-normal">{t('common.temp')}</th>
          </tr>
        </thead>
        <tbody>
          {SAVES.map(s => {
            const sv = sheet.saves[s]
            const fromFeats = sheet.effects.saves[s]
            return (
              <tr key={s} className="border-t border-subtle">
                <th scope="row" className="text-left py-1.5 font-display text-gold font-normal">{t(`saves.${s}`)}</th>
                <td className="text-center"><span className="font-display font-bold text-base text-[var(--color-save)]">{signed(sv.total)}</span></td>
                <td className="text-center text-body">{signed(sv.base)}</td>
                <td className="text-center text-body">{signed(sv.ability)}</td>
                <td className="text-center"><NumberField compact value={ch[`${s}_magic`]} onCommit={v => patch({ [`${s}_magic`]: v })} aria-label={`${t(`saves.${s}`)} ${t('core.saveMagic')}`} /></td>
                <td className="text-center" title={fromFeats ? t('core.fromFeats', { n: signed(fromFeats) }) : undefined}>
                  <NumberField compact value={ch[`${s}_misc`]} onCommit={v => patch({ [`${s}_misc`]: v })} aria-label={`${t(`saves.${s}`)} ${t('common.misc')}`} />
                  {fromFeats !== 0 && <span className="text-[9px] text-magic block">{t('core.fromFeats', { n: signed(fromFeats) })}</span>}
                </td>
                <td className="text-center"><NumberField compact value={ch[`${s}_temp`]} onCommit={v => patch({ [`${s}_temp`]: v })} aria-label={`${t(`saves.${s}`)} ${t('common.temp')}`} /></td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <NumberField label={t('vitals.sr')} value={ch.sr} min={0} onCommit={v => patch({ sr: v })} />
        <TextField label={t('vitals.dr')} value={ch.dr} placeholder="5/mágica" onCommit={v => patch({ dr: v })} />
      </div>
    </Section>
  )
}
