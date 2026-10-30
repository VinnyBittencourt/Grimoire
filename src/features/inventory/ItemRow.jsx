import { useLang } from '../../i18n'
import { NumberField, TextField, SelectField } from '../../ui/fields'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { Button, IconButton } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { EQUIPMENT_SLOTS, AC_TYPES, ITEM_ICONS } from '../../../shared/constants/equipment.js'

const PROTECTION_SLOTS = new Set(['armor', 'offhand'])

// Linha de item (mochila ou equipado) com edição expandida: local, peso, custo e, recolhido, proteção (CA)
export function ItemRow({ item, actions, open, onToggle }) {
  const { t, weight, metric, signed, toDisplayWeight, fromDisplayWeight } = useLang()
  const set = values => actions.update('items', item.id, values)
  const locationOptions = [{ value: 'backpack', label: t('inventory.backpack') }, ...EQUIPMENT_SLOTS.map(s => ({ value: s, label: t(`inventory.slots.${s}`) }))]
  const hasProtection = item.ac_type || item.ac_bonus || item.max_dex != null || item.acp || item.spell_failure || PROTECTION_SLOTS.has(item.location)
  const equippedHere = item.location !== 'backpack'

  return (
    <li className={`rounded-sm border bg-sunken ${open ? 'border-gold-lo' : 'border-subtle'}`}>
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className="w-6 text-center shrink-0" aria-hidden>{item.icon ?? <Icon name="backpack" size={15} className="text-gold-lo inline" />}</span>
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex-1 min-w-0 text-left cursor-pointer group">
          <span className="text-sm text-parchment truncate block group-hover:text-gold">{item.name || '—'}
            {item.ac_bonus ? <span className="text-[var(--color-ac)] text-xs"> · {t('vitals.ac')} {signed(item.ac_bonus)}</span> : null}</span>
          {item.notes && !open && <span className="caption truncate block">{item.notes}</span>}
        </button>
        <span className="text-muted text-sm w-10 text-right tabular-nums">×{item.qty}</span>
        <span className="text-muted text-sm w-16 text-right tabular-nums">{weight(item.weight_lb * item.qty)}</span>
        <IconButton size="sm" label={open ? t('common.close') : t('common.edit')} aria-expanded={open} onClick={onToggle}>
          <Icon name={open ? 'chevronUp' : 'chevronDown'} size={14} />
        </IconButton>
        <ConfirmButton icon label={t('common.delete')} onConfirm={() => actions.removeUndoable('items', item, t('common.removed', { name: item.name }))} />
      </div>
      {open && (
        <div className="flex flex-col gap-3 px-2 pb-3 pt-2 border-t border-subtle">
          <div className="grid grid-cols-6 gap-2 items-end">
            <TextField className="col-span-3" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} />
            <SelectField className="col-span-2" label={t('inventory.location')} value={item.location} options={locationOptions} onCommit={v => set({ location: v ?? 'backpack' })} />
            <SelectField label={t('inventory.icon')} value={item.icon} placeholder="—" options={ITEM_ICONS.map(i => ({ value: i, label: i }))} onCommit={v => set({ icon: v })} />
            <NumberField label={t('inventory.qty')} value={item.qty} min={0} step={0.5} onCommit={v => set({ qty: v })} />
            <NumberField label={t('inventory.weightEach')} value={toDisplayWeight(item.weight_lb)} min={0} step={0.05} suffix={t('units.weight')}
              onCommit={v => set({ weight_lb: fromDisplayWeight(v) })} hint={metric && item.weight_lb ? `${item.weight_lb} lb` : undefined} />
            <NumberField label={t('inventory.cost')} value={item.cost_gp} nullable min={0} step={0.01} onCommit={v => set({ cost_gp: v })} />
            {equippedHere && (
              <div className="col-span-3 flex justify-end">
                <Button size="sm" onClick={() => set({ location: 'backpack' })}><Icon name="backpack" size={14} />{t('inventory.unequip')}</Button>
              </div>
            )}
          </div>
          <details open={Boolean(hasProtection)} className="group rounded-sm border border-subtle">
            <summary className="flex items-center gap-2 px-2 py-1.5 cursor-pointer list-none select-none text-sm text-gold [&::-webkit-details-marker]:hidden">
              <Icon name="chevronRight" size={13} className="transition-transform group-open:rotate-90" /><Icon name="shield" size={14} />{t('inventory.protection')}
            </summary>
            <div className="grid grid-cols-5 gap-2 px-2 pb-2">
              <SelectField label={t('inventory.acType')} value={item.ac_type} placeholder="—" options={AC_TYPES.map(a => ({ value: a, label: t(`inventory.acTypes.${a}`) }))}
                onCommit={v => set({ ac_type: v })} />
              <NumberField label={t('inventory.acBonus')} value={item.ac_bonus} nullable onCommit={v => set({ ac_bonus: v })} />
              <NumberField label={t('inventory.maxDex')} value={item.max_dex} nullable min={0} onCommit={v => set({ max_dex: v })} />
              <NumberField label={t('inventory.acp')} value={item.acp} nullable min={0} max={20} onCommit={v => set({ acp: v })} />
              <NumberField label={t('inventory.spellFailure')} value={item.spell_failure} nullable min={0} max={100} onCommit={v => set({ spell_failure: v })} />
              <p className="col-span-5 caption m-0">{t('inventory.protectionHint')}</p>
            </div>
          </details>
          <TextField label={t('common.notes')} value={item.notes} onCommit={v => set({ notes: v })} />
        </div>
      )}
    </li>
  )
}
