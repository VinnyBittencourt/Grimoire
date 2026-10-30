import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge } from '../../ui/layout'
import { NumberField } from '../../ui/fields'
import { ABILITIES } from '../../../shared/constants/abilities.js'

// Mesma decomposição da ficha Roll20: base, melhoria (str-equi), outros, temporário — e dano/dreno
const PARTS = ['base', 'enh', 'misc', 'temp', 'damage', 'drain']

export function AbilitiesPanel({ ch, sheet, actions }) {
  const { t, signed } = useLang()
  const [editing, setEditing] = useState(false)
  const head = { base: t('common.base'), enh: t('core.enh'), misc: t('common.misc'), temp: t('common.temp'), damage: t('core.damage'), drain: t('core.drain') }
  const modTone = mod => (mod < 0 ? 'text-hp-ink' : mod > 0 ? 'text-gold' : 'text-muted')

  return (
    <Section title={t('core.abilities')} editing={editing} onToggleEdit={() => setEditing(e => !e)}>
      {editing ? (
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="text-left pb-1.5"><span className="sr-only">{t('core.abilities')}</span></th>
              {PARTS.map(p => <th key={p} className="col-head pb-1.5 font-medium">{head[p]}</th>)}
              <th className="col-head pb-1.5 font-medium">= {t('core.score')}</th>
              <th className="col-head pb-1.5 font-medium">{t('core.mod')}</th>
            </tr>
          </thead>
          <tbody>
            {ABILITIES.map(ab => {
              const { score, mod } = sheet.abilities[ab]
              return (
                <tr key={ab} className="border-t border-subtle">
                  <th scope="row" className="text-left py-1.5 pr-2 font-normal">
                    <span className="font-display text-gold text-sm">{t(`abilities.${ab}`)}</span>
                    <span className="block caption">{t(`abilityNames.${ab}`)}</span>
                  </th>
                  {PARTS.map(p => (
                    <td key={p} className="text-center px-0.5">
                      <NumberField compact value={ch[`${ab}_${p}`]} min={p === 'base' ? 0 : -99} max={99} inputClassName="!w-12"
                        aria-label={`${t(`abilityNames.${ab}`)} — ${head[p]}`}
                        onCommit={v => actions.patchCharacter({ [`${ab}_${p}`]: v })} />
                    </td>
                  ))}
                  <td className="text-center"><span className="num-total">{score}</span></td>
                  <td className={`text-center font-display font-semibold ${modTone(mod)}`}>{signed(mod)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <ul className="list-none p-0 m-0 grid grid-cols-2 2xl:grid-cols-3 gap-2">
          {ABILITIES.map(ab => {
            const { score, mod } = sheet.abilities[ab]
            const changed = PARTS.filter(p => p !== 'base' && Number(ch[`${ab}_${p}`]))
            return (
              <li key={ab} className="flex items-center gap-3 rounded-sm border border-subtle bg-sunken px-3 py-2">
                <div className="flex flex-col items-center justify-center w-14 shrink-0 rounded-sm border border-wood bg-[var(--color-wood-darkest)] py-1">
                  <span className="num-total leading-none">{score}</span>
                  <span className={`text-sm font-display font-semibold ${modTone(mod)}`}>{signed(mod)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="m-0 font-display text-gold text-sm leading-tight">{t(`abilities.${ab}`)}</p>
                  <p className="caption m-0">{t(`abilityNames.${ab}`)}</p>
                  {changed.length > 0
                    ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        <Badge tone="gold">{t('common.base')} {ch[`${ab}_base`] ?? 10}</Badge>
                        {changed.map(p => {
                          const v = Number(ch[`${ab}_${p}`])
                          const minus = p === 'damage' || p === 'drain'
                          return <Badge key={p} tone={minus ? 'hp' : 'magic'}>{head[p]} {minus ? `−${Math.abs(v)}` : signed(v)}</Badge>
                        })}
                      </div>
                    )
                    : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </Section>
  )
}
