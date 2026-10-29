import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { EscolaIcon } from '../../assets/icons/escolaIcons'

/**
 * Preparação diária de uma classe: escolha magias do grimório para os slots normais e de domínio.
 * Nada é salvo até "Salvar"; fechar sem salvar descarta (por isso clique fora não fecha).
 */
export function PrepareModal({ open, onClose, ch, cast, actions }) {
  const { t, className, spellName } = useLang()
  const row = ch.classes.find(c => c.id === cast.rowId)
  // Magias sem classe (classe removida ou import antigo) também podem ser preparadas
  const grimoire = ch.spells.filter(s => s.class_row_id === cast.rowId || s.class_row_id == null)
  const firstLevel = cast.perDay.findIndex(v => v != null && v > 0)
  const [level, setLevel] = useState(Math.max(0, firstLevel))
  const [draft, setDraft] = useState(() => ch.prepared
    .filter(p => p.class_row_id === cast.rowId)
    .map(p => ({ spell_id: p.spell_id, level: p.level, is_domain: p.is_domain, used: p.used })))
  const [saving, setSaving] = useState(false)

  const byId = useMemo(() => new Map(ch.spells.map(s => [s.id, s])), [ch.spells])
  const count = (L, domain) => draft.filter(d => d.level === L && Boolean(d.is_domain) === domain).length
  const capacity = (L, domain) => (domain ? cast.domain[L] : cast.perDay[L] ?? 0)

  function add(spell, domain) {
    if (count(level, domain) >= capacity(level, domain)) return
    setDraft([...draft, { spell_id: spell.id, level, is_domain: domain ? 1 : 0, used: 0 }])
  }
  function removeAt(index) { setDraft(draft.filter((_, i) => i !== index)) }

  async function save() {
    setSaving(true)
    await actions.replacePrepared(cast.rowId, draft)
    setSaving(false)
    onClose()
  }

  const levels = cast.perDay.map((v, L) => ({ L, v })).filter(x => x.v != null)
  const normalFull = count(level, false) >= capacity(level, false)
  const domainFull = count(level, true) >= capacity(level, true)

  return (
    <Modal open={open} onClose={onClose} title={t('spells.prepTitle', { class: className(row) })} width={1000} className="h-[82vh]"
      footer={<>
        <span className="text-dim text-[11px] mr-auto">{t('spells.prepHint')}</span>
        <Button variant="subtle" onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="gold" disabled={saving} onClick={save}>{t('common.save')}</Button>
      </>}>
      <div className="grid grid-cols-[150px_1fr_1fr] gap-4 h-full min-h-0">
        <nav className="flex flex-col gap-1" aria-label={t('common.level')}>
          {levels.map(({ L, v }) => {
            const used = count(L, false), dUsed = count(L, true)
            const full = used >= v && dUsed >= cast.domain[L]
            return (
              <button key={L} type="button" onClick={() => setLevel(L)} aria-current={level === L}
                className={`flex items-center justify-between px-3 py-2 rounded-sm border text-xs cursor-pointer ${level === L ? 'border-gold bg-gold-faint text-gold' : 'border-subtle text-body hover:border-wood'}`}>
                <span className="font-display">{L === 0 ? t('spells.level0') : t('spells.levelN', { n: L })}</span>
                <span className={full ? 'text-good' : 'text-muted'}>{used}/{v}{cast.domain[L] ? ` +${dUsed}/1` : ''}</span>
              </button>
            )
          })}
        </nav>

        <section className="flex flex-col min-h-0">
          <h3 className="section-title mt-0 mb-2">{t('spells.grimoire')}</h3>
          <ul className="flex-1 overflow-y-auto list-none p-0 m-0 flex flex-col gap-1">
            {grimoire.filter(s => s.level === level).map(s => (
              <li key={s.id} className="flex items-center gap-2 rounded-sm border border-subtle px-2 py-1.5 bg-sunken" title={s.description ?? ''}>
                <EscolaIcon escola={s.school ?? 'Universal'} size={20} />
                <span className="flex-1 text-xs text-parchment truncate">{spellName(s.name)}</span>
                <Button size="sm" disabled={normalFull} onClick={() => add(s, false)} title={normalFull ? t('spells.slotsFull') : undefined}>+</Button>
                {cast.domain[level] > 0 && (
                  <Button size="sm" variant="subtle" disabled={domainFull} onClick={() => add(s, true)} title={t('spells.domainSlot')}>+ {t('spells.domain')}</Button>
                )}
              </li>
            ))}
            {grimoire.filter(s => s.level === level).length === 0 && <li className="text-dim text-xs">{t('common.empty')}</li>}
          </ul>
        </section>

        <section className="flex flex-col min-h-0">
          <h3 className="section-title mt-0 mb-2">{t('spells.prepared')}</h3>
          <ul className="flex-1 overflow-y-auto list-none p-0 m-0 flex flex-col gap-1">
            {draft.map((d, i) => d.level === level && (
              <li key={i}>
                <button type="button" onClick={() => removeAt(i)} title={t('common.delete')}
                  className="w-full flex items-center gap-2 rounded-sm border border-[var(--color-magic-border)] bg-[var(--color-magic-bg)] px-2 py-1.5 text-left cursor-pointer hover:border-bad">
                  <EscolaIcon escola={byId.get(d.spell_id)?.school ?? 'Universal'} size={20} />
                  <span className="flex-1 text-xs text-parchment truncate">{spellName(byId.get(d.spell_id)?.name ?? '?')}</span>
                  {d.is_domain ? <span className="text-[10px] text-gold">{t('spells.domain')}</span> : null}
                  <span className="text-dim text-xs">✕</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Modal>
  )
}
