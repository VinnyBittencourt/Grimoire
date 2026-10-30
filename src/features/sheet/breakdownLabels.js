// Converte as parcelas de sheet.breakdown ([{ key, value, ref }]) em linhas do <Breakdown> já traduzidas.
// Só rótulos: os valores vêm prontos do motor (shared/rules/breakdown.js).
export function labelParts(parts, { t, className, ch }) {
  return parts.map((p, i) => {
    let label
    if (p.key === 'class') {
      const row = ch.classes.find(c => c.id === p.ref)
      label = row ? `${className(row)} ${row.level}` : t('breakdown.parts.base')
    } else if (p.key === 'ability') {
      label = t('breakdown.parts.ability', { ab: t(`abilities.${p.ref}`) })
    } else {
      label = t(`breakdown.parts.${p.key}`)
    }
    return { key: `${p.key}-${p.ref ?? i}`, label, value: p.value, always: p.key === 'base' || p.key === 'bab' || p.key === 'ranks' || p.key === 'ability' }
  })
}
