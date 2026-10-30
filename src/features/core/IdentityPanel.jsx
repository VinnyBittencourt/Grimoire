import { useLang } from '../../i18n'
import { useRefData } from '../../queries/characters'
import { Section } from '../../ui/layout'
import { NumberField, TextField, SelectField } from '../../ui/fields'
import { Icon } from '../../ui/Icon'
import { ALIGNMENTS, GENDERS } from '../../../shared/constants/abilities.js'
import { SIZE_IDS } from '../../../shared/constants/sizes.js'

// Identidade em três grupos: o básico sempre aberto; aparência e personalidade recolhíveis
export function IdentityPanel({ ch, actions }) {
  const { t, metric, toDisplayDistance, fromDisplayDistance } = useLang()
  const races = useRefData('ref_racas')
  const patch = actions.patchCharacter
  const f = key => t(`core.fields.${key}`)

  return (
    <Section title={t('core.identity')}>
      <div className="grid grid-cols-4 gap-3">
        <TextField className="col-span-2" label={f('name')} value={ch.name} nullable={false} onCommit={v => patch({ name: v })} />
        <TextField className="col-span-2" label={f('player')} value={ch.player} onCommit={v => patch({ player: v })} />
        <SelectField className="col-span-2" label={f('race')} value={ch.race_id ?? '__custom'}
          options={[...(races.data ?? []).map(r => ({ value: r.id, label: r.nome })), { value: '__custom', label: t('wizard.customRace') }]}
          onCommit={v => patch(v === '__custom' ? { race_id: null } : { race_id: v, race_name: null })} />
        {!ch.race_id
          ? <TextField className="col-span-2" label={t('wizard.customRace')} value={ch.race_name} onCommit={v => patch({ race_name: v })} />
          : <TextField className="col-span-2" label={f('deity')} value={ch.deity} onCommit={v => patch({ deity: v })} />}
        <SelectField className="col-span-2" label={f('alignment')} value={ch.alignment} placeholder="—"
          options={ALIGNMENTS.map(a => ({ value: a, label: t(`alignments.${a}`) }))} onCommit={v => patch({ alignment: v })} />
        {!ch.race_id && <TextField className="col-span-2" label={f('deity')} value={ch.deity} onCommit={v => patch({ deity: v })} />}
        <SelectField label={f('size')} value={ch.size} options={SIZE_IDS.map(s => ({ value: s, label: t(`sizes.${s}`) }))}
          onCommit={v => patch({ size: v ?? 'medium' })} />
        <NumberField label={f('speed')} value={toDisplayDistance(ch.speed_ft)} step={metric ? 0.1 : 1} min={0} suffix={t('units.distance')}
          onCommit={v => patch({ speed_ft: fromDisplayDistance(v) })} />
        <NumberField label={f('xp')} value={ch.xp} min={0} onCommit={v => patch({ xp: v })} />
        <TextField label={f('languages')} value={ch.languages} onCommit={v => patch({ languages: v })} />
      </div>

      <Disclosure title={t('core.appearance')}>
        <div className="grid grid-cols-4 gap-3">
          <SelectField label={f('gender')} value={ch.gender} placeholder="—" options={GENDERS.map(g => ({ value: g, label: t(`genders.${g}`) }))}
            onCommit={v => patch({ gender: v })} />
          <TextField label={f('age')} value={ch.age} onCommit={v => patch({ age: v })} />
          <TextField label={f('height')} value={ch.height} onCommit={v => patch({ height: v })} />
          <TextField label={f('weight')} value={ch.weight} onCommit={v => patch({ weight: v })} />
          <TextField label={f('eyes')} value={ch.eyes} onCommit={v => patch({ eyes: v })} />
          <TextField label={f('hair')} value={ch.hair} onCommit={v => patch({ hair: v })} />
          <TextField className="col-span-2" label={f('skin')} value={ch.skin} onCommit={v => patch({ skin: v })} />
        </div>
      </Disclosure>

      <Disclosure title={t('core.personalityGroup')}>
        <div className="grid grid-cols-1 gap-3">
          <TextField label={f('personality')} value={ch.personality} multiline rows={3} onCommit={v => patch({ personality: v })} />
          <TextField label={f('flaw')} value={ch.flaw} onCommit={v => patch({ flaw: v })} />
        </div>
      </Disclosure>
    </Section>
  )
}

function Disclosure({ title, children }) {
  return (
    <details className="group mt-3 rounded-sm border border-subtle bg-sunken">
      <summary className="flex items-center gap-2 px-3 py-2 cursor-pointer list-none select-none font-display text-gold text-sm hover:text-gold-hi [&::-webkit-details-marker]:hidden">
        <Icon name="chevronRight" size={14} className="transition-transform group-open:rotate-90" />{title}
      </summary>
      <div className="px-3 pb-3 pt-1">{children}</div>
    </details>
  )
}
