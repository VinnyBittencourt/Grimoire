import { useState } from 'react'
import { useLang } from '../../i18n'
import { Section, EmptyState } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { NumberField } from '../../ui/fields'
import { EquipSlotIcon } from '../../assets/icons/equipmentIcons'
import { EQUIPMENT_SLOTS, SLOT_ICON } from '../../../shared/constants/equipment.js'
import { ItemRow } from './ItemRow'

const COINS = ['cp', 'sp', 'gp', 'pp']
const LOAD_COLOR = { light: 'var(--color-success)', medium: 'var(--color-warning)', heavy: 'var(--color-hp)', over: 'var(--color-danger-light)' }

export default function InventoryTab({ ch, sheet, actions }) {
  const { t, weight } = useLang()
  const [open, setOpen] = useState(null)
  const backpack = ch.items.filter(i => i.location === 'backpack')
  const equipped = slot => ch.items.filter(i => i.location === slot)
  const { load } = sheet
  const pct = Math.min(100, (load.weight / Math.max(1, load.heavy)) * 100)

  async function addItem(location = 'backpack') {
    const row = await actions.create('items', { name: t('inventory.addItem').replace('+ ', ''), location, icon: '🎒' })
    if (row) setOpen(row.id)
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.3fr] items-start">
      <div className="flex flex-col gap-4">
        <Section title={t('inventory.equipped')}>
          <div className="grid grid-cols-3 gap-2">
            {EQUIPMENT_SLOTS.map(slot => {
              const items = equipped(slot)
              return (
                <div key={slot} className={`rounded-sm border px-2 py-1.5 min-h-16 flex flex-col gap-1 ${items.length ? 'border-wood bg-sunken' : 'border-subtle border-dashed'}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="opacity-80"><EquipSlotIcon slot={SLOT_ICON[slot]} size={18} /></span>
                    <span className="label !text-[9px]">{t(`inventory.slots.${slot}`)}</span>
                  </div>
                  {items.map(it => (
                    <button key={it.id} type="button" onClick={() => setOpen(open === it.id ? null : it.id)}
                      className="text-left text-xs text-parchment truncate cursor-pointer hover:text-gold">
                      {it.icon} {it.name}{it.ac_bonus ? <span className="text-[var(--color-ac)]"> +{it.ac_bonus}</span> : null}
                    </button>
                  ))}
                  {!items.length && (
                    <button type="button" className="text-dim text-[10px] text-left cursor-pointer hover:text-gold" onClick={() => addItem(slot)}>
                      + {t('inventory.emptySlot')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          {ch.items.some(i => i.location !== 'backpack' && open === i.id) && (
            <ul className="list-none p-0 mt-3 mb-0">
              {ch.items.filter(i => i.id === open).map(it => <ItemRow key={it.id} item={it} actions={actions} open onToggle={() => setOpen(null)} />)}
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
        </Section>

        <Section title={t('inventory.load')}>
          <div className="flex items-baseline justify-between text-xs mb-1">
            <span className="font-display" style={{ color: LOAD_COLOR[load.status] }}>{t(`inventory.${load.status}`)}</span>
            <span className="text-body">{t('inventory.loadOf', { w: weight(load.weight), max: weight(load.heavy) })}</span>
          </div>
          <div className="relative h-2.5 rounded-full bg-sunken border border-subtle overflow-hidden" aria-hidden>
            <div className="h-full transition-all" style={{ width: `${pct}%`, background: LOAD_COLOR[load.status] }} />
            {[load.light, load.medium].map(m => (
              <span key={m} className="absolute top-0 bottom-0 w-px bg-[var(--color-wood-border)]" style={{ left: `${(m / Math.max(1, load.heavy)) * 100}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-dim mt-1">
            <span>{t('inventory.light')} ≤ {weight(load.light)}</span>
            <span>{t('inventory.medium')} ≤ {weight(load.medium)}</span>
            <span>{t('inventory.heavy')} ≤ {weight(load.heavy)}</span>
          </div>
        </Section>
      </div>

      <Section title={t('inventory.backpack')} actions={<Button size="sm" onClick={() => addItem()}>{t('inventory.addItem')}</Button>}>
        {backpack.length === 0 && <EmptyState title={t('inventory.empty')} className="py-6" />}
        <ul className="flex flex-col gap-1 list-none p-0 m-0">
          {backpack.map(it => <ItemRow key={it.id} item={it} actions={actions} open={open === it.id} onToggle={() => setOpen(open === it.id ? null : it.id)} />)}
        </ul>
      </Section>
    </div>
  )
}
