// Utilitário de formatação de efeitos de talentos D&D 3.5
// Os dados (TALENTOS_DND35, FALHAS_DND35) vivem no banco SQLite (ref_talentos, ref_falhas)
// e são acessados via refData no AppContext.

export function formatarEfeito(efeito) {
  switch (efeito.tipo) {
    case 'bonus_save':
      return `+${efeito.valor} ${efeito.alvo === 'fortitude' ? 'Fortitude' : efeito.alvo === 'reflex' ? 'Reflexos' : 'Vontade'}`
    case 'bonus_initiative':
      return `+${efeito.valor} Iniciativa`
    case 'bonus_hp':
      return `+${efeito.valor} PV`
    case 'bonus_slot':
      return `+${efeito.valor} slot nv${efeito.alvo}`
    case 'bonus_turning':
      return `+${efeito.valor} Expulsar`
    case 'bonus_resource':
      return `+${efeito.valor} ${efeito.alvo}`
    case 'bonus_skill':
      return `+${efeito.valor} ${efeito.alvo}`
    case 'bonus_attack':
      return `+${efeito.valor} ataque`
    case 'bonus_damage':
      return `+${efeito.valor} dano`
    case 'especial':
      return efeito.nota?.split(';')[0]?.trim() || 'Especial'
    default:
      return efeito.nota || efeito.tipo
  }
}
