import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState, Badge } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { NumberField } from '../../ui/fields'
import { SummonModal } from './SummonModal'
import { ROMAN_NUMERALS as ROMAN } from './summonRules'

const parse = s => { try { return JSON.parse(s || '{}') } catch { return {} } }

export default function SummonsTab(props) {
  const { ch, actions } = props
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const casterLevel = Math.max(0, ...props.sheet.casting.map(c => c.casterLevel))

  return (
    <Section title={t('summons.active')} actions={<Button size="sm" variant="gold" onClick={() => setOpen(true)}>{t('summons.summon')}</Button>}>
      {ch.summons.length === 0 && <EmptyState title={t('summons.none')} className="py-10" />}
      <div className="grid gap-3 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {ch.summons.map(s => {
          const d = parse(s.data)
          const pct = Math.max(0, Math.min(100, (s.hp_current / Math.max(1, s.hp_max)) * 100))
          const color = pct > 50 ? 'var(--color-success)' : pct > 25 ? 'var(--color-warning)' : 'var(--color-hp)'
          const set = values => actions.update('summons', s.id, values)
          return (
            <article key={s.id} className="rounded-sm border border-[var(--color-magic-border)] bg-[var(--color-magic-bg)] p-3 flex flex-col gap-2">
              <header className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-parchment m-0 truncate">{s.name}</h4>
                  <p className="text-dim text-[10px] m-0">{[d.tamanho, d.tipo].filter(Boolean).join(' · ')}</p>
                </div>
                {s.spell_level && <Badge tone="magic">SM {ROMAN[s.spell_level]}</Badge>}
                {d.augmented && <Badge title={t('summons.augment')}>+4</Badge>}
              </header>
              <div className="flex items-center gap-2">
                <button type="button" className="w-7 h-7 rounded-sm border border-[var(--color-hp-border)] text-[var(--color-hp)] cursor-pointer" aria-label={t('vitals.damage')}
                  onClick={() => set({ hp_current: Math.max(-10, s.hp_current - 1) })}>−</button>
                <div className="flex-1">
                  <div className="h-2 rounded-full bg-sunken overflow-hidden"><div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} /></div>
                </div>
                <NumberField compact value={s.hp_current} min={-10} max={s.hp_max} aria-label={t('summons.hp')} onCommit={v => set({ hp_current: v })} />
                <span className="text-muted text-xs">/ {s.hp_max}</span>
                <button type="button" className="w-7 h-7 rounded-sm border border-[var(--color-save-border)] text-[var(--color-save)] cursor-pointer" aria-label={t('vitals.heal')}
                  onClick={() => set({ hp_current: Math.min(s.hp_max, s.hp_current + 1) })}>+</button>
              </div>
              <div className="flex gap-3 text-xs text-body">
                {d.ca != null && <span>{t('vitals.ac')} <b className="text-parchment">{d.ca}</b></span>}
                {d.ataque && <span className="truncate" title={d.ataque}>⚔ {d.ataque}</span>}
              </div>
              {d.habilidades?.length > 0 && <p className="text-[10px] text-dim m-0">{d.habilidades.join(' · ')}</p>}
              <footer className="flex items-center gap-2 mt-1">
                <NumberField label={t('summons.rounds')} compact nullable value={s.rounds_left} min={0}
                  placeholder={casterLevel ? String(casterLevel) : ''} onCommit={v => set({ rounds_left: v })} />
                {s.rounds_left != null && s.rounds_left > 0 && (
                  <Button size="sm" variant="subtle" onClick={() => set({ rounds_left: s.rounds_left - 1 })}>−1 {t('summons.rounds').toLowerCase()}</Button>
                )}
                <span className="flex-1" />
                <Button size="sm" variant="subtle" onClick={() => set({ hp_current: s.hp_max })}>{t('summons.full')}</Button>
                <ConfirmButton label={t('summons.dismiss')} className="text-dim hover:text-bad text-xs px-2 py-1" onConfirm={() => actions.remove('summons', s.id)}>
                  {t('summons.dismiss')}
                </ConfirmButton>
              </footer>
            </article>
          )
        })}
      </div>
      <SummonModal open={open} level={1} onClose={() => setOpen(false)} {...props} />
    </Section>
  )
}
