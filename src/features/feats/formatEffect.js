// Texto curto de um efeito de talento (featsData.json → efeitos[]).
// Substitui formatarEfeito do v1, que mostrava "+-1" em efeitos negativos e só falava pt.
import { SKILL_FROM_PT } from '../../../shared/constants/skills.js'

const SAVE = { fortitude: 'fort', reflex: 'ref', will: 'will' }

export function formatEffect(e, { t, signed }) {
  const v = signed(Number(e.valor) || 0)
  switch (e.tipo) {
    case 'bonus_save': return `${v} ${t(`saves.${SAVE[e.alvo] ?? e.alvo}`)}`
    case 'bonus_initiative': return `${v} ${t('vitals.init')}`
    case 'bonus_hp': return `${v} ${t('vitals.hp')}${/n[íi]vel/i.test(e.nota ?? '') ? ' / nv' : ''}`
    case 'bonus_slot': return `${v} slot ${t('spells.levelN', { n: e.alvo })}`
    case 'bonus_turning': return `${v} ${t('resources.names.turnundead')}`
    case 'bonus_resource': return `${v} ${e.alvo}`
    case 'bonus_skill': {
      const id = SKILL_FROM_PT[e.alvo]
      return `${v} ${id ? t(`skillNames.${id}`) : e.alvo}`
    }
    case 'bonus_attack': return `${v} ${t('core.attack.total')} (${e.alvo})`
    case 'bonus_damage': return `${v} ${t('core.attack.dice')} (${e.alvo})`
    default: return e.nota?.split(';')[0]?.trim() || e.tipo
  }
}
