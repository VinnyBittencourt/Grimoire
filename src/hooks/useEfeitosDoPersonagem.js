import { useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { getTalentoPorId } from '../services/dnd35Feats'

/**
 * Agrega todos os efeitos mecânicos dos talentos do personagem ativo.
 * Retorna um objeto com os bônus totais por tipo.
 */
export function useEfeitosDoPersonagem() {
  const { db, personagemAtivo } = useApp()

  return useMemo(() => {
    const resultado = {
      bonus_save_fortitude: 0,
      bonus_save_reflex: 0,
      bonus_save_will: 0,
      bonus_initiative: 0,
      bonus_hp: 0,
      // array de 10: bônus por nível de magia (índice 0-9)
      bonus_slots: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      bonus_turning: 0,
      // mapa: nome_recurso → bônus de usos
      bonus_resources: {},
    }

    if (!personagemAtivo || !db?.talentos) return resultado

    const talentosDoPersonagem = db.talentos.filter(
      t => t.personagem_id === personagemAtivo.id
    )

    for (const talento of talentosDoPersonagem) {
      // Talentos customizados sem feat_id não têm efeitos estruturados
      if (!talento.feat_id) continue

      const featData = getTalentoPorId(talento.feat_id)
      if (!featData?.efeitos) continue

      for (const efeito of featData.efeitos) {
        switch (efeito.tipo) {
          case 'bonus_save':
            if (efeito.alvo === 'fortitude') resultado.bonus_save_fortitude += efeito.valor
            else if (efeito.alvo === 'reflex') resultado.bonus_save_reflex += efeito.valor
            else if (efeito.alvo === 'will') resultado.bonus_save_will += efeito.valor
            break

          case 'bonus_initiative':
            resultado.bonus_initiative += efeito.valor
            break

          case 'bonus_hp':
            resultado.bonus_hp += efeito.valor
            break

          case 'bonus_slot': {
            const nivelSlot = parseInt(efeito.alvo, 10)
            if (!isNaN(nivelSlot) && nivelSlot >= 0 && nivelSlot <= 9) {
              resultado.bonus_slots[nivelSlot] += efeito.valor
            }
            break
          }

          case 'bonus_turning':
            resultado.bonus_turning += efeito.valor
            break

          case 'bonus_resource': {
            const nomeRecurso = efeito.alvo
            if (nomeRecurso) {
              resultado.bonus_resources[nomeRecurso] =
                (resultado.bonus_resources[nomeRecurso] || 0) + efeito.valor
            }
            break
          }

          default:
            break
        }
      }
    }

    return resultado
  }, [db?.talentos, personagemAtivo?.id])
}
