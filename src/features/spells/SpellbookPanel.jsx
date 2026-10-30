import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { Section, Badge } from '../../ui/layout'
import { Button, IconButton } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { Modal } from '../../ui/Modal'
import { TextField, SelectField } from '../../ui/fields'
import { Notice } from '../../ui/Popover'
import { Icon } from '../../ui/Icon'
import { EscolaIcon } from '../../assets/icons/escolaIcons'
import { SPELL_SCHOOLS } from '../../../shared/constants/equipment.js'
import builtinSpells from '../../data/builtinSpells.json'

/**
 * Grimório / magias conhecidas da classe. Magias sem classe (importadas) aparecem na primeira
 * classe conjuradora. Inclui a lista padrão do v1 (MAGIAS_PADRAO) para adicionar com um clique.
 */
export function SpellbookPanel({ ch, cast, actions, isFirst }) {
  const { t, spellName, schoolName } = useLang()
  const [level, setLevel] = useState(0)
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('')

  const mine = useMemo(() => ch.spells.filter(s => s.class_row_id === cast.rowId || (isFirst && s.class_row_id == null)), [ch.spells, cast.rowId, isFirst])
  const levels = cast.perDay.map((v, L) => ({ L, v })).filter(x => x.v != null || mine.some(s => s.level === x.L))
  const atLevel = mine.filter(s => s.level === level).sort((a, b) => a.name.localeCompare(b.name))
  const knownLimit = cast.known?.[level]
  const builtin = builtinSpells[cast.classId]?.[level] ?? []
  const has = name => mine.some(s => s.level === level && s.name === name)
  const preparedCount = id => ch.prepared.filter(p => p.spell_id === id).length
  const levelName = L => (L === 0 ? t('spells.level0') : t('spells.levelN', { n: L }))
  const shownBuiltin = builtin.filter(b => !filter || spellName(b.name).toLowerCase().includes(filter.toLowerCase()))

  return (
    <Section title={cast.type === 'spontaneous' ? t('spells.known') : t('spells.grimoire')}
      actions={<Button size="sm" onClick={() => setAdding(true)}><Icon name="plus" size={14} />{t('spells.addSpellShort')}</Button>}>
      <div className="flex flex-wrap gap-1 mb-3" role="tablist" aria-label={t('spells.grimoire')}>
        {levels.map(({ L }) => {
          const count = mine.filter(s => s.level === L).length
          return (
            <button key={L} type="button" role="tab" aria-selected={level === L} onClick={() => setLevel(L)}
              className={`inline-flex items-center gap-1.5 min-h-7 px-2.5 rounded-sm border text-xs font-display cursor-pointer ${level === L ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment hover:border-wood'}`}>
              {t('spells.levelShort', { n: L })}<span className="text-2xs text-muted tabular-nums">{count}</span>
            </button>
          )
        })}
      </div>
      {knownLimit != null && (
        atLevel.length > knownLimit
          ? <Notice tone="danger" compact className="mb-2">{t('spells.overKnown', { n: atLevel.length, max: knownLimit })}</Notice>
          : <p className="caption mt-0 mb-2">{t('spells.knownCount', { n: atLevel.length, max: knownLimit })}</p>
      )}
      <ul className="flex flex-col gap-1 list-none p-0 m-0">
        {atLevel.map(s => {
          const prep = preparedCount(s.id)
          const isOpen = editing === s.id
          return (
            <li key={s.id} className={`rounded-sm border bg-sunken ${isOpen ? 'border-gold-lo' : 'border-subtle'}`}>
              <div className="flex items-center gap-2 px-2 py-1.5">
                <EscolaIcon escola={s.school ?? 'Universal'} size={22} />
                <div className="flex-1 min-w-0">
                  <span className="block text-sm text-parchment truncate" title={s.description || undefined}>{spellName(s.name)}</span>
                  <span className="block caption">{schoolName(s.school) || '—'}</span>
                </div>
                {prep > 0 && <Badge tone="magic">{t('spells.preparedTimes', { n: prep })}</Badge>}
                <IconButton size="sm" label={isOpen ? t('common.close') : t('common.edit')} aria-expanded={isOpen} onClick={() => setEditing(isOpen ? null : s.id)}>
                  <Icon name={isOpen ? 'chevronUp' : 'pencil'} size={14} />
                </IconButton>
                <ConfirmButton icon label={t('common.delete')} confirmLabel={prep ? t('spells.deletePrepared') : undefined}
                  onConfirm={() => actions.remove('spells', s.id)} />
              </div>
              {isOpen && (
                <div className="grid grid-cols-3 gap-2 px-2 pb-2 border-t border-subtle pt-2">
                  <TextField className="col-span-2" label={t('common.name')} value={s.name} nullable={false} onCommit={v => actions.update('spells', s.id, { name: v })} />
                  <SelectField label={t('spells.school')} value={s.school} placeholder="—" options={SPELL_SCHOOLS.map(sc => ({ value: sc, label: schoolName(sc) }))}
                    onCommit={v => actions.update('spells', s.id, { school: v })} />
                  <TextField className="col-span-3" label={t('common.description')} value={s.description} multiline rows={3} onCommit={v => actions.update('spells', s.id, { description: v })} />
                </div>
              )}
            </li>
          )
        })}
        {atLevel.length === 0 && (
          <li className="flex items-center gap-2 rounded-sm border border-dashed border-wood px-3 py-3 text-sm text-muted">
            <Icon name="scroll" className="text-gold-lo" />
            <span className="flex-1">{t('spells.noneAtLevel', { level: levelName(level) })}</span>
            <Button size="sm" onClick={() => setAdding(true)}>{t('spells.addSpellShort')}</Button>
          </li>
        )}
      </ul>

      <Modal open={adding} onClose={() => setAdding(false)} title={t('spells.addTitle', { level: levelName(level) })} width={680}>
        <div className="flex flex-col gap-4">
          <form className="flex gap-2 items-end" onSubmit={async e => {
            e.preventDefault()
            const form = e.currentTarget // currentTarget vira null depois do await
            const data = new FormData(form)
            const name = data.get('name')?.toString().trim()
            if (!name) return
            if (await actions.create('spells', { name, level, class_row_id: cast.rowId, school: data.get('school') || null })) form.reset()
          }}>
            <label className="flex-1"><span className="label block mb-1">{t('spells.customName')}</span><input name="name" data-autofocus className="field" placeholder={t('spells.customPlaceholder')} /></label>
            <label className="w-44"><span className="label block mb-1">{t('spells.school')}</span>
              <select name="school" className="field" defaultValue="">
                <option value="">—</option>
                {SPELL_SCHOOLS.map(sc => <option key={sc} value={sc}>{schoolName(sc)}</option>)}
              </select>
            </label>
            <Button type="submit" variant="gold">{t('common.add')}</Button>
          </form>
          {builtin.length > 0 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="section-title m-0">{t('spells.builtin')}</h4>
                <input className="field field-sm max-w-52" placeholder={t('spells.filterList')} aria-label={t('spells.filterList')} value={filter} onChange={e => setFilter(e.target.value)} />
              </div>
              <ul className="grid grid-cols-2 gap-1 list-none p-0 m-0">
                {shownBuiltin.map(b => {
                  const inBook = has(b.name)
                  return (
                    <li key={b.name}>
                      <button type="button" disabled={inBook} title={b.description}
                        onClick={() => actions.create('spells', { name: b.name, level, class_row_id: cast.rowId, school: b.school, description: b.description, builtin_key: b.name })}
                        className="w-full flex items-center gap-2 rounded-sm border border-subtle px-2 py-1.5 text-left text-sm cursor-pointer hover:border-gold hover:bg-gold-faint disabled:cursor-default disabled:hover:border-subtle disabled:hover:bg-transparent">
                        <EscolaIcon escola={b.school} size={18} />
                        <span className={`flex-1 truncate ${inBook ? 'text-muted' : 'text-parchment'}`}>{spellName(b.name)}</span>
                        {inBook
                          ? <span className="inline-flex items-center gap-1 text-xs text-good"><Icon name="check" size={13} />{t('spells.inGrimoire')}</span>
                          : <Icon name="plus" size={14} className="text-gold" />}
                      </button>
                    </li>
                  )
                })}
              </ul>
              {shownBuiltin.length === 0 && <p className="caption m-0">{t('common.notFound', { q: filter })}</p>}
            </div>
          )}
        </div>
      </Modal>
    </Section>
  )
}
