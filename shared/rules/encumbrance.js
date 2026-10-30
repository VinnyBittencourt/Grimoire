import { SIZES } from '../constants/sizes.js'

// Carga pesada máxima (lb) por For 1–29 (PHB tabela 9-1). Leve = ⌊pesada/3⌋, média = ⌊2·pesada/3⌋.
const HEAVY = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 115, 130, 150, 175, 200, 230, 260, 300, 350,
  400, 460, 520, 600, 700, 800, 920, 1040, 1200, 1400]

export function heavyLoad(str) {
  if (str <= 0) return 0
  if (str <= 29) return HEAVY[str - 1]
  // Acima de 29: ×4 a cada +10
  return heavyLoad(str - 10) * 4
}

export function loadLimits(str, size = 'medium') {
  const heavy = heavyLoad(str) * (SIZES[size]?.carry ?? 1)
  return { light: Math.floor(heavy / 3), medium: Math.floor((heavy * 2) / 3), heavy }
}

// 50 moedas = 1 lb (PHB p. 112)
export function carriedWeight(items = [], c = {}) {
  const items_ = items.reduce((acc, it) => acc + (Number(it.weight_lb) || 0) * (Number(it.qty) || 0), 0)
  const coins = (Number(c.cp) || 0) + (Number(c.sp) || 0) + (Number(c.gp) || 0) + (Number(c.pp) || 0)
  return items_ + coins / 50
}

export function loadStatus(weight, limits) {
  if (weight <= limits.light) return 'light'
  if (weight <= limits.medium) return 'medium'
  if (weight <= limits.heavy) return 'heavy'
  return 'over'
}

/**
 * Efeitos da carga (SRD, "Carrying Loads"): média = Des máx. +3 e penalidade −3; pesada = +1 e −6.
 * Acima da pesada (até o dobro, "Lifting and Dragging"): perde o bônus de Des na CA (Des máx. 0) e anda 5 ft.
 * Com armadura, vale o pior de cada um (não somam): a combinação é feita em computeSheet.
 */
export const LOAD_EFFECTS = {
  light: null,
  medium: { maxDex: 3, acp: 3 },
  heavy: { maxDex: 1, acp: 6 },
  over: { maxDex: 0, acp: 6 },
}

// Tabela "Reduced Speed" do SRD (20→15, 30→20, 40→30, 50→35, 60→40 … 100→70): ⅔ arredondado para cima em 5 ft
export function reducedSpeed(base) {
  const b = Number(base) || 0
  return Math.ceil((b * 2) / 3 / 5) * 5
}

/**
 * Deslocamento com a carga. ignoresLoad: o anão anda no deslocamento base com carga média/pesada
 * (SRD, Races: Dwarves). Acima da pesada, 5 ft para qualquer um.
 */
export function speedWithLoad(base, status, { ignoresLoad = false } = {}) {
  const b = Number(base) || 0
  if (status === 'over') return Math.min(b, 5)
  if ((status === 'medium' || status === 'heavy') && !ignoresLoad) return reducedSpeed(b)
  return b
}

