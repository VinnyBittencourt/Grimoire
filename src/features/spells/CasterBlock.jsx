import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { NumberField } from '../../ui/fields'
import { TokenTrack } from '../../ui/controls'
import { Notice } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { EscolaIcon } from '../../assets/icons/escolaIcons'
import { ESCOLA_CORES } from '../../assets/icons/escolaColors'
import { PrepareModal } from './PrepareModal'
import { summonLevel } from '../summons/summonRules'

/**
 * Uma classe conjuradora: espaços por nível (por dia, domínio, CD, restantes),
 * magias preparadas (botão Conjurar / Desfazer) ou fichas de espaço (espontâneo).
 */
export function CasterBlock({ ch, cast, actions, onSummon }) {
  const { t, className, signed, spellName } = useLang()
  const [prepOpen, setPrepOpen] = useState(false)
  const [editBonus, setEditBonus] = useState(cast.manual)
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
      subtitle={`${t('spells.casterLevel', { n: cast.casterLevel })} · ${t(`abilities.${cast.ability}`)} ${cast.score} (${signed(cast.mod)})`}
      actions={<>
        <Button size="sm" variant={editBonus ? 'ghost' : 'subtle'} onClick={() => setEditBonus(!editBonus)} aria-pressed={editBonus}>
          <Icon name="settings" size={14} />{t('spells.bonusSlotsShort')}
        </Button>
        {cast.type === 'prepared' && <Button size="sm" variant="gold" onClick={() => setPrepOpen(true)}><Icon name="book" size={14} />{t('spells.prepare')}</Button>}
      </>}
    >
      {cast.type === 'spontaneous' && <p className="caption mt-0 mb-2">{t('spells.spontaneous')}</p>}
      {cast.manual && <Notice tone="warn" compact className="mb-2">{t('spells.manualTable')}</Notice>}
      {editBonus && <p className="caption mt-0 mb-2">{t('spells.bonusHint')}</p>}

      <div className="flex flex-col gap-2">
        {levels.map(L => {
          const perDay = cast.perDay[L] ?? 0
          const domain = cast.domain[L]
          const blocked = perDay === 0 && !domain && cast.score < 10 + L
          const preparedHere = prepared.filter(p => p.level === L).sort((a, b) => a.is_domain - b.is_domain || a.position - b.position)
          const used = cast.type === 'spontaneous' ? cast.used[L] : preparedHere.filter(p => p.used).length
          const total = perDay + domain
          const leftN = Math.max(0, total - used)
          return (
            <div key={L} className={`rounded-sm border px-3 py-2.5 ${blocked ? 'border-subtle bg-sunken' : 'border-[var(--color-magic-border)] bg-[var(--color-magic-bg)]'}`}>
              <div className="flex items-center gap-x-4 gap-y-1 flex-wrap">
                <span className="font-display text-gold text-sm w-16 shrink-0">{L === 0 ? t('spells.level0') : t('spells.levelN', { n: L })}</span>
                <span className="text-xs text-muted">{t('spells.dc')} <b className="text-parchment font-display text-sm">{cast.dc[L]}</b></span>
                <span className="text-xs text-muted">{t('spells.perDay')} <b className="text-parchment font-display text-sm">{perDay}{domain ? ` + ${domain}` : ''}</b></span>
                {cast.known?.[L] != null && <span className="text-xs text-muted">{t('spells.known')} <b className="text-parchment font-display text-sm">{cast.known[L]}</b></span>}
                <span className="flex-1" />
                {blocked && <span className="inline-flex items-center gap-1 text-xs text-warn"><Icon name="lock" size={13} />{t('spells.cannotCast', { min: 10 + L })}</span>}
                {!blocked && total > 0 && (
                  <span className="inline-flex items-center gap-2">
                    {cast.type === 'prepared' && <TokenTrack variant="diamond" size={16} total={total} isUsed={i => i < used} label={t('spells.levelN', { n: L })} />}
                    <span className={`text-xs ${leftN ? 'text-parchment' : 'text-muted'}`}>{t('spells.slotsLeftOf', { n: leftN, total })}</span>
                  </span>
                )}
                {editBonus && (
                  <NumberField compact value={slotRow(L)?.bonus ?? 0} min={-20} max={20} aria-label={`${t('spells.bonusSlots')} — ${t('spells.levelN', { n: L })}`}
                    onCommit={v => actions.setSlot(cast.rowId, L, { bonus: v })} stepper />
                )}
              </div>

              {cast.type === 'spontaneous' ? (
                total > 0 && (
                  <div className="mt-2 flex items-center gap-3">
                    <TokenTrack variant="diamond" total={total} label={t('spells.levelN', { n: L })} isUsed={i => i < used}
                      onToggle={i => actions.setSlot(cast.rowId, L, { used: i < used ? used - 1 : used + 1 })} />
                    <span className="caption">{t('spells.spendHint')}</span>
                  </div>
                )
              ) : (
                preparedHere.length > 0 && (
                  <div className="grid gap-1.5 mt-2 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
                    {preparedHere.map(p => {
                      const sp = spells.get(p.spell_id)
                      const sm = summonLevel(sp?.name)
                      const name = spellName(sp?.name ?? '?')
                      return (
                        <div key={p.id} className={`flex flex-col gap-1.5 rounded-sm border px-2.5 py-2 transition-opacity ${p.used ? 'opacity-60 border-subtle bg-sunken' : 'border-[var(--color-magic-border)] bg-sunken'}`}
                          style={{ borderLeftColor: ESCOLA_CORES[sp?.school] ?? undefined, borderLeftWidth: 3 }}>
                          <div className="flex items-start gap-2 min-w-0">
                            <EscolaIcon escola={sp?.school ?? 'Universal'} size={22} />
                            <span className={`flex-1 min-w-0 text-sm leading-snug line-clamp-2 ${p.used ? 'line-through text-muted' : 'text-parchment'}`} title={sp?.description || undefined}>{name}</span>
                          </div>
                          <div className="flex items-center justify-end gap-1.5">
                            {p.is_domain ? <span className="mr-auto text-2xs uppercase tracking-[var(--tracking-label)] text-gold">{t('spells.domain')}</span> : null}
                          {p.used ? (
                            <button type="button" aria-pressed="true" aria-label={`${t('spells.castAgain')}: ${name}`}
                              onClick={() => actions.update('prepared', p.id, { used: false })}
                              className="inline-flex items-center gap-1 min-h-6 px-1.5 rounded-sm text-xs text-muted hover:text-gold hover:bg-gold-faint cursor-pointer">
                              <Icon name="undo" size={13} />{t('spells.castDone')}
                            </button>
                          ) : (
                            <>
                              {sm && (
                                <button type="button" onClick={() => onSummon({ level: sm, preparedId: p.id })}
                                  className="inline-flex items-center gap-1 min-h-6 px-1.5 rounded-sm text-xs text-gold hover:bg-gold-faint cursor-pointer">
                                  <Icon name="paw" size={13} />{t('spells.summon')}
                                </button>
                              )}
                              <button type="button" aria-pressed="false" aria-label={`${t('spells.cast')}: ${name}`}
                                onClick={() => actions.update('prepared', p.id, { used: true })}
                                className="inline-flex items-center gap-1 min-h-6 px-2 rounded-sm border border-[var(--color-magic)]/50 text-xs text-stat-magic hover:bg-[var(--color-magic-bg)] hover:border-[var(--color-magic)] cursor-pointer">
                                <Icon name="wand" size={13} />{t('spells.cast')}
                              </button>
                            </>
                          )}
                          </div>
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
        <div className="mt-3 flex items-center gap-3 rounded-sm border border-dashed border-wood px-3 py-3">
          <Icon name="book" className="text-gold-lo" />
          <span className="text-sm text-muted flex-1">{t('spells.noPreparedToday')}</span>
          <Button size="sm" variant="gold" onClick={() => setPrepOpen(true)}>{t('spells.prepare')}</Button>
        </div>
      )}
      {prepared.some(p => p.used) && cast.type === 'prepared' && (
        <p className="caption mt-2 mb-0 flex items-center gap-1"><Badge tone="magic">{prepared.filter(p => p.used).length}</Badge>{t('spells.castToday')}</p>
      )}
      {prepOpen && <PrepareModal open onClose={() => setPrepOpen(false)} ch={ch} cast={cast} actions={actions} />}
    </Section>
  )
}
