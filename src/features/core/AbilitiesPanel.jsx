import { useLang } from '../../i18n'
import { Section } from '../../ui/layout'
import { NumberField } from '../../ui/fields'
import { ABILITIES } from '../../../shared/constants/abilities.js'

// Mesma decomposição da ficha Roll20: base, melhoria (str-equi), outros, temporário — e dano/dreno
const PARTS = ['base', 'enh', 'misc', 'temp', 'damage', 'drain']

export function AbilitiesPanel({ ch, sheet, actions }) {
  const { t, signed } = useLang()
  const head = { base: t('common.base'), enh: t('core.enh'), misc: t('common.misc'), temp: t('common.temp'), damage: t('core.damage'), drain: t('core.drain') }
  return (
    <Section title={t('core.abilities')}>
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-dim text-[10px] uppercase tracking-wider">
            <th className="text-left font-normal pb-1" />
            <th className="font-normal pb-1">{t('core.score')}</th>
            <th className="font-normal pb-1">{t('core.mod')}</th>
            {PARTS.map(p => <th key={p} className="font-normal pb-1">{head[p]}</th>)}
          </tr>
        </thead>
        <tbody>
          {ABILITIES.map(ab => {
            const { score, mod } = sheet.abilities[ab]
            const changed = score !== (ch[`${ab}_base`] ?? 10)
            return (
              <tr key={ab} className="border-t border-subtle">
                <th scope="row" className="text-left py-1.5 pr-2" title={t(`abilityNames.${ab}`)}>
                  <span className="font-display text-gold text-sm">{t(`abilities.${ab}`)}</span>
                </th>
                <td className="text-center">
                  <span className={`font-display font-bold text-lg ${changed ? 'text-gold-hi' : 'text-parchment'}`}>{score}</span>
                </td>
                <td className="text-center">
                  <span className={`inline-block min-w-9 rounded-sm border px-1 font-display font-semibold ${mod >= 0 ? 'border-gold-lo text-gold' : 'border-[var(--color-hp-border)] text-[var(--color-hp)]'}`}>{signed(mod)}</span>
                </td>
                {PARTS.map(p => (
                  <td key={p} className="text-center px-0.5">
                    <NumberField compact value={ch[`${ab}_${p}`]} min={p === 'base' ? 0 : -99} max={99}
                      aria-label={`${t(`abilityNames.${ab}`)} — ${head[p]}`}
                      onCommit={v => actions.patchCharacter({ [`${ab}_${p}`]: v })} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </Section>
  )
}
