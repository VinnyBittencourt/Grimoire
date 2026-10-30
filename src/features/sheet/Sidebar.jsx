import { useRef, useState } from 'react'
import { useLang } from '../../i18n'
import { photoUrl } from '../../api/client'
import { StatBox } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { Modal } from '../../ui/Modal'
import { Checkbox } from '../../ui/fields'
import { Menu } from '../../ui/controls'
import { Breakdown } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/Toast'
import { SAVES } from '../../../shared/constants/abilities.js'
import { HpTracker } from './HpTracker'
import { labelParts } from './breakdownLabels'

// Coluna fixa à esquerda = "modo mesa": só leitura (exceto PV), totais que se explicam ao clicar
export function Sidebar({ ch, sheet, actions }) {
  const { t, signed, className, distance } = useLang()
  const toast = useToast()
  const fileRef = useRef(null)
  const [restOpen, setRestOpen] = useState(false)
  const [heal, setHeal] = useState(true)
  const lp = parts => labelParts(parts, { t, className, ch })
  const bd = sheet.breakdown

  const classes = [...ch.classes].sort((a, b) => a.position - b.position)
  const iter = list => (list.length > 1 ? list.map(signed).join('/') : null)
  const acIgnored = sheet.ac.ignored.map(x => `${t(`core.acParts.${x.type}`)} ${signed(x.value)} (${x.name ?? t('core.acManualSource')})`)

  return (
    <aside aria-label={t('sheet.summary')} className="w-[var(--sidebar-width)] shrink-0 border-r border-subtle overflow-y-auto bg-[linear-gradient(180deg,var(--color-surface),var(--color-bg))] flex flex-col gap-3 p-3 [&>*]:shrink-0">
      {/* Retrato */}
      <div className="panel overflow-hidden">
        <div className="relative h-52 bg-sunken flex items-center justify-center overflow-hidden">
          {ch.photo
            ? <img src={photoUrl(ch.photo)} alt={ch.name} className="w-full h-full object-cover object-top" />
            : (
              <button type="button" onClick={() => fileRef.current.click()} className="flex flex-col items-center gap-2 text-gold-lo hover:text-gold cursor-pointer">
                <Icon name="shield" size={48} strokeWidth={1.25} />
                <span className="text-xs font-display tracking-wide">{t('sheet.addPhoto')}</span>
              </button>
            )}
          {ch.photo && (
            <span className="absolute top-1.5 right-1.5 rounded-sm bg-scrim">
              <Menu label={t('sheet.photoMenu')} icon="camera" size="sm" items={[
                { label: t('sheet.photo'), icon: 'upload', onSelect: () => fileRef.current.click() },
                { label: t('sheet.removePhoto'), icon: 'trash', tone: 'danger', onSelect: () => actions.removePhoto() },
              ]} />
            </span>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" aria-hidden tabIndex={-1}
          onChange={e => { const f = e.target.files?.[0]; if (f) actions.uploadPhoto(f); e.target.value = '' }} />
        <div className="px-3 py-2.5 text-center">
          <h2 className="font-display text-parchment text-base m-0 leading-tight">{ch.name}</h2>
          <p className="text-gold text-xs m-0 mt-1">{classes.map(c => `${className(c)} ${c.level}`).join(' / ')}</p>
          <p className="caption m-0 mt-0.5">{t('core.totalLevel', { n: sheet.level })}{ch.alignment ? ` · ${t(`alignments.${ch.alignment}`)}` : ''}</p>
        </div>
      </div>

      <HpTracker ch={ch} sheet={sheet} actions={actions} />

      <Group title={t('sheet.defense')}>
        <div className="grid grid-cols-3 gap-1.5">
          <StatBox tone="ac" label={t('vitals.ac')} value={sheet.ac.total}
            explain={<Breakdown title={t('vitals.ac')} total={sheet.ac.computed} parts={lp(bd.ac)} ignored={acIgnored}
              override={sheet.ac.overridden ? { computed: sheet.ac.computed } : null} />} />
          <StatBox tone="ac" label={t('vitals.touch')} value={sheet.ac.touch} />
          <StatBox tone="ac" label={t('vitals.flatFooted')} value={sheet.ac.flatFooted} />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {SAVES.map(s => (
            <StatBox key={s} tone="save" label={t(`savesShort.${s}`)} value={signed(sheet.saves[s].total)}
              explain={<Breakdown title={t(`saves.${s}`)} total={signed(sheet.saves[s].total)} parts={lp(bd.saves[s])} />} />
          ))}
        </div>
      </Group>

      <Group title={t('core.combat')}>
        <div className="grid grid-cols-3 gap-1.5">
          <StatBox label={t('vitals.initShort')} value={signed(sheet.initiative)}
            explain={<Breakdown title={t('vitals.init')} total={signed(sheet.initiative)} parts={lp(bd.initiative)} />} />
          <StatBox label={t('vitals.bab')} value={signed(sheet.bab.total)} sub={iter(sheet.bab.iterative)}
            explain={<Breakdown title={t('vitals.bab')} total={signed(sheet.bab.computed)} parts={lp(bd.bab)}
              override={sheet.bab.overridden ? { computed: signed(sheet.bab.computed) } : null} />} />
          <StatBox label={t('vitals.grapple')} value={signed(sheet.grapple)}
            explain={<Breakdown title={t('vitals.grapple')} total={signed(sheet.grapple)} parts={lp(bd.grapple)} />} />
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          <StatBox label={t('vitals.melee')} value={signed(sheet.attack.melee)} sub={iter(sheet.attack.meleeIterative)}
            explain={<Breakdown title={t('vitals.melee')} total={signed(sheet.attack.melee)} parts={lp(bd.melee)} />} />
          <StatBox label={t('vitals.ranged')} value={signed(sheet.attack.ranged)} sub={iter(sheet.attack.rangedIterative)}
            explain={<Breakdown title={t('vitals.ranged')} total={signed(sheet.attack.ranged)} parts={lp(bd.ranged)} />} />
        </div>
      </Group>

      {ch.attacks.length > 0 && (
        <Group title={t('core.attacks')}>
          <ul className="list-none p-0 m-0 flex flex-col gap-1">
            {ch.attacks.map(a => {
              const calc = sheet.attacks.find(x => x.id === a.id)
              const crit = `${a.crit_range < 20 ? `${a.crit_range}–20` : '20'}/×${a.crit_mult}`
              return (
                <li key={a.id} className="flex items-center gap-2 rounded-sm border border-subtle bg-sunken px-2 py-1.5">
                  <Icon name={a.kind === 'ranged' ? 'bow' : 'sword'} size={15} className="text-gold-lo" />
                  <span className="flex-1 min-w-0 truncate text-xs text-parchment">{a.name || '—'}</span>
                  <span className="font-display text-gold text-xs tabular-nums">{calc.iterative.map(signed).join('/')}</span>
                  <span className="text-xs text-body tabular-nums whitespace-nowrap">{a.damage_dice || '—'}{calc.damage ? signed(calc.damage) : ''}</span>
                  <span className="sr-only">{t('core.attack.crit')} {crit}</span>
                </li>
              )
            })}
          </ul>
        </Group>
      )}

      <dl className="grid grid-cols-3 gap-1.5 m-0 text-center">
        <Fact label={t('vitals.speed')} value={distance(sheet.speed.current)} warn={sheet.speed.reduced}
          title={sheet.speed.reduced ? t('vitals.speedReduced', { base: distance(sheet.speed.base) }) : undefined} />
        <Fact label={t('vitals.sr')} value={ch.sr > 0 ? ch.sr : '—'} />
        <Fact label={t('vitals.dr')} value={ch.dr || '—'} />
      </dl>

      <Button variant="gold" className="mt-1" onClick={() => setRestOpen(true)}><Icon name="sun" size={16} />{t('sheet.newDay')}</Button>

      <Modal open={restOpen} onClose={() => setRestOpen(false)} title={t('sheet.newDay')} width={420} closeOnBackdrop
        footer={<>
          <Button variant="subtle" onClick={() => setRestOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="gold" data-autofocus onClick={async () => {
            setRestOpen(false)
            if (await actions.rest(heal)) toast.success(t('sheet.newDayDone'))
          }}><Icon name="sun" size={16} />{t('sheet.startNewDay')}</Button>
        </>}>
        <p className="text-body text-sm mt-0 mb-2">{t('sheet.newDayIntro')}</p>
        <ul className="m-0 mb-3 pl-5 text-sm text-body list-disc flex flex-col gap-1">
          <li>{t('sheet.newDaySpells')}</li>
          <li>{t('sheet.newDayResources')}</li>
          <li className="text-muted">{t('sheet.newDaySummons')}</li>
        </ul>
        <Checkbox checked={heal} onChange={setHeal} label={t('sheet.newDayHeal', { n: Math.max(1, sheet.level) })} />
      </Modal>
    </aside>
  )
}

function Group({ title, children }) {
  return (
    <section className="flex flex-col gap-1.5" aria-label={title}>
      <h3 className="col-head m-0 px-0.5">{title}</h3>
      {children}
    </section>
  )
}

function Fact({ label, value, warn = false, title }) {
  return (
    <div className={`rounded-sm border px-1.5 py-1 ${warn ? 'border-[var(--color-warning)]/50 bg-warn-faint' : 'border-subtle bg-sunken'}`} title={title}>
      <dt className="text-2xs uppercase tracking-[var(--tracking-label)] text-gold">{label}</dt>
      <dd className={`m-0 text-xs truncate ${warn ? 'text-warn' : 'text-parchment'}`}>{value}{title && <span className="sr-only"> — {title}</span>}</dd>
    </div>
  )
}
