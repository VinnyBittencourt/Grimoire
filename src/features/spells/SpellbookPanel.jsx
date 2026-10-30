import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { Section } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { Modal } from '../../ui/Modal'
import { TextField, SelectField } from '../../ui/fields'
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

  const mine = useMemo(() => ch.spells.filter(s => s.class_row_id === cast.rowId || (isFirst && s.class_row_id == null)), [ch.spells, cast.rowId, isFirst])
  const levels = cast.perDay.map((v, L) => ({ L, v })).filter(x => x.v != null || mine.some(s => s.level === x.L))
  const atLevel = mine.filter(s => s.level === level).sort((a, b) => a.name.localeCompare(b.name))
  const knownLimit = cast.known?.[level]
  const builtin = builtinSpells[cast.classId]?.[level] ?? []
  const has = name => mine.some(s => s.level === level && s.name === name)

  return (
    <Section title={cast.type === 'spontaneous' ? t('spells.known') : t('spells.grimoire')}
      actions={<Button size="sm" onClick={() => setAdding(true)}>{t('spells.addSpell')}</Button>}>
      <div className="flex flex-wrap gap-1 mb-3" role="tablist">
        {levels.map(({ L }) => (
          <button key={L} type="button" role="tab" aria-selected={level === L} onClick={() => setLevel(L)}
            className={`px-2.5 py-1 rounded-sm border text-[11px] font-display cursor-pointer ${level === L ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment'}`}>
            {L} <span className="text-dim">({mine.filter(s => s.level === L).length})</span>
          </button>
        ))}
      </div>
      {knownLimit != null && (
        <p className={`text-[11px] mt-0 mb-2 ${atLevel.length > knownLimit ? 'text-bad' : 'text-muted'}`}>{t('spells.known')}: {atLevel.length} / {knownLimit}</p>
      )}
      <ul className="flex flex-col gap-1 list-none p-0 m-0">
        {atLevel.map(s => (
          <li key={s.id} className="rounded-sm border border-subtle bg-sunken">
            <div className="flex items-center gap-2 px-2 py-1.5">
              <EscolaIcon escola={s.school ?? 'Universal'} size={22} />
              <button type="button" className="flex-1 min-w-0 text-left cursor-pointer" onClick={() => setEditing(editing === s.id ? null : s.id)}>
                <span className="block text-xs text-parchment truncate">{spellName(s.name)}</span>
                <span className="block text-[10px] text-dim">{schoolName(s.school)}</span>
              </button>
              <ConfirmButton label={t('common.delete')} className="text-dim hover:text-bad px-1 text-xs" onConfirm={() => actions.remove('spells', s.id)}>✕</ConfirmButton>
            </div>
            {editing === s.id && (
              <div className="grid grid-cols-3 gap-2 px-2 pb-2 border-t border-subtle pt-2">
                <TextField className="col-span-2" label={t('common.name')} value={s.name} nullable={false} onCommit={v => actions.update('spells', s.id, { name: v })} />
                <SelectField label={t('spells.school')} value={s.school} placeholder="—" options={SPELL_SCHOOLS.map(sc => ({ value: sc, label: schoolName(sc) }))}
                  onCommit={v => actions.update('spells', s.id, { school: v })} />
                <TextField className="col-span-3" label={t('common.description')} value={s.description} multiline rows={2} onCommit={v => actions.update('spells', s.id, { description: v })} />
              </div>
            )}
          </li>
        ))}
        {atLevel.length === 0 && <li className="text-dim text-xs">{t('common.empty')}</li>}
      </ul>

      <Modal open={adding} onClose={() => setAdding(false)} title={`${t('spells.addSpell').replace('+ ', '')} — ${level === 0 ? t('spells.level0') : t('spells.levelN', { n: level })}`} width={640} closeOnBackdrop>
        <div className="flex flex-col gap-4">
          <form className="flex gap-2 items-end" onSubmit={async e => {
            e.preventDefault()
            const form = e.currentTarget // currentTarget vira null depois do await
            const data = new FormData(form)
            const name = data.get('name')?.toString().trim()
            if (!name) return
            if (await actions.create('spells', { name, level, class_row_id: cast.rowId, school: data.get('school') || null })) form.reset()
          }}>
            <label className="flex-1"><span className="label block mb-1">{t('spells.custom')}</span><input name="name" data-autofocus className="field" /></label>
            <label className="w-40"><span className="label block mb-1">{t('spells.school')}</span>
              <select name="school" className="field" defaultValue="">
                <option value="">—</option>
                {SPELL_SCHOOLS.map(sc => <option key={sc} value={sc}>{schoolName(sc)}</option>)}
              </select>
            </label>
            <Button type="submit" variant="gold">{t('common.add')}</Button>
          </form>
          {builtin.length > 0 && (
            <div>
              <h4 className="section-title mt-0 mb-2">{t('spells.builtin')}</h4>
              <ul className="grid grid-cols-2 gap-1 list-none p-0 m-0">
                {builtin.map(b => (
                  <li key={b.name}>
                    <button type="button" disabled={has(b.name)} title={b.description}
                      onClick={() => actions.create('spells', { name: b.name, level, class_row_id: cast.rowId, school: b.school, description: b.description, builtin_key: b.name })}
                      className="w-full flex items-center gap-2 rounded-sm border border-subtle px-2 py-1 text-left text-xs cursor-pointer hover:border-gold disabled:opacity-40 disabled:cursor-default">
                      <EscolaIcon escola={b.school} size={18} />
                      <span className="flex-1 truncate text-parchment">{spellName(b.name)}</span>
                      {has(b.name) && <span className="text-good text-[10px]">✓</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Modal>
    </Section>
  )
}
