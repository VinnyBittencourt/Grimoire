import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { NumberField } from '../../ui/fields'
import { EscolaIcon } from '../../assets/icons/escolaIcons'
import { ESCOLA_CORES } from '../../assets/icons/escolaColors'
import { PrepareModal } from './PrepareModal'
import { summonLevel } from '../summons/summonRules'

/**
 * Uma classe conjuradora: tabela de slots por nível (por dia, domínio, CD, usados),
 * magias preparadas (clique conjura) ou fichas de slot (espontâneo).
 */
export function CasterBlock({ ch, cast, actions, onSummon }) {
  const { t, className, signed, spellName } = useLang()
  const [prepOpen, setPrepOpen] = useState(false)
  const [editBonus, setEditBonus] = useState(false)
  const row = ch.classes.find(c => c.id === cast.rowId)
  const spells = new Map(ch.spells.map(s => [s.id, s]))
  const prepared = ch.prepared.filter(p => p.class_row_id === cast.rowId)
  const slotRow = L => ch.spell_slots.find(s => s.class_row_id === cast.rowId && s.level === L)

  const levels = []
  for (let L = 0; L <= 9; L++) {
    if (cast.perDay[L] != null || (editBonus && cast.manual)) levels.push(L)
  }

  return (
    <Section
      title={`${className(row)} ${row.level}`}
      actions={<>
        <span className="text-muted text-[11px] mr-2">
          {t('spells.casterLevel', { n: cast.casterLevel })} · {t(`abilities.${cast.ability}`)} {cast.score} ({signed(cast.mod)})
        </span>
        <Button size="sm" variant="subtle" onClick={() => setEditBonus(!editBonus)} aria-pressed={editBonus}>{t('spells.bonusSlots')}</Button>
        {cast.type === 'prepared' && <Button size="sm" variant="gold" onClick={() => setPrepOpen(true)}>{t('spells.prepare')}</Button>}
      </>}
    >
      {cast.type === 'spontaneous' && <p className="text-dim text-[11px] mt-0 mb-2">{t('spells.spontaneous')}</p>}
      {cast.manual && <p className="text-warn text-[11px] mt-0 mb-2">{t('spells.manualTable')}</p>}

      <div className="flex flex-col gap-2">
        {levels.map(L => {
          const perDay = cast.perDay[L] ?? 0
          const domain = cast.domain[L]
          const blocked = perDay === 0 && !domain && cast.score < 10 + L
          const preparedHere = prepared.filter(p => p.level === L).sort((a, b) => a.is_domain - b.is_domain || a.position - b.position)
          const used = cast.type === 'spontaneous' ? cast.used[L] : preparedHere.filter(p => p.used).length
          const total = perDay + domain
          return (
            <div key={L} className={`rounded-sm border px-3 py-2 ${blocked ? 'border-subtle opacity-60' : 'border-[var(--color-magic-border)] bg-[var(--color-magic-bg)]'}`}>
              <div className="flex items-center gap-3">
                <span className="font-display text-gold text-sm w-16 shrink-0">{L === 0 ? t('spells.level0') : t('spells.levelN', { n: L })}</span>
                <span className="text-muted text-[11px]">{t('spells.dc')} <span className="text-parchment font-display">{cast.dc[L]}</span></span>
                <span className="text-muted text-[11px]">{t('spells.perDay')} <span className="text-parchment font-display">{perDay}{domain ? '+1' : ''}</span></span>
                {cast.known?.[L] != null && <span className="text-muted text-[11px]">{t('spells.known')} <span className="text-parchment font-display">{cast.known[L]}</span></span>}
                <span className="flex-1" />
                {blocked && <span className="text-warn text-[10px]">{t('spells.cannotCast', { min: 10 + L })}</span>}
                {!blocked && total > 0 && <span className="text-[11px] text-body">{t('spells.slotsLeft', { n: Math.max(0, total - used) })}</span>}
                {editBonus && (
                  <NumberField compact value={slotRow(L)?.bonus ?? 0} min={-20} max={20} aria-label={`${t('spells.bonusSlots')} ${L}`}
                    onCommit={v => actions.setSlot(cast.rowId, L, { bonus: v })} />
                )}
              </div>

              {cast.type === 'spontaneous' ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {Array.from({ length: total }, (_, i) => (
                    <button key={i} type="button" aria-pressed={i < used} title={i < used ? t('spells.castAgain') : t('spells.cast')}
                      onClick={() => actions.setSlot(cast.rowId, L, { used: i < used ? used - 1 : used + 1 })}
                      className={`w-6 h-6 rounded-sm border-2 rotate-45 cursor-pointer transition-colors ${i < used ? 'border-subtle bg-[var(--color-wood-medium)] opacity-40' : 'border-[var(--color-magic)] bg-[radial-gradient(circle,rgba(160,122,217,0.35),transparent_70%)]'}`} />
                  ))}
                </div>
              ) : (
                preparedHere.length > 0 && (
                  <div className="grid gap-1.5 mt-2 grid-cols-[repeat(auto-fill,minmax(170px,1fr))]">
                    {preparedHere.map(p => {
                      const sp = spells.get(p.spell_id)
                      const sm = summonLevel(sp?.name)
                      return (
                        <div key={p.id} className={`group flex items-center gap-2 rounded-sm border px-2 py-1 transition-opacity ${p.used ? 'opacity-35 border-subtle' : 'border-[var(--color-magic-border)] bg-sunken'}`}
                          style={{ borderLeftColor: ESCOLA_CORES[sp?.school] ?? undefined, borderLeftWidth: 3 }} title={sp?.description ?? ''}>
                          <EscolaIcon escola={sp?.school ?? 'Universal'} size={20} />
                          <button type="button" className="flex-1 min-w-0 text-left cursor-pointer" aria-pressed={Boolean(p.used)}
                            onClick={() => actions.update('prepared', p.id, { used: !p.used })}>
                            <span className={`block text-xs truncate ${p.used ? 'line-through text-dim' : 'text-parchment'}`}>{spellName(sp?.name ?? '?')}</span>
                            {p.is_domain ? <span className="block text-[9px] text-gold">{t('spells.domain')}</span> : null}
                          </button>
                          {sm && !p.used && (
                            <button type="button" className="text-[10px] text-gold hover:text-gold-hi cursor-pointer" onClick={() => onSummon({ level: sm, preparedId: p.id })}>
                              {t('spells.summon')}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              )}
            </div>
          )
        })}
      </div>
      {cast.type === 'prepared' && prepared.length === 0 && (
        <p className="text-dim text-xs mt-3 mb-0">{t('spells.noPrepared')} — <Badge>{t('spells.prepare')}</Badge></p>
      )}
      {prepOpen && <PrepareModal open onClose={() => setPrepOpen(false)} ch={ch} cast={cast} actions={actions} />}
    </Section>
  )
}
