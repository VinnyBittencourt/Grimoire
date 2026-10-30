import { SKILL_FROM_PT } from '../constants/skills.js'
import { RESOURCES } from './resources.js'

// Talentos que podem ser escolhidos mais de uma vez com efeito cumulativo
export const REPEATABLE_FEATS = new Set([
  'phb_toughness', 'phb_extra_turning', 'cw_extra_rage', 'cw_extra_smite', 'ca_twin_spell',
  'cadv_extra_wild_shape', 'phb2_extra_music', 'rod_dragonfire_adept',
])

// Alvo de bonus_resource (pt, em featsData.json) → chave de recurso (shared/rules/resources.js)
export const RESOURCE_FROM_PT = {
  'Fúria': 'rage', 'Golpe Sagrado': 'smite', 'Forma Selvagem': 'wildshape',
  'Inspiração Bárdica': 'bardicmusic', 'Inspiração': 'inspiration',
  'Sopro do Dragão': 'dragonbreath', 'Sopro Dracônico': 'dragonbreath',
}

const SAVE_FROM_EFFECT = { fortitude: 'fort', reflex: 'ref', will: 'will' }
const ATTACK_KINDS = new Set(['melee', 'ranged'])

export function emptyEffects() {
  return {
    saves: { fort: 0, ref: 0, will: 0 },
    initiative: 0,
    hp: 0,
    slots: Array(10).fill(0),
    turning: 0,
    grapple: 0,
    resources: {},
    skills: {},
    attack: {}, // só 'melee' e 'ranged'
    damage: {},
    notes: [], // efeitos 'especial' ou situacionais: { feat, text }
  }
}

/**
 * Soma os efeitos mecânicos dos talentos/falhas do personagem.
 * feats: linhas da tabela feats ({ ref_id, name }); refById: Map/objeto ref_id → registro de
 * referência com `efeitos` já parseado. Talentos repetidos só contam uma vez, exceto os
 * de REPEATABLE_FEATS.
 */
export function aggregateEffects(feats, refById, level = 1) {
  const fx = emptyEffects()
  const seen = new Set()
  const get = id => (refById instanceof Map ? refById.get(id) : refById?.[id])

  for (const feat of feats) {
    if (!feat.ref_id) continue
    const ref = get(feat.ref_id)
    if (!ref) continue
    if (seen.has(feat.ref_id) && !REPEATABLE_FEATS.has(feat.ref_id)) continue
    seen.add(feat.ref_id)

    for (const e of ref.efeitos ?? []) {
      const v = Number(e.valor) || 0
      switch (e.tipo) {
        case 'bonus_save': {
          const s = SAVE_FROM_EFFECT[e.alvo]
          if (s) fx.saves[s] += v
          break
        }
        case 'bonus_initiative': fx.initiative += v; break
        case 'bonus_hp':
          fx.hp += /por n[íi]vel/i.test(e.nota ?? '') ? v * level : v
          break
        case 'bonus_slot': {
          const lvl = Number(e.alvo)
          if (lvl >= 0 && lvl <= 9) fx.slots[lvl] += v
          break
        }
        case 'bonus_turning': fx.turning += v; break
        case 'bonus_resource': {
          const key = RESOURCE_FROM_PT[e.alvo] ?? e.alvo
          // Recurso sem fórmula no app (ex.: Sopro Dracônico): vira nota em vez de sumir
          if (RESOURCES[key]) fx.resources[key] = (fx.resources[key] ?? 0) + v
          else fx.notes.push({ feat: ref.id, text: `+${v} ${e.alvo}` })
          break
        }
        case 'bonus_skill': {
          const id = SKILL_FROM_PT[e.alvo]
          if (id) fx.skills[id] = (fx.skills[id] ?? 0) + v
          else fx.notes.push({ feat: ref.id, text: `+${v} ${e.alvo}` })
          break
        }
        case 'bonus_grapple': fx.grapple += v; break
        case 'bonus_attack':
        case 'bonus_damage': {
          const bucket = e.tipo === 'bonus_attack' ? fx.attack : fx.damage
          // Incondicional só corpo a corpo/distância; o resto (ex.: ranged_close, thrown, aoo) vira nota
          if (ATTACK_KINDS.has(e.alvo)) bucket[e.alvo] = (bucket[e.alvo] ?? 0) + v
          else fx.notes.push({ feat: ref.id, text: e.nota ?? `${v >= 0 ? '+' : ''}${v} ${e.tipo === 'bonus_attack' ? 'ataque' : 'dano'} (${e.alvo})` })
          break
        }
        default:
          if (e.nota) fx.notes.push({ feat: ref.id, text: e.nota })
      }
    }
  }
  return fx
}
