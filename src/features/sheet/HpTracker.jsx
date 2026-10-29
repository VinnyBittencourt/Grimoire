import { useState } from 'react'
import { useLang } from '../../i18n'
import { NumberField } from '../../ui/fields'

/**
 * PV atual / máximo / temporário / não letal, com dano e cura rápidos.
 * Dano consome PV temporários primeiro (PHB p. 146); cura não passa do máximo.
 */
export function HpTracker({ ch, sheet, actions }) {
  const { t } = useLang()
  const [amount, setAmount] = useState('')
  const max = Math.max(1, ch.hp_max || 1)
  const pct = Math.max(0, Math.min(100, (ch.hp_current / max) * 100))
  const color = pct > 50 ? 'var(--color-success)' : pct > 25 ? 'var(--color-warning)' : 'var(--color-hp)'
  const status = sheet.hp.status

  function apply(kind) {
    const n = Math.abs(parseInt(amount, 10))
    if (!n) return
    if (kind === 'damage') {
      const fromTemp = Math.min(ch.hp_temp, n)
      actions.patchCharacter({ hp_temp: ch.hp_temp - fromTemp, hp_current: ch.hp_current - (n - fromTemp) })
    } else if (kind === 'nonlethal') {
      actions.patchCharacter({ nonlethal: ch.nonlethal + n })
    } else {
      actions.patchCharacter({ hp_current: Math.min(ch.hp_max, ch.hp_current + n), nonlethal: Math.max(0, ch.nonlethal - n) })
    }
    setAmount('')
  }

  return (
    <div className="rounded-sm border border-[var(--color-hp-border)] bg-[var(--color-hp-bg)] p-2.5 flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] tracking-[0.14em] uppercase text-[var(--color-hp)]">{t('vitals.hp')}</span>
        {status !== 'ok' && <span className="text-[10px] uppercase tracking-wider text-[var(--color-danger-light)]">{t(`vitals.status.${status}`)}</span>}
      </div>
      <div className="flex items-end justify-center gap-1">
        <NumberField value={ch.hp_current} onCommit={v => actions.patchCharacter({ hp_current: v })} min={-50}
          aria-label={t('vitals.hp')} inputClassName="!w-16 !text-2xl font-display font-bold text-center !bg-transparent !border-transparent hover:!border-[var(--color-hp-border)] !p-0" />
        <span className="text-muted text-lg pb-1">/</span>
        <NumberField value={ch.hp_max} onCommit={v => actions.patchCharacter({ hp_max: v })} min={0}
          aria-label={t('vitals.hpMax')} title={t('core.hpSuggested', { n: sheet.hp.suggestedMax })}
          inputClassName="!w-12 !text-base font-display text-center !bg-transparent !border-transparent hover:!border-[var(--color-hp-border)] !p-0 text-muted" />
      </div>
      <div className="h-1.5 rounded-full bg-sunken overflow-hidden" aria-hidden>
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label={t('vitals.hpTemp')} value={ch.hp_temp} min={0} compact inputClassName="!w-full"
          onCommit={v => actions.patchCharacter({ hp_temp: v })} />
        <NumberField label={t('vitals.nonlethal')} value={ch.nonlethal} min={0} compact inputClassName="!w-full"
          onCommit={v => actions.patchCharacter({ nonlethal: v })} />
      </div>
      <form className="flex gap-1" onSubmit={e => { e.preventDefault(); apply('damage') }}>
        <input className="field field-sm w-14 text-center" inputMode="numeric" placeholder={t('vitals.amount')} aria-label={t('vitals.amount')}
          value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))} />
        <button type="submit" className="flex-1 text-[11px] rounded-sm border border-[var(--color-hp-border)] text-[var(--color-danger-light)] hover:bg-[rgba(192,57,43,0.15)] cursor-pointer">−{t('vitals.damage')}</button>
        <button type="button" onClick={() => apply('nonlethal')} title={t('vitals.nonlethal')} className="px-2 text-[11px] rounded-sm border border-subtle text-muted hover:text-parchment cursor-pointer">NL</button>
        <button type="button" onClick={() => apply('heal')} className="flex-1 text-[11px] rounded-sm border border-[var(--color-save-border)] text-[var(--color-save)] hover:bg-[rgba(39,174,96,0.12)] cursor-pointer">+{t('vitals.heal')}</button>
      </form>
    </div>
  )
}
