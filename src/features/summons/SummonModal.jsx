import { useEffect, useMemo, useRef, useState } from 'react'
import { useLang } from '../../i18n'
import { useRefData } from '../../queries/characters'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Checkbox, NumberField } from '../../ui/fields'
import { Badge, EmptyState, Loading } from '../../ui/layout'
import { Notice } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/Toast'
import { averageHp, ROMAN_NUMERALS as ROMAN } from './summonRules'

/**
 * Convocar Monstro N: criaturas da lista N (1 criatura) e das listas inferiores (várias, PHB p. 285).
 * Convocação Aprimorada (phb_augment_summoning): +4 For e +4 Con.
 * maxLevel: vindo de uma magia preparada, as listas acima do nível dela ficam travadas.
 * A quantidade é escolhida pelo jogador (os dados de 1d3 / 1d4+1 são rolados na mesa, não aqui).
 */
export function SummonModal({ open, level, maxLevel, onClose, ch, actions, onSummoned }) {
  const { t } = useLang()
  const toast = useToast()
  const creatures = useRefData('ref_criaturas')
  const [smLevel, setSmLevel] = useState(level ?? 1)
  const [selected, setSelected] = useState(null)
  const hasAugment = ch.feats.some(f => f.ref_id === 'phb_augment_summoning')
  const [augment, setAugment] = useState(hasAugment)
  const [custom, setCustom] = useState({ name: '', hp: '' })
  const [qty, setQty] = useState(1)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const customName = useRef(null)
  useEffect(() => { if (selected === 'custom') customName.current?.focus() }, [selected])
  const [lastLevel, setLastLevel] = useState(level)
  if (level !== lastLevel) { setLastLevel(level); setSmLevel(level ?? 1); setSelected(null); setQty(1) }

  const list = useMemo(() => (creatures.data ?? []).filter(c => c.nivel_sm > 0 && c.nivel_sm <= smLevel)
    .filter(c => !query || c.nome.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.nivel_sm - a.nivel_sm || a.nome.localeCompare(b.nome)), [creatures.data, smLevel, query])
  const current = selected === 'custom' ? null : list.find(c => c.id === selected)
  const howMany = c => (c.nivel_sm === smLevel ? '1' : c.nivel_sm === smLevel - 1 ? '1d3' : '1d4+1')

  // Cria N linhas; marca a magia (onSummoned) uma vez só, se ao menos uma deu certo
  async function createMany(body, n, name) {
    setBusy(true)
    let ok = 0
    for (let i = 0; i < n; i++) if (await actions.create('summons', body)) ok++
    setBusy(false)
    if (!ok) return
    onSummoned?.()
    toast.success(ok === n ? t('summons.summoned', { n: ok, name }) : t('summons.partial', { ok, n }))
    onClose()
  }

  function summon(c) {
    const str = (c.for ?? 10) + (augment ? 4 : 0)
    const con = (c.con ?? 10) + (augment ? 4 : 0)
    const hp = averageHp(c.pv, con)
    const data = { ...c, for: str, con, augmented: augment }
    createMany({ name: c.nome, ref_creature_id: c.id, data: JSON.stringify(data), hp_current: hp, hp_max: hp, spell_level: smLevel }, qty, c.nome)
  }

  function summonCustom(e) {
    e.preventDefault()
    const name = custom.name.trim()
    if (!name) return
    const hp = Math.max(1, parseInt(custom.hp, 10) || 1)
    createMany({ name, hp_current: hp, hp_max: hp, spell_level: smLevel, data: JSON.stringify({ nome: name }) }, qty, name)
    setCustom({ name: '', hp: '' })
  }

  const title = maxLevel ? t('summons.fromSpell', { name: t('summons.smLevel', { n: ROMAN[maxLevel] }) }) : t('summons.summon')

  return (
    <Modal open={open} onClose={onClose} title={title} width={920} className="h-[82vh]">
      <div className="flex flex-col gap-3 h-full min-h-0">
        <div className="flex items-center gap-1 flex-wrap" role="tablist" aria-label={t('summons.lists')}>
          {ROMAN.slice(1).map((r, i) => {
            const n = i + 1
            const locked = maxLevel != null && n > maxLevel
            return (
              <button key={r} type="button" role="tab" aria-selected={smLevel === n} disabled={locked}
                title={locked ? t('summons.lockedLevel', { n: ROMAN[maxLevel] }) : undefined}
                onClick={() => { setSmLevel(n); setSelected(null) }}
                className={`min-h-7 px-2.5 rounded-sm border text-xs font-display cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${smLevel === n ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment'}`}>
                {t('summons.smShort', { r })}
              </button>
            )
          })}
          <span className="flex-1" />
          <Checkbox checked={augment} onChange={setAugment} label={t('summons.augment')} />
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.25fr] gap-3">
          <div className="flex flex-col min-h-0 border border-subtle rounded-sm">
            <div className="p-2 border-b border-subtle">
              <input className="field field-sm" placeholder={t('summons.search')} aria-label={t('summons.search')} value={query} onChange={e => setQuery(e.target.value)} />
            </div>
            <ul className="flex-1 overflow-y-auto list-none p-0 m-0">
              <li>
                <button type="button" onClick={() => setSelected('custom')} aria-current={selected === 'custom'}
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 border-b border-subtle cursor-pointer ${selected === 'custom' ? 'bg-gold-faint' : 'row-hover'}`}>
                  <Icon name="plus" size={14} className="text-gold" /><span className="text-sm text-gold">{t('summons.custom')}</span>
                </button>
              </li>
              {creatures.isLoading && <li><Loading label={t('common.loading')} /></li>}
              {creatures.error && (
                <li><EmptyState title={t('summons.loadError')} action={<Button size="sm" onClick={() => creatures.refetch()}>{t('common.retry')}</Button>} /></li>
              )}
              {list.map(c => (
                <li key={c.id}>
                  <button type="button" onClick={() => setSelected(c.id)} aria-current={selected === c.id}
                    className={`w-full flex items-center gap-2 text-left px-3 py-1.5 border-b border-subtle cursor-pointer ${selected === c.id ? 'bg-gold-faint' : 'row-hover'}`}>
                    <span className="flex-1 text-sm text-parchment">{c.nome}</span>
                    <Badge tone={c.nivel_sm === smLevel ? 'magic' : 'gold'} title={t('summons.howManyHint')}>{howMany(c)} · {ROMAN[c.nivel_sm]}</Badge>
                  </button>
                </li>
              ))}
              {creatures.data && list.length === 0 && <li><EmptyState title={query ? t('common.notFound', { q: query }) : t('summons.emptyList')} /></li>}
            </ul>
          </div>
          <div className="overflow-y-auto border border-subtle rounded-sm p-4">
            {current ? (
              <div className="flex flex-col gap-2.5 text-sm">
                <div>
                  <h3 className="font-display text-gold text-lg m-0">{current.nome}</h3>
                  <p className="caption m-0">{[current.tamanho, current.tipo, current.alinhamento, current.livro].filter(Boolean).join(' · ')}</p>
                </div>
                {current.fonte?.verificado
                  ? <Notice tone="success" compact>{t('summons.verified')}</Notice>
                  : <Notice tone="warn" compact>{t('summons.unverified')}</Notice>}
                <div className="flex gap-6 text-body">
                  <span>{t('vitals.hp')} <b className="text-parchment font-display">{averageHp(current.pv, (current.con ?? 10) + (augment ? 4 : 0))}</b> <span className="caption">({current.pv})</span></span>
                  <span>{t('vitals.ac')} <b className="text-parchment font-display">{current.ca}</b></span>
                </div>
                <div className="grid grid-cols-6 gap-1 text-center">
                  {[['str', current.for, augment ? 4 : 0], ['dex', current.des, 0], ['con', current.con, augment ? 4 : 0], ['int', current.int_val, 0], ['wis', current.sab, 0], ['cha', current.car, 0]].map(([k, v, plus]) => (
                    <div key={k} className="rounded-sm border border-subtle py-1">
                      <span className="label block">{t(`abilities.${k}`)}</span>
                      <span className={`font-display ${plus ? 'text-gold-hi' : 'text-parchment'}`}>{v == null ? '—' : v + plus}</span>
                    </div>
                  ))}
                </div>
                <p className="m-0"><span className="label">{t('summons.attack')}</span> <span className="text-body">{current.ataque}</span></p>
                {current.habilidades?.length > 0 && (
                  <ul className="m-0 pl-4 text-body list-disc text-xs">{current.habilidades.map(h => <li key={h}>{h}</li>)}</ul>
                )}
                <div className="flex items-end gap-3 mt-2 pt-3 border-t border-subtle">
                  <NumberField label={t('summons.quantity')} value={qty} min={1} max={10} onCommit={setQty} stepper compact hint={t('summons.quantityHint', { n: howMany(current) })} />
                  <Button variant="gold" disabled={busy} onClick={() => summon(current)}><Icon name="paw" size={15} />{t('summons.summonN', { n: qty })}</Button>
                </div>
              </div>
            ) : selected === 'custom' ? (
              <form onSubmit={summonCustom} className="flex flex-col gap-3">
                <h4 className="section-title m-0">{t('summons.custom')}</h4>
                <label><span className="label block mb-1">{t('common.name')}</span>
                  <input className="field" value={custom.name} onChange={e => setCustom({ ...custom, name: e.target.value })} ref={customName} /></label>
                <label><span className="label block mb-1">{t('summons.hp')}</span>
                  <input className="field w-28" inputMode="numeric" value={custom.hp} onChange={e => setCustom({ ...custom, hp: e.target.value.replace(/\D/g, '') })} /></label>
                <div className="flex items-end gap-3">
                  <NumberField label={t('summons.quantity')} value={qty} min={1} max={10} onCommit={setQty} stepper compact />
                  <Button type="submit" variant="gold" disabled={busy}><Icon name="paw" size={15} />{t('summons.summonN', { n: qty })}</Button>
                </div>
              </form>
            ) : (
              <EmptyState icon="paw" title={t('summons.pick')} hint={t('summons.pickHint')} />
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
