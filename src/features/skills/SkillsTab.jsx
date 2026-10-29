import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge } from '../../ui/layout'
import { NumberField, TextField, SelectField, Checkbox } from '../../ui/fields'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { SKILL_BY_ID } from '../../../shared/constants/skills.js'
import { ABILITIES } from '../../../shared/constants/abilities.js'

export default function SkillsTab({ ch, sheet, actions }) {
  const { t, signed, skillName } = useLang()
  const [onlyTrained, setOnlyTrained] = useState(false)
  const [query, setQuery] = useState('')

  const rows = useMemo(() => {
    const byId = new Map(sheet.skills.map(s => [s.id, s]))
    return ch.skills
      .map(row => ({ row, calc: byId.get(row.id), def: SKILL_BY_ID[row.skill_id] }))
      .filter(({ row }) => !onlyTrained || row.ranks > 0)
      .filter(({ row }) => !query || skillName(row).toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => skillName(a.row).localeCompare(skillName(b.row)))
  }, [ch.skills, sheet.skills, onlyTrained, query, skillName])

  const { spent, available } = sheet.skillPoints
  const over = spent > available

  return (
    <Section title={t('skills.title')} actions={
      <div className="flex items-center gap-3">
        <span className={`text-xs ${over ? 'text-bad' : 'text-muted'}`}>{t('skills.points', { spent, available })}</span>
        <input className="field field-sm w-40" placeholder={t('common.search')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('common.search')} />
        <Checkbox checked={onlyTrained} onChange={setOnlyTrained} label={t('skills.showTrained')} />
        <Button size="sm" onClick={() => actions.create('skills', { skill_id: `custom_${Date.now().toString(36)}`, custom_name: t('skills.addCustom').replace('+ ', ''), ability: 'int' })}>
          {t('skills.addCustom')}
        </Button>
      </div>
    }>
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 bg-[var(--color-surface)] z-10">
          <tr className="text-dim text-[10px] uppercase tracking-wider">
            <th className="font-normal w-8" title={t('skills.classSkill')}>✦</th>
            <th className="font-normal text-left">{t('common.name')}</th>
            <th className="font-normal w-12">{t('skills.ability')}</th>
            <th className="font-normal w-14">{t('skills.total')}</th>
            <th className="font-normal w-16">{t('skills.ranks')}</th>
            <th className="font-normal w-16">{t('common.misc')}</th>
            <th className="font-normal text-left">{''}</th>
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ row, calc, def }) => {
            const custom = !def
            const tooMany = row.ranks > calc.maxRanks
            return (
              <tr key={row.id} className={`border-t border-subtle ${calc.untrainedBlocked ? 'opacity-50' : ''}`}>
                <td className="text-center">
                  <Checkbox checked={calc.classSkill} title={t('skills.classSkill')}
                    onChange={v => actions.update('skills', row.id, { class_skill: v })} />
                </td>
                <td className="py-1 pr-2">
                  {custom ? (
                    <TextField value={row.custom_name} nullable={false} inputClassName="field-sm" onCommit={v => actions.update('skills', row.id, { custom_name: v })} />
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className={calc.classSkill ? 'text-parchment' : 'text-body'}>{t(`skillNames.${row.skill_id}`)}</span>
                      {def.multi && (
                        <TextField value={row.custom_name} placeholder={t('skills.specialty')} inputClassName="field-sm !w-32"
                          onCommit={v => actions.update('skills', row.id, { custom_name: v })} />
                      )}
                      {def.trained && <span className="text-dim text-[9px]" title={t('skills.trainedOnly')}>●</span>}
                    </div>
                  )}
                </td>
                <td className="text-center text-muted">
                  {custom
                    ? <SelectField value={row.ability} inputClassName="field-sm" options={ABILITIES.map(a => ({ value: a, label: t(`abilities.${a}`) }))}
                        onCommit={v => actions.update('skills', row.id, { ability: v })} />
                    : <span title={signed(calc.ability)}>{t(`abilities.${def.ability}`)}</span>}
                </td>
                <td className="text-center">
                  <span className={`font-display font-bold text-sm ${calc.untrainedBlocked ? 'text-dim' : 'text-gold'}`}>{signed(calc.total)}</span>
                </td>
                <td className="text-center">
                  <NumberField compact value={row.ranks} step={0.5} min={0} max={80} aria-label={`${skillName(row)} ${t('skills.ranks')}`}
                    title={t('skills.maxRanks', { n: calc.maxRanks })} aria-invalid={tooMany}
                    onCommit={v => actions.update('skills', row.id, { ranks: v })} />
                </td>
                <td className="text-center">
                  <NumberField compact value={row.misc} aria-label={`${skillName(row)} ${t('common.misc')}`}
                    onCommit={v => actions.update('skills', row.id, { misc: v })} />
                </td>
                <td className="py-1">
                  <div className="flex flex-wrap gap-1">
                    {calc.acp > 0 && <Badge tone="hp" title={t('skills.acp')}>−{calc.acp} ACP</Badge>}
                    {calc.synergy > 0 && <Badge tone="save">{t('skills.synergy', { n: calc.synergy })}</Badge>}
                    {calc.misc !== (row.misc ?? 0) && <Badge tone="magic">{t('core.fromFeats', { n: signed(calc.misc - (row.misc ?? 0)) })}</Badge>}
                    {tooMany && <Badge tone="hp" title={t('skills.overMax')}>{t('skills.maxRanks', { n: calc.maxRanks })}</Badge>}
                  </div>
                </td>
                <td className="text-center">
                  {def?.multi && (
                    <button type="button" title={t('skills.addSpecialty')} aria-label={t('skills.addSpecialty')}
                      className="text-dim hover:text-gold cursor-pointer"
                      onClick={() => actions.create('skills', { skill_id: row.skill_id })}>+</button>
                  )}
                  {(custom || (def?.multi && ch.skills.filter(s => s.skill_id === row.skill_id).length > 1)) && (
                    <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad px-1" onConfirm={() => actions.remove('skills', row.id)}>✕</ConfirmButton>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Section>
  )
}
