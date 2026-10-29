import { useRef } from 'react'
import { useLang } from '../../i18n'
import { photoUrl } from '../../api/client'
import { TextField, SelectField } from '../../ui/fields'
import { ConfirmButton } from '../../ui/ConfirmButton'

function DeleteBar({ onDelete }) {
  const { t } = useLang()
  return (
    <div className="flex justify-end mt-4">
      <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad text-xs px-2 py-1" onConfirm={onDelete}>{t('common.delete')}</ConfirmButton>
    </div>
  )
}

export function PlayerDetail({ item, actions, onDelete }) {
  const { t } = useLang()
  const set = v => actions.update('players', item.id, v)
  return (
    <div className="grid grid-cols-2 gap-3">
      <TextField className="col-span-2" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} />
      <TextField label={t('journal.class')} value={item.class} onCommit={v => set({ class: v })} />
      <TextField label={t('journal.race')} value={item.race} onCommit={v => set({ race: v })} />
      <TextField className="col-span-2" label={t('common.notes')} value={item.notes} multiline rows={8} onCommit={v => set({ notes: v })} />
      <div className="col-span-2"><DeleteBar onDelete={onDelete} /></div>
    </div>
  )
}

export function NpcDetail({ item, actions, onDelete }) {
  const { t } = useLang()
  const fileRef = useRef(null)
  const set = v => actions.update('npcs', item.id, v)
  return (
    <div className="grid grid-cols-[160px_1fr] gap-4">
      <div>
        <button type="button" onClick={() => fileRef.current.click()} aria-label={t('journal.photo')} title={t('journal.photo')}
          className="w-40 h-52 rounded-sm border border-wood bg-sunken overflow-hidden flex items-center justify-center cursor-pointer hover:border-gold">
          {item.photo ? <img src={photoUrl(item.photo)} alt={item.name} className="w-full h-full object-cover object-top" /> : <span className="text-4xl opacity-30" aria-hidden>👤</span>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) actions.uploadPhoto(f, item.id); e.target.value = '' }} />
      </div>
      <div className="grid grid-cols-2 gap-3 content-start">
        <TextField className="col-span-2" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} />
        <TextField label={t('journal.occupation')} value={item.occupation} onCommit={v => set({ occupation: v })} />
        <SelectField label={t('journal.gender')} value={item.gender} placeholder="—"
          options={['male', 'female', 'other'].map(g => ({ value: g, label: t(`genders.${g}`) }))} onCommit={v => set({ gender: v })} />
      </div>
      <TextField className="col-span-2" label={t('common.notes')} value={item.notes} multiline rows={10} onCommit={v => set({ notes: v })} />
      <div className="col-span-2"><DeleteBar onDelete={onDelete} /></div>
    </div>
  )
}

export function PlaceDetail({ item, data, actions, onDelete }) {
  const { t } = useLang()
  const set = v => actions.update('places', item.id, v)
  const quests = data.quests.filter(q => q.place_id === item.id)
  return (
    <div className="flex flex-col gap-3">
      <TextField label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} />
      <TextField label={t('common.notes')} value={item.notes} multiline rows={12} onCommit={v => set({ notes: v })} />
      {quests.length > 0 && (
        <div><span className="label">{t('journal.quests')}</span>
          <ul className="m-0 mt-1 pl-4 list-disc text-body text-xs">{quests.map(q => <li key={q.id}>{q.name}</li>)}</ul>
        </div>
      )}
      <DeleteBar onDelete={onDelete} />
    </div>
  )
}

export function QuestDetail({ item, data, actions, onDelete }) {
  const { t } = useLang()
  const set = v => actions.update('quests', item.id, v)
  const linked = new Set(item.npc_ids ?? [])
  return (
    <div className="grid grid-cols-3 gap-3">
      <TextField className="col-span-3" label={t('common.name')} value={item.name} nullable={false} onCommit={v => set({ name: v })} />
      <SelectField label={t('journal.kind')} value={item.kind} options={['main', 'side'].map(k => ({ value: k, label: t(`journal.${k}`) }))} onCommit={v => set({ kind: v ?? 'side' })} />
      <SelectField label={t('journal.status')} value={item.status} options={['open', 'done', 'failed'].map(k => ({ value: k, label: t(`journal.${k}`) }))} onCommit={v => set({ status: v ?? 'open' })} />
      <SelectField label={t('journal.place')} value={item.place_id == null ? '' : String(item.place_id)} placeholder="—"
        options={data.places.map(p => ({ value: String(p.id), label: p.name }))} onCommit={v => set({ place_id: v == null ? null : Number(v) })} />
      <TextField className="col-span-3" label={t('journal.reward')} value={item.reward} onCommit={v => set({ reward: v })} />
      <div className="col-span-3">
        <span className="label block mb-1">{t('journal.linkedNpcs')}</span>
        <div className="flex flex-wrap gap-1">
          {data.npcs.map(n => {
            const on = linked.has(n.id)
            return (
              <button key={n.id} type="button" aria-pressed={on}
                onClick={() => set({ npc_ids: on ? [...linked].filter(x => x !== n.id) : [...linked, n.id] })}
                className={`px-2 py-0.5 rounded-sm border text-[11px] cursor-pointer ${on ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment'}`}>
                {n.name}
              </button>
            )
          })}
          {data.npcs.length === 0 && <span className="text-dim text-[11px]">—</span>}
        </div>
      </div>
      <TextField className="col-span-3" label={t('common.notes')} value={item.notes} multiline rows={10} onCommit={v => set({ notes: v })} />
      <div className="col-span-3"><DeleteBar onDelete={onDelete} /></div>
    </div>
  )
}
