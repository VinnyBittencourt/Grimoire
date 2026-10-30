import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState, Badge } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { NumberField } from '../../ui/fields'
import { QuickAmount } from '../../ui/controls'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/Toast'
import { snapshotFor } from '../../queries/undo'
import { SummonModal } from './SummonModal'
import { ROMAN_NUMERALS as ROMAN } from './summonRules'

const parse = s => { try { return JSON.parse(s || '{}') } catch { return {} } }

export default function SummonsTab(props) {
  const { ch, actions } = props
  const { t } = useLang()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const casterLevel = Math.max(0, ...props.sheet.casting.map(c => c.casterLevel))
  const counting = ch.summons.filter(s => s.rounds_left > 0)

  async function dismissAll() {
    const rows = [...ch.summons]
    let ok = 0
    for (const s of rows) if (await actions.remove('summons', s.id)) ok++
    if (ok) toast.info(t('summons.dismissedAll', { n: ok }), { undo: () => rows.forEach(s => actions.create('summons', snapshotFor('summons', s))) })
  }

  return (
    <Section title={t('summons.active')} subtitle={ch.summons.length ? String(ch.summons.length) : null} actions={<>
      {counting.length > 0 && (
        <Button size="sm" onClick={() => counting.forEach(s => actions.update('summons', s.id, { rounds_left: s.rounds_left - 1 }))}>
          <Icon name="hourglass" size={14} />{t('summons.nextRound')}
        </Button>
      )}
      {ch.summons.length > 1 && (
        <ConfirmButton label={t('summons.dismissAll')} confirmLabel={t('summons.dismissAllConfirm')} className="min-h-7 border border-transparent hover:border-[var(--color-hp-border)]" onConfirm={dismissAll}>
          {t('summons.dismissAll')}
        </ConfirmButton>
      )}
      <Button size="sm" variant="gold" onClick={() => setOpen(true)}><Icon name="paw" size={14} />{t('summons.summon')}</Button>
    </>}>
      {ch.summons.length === 0 && (
        <EmptyState icon="paw" title={t('summons.none')} hint={t('summons.noneHint')} className="py-12"
          action={<Button variant="gold" onClick={() => setOpen(true)}>{t('summons.summon')}</Button>} />
      )}
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(320px,1fr))]">
        {ch.summons.map(s => {
          const d = parse(s.data)
          const pct = Math.max(0, Math.min(100, (s.hp_current / Math.max(1, s.hp_max)) * 100))
          const color = pct > 50 ? 'var(--color-success)' : pct > 25 ? 'var(--color-warning)' : 'var(--color-hp)'
          const set = values => actions.update('summons', s.id, values)
          const expired = s.rounds_left === 0
          return (
            <article key={s.id} className={`rounded-sm border p-3 flex flex-col gap-2.5 ${expired ? 'border-[var(--color-warning)]/60 bg-warn-faint' : 'border-[var(--color-magic-border)] bg-[var(--color-magic-bg)]'}`}>
              <header className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-parchment m-0 truncate">{s.name}</h4>
                  <p className="caption m-0">{[d.tamanho, d.tipo].filter(Boolean).join(' · ') || '—'}</p>
                </div>
                {expired && <Badge tone="warn" icon="hourglass">{t('summons.expired')}</Badge>}
                {s.spell_level && <Badge tone="magic">{t('summons.smShort', { r: ROMAN[s.spell_level] })}</Badge>}
                {d.augmented && <Badge title={t('summons.augment')}>+4</Badge>}
              </header>
              <div className="flex items-center gap-2">
                <span className="text-2xs uppercase tracking-[var(--tracking-label)] text-hp-ink">{t('vitals.hp')}</span>
                <div className="flex-1 h-2 rounded-full bg-sunken overflow-hidden" role="meter" aria-label={`${s.name} ${t('vitals.hp')}`}
                  aria-valuemin={0} aria-valuemax={s.hp_max} aria-valuenow={Math.max(0, s.hp_current)}>
                  <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
                </div>
                <NumberField compact value={s.hp_current} min={-10} max={s.hp_max} aria-label={`${s.name} — ${t('summons.hp')}`} onCommit={v => set({ hp_current: v })} />
                <span className="text-muted text-sm">/ {s.hp_max}</span>
              </div>
              <QuickAmount
                onApply={(kind, n) => set({ hp_current: kind === 'damage' ? Math.max(-10, s.hp_current - n) : Math.min(s.hp_max, s.hp_current + n) })}
                actions={[{ id: 'damage', label: t('vitals.damage'), icon: 'minus', tone: 'danger' }, { id: 'heal', label: t('vitals.heal'), icon: 'plus', tone: 'success' }]} />
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-body">
                {d.ca != null && <span>{t('vitals.ac')} <b className="text-parchment font-display">{d.ca}</b></span>}
                {d.ataque && <span className="inline-flex items-center gap-1 min-w-0"><Icon name="sword" size={14} className="text-gold-lo" /><span className="truncate" title={d.ataque}>{d.ataque}</span></span>}
              </div>
              {d.habilidades?.length > 0 && <p className="caption m-0">{d.habilidades.join(' · ')}</p>}
              <footer className="flex items-end gap-2 pt-2 border-t border-subtle">
                <NumberField label={t('summons.roundsLeft')} compact nullable value={s.rounds_left} min={0} stepper
                  placeholder={casterLevel ? String(casterLevel) : ''} onCommit={v => set({ rounds_left: v })}
                  hint={s.rounds_left == null && casterLevel ? t('summons.roundsHint', { n: casterLevel }) : undefined} />
                <span className="flex-1" />
                <Button size="sm" variant="subtle" onClick={() => set({ hp_current: s.hp_max })}>{t('summons.full')}</Button>
                <Button size="sm" variant={expired ? 'danger' : 'subtle'}
                  onClick={async () => { if (await actions.remove('summons', s.id)) toast.info(t('summons.dismissed', { name: s.name }), { undo: () => actions.create('summons', snapshotFor('summons', s)) }) }}>
                  {t('summons.dismiss')}
                </Button>
              </footer>
            </article>
          )
        })}
      </div>
      <SummonModal open={open} level={1} onClose={() => setOpen(false)} {...props} />
    </Section>
  )
}
