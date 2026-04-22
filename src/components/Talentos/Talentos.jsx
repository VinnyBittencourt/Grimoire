import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { useLang } from '../../context/LangContext'
import { formatarEfeito } from '../../services/dnd35Feats'

const EMPTY_FORM = { nome: '', descricao: '' }

// Categorias com ícone para os chips de filtro
const CATEGORIAS_COM_ICONE = [
  { id: '', label: 'Todos' },
  { id: 'Geral', label: 'Geral' },
  { id: 'Guerreiro', label: '⚔ Guerreiro' },
  { id: 'Metamágico', label: '✨ Metamágico' },
  { id: 'Criação de Item', label: '⚗ Itens' },
  { id: 'Divino', label: '☀ Divino' },
  { id: 'Habilidade de Classe', label: '🎓 Classe' },
  { id: 'Raça', label: '🐉 Raça' },
]

// Cor do chip de efeito por tipo
function corEfeito(tipo) {
  if (tipo === 'bonus_save') return { bg: 'rgba(100,150,255,0.2)', border: '#5577cc44', color: '#88aaff' }
  if (tipo === 'bonus_initiative') return { bg: 'rgba(255,200,80,0.2)', border: '#cc992244', color: '#ffcc44' }
  if (tipo === 'bonus_hp') return { bg: 'rgba(200,80,80,0.2)', border: '#cc444444', color: '#ff8888' }
  if (tipo === 'bonus_slot') return { bg: 'rgba(180,100,255,0.2)', border: '#9944cc44', color: '#cc88ff' }
  if (tipo === 'bonus_turning' || tipo === 'bonus_resource') return { bg: 'rgba(80,200,150,0.2)', border: '#44aa7744', color: '#88ddbb' }
  if (tipo === 'bonus_skill') return { bg: 'rgba(150,180,100,0.2)', border: '#778844', color: '#aabb66' }
  if (tipo === 'especial') return { bg: 'rgba(120,100,80,0.2)', border: '#6b5a3a44', color: '#9b8a6a' }
  return { bg: 'rgba(201,168,76,0.15)', border: '#c9a84c33', color: '#c9a84c' }
}

export default function Talentos() {
  const { db, personagemAtivo, adicionarTalento, editarTalento, excluirTalento, refData } = useApp()
  const { t } = useLang()
  const livrosDisponiveis = useMemo(() => [...new Set(refData.talentos.map(f => f.livro))].sort(), [refData.talentos])
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Estado do picker
  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroLivro, setFiltroLivro] = useState('')
  const [featSelecionada, setFeatSelecionada] = useState(null)

  if (!personagemAtivo) return null

  const talentos = (db?.talentos || []).filter(t => t.personagem_id === personagemAtivo.id)

  // Filtro do picker — busca em PT e EN simultaneamente
  const featsFiltradas = useMemo(() => {
    const q = busca.toLowerCase().trim()
    return refData.talentos.filter(f => {
      if (filtroCategoria && !(Array.isArray(f.categoria) ? f.categoria.includes(filtroCategoria) : f.categoria === filtroCategoria)) return false
      if (filtroLivro && f.livro !== filtroLivro) return false
      if (q) {
        // deriva nome EN do ID: "phb_power_attack" → "power attack"
        const nomeEn = f.id.replace(/^[a-z]+_/, '').replace(/_/g, ' ')
        const match = f.nome.toLowerCase().includes(q)
          || nomeEn.includes(q)
          || (f.descricao || '').toLowerCase().includes(q)
          || (f.prerequisitos || '').toLowerCase().includes(q)
        if (!match) return false
      }
      return true
    })
  }, [busca, filtroCategoria, filtroLivro, refData.talentos])

  function abrirPicker() {
    setBusca('')
    setFiltroCategoria('')
    setFiltroLivro('')
    setFeatSelecionada(null)
    setModal({ mode: 'picker' })
  }

  function abrirNovo() {
    setForm(EMPTY_FORM)
    setModal({ mode: 'novo' })
  }

  function abrirEditar(talento) {
    setForm({ nome: talento.nome || '', descricao: talento.descricao || '' })
    setModal({ mode: 'editar', talento })
  }

  async function adicionarFeatDoDatabase() {
    if (!featSelecionada) return
    const dados = {
      feat_id: featSelecionada.id,
      nome: featSelecionada.nome,
      descricao: featSelecionada.descricao,
      personagem_id: personagemAtivo.id,
    }
    await adicionarTalento(dados)
    setModal(null)
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
        <h3 className="font-medieval text-sm font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.05em' }}>{t('talentos', 'title')}</h3>
        <div className="flex gap-1">
          <button
            onClick={abrirPicker}
            className="font-medieval text-xs px-2 py-0.5 rounded-sm transition-colors"
            style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid #c9a84c55', color: '#c9a84c' }}
            title="Adicionar talento do banco D&D 3.5">
            {t('talentos', 'addDnd')}
          </button>
          <button
            onClick={abrirNovo}
            className="font-medieval text-xs px-2 py-0.5 rounded-sm transition-colors"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid #6b4a1a', color: '#9b8a6a' }}
            title="Adicionar talento customizado">
            {t('talentos', 'addCustom')}
          </button>
        </div>
      </div>

      {/* Lista */}
      <div className="overflow-y-auto p-3" style={{ maxHeight: '280px' }}>
        {talentos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <p className="text-center text-xs" style={{ color: '#3a2810' }}>{t('talentos', 'none')}</p>
            <button onClick={abrirPicker}
              className="text-xs font-medieval"
              style={{ color: '#6b5a3a', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}>
              {t('talentos', 'explore')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {talentos.map(t => {
              const featData = t.feat_id ? refData.talentos.find(f => f.id === t.feat_id) : null
              const efeitos = featData?.efeitos?.filter(e => e.tipo !== 'especial') || []
              const especiais = featData?.efeitos?.filter(e => e.tipo === 'especial') || []
              return (
                <button
                  key={t.id}
                  onClick={() => abrirEditar(t)}
                  className="text-left rounded-sm transition-colors w-full"
                  style={{
                    background: 'rgba(201,168,76,0.08)',
                    border: '1px solid #6b4a1a',
                    padding: '10px 14px',
                  }}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medieval" style={{ color: '#c9a84c', fontSize: 12 }}>{t.nome}</div>
                    {featData && (
                      <span style={{ fontSize: 9, color: '#6b5a3a', flexShrink: 0, marginTop: 1 }}>{featData.livro}</span>
                    )}
                  </div>
                  {efeitos.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {efeitos.map((ef, i) => {
                        const c = corEfeito(ef.tipo)
                        return (
                          <span key={i} style={{
                            fontSize: 9, padding: '1px 5px', borderRadius: 3,
                            background: c.bg, border: `1px solid ${c.border}`,
                            color: c.color, fontFamily: 'Cinzel, serif',
                          }}>
                            {formatarEfeito(ef)}
                          </span>
                        )
                      })}
                    </div>
                  )}
                  {especiais.length > 0 && (
                    <div className="mt-1" style={{ fontSize: 10, color: '#7a6a4a', lineHeight: 1.4 }}>
                      {especiais[0]?.nota?.split(';')[0]?.trim()}
                    </div>
                  )}
                  {!featData && t.descricao && (
                    <div className="mt-1 line-clamp-1" style={{ color: '#9b8a6a', fontSize: 11 }}>{t.descricao}</div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Modal Picker D&D 3.5 ── */}
      {modal?.mode === 'picker' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content flex flex-col"
            style={{ width: 780, maxWidth: '96vw', maxHeight: '88vh', minHeight: 520 }}
            onClick={e => e.stopPropagation()}>

            {/* Header */}
            <div className="flex items-center justify-between shrink-0"
              style={{ padding: '14px 20px', borderBottom: '1px solid #6b4a1a' }}>
              <div>
                <h4 className="font-medieval text-base" style={{ color: '#c9a84c' }}>{t('talentos', 'bankTitle')}</h4>
                <p style={{ fontSize: 10, color: '#6b5a3a', marginTop: 2 }}>{t('talentos', 'available')(refData.talentos.length)}</p>
              </div>
              <button onClick={() => setModal(null)}
                style={{ color: '#6b5a3a', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4 }}>✕</button>
            </div>

            {/* Barra de busca */}
            <div className="shrink-0" style={{ padding: '12px 20px 0' }}>
              <div style={{ position: 'relative' }}>
                <span style={{
                  position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 13, color: '#6b5a3a', pointerEvents: 'none',
                }}>🔍</span>
                <input
                  className="input-medieval w-full"
                  style={{ paddingLeft: 30 }}
                  placeholder={t('talentos', 'searchPlaceholder')}
                  value={busca}
                  onChange={e => { setBusca(e.target.value); setFeatSelecionada(null) }}
                  autoFocus
                />
              </div>
            </div>

            {/* Filtros de categoria como chips */}
            <div className="shrink-0" style={{ padding: '8px 20px', borderBottom: '1px solid #6b4a1a33' }}>
              <div className="flex flex-wrap gap-1.5" style={{ marginBottom: 6 }}>
                {CATEGORIAS_COM_ICONE.map(cat => (
                  <button key={cat.id}
                    onClick={() => { setFiltroCategoria(cat.id); setFeatSelecionada(null) }}
                    style={{
                      fontSize: 10, padding: '3px 9px', borderRadius: 20, cursor: 'pointer',
                      transition: 'all 0.15s', fontFamily: 'Cinzel, serif',
                      background: filtroCategoria === cat.id ? 'rgba(201,168,76,0.3)' : 'rgba(201,168,76,0.06)',
                      border: filtroCategoria === cat.id ? '1px solid #c9a84c' : '1px solid #6b4a1a',
                      color: filtroCategoria === cat.id ? '#f0e6c8' : '#9b8a6a',
                    }}>
                    {cat.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <select className="input-medieval" style={{ fontSize: 10, padding: '3px 8px', minWidth: 150 }}
                  value={filtroLivro} onChange={e => { setFiltroLivro(e.target.value); setFeatSelecionada(null) }}>
                  <option value="">{t('talentos', 'allBooks')}</option>
                  {livrosDisponiveis.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                {(busca || filtroCategoria || filtroLivro) && (
                  <button
                    onClick={() => { setBusca(''); setFiltroCategoria(''); setFiltroLivro(''); setFeatSelecionada(null) }}
                    style={{ fontSize: 10, color: '#6b5a3a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                    {t('talentos', 'clearFilters')}
                  </button>
                )}
                <span style={{ fontSize: 10, color: '#3a2810', marginLeft: 'auto' }}>
                  {t('talentos', 'results')(featsFiltradas.length)}
                </span>
              </div>
            </div>

            {/* Corpo: lista + detalhe */}
            <div className="flex flex-1 min-h-0">

              {/* Lista de feats */}
              <div className="flex flex-col overflow-y-auto"
                style={{ flex: 1, borderRight: '1px solid #6b4a1a44' }}>
                {featsFiltradas.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2" style={{ padding: 32, color: '#6b5a3a' }}>
                    <span style={{ fontSize: 28, opacity: 0.4 }}>🔍</span>
                    <p style={{ fontSize: 12, textAlign: 'center' }}>{t('talentos', 'noneFound')}</p>
                    <button onClick={() => { setBusca(''); setFiltroCategoria(''); setFiltroLivro('') }}
                      style={{ fontSize: 11, color: '#9b8a6a', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                      {t('talentos', 'clearFiltersLink')}
                    </button>
                  </div>
                ) : (
                  featsFiltradas.map(feat => {
                    const isAtivo = featSelecionada?.id === feat.id
                    // Pega até 2 efeitos mecânicos (não-especiais) para preview na lista
                    const efeitosPreview = feat.efeitos.filter(e => e.tipo !== 'especial').slice(0, 2)
                    return (
                      <button key={feat.id}
                        onClick={() => setFeatSelecionada(feat)}
                        style={{
                          textAlign: 'left', padding: '9px 13px 9px 16px',
                          background: isAtivo ? 'rgba(201,168,76,0.14)' : 'transparent',
                          borderTop: 'none', borderRight: 'none', borderLeft: 'none',
                          borderBottom: '1px solid rgba(107,74,26,0.08)',
                          boxShadow: isAtivo ? 'inset 3px 0 0 #c9a84c' : 'none',
                          cursor: 'pointer', transition: 'all 0.1s',
                        }}>
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-medieval text-xs" style={{ color: isAtivo ? '#f0e6c8' : '#c9a84c' }}>
                            {feat.nome}
                          </span>
                          <span style={{ fontSize: 9, color: '#4a3820', flexShrink: 0 }}>{feat.livro}</span>
                        </div>
                        {efeitosPreview.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {efeitosPreview.map((ef, i) => {
                              const c = corEfeito(ef.tipo)
                              return (
                                <span key={i} style={{
                                  fontSize: 8, padding: '1px 5px', borderRadius: 10,
                                  background: c.bg, border: `1px solid ${c.border}`,
                                  color: c.color,
                                }}>
                                  {formatarEfeito(ef)}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <div style={{ fontSize: 9, color: '#4a3820', marginTop: 2 }}>
                            {feat.categoria.join(' · ')}
                          </div>
                        )}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Painel de detalhe */}
              <div className="flex flex-col" style={{ width: 260, minWidth: 260 }}>
                {featSelecionada ? (
                  <div className="flex flex-col h-full">
                    {/* Nome e badges */}
                    <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #6b4a1a22' }}>
                      <p className="font-medieval" style={{ color: '#f0e6c8', fontSize: 14, lineHeight: 1.3, marginBottom: 6 }}>
                        {featSelecionada.nome}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(201,168,76,0.15)', border: '1px solid #c9a84c33', color: '#c9a84c' }}>
                          {featSelecionada.livro}
                        </span>
                        {featSelecionada.categoria.map(c => (
                          <span key={c} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: 'rgba(100,100,100,0.15)', border: '1px solid #6b4a1a', color: '#9b8a6a' }}>
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Conteúdo scrollável */}
                    <div className="flex-1 overflow-y-auto" style={{ padding: '12px 16px' }}>
                      {featSelecionada.prerequisitos && (
                        <div style={{ marginBottom: 12, padding: '8px 10px', borderRadius: 4, background: 'rgba(180,120,40,0.08)', border: '1px solid #6b4a1a44' }}>
                          <p style={{ fontSize: 9, color: '#8a6a2a', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('talentos', 'prerequisites')}</p>
                          <p style={{ fontSize: 11, color: '#c0a060', lineHeight: 1.4 }}>{featSelecionada.prerequisitos}</p>
                        </div>
                      )}

                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontSize: 9, color: '#6b5a3a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('talentos', 'benefit')}</p>
                        <p style={{ fontSize: 11, color: '#c0a882', lineHeight: 1.6 }}>{featSelecionada.descricao}</p>
                      </div>

                      {featSelecionada.efeitos.length > 0 && (
                        <div>
                          <p style={{ fontSize: 9, color: '#6b5a3a', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t('talentos', 'mechanics')}</p>
                          <div className="flex flex-col gap-1.5">
                            {featSelecionada.efeitos.map((ef, i) => {
                              const c = corEfeito(ef.tipo)
                              return (
                                <div key={i} style={{
                                  padding: '5px 8px', borderRadius: 4,
                                  background: c.bg, border: `1px solid ${c.border}`,
                                  fontSize: 10, color: c.color, lineHeight: 1.4,
                                }}>
                                  {ef.tipo === 'especial' ? ef.nota : formatarEfeito(ef)}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Botão de adicionar */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #6b4a1a33', flexShrink: 0 }}>
                      <button className="btn-gold w-full" style={{ fontSize: 12 }} onClick={adicionarFeatDoDatabase}>
                        {t('talentos', 'addToChar')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ padding: 20 }}>
                    <span style={{ fontSize: 32, opacity: 0.2 }}>📜</span>
                    <p style={{ fontSize: 11, color: '#3a2810', textAlign: 'center', lineHeight: 1.5 }}>
                      {t('talentos', 'clickDetail')}
                    </p>
                    <div style={{ fontSize: 10, color: '#3a2810', textAlign: 'center', lineHeight: 1.6, marginTop: 4 }}>
                      <p>{t('talentos', 'categories')}</p>
                      <p>{t('talentos', 'orSearch')}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '10px 20px', borderTop: '1px solid #6b4a1a22', flexShrink: 0, background: 'rgba(0,0,0,0.1)' }}>
              <button className="btn-ghost text-xs" onClick={abrirNovo} style={{ fontSize: 11 }}>
                {t('talentos', 'notFound')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal customizado / editar ── */}
      {(modal?.mode === 'novo' || modal?.mode === 'editar') && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-content p-6 w-80" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4 text-center" style={{ color: '#c9a84c' }}>
              ⚔️ {modal.mode === 'novo' ? t('talentos', 'customTitle') : t('talentos', 'editTitle')}
            </h4>

            <div className="flex flex-col gap-3">
              <div>
                <label className="label-medieval">{t('talentos', 'featName')}</label>
                <input className="input-medieval" placeholder={t('talentos', 'featPlaceholder')}
                  value={form.nome} onChange={e => set('nome', e.target.value)} />
              </div>
              <div>
                <label className="label-medieval">{t('talentos', 'featDesc')}</label>
                <textarea className="input-medieval resize-none" rows={4}
                  placeholder={t('talentos', 'descPlaceholder')}
                  value={form.descricao} onChange={e => set('descricao', e.target.value)} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {modal.mode === 'editar' && (
                <button className="btn-danger text-xs" onClick={excluir}>{t('talentos', 'remove')}</button>
              )}
              <div className="flex gap-2 ml-auto">
                <button className="btn-ghost text-xs" onClick={() => setModal(null)}>{t('talentos', 'cancel')}</button>
                <button className="btn-gold text-xs" onClick={salvar}>{t('talentos', 'save')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
