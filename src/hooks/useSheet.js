import { useMemo } from 'react'
import { useCharacter, useRefFeats, useSheetActions } from '../queries/characters'
import { computeSheet } from '../../shared/rules/sheet.js'

/**
 * Tudo que uma aba da ficha precisa: dados do servidor (ch), valores calculados (sheet)
 * e as ações de escrita. O cálculo é puro (shared/rules) e memoizado.
 */
export function useSheet(id) {
  const query = useCharacter(id)
  const refFeats = useRefFeats()
  const actions = useSheetActions(id)
  const sheet = useMemo(() => (query.data ? computeSheet(query.data, refFeats) : null), [query.data, refFeats])
  return { ch: query.data, sheet, actions, refFeats, isLoading: query.isLoading, error: query.error, refetch: query.refetch }
}
