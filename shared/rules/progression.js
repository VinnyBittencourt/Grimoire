import { CLASSES } from '../constants/classes.js'
import { SAVES } from '../constants/abilities.js'

// Definição efetiva de uma linha de character_classes: classe de referência + overrides da linha
export function classDef(row) {
  const def = CLASSES[row.class_id] ?? CLASSES.custom
  return {
    ...def,
    hd: row.hd ?? def.hd,
    bab: row.bab_prog ?? def.bab,
    saves: {
      fort: row.fort_prog ?? def.saves.fort,
      ref: row.ref_prog ?? def.saves.ref,
      will: row.will_prog ?? def.saves.will,
    },
  }
}

export function babFor(prog, level) {
  if (prog === 'good') return level
  if (prog === 'avg') return Math.floor((level * 3) / 4)
  return Math.floor(level / 2)
}

export function baseSaveFor(prog, level) {
  return prog === 'good' ? 2 + Math.floor(level / 2) : Math.floor(level / 3)
}

export function characterLevel(classes) {
  return classes.reduce((acc, row) => acc + (Number(row.level) || 0), 0)
}

// Multiclasse: soma por classe (PHB p. 59)
export function baseAttackBonus(classes) {
  return classes.reduce((acc, row) => acc + babFor(classDef(row).bab, Number(row.level) || 0), 0)
}

export function baseSaves(classes) {
  const out = { fort: 0, ref: 0, will: 0 }
  for (const row of classes) {
    const def = classDef(row)
    for (const s of SAVES) out[s] += baseSaveFor(def.saves[s], Number(row.level) || 0)
  }
  return out
}

// Ataques iterativos: +BAB, +BAB−5, ... enquanto positivo (máx. 4)
export function iterativeAttacks(bab, total = bab) {
  const list = [total]
  for (let b = bab - 5, t = total - 5; b > 0 && list.length < 4; b -= 5, t -= 5) list.push(t)
  return list
}
