import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { GENEROS } from '../../services/dnd35Tables'

const TABS = [
  { key: 'background', label: 'Background' },
  { key: 'players', label: 'Players' },
  { key: 'anotacoes', label: 'Anotações' },
  { key: 'npcs', label: 'NPCs' },
  { key: 'locais', label: 'Locais' },
  { key: 'quests', label: 'Quests' },
]

function fileToBase64(file) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.readAsDataURL(file)
  })
}

export default function SessionNotesModal({ abaInicial = 'anotacoes', onClose }) {
  const [aba, setAba] = useState(abaInicial)

  {/* -------- Modal -------- */}
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full  flex flex-col" style={{ height: '88vh', width: '80vw' }}
        onClick={e => e.stopPropagation()}>
        {/* Header com tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 shrink-0">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} className={`tab-btn  ${aba === t.key ? 'active' : ''}`}
                onClick={() => setAba(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ color: '#6b5a3a', fontSize: 18, background: 'none', cursor: 'pointer', border: 'none' }}>✕</button>
        </div>

        <div className="divider-gold mx-6" />

        {/* Conteúdo */}
        <div className="flex-1 overflow-hidden px-6 pb-6" style={{ minHeight: 0 }}>
          {aba === 'background' && <AbaBackground />}
          {aba === 'players' && <AbaPlayers />}
          {aba === 'anotacoes' && <AbaAnotacoes />}
          {aba === 'npcs' && <AbaNpcs />}
          {aba === 'locais' && <AbaLocais />}
          {aba === 'quests' && <AbaQuests />}
        </div>
      </div>
    </div>
  )
}

// ── Background ───────────────────────────────────────────────
function AbaBackground() {
  const { db, personagemAtivo, salvarBackground } = useApp()
  const registro = (db?.backgrounds || []).find(b => b.personagem_id === personagemAtivo?.id)
  const [texto, setTexto] = useState(registro?.texto || '')
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar(e) {
    e.preventDefault()
    setSalvando(true)
    await salvarBackground(personagemAtivo.id, texto)
    setSalvando(false)
  }

  return (
    <form onSubmit={handleSalvar} className="flex flex-col gap-4 pt-2 h-full">
      <div className="flex-1 flex flex-col">
        <label className="label-medieval mb-2 block">História e Background do Personagem</label>
        <textarea
          className="input-medieval resize-none flex-1"
          placeholder="Descreva a história, origens, motivações e background do seu personagem..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
        />
      </div>
      <div className="flex justify-end shrink-0">
        <button type="submit" className="btn-gold text-xs" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Background'}
        </button>
      </div>
    </form>
  )
}

// ── Players ───────────────────────────────────────────────────
function AbaPlayers() {
  const { db, personagemAtivo, adicionarPlayer, editarPlayer, excluirPlayer } = useApp()
  const [busca, setBusca] = useState('')
  const [ativo, setAtivo] = useState(null) // null | player object | { __novo: true }

  const players = (db?.players || [])
    .filter(p => p.personagem_id === personagemAtivo?.id)
    .filter(p => !busca || p.nome?.toLowerCase().includes(busca.toLowerCase()))

  async function handleSalvar(form) {
    if (ativo?.__novo) {
      await adicionarPlayer({ ...form, personagem_id: personagemAtivo.id })
    } else {
      await editarPlayer(ativo.id, { ...ativo, ...form })
    }
    setAtivo(null)
  }

  function handleExcluir(e, id) {
    e.stopPropagation()
    excluirPlayer(id)
    if (ativo?.id === id) setAtivo(null)
  }

  return (
    <div className="flex gap-4 h-full pt-2" style={{ minHeight: 0 }}>
      {/* Lista */}
      <div className="flex flex-col gap-2 shrink-0" style={{ maxWidth: 300, minHeight: 0 }}>
        <div className="flex gap-2">
          <input
            className="input-medieval flex-1 text-xs"
            placeholder="Buscar..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <button className="btn-gold text-xs shrink-0" onClick={() => setAtivo({ __novo: true })}>+ Novo</button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ minHeight: 0 }}>
          {players.map(p => (
            <div
              key={p.id}
              className="character-card p-3 rounded-sm cursor-pointer"
              style={{
                border: ativo?.id === p.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid #3a2810',
                background: ativo?.id === p.id ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.03)',
              }}
              onClick={() => setAtivo(p)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medieval text-sm truncate" style={{ color: '#f0e6c8' }}>{p.nome}</p>
                  {(p.classe || p.raca) && (
                    <p className="text-xs mt-0.5 truncate" style={{ color: '#917d58' }}>
                      {[p.raca, p.classe].filter(Boolean).join(' • ')}
                    </p>
                  )}
                  {p.notas && <p className="text-xs mt-1 line-clamp-2" style={{ color: '#6b5a3a' }}>{p.notas}</p>}
                </div>
                <button
                  style={{ color: '#6b5a3a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                  onClick={e => handleExcluir(e, p.id)}
                  title="Excluir"
                >🗑</button>
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: '#3a2810' }}>Nenhum player ainda.</p>
          )}
        </div>
      </div>

      {/* Divisor */}
      <div className="shrink-0" style={{ width: 1, background: '#3a2810' }} />

      {/* Formulário */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0, minHeight: 0 }}>
        {ativo ? (
          <FormPlayer
            key={ativo.id ?? '__novo__'}
            player={ativo.__novo ? null : ativo}
            onSalvar={handleSalvar}
            onCancelar={() => setAtivo(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ border: '1px dashed #3a2810', borderRadius: 4 }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>🧙</span>
            <p className="font-medieval text-sm text-center" style={{ color: '#3a2810' }}>
              Selecione um player ou clique em + Novo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function FormPlayer({ player, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    nome: player?.nome || '',
    classe: player?.classe || '',
    raca: player?.raca || '',
    notas: player?.notas || '',
  })
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    await onSalvar(form)
    setSalvando(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <h4 className="font-medieval text-md font-semibold shrink-0" style={{ color: '#c9a84c' }}>
        {player ? 'Editar Player' : 'Novo Player'}
      </h4>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div>
          <label className="label-medieval">Nome do Jogador / Personagem</label>
          <input className="input-medieval" required value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-medieval">Classe</label>
            <input className="input-medieval" value={form.classe}
              onChange={e => setForm(f => ({ ...f, classe: e.target.value }))} />
          </div>
          <div>
            <label className="label-medieval">Raça</label>
            <input className="input-medieval" value={form.raca}
              onChange={e => setForm(f => ({ ...f, raca: e.target.value }))} />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <label className="label-medieval">Notas</label>
          <textarea className="input-medieval resize-none flex-1" style={{ minHeight: 80 }}
            placeholder="Informações sobre o player ou personagem..."
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3 justify-end shrink-0">
        <button type="button" className="btn-ghost text-xs" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-gold text-xs" disabled={salvando}>
          {salvando ? 'Salvando...' : '✓ Salvar'}
        </button>
      </div>
    </form>
  )
}

// ── Anotações ────────────────────────────────────────────────
function AbaAnotacoes() {
  const { db, personagemAtivo, adicionarAnotacao, editarAnotacao, excluirAnotacao } = useApp()
  const [busca, setBusca] = useState('')
  const [ativa, setAtiva] = useState(null) // null | { id?, titulo, notas, data? }

  const anotacoes = (db?.anotacoes || [])
    .filter(a => a.personagem_id === personagemAtivo?.id)
    .filter(a => !busca ||
      a.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
      stripHtml(a.notas)?.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''))

  async function handleSalvar(titulo, notas) {
    const data = new Date().toLocaleDateString('pt-BR')
    const tituloFinal = titulo.trim() || `Anotação — ${data}`
    if (ativa?.id) {
      await editarAnotacao(ativa.id, { titulo: tituloFinal, notas, data })
    } else {
      await adicionarAnotacao({ titulo: tituloFinal, notas, personagem_id: personagemAtivo.id, data })
    }
    setAtiva(null)
  }

  function handleExcluir(e, id) {
    e.stopPropagation()
    excluirAnotacao(id)
    if (ativa?.id === id) setAtiva(null)
  }

  return (
    <div className="flex gap-4 h-full pt-2" style={{ minHeight: 0 }}>

      {/* ── Coluna esquerda: lista ── */}
      <div className="flex flex-col gap-2 shrink-0" style={{ maxWidth: 300, minHeight: 0 }}>
        <div className="flex gap-2">
          <input
            className="input-medieval flex-1 text-xs"
            placeholder="Buscar..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <button
            className="btn-gold text-xs shrink-0"
            onClick={() => setAtiva({ titulo: '', notas: '' })}
          >+ Nova</button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ minHeight: 0 }}>
          {anotacoes.map(a => (
            <div
              key={a.id}
              className="character-card p-3 rounded-sm cursor-pointer"
              style={{
                border: ativa?.id === a.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid #3a2810',
                background: ativa?.id === a.id ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.03)',
              }}
              onClick={() => setAtiva(a)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medieval text-sm truncate" style={{ color: '#f0e6c8' }}>{a.titulo}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#917d58' }}>{a.data}</p>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: '#6b5a3a' }}>{stripHtml(a.notas)}</p>
                </div>
                <button
                  style={{ color: '#6b5a3a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, lineHeight: 1, flexShrink: 0 }}
                  onClick={e => handleExcluir(e, a.id)}
                  title="Excluir"
                >🗑</button>
              </div>
            </div>
          ))}
          {anotacoes.length === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: '#3a2810' }}>Nenhuma anotação ainda.</p>
          )}
        </div>
      </div>

      {/* Divisor */}
      <div className="shrink-0" style={{ width: 1, background: '#3a2810' }} />

      {/* ── Coluna direita: editor ── */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0, minHeight: 0 }}>
        {ativa ? (
          <EditorAnotacao
            key={ativa.id ?? '__nova__'}
            anotacao={ativa}
            onSalvar={handleSalvar}
            onCancelar={() => setAtiva(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ border: '1px dashed #3a2810', borderRadius: 4 }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>📜</span>
            <p className="font-medieval text-sm text-center" style={{ color: '#3a2810' }}>
              Selecione uma anotação ou clique em + Nova
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── NPCs ─────────────────────────────────────────────────────
function AbaNpcs() {
  const { db, personagemAtivo, adicionarNpc, editarNpc, excluirNpc } = useApp()
  const [busca, setBusca] = useState('')
  const [ativo, setAtivo] = useState(null)

  const npcs = (db?.npcs || [])
    .filter(n => n.personagem_id === personagemAtivo?.id)
    .filter(n => !busca || n.nome?.toLowerCase().includes(busca.toLowerCase()))

  async function handleSalvar(form) {
    if (ativo?.__novo) {
      await adicionarNpc({ ...form, personagem_id: personagemAtivo.id })
    } else {
      await editarNpc(ativo.id, { ...ativo, ...form })
    }
    setAtivo(null)
  }

  function handleExcluir(e, id) {
    e.stopPropagation()
    excluirNpc(id)
    if (ativo?.id === id) setAtivo(null)
  }

  return (
    <div className="flex gap-4 h-full pt-2" style={{ minHeight: 0 }}>
      {/* Lista */}
      <div className="flex flex-col gap-2 shrink-0" style={{ maxWidth: 300, minHeight: 0 }}>
        <div className="flex gap-2">
          <input
            className="input-medieval flex-1 text-xs"
            placeholder="Buscar NPC..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <button className="btn-gold text-xs shrink-0" onClick={() => setAtivo({ __novo: true })}>+ Novo</button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ minHeight: 0 }}>
          {npcs.map(n => (
            <div
              key={n.id}
              className="character-card p-3 rounded-sm cursor-pointer"
              style={{
                border: ativo?.id === n.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid #3a2810',
                background: ativo?.id === n.id ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.03)',
              }}
              onClick={() => setAtivo(n)}
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-sm shrink-0 overflow-hidden" style={{ border: '1px solid #6b4a1a', background: '#0d0902' }}>
                  {n.foto_base64
                    ? <img src={n.foto_base64} alt={n.nome} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center" style={{ fontSize: 14 }}>🧝</div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medieval text-sm truncate" style={{ color: '#f0e6c8' }}>{n.nome}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#6b5a3a' }}>
                    {[n.genero, n.ocupacao].filter(Boolean).join(' • ')}
                  </p>
                </div>
                <button
                  style={{ color: '#6b5a3a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                  onClick={e => handleExcluir(e, n.id)}
                  title="Excluir"
                >🗑</button>
              </div>
            </div>
          ))}
          {npcs.length === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: '#3a2810' }}>Nenhum NPC ainda.</p>
          )}
        </div>
      </div>

      {/* Divisor */}
      <div className="shrink-0" style={{ width: 1, background: '#3a2810' }} />

      {/* Formulário */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0, minHeight: 0 }}>
        {ativo ? (
          <FormNpc
            key={ativo.id ?? '__novo__'}
            npc={ativo.__novo ? null : ativo}
            onSalvar={handleSalvar}
            onCancelar={() => setAtivo(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ border: '1px dashed #3a2810', borderRadius: 4 }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>🧝</span>
            <p className="font-medieval text-sm text-center" style={{ color: '#3a2810' }}>
              Selecione um NPC ou clique em + Novo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function FormNpc({ npc, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    nome: npc?.nome || '',
    genero: npc?.genero || 'Masculino',
    ocupacao: npc?.ocupacao || '',
    notas: npc?.notas || '',
    foto_base64: npc?.foto_base64 || '',
  })
  const [salvando, setSalvando] = useState(false)

  async function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    setForm(f => ({ ...f, foto_base64: b64 }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    await onSalvar(form)
    setSalvando(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <h4 className="font-medieval text-sm shrink-0" style={{ color: '#c9a84c' }}>
        {npc ? 'Editar NPC' : 'Novo NPC'}
      </h4>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {/* Foto */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-sm overflow-hidden shrink-0" style={{ border: '1px solid #6b4a1a', background: '#0d0902' }}>
            {form.foto_base64
              ? <img src={form.foto_base64} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full flex items-center justify-center text-2xl">🧝</div>
            }
          </div>
          <label className="btn-ghost text-xs cursor-pointer">
            Alterar foto<input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
          </label>
        </div>
        <div>
          <label className="label-medieval">Nome</label>
          <input className="input-medieval" required value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-medieval">Gênero</label>
            <select className="input-medieval" value={form.genero}
              onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}>
              {GENEROS.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label-medieval">Ocupação</label>
            <input className="input-medieval" value={form.ocupacao}
              onChange={e => setForm(f => ({ ...f, ocupacao: e.target.value }))} />
          </div>
        </div>
        <div className="flex-1 flex flex-col">
          <label className="label-medieval">Notas</label>
          <textarea className="input-medieval resize-none flex-1" style={{ minHeight: 80 }}
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3 justify-end shrink-0">
        <button type="button" className="btn-ghost text-xs" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-gold text-xs" disabled={salvando}>
          {salvando ? 'Salvando...' : '✓ Salvar'}
        </button>
      </div>
    </form>
  )
}

// ── Locais ───────────────────────────────────────────────────
function AbaLocais() {
  const { db, personagemAtivo, adicionarLocal, editarLocal, excluirLocal } = useApp()
  const [busca, setBusca] = useState('')
  const [ativo, setAtivo] = useState(null)

  const locais = (db?.locais || [])
    .filter(l => l.personagem_id === personagemAtivo?.id)
    .filter(l => !busca || l.nome?.toLowerCase().includes(busca.toLowerCase()))

  async function handleSalvar(form) {
    if (ativo?.__novo) {
      await adicionarLocal({ ...form, personagem_id: personagemAtivo.id })
    } else {
      await editarLocal(ativo.id, { ...ativo, ...form })
    }
    setAtivo(null)
  }

  function handleExcluir(e, id) {
    e.stopPropagation()
    excluirLocal(id)
    if (ativo?.id === id) setAtivo(null)
  }

  return (
    <div className="flex gap-4 h-full pt-2" style={{ minHeight: 0 }}>
      {/* Lista */}
      <div className="flex flex-col gap-2 shrink-0" style={{ maxWidth: 300, minHeight: 0 }}>
        <div className="flex gap-2">
          <input
            className="input-medieval flex-1 text-xs"
            placeholder="Buscar local..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <button className="btn-gold text-xs shrink-0" onClick={() => setAtivo({ __novo: true })}>+ Novo</button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ minHeight: 0 }}>
          {locais.map(l => (
            <div
              key={l.id}
              className="character-card p-3 rounded-sm cursor-pointer"
              style={{
                border: ativo?.id === l.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid #3a2810',
                background: ativo?.id === l.id ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.03)',
              }}
              onClick={() => setAtivo(l)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medieval text-md truncate" style={{ color: '#f0e6c8' }}>🗺 {l.nome}</p>
                  {l.notas && <p className="text-xs mt-1 line-clamp-2" style={{ color: '#6b5a3a' }}>{l.notas}</p>}
                </div>
                <button
                  style={{ color: '#6b5a3a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                  onClick={e => handleExcluir(e, l.id)}
                  title="Excluir"
                >🗑</button>
              </div>
            </div>
          ))}
          {locais.length === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: '#3a2810' }}>Nenhum local ainda.</p>
          )}
        </div>
      </div>

      {/* Divisor */}
      <div className="shrink-0" style={{ width: 1, background: '#3a2810' }} />

      {/* Formulário */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0, minHeight: 0 }}>
        {ativo ? (
          <FormLocal
            key={ativo.id ?? '__novo__'}
            local={ativo.__novo ? null : ativo}
            onSalvar={handleSalvar}
            onCancelar={() => setAtivo(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ border: '1px dashed #3a2810', borderRadius: 4 }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>🗺</span>
            <p className="font-medieval text-sm text-center" style={{ color: '#3a2810' }}>
              Selecione um local ou clique em + Novo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function FormLocal({ local, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    nome: local?.nome || '',
    notas: local?.notas || '',
  })
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    await onSalvar(form)
    setSalvando(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <h4 className="font-medieval text-sm shrink-0" style={{ color: '#c9a84c' }}>
        {local ? 'Editar Local' : 'Novo Local'}
      </h4>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div>
          <label className="label-medieval">Nome</label>
          <input className="input-medieval" required value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        </div>
        <div className="flex-1 flex flex-col">
          <label className="label-medieval">Descrição</label>
          <textarea className="input-medieval resize-none flex-1" style={{ minHeight: 100 }}
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3 justify-end shrink-0">
        <button type="button" className="btn-ghost text-xs" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-gold text-xs" disabled={salvando}>
          {salvando ? 'Salvando...' : '✓ Salvar'}
        </button>
      </div>
    </form>
  )
}

// ── Quests ───────────────────────────────────────────────────
function AbaQuests() {
  const { db, personagemAtivo, adicionarQuest, editarQuest, excluirQuest } = useApp()
  const [busca, setBusca] = useState('')
  const [ativo, setAtivo] = useState(null)

  const npcs = (db?.npcs || []).filter(n => n.personagem_id === personagemAtivo?.id)
  const locais = (db?.locais || []).filter(l => l.personagem_id === personagemAtivo?.id)

  const quests = (db?.quests || [])
    .filter(q => q.personagem_id === personagemAtivo?.id)
    .filter(q => !busca || q.nome?.toLowerCase().includes(busca.toLowerCase()))

  function getLocalNome(id) {
    return locais.find(l => l.id === Number(id))?.nome || ''
  }

  async function handleSalvar(form) {
    if (ativo?.__novo) {
      await adicionarQuest({ ...form, personagem_id: personagemAtivo.id })
    } else {
      await editarQuest(ativo.id, { ...ativo, ...form })
    }
    setAtivo(null)
  }

  function handleExcluir(e, id) {
    e.stopPropagation()
    excluirQuest(id)
    if (ativo?.id === id) setAtivo(null)
  }

  return (
    <div className="flex gap-4 h-full pt-2" style={{ minHeight: 0 }}>
      {/* Lista */}
      <div className="flex flex-col gap-2 shrink-0" style={{ maxWidth: 300, minHeight: 0 }}>
        <div className="flex gap-2">
          <input
            className="input-medieval flex-1 text-xs"
            placeholder="Buscar quest..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
          <button className="btn-gold text-xs shrink-0" onClick={() => setAtivo({ __novo: true })}>+ Nova</button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col gap-2" style={{ minHeight: 0 }}>
          {quests.map(q => (
            <div
              key={q.id}
              className="character-card p-3 rounded-sm cursor-pointer"
              style={{
                border: ativo?.id === q.id ? '1px solid rgba(201,168,76,0.5)' : '1px solid #3a2810',
                background: ativo?.id === q.id ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.03)',
              }}
              onClick={() => setAtivo(q)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medieval text-sm truncate" style={{ color: '#f0e6c8' }}>{q.nome}</p>
                  <p className="text-xs mt-0.5" style={{ color: q.tipo === 'Principal' ? '#c9a84c' : '#6b5a3a' }}>
                    {q.tipo}{q.local_id ? ` • ${getLocalNome(q.local_id)}` : ''}
                  </p>
                </div>
                <button
                  style={{ color: '#6b5a3a', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, lineHeight: 1, flexShrink: 0 }}
                  onClick={e => handleExcluir(e, q.id)}
                  title="Excluir"
                >🗑</button>
              </div>
            </div>
          ))}
          {quests.length === 0 && (
            <p className="text-xs text-center mt-6" style={{ color: '#3a2810' }}>Nenhuma quest ainda.</p>
          )}
        </div>
      </div>

      {/* Divisor */}
      <div className="shrink-0" style={{ width: 1, background: '#3a2810' }} />

      {/* Formulário */}
      <div className="flex-1 flex flex-col" style={{ minWidth: 0, minHeight: 0 }}>
        {ativo ? (
          <FormQuest
            key={ativo.id ?? '__novo__'}
            quest={ativo.__novo ? null : ativo}
            npcs={npcs}
            locais={locais}
            onSalvar={handleSalvar}
            onCancelar={() => setAtivo(null)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ border: '1px dashed #3a2810', borderRadius: 4 }}>
            <span style={{ fontSize: 32, opacity: 0.3 }}>⚔️</span>
            <p className="font-medieval text-sm text-center" style={{ color: '#3a2810' }}>
              Selecione uma quest ou clique em + Nova
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function FormQuest({ quest, npcs, locais, onSalvar, onCancelar }) {
  const [form, setForm] = useState({
    nome: quest?.nome || '',
    local_id: quest?.local_id || '',
    tipo: quest?.tipo || 'Principal',
    notas: quest?.notas || '',
    npc_ids: quest?.npc_ids || '',
  })
  const [salvando, setSalvando] = useState(false)

  // Parse selected npc ids for the multi-select
  const selectedNpcIds = form.npc_ids
    ? String(form.npc_ids).split(',').map(Number).filter(Boolean)
    : []

  async function handleSubmit(e) {
    e.preventDefault()
    setSalvando(true)
    await onSalvar(form)
    setSalvando(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
      <h4 className="font-medieval text-sm shrink-0" style={{ color: '#c9a84c' }}>
        {quest ? 'Editar Quest' : 'Nova Quest'}
      </h4>
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        <div>
          <label className="label-medieval">Nome da Quest</label>
          <input className="input-medieval" required value={form.nome}
            onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label-medieval">Local</label>
            <select className="input-medieval" value={form.local_id}
              onChange={e => setForm(f => ({ ...f, local_id: e.target.value }))}>
              <option value="">— Selecionar —</option>
              {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="label-medieval">Tipo</label>
            <select className="input-medieval" value={form.tipo}
              onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
              <option>Principal</option>
              <option>Secundária</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label-medieval">NPCs Envolvidos</label>
          <select className="input-medieval" multiple size={Math.min(Math.max(npcs.length, 1), 4)}
            value={selectedNpcIds.map(String)}
            onChange={e => {
              const ids = Array.from(e.target.selectedOptions).map(o => o.value).join(',')
              setForm(f => ({ ...f, npc_ids: ids }))
            }}>
            {npcs.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
          </select>
          {npcs.length === 0 && <p className="text-xs mt-1" style={{ color: '#6b5a3a' }}>Cadastre NPCs primeiro.</p>}
        </div>
        <div className="flex-1 flex flex-col">
          <label className="label-medieval">Anotações</label>
          <textarea className="input-medieval resize-none flex-1" style={{ minHeight: 80 }}
            value={form.notas}
            onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
        </div>
      </div>
      <div className="flex gap-3 justify-end shrink-0">
        <button type="button" className="btn-ghost text-xs" onClick={onCancelar}>Cancelar</button>
        <button type="submit" className="btn-gold text-xs" disabled={salvando}>
          {salvando ? 'Salvando...' : '✓ Salvar'}
        </button>
      </div>
    </form>
  )
}

// ── Editor de Anotação (Rich Text) ──────────────────────────
function EditorAnotacao({ anotacao, onSalvar, onCancelar }) {
  const [titulo, setTitulo] = useState(anotacao.titulo || '')
  const [salvando, setSalvando] = useState(false)
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = anotacao.notas || ''
      editorRef.current.focus()
    }
  }, [])

  // NÃO chamar .focus() aqui — onMouseDown+preventDefault no ToolBtn já preserva a seleção
  function exec(cmd, val = null) {
    document.execCommand(cmd, false, val)
  }

  function applyBold() {
    document.execCommand('bold')
    // Converter <b>/<strong> para font-weight pesado
    editorRef.current?.querySelectorAll('b, strong').forEach(el => {
      const span = document.createElement('span')
      span.style.fontWeight = '800'
      span.innerHTML = el.innerHTML
      el.replaceWith(span)
    })
  }

  function setFontSize(size) {
    document.execCommand('fontSize', false, '7')
    const fontEls = editorRef.current?.querySelectorAll('font[size="7"]') || []
    fontEls.forEach(el => {
      const span = document.createElement('span')
      span.style.fontSize = size
      span.innerHTML = el.innerHTML
      el.replaceWith(span)
    })
  }

  function setTextColor(color) {
    document.execCommand('foreColor', false, color)
  }

  async function handleSalvar() {
    setSalvando(true)
    await onSalvar(titulo, editorRef.current?.innerHTML || '')
    setSalvando(false)
  }

  const FONT_SIZES = ['11px', '13px', '15px', '18px', '22px', '28px', '36px']
  const COLORS = ['#f0e6c8', '#c9a84c', '#6abf6a', '#e07070', '#7ab0d9', '#c07ae0', '#9b8a6a']

  return (
    <div className="flex flex-col gap-2 h-full" style={{ minHeight: 0 }}>
      <input
        className="input-medieval"
        placeholder="Título da anotação..."
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
      />

      {/* Toolbar */}
      <div
        className="flex items-center flex-wrap gap-1"
        style={{
          padding: '5px 8px',
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid #6b4a1a',
          borderBottom: 'none',
          borderRadius: '4px 4px 0 0',
          flexShrink: 0,
        }}
      >
        <ToolBtn onAction={applyBold} title="Negrito (Ctrl+B)"><b style={{ fontFamily: 'Georgia,serif', fontWeight: 900 }}>B</b></ToolBtn>
        <ToolBtn onAction={() => exec('italic')} title="Itálico (Ctrl+I)"><i style={{ fontFamily: 'Georgia,serif' }}>I</i></ToolBtn>
        <ToolBtn onAction={() => exec('underline')} title="Sublinhado (Ctrl+U)"><u>U</u></ToolBtn>
        <ToolBtn onAction={() => exec('strikeThrough')} title="Tachado"><s>S</s></ToolBtn>

        <ToolbarDivider />

        <select
          className="input-medieval"
          style={{ padding: '2px 4px', fontSize: 11, width: 72, height: 26, cursor: 'pointer' }}
          defaultValue=""
          onMouseDown={e => e.stopPropagation()}
          onChange={e => { if (e.target.value) { setFontSize(e.target.value); e.target.value = '' } }}
        >
          <option value="" disabled>Tamanho</option>
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <ToolbarDivider />

        {COLORS.map(cor => (
          <button
            key={cor}
            type="button"
            title="Cor do texto"
            onMouseDown={e => { e.preventDefault(); setTextColor(cor) }}
            style={{
              width: 18, height: 18, borderRadius: 3, flexShrink: 0,
              background: cor, border: '1px solid rgba(0,0,0,0.5)', cursor: 'pointer',
            }}
          />
        ))}

        <ToolbarDivider />

        <ToolBtn onAction={() => exec('insertUnorderedList')} title="Lista com marcadores">•≡</ToolBtn>
        <ToolBtn onAction={() => exec('insertOrderedList')} title="Lista numerada">1≡</ToolBtn>

        <ToolbarDivider />

        <ToolBtn onAction={() => exec('removeFormat')} title="Remover toda formatação" style={{ color: '#9b8a6a', fontSize: 10 }}>✕fmt</ToolBtn>
      </div>

      {/* Área editável */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="flex-1"
        style={{
          padding: '12px 14px',
          border: '1px solid #6b4a1a',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          background: 'rgba(0,0,0,0.25)',
          color: '#f0e6c8',
          outline: 'none',
          lineHeight: 1.8,
          fontSize: 14,
          overflowY: 'auto',
          minHeight: 100,
        }}
        onKeyDown={e => {
          if (e.ctrlKey || e.metaKey) {
            if (e.key === 'b') { e.preventDefault(); applyBold() }
            if (e.key === 'i') { e.preventDefault(); exec('italic') }
            if (e.key === 'u') { e.preventDefault(); exec('underline') }
          }
        }}
      />

      {/* Rodapé */}
      <div className="flex items-center justify-between shrink-0" style={{ paddingTop: 2 }}>
        {anotacao.data && (
          <span className="text-xs" style={{ color: '#6b5a3a' }}>Criada em {anotacao.data}</span>
        )}
        <div className="flex gap-3 ml-auto">
          <button className="btn-ghost text-xs" onClick={onCancelar}>Cancelar</button>
          <button className="btn-gold text-xs" onClick={handleSalvar} disabled={salvando}>
            {salvando ? 'Salvando...' : '✓ Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolBtn({ onAction, title, children, style }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={e => { e.preventDefault(); onAction() }}
      style={{
        width: 26, height: 26, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(201,168,76,0.1)',
        border: '1px solid #6b4a1a',
        borderRadius: 3,
        color: '#c9a84c',
        cursor: 'pointer',
        fontSize: 11,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div style={{ width: 1, height: 20, background: '#6b4a1a', margin: '0 2px', flexShrink: 0 }} />
}

function stripHtml(html) {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
