import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { EscolaIcon } from '../../assets/icons/escolaIcons'

const key = d => `${d.spell_id}:${d.level}:${d.is_domain ? 1 : 0}`
const signature = list => list.map(key).sort().join('|')

/**
 * Preparação diária de uma classe: escolha magias do grimório para os espaços normais e de domínio.
 * Nada é salvo até "Salvar"; fechar com alterações pede confirmação (confirmClose).
 */
export function PrepareModal({ open, onClose, ch, cast, actions }) {
  const { t, className, spellName } = useLang()
  const row = ch.classes.find(c => c.id === cast.rowId)
  // Magias sem classe (classe removida ou import antigo) também podem ser preparadas
  const grimoire = ch.spells.filter(s => s.class_row_id === cast.rowId || s.class_row_id == null)
  const firstLevel = cast.perDay.findIndex(v => v != null && v > 0)
  const [level, setLevel] = useState(Math.max(0, firstLevel))
  const initial = useMemo(() => ch.prepared
    .filter(p => p.class_row_id === cast.rowId)
    .map(p => ({ spell_id: p.spell_id, level: p.level, is_domain: p.is_domain, used: p.used })), [ch.prepared, cast.rowId])
  const [draft, setDraft] = useState(initial)
  const [saving, setSaving] = useState(false)
  const dirty = signature(draft) !== signature(initial)

  const byId = useMemo(() => new Map(ch.spells.map(s => [s.id, s])), [ch.spells])
  const count = (L, domain) => draft.filter(d => d.level === L && Boolean(d.is_domain) === domain).length
  const capacity = (L, domain) => (domain ? cast.domain[L] : cast.perDay[L] ?? 0)
  const timesPrepared = id => draft.filter(d => d.spell_id === id && d.level === level).length

  function add(spell, domain) {
    if (count(level, domain) >= capacity(level, domain)) return
    setDraft([...draft, { spell_id: spell.id, level, is_domain: domain ? 1 : 0, used: 0 }])
  }
  function removeAt(index) { setDraft(draft.filter((_, i) => i !== index)) }

  async function save() {
    setSaving(true)
    const ok = await actions.replacePrepared(cast.rowId, draft)
    setSaving(false)
    if (ok) onClose() // se falhou, o rascunho fica aberto (o erro já apareceu no toast)
  }

  const levels = cast.perDay.map((v, L) => ({ L, v })).filter(x => x.v != null)
  const normalFull = count(level, false) >= capacity(level, false)
  const domainFull = count(level, true) >= capacity(level, true)
  const freeNormal = Math.max(0, capacity(level, false) - count(level, false))
  const freeDomain = Math.max(0, capacity(level, true) - count(level, true))
  const atLevel = grimoire.filter(s => s.level === level).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Modal open={open} onClose={onClose} confirmClose={dirty && !saving} title={t('spells.prepTitle', { class: className(row) })}
      subtitle={t('spells.prepSubtitle')} width={1040} className="h-[84vh]"
      footer={<>
        <span className="caption mr-auto">{dirty ? t('spells.prepDirty') : t('spells.prepHint')}</span>
        <Button variant="subtle" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="gold" disabled={saving} onClick={save}><Icon name="check" size={15} />{saving ? t('common.saving') : t('spells.savePrep')}</Button>
      </>}>
      <div className="grid grid-cols-[170px_1fr_1fr] gap-4 h-full min-h-0">
        <nav className="flex flex-col gap-1" aria-label={t('common.level')}>
          {levels.map(({ L, v }) => {
            const used = count(L, false), dUsed = count(L, true)
            const full = used >= v && dUsed >= cast.domain[L]
            return (
              <button key={L} type="button" onClick={() => setLevel(L)} aria-current={level === L}
                className={`flex items-center justify-between gap-2 px-3 py-2 rounded-sm border text-xs cursor-pointer ${level === L ? 'border-gold bg-gold-faint text-gold' : 'border-subtle text-body hover:border-wood'}`}>
                <span className="font-display">{L === 0 ? t('spells.level0') : t('spells.levelN', { n: L })}</span>
                <span className={`inline-flex items-center gap-1 tabular-nums ${full ? 'text-good' : 'text-muted'}`}>
                  {full && <Icon name="check" size={12} />}{used}/{v}{cast.domain[L] ? ` +${dUsed}/${cast.domain[L]}` : ''}
                </span>
              </button>
            )
          })}
        </nav>

        <section className="flex flex-col min-h-0" aria-label={t('spells.grimoire')}>
          <h3 className="section-title mt-0 mb-2">{t('spells.grimoire')}</h3>
          <ul className="flex-1 overflow-y-auto list-none p-0 m-0 flex flex-col gap-1">
            {atLevel.map(s => {
              const n = timesPrepared(s.id)
              return (
                <li key={s.id} className="flex items-center gap-2 rounded-sm border border-subtle px-2 py-1.5 bg-sunken" title={s.description ?? ''}>
                  <EscolaIcon escola={s.school ?? 'Universal'} size={20} />
                  <span className="flex-1 text-sm text-parchment truncate">{spellName(s.name)}</span>
                  {n > 0 && <span className="text-xs text-stat-magic tabular-nums">×{n}</span>}
                  <Button size="sm" disabled={normalFull} onClick={() => add(s, false)} aria-label={`${t('spells.prepareOne')}: ${spellName(s.name)}`}
                    title={normalFull ? t('spells.slotsFull') : undefined}><Icon name="plus" size={14} /></Button>
                  {cast.domain[level] > 0 && (
                    <Button size="sm" variant="subtle" disabled={domainFull} onClick={() => add(s, true)} title={t('spells.domainSlot')}>
                      <Icon name="plus" size={14} />{t('spells.domain')}
                    </Button>
                  )}
                </li>
              )
            })}
            {atLevel.length === 0 && <li className="caption">{t('spells.noneAtLevel', { level: level === 0 ? t('spells.level0') : t('spells.levelN', { n: level }) })}</li>}
          </ul>
        </section>

        <section className="flex flex-col min-h-0" aria-label={t('spells.prepared')}>
          <h3 className="section-title mt-0 mb-2">{t('spells.prepared')}</h3>
          <ul className="flex-1 overflow-y-auto list-none p-0 m-0 flex flex-col gap-1">
            {draft.map((d, i) => d.level === level && (
              <li key={i} className="flex items-center gap-2 rounded-sm border border-[var(--color-magic-border)] bg-[var(--color-magic-bg)] px-2 py-1.5">
                <EscolaIcon escola={byId.get(d.spell_id)?.school ?? 'Universal'} size={20} />
                <span className="flex-1 text-sm text-parchment truncate">{spellName(byId.get(d.spell_id)?.name ?? '?')}</span>
                {d.is_domain ? <span className="text-2xs uppercase tracking-[var(--tracking-label)] text-gold">{t('spells.domain')}</span> : null}
                <button type="button" onClick={() => removeAt(i)} aria-label={`${t('spells.unprepare')}: ${spellName(byId.get(d.spell_id)?.name ?? '?')}`}
                  className="inline-flex items-center justify-center w-6 h-6 rounded-sm text-muted hover:text-bad hover:bg-bad-faint cursor-pointer">
                  <Icon name="minus" size={14} />
                </button>
              </li>
            ))}
            {Array.from({ length: freeNormal }, (_, i) => (
              <li key={`free${i}`} className="rounded-sm border border-dashed border-wood px-2 py-1.5 caption">{t('spells.freeSlot')}</li>
            ))}
            {Array.from({ length: freeDomain }, (_, i) => (
              <li key={`freed${i}`} className="rounded-sm border border-dashed border-gold-lo px-2 py-1.5 caption">{t('spells.freeDomainSlot')}</li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  )
}
