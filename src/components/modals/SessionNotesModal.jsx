import { useState } from 'react'
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content w-full max-w-2xl flex flex-col" style={{ maxHeight: '85vh' }}
        onClick={e => e.stopPropagation()}>
        {/* Header com tabs */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0 shrink-0">
          <div className="flex gap-1">
            {TABS.map(t => (
              <button key={t.key} className={`tab-btn ${aba === t.key ? 'active' : ''}`}
                onClick={() => setAba(t.key)}>
                {t.label}
              </button>
            ))}
          </div>
          <button onClick={onClose} style={{ color: '#6b5a3a', fontSize: 18, background: 'none', cursor: 'pointer', border: 'none' }}>✕</button>
        </div>

        <div className="divider-gold mx-6" />

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
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
    <form onSubmit={handleSalvar} className="flex flex-col gap-4 pt-2">
      <div>
        <label className="label-medieval mb-2 block">História e Background do Personagem</label>
        <textarea
          className="input-medieval resize-none"
          rows={14}
          placeholder="Descreva a história, origens, motivações e background do seu personagem..."
          value={texto}
          onChange={e => setTexto(e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <button type="submit" className="btn-gold text-xs" disabled={salvando}>
          {salvando ? 'Salvando...' : 'Salvar Background'}
        </button>
      </div>
    </form>
  )
}

// ── Players ───────────────────────────────────────────────────
function AbaPlayers() {
  const { db, personagemAtivo, adicionarPlayer, excluirPlayer } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', classe: '', raca: '', notas: '' })

  const players = (db?.players || []).filter(p => p.personagem_id === personagemAtivo?.id)

  async function handleSalvar(e) {
    e.preventDefault()
    await adicionarPlayer({ ...form, personagem_id: personagemAtivo.id })
    setForm({ nome: '', classe: '', raca: '', notas: '' })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end pt-2">
        <button className="btn-gold text-xs" onClick={() => setShowForm(true)}>+ Adicionar Player</button>
      </div>

      {players.map(p => (
        <div key={p.id} className="character-card flex items-start gap-3 p-4 rounded-sm">
          <div className="flex-1 min-w-0">
            <p className="font-medieval text-sm" style={{ color: '#f0e6c8' }}>
              {p.nome}
              {(p.classe || p.raca) && (
                <span style={{ color: '#6b5a3a', fontSize: 11 }}>
                  {' '}— {[p.raca, p.classe].filter(Boolean).join(' ')}
                </span>
              )}
            </p>
            {p.notas && <p className="text-xs mt-1 line-clamp-2" style={{ color: '#9b8a6a' }}>{p.notas}</p>}
          </div>
          <button className="btn-danger text-lg shrink-0" onClick={() => excluirPlayer(p.id)}>🗑</button>
        </div>
      ))}

      {players.length === 0 && <p className="text-xs text-center mt-4" style={{ color: '#6b5a3a' }}>Nenhum player cadastrado.</p>}

      {showForm && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowForm(false)}>
          <div className="modal-content p-6 w-96" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4" style={{ color: '#c9a84c' }}>Novo Player</h4>
            <form onSubmit={handleSalvar} className="flex flex-col gap-3">
              <div><label className="label-medieval">Nome do Jogador / Personagem</label><input className="input-medieval" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-medieval">Classe</label><input className="input-medieval" value={form.classe} onChange={e => setForm(f => ({ ...f, classe: e.target.value }))} /></div>
                <div><label className="label-medieval">Raça</label><input className="input-medieval" value={form.raca} onChange={e => setForm(f => ({ ...f, raca: e.target.value }))} /></div>
              </div>
              <div><label className="label-medieval">Notas</label><textarea className="input-medieval resize-none" rows={3} placeholder="Informações sobre o player ou personagem..." value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost text-xs" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-gold text-xs">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Anotações ────────────────────────────────────────────────
function AbaAnotacoes() {
  const { db, personagemAtivo, adicionarAnotacao, excluirAnotacao } = useApp()
  const [busca, setBusca] = useState('')
  const [form, setForm] = useState({ titulo: '', notas: '' })
  const [showForm, setShowForm] = useState(false)
  const [anotacaoAberta, setAnotacaoAberta] = useState(null)

  const anotacoes = (db?.anotacoes || [])
    .filter(a => a.personagem_id === personagemAtivo?.id)
    .filter(a => !busca || a.titulo?.toLowerCase().includes(busca.toLowerCase()) || a.notas?.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => (b.data || '').localeCompare(a.data || ''))

  async function handleSalvar(e) {
    e.preventDefault()
    const data = new Date().toLocaleDateString('pt-BR')
    await adicionarAnotacao({ ...form, personagem_id: personagemAtivo.id, data, titulo: form.titulo || `Anotação — ${data}` })
    setForm({ titulo: '', notas: '' })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 pt-2">
        <input className="input-medieval flex-1" placeholder="Buscar..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-gold text-xs" onClick={() => setShowForm(true)}>+ Adicionar</button>
      </div>

      {anotacoes.map(a => (
        <div key={a.id} className="character-card p-4 rounded-sm cursor-pointer"
          onClick={() => setAnotacaoAberta(a)}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medieval text-sm" style={{ color: '#f0e6c8' }}>{a.titulo}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6b5a3a' }}>{a.data}</p>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: '#9b8a6a' }}>{a.notas}</p>
            </div>
            <button className="btn-danger text-lg shrink-0" onClick={e => { e.stopPropagation(); excluirAnotacao(a.id) }}>🗑</button>
          </div>
        </div>
      ))}

      {anotacoes.length === 0 && <p className="text-xs text-center mt-4" style={{ color: '#6b5a3a' }}>Nenhuma anotação ainda.</p>}

      {/* Modal nova anotação */}
      {showForm && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowForm(false)}>
          <div className="modal-content p-6 w-96" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4" style={{ color: '#c9a84c' }}>Nova Anotação</h4>
            <form onSubmit={handleSalvar} className="flex flex-col gap-3">
              <div>
                <label className="label-medieval">Título</label>
                <input className="input-medieval" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
              </div>
              <div>
                <label className="label-medieval">Anotações</label>
                <textarea className="input-medieval resize-none" rows={5} required value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost text-xs" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-gold text-xs">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal visualizar anotação */}
      {anotacaoAberta && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setAnotacaoAberta(null)}>
          <div className="modal-content p-6 w-xl max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medieval text-base" style={{ color: '#c9a84c' }}>{anotacaoAberta.titulo}</h4>
                <p className="text-xs mt-0.5" style={{ color: '#6b5a3a' }}>{anotacaoAberta.data}</p>
              </div>
              <button onClick={() => setAnotacaoAberta(null)} style={{ color: '#6b5a3a', fontSize: 18, background: 'none', cursor: 'pointer', border: 'none' }}>✕</button>
            </div>
            <p className="text-sm" style={{ color: '#9b8a6a', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{anotacaoAberta.notas}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── NPCs ─────────────────────────────────────────────────────
function AbaNpcs() {
  const { db, personagemAtivo, adicionarNpc, excluirNpc } = useApp()
  const [busca, setBusca] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', genero: 'Masculino', ocupacao: '', notas: '', foto_base64: '' })

  const npcs = (db?.npcs || [])
    .filter(n => n.personagem_id === personagemAtivo?.id)
    .filter(n => !busca || n.nome?.toLowerCase().includes(busca.toLowerCase()))

  async function handleFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    const b64 = await fileToBase64(file)
    setForm(f => ({ ...f, foto_base64: b64 }))
  }

  async function handleSalvar(e) {
    e.preventDefault()
    await adicionarNpc({ ...form, personagem_id: personagemAtivo.id })
    setForm({ nome: '', genero: 'Masculino', ocupacao: '', notas: '', foto_base64: '' })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 pt-2">
        <input className="input-medieval flex-1" placeholder="Buscar NPC..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-gold text-xs" onClick={() => setShowForm(true)}>+ Adicionar NPC</button>
      </div>

      {npcs.map(n => (
        <div key={n.id} className="character-card flex items-start gap-3 p-4 rounded-sm">
          <div className="w-12 h-12 rounded-sm shrink-0 overflow-hidden" style={{ border: '1px solid #6b4a1a', background: '#0d0902' }}>
            {n.foto_base64 ? <img src={n.foto_base64} alt={n.nome} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🧝</div>}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medieval text-sm" style={{ color: '#f0e6c8' }}>
              {n.nome} <span style={{ color: '#6b5a3a', fontSize: 11 }}>— {n.genero}{n.ocupacao ? ` — ${n.ocupacao}` : ''}</span>
            </p>
            {n.notas && <p className="text-xs mt-1 line-clamp-2" style={{ color: '#9b8a6a' }}>{n.notas}</p>}
          </div>
          <button className="btn-danger text-lg shrink-0" onClick={() => excluirNpc(n.id)}>🗑</button>
        </div>
      ))}

      {npcs.length === 0 && <p className="text-xs text-center mt-4" style={{ color: '#6b5a3a' }}>Nenhum NPC cadastrado.</p>}

      {showForm && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowForm(false)}>
          <div className="modal-content p-6 w-96" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4" style={{ color: '#c9a84c' }}>Novo NPC</h4>
            <form onSubmit={handleSalvar} className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-sm overflow-hidden shrink-0" style={{ border: '1px solid #6b4a1a', background: '#0d0902' }}>
                  {form.foto_base64 ? <img src={form.foto_base64} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🧝</div>}
                </div>
                <label className="btn-ghost text-xs cursor-pointer">
                  Foto<input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </label>
              </div>
              <div><label className="label-medieval">Nome</label><input className="input-medieval" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label-medieval">Gênero</label><select className="input-medieval" value={form.genero} onChange={e => setForm(f => ({ ...f, genero: e.target.value }))}>{GENEROS.map(g => <option key={g}>{g}</option>)}</select></div>
                <div><label className="label-medieval">Ocupação</label><input className="input-medieval" value={form.ocupacao} onChange={e => setForm(f => ({ ...f, ocupacao: e.target.value }))} /></div>
              </div>
              <div><label className="label-medieval">Notas</label><textarea className="input-medieval resize-none" rows={3} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost text-xs" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-gold text-xs">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Locais ───────────────────────────────────────────────────
function AbaLocais() {
  const { db, personagemAtivo, adicionarLocal, excluirLocal } = useApp()
  const [busca, setBusca] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', notas: '' })

  const locais = (db?.locais || [])
    .filter(l => l.personagem_id === personagemAtivo?.id)
    .filter(l => !busca || l.nome?.toLowerCase().includes(busca.toLowerCase()))

  async function handleSalvar(e) {
    e.preventDefault()
    await adicionarLocal({ ...form, personagem_id: personagemAtivo.id })
    setForm({ nome: '', notas: '' })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 pt-2">
        <input className="input-medieval flex-1" placeholder="Buscar local..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-gold text-xs" onClick={() => setShowForm(true)}>+ Adicionar Local</button>
      </div>

      {locais.map(l => (
        <div key={l.id} className="character-card flex items-start gap-3 p-4 rounded-sm">
          <div className="flex-1 min-w-0">
            <p className="font-medieval text-sm" style={{ color: '#f0e6c8' }}>🗺 {l.nome}</p>
            {l.notas && <p className="text-xs mt-1 line-clamp-2" style={{ color: '#9b8a6a' }}>{l.notas}</p>}
          </div>
          <button className="btn-danger text-lg shrink-0" onClick={() => excluirLocal(l.id)}>🗑</button>
        </div>
      ))}

      {locais.length === 0 && <p className="text-xs text-center mt-4" style={{ color: '#6b5a3a' }}>Nenhum local cadastrado.</p>}

      {showForm && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowForm(false)}>
          <div className="modal-content p-6 w-80" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4" style={{ color: '#c9a84c' }}>Novo Local</h4>
            <form onSubmit={handleSalvar} className="flex flex-col gap-3">
              <div><label className="label-medieval">Nome</label><input className="input-medieval" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div><label className="label-medieval">Descrição</label><textarea className="input-medieval resize-none" rows={3} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost text-xs" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-gold text-xs">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Quests ───────────────────────────────────────────────────
function AbaQuests() {
  const { db, personagemAtivo, adicionarQuest, excluirQuest } = useApp()
  const [busca, setBusca] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', local_id: '', tipo: 'Principal', notas: '', npc_ids: '' })

  const npcs = (db?.npcs || []).filter(n => n.personagem_id === personagemAtivo?.id)
  const locais = (db?.locais || []).filter(l => l.personagem_id === personagemAtivo?.id)

  const quests = (db?.quests || [])
    .filter(q => q.personagem_id === personagemAtivo?.id)
    .filter(q => !busca || q.nome?.toLowerCase().includes(busca.toLowerCase()))

  function getLocal(id) {
    return locais.find(l => l.id === Number(id))?.nome || id
  }

  function getNpcsNomes(ids) {
    if (!ids) return ''
    return String(ids).split(',').map(id => npcs.find(n => n.id === Number(id))?.nome || '').filter(Boolean).join(', ')
  }

  async function handleSalvar(e) {
    e.preventDefault()
    await adicionarQuest({ ...form, personagem_id: personagemAtivo.id })
    setForm({ nome: '', local_id: '', tipo: 'Principal', notas: '', npc_ids: '' })
    setShowForm(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 pt-2">
        <input className="input-medieval flex-1" placeholder="Buscar quest..." value={busca} onChange={e => setBusca(e.target.value)} />
        <button className="btn-gold text-xs" onClick={() => setShowForm(true)}>+ Adicionar Quest</button>
      </div>

      {quests.map(q => (
        <div key={q.id} className="character-card p-4 rounded-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medieval text-sm" style={{ color: '#f0e6c8' }}>
                {q.nome}
                <span className="ml-2 text-xs" style={{ color: q.tipo === 'Principal' ? '#c9a84c' : '#6b5a3a' }}>
                  — {q.tipo}
                </span>
              </p>
              {q.local_id && <p className="text-xs mt-0.5" style={{ color: '#6b5a3a' }}>📍 {getLocal(q.local_id)}</p>}
              {q.npc_ids && <p className="text-xs mt-0.5" style={{ color: '#6b5a3a' }}>👥 {getNpcsNomes(q.npc_ids)}</p>}
              {q.notas && <p className="text-xs mt-1 line-clamp-2" style={{ color: '#9b8a6a' }}>{q.notas}</p>}
            </div>
            <button className="btn-danger text-lg shrink-0" onClick={() => excluirQuest(q.id)}>🗑</button>
          </div>
        </div>
      ))}

      {quests.length === 0 && <p className="text-xs text-center mt-4" style={{ color: '#6b5a3a' }}>Nenhuma quest registrada.</p>}

      {showForm && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowForm(false)}>
          <div className="modal-content p-6 w-96" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4" style={{ color: '#c9a84c' }}>Nova Quest</h4>
            <form onSubmit={handleSalvar} className="flex flex-col gap-3">
              <div><label className="label-medieval">Nome da Quest</label><input className="input-medieval" required value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-medieval">Local</label>
                  <select className="input-medieval" value={form.local_id} onChange={e => setForm(f => ({ ...f, local_id: e.target.value }))}>
                    <option value="">— Selecionar —</option>
                    {locais.map(l => <option key={l.id} value={l.id}>{l.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label-medieval">Tipo</label>
                  <select className="input-medieval" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                    <option>Principal</option>
                    <option>Secundária</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label-medieval">NPCs Envolvidos</label>
                <select className="input-medieval" multiple size={Math.min(npcs.length + 1, 4)}
                  onChange={e => {
                    const ids = Array.from(e.target.selectedOptions).map(o => o.value).join(',')
                    setForm(f => ({ ...f, npc_ids: ids }))
                  }}>
                  {npcs.map(n => <option key={n.id} value={n.id}>{n.nome}</option>)}
                </select>
                {npcs.length === 0 && <p className="text-xs mt-1" style={{ color: '#6b5a3a' }}>Cadastre NPCs primeiro.</p>}
              </div>
              <div><label className="label-medieval">Anotações</label><textarea className="input-medieval resize-none" rows={3} value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} /></div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost text-xs" onClick={() => setShowForm(false)}>Cancelar</button>
                <button type="submit" className="btn-gold text-xs">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
