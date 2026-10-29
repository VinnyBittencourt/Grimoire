import { useRef, useState } from 'react'
import { useLang } from '../../i18n'
import { photoUrl } from '../../api/client'
import { StatBox } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { Checkbox } from '../../ui/fields'
import { useToast } from '../../ui/Toast'
import { SAVES } from '../../../shared/constants/abilities.js'
import { HpTracker } from './HpTracker'

// Coluna fixa à esquerda: o que se consulta a todo momento na mesa
export function Sidebar({ ch, sheet, actions }) {
  const { t, signed, className, distance } = useLang()
  const toast = useToast()
  const fileRef = useRef(null)
  const [restOpen, setRestOpen] = useState(false)
  const [heal, setHeal] = useState(true)

  const classes = [...ch.classes].sort((a, b) => a.position - b.position)

  return (
    <aside className="w-[var(--sidebar-width)] shrink-0 border-r border-subtle overflow-y-auto bg-[linear-gradient(180deg,var(--color-surface),var(--color-bg))] flex flex-col gap-3 p-3">
      {/* Retrato */}
      <div className="panel overflow-hidden">
        <button type="button" onClick={() => fileRef.current.click()} title={t('sheet.photo')} aria-label={t('sheet.photo')}
          className="relative block w-full h-52 bg-sunken cursor-pointer group overflow-hidden">
          {ch.photo
            ? <img src={photoUrl(ch.photo)} alt={ch.name} className="w-full h-full object-cover object-top" />
            : <span className="text-6xl opacity-30" aria-hidden>⚔️</span>}
          <span className="absolute inset-x-0 bottom-0 py-1 text-[10px] tracking-widest uppercase text-parchment bg-[rgba(0,0,0,0.6)] opacity-0 group-hover:opacity-100 transition-opacity">
            {t('sheet.photo')}
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) actions.uploadPhoto(f); e.target.value = '' }} />
        <div className="px-3 py-2 text-center">
          <h2 className="font-display text-parchment text-base m-0 leading-tight">{ch.name}</h2>
          <p className="text-gold text-[11px] m-0 mt-0.5">{classes.map(c => `${className(c)} ${c.level}`).join(' / ')}</p>
          <p className="text-dim text-[10px] m-0">{t('core.totalLevel', { n: sheet.level })}{ch.alignment ? ` · ${t(`alignments.${ch.alignment}`)}` : ''}</p>
        </div>
      </div>

      <HpTracker ch={ch} sheet={sheet} actions={actions} />

      {/* Defesa */}
      <div className="grid grid-cols-3 gap-1.5">
        <StatBox tone="ac" label={t('vitals.ac')} value={sheet.ac.total} title={sheet.ac.overridden ? t('common.computed', { n: sheet.ac.computed }) : undefined} />
        <StatBox tone="ac" label={t('vitals.touch')} value={sheet.ac.touch} />
        <StatBox tone="ac" label={t('vitals.flatFooted')} value={sheet.ac.flatFooted} />
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {SAVES.map(s => <StatBox key={s} tone="save" label={t(`saves.${s}`)} value={signed(sheet.saves[s].total)} />)}
      </div>
      {/* Ataque */}
      <div className="grid grid-cols-3 gap-1.5">
        <StatBox label={t('vitals.init')} value={signed(sheet.initiative)} />
        <StatBox label={t('vitals.bab')} value={signed(sheet.bab.total)} sub={sheet.bab.iterative.length > 1 ? sheet.bab.iterative.map(signed).join('/') : null} />
        <StatBox label={t('vitals.grapple')} value={signed(sheet.grapple)} />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <StatBox label={t('vitals.melee')} value={signed(sheet.attack.melee)} />
        <StatBox label={t('vitals.ranged')} value={signed(sheet.attack.ranged)} />
      </div>
      <div className="flex justify-between text-[11px] text-body px-1">
        <span><span className="text-gold font-display">{t('vitals.speed')}</span> {distance(ch.speed_ft)}</span>
        {ch.sr > 0 && <span><span className="text-gold font-display">{t('vitals.sr')}</span> {ch.sr}</span>}
        {ch.dr && <span><span className="text-gold font-display">{t('vitals.dr')}</span> {ch.dr}</span>}
      </div>

      <Button variant="gold" className="mt-1" onClick={() => setRestOpen(true)}>☀ {t('sheet.newDay')}</Button>

      <Modal open={restOpen} onClose={() => setRestOpen(false)} title={t('sheet.newDay')} width={380} closeOnBackdrop
        footer={<>
          <Button variant="subtle" onClick={() => setRestOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="gold" autoFocus onClick={async () => {
            setRestOpen(false)
            await actions.rest(heal)
            toast.success(t('sheet.newDayDone'))
          }}>{t('common.confirm')}</Button>
        </>}>
        <p className="text-body text-sm mt-0">{t('sheet.newDayConfirm')}</p>
        <Checkbox checked={heal} onChange={setHeal} label={t('sheet.newDayHeal')} />
      </Modal>
    </aside>
  )
}
