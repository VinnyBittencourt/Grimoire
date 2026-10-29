import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { useRefData } from '../../queries/characters'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Checkbox } from '../../ui/fields'
import { Badge } from '../../ui/layout'
import { averageHp, ROMAN_NUMERALS as ROMAN } from './summonRules'


/**
 * Convocar Monstro N: criaturas da lista N (1 criatura) e das listas inferiores (várias, PHB p. 285).
 * Convocação Aprimorada (phb_augment_summoning): +4 For e +4 Con.
 */
export function SummonModal({ open, level, onClose, ch, actions, onSummoned }) {
  const { t } = useLang()
  const creatures = useRefData('ref_criaturas')
  const [smLevel, setSmLevel] = useState(level ?? 1)
  const [selected, setSelected] = useState(null)
  const hasAugment = ch.feats.some(f => f.ref_id === 'phb_augment_summoning')
  const [augment, setAugment] = useState(hasAugment)
  const [custom, setCustom] = useState({ name: '', hp: '' })
  const [lastLevel, setLastLevel] = useState(level)
  if (level !== lastLevel) { setLastLevel(level); setSmLevel(level ?? 1); setSelected(null) }

  const list = useMemo(() => (creatures.data ?? []).filter(c => c.nivel_sm > 0 && c.nivel_sm <= smLevel)
    .sort((a, b) => b.nivel_sm - a.nivel_sm || a.nome.localeCompare(b.nome)), [creatures.data, smLevel])
  const current = list.find(c => c.id === selected)

  async function summon(c) {
    const str = (c.for ?? 10) + (augment ? 4 : 0)
    const con = (c.con ?? 10) + (augment ? 4 : 0)
    const hp = averageHp(c.pv, con)
    const data = { ...c, for: str, con, augmented: augment }
    const row = await actions.create('summons', { name: c.nome, ref_creature_id: c.id, data: JSON.stringify(data), hp_current: hp, hp_max: hp, spell_level: smLevel })
    if (row) { onSummoned?.(row); onClose() }
  }

  async function summonCustom(e) {
    e.preventDefault()
    const hp = Math.max(1, parseInt(custom.hp, 10) || 1)
    if (!custom.name.trim()) return
    const row = await actions.create('summons', { name: custom.name.trim(), hp_current: hp, hp_max: hp, spell_level: smLevel, data: JSON.stringify({ nome: custom.name.trim() }) })
    if (row) { setCustom({ name: '', hp: '' }); onSummoned?.(row); onClose() }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('summons.summon')} width={900} closeOnBackdrop className="h-[80vh]">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex items-center gap-1 flex-wrap" role="tablist">
          {ROMAN.slice(1).map((r, i) => (
            <button key={r} type="button" role="tab" aria-selected={smLevel === i + 1} onClick={() => { setSmLevel(i + 1); setSelected(null) }}
              className={`px-2.5 py-1 rounded-sm border text-[11px] font-display cursor-pointer ${smLevel === i + 1 ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment'}`}>
              SM {r}
            </button>
          ))}
          <span className="flex-1" />
          <Checkbox checked={augment} onChange={setAugment} label={t('summons.augment')} />
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.2fr] gap-3">
          <ul className="overflow-y-auto list-none p-0 m-0 border border-subtle rounded-sm">
            {list.map(c => (
              <li key={c.id}>
                <button type="button" onClick={() => setSelected(c.id)} onDoubleClick={() => summon(c)}
                  className={`w-full flex items-center gap-2 text-left px-3 py-1.5 border-b border-subtle cursor-pointer ${selected === c.id ? 'bg-gold-faint' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}>
                  <span className="flex-1 text-sm text-parchment">{c.nome}</span>
                  <Badge tone={c.nivel_sm === smLevel ? 'magic' : 'gold'}>{c.nivel_sm === smLevel ? '1' : c.nivel_sm === smLevel - 1 ? '1d3' : '1d4+1'} · {ROMAN[c.nivel_sm]}</Badge>
                </button>
              </li>
            ))}
          </ul>
          <div className="overflow-y-auto border border-subtle rounded-sm p-4">
            {current ? (
              <div className="flex flex-col gap-2 text-xs">
                <h3 className="font-display text-gold text-lg m-0">{current.nome}</h3>
                <p className="text-dim m-0">{current.tamanho} · {current.tipo} · {current.alinhamento} · {current.livro}</p>
                <div className="grid grid-cols-3 gap-2 text-body">
                  <span>{t('vitals.hp')}: <b className="text-parchment">{averageHp(current.pv, (current.con ?? 10) + (augment ? 4 : 0))}</b> ({current.pv})</span>
                  <span>{t('vitals.ac')}: <b className="text-parchment">{current.ca}</b></span>
                </div>
                <div className="grid grid-cols-6 gap-1 text-center">
                  {[['str', current.for, augment ? 4 : 0], ['dex', current.des, 0], ['con', current.con, augment ? 4 : 0], ['int', current.int_val, 0], ['wis', current.sab, 0], ['cha', current.car, 0]].map(([k, v, plus]) => (
                    <div key={k} className="rounded-sm border border-subtle py-1">
                      <span className="label block">{t(`abilities.${k}`)}</span>
                      <span className={plus ? 'text-gold-hi' : 'text-parchment'}>{v == null ? '—' : v + plus}</span>
                    </div>
                  ))}
                </div>
                <p className="m-0"><span className="label">{t('summons.attack')}</span> <span className="text-body">{current.ataque}</span></p>
                {current.habilidades?.length > 0 && (
                  <ul className="m-0 pl-4 text-body list-disc">{current.habilidades.map(h => <li key={h}>{h}</li>)}</ul>
                )}
                <Button variant="gold" className="self-start mt-2" onClick={() => summon(current)}>{t('summons.summon')}</Button>
              </div>
            ) : (
              <form onSubmit={summonCustom} className="flex flex-col gap-2">
                <h4 className="section-title m-0">{t('summons.custom')}</h4>
                <input className="field" placeholder={t('common.name')} value={custom.name} onChange={e => setCustom({ ...custom, name: e.target.value })} />
                <input className="field" inputMode="numeric" placeholder={t('summons.hp')} value={custom.hp} onChange={e => setCustom({ ...custom, hp: e.target.value.replace(/\D/g, '') })} />
                <Button type="submit" className="self-start">{t('summons.summon')}</Button>
                <p className="text-dim text-[11px] m-0">{t('summons.pick')}</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
