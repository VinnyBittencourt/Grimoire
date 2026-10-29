import { describe, it, expect } from 'vitest'
import { translations } from '../../src/i18n/translations.js'
import { CLASS_IDS } from '../../shared/constants/classes.js'
import { SKILLS } from '../../shared/constants/skills.js'
import { SIZE_IDS } from '../../shared/constants/sizes.js'
import { RESOURCES } from '../../shared/rules/resources.js'
import { EQUIPMENT_SLOTS } from '../../shared/constants/equipment.js'

const flatten = (obj, prefix = '') => Object.entries(obj).flatMap(([k, v]) =>
  v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`])

describe('traduções', () => {
  const pt = new Set(flatten(translations.pt))
  const en = new Set(flatten(translations.en))

  it('pt e en têm exatamente as mesmas chaves', () => {
    expect([...pt].filter(k => !en.has(k)), 'faltando em en').toEqual([])
    expect([...en].filter(k => !pt.has(k)), 'faltando em pt').toEqual([])
  })

  it('toda classe, perícia, tamanho, recurso e slot tem rótulo', () => {
    const missing = [
      ...CLASS_IDS.map(id => `classes.${id}`),
      ...SKILLS.map(s => `skillNames.${s.id}`),
      ...SIZE_IDS.map(s => `sizes.${s}`),
      ...Object.keys(RESOURCES).map(k => `resources.names.${k}`),
      ...EQUIPMENT_SLOTS.map(s => `inventory.slots.${s}`),
    ].filter(k => !pt.has(k))
    expect(missing).toEqual([])
  })
})
