import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge, EmptyState } from '../../ui/layout'
import { NumberField, TextField, SelectField } from '../../ui/fields'
import { IconButton } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { QuickAdd, SegmentedControl } from '../../ui/controls'
import { Breakdown, Explain, Notice, Popover } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { SKILL_BY_ID } from '../../../shared/constants/skills.js'
import { ABILITIES } from '../../../shared/constants/abilities.js'
import { labelParts } from '../sheet/breakdownLabels'

export default function SkillsTab({ ch, sheet, actions }) {
  const { t, signed, skillName, className } = useLang()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const lp = parts => labelParts(parts, { t, className, ch })

  const rows = useMemo(() => {
    const byId = new Map(sheet.skills.map(s => [s.id, s]))
    const q = query.trim().toLowerCase()
    return ch.skills
      .map(row => ({ row, calc: byId.get(row.id), def: SKILL_BY_ID[row.skill_id] }))
      .filter(({ row, calc }) => filter === 'all' || (filter === 'trained' ? row.ranks > 0 : calc.classSkill))
      .filter(({ row }) => !q || skillName(row).toLowerCase().includes(q))
      .sort((a, b) => skillName(a.row).localeCompare(skillName(b.row)))
  }, [ch.skills, sheet.skills, filter, query, skillName])

  const { spent, available } = sheet.skillPoints
  const left = available - spent

  return (
    <Section title={t('skills.title')}
      subtitle={left >= 0 ? t('skills.pointsLeft', { spent, available, left }) : t('skills.points', { spent, available })}
      actions={<><Popover label={t('skills.pointsDetail')} align="end" width={300}
        trigger={<span className="inline-flex items-center gap-1 min-h-7 px-2 rounded-sm text-xs text-muted hover:text-gold hover:bg-gold-faint"><Icon name="info" size={14} />{t('skills.pointsDetail')}</span>}>
        <div className="flex flex-col gap-2 text-sm">
          <p className="m-0 flex justify-between"><span className="text-body">{t('skills.fromLevels')}</span><b className="num-part">{sheet.skillPoints.fromLevels}</b></p>
          <NumberField label={t('skills.pointsAdjust')} value={ch.skill_points_adjust ?? 0} min={-999} max={999} stepper
            onCommit={v => actions.patchCharacter({ skill_points_adjust: v })} />
          <p className="caption m-0">{t('skills.pointsAdjustHint')}</p>
        </div>
      </Popover>
      <QuickAdd collapsed label={t('skills.addCustomShort')} placeholder={t('skills.customPlaceholder')}
        onSubmit={name => actions.create('skills', { skill_id: `custom_${Date.now().toString(36)}`, custom_name: name, ability: 'int' })} /></>}>
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <label className="relative flex-1 min-w-48 max-w-xs">
          <Icon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
          <input className="field field-sm pl-7" placeholder={t('skills.searchPlaceholder')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('skills.searchPlaceholder')} />
        </label>
        <SegmentedControl label={t('skills.filter')} value={filter} onChange={setFilter} size="sm"
          options={[{ value: 'all', label: t('skills.filterAll') }, { value: 'trained', label: t('skills.filterTrained') }, { value: 'class', label: t('skills.filterClass') }]} />
        <span className="caption ml-auto flex items-center gap-3">
          <span className="inline-flex items-center gap-1"><Icon name="star" size={13} className="text-gold" />{t('skills.classSkill')}</span>
          <span className="inline-flex items-center gap-1"><Icon name="lock" size={13} />{t('skills.trainedOnly')}</span>
        </span>
      </div>
      {left < 0 && <Notice tone="danger" compact className="mb-3">{t('skills.overSpent', { n: -left })}</Notice>}

      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-[var(--color-surface)] z-10">
          <tr className="text-left">
            <th className="w-9 pb-1.5"><span className="sr-only">{t('skills.classSkill')}</span></th>
            <th className="col-head font-medium pb-1.5">{t('skills.skill')}</th>
            <th className="col-head font-medium pb-1.5 w-14 text-center">{t('skills.ability')}</th>
            <th className="col-head font-medium pb-1.5 w-16 text-center">{t('skills.total')}</th>
            <th className="col-head font-medium pb-1.5 w-20 text-center">{t('skills.ranks')}</th>
            <th className="col-head font-medium pb-1.5 w-16 text-center">{t('common.misc')}</th>
            <th className="col-head font-medium pb-1.5">{t('skills.notesCol')}</th>
            <th className="w-16 pb-1.5"><span className="sr-only">{t('common.actions')}</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ row, calc, def }) => {
            const custom = !def
            const tooMany = row.ranks > calc.maxRanks
            const name = skillName(row)
            const siblings = def?.multi ? ch.skills.filter(s => s.skill_id === row.skill_id).length : 0
            return (
              <tr key={row.id} className="border-t border-subtle row-hover">
                <td className="text-center">
                  <label className="inline-flex items-center justify-center w-7 h-7 rounded-sm cursor-pointer hover:bg-gold-faint">
                    <input type="checkbox" className="sr-only peer" checked={calc.classSkill} aria-label={`${t('skills.classSkill')}: ${name}`}
                      onChange={e => actions.update('skills', row.id, { class_skill: e.target.checked })} />
                    <Icon name="star" size={16} className={`peer-focus-visible:text-gold-hi ${calc.classSkill ? 'text-gold fill-current' : 'text-[var(--color-text-disabled)]'}`} />
                  </label>
                </td>
                <td className="py-1.5 pr-2">
                  {custom ? (
                    <TextField value={row.custom_name} nullable={false} inline inputClassName="field-sm" aria-label={t('common.name')}
                      onCommit={v => actions.update('skills', row.id, { custom_name: v })} />
                  ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={calc.classSkill ? 'text-parchment' : 'text-body'}>{t(`skillNames.${row.skill_id}`)}</span>
                      {def.multi && (
                        <TextField value={row.custom_name} placeholder={t('skills.specialty')} inline inputClassName="field-sm !w-36" aria-label={`${name} — ${t('skills.specialty')}`}
                          onCommit={v => actions.update('skills', row.id, { custom_name: v })} />
                      )}
                      {def.trained && <Icon name="lock" size={13} className="text-muted" label={t('skills.trainedOnly')} />}
                    </div>
                  )}
                </td>
                <td className="text-center text-muted text-xs">
                  {custom
                    ? <SelectField value={row.ability} inputClassName="field-sm" aria-label={t('skills.ability')} options={ABILITIES.map(a => ({ value: a, label: t(`abilities.${a}`) }))}
                        onCommit={v => actions.update('skills', row.id, { ability: v })} />
                    : t(`abilities.${def.ability}`)}
                </td>
                <td className="text-center">
                  {calc.untrainedBlocked
                    ? <span className="text-muted" title={t('skills.needsRanks')}>—</span>
                    : (
                      <Explain value={signed(calc.total)} label={`${name}: ${signed(calc.total)}`} className="font-display font-bold text-gold">
                        <Breakdown title={name} total={signed(calc.total)} parts={lp(sheet.breakdown.skills[row.id] ?? [])} />
                      </Explain>
                    )}
                </td>
                <td className="text-center">
                  <NumberField compact value={row.ranks} step={0.5} min={0} max={80} aria-label={`${name} — ${t('skills.ranks')}`}
                    aria-invalid={tooMany} onCommit={v => actions.update('skills', row.id, { ranks: v })} inputClassName="!w-14" />
                </td>
                <td className="text-center">
                  <NumberField compact value={row.misc} aria-label={`${name} — ${t('common.misc')}`}
                    onCommit={v => actions.update('skills', row.id, { misc: v })} />
                </td>
                <td className="py-1">
                  <div className="flex flex-wrap gap-1">
                    {tooMany && <Badge tone="hp" icon="warning">{t('skills.maxRanks', { n: calc.maxRanks })}</Badge>}
                    {calc.acp > 0 && <Badge tone="hp" title={t('skills.acp')}>{t('skills.acpShort', { n: calc.acp })}</Badge>}
                    {calc.synergy > 0 && <Badge tone="save">{t('skills.synergy', { n: calc.synergy })}</Badge>}
                    {calc.size !== 0 && <Badge tone="gold">{t('breakdown.parts.size')} {signed(calc.size)}</Badge>}
                    {calc.misc !== (row.misc ?? 0) && <Badge tone="magic">{t('core.fromFeats', { n: signed(calc.misc - (row.misc ?? 0)) })}</Badge>}
                  </div>
                </td>
                <td className="text-right whitespace-nowrap">
                  {def?.multi && (
                    <IconButton size="sm" label={t('skills.addSpecialtyLabel', { name: t(`skillNames.${row.skill_id}`) })}
                      onClick={() => actions.create('skills', { skill_id: row.skill_id })}><Icon name="plus" size={14} /></IconButton>
                  )}
                  {(custom || siblings > 1) && (
                    <ConfirmButton icon label={t('common.delete')} onConfirm={() => actions.removeUndoable('skills', row, t('common.removed', { name }))} />
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {rows.length === 0 && (
        <EmptyState icon="search" title={query ? t('common.notFound', { q: query }) : t('skills.noneInFilter')}
          action={(query || filter !== 'all') && <button type="button" className="text-gold text-xs underline cursor-pointer" onClick={() => { setQuery(''); setFilter('all') }}>{t('common.clearSearch')}</button>} />
      )}
    </Section>
  )
}
