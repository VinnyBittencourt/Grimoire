import { useState, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { EscolaIcon, ESCOLA_CORES } from '../../assets/icons/escolaIcons'
import { calcularSlots, ATRIBUTO_MAGICO, CLASSES_COM_MAGIA, ESCOLAS_MAGIA, MAGIAS_PADRAO } from '../../services/dnd35Tables'

export default function SpellPrepModal({ onClose }) {
  const { db, personagemAtivo, salvarPreparacao, adicionarMagia, excluirMagia } = useApp()
  const [nivelSelecionado, setNivelSelecionado] = useState(null)
  const [preparadas, setPreparadas] = useState({})
  const [showNovasMagia, setShowNovasMagia] = useState(false)
  const [magiaHover, setMagiaHover] = useState(null)
  const [formMagia, setFormMagia] = useState({ nome: '', nivel: 1, escola: 'Evocação', descricao: '' })

  const p = personagemAtivo

  const slots = useMemo(() => {
    const atribKey = ATRIBUTO_MAGICO[p?.classe]
    const atribVal = atribKey ? (Number(p[atribKey]) || 10) : 10
    return calcularSlots(p?.classe, Number(p?.level), atribVal)
  }, [p])

  const temMagia = CLASSES_COM_MAGIA.includes(p?.classe)
  const niveisDisponiveis = slots
    ? slots.map((qtd, i) => ({ nivel: i, slots: qtd })).filter(n => n.slots > 0)
    : []

  const magiasPersonagem = (db?.magias || []).filter(m => m.personagem_id === p?.id && m.escola !== 'Normal')

  const magiasDisponiveis = useMemo(() => {
    if (nivelSelecionado === null) return []
    const builtin = MAGIAS_PADRAO[p?.classe]?.[nivelSelecionado] || []
    const builtinComId = builtin.map(m => {
      const existente = magiasPersonagem.find(mp => mp.nome === m.nome && Number(mp.nivel) === nivelSelecionado)
      return existente || m
    })
    const nomesBuiltin = new Set(builtin.map(m => m.nome))
    const custom = magiasPersonagem.filter(m => Number(m.nivel) === nivelSelecionado && !nomesBuiltin.has(m.nome))
    return [...builtinComId, ...custom]
  }, [nivelSelecionado, p?.classe, magiasPersonagem])

  const nomesBuiltinNivel = useMemo(() => {
    if (nivelSelecionado === null) return new Set()
    return new Set((MAGIAS_PADRAO[p?.classe]?.[nivelSelecionado] || []).map(m => m.nome))
  }, [nivelSelecionado, p?.classe])

  const slotsDisponivelNivel = nivelSelecionado !== null ? (slots?.[nivelSelecionado] || 0) : 0
  const preparadasNivel = preparadas[nivelSelecionado] || []
  const usadoNivel = preparadasNivel.length
  const slotsRestantes = slotsDisponivelNivel - usadoNivel

  async function adicionarNaPreparacao(magia) {
    if (usadoNivel >= slotsDisponivelNivel) return
    let magiaComId = magia
    if (!magia.id) {
      magiaComId = await adicionarMagia({ ...magia, personagem_id: p.id, nivel: Number(nivelSelecionado) })
    }
    setPreparadas(prev => ({
      ...prev,
      [nivelSelecionado]: [
        ...(prev[nivelSelecionado] || []),
        { magia_id: magiaComId.id, usos_max: 1, usos_restantes: 1, magia: magiaComId }
      ]
    }))
  }

  function removerDaPreparacao(idx) {
    setPreparadas(p => ({
      ...p,
      [nivelSelecionado]: (p[nivelSelecionado] || []).filter((_, i) => i !== idx)
    }))
  }

  async function handleSalvar() {
    const lista = []
    for (const [nivel, mps] of Object.entries(preparadas)) {
      for (const mp of mps) {
        lista.push({ magia_id: mp.magia_id, usos_max: mp.usos_max, usos_restantes: mp.usos_restantes })
      }
    }
    await salvarPreparacao(p.id, lista)
    onClose()
  }

  async function handleAdicionarMagia(e) {
    e.preventDefault()
    await adicionarMagia({ ...formMagia, personagem_id: p.id, nivel: Number(formMagia.nivel) })
    setFormMagia({ nome: '', nivel: nivelSelecionado ?? 1, escola: 'Evocação', descricao: '' })
    setShowNovasMagia(false)
  }

  if (!temMagia) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content p-8 text-center w-96" onClick={e => e.stopPropagation()}>
          <h3 className="font-medieval text-xl mb-4" style={{ color: '#c9a84c' }}>Preparação de Magias</h3>
          <p style={{ color: '#9b8a6a' }}>A classe <strong style={{ color: '#f0e6c8' }}>{p?.classe}</strong> não possui magias em D&D 3.5.</p>
          <button className="btn-gold mt-6" onClick={onClose}>Fechar</button>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content flex w-full"
        style={{ maxWidth: 860, maxHeight: '90vh', minHeight: 560 }}
        onClick={e => e.stopPropagation()}>

        {/* ── Coluna esquerda: seletor de nível ── */}
        <div className="flex flex-col"
          style={{ width: 180, minWidth: 180, borderRight: '2px solid #6b4a1a', padding: '24px 0' }}>
          <h3 className="font-medieval text-base px-5 mb-5" style={{ color: '#c9a84c' }}>
            Preparar Magias
          </h3>
          <p className="label-medieval px-5 mb-3">Nível</p>
          <div className="flex flex-col flex-1 overflow-y-auto">
            {niveisDisponiveis.map(({ nivel, slots: s }) => {
              const usados = (preparadas[nivel] || []).length
              const isAtivo = nivelSelecionado === nivel
              return (
                <button key={nivel}
                  onClick={() => setNivelSelecionado(nivel)}
                  style={{
                    textAlign: 'left', padding: '10px 20px',
                    background: isAtivo ? 'rgba(201,168,76,0.15)' : 'transparent',
                    borderLeft: isAtivo ? '3px solid #c9a84c' : '3px solid transparent',
                    borderRight: 'none', borderTop: 'none', borderBottom: 'none',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                  <div className="font-medieval text-sm" style={{ color: isAtivo ? '#f0e6c8' : '#9b8a6a' }}>
                    {nivel === 0 ? 'Orações' : `Nível ${nivel}`}
                  </div>
                  <div className="text-xs" style={{ color: isAtivo ? '#c9a84c' : '#6b5a3a', marginTop: 2 }}>
                    {usados}/{s} usados
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ padding: '16px 12px', borderTop: '1px solid #6b4a1a' }}>
            <button className="btn-gold w-full text-sm" onClick={handleSalvar}>
              Salvar
            </button>
          </div>
        </div>

        {/* ── Coluna direita: conteúdo ── */}
        <div className="flex flex-col flex-1" style={{ minWidth: 0, overflow: 'hidden' }}>
          {nivelSelecionado === null ? (
            /* Estado vazio */
            <div className="flex-1 flex flex-col items-center justify-center gap-3"
              style={{ color: '#6b5a3a' }}>
              <div style={{ fontSize: 40, opacity: 0.3 }}>📖</div>
              <p className="font-medieval text-sm">Selecione um nível à esquerda</p>
            </div>
          ) : (
            <div className="flex flex-col h-full" style={{ overflow: 'hidden' }}>

              {/* Header do nível */}
              <div className="flex items-center justify-between"
                style={{ padding: '20px 24px 12px', borderBottom: '1px solid #6b4a1a33' }}>
                <div>
                  <h4 className="font-medieval text-base" style={{ color: '#f0e6c8' }}>
                    {nivelSelecionado === 0 ? 'Orações (Nível 0)' : `Magias de Nível ${nivelSelecionado}`}
                  </h4>
                  <p className="text-xs" style={{ color: '#6b5a3a', marginTop: 2 }}>
                    {slotsRestantes > 0
                      ? `${slotsRestantes} slot${slotsRestantes > 1 ? 's' : ''} disponível${slotsRestantes > 1 ? 'is' : ''}`
                      : 'Todos os slots preenchidos'}
                  </p>
                </div>
                {/* Indicador de slots */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: slotsDisponivelNivel }).map((_, i) => (
                    <div key={i} style={{
                      width: 12, height: 12, borderRadius: '50%',
                      background: i < usadoNivel ? '#c9a84c' : 'transparent',
                      border: `2px solid ${i < usadoNivel ? '#c9a84c' : '#6b4a1a'}`,
                      transition: 'all 0.2s',
                    }} />
                  ))}
                </div>
                <button onClick={onClose}
                  style={{ color: '#6b5a3a', fontSize: 18, background: 'none', cursor: 'pointer', border: 'none', padding: 4 }}>
                  ✕
                </button>
              </div>

              {/* Corpo scrollável */}
              <div className="flex flex-1" style={{ overflow: 'hidden', minHeight: 0 }}>

                {/* Lista de magias disponíveis */}
                <div className="flex flex-col" style={{ flex: 1, borderRight: '1px solid #6b4a1a44', overflow: 'hidden' }}>
                  <div className="flex items-center justify-between"
                    style={{ padding: '10px 20px 8px', flexShrink: 0 }}>
                    <p className="label-medieval text-xs">Grimório</p>
                    <button className="btn-ghost" style={{ fontSize: 11, padding: '2px 8px' }}
                      onClick={() => { setShowNovasMagia(true); setFormMagia(f => ({ ...f, nivel: nivelSelecionado })) }}>
                      + Personalizada
                    </button>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1, padding: '0 8px 12px' }}>
                    {magiasDisponiveis.length === 0 ? (
                      <p className="text-xs text-center" style={{ color: '#6b5a3a', padding: '20px 0' }}>
                        Nenhuma magia neste nível.<br />Adicione uma personalizada.
                      </p>
                    ) : (
                      magiasDisponiveis.map((magia, idx) => {
                        const cor = ESCOLA_CORES[magia.escola] || '#c9a84c'
                        const isCustom = magia.id && !nomesBuiltinNivel.has(magia.nome)
                        const jaPreparada = preparadasNivel.some(mp => mp.magia.nome === magia.nome)
                        const slotsCheios = usadoNivel >= slotsDisponivelNivel
                        return (
                          <div key={magia.id ?? `builtin-${idx}`}
                            onMouseEnter={() => setMagiaHover(magia)}
                            onMouseLeave={() => setMagiaHover(null)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 10px', borderRadius: 4, marginBottom: 2,
                              cursor: slotsCheios ? 'not-allowed' : 'pointer',
                              background: magiaHover?.nome === magia.nome ? 'rgba(201,168,76,0.08)' : 'transparent',
                              opacity: slotsCheios && !jaPreparada ? 0.45 : 1,
                              transition: 'background 0.15s',
                            }}
                            onClick={() => !slotsCheios && adicionarNaPreparacao(magia)}>
                            <EscolaIcon escola={magia.escola} size={22} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#e8d5a0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {magia.nome}
                              </div>
                              <div style={{ fontSize: 10, color: cor + 'bb', marginTop: 1 }}>
                                {magia.escola}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              {jaPreparada && (
                                <span style={{ fontSize: 10, color: '#c9a84c', fontFamily: 'Cinzel, serif' }}>✓</span>
                              )}
                              {isCustom && (
                                <button
                                  style={{ fontSize: 10, color: '#cc4444', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
                                  onClick={e => { e.stopPropagation(); excluirMagia(magia.id) }}
                                  title="Remover magia">✕</button>
                              )}
                              {!slotsCheios && (
                                <span style={{ fontSize: 16, color: '#c9a84c66', fontWeight: 'bold', lineHeight: 1 }}>+</span>
                              )}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Painel direito: preparadas + info */}
                <div className="flex flex-col" style={{ width: 240, minWidth: 240, overflow: 'hidden' }}>

                  {/* Preparadas */}
                  <div style={{ padding: '10px 16px 8px', flexShrink: 0 }}>
                    <p className="label-medieval text-xs" style={{ marginBottom: 8 }}>
                      Preparadas ({usadoNivel}/{slotsDisponivelNivel})
                    </p>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '0 10px 10px' }}>
                    {preparadasNivel.length === 0 ? (
                      <p className="text-xs text-center" style={{ color: '#3a2810', padding: '10px 0' }}>
                        Clique nas magias para preparar
                      </p>
                    ) : (
                      preparadasNivel.map((mp, i) => {
                        const cor = ESCOLA_CORES[mp.magia.escola] || '#c9a84c'
                        return (
                          <div key={i}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8,
                              padding: '7px 10px', borderRadius: 4, marginBottom: 2,
                              background: 'rgba(201,168,76,0.07)',
                              border: `1px solid ${cor}33`, cursor: 'pointer',
                            }}
                            onClick={() => removerDaPreparacao(i)}
                            title="Clique para remover">
                            <EscolaIcon escola={mp.magia.escola} size={18} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#c9a84c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {mp.magia.nome}
                              </div>
                              <div style={{ fontSize: 9, color: cor + '99', marginTop: 1 }}>
                                {mp.magia.escola}
                              </div>
                            </div>
                            <span style={{ fontSize: 10, color: '#cc4444', opacity: 0.5 }}>✕</span>
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Info panel — altura fixa, sem layout shift */}
                  <div style={{
                    borderTop: '1px solid #6b4a1a44',
                    padding: '12px 16px',
                    minHeight: 90,
                    flexShrink: 0,
                    background: 'rgba(0,0,0,0.2)',
                  }}>
                    {magiaHover ? (
                      <>
                        <p className="font-medieval text-xs" style={{ color: '#c9a84c', marginBottom: 4 }}>
                          {magiaHover.nome}
                        </p>
                        <p style={{ fontSize: 10, color: '#9b8a6a', lineHeight: 1.5 }}>
                          {magiaHover.descricao || '—'}
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: 11, color: '#3a2810', fontStyle: 'italic' }}>
                        Passe o cursor sobre uma magia para ver a descrição
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal nova magia personalizada */}
      {showNovasMagia && (
        <div className="modal-overlay" style={{ zIndex: 60 }} onClick={() => setShowNovasMagia(false)}>
          <div className="modal-content p-6 w-96" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4" style={{ color: '#c9a84c' }}>Magia Personalizada</h4>
            <form onSubmit={handleAdicionarMagia} className="flex flex-col gap-3">
              <div>
                <label className="label-medieval">Nome</label>
                <input className="input-medieval" required value={formMagia.nome}
                  onChange={e => setFormMagia(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-medieval">Nível</label>
                  <input className="input-medieval" type="number" min={0} max={9}
                    value={formMagia.nivel}
                    onChange={e => setFormMagia(f => ({ ...f, nivel: e.target.value }))} />
                </div>
                <div>
                  <label className="label-medieval">Escola</label>
                  <select className="input-medieval" value={formMagia.escola}
                    onChange={e => setFormMagia(f => ({ ...f, escola: e.target.value }))}>
                    {ESCOLAS_MAGIA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label-medieval">Descrição</label>
                <textarea className="input-medieval resize-none" rows={3}
                  value={formMagia.descricao}
                  onChange={e => setFormMagia(f => ({ ...f, descricao: e.target.value }))} />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-ghost text-xs" onClick={() => setShowNovasMagia(false)}>Cancelar</button>
                <button type="submit" className="btn-gold text-xs">Adicionar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
