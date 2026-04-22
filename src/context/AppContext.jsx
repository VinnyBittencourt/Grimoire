import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { loadData, saveDb, addRecord, updateRecord, deleteRecord } from '../services/excelService'

async function fetchRef(table) {
  try {
    const r = await fetch(`/api/ref/${table}`)
    const rows = await r.json()
    return rows.map(row => {
      const parsed = { ...row }
      for (const key of ['categoria', 'efeitos', 'atributos', 'habilidades', 'saves']) {
        if (typeof parsed[key] === 'string') {
          try { parsed[key] = JSON.parse(parsed[key]) } catch { /* keep as string */ }
        }
      }
      return parsed
    })
  } catch {
    return []
  }
}

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [db, setDb] = useState(null)
  const dbRef = useRef(null)
  const [personagemAtivo, setPersonagemAtivo] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [refData, setRefData] = useState({
    talentos: [], falhas: [], racas: [], classes: [], criaturas: []
  })

  useEffect(() => {
    Promise.all([
      fetchRef('ref_talentos'),
      fetchRef('ref_falhas'),
      fetchRef('ref_racas'),
      fetchRef('ref_classes'),
      fetchRef('ref_criaturas'),
    ]).then(([talentos, falhas, racas, classes, criaturas]) => {
      setRefData({ talentos, falhas, racas, classes, criaturas })
    })
  }, [])

  // Mantém ref sincronizada para acesso em callbacks sem stale closure
  const setDbSync = useCallback((novoDb) => {
    dbRef.current = novoDb
    setDb(novoDb)
  }, [])

  // Garante que db está carregado, carregando do servidor se necessário
  const garantirDb = useCallback(async () => {
    if (dbRef.current) return dbRef.current
    const loaded = await loadData()
    setDbSync(loaded)
    return loaded
  }, [setDbSync])

  const persistir = useCallback(async (novoDb) => {
    setDbSync(novoDb)
    setSalvando(true)
    await saveDb(novoDb)
    setSalvando(false)
  }, [setDbSync])

  // ── Personagens ────────────────────────────────────────────
  const criarPersonagem = useCallback(async (dados) => {
    const currentDb = await garantirDb()
    const { db: novoDb, record } = addRecord(currentDb, 'personagens', dados)
    await persistir(novoDb)
    return record
  }, [garantirDb, persistir])

  const editarPersonagem = useCallback(async (id, dados) => {
    const currentDb = await garantirDb()
    const novoDb = updateRecord(structuredClone(currentDb), 'personagens', id, dados)
    await persistir(novoDb)
  }, [garantirDb, persistir])

  const excluirPersonagem = useCallback(async (id) => {
    let novoDb = structuredClone(db)
    novoDb = deleteRecord(novoDb, 'personagens', id)
    novoDb = { ...novoDb, magias: novoDb.magias.filter(m => m.personagem_id !== id) }
    novoDb = { ...novoDb, magias_preparadas: novoDb.magias_preparadas.filter(m => m.personagem_id !== id) }
    novoDb = { ...novoDb, equipamentos: novoDb.equipamentos.filter(e => e.personagem_id !== id) }
    novoDb = { ...novoDb, mochila: (novoDb.mochila || []).filter(m => m.personagem_id !== id) }
    novoDb = { ...novoDb, backgrounds: (novoDb.backgrounds || []).filter(b => b.personagem_id !== id) }
    novoDb = { ...novoDb, players: (novoDb.players || []).filter(p => p.personagem_id !== id) }
    novoDb = { ...novoDb, talentos: (novoDb.talentos || []).filter(t => t.personagem_id !== id) }
    novoDb = { ...novoDb, recursos: (novoDb.recursos || []).filter(r => r.personagem_id !== id) }
    novoDb = { ...novoDb, anotacoes: novoDb.anotacoes.filter(a => a.personagem_id !== id) }
    novoDb = { ...novoDb, npcs: novoDb.npcs.filter(n => n.personagem_id !== id) }
    novoDb = { ...novoDb, locais: novoDb.locais.filter(l => l.personagem_id !== id) }
    novoDb = { ...novoDb, quests: novoDb.quests.filter(q => q.personagem_id !== id) }
    await persistir(novoDb)
    if (personagemAtivo?.id === id) setPersonagemAtivo(null)
  }, [db, personagemAtivo, persistir])

  // ── Magias ─────────────────────────────────────────────────
  const adicionarMagia = useCallback(async (dados) => {
    const { db: novoDb, record } = addRecord(db, 'magias', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarMagia = useCallback(async (id, dados) => {
    const novoDb = updateRecord(structuredClone(db), 'magias', id, dados)
    await persistir(novoDb)
  }, [db, persistir])

  const excluirMagia = useCallback(async (id) => {
    let novoDb = structuredClone(db)
    novoDb = deleteRecord(novoDb, 'magias', id)
    novoDb = { ...novoDb, magias_preparadas: novoDb.magias_preparadas.filter(m => m.magia_id !== id) }
    await persistir(novoDb)
  }, [db, persistir])

  // ── Magias preparadas ──────────────────────────────────────
  const salvarMagiaPreparada = useCallback(async (dados) => {
    const { db: novoDb, record } = addRecord(db, 'magias_preparadas', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const usarMagia = useCallback(async (id) => {
    const novoDb = structuredClone(db)
    const magia = novoDb.magias_preparadas.find(m => m.id === id)
    if (magia && magia.usos_restantes > 0) {
      magia.usos_restantes -= 1
      await persistir(novoDb)
    }
  }, [db, persistir])

  const novoDia = useCallback(async (personagemId) => {
    const novoDb = structuredClone(db)
    novoDb.magias_preparadas = novoDb.magias_preparadas.filter(m => m.personagem_id !== personagemId)
    await persistir(novoDb)
  }, [db, persistir])

  const salvarPreparacao = useCallback(async (personagemId, magiasPreparadas) => {
    const novoDb = structuredClone(db)
    novoDb.magias_preparadas = novoDb.magias_preparadas.filter(m => m.personagem_id !== personagemId)
    let id = novoDb.magias_preparadas.length > 0
      ? Math.max(...novoDb.magias_preparadas.map(r => r.id || 0)) + 1
      : 1
    for (const mp of magiasPreparadas) {
      novoDb.magias_preparadas.push({ id: id++, personagem_id: personagemId, ...mp })
    }
    await persistir(novoDb)
  }, [db, persistir])

  // ── Mochila ─────────────────────────────────────────────────
  const adicionarItemMochila = useCallback(async (dados) => {
    const cloned = structuredClone(db)
    if (!cloned.mochila) cloned.mochila = []
    const { db: novoDb, record } = addRecord(cloned, 'mochila', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarItemMochila = useCallback(async (id, dados) => {
    const novoDb = updateRecord(structuredClone(db), 'mochila', id, dados)
    await persistir(novoDb)
  }, [db, persistir])

  const excluirItemMochila = useCallback(async (id) => {
    const novoDb = deleteRecord(structuredClone(db), 'mochila', id)
    await persistir(novoDb)
  }, [db, persistir])

  // ── Equipamentos ────────────────────────────────────────────
  const salvarEquipamento = useCallback(async (personagemId, slot, dados) => {
    const novoDb = structuredClone(db)
    const idx = novoDb.equipamentos.findIndex(e => e.personagem_id === personagemId && e.slot === slot)
    if (idx >= 0) {
      novoDb.equipamentos[idx] = { ...novoDb.equipamentos[idx], ...dados }
    } else {
      const { db: d2 } = addRecord(novoDb, 'equipamentos', { personagem_id: personagemId, slot, ...dados })
      Object.assign(novoDb, d2)
    }
    await persistir(novoDb)
  }, [db, persistir])

  // ── Background ──────────────────────────────────────────────
  const salvarBackground = useCallback(async (personagemId, texto) => {
    const cloned = structuredClone(db)
    if (!cloned.backgrounds) cloned.backgrounds = []
    const idx = cloned.backgrounds.findIndex(b => b.personagem_id === personagemId)
    if (idx >= 0) {
      cloned.backgrounds[idx] = { ...cloned.backgrounds[idx], texto }
    } else {
      const { db: d2 } = addRecord(cloned, 'backgrounds', { personagem_id: personagemId, texto })
      Object.assign(cloned, d2)
    }
    await persistir(cloned)
  }, [db, persistir])

  // ── Players ─────────────────────────────────────────────────
  const adicionarPlayer = useCallback(async (dados) => {
    const cloned = structuredClone(db)
    if (!cloned.players) cloned.players = []
    const { db: novoDb, record } = addRecord(cloned, 'players', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarPlayer = useCallback(async (id, dados) => {
    const novoDb = updateRecord(structuredClone(db), 'players', id, dados)
    await persistir(novoDb)
  }, [db, persistir])

  const excluirPlayer = useCallback(async (id) => {
    const novoDb = deleteRecord(structuredClone(db), 'players', id)
    await persistir(novoDb)
  }, [db, persistir])

  // ── Talentos ────────────────────────────────────────────────
  const adicionarTalento = useCallback(async (dados) => {
    const cloned = structuredClone(db)
    if (!cloned.talentos) cloned.talentos = []
    const { db: novoDb, record } = addRecord(cloned, 'talentos', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarTalento = useCallback(async (id, dados) => {
    const novoDb = updateRecord(structuredClone(db), 'talentos', id, dados)
    await persistir(novoDb)
  }, [db, persistir])

  const excluirTalento = useCallback(async (id) => {
    const novoDb = deleteRecord(structuredClone(db), 'talentos', id)
    await persistir(novoDb)
  }, [db, persistir])

  // ── Recursos de Classe ──────────────────────────────────────
  const adicionarRecurso = useCallback(async (dados) => {
    const currentDb = await garantirDb()
    const cloned = structuredClone(currentDb)
    if (!cloned.recursos) cloned.recursos = []
    const { db: novoDb, record } = addRecord(cloned, 'recursos', dados)
    await persistir(novoDb)
    return record
  }, [garantirDb, persistir])

  const editarRecurso = useCallback(async (id, dados) => {
    const currentDb = await garantirDb()
    const novoDb = updateRecord(structuredClone(currentDb), 'recursos', id, dados)
    await persistir(novoDb)
  }, [garantirDb, persistir])

  const excluirRecurso = useCallback(async (id) => {
    const currentDb = await garantirDb()
    const novoDb = deleteRecord(structuredClone(currentDb), 'recursos', id)
    await persistir(novoDb)
  }, [garantirDb, persistir])

  // ── Anotações ───────────────────────────────────────────────
  const adicionarAnotacao = useCallback(async (dados) => {
    const { db: novoDb, record } = addRecord(db, 'anotacoes', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarAnotacao = useCallback(async (id, dados) => {
    const currentDb = await garantirDb()
    const novoDb = updateRecord(structuredClone(currentDb), 'anotacoes', id, dados)
    await persistir(novoDb)
  }, [garantirDb, persistir])

  const excluirAnotacao = useCallback(async (id) => {
    const novoDb = deleteRecord(structuredClone(db), 'anotacoes', id)
    await persistir(novoDb)
  }, [db, persistir])

  // ── NPCs ────────────────────────────────────────────────────
  const adicionarNpc = useCallback(async (dados) => {
    const { db: novoDb, record } = addRecord(db, 'npcs', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarNpc = useCallback(async (id, dados) => {
    const novoDb = updateRecord(structuredClone(db), 'npcs', id, dados)
    await persistir(novoDb)
  }, [db, persistir])

  const excluirNpc = useCallback(async (id) => {
    const novoDb = deleteRecord(structuredClone(db), 'npcs', id)
    await persistir(novoDb)
  }, [db, persistir])

  // ── Locais ──────────────────────────────────────────────────
  const adicionarLocal = useCallback(async (dados) => {
    const { db: novoDb, record } = addRecord(db, 'locais', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarLocal = useCallback(async (id, dados) => {
    const novoDb = updateRecord(structuredClone(db), 'locais', id, dados)
    await persistir(novoDb)
  }, [db, persistir])

  const excluirLocal = useCallback(async (id) => {
    const novoDb = deleteRecord(structuredClone(db), 'locais', id)
    await persistir(novoDb)
  }, [db, persistir])

  // ── Quests ──────────────────────────────────────────────────
  const adicionarQuest = useCallback(async (dados) => {
    const { db: novoDb, record } = addRecord(db, 'quests', dados)
    await persistir(novoDb)
    return record
  }, [db, persistir])

  const editarQuest = useCallback(async (id, dados) => {
    const novoDb = updateRecord(structuredClone(db), 'quests', id, dados)
    await persistir(novoDb)
  }, [db, persistir])

  const excluirQuest = useCallback(async (id) => {
    const novoDb = deleteRecord(structuredClone(db), 'quests', id)
    await persistir(novoDb)
  }, [db, persistir])

  // ── Criatura Invocada ───────────────────────────────────────
  const salvarCriaturaInvocada = useCallback(async (personagemId, dados) => {
    const currentDb = await garantirDb()
    const json = dados ? JSON.stringify(dados) : null
    const novoDb = updateRecord(structuredClone(currentDb), 'personagens', personagemId, { criatura_invocada_json: json })
    await persistir(novoDb)
    setPersonagemAtivo(prev => prev?.id === personagemId ? { ...prev, criatura_invocada_json: json } : prev)
  }, [garantirDb, persistir])

  const value = {
    db, setDb: setDbSync,
    personagemAtivo, setPersonagemAtivo,
    salvando,
    refData,
    // personagens
    criarPersonagem, editarPersonagem, excluirPersonagem,
    // magias
    adicionarMagia, editarMagia, excluirMagia,
    // preparação
    salvarMagiaPreparada, usarMagia, novoDia, salvarPreparacao,
    // equipamentos
    salvarEquipamento,
    // mochila
    adicionarItemMochila, editarItemMochila, excluirItemMochila,
    // background & players
    salvarBackground, adicionarPlayer, editarPlayer, excluirPlayer,
    // talentos
    adicionarTalento, editarTalento, excluirTalento,
    // recursos de classe
    adicionarRecurso, editarRecurso, excluirRecurso,
    // sessão
    adicionarAnotacao, editarAnotacao, excluirAnotacao,
    adicionarNpc, editarNpc, excluirNpc,
    adicionarLocal, editarLocal, excluirLocal,
    adicionarQuest, editarQuest, excluirQuest,
    // criatura invocada
    salvarCriaturaInvocada,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
