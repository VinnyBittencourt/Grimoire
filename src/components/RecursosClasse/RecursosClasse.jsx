import { useState, useEffect, useRef } from 'react'
import { useApp } from '../../context/AppContext'

const ICONES_RECURSO = [
  '⚡','✨','🔥','💜','🌟','💫','🩸','🌊','🌪️','☄️',
  '🎵','🗡️','🛡️','💀','🐉','🦅','🌿','❄️','⚗️','🪄',
  '☀️','🌑','💚','❤️','✝️','🎯','🔮','🧿','⚜️','🪬',
]

// Recursos padrão por classe: (nivel) => [{ nome, icone, total }]
const RECURSOS_PADRAO = {
  'Bárbaro':        n => [{ nome: 'Fúria', icone: '🔥', total: 1 + Math.floor((n - 1) / 4) }],
  'Bardo':          n => [{ nome: 'Inspiração Bárdica', icone: '🎵', total: Math.max(1, Math.floor(n / 4) + 1) }],
  'Clérigo':        n => [{ nome: 'Expulsar Mortos-Vivos', icone: '☀️', total: 3 }],
  'Druida':         n => [{ nome: 'Forma Selvagem', icone: '🐺', total: n >= 18 ? 6 : n >= 14 ? 5 : n >= 12 ? 4 : n >= 8 ? 3 : n >= 6 ? 2 : 1 }],
  'Monge':          n => [{ nome: 'Ataque em Turbilhão', icone: '🌀', total: 1 }, { nome: 'Queda Suave (m)', icone: '🌟', total: n * 6 }],
  'Paladino':       n => [{ nome: 'Expulsar Mortos-Vivos', icone: '✝️', total: 3 }, { nome: 'Imposição de Mãos', icone: '💚', total: 1 }],
  'Duskblade':      n => [{ nome: 'Arcane Channeling', icone: '⚡', total: n >= 13 ? Math.max(3, Math.floor(n / 2)) : 1 }],
  'Factotum':       n => [{ nome: 'Inspiração', icone: '✨', total: n }],
  'Warlock':        n => [{ nome: 'Invocação (à vontade)', icone: '💜', total: 5 }],
  'Hexblade':       n => [{ nome: 'Maldição do Hexblade', icone: '🪄', total: 1 + Math.floor((n + 2) / 5) }],
  'Ninja':          n => [{ nome: 'Ki (Invisibilidade)', icone: '🌑', total: Math.max(1, Math.floor(n / 2)) }],
  'Dragon Shaman':  n => [{ nome: 'Sopro do Dragão', icone: '🐉', total: 3 }],
  'Crusader':       n => [{ nome: 'Cura Persistente', icone: '❤️', total: Math.ceil(n / 2) }],
  'Swordsage':      n => [{ nome: 'Recuperar Manobra', icone: '🗡️', total: 1 }],
  'Warblade':       n => [{ nome: 'Recuperar Manobra', icone: '⚔️', total: 1 }],
  'Beguiler':       n => [{ nome: 'Magia Espontânea', icone: '🎯', total: 1 }],
  'Warmage':        n => [{ nome: 'Arma de Guerra', icone: '☄️', total: 1 }],
  'Scout':          n => [{ nome: 'Ataque em Movimento', icone: '🏹', total: 1 }],
}

const EMPTY_FORM = { nome: '', classe: '', icone: '✨', total: 3 }

function parseUsos(usos_json, total) {
  try {
    const arr = usos_json ? JSON.parse(usos_json) : []
    return Array.from({ length: total }, (_, i) => arr[i] ?? { usado: false, nota: '' })
  } catch {
    return Array.from({ length: total }, () => ({ usado: false, nota: '' }))
  }
}

function getClassesDoPersonagem(p) {
  try {
    if (p.multiclasses) return JSON.parse(p.multiclasses)
  } catch {}
  return [{ classe: p.classe, nivel: p.level || 1 }]
}

export default function RecursosClasse() {
  const { db, personagemAtivo, adicionarRecurso, editarRecurso, excluirRecurso } = useApp()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [mostrarIcones, setMostrarIcones] = useState(false)
  const [notaAtiva, setNotaAtiva] = useState(null)
  const inicializadoRef = useRef(null)

  const recursos = (db?.recursos || []).filter(r => r.personagem_id === personagemAtivo?.id)

  // Auto-inicializar recursos com base nas classes do personagem
  useEffect(() => {
    if (!personagemAtivo || !db || recursos.length > 0) return
    if (inicializadoRef.current === personagemAtivo.id) return
    inicializadoRef.current = personagemAtivo.id

    const classes = getClassesDoPersonagem(personagemAtivo)
    const recursosParaCriar = []

    for (const { classe, nivel } of classes) {
      const fn = RECURSOS_PADRAO[classe]
      if (fn) {
        const lista = fn(Number(nivel) || 1)
        for (const r of lista) {
          recursosParaCriar.push({ ...r, classe, personagem_id: personagemAtivo.id })
        }
      }
    }

    async function criar() {
      for (const r of recursosParaCriar) {
        const usos = Array.from({ length: r.total }, () => ({ usado: false, nota: '' }))
        await adicionarRecurso({ ...r, usos_json: JSON.stringify(usos) })
      }
    }
    if (recursosParaCriar.length > 0) criar()
  }, [personagemAtivo?.id, db])

  if (!personagemAtivo) return null

  function abrirNovo() {
    setForm(EMPTY_FORM)
    setMostrarIcones(false)
    setModal({ mode: 'novo' })
  }

  function abrirEditar(r) {
    setForm({ nome: r.nome || '', classe: r.classe || '', icone: r.icone || '✨', total: r.total || 3 })
    setMostrarIcones(false)
    setModal({ mode: 'editar', recurso: r })
  }

  async function salvar() {
    if (!form.nome.trim()) return
    const dados = { ...form, total: Number(form.total) || 1, personagem_id: personagemAtivo.id }
    if (modal.mode === 'novo') {
      const usos = Array.from({ length: dados.total }, () => ({ usado: false, nota: '' }))
      await adicionarRecurso({ ...dados, usos_json: JSON.stringify(usos) })
    } else {
      const usosAtuais = parseUsos(modal.recurso.usos_json, modal.recurso.total || 3)
      const novosUsos = Array.from({ length: dados.total }, (_, i) => usosAtuais[i] ?? { usado: false, nota: '' })
      await editarRecurso(modal.recurso.id, { ...dados, usos_json: JSON.stringify(novosUsos) })
    }
    setModal(null)
  }

  async function excluir() {
    await excluirRecurso(modal.recurso.id)
    setModal(null)
  }

  async function toggleSlot(recurso, idx) {
    const usos = parseUsos(recurso.usos_json, recurso.total)
    usos[idx] = { ...usos[idx], usado: !usos[idx].usado, nota: usos[idx].usado ? '' : usos[idx].nota }
    await editarRecurso(recurso.id, { ...recurso, usos_json: JSON.stringify(usos) })
  }

  async function salvarNota(recurso, idx, nota) {
    const usos = parseUsos(recurso.usos_json, recurso.total)
    usos[idx] = { ...usos[idx], nota }
    await editarRecurso(recurso.id, { ...recurso, usos_json: JSON.stringify(usos) })
    setNotaAtiva(null)
  }

  async function resetar(recurso) {
    const usos = Array.from({ length: recurso.total }, () => ({ usado: false, nota: '' }))
    await editarRecurso(recurso.id, { ...recurso, usos_json: JSON.stringify(usos) })
  }

  function set(key, val) { setForm(f => ({ ...f, [key]: val })) }

  return (
    <div className="panel shrink-0" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between shrink-0"
        style={{ padding: '10px 14px', borderBottom: '1px solid #6b4a1a' }}>
        <h3 className="font-medieval text-sm font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.05em' }}>Recursos de Classe</h3>
        <button onClick={abrirNovo}
          className="font-medieval text-xs rounded-sm"
          style={{ padding: '2px 8px', background: 'rgba(201,168,76,0.15)', border: '1px solid #6b4a1a', color: '#c9a84c' }}>
          + Adicionar
        </button>
      </div>

      {/* Lista */}
      <div style={{ padding: '10px 14px' }}>
        {recursos.length === 0 ? (
          <p className="text-center text-xs" style={{ color: '#3a2810', padding: '12px 0' }}>
            Nenhum recurso de classe
          </p>
        ) : (
          <div className="flex flex-col" style={{ gap: '10px' }}>
            {recursos.map(r => {
              const usos = parseUsos(r.usos_json, r.total)
              const disponiveis = usos.filter(u => !u.usado).length
              return (
                <div key={r.id} className="rounded-sm"
                  style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid #6b4a1a', padding: '10px 12px' }}>

                  <div className="flex items-center justify-between" style={{ marginBottom: '8px' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '16px' }}>{r.icone}</span>
                      <div>
                        <span className="font-medieval" style={{ color: '#c9a84c', fontSize: 12 }}>{r.nome}</span>
                        {r.classe && (
                          <span style={{ color: '#6b5a3a', fontSize: 11, marginLeft: '6px' }}>({r.classe})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medieval text-xs" style={{ color: disponiveis > 0 ? '#c9a84c' : '#6b5a3a' }}>
                        {disponiveis}/{r.total}
                      </span>
                      <button onClick={() => resetar(r)} title="Resetar usos" className="text-xs rounded-sm"
                        style={{ padding: '1px 6px', background: 'rgba(201,168,76,0.1)', border: '1px solid #6b4a1a', color: '#9b8a6a' }}>
                        ↺
                      </button>
                      <button onClick={() => abrirEditar(r)} title="Editar" className="text-xs rounded-sm"
                        style={{ padding: '1px 6px', background: 'rgba(201,168,76,0.1)', border: '1px solid #6b4a1a', color: '#9b8a6a' }}>
                        ✎
                      </button>
                    </div>
                  </div>

                  {/* Tokens */}
                  <div className="flex flex-wrap" style={{ gap: '6px' }}>
                    {usos.map((u, idx) => (
                      <div key={idx} className="flex flex-col items-center" style={{ gap: '2px' }}>
                        <button onClick={() => toggleSlot(r, idx)}
                          title={u.usado ? `Usado: ${u.nota || 'sem nota'}` : 'Disponível'}
                          style={{
                            fontSize: '22px', lineHeight: 1, padding: '4px', borderRadius: '4px',
                            border: u.usado ? '1px solid #3a2810' : '1px solid #c9a84c44',
                            background: u.usado ? 'rgba(0,0,0,0.3)' : 'rgba(201,168,76,0.12)',
                            opacity: u.usado ? 0.35 : 1,
                            cursor: 'pointer', transition: 'all 0.15s',
                            filter: u.usado ? 'grayscale(1)' : 'none',
                          }}>
                          {r.icone}
                        </button>
                        {u.usado && (
                          <button onClick={() => setNotaAtiva({ recursoId: r.id, idx })}
                            title={u.nota || 'Adicionar nota'}
                            style={{
                              fontSize: '8px', maxWidth: '32px', color: u.nota ? '#9b8a6a' : '#3a2810',
                              background: 'none', border: 'none', cursor: 'pointer',
                              textAlign: 'center', lineHeight: 1.2, overflow: 'hidden',
                              textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                            {u.nota || '+ nota'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {notaAtiva?.recursoId === r.id && (
                    <NoteInput
                      defaultValue={usos[notaAtiva.idx]?.nota || ''}
                      onSave={nota => salvarNota(r, notaAtiva.idx, nota)}
                      onCancel={() => setNotaAtiva(null)}
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content p-6 w-72" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4 text-center" style={{ color: '#c9a84c' }}>
              {form.icone} {modal.mode === 'novo' ? 'Novo Recurso' : 'Editar Recurso'}
            </h4>

            <div className="flex flex-col gap-3">
              <div>
                <label className="label-medieval">Ícone</label>
                <button type="button" onClick={() => setMostrarIcones(v => !v)}
                  className="flex items-center gap-2 w-full rounded-sm"
                  style={{ padding: '8px 12px', background: 'rgba(0,0,0,0.4)', border: '1px solid #6b4a1a', color: '#f0e6c8' }}>
                  <span style={{ fontSize: '20px' }}>{form.icone}</span>
                  <span className="text-xs" style={{ color: '#9b8a6a' }}>{mostrarIcones ? 'Fechar' : 'Escolher'}</span>
                </button>
                {mostrarIcones && (
                  <div className="mt-1 p-2 rounded-sm" style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #6b4a1a' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '4px' }}>
                      {ICONES_RECURSO.map(ic => (
                        <button key={ic} type="button" onClick={() => { set('icone', ic); setMostrarIcones(false) }}
                          style={{
                            fontSize: '18px', padding: '3px', borderRadius: '4px',
                            background: form.icone === ic ? 'rgba(201,168,76,0.3)' : 'transparent',
                            border: form.icone === ic ? '1px solid #c9a84c' : '1px solid transparent',
                          }}>
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label-medieval">Nome do Recurso</label>
                <input className="input-medieval" placeholder="Ex: Fúria, Inspiração..."
                  value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>

              <div>
                <label className="label-medieval">Classe</label>
                <input className="input-medieval" placeholder="Ex: Duskblade, Bárbaro..."
                  value={form.classe} onChange={e => set('classe', e.target.value)} />
              </div>

              <div>
                <label className="label-medieval">Total de Usos</label>
                <input className="input-medieval text-center" type="number" min={1} max={20}
                  value={form.total} onChange={e => set('total', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {modal.mode === 'editar' && (
                <button className="btn-danger text-xs" onClick={excluir}>Remover</button>
              )}
              <div className="flex gap-2 ml-auto">
                <button className="btn-ghost text-xs" onClick={() => setModal(null)}>Cancelar</button>
                <button className="btn-gold text-xs" onClick={salvar}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NoteInput({ defaultValue, onSave, onCancel }) {
  const [val, setVal] = useState(defaultValue)
  return (
    <div className="flex gap-2 mt-2 items-center">
      <input autoFocus className="input-medieval text-xs flex-1"
        placeholder="Como foi usado..."
        value={val} onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') onSave(val); if (e.key === 'Escape') onCancel() }} />
      <button onClick={() => onSave(val)} className="btn-gold text-xs" style={{ padding: '4px 8px' }}>✓</button>
      <button onClick={onCancel} className="btn-ghost text-xs" style={{ padding: '4px 8px' }}>✕</button>
    </div>
  )
}
