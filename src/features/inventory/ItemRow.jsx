import { useLang } from '../../i18n'
import { NumberField, TextField, SelectField } from '../../ui/fields'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { IconButton } from '../../ui/Button'
import { EQUIPMENT_SLOTS, AC_TYPES, ITEM_ICONS } from '../../../shared/constants/equipment.js'

// Linha de item (mochila ou equipado) com edição expandida: local, CA, penalidades, peso
export function ItemRow({ item, actions, open, onToggle }) {
  const { t, weight, metric, toDisplayWeight, fromDisplayWeight } = useLang()
  const set = values => actions.update('items', item.id, values)
  const locationOptions = [{ value: 'backpack', label: t('inventory.backpack') }, ...EQUIPMENT_SLOTS.map(s => ({ value: s, label: t(`inventory.slots.${s}`) }))]

  return (
    <li className="rounded-sm border border-subtle bg-sunken">
      <div className="flex items-center gap-2 px-2 py-1.5">
        <span className="w-6 text-center" aria-hidden>{item.icon ?? '🎒'}</span>
        <button type="button" onClick={onToggle} aria-expanded={open} className="flex-1 min-w-0 text-left cursor-pointer">
          <span className="text-xs text-parchment truncate block">{item.name || '—'}</span>
          {item.notes && !open && <span className="text-[10px] text-dim truncate block">{item.notes}</span>}
        </button>
        <span className="text-muted text-[11px] w-10 text-right">×{item.qty}</span>
        <span className="text-muted text-[11px] w-16 text-right">{weight(item.weight_lb * item.qty)}</span>
        <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad px-1 text-xs" onConfirm={() => actions.remove('items', item.id)}>✕</ConfirmButton>
      </div>
      {open && (
        <div className="grid grid-cols-6 gap-2 px-2 pb-2 pt-2 border-t border-subtle">
          <TextField className="col-span-3" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} />
          <SelectField className="col-span-2" label={t('inventory.equip')} value={item.location} options={locationOptions} onCommit={v => set({ location: v ?? 'backpack' })} />
          <SelectField label="🙂" value={item.icon} placeholder="—" options={ITEM_ICONS.map(i => ({ value: i, label: i }))} onCommit={v => set({ icon: v })} />
          <NumberField label={t('inventory.qty')} value={item.qty} min={0} step={0.5} onCommit={v => set({ qty: v })} />
          <NumberField label={`${t('inventory.weight')} (${t('units.weight')})`} value={toDisplayWeight(item.weight_lb)} min={0} step={0.05}
            onCommit={v => set({ weight_lb: fromDisplayWeight(v) })} title={metric ? `${item.weight_lb} lb` : undefined} />
          <NumberField label={t('inventory.cost')} value={item.cost_gp} nullable min={0} step={0.01} onCommit={v => set({ cost_gp: v })} />
          <SelectField label={t('inventory.acType')} value={item.ac_type} placeholder="—" options={AC_TYPES.map(a => ({ value: a, label: t(`inventory.acTypes.${a}`) }))}
            onCommit={v => set({ ac_type: v })} />
          <NumberField label={t('inventory.acBonus')} value={item.ac_bonus} nullable onCommit={v => set({ ac_bonus: v })} />
          <NumberField label={t('inventory.maxDex')} value={item.max_dex} nullable min={0} onCommit={v => set({ max_dex: v })} />
          <NumberField label={t('inventory.acp')} value={item.acp} nullable min={0} max={20} onCommit={v => set({ acp: v })} />
          <NumberField label={t('inventory.spellFailure')} value={item.spell_failure} nullable min={0} max={100} onCommit={v => set({ spell_failure: v })} />
          <TextField className="col-span-4" label={t('common.notes')} value={item.notes} onCommit={v => set({ notes: v })} />
          <div className="flex items-end justify-end"><IconButton label={t('common.close')} onClick={onToggle}>▴</IconButton></div>
        </div>
      )}
    </li>
  )
}
