import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section } from '../../ui/layout'
import { NumberField, TextField } from '../../ui/fields'
import { Button } from '../../ui/Button'
import { Notice } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { SAVES } from '../../../shared/constants/abilities.js'
import { labelParts } from '../sheet/breakdownLabels'
import { Equation } from './Equation'

const AC_MANUAL = ['armor', 'shield', 'natural', 'deflection', 'dodge', 'misc']

// CA decomposta (com contribuição dos itens equipados) + testes de resistência + RM/RD
export function DefensePanel({ ch, sheet, actions }) {
  const { t, signed, className } = useLang()
  const [editing, setEditing] = useState(false)
  const { ac, equipment } = sheet
  const patch = actions.patchCharacter
  const lp = parts => labelParts(parts, { t, className, ch })
  const bd = sheet.breakdown

  return (
    <Section title={t('core.defenseTitle')} editing={editing} onToggleEdit={() => setEditing(e => !e)}>
      <Equation label={t('vitals.ac')} total={ac.computed} tone="text-[var(--color-ac)]" parts={lp(bd.ac)} />
      <Equation label={t('vitals.touch')} total={ac.touch} parts={[]} extra={<span className="caption">{t('core.touchHint')}</span>} />
      <Equation label={t('vitals.flatFooted')} total={ac.flatFooted} parts={[]}
        extra={<span className="caption">{t('core.flatHint')}{equipment.maxDex != null ? ` · ${t('core.maxDex', { n: equipment.maxDex })}` : ''}</span>} />
      {sheet.load.effects && (
        <Notice tone="warn" compact className="mt-2" title={t('core.loadTitle', { load: t(`inventory.${sheet.load.status}`) })}>
          {t('core.loadEffects', { dex: sheet.load.effects.maxDex, acp: sheet.load.effects.acp })}
        </Notice>
      )}
      {ac.ignored.length > 0 && (
        <Notice tone="warn" compact className="mt-2" title={t('core.acNotStackingTitle')}>
          {ac.ignored.map(x => `${t(`core.acParts.${x.type}`)} ${signed(x.value)} (${x.name ?? t('core.acManualSource')})`).join(' · ')}
        </Notice>
      )}
      {ac.overridden && (
        <Notice tone="warn" compact className="mt-2" title={t('core.acOverrideTitle', { n: ac.total })}
          action={<Button size="sm" variant="ghost" onClick={() => patch({ ac_override: null })}><Icon name="reset" size={14} />{t('common.clearOverride')}</Button>}>
          {t('common.computed', { n: ac.computed })}
        </Notice>
      )}

      {editing && (
        <div className="mt-3 rounded-sm border border-subtle bg-sunken p-3 flex flex-col gap-3">
          <p className="caption m-0">{t('core.acFromItems')}</p>
          <div className="grid grid-cols-3 gap-2">
            {AC_MANUAL.map(p => (
              <NumberField key={p} label={t(`core.acManual.${p}`)} value={ch[`ac_${p}`]} onCommit={v => patch({ [`ac_${p}`]: v })} />
            ))}
            <NumberField label={t('core.acTemp')} value={ch.ac_temp} onCommit={v => patch({ ac_temp: v })} />
            <NumberField label={t('core.acOverrideField')} nullable value={ch.ac_override} onCommit={v => patch({ ac_override: v })}
              hint={t('common.computed', { n: ac.computed })} />
          </div>
        </div>
      )}

      <div className="divider-gold my-4" />
      <h4 className="section-title mt-0 mb-1">{t('core.saves')}</h4>
      {SAVES.map(s => (
        <Equation key={s} label={t(`saves.${s}`)} total={signed(sheet.saves[s].total)} tone="text-[var(--color-save)]" parts={lp(bd.saves[s])} />
      ))}
      {editing && (
        <table className="w-full text-xs border-collapse mt-3">
          <thead>
            <tr>
              <th className="text-left"><span className="sr-only">{t('core.saves')}</span></th>
              <th className="col-head font-medium pb-1">{t('core.saveMagic')}</th>
              <th className="col-head font-medium pb-1">{t('common.misc')}</th>
              <th className="col-head font-medium pb-1">{t('common.temp')}</th>
              <th className="col-head font-medium pb-1">{t('breakdown.parts.feats')}</th>
            </tr>
          </thead>
          <tbody>
            {SAVES.map(s => (
              <tr key={s} className="border-t border-subtle">
                <th scope="row" className="text-left py-1.5 font-display text-gold font-normal">{t(`saves.${s}`)}</th>
                {['magic', 'misc', 'temp'].map(k => (
                  <td key={k} className="text-center">
                    <NumberField compact value={ch[`${s}_${k}`]} onCommit={v => patch({ [`${s}_${k}`]: v })}
                      aria-label={`${t(`saves.${s}`)} — ${k === 'magic' ? t('core.saveMagic') : k === 'misc' ? t('common.misc') : t('common.temp')}`} />
                  </td>
                ))}
                <td className="text-center text-stat-magic text-sm font-display">{signed(sheet.effects.saves[s] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="grid grid-cols-2 gap-3 mt-4">
        {editing ? (
          <>
            <NumberField label={t('vitals.srLong')} value={ch.sr} min={0} onCommit={v => patch({ sr: v })} />
            <TextField label={t('vitals.drLong')} value={ch.dr} placeholder={t('core.drPlaceholder')} onCommit={v => patch({ dr: v })} />
          </>
        ) : (
          <>
            <p className="m-0 text-xs text-muted">{t('vitals.srLong')} <b className="text-parchment font-display text-sm">{ch.sr > 0 ? ch.sr : '—'}</b></p>
            <p className="m-0 text-xs text-muted">{t('vitals.drLong')} <b className="text-parchment font-display text-sm">{ch.dr || '—'}</b></p>
          </>
        )}
      </div>
    </Section>
  )
}
