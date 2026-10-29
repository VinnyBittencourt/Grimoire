import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../i18n'
import { useCreateCharacter, useRefData } from '../../queries/characters'
import { AppHeader } from '../shell/AppHeader'
import { Button, IconButton } from '../../ui/Button'
import { Section, StatBox } from '../../ui/layout'
import { useToast } from '../../ui/Toast'
import { ABILITIES, ALIGNMENTS, GENDERS } from '../../../shared/constants/abilities.js'
import { SIZE_FROM_V1 } from '../../../shared/constants/sizes.js'
import { CLASSES, CLASS_IDS } from '../../../shared/constants/classes.js'
import { computeSheet } from '../../../shared/rules/sheet.js'
import { abilityMod } from '../../../shared/rules/abilities.js'

const STEPS = ['identity', 'classes', 'abilities', 'review']
// ref_racas usa "atributos: { for, des, ... }" em pt
const RACE_ABILITY = { for: 'str', des: 'dex', con: 'con', int: 'int', sab: 'wis', car: 'cha' }

export default function NewCharacterPage() {
  const { t, signed, className } = useLang()
  const navigate = useNavigate()
  const toast = useToast()
  const create = useCreateCharacter()
  const races = useRefData('ref_racas')
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '', race_id: 'humano', race_name: '', alignment: 'n', gender: null, deity: '', age: '',
    classes: [{ class_id: 'fighter', level: 1 }],
    scores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    hp_max: null,
  })
  const set = patch => setForm(f => ({ ...f, ...patch }))
  const race = races.data?.find(r => r.id === form.race_id)

  const draft = useMemo(() => {
    const ch = {
      size: SIZE_FROM_V1[race?.tamanho] ?? 'medium',
      speed_ft: race?.deslocamento ? Math.round((race.deslocamento / 1.5) * 5) : 30,
      race_id: form.race_id,
      classes: form.classes.map((c, i) => ({ ...c, id: i + 1, position: i })),
    }
    for (const ab of ABILITIES) ch[`${ab}_base`] = form.scores[ab]
    return ch
  }, [form, race])
  const preview = useMemo(() => computeSheet(draft), [draft])

  const errors = {
    identity: !form.name.trim() ? t('wizard.nameRequired') : null,
    classes: form.classes.length === 0 ? t('wizard.classRequired') : null,
  }
  const current = STEPS[step]

  async function submit() {
    const body = {
      name: form.name.trim(), alignment: form.alignment, gender: form.gender, deity: form.deity || null, age: form.age || null,
      race_id: form.race_id === '__custom' ? null : form.race_id,
      race_name: form.race_id === '__custom' ? form.race_name || null : null,
      size: draft.size, speed_ft: draft.speed_ft,
      hp_max: form.hp_max ?? preview.hp.suggestedMax,
      classes: form.classes,
    }
    for (const ab of ABILITIES) body[`${ab}_base`] = form.scores[ab]
    try {
      const sheet = await create.mutateAsync(body)
      navigate(`/personagem/${sheet.id}`, { replace: true })
    } catch (e) { toast.error(e.message) }
  }

  const racialMods = race?.atributos && Object.keys(race.atributos).length
    ? Object.entries(race.atributos).map(([k, v]) => `${t(`abilities.${RACE_ABILITY[k] ?? k}`)} ${signed(v)}`).join(', ')
    : null

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader><h1 className="font-display text-gold text-sm tracking-widest uppercase m-0">{t('wizard.title')}</h1></AppHeader>
      <main className="flex-1 w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-5">
        <ol className="flex gap-2 list-none p-0 m-0" aria-label={t('wizard.title')}>
          {STEPS.map((s, i) => (
            <li key={s} className={`flex-1 text-center font-display text-[11px] tracking-widest uppercase pb-2 border-b-2 ${i === step ? 'text-gold border-gold' : i < step ? 'text-body border-gold-lo' : 'text-dim border-subtle'}`}
              aria-current={i === step ? 'step' : undefined}>{i + 1}. {t(`wizard.${s}`)}</li>
          ))}
        </ol>

        {current === 'identity' && (
          <Section title={t('wizard.identity')} bodyClassName="grid grid-cols-2 gap-4">
            <label className="col-span-2"><span className="label block mb-1">{t('core.fields.name')}</span>
              <input autoFocus className="field" value={form.name} onChange={e => set({ name: e.target.value })} aria-invalid={Boolean(errors.identity)} />
            </label>
            <label><span className="label block mb-1">{t('wizard.race')}</span>
              <select className="field" value={form.race_id} onChange={e => set({ race_id: e.target.value })}>
                {races.data?.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
                <option value="__custom">{t('wizard.customRace')}</option>
              </select>
              {racialMods && <span className="text-dim text-[11px] mt-1 block">{t('wizard.racialHint', { mods: racialMods })}</span>}
            </label>
            {form.race_id === '__custom'
              ? <label><span className="label block mb-1">{t('wizard.customRace')}</span>
                  <input className="field" value={form.race_name} onChange={e => set({ race_name: e.target.value })} /></label>
              : <div className="text-dim text-[11px] self-end pb-2">{race?.descricao}</div>}
            <label><span className="label block mb-1">{t('core.fields.alignment')}</span>
              <select className="field" value={form.alignment} onChange={e => set({ alignment: e.target.value })}>
                {ALIGNMENTS.map(a => <option key={a} value={a}>{t(`alignments.${a}`)}</option>)}
              </select>
            </label>
            <label><span className="label block mb-1">{t('core.fields.gender')}</span>
              <select className="field" value={form.gender ?? ''} onChange={e => set({ gender: e.target.value || null })}>
                <option value="">—</option>
                {GENDERS.map(g => <option key={g} value={g}>{t(`genders.${g}`)}</option>)}
              </select>
            </label>
            <label><span className="label block mb-1">{t('core.fields.deity')}</span>
              <input className="field" value={form.deity} onChange={e => set({ deity: e.target.value })} /></label>
            <label><span className="label block mb-1">{t('core.fields.age')}</span>
              <input className="field" value={form.age} onChange={e => set({ age: e.target.value })} /></label>
          </Section>
        )}

        {current === 'classes' && (
          <Section title={t('wizard.classes')} actions={
            <Button size="sm" onClick={() => set({ classes: [...form.classes, { class_id: 'fighter', level: 1 }] })}>{t('wizard.addClass')}</Button>
          } bodyClassName="flex flex-col gap-2">
            {form.classes.map((c, i) => (
              <div key={i} className="flex items-end gap-3">
                <label className="flex-1"><span className="label block mb-1">{t('core.classFields.class')}</span>
                  <select className="field" value={c.class_id} onChange={e => set({ classes: form.classes.map((x, j) => j === i ? { ...x, class_id: e.target.value } : x) })}>
                    {CLASS_IDS.map(id => <option key={id} value={id}>{t(`classes.${id}`)}{CLASSES[id].prestige ? ' ★' : ''}</option>)}
                  </select>
                </label>
                {c.class_id === 'custom' && (
                  <label className="flex-1"><span className="label block mb-1">{t('core.classFields.customName')}</span>
                    <input className="field" value={c.custom_name ?? ''} onChange={e => set({ classes: form.classes.map((x, j) => j === i ? { ...x, custom_name: e.target.value } : x) })} />
                  </label>
                )}
                <label className="w-24"><span className="label block mb-1">{t('core.classFields.level')}</span>
                  <input className="field text-center" type="number" min={1} max={40} value={c.level}
                    onChange={e => set({ classes: form.classes.map((x, j) => j === i ? { ...x, level: Math.max(1, Math.min(40, Number(e.target.value) || 1)) } : x) })} />
                </label>
                <IconButton label={t('common.delete')} disabled={form.classes.length === 1}
                  onClick={() => set({ classes: form.classes.filter((_, j) => j !== i) })}>✕</IconButton>
              </div>
            ))}
            <p className="text-dim text-[11px] mt-2 mb-0">{t('core.totalLevel', { n: preview.level })}</p>
          </Section>
        )}

        {current === 'abilities' && (
          <Section title={t('wizard.abilities')}>
            <p className="text-dim text-[11px] mt-0 mb-3">{t('wizard.pointBuyHint')}{racialMods ? ` ${t('wizard.racialHint', { mods: racialMods })}` : ''}</p>
            <div className="grid grid-cols-6 gap-3">
              {ABILITIES.map(ab => (
                <label key={ab} className="flex flex-col items-center gap-1">
                  <span className="label" title={t(`abilityNames.${ab}`)}>{t(`abilities.${ab}`)}</span>
                  <input type="number" min={1} max={50} className="field text-center text-lg font-display" value={form.scores[ab]}
                    onChange={e => set({ scores: { ...form.scores, [ab]: Math.max(1, Math.min(50, Number(e.target.value) || 1)) } })} />
                  <span className="text-gold font-display text-sm">{signed(abilityMod(form.scores[ab]))}</span>
                </label>
              ))}
            </div>
          </Section>
        )}

        {current === 'review' && (
          <Section title={t('wizard.review')} bodyClassName="flex flex-col gap-4">
            <div>
              <p className="font-display text-parchment text-lg m-0">{form.name}</p>
              <p className="text-gold text-xs m-0">{form.classes.map(c => `${className(c)} ${c.level}`).join(' / ')}</p>
            </div>
            <div className="grid grid-cols-6 gap-2">
              <StatBox tone="ac" label={t('vitals.ac')} value={preview.ac.total} />
              <StatBox label={t('vitals.init')} value={signed(preview.initiative)} />
              <StatBox label={t('vitals.bab')} value={signed(preview.bab.total)} />
              <StatBox tone="save" label={t('saves.fort')} value={signed(preview.saves.fort.total)} />
              <StatBox tone="save" label={t('saves.ref')} value={signed(preview.saves.ref.total)} />
              <StatBox tone="save" label={t('saves.will')} value={signed(preview.saves.will.total)} />
            </div>
            <label className="w-48"><span className="label block mb-1">{t('vitals.hpMax')} ({t('vitals.hp')})</span>
              <input type="number" min={1} className="field" value={form.hp_max ?? preview.hp.suggestedMax}
                onChange={e => set({ hp_max: Math.max(1, Number(e.target.value) || 1) })} />
              <span className="text-dim text-[11px] block mt-1">{t('wizard.hpSuggestion', { n: preview.hp.suggestedMax })}</span>
            </label>
          </Section>
        )}

        <div className="flex items-center justify-between">
          <Button variant="subtle" onClick={() => (step === 0 ? navigate('/') : setStep(step - 1))}>{step === 0 ? t('common.cancel') : t('wizard.prev')}</Button>
          <span className="text-bad text-xs">{errors[current]}</span>
          {step < STEPS.length - 1
            ? <Button variant="gold" disabled={Boolean(errors[current])} onClick={() => setStep(step + 1)}>{t('wizard.next')}</Button>
            : <Button variant="gold" disabled={create.isPending || Boolean(errors.identity)} onClick={submit}>{t('wizard.create')}</Button>}
        </div>
      </main>
    </div>
  )
}
