import { useState } from 'react'
import { useApp } from '../../context/AppContext'

const EMPTY_FORM = { nome: '', descricao: '' }

export default function Talentos() {
  const { db, personagemAtivo, adicionarTalento, editarTalento, excluirTalento } = useApp()
  const [modal, setModal] = useState(null) // null | { mode: 'novo' | 'editar', talento?: {} }
  const [form, setForm] = useState(EMPTY_FORM)

  if (!personagemAtivo) return null

  const talentos = (db?.talentos || []).filter(t => t.personagem_id === personagemAtivo.id)

  function abrirNovo() {
    setForm(EMPTY_FORM)
    setModal({ mode: 'novo' })
  }

  function abrirEditar(talento) {
    setForm({ nome: talento.nome || '', descricao: talento.descricao || '' })
    setModal({ mode: 'editar', talento })
  }

  async function salvar() {
    if (!form.nome.trim()) return
    const dados = { ...form, personagem_id: personagemAtivo.id }
    try {
      if (modal.mode === 'novo') {
        await adicionarTalento(dados)
      } else {
        await editarTalento(modal.talento.id, dados)
      }
      setModal(null)
    } catch (err) {
      console.error('Erro ao salvar talento:', err)
    }
  }

  async function excluir() {
    try {
      await excluirTalento(modal.talento.id)
      setModal(null)
    } catch (err) {
      console.error('Erro ao excluir talento:', err)
    }
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }))
  }

  return (
    <div className="panel flex flex-col overflow-hidden shrink-0" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="px-4 pt-2 pb-2 shrink-0 flex items-center justify-between"
        style={{ borderBottom: '1px solid #6b4a1a' }}>
        <h3 className="font-medieval text-sm font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.05em' }}>Talentos</h3>
        <button
          onClick={abrirNovo}
          className="font-medieval text-xs px-2 py-0.5 rounded-sm transition-colors"
          style={{ background: 'rgba(201,168,76,0.15)', border: '1px solid #6b4a1a', color: '#c9a84c' }}>
          + Adicionar
        </button>
      </div>

      {/* Lista */}
      <div className="overflow-y-auto p-3" style={{ maxHeight: '200px' }}>
        {talentos.length === 0 ? (
          <p className="text-center text-xs py-6" style={{ color: '#3a2810' }}>Nenhum talento adicionado</p>
        ) : (
          <div className="flex flex-col gap-2">
            {talentos.map(t => (
              <button
                key={t.id}
                onClick={() => abrirEditar(t)}
                className="text-left rounded-sm transition-colors w-full"
                style={{
                  background: 'rgba(201,168,76,0.08)',
                  border: '1px solid #6b4a1a',
                  padding: '10px 14px',
                }}>
                <div className="font-medieval" style={{ color: '#c9a84c', fontSize: 12 }}>{t.nome}</div>
                {t.descricao && (
                  <div className="mt-1 line-clamp-1" style={{ color: '#9b8a6a', fontSize: 11 }}>{t.descricao}</div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content p-6 w-80" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4 text-center" style={{ color: '#c9a84c' }}>
              ⚔️ {modal.mode === 'novo' ? 'Novo Talento' : 'Editar Talento'}
            </h4>

            <div className="flex flex-col gap-3">
              <div>
                <label className="label-medieval">Nome do Talento</label>
                <input className="input-medieval" placeholder="Ex: Ataque Poderoso, Esquiva..."
                  value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>
              <div>
                <label className="label-medieval">Descrição</label>
                <textarea className="input-medieval resize-none" rows={4}
                  placeholder="Descreva os efeitos do talento..."
                  value={form.descricao} onChange={e => set('descricao', e.target.value)} />
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
