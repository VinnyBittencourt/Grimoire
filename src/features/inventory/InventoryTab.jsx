import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState } from '../../ui/layout'
import { NumberField } from '../../ui/fields'
import { QuickAdd, QuickAmount } from '../../ui/controls'
import { Icon } from '../../ui/Icon'
import { Notice } from '../../ui/Popover'
import { useToast } from '../../ui/Toast'
import { EquipSlotIcon } from '../../assets/icons/equipmentIcons'
import { EQUIPMENT_SLOTS, SLOT_ICON } from '../../../shared/constants/equipment.js'
import { ItemRow } from './ItemRow'

const COINS = ['cp', 'sp', 'gp', 'pp']
const LOAD_COLOR = { light: 'var(--color-success)', medium: 'var(--color-warning)', heavy: 'var(--color-hp)', over: 'var(--color-danger-light)' }

export default function InventoryTab({ ch, sheet, actions }) {
  const { t, weight, signed, distance } = useLang()
  const toast = useToast()
  const [open, setOpen] = useState(null)
  const [adding, setAdding] = useState(null) // slot com criação aberta
  const [coin, setCoin] = useState('gp')
  const [query, setQuery] = useState('')
  // Local desconhecido (dado antigo) aparece na mochila, nunca some da tela
  const backpack = ch.items.filter(i => !EQUIPMENT_SLOTS.includes(i.location))
  const shown = backpack.filter(i => !query || `${i.name} ${i.notes ?? ''}`.toLowerCase().includes(query.toLowerCase()))
  const equipped = slot => ch.items.filter(i => i.location === slot)
  const { load } = sheet
  const pct = Math.min(100, (load.weight / Math.max(1, load.heavy)) * 100)
  const openItem = ch.items.find(i => i.id === open && EQUIPMENT_SLOTS.includes(i.location))

  async function addItem(name, { qty = 1 } = {}, location = 'backpack') {
    const row = await actions.create('items', { name, qty, location })
    if (row && location !== 'backpack') { setOpen(row.id); setAdding(null) }
    return row
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr] items-start">
      <div className="flex flex-col gap-4">
        <Section title={t('inventory.equipped')}>
          <div className="grid grid-cols-3 gap-2">
            {EQUIPMENT_SLOTS.map(slot => {
              const items = equipped(slot)
              const active = items.some(it => it.id === open)
              return (
                <div key={slot} className={`rounded-sm border px-2 py-1.5 min-h-16 flex flex-col gap-1 ${active ? 'border-gold bg-gold-faint' : items.length ? 'border-wood bg-sunken' : 'border-subtle border-dashed'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-80"><EquipSlotIcon slot={SLOT_ICON[slot]} size={18} /></span>
                    <span className="text-2xs uppercase tracking-[var(--tracking-label)] text-gold truncate">{t(`inventory.slots.${slot}`)}</span>
                  </div>
                  {items.map(it => (
                    <button key={it.id} type="button" onClick={() => setOpen(open === it.id ? null : it.id)} aria-expanded={open === it.id}
                      className="text-left text-sm text-parchment truncate cursor-pointer hover:text-gold">
                      {it.name}{it.ac_bonus ? <span className="text-[var(--color-ac)]"> {signed(it.ac_bonus)}</span> : null}
                    </button>
                  ))}
                  {!items.length && (adding === slot
                    ? <QuickAdd collapsed defaultOpen compact placeholder={t('inventory.itemNameEnter')} onCancel={() => setAdding(null)} onSubmit={(name, extra) => addItem(name, extra, slot)} />
                    : (
                      <button type="button" className="inline-flex items-center gap-1 text-muted text-xs text-left cursor-pointer hover:text-gold" onClick={() => setAdding(slot)}>
                        <Icon name="plus" size={12} />{t('inventory.emptySlot')}
                      </button>
                    ))}
                </div>
              )
            })}
          </div>
          {openItem && (
            <ul className="list-none p-0 mt-3 mb-0">
              <ItemRow item={openItem} actions={actions} open onToggle={() => setOpen(null)} />
            </ul>
          )}
        </Section>

        <Section title={t('inventory.coins')}>
          <div className="grid grid-cols-4 gap-2">
            {COINS.map(c => (
              <NumberField key={c} label={t(`inventory.coinNames.${c}`)} title={t(`inventory.coinTitles.${c}`)} value={ch[c]} min={0}
                inputClassName="text-center font-display" onCommit={v => actions.patchCharacter({ [c]: v })} />
            ))}
          </div>
          <QuickAmount className="mt-3" ariaLabel={t('inventory.coinAmount')}
            extra={
              <select className="field field-sm w-20" value={coin} onChange={e => setCoin(e.target.value)} aria-label={t('inventory.coinKind')}>
                {COINS.map(c => <option key={c} value={c}>{t(`inventory.coinNames.${c}`)}</option>)}
              </select>
            }
            onApply={async (kind, n) => {
              const current = Number(ch[coin]) || 0
              if (kind === 'spend' && n > current) { toast.error(t('inventory.notEnough', { n: current, coin: t(`inventory.coinNames.${coin}`) })); return }
              const next = kind === 'spend' ? current - n : current + n
              if (await actions.patchCharacter({ [coin]: next })) {
                toast.info(t(kind === 'spend' ? 'inventory.spent' : 'inventory.received', { n, coin: t(`inventory.coinNames.${coin}`) }),
                  { undo: () => actions.patchCharacter({ [coin]: current }) })
              }
            }}
            actions={[{ id: 'receive', label: t('inventory.receive'), icon: 'plus', tone: 'success' }, { id: 'spend', label: t('inventory.spend'), icon: 'minus', tone: 'danger' }]} />
          <p className="caption mt-1.5 mb-0">{t('inventory.coinsHint')}</p>
        </Section>

        <Section title={t('inventory.load')}>
          <div className="flex items-baseline justify-between text-sm mb-1.5">
            <span className="font-display" style={{ color: LOAD_COLOR[load.status] }}>{t(`inventory.${load.status}`)}</span>
            <span className="text-body tabular-nums">{t('inventory.loadOf', { w: weight(load.weight), max: weight(load.heavy) })}</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-sunken border border-subtle overflow-hidden" role="meter" aria-label={t('inventory.load')}
            aria-valuemin={0} aria-valuemax={load.heavy} aria-valuenow={load.weight} aria-valuetext={t(`inventory.${load.status}`)}>
            <div className="h-full transition-all" style={{ width: `${pct}%`, background: LOAD_COLOR[load.status] }} />
            {[load.light, load.medium].map(m => (
              <span key={m} className="absolute top-0 bottom-0 w-px bg-[var(--color-wood-border)]" style={{ left: `${(m / Math.max(1, load.heavy)) * 100}%` }} />
            ))}
          </div>
          <div className="flex justify-between caption mt-1.5">
            <span>{t('inventory.light')} ≤ {weight(load.light)}</span>
            <span>{t('inventory.medium')} ≤ {weight(load.medium)}</span>
            <span>{t('inventory.heavy')} ≤ {weight(load.heavy)}</span>
          </div>
          {load.effects && (
            <Notice tone="warn" compact className="mt-2">
              {t('inventory.loadEffects', { dex: load.effects.maxDex, acp: load.effects.acp, speed: distance(sheet.speed.current) })}
              {sheet.speed.current === sheet.speed.base && load.status !== 'over' && <span className="block">{t('inventory.dwarfSpeed')}</span>}
            </Notice>
          )}
          <p className="caption mt-1 mb-0">{t('inventory.loadHint')}</p>
        </Section>
      </div>

      <Section title={t('inventory.backpack')} subtitle={backpack.length ? weight(backpack.reduce((a, i) => a + (Number(i.weight_lb) || 0) * (Number(i.qty) || 0), 0)) : null}>
        <QuickAdd withQty placeholder={t('inventory.itemNamePlaceholder')} onSubmit={(name, extra) => addItem(name, extra)} className="mb-3" />
        {backpack.length > 6 && (
          <label className="relative block mb-2">
            <Icon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input className="field field-sm pl-7" placeholder={t('inventory.search')} aria-label={t('inventory.search')} value={query} onChange={e => setQuery(e.target.value)} />
          </label>
        )}
        {backpack.length === 0 && <EmptyState icon="backpack" title={t('inventory.empty')} hint={t('inventory.emptyHint')} className="py-6" />}
        {backpack.length > 0 && shown.length === 0 && <EmptyState title={t('common.notFound', { q: query })} className="py-4" />}
        <ul className="flex flex-col gap-1 list-none p-0 m-0">
          {shown.map(it => <ItemRow key={it.id} item={it} actions={actions} open={open === it.id} onToggle={() => setOpen(open === it.id ? null : it.id)} />)}
        </ul>
      </Section>
    </div>
  )
}
