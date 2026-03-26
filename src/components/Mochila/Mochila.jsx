import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const ICONES = [
  '🎒','🧪','⚗️','🗡️','🏹','🛡️','🪄','📜','🗝️','🔑',
  '💎','💰','🪙','🧲','🔦','🕯️','🪔','🧨','💣','🪤',
  '🧤','🧣','👒','🪖','👢','🥾','🧥','👗','💍','📿',
  '🍖','🍗','🥩','🧀','🍞','🍎','🍇','🧃','🍷','🧴',
  '🪝','🪜','⛏️','🔨','🪓','🔧','🪛','🧰','🪣','🧱',
  '📦','🎁','🪆','🧸','🎲','🎴','🃏','🪬','🧿','🪩',
  '🌿','🍄','🌾','🌺','🌻','💐','🍀','☘️','🪸','🦴',
  '🐉','🦅','🦁','🐺','🐻','🦊','🐍','🦂','🕷️','🦇',
]

const EMPTY_FORM = { nome: '', quantidade: 1, peso: 0, info: '', icone: '🎒' }

export default function Mochila() {
  const { db, personagemAtivo, adicionarItemMochila, editarItemMochila, excluirItemMochila, editarPersonagem } = useApp()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [mostrarIcones, setMostrarIcones] = useState(false)
  const [editandoMoeda, setEditandoMoeda] = useState(null)
  const [valorMoeda, setValorMoeda] = useState('')

  if (!personagemAtivo) return null

  const itens = (db?.mochila || []).filter(i => i.personagem_id === personagemAtivo.id)
  const pesoTotal = itens.reduce((acc, i) => acc + (Number(i.peso) || 0) * (Number(i.quantidade) || 1), 0)
  const MOEDAS = [
    { key: 'moeda_cobre',   label: 'PC', cor: '#b87333' },
    { key: 'moeda_prata',   label: 'PP', cor: '#aab8c2' },
    { key: 'moeda_ouro',    label: 'PO', cor: '#c9a84c' },
    { key: 'moeda_platina', label: 'Pl', cor: '#e5e4e2' },
  ]

  async function salvarMoeda(key) {
    await editarPersonagem(personagemAtivo.id, { [key]: Number(valorMoeda) || 0 })
    setEditandoMoeda(null)
  }

  function abrirNovo() {
    setForm(EMPTY_FORM)
    setMostrarIcones(false)
    setModal({ mode: 'novo' })
  }

  function abrirEditar(item) {
    setForm({ nome: item.nome || '', quantidade: item.quantidade ?? 1, peso: item.peso ?? 0, info: item.info || '', icone: item.icone || '🎒' })
    setMostrarIcones(false)
    setModal({ mode: 'editar', item })
  }

  async function salvar() {
    if (!form.nome.trim()) return
    const dados = {
      ...form,
      quantidade: Number(form.quantidade) || 1,
      peso: Number(form.peso) || 0,
      personagem_id: personagemAtivo.id,
    }
    try {
      if (modal.mode === 'novo') {
        await adicionarItemMochila(dados)
      } else {
        await editarItemMochila(modal.item.id, dados)
      }
      setModal(null)
    } catch (err) {
      console.error('Erro ao salvar item da mochila:', err)
    }
  }

  async function excluir() {
    try {
      await excluirItemMochila(modal.item.id)
      setModal(null)
    } catch (err) {
      console.error('Erro ao excluir item da mochila:', err)
    }
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  return (
    <div className="panel flex flex-col h-full overflow-hidden" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid #6b4a1a' }}>
        <h3 className="font-medieval text-sm" style={{ color: '#c9a84c' }}>Mochila</h3>
        <button
          onClick={abrirNovo}
          className="font-medieval text-xs px-2 py-0.5 rounded-sm transition-colors"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid #6b4a1a', color: '#c9a84c' }}
          title="Adicionar item">
          + Adicionar
        </button>
      </div>

      {/* Grade de itens */}
      <div className="flex-1 overflow-y-auto p-2">
        {itens.length === 0 ? (
          <p className="text-center text-xs py-4" style={{ color: '#3a2810' }}>Mochila vazia</p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {itens.map(item => (
              <button
                key={item.id}
                onClick={() => abrirEditar(item)}
                className="flex flex-col items-center justify-center gap-0.5 rounded-sm p-1.5 transition-colors"
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid #6b4a1a',
                  minHeight: '58px',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icone || '🎒'}</span>
                <span className="text-center leading-tight w-full truncate"
                  style={{ fontSize: '11px', color: '#f0e6c8' }}>
                  {item.nome}
                </span>
                <span className="font-medieval" style={{ fontSize: '11px', color: '#9b8a6a' }}>
                  x{item.quantidade ?? 1}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Peso total */}
      <div className="px-3 py-1.5 shrink-0 flex justify-between items-center"
        style={{ borderTop: '1px solid #6b4a1a' }}>
        <span className="label-medieval" style={{ fontSize: 9 }}>Peso Total</span>
        <span className="font-medieval text-xs" style={{ color: '#f0e6c8' }}>
          {pesoTotal.toFixed(1)} kg
        </span>
      </div>

      {/* Moedas */}
      <div className="px-2 py-2 shrink-0 flex justify-between gap-1"
        style={{ borderTop: '1px solid #6b4a1a' }}>
        {MOEDAS.map(({ key, label, cor }) => {
          const valor = personagemAtivo?.[key] ?? 0
          const editando = editandoMoeda === key
          return (
            <div key={key}
              className="flex-1 flex flex-col items-center gap-0.5 rounded-sm py-1"
              style={{ cursor: editando ? 'default' : 'pointer' }}
              onClick={!editando ? () => { setValorMoeda(String(valor)); setEditandoMoeda(key) } : undefined}
              title={!editando ? 'Clique para editar' : undefined}>
              <span className="font-medieval" style={{ fontSize: 9, color: cor }}>{label}</span>
              {editando ? (
                <input
                  className="font-medieval text-center"
                  style={{ background: 'transparent', border: 'none', borderBottom: `1px solid ${cor}`, color: '#f0e6c8', width: '100%', outline: 'none', fontSize: 11 }}
                  type="number" min={0} step={1}
                  value={valorMoeda}
                  autoFocus
                  onChange={e => setValorMoeda(e.target.value)}
                  onBlur={() => salvarMoeda(key)}
                  onKeyDown={e => { if (e.key === 'Enter') salvarMoeda(key); if (e.key === 'Escape') setEditandoMoeda(null) }}
                />
              ) : (
                <span className="font-medieval" style={{ color: '#f0e6c8', fontSize: 11 }}>{valor}</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content p-6" style={{ width: '340px' }} onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4 text-center" style={{ color: '#c9a84c' }}>
              {form.icone} {modal.mode === 'novo' ? 'Novo Item' : 'Editar Item'}
            </h4>

            <div className="flex flex-col gap-3">
              {/* Ícone */}
              <div>
                <label className="label-medieval">Ícone</label>
                <button
                  type="button"
                  onClick={() => setMostrarIcones(v => !v)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-sm"
                  style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid #6b4a1a', color: '#f0e6c8' }}>
                  <span style={{ fontSize: '20px' }}>{form.icone}</span>
                  <span className="text-xs" style={{ color: '#9b8a6a' }}>
                    {mostrarIcones ? 'Fechar' : 'Escolher ícone'}
                  </span>
                </button>
                {mostrarIcones && (
                  <div className="mt-1 p-2 rounded-sm"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid #6b4a1a', maxHeight: '140px', overflowY: 'auto' }}>
                    <div className="grid grid-cols-8 gap-1">
                      {ICONES.map(ic => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => { set('icone', ic); setMostrarIcones(false) }}
                          className="rounded-sm flex items-center justify-center"
                          style={{
                            fontSize: '18px',
                            padding: '3px',
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
                <label className="label-medieval">Nome do Item</label>
                <input className="input-medieval" placeholder="Ex: Corda, Tocha, Poção..."
                  value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-medieval">Quantidade</label>
                  <input className="input-medieval" type="number" min={1}
                    value={form.quantidade} onChange={e => set('quantidade', e.target.value)} />
                </div>
                <div>
                  <label className="label-medieval">Peso (kg)</label>
                  <input className="input-medieval" type="number" min={0} step={0.1}
                    value={form.peso} onChange={e => set('peso', e.target.value)} />
                </div>
              </div>

              <div>
                <label className="label-medieval">Informações Extras</label>
                <textarea className="input-medieval resize-none" rows={3}
                  placeholder="Descrição, efeitos, valor..."
                  value={form.info} onChange={e => set('info', e.target.value)} />
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
