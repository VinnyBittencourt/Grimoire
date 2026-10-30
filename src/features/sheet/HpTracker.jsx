import { useEffect, useRef } from 'react'
import { useLang } from '../../i18n'
import { NumberField } from '../../ui/fields'
import { QuickAmount } from '../../ui/controls'
import { Badge } from '../../ui/layout'
import { useToast } from '../../ui/Toast'
import { applyDamage, applyHealing } from '../../../shared/rules/hp.js'

const HP_FIELDS = ['hp_current', 'hp_temp', 'nonlethal']

/**
 * PV atual / máximo / temporário / não letal, com dano e cura rápidos e "Desfazer".
 * A regra (temporários primeiro, cura sem passar do máximo) está em shared/rules/hp.js.
 */
export function HpTracker({ ch, sheet, actions }) {
  const { t } = useLang()
  const toast = useToast()
  const latest = useRef(ch)
  useEffect(() => { latest.current = ch })
  const max = Math.max(1, ch.hp_max || 1)
  const pct = Math.max(0, Math.min(100, (ch.hp_current / max) * 100))
  const color = pct > 50 ? 'var(--color-success)' : pct > 25 ? 'var(--color-warning)' : 'var(--color-hp)'
  const status = sheet.hp.status

  async function change(patch, message) {
    if (!Object.keys(patch).length) return
    const before = Object.fromEntries(HP_FIELDS.map(k => [k, ch[k]]))
    const after = { ...before, ...patch }
    if (!(await actions.patchCharacter(patch))) return
    toast.info(message, {
      undo: () => {
        // Só desfaz se ninguém mexeu nos PV depois (senão apagaria a mudança mais nova)
        const now = latest.current
        if (HP_FIELDS.some(k => (now[k] ?? 0) !== (after[k] ?? 0))) { toast.error(t('vitals.undoStale')); return }
        actions.patchCharacter(Object.fromEntries(Object.keys(patch).map(k => [k, before[k]])))
      },
    })
  }

  function apply(kind, n) {
    if (kind === 'damage') {
      const { patch, absorbed } = applyDamage(ch, n)
      change(patch, absorbed ? t('vitals.damageAbsorbed', { n, t: absorbed }) : t('vitals.damageDone', { n }))
    } else if (kind === 'nonlethal') {
      change(applyDamage(ch, n, { nonlethal: true }).patch, t('vitals.nonlethalDone', { n }))
    } else {
      change(applyHealing(ch, n), t('vitals.healDone', { n }))
    }
  }

  return (
    <section aria-label={t('vitals.hp')} className="rounded-sm border border-[var(--color-hp-border)] bg-[var(--color-hp-bg)] p-3 flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-2xs font-semibold tracking-[var(--tracking-caps)] uppercase text-hp-ink">{t('vitals.hpLong')}</span>
        {status !== 'ok' && <Badge tone="hp" icon="warning">{t(`vitals.status.${status}`)}</Badge>}
      </div>
      <div className="flex items-end justify-center gap-1.5">
        <NumberField value={ch.hp_current} onCommit={v => actions.patchCharacter({ hp_current: v })} min={-50} inline
          aria-label={t('vitals.hpCurrent')} inputClassName="!w-20 num-hero text-center !px-0 !py-0" />
        <span className="text-muted text-xl pb-1.5" aria-hidden>/</span>
        <NumberField value={ch.hp_max} onCommit={v => actions.patchCharacter({ hp_max: v })} min={0} inline
          aria-label={t('vitals.hpMax')} inputClassName="!w-14 font-display text-lg text-center text-muted !px-0 !py-0" />
      </div>
      <div className="h-2 rounded-full bg-sunken overflow-hidden" role="meter" aria-label={t('vitals.hp')}
        aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0, ch.hp_current)}>
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      {sheet.hp.suggestedMax !== ch.hp_max && (
        <p className="caption m-0 text-center">{t('core.hpSuggested', { n: sheet.hp.suggestedMax })}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <NumberField label={t('vitals.hpTemp')} value={ch.hp_temp} min={0} compact inputClassName="!w-full"
          onCommit={v => actions.patchCharacter({ hp_temp: v })} />
        <NumberField label={t('vitals.nonlethal')} value={ch.nonlethal} min={0} compact inputClassName="!w-full"
          onCommit={v => actions.patchCharacter({ nonlethal: v })} />
      </div>
      <HpAmount onApply={apply} />
    </section>
  )
}

function HpAmount({ onApply }) {
  const { t } = useLang()
  return (
    <QuickAmount
      ariaLabel={t('vitals.amount')}
      onApply={onApply}
      actions={[
        { id: 'damage', label: t('vitals.damage'), icon: 'minus', tone: 'danger' },
        { id: 'heal', label: t('vitals.heal'), icon: 'plus', tone: 'success' },
      ]}
      secondary={[{ id: 'nonlethal', label: t('vitals.asNonlethal'), icon: 'moon' }]}
    />
  )
}
