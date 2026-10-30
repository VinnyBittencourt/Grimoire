// Estado do servidor via TanStack Query. A ficha inteira de um personagem fica em
// ['character', id]; cada mutação atualiza o cache de forma otimista e desfaz em caso de erro.
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { api, resizeImage } from '../api/client'
import { useToast } from '../ui/Toast'
import { useLang } from '../i18n'

export const keys = {
  list: ['characters'],
  sheet: id => ['character', Number(id)],
  journal: id => ['journal', Number(id)],
  ref: table => ['ref', table],
}

// Coleção da API → chave no agregado da ficha (GET /api/characters/:id)
const SHEET_KEY = {
  classes: 'classes', skills: 'skills', attacks: 'attacks', items: 'items', feats: 'feats',
  resources: 'resources', spells: 'spells', prepared: 'prepared', summons: 'summons',
}
const JOURNAL_COLLECTIONS = new Set(['players', 'npcs', 'places', 'quests', 'notes'])

export function useCharacters() {
  return useQuery({ queryKey: keys.list, queryFn: () => api.get('/api/characters') })
}

export function useCharacter(id) {
  return useQuery({ queryKey: keys.sheet(id), queryFn: () => api.get(`/api/characters/${id}`), enabled: Boolean(id) })
}

export function useJournal(id) {
  return useQuery({ queryKey: keys.journal(id), queryFn: () => api.get(`/api/characters/${id}/journal`), enabled: Boolean(id) })
}

export function useRefData(table) {
  return useQuery({ queryKey: keys.ref(table), queryFn: () => api.get(`/api/ref/${table}`), staleTime: Infinity })
}

// Talentos + falhas de referência num Map (usado pelo motor de regras)
export function useRefFeats() {
  const feats = useRefData('ref_talentos')
  const flaws = useRefData('ref_falhas')
  return useMemo(() => new Map([...(feats.data ?? []), ...(flaws.data ?? [])].map(f => [f.id, f])), [feats.data, flaws.data])
}

export function useCreateCharacter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: body => api.post('/api/characters', body),
    onSuccess: sheet => {
      qc.setQueryData(keys.sheet(sheet.id), sheet)
      qc.invalidateQueries({ queryKey: keys.list })
    },
  })
}

export function useDeleteCharacter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: id => api.del(`/api/characters/${id}`),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: keys.sheet(id) })
      qc.invalidateQueries({ queryKey: keys.list })
    },
  })
}

export function useImport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ kind, data }) => api.post(kind === 'roll20' ? '/api/import/roll20' : '/api/import', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.list }),
  })
}

/**
 * Todas as escritas de uma ficha. Optimistic update: aplica no cache na hora; se o servidor
 * recusar, restaura e mostra o erro num toast.
 * Cada função resolve com a resposta do servidor (ou `true` se não houver corpo) quando deu
 * certo, e com `undefined` quando falhou. Nunca rejeita. Antes de fechar modal, limpar
 * formulário ou mostrar "sucesso", confira o retorno: `if (await actions.x(...)) ...`
 */
export function useSheetActions(id) {
  const qc = useQueryClient()
  const toast = useToast()
  const { t } = useLang()
  const sheetKey = keys.sheet(id)
  const journalKey = keys.journal(id)

  const mutation = useMutation({
    mutationFn: ({ run }) => run(),
    onMutate: async ({ optimistic, key = sheetKey }) => {
      if (!optimistic) return {}
      await qc.cancelQueries({ queryKey: key })
      const previous = qc.getQueryData(key)
      if (previous) qc.setQueryData(key, optimistic(structuredClone(previous)))
      return { previous, key }
    },
    onError: (err, vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(ctx.key, ctx.previous)
      // Outra mutação pode ter alterado o cache no meio: a fonte da verdade é o servidor
      qc.invalidateQueries({ queryKey: vars.key ?? sheetKey })
      toast.error(err.message)
    },
    onSuccess: (data, { apply, key = sheetKey }) => {
      if (apply) qc.setQueryData(key, prev => (prev ? apply(structuredClone(prev), data) : prev))
    },
    onSettled: (data, err, { refetch }) => {
      if (refetch) for (const k of refetch) qc.invalidateQueries({ queryKey: k })
      qc.invalidateQueries({ queryKey: keys.list, refetchType: 'none' })
    },
  })
  const run = vars => mutation.mutateAsync(vars).then(data => data ?? true, () => undefined)

  const replaceIn = (list, row) => list.map(r => (r.id === row.id ? row : r))

  return {
    patchCharacter: values => run({
      run: () => api.patch(`/api/characters/${id}`, values),
      optimistic: s => ({ ...s, ...values }),
      apply: (s, row) => ({ ...s, ...row }),
      refetch: 'background' in values ? [journalKey] : null,
    }),

    create: (collection, values) => {
      const journal = JOURNAL_COLLECTIONS.has(collection)
      return run({
        run: () => api.post(`/api/characters/${id}/${collection}`, values),
        key: journal ? journalKey : sheetKey,
        apply: (s, row) => ({ ...s, [SHEET_KEY[collection] ?? collection]: [...(s[SHEET_KEY[collection] ?? collection] ?? []), row] }),
        // Adicionar/remover classe muda recursos no servidor
        refetch: collection === 'classes' ? [sheetKey] : null,
      })
    },

    update: (collection, rowId, values) => {
      const journal = JOURNAL_COLLECTIONS.has(collection)
      const listKey = SHEET_KEY[collection] ?? collection
      return run({
        run: () => api.patch(`/api/characters/${id}/${collection}/${rowId}`, values),
        key: journal ? journalKey : sheetKey,
        optimistic: s => ({ ...s, [listKey]: (s[listKey] ?? []).map(r => (r.id === rowId ? { ...r, ...values } : r)) }),
        apply: (s, row) => ({ ...s, [listKey]: replaceIn(s[listKey] ?? [], row) }),
        refetch: collection === 'classes' ? [sheetKey] : null,
      })
    },

    remove: (collection, rowId) => {
      const journal = JOURNAL_COLLECTIONS.has(collection)
      const listKey = SHEET_KEY[collection] ?? collection
      return run({
        run: () => api.del(`/api/characters/${id}/${collection}/${rowId}`),
        key: journal ? journalKey : sheetKey,
        optimistic: s => ({ ...s, [listKey]: (s[listKey] ?? []).filter(r => r.id !== rowId) }),
        // Remover magia/classe/NPC apaga dependentes no servidor (cascade)
        refetch: ['spells', 'classes'].includes(collection) ? [sheetKey] : collection === 'npcs' ? [journalKey] : null,
      })
    },

    setSlot: (classRowId, level, values) => run({
      run: () => api.put(`/api/characters/${id}/spell-slots/${classRowId}/${level}`, values),
      optimistic: s => {
        const slots = s.spell_slots ?? []
        const found = slots.find(x => x.class_row_id === classRowId && x.level === level)
        s.spell_slots = found
          ? slots.map(x => (x === found ? { ...x, ...values } : x))
          : [...slots, { class_row_id: classRowId, level, bonus: 0, used: 0, ...values }]
        return s
      },
      apply: (s, row) => ({ ...s, spell_slots: [...(s.spell_slots ?? []).filter(x => !(x.class_row_id === classRowId && x.level === level)), row] }),
    }),

    setUse: (resourceId, idx, values) => run({
      run: () => api.put(`/api/characters/${id}/resources/${resourceId}/uses/${idx}`, values),
      optimistic: s => {
        s.resources = s.resources.map(r => {
          if (r.id !== resourceId) return r
          const uses = r.uses.filter(u => u.idx !== idx)
          const old = r.uses.find(u => u.idx === idx) ?? { resource_id: resourceId, idx, used: 0, note: null }
          return { ...r, uses: [...uses, { ...old, ...values, used: values.used != null ? (values.used ? 1 : 0) : old.used }].sort((a, b) => a.idx - b.idx) }
        })
        return s
      },
      apply: (s, row) => ({ ...s, resources: replaceIn(s.resources, row) }),
    }),

    resetResource: resourceId => run({
      run: () => api.post(`/api/characters/${id}/resources/${resourceId}/reset`),
      optimistic: s => ({ ...s, resources: s.resources.map(r => (r.id === resourceId ? { ...r, uses: [], pool_used: 0 } : r)) }),
      apply: (s, row) => ({ ...s, resources: replaceIn(s.resources, row) }),
    }),

    replacePrepared: (classRowId, slots) => run({
      run: () => api.put(`/api/characters/${id}/prepared`, { class_row_id: classRowId, slots }),
      apply: (s, rows) => ({ ...s, prepared: rows }),
    }),

    rest: heal => run({
      run: () => api.post(`/api/characters/${id}/rest`, { heal }),
      apply: (s, sheet) => sheet,
    }),

    uploadPhoto: async (file, npcId = null) => {
      let blob
      try { blob = await resizeImage(file) } catch {
        toast.error(t('errors.imageRead'))
        return undefined
      }
      return run({
        run: () => api.put(npcId ? `/api/characters/${id}/npcs/${npcId}/photo` : `/api/characters/${id}/photo`, blob),
        key: npcId ? journalKey : sheetKey,
        apply: (s, row) => (npcId ? { ...s, npcs: replaceIn(s.npcs, row) } : { ...s, photo: row.photo }),
      })
    },

    removePhoto: () => run({
      run: () => api.del(`/api/characters/${id}/photo`),
      optimistic: s => ({ ...s, photo: null }),
    }),
  }
}
