import { useRef } from 'react'
import { useLang } from '../../i18n'
import { photoUrl } from '../../api/client'
import { TextField, SelectField } from '../../ui/fields'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { Icon } from '../../ui/Icon'

function DeleteBar({ onDelete }) {
  const { t } = useLang()
  return (
    <div className="flex justify-end mt-2 pt-3 border-t border-subtle">
      <ConfirmButton label={t('common.delete')} className="min-h-7 border border-transparent hover:border-[var(--color-hp-border)]" onConfirm={onDelete}>
        <Icon name="trash" size={14} />{t('common.delete')}
      </ConfirmButton>
    </div>
  )
}

// Chips que levam a outro item do diário (troca a sub-aba e seleciona)
function Links({ label, items, onOpen, icon }) {
  if (!items.length) return null
  return (
    <div>
      <span className="label block mb-1">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {items.map(it => (
          <button key={it.id} type="button" onClick={() => onOpen(it.id)}
            className="inline-flex items-center gap-1 min-h-7 px-2 rounded-sm border border-wood text-sm text-parchment hover:border-gold hover:text-gold cursor-pointer">
            <Icon name={icon} size={13} className="text-gold-lo" />{it.name || '—'}<Icon name="chevronRight" size={12} className="text-muted" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function PlayerDetail({ item, actions, onDelete, autoFocusName }) {
  const { t } = useLang()
  const set = v => actions.update('players', item.id, v)
  return (
    <div className="grid grid-cols-2 gap-3">
      <TextField className="col-span-2" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} autoFocus={autoFocusName} inputClassName="font-display text-base" />
      <TextField label={t('journal.class')} value={item.class} onCommit={v => set({ class: v })} />
      <TextField label={t('journal.race')} value={item.race} onCommit={v => set({ race: v })} />
      <TextField className="col-span-2" label={t('common.notes')} value={item.notes} multiline rows={8} onCommit={v => set({ notes: v })} />
      <div className="col-span-2"><DeleteBar onDelete={onDelete} /></div>
    </div>
  )
}

export function NpcDetail({ item, data, actions, onDelete, onNavigate, autoFocusName }) {
  const { t } = useLang()
  const fileRef = useRef(null)
  const set = v => actions.update('npcs', item.id, v)
  const quests = data.quests.filter(q => (q.npc_ids ?? []).includes(item.id))
  return (
    <div className="grid grid-cols-[170px_1fr] gap-4">
      <div className="flex flex-col gap-1.5">
        <button type="button" onClick={() => fileRef.current.click()} aria-label={item.photo ? t('journal.changePhoto') : t('journal.addPhoto')}
          className="group relative w-[170px] h-56 rounded-sm border border-wood bg-sunken overflow-hidden flex items-center justify-center cursor-pointer hover:border-gold">
          {item.photo
            ? <img src={photoUrl(item.photo)} alt={item.name} className="w-full h-full object-cover object-top" />
            : <span className="flex flex-col items-center gap-2 text-gold-lo group-hover:text-gold"><Icon name="user" size={44} strokeWidth={1.25} /><span className="text-xs">{t('journal.addPhoto')}</span></span>}
          {item.photo && (
            <span className="absolute inset-x-0 bottom-0 py-1 flex items-center justify-center gap-1 text-xs text-parchment bg-scrim">
              <Icon name="camera" size={13} />{t('journal.changePhoto')}
            </span>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" tabIndex={-1} aria-hidden
          onChange={e => { const f = e.target.files?.[0]; if (f) actions.uploadPhoto(f, item.id); e.target.value = '' }} />
      </div>
      <div className="grid grid-cols-2 gap-3 content-start">
        <TextField className="col-span-2" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} autoFocus={autoFocusName} inputClassName="font-display text-base" />
        <TextField label={t('journal.occupation')} value={item.occupation} onCommit={v => set({ occupation: v })} />
        <SelectField label={t('journal.gender')} value={item.gender} placeholder="—"
          options={['male', 'female', 'other'].map(g => ({ value: g, label: t(`genders.${g}`) }))} onCommit={v => set({ gender: v })} />
        <div className="col-span-2"><Links label={t('journal.quests')} items={quests} icon="flag" onOpen={id => onNavigate('quests', id)} /></div>
      </div>
      <TextField className="col-span-2" label={t('common.notes')} value={item.notes} multiline rows={10} onCommit={v => set({ notes: v })} />
      <div className="col-span-2"><DeleteBar onDelete={onDelete} /></div>
    </div>
  )
}

export function PlaceDetail({ item, data, actions, onDelete, onNavigate, autoFocusName }) {
  const { t } = useLang()
  const set = v => actions.update('places', item.id, v)
  const quests = data.quests.filter(q => q.place_id === item.id)
  return (
    <div className="flex flex-col gap-3">
      <TextField label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} autoFocus={autoFocusName} inputClassName="font-display text-base" />
      <Links label={t('journal.quests')} items={quests} icon="flag" onOpen={id => onNavigate('quests', id)} />
      <TextField label={t('common.notes')} value={item.notes} multiline rows={12} onCommit={v => set({ notes: v })} />
      <DeleteBar onDelete={onDelete} />
    </div>
  )
}

export function QuestDetail({ item, data, actions, onDelete, onNavigate, autoFocusName }) {
  const { t } = useLang()
  const set = v => actions.update('quests', item.id, v)
  const linked = new Set(item.npc_ids ?? [])
  const place = data.places.find(p => p.id === item.place_id)
  return (
    <div className="grid grid-cols-3 gap-3">
      <TextField className="col-span-3" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} autoFocus={autoFocusName} inputClassName="font-display text-base" />
      <SelectField label={t('journal.kind')} value={item.kind} options={['main', 'side'].map(k => ({ value: k, label: t(`journal.${k}`) }))} onCommit={v => set({ kind: v ?? 'side' })} />
      <SelectField label={t('journal.status')} value={item.status} options={['open', 'done', 'failed'].map(k => ({ value: k, label: t(`journal.${k}`) }))} onCommit={v => set({ status: v ?? 'open' })} />
      <div className="flex items-end gap-1">
        <SelectField className="flex-1" label={t('journal.place')} value={item.place_id == null ? '' : String(item.place_id)} placeholder="—"
          options={data.places.map(p => ({ value: String(p.id), label: p.name }))} onCommit={v => set({ place_id: v == null ? null : Number(v) })} />
        {place && (
          <button type="button" onClick={() => onNavigate('places', place.id)} aria-label={t('journal.openPlace', { name: place.name })}
            className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-wood text-gold hover:border-gold cursor-pointer"><Icon name="map" size={15} /></button>
        )}
      </div>
      <TextField className="col-span-3" label={t('journal.reward')} value={item.reward} onCommit={v => set({ reward: v })} />
      <div className="col-span-3">
        <span className="label block mb-1">{t('journal.linkedNpcs')}</span>
        <p className="caption m-0 mb-1.5">{t('journal.linkedNpcsHint')}</p>
        <div className="flex flex-wrap gap-1.5">
          {data.npcs.map(n => {
            const on = linked.has(n.id)
            return (
              <button key={n.id} type="button" aria-pressed={on}
                onClick={() => set({ npc_ids: on ? [...linked].filter(x => x !== n.id) : [...linked, n.id] })}
                className={`inline-flex items-center gap-1 min-h-7 px-2 rounded-sm border text-sm cursor-pointer ${on ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment'}`}>
                {on && <Icon name="check" size={13} />}{n.name || '—'}
              </button>
            )
          })}
          {data.npcs.length === 0 && <span className="caption">{t('journal.noNpcsYet')}</span>}
        </div>
      </div>
      <TextField className="col-span-3" label={t('common.notes')} value={item.notes} multiline rows={10} onCommit={v => set({ notes: v })} />
      <div className="col-span-3"><DeleteBar onDelete={onDelete} /></div>
    </div>
  )
}
