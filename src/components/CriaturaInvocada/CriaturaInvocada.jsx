import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'

const TIPO_COR = {
  'Celestial': '#c9a84c',
  'Infernal': '#c0392b',
  'Elemental': '#2980b9',
  'Extraplanar': '#8e44ad',
}

function corDoTipo(tipo = '') {
  for (const [key, cor] of Object.entries(TIPO_COR)) {
    if (tipo.includes(key)) return cor
  }
  return '#9b8a6a'
}

export default function CriaturaInvocada() {
  const { personagemAtivo, salvarCriaturaInvocada } = useApp()

  let estado = null
  try {
    if (personagemAtivo?.criatura_invocada_json) {
      estado = JSON.parse(personagemAtivo.criatura_invocada_json)
    }
  } catch {}

  const [pvInput, setPvInput] = useState(estado?.pv_atual ?? 0)

  useEffect(() => {
    setPvInput(estado?.pv_atual ?? 0)
  }, [personagemAtivo?.criatura_invocada_json])

  if (!estado?.criatura) return null

  const { criatura, pv_atual, pv_max, nivel_sm } = estado
  const cor = corDoTipo(criatura.tipo)
  const pvPct = Math.max(0, Math.min(1, pv_atual / pv_max))

  async function alterarPv(novo) {
    const clamped = Math.max(0, Math.min(pv_max, novo))
    setPvInput(clamped)
    await salvarCriaturaInvocada(personagemAtivo.id, { ...estado, pv_atual: clamped })
  }

  async function dispensar() {
    await salvarCriaturaInvocada(personagemAtivo.id, null)
  }

  const NUMERAIS_SM = ['I','II','III','IV','V','VI','VII','VIII','IX']

  return (
    <div className="panel shrink-0" style={{ minWidth: 0 }}>
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{ padding: '10px 14px', borderBottom: '1px solid #6b4a1a' }}
      >
        <div className="flex items-center gap-2">
          <h3 className="font-medieval text-sm font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.05em' }}>
            Criatura Invocada
          </h3>
          {nivel_sm && (
            <span style={{ fontSize: 10, color: '#6b5a3a', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 3 }}>
              SM {NUMERAIS_SM[nivel_sm - 1]}
            </span>
          )}
        </div>
        <button
          onClick={dispensar}
          className="font-medieval text-xs rounded-sm"
          style={{ padding: '2px 8px', background: 'rgba(180,60,60,0.15)', border: '1px solid #7a2020', color: '#e07070' }}
        >
          Dispensar
        </button>
      </div>

      {/* Corpo */}
      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Nome + tipo + tamanho */}
        <div className="flex items-center justify-between flex-wrap" style={{ gap: 6 }}>
          <span className="font-medieval" style={{ color: cor, fontSize: 14 }}>{criatura.nome}</span>
          <div className="flex gap-2">
            <span style={{ fontSize: 10, color: cor, background: `${cor}22`, padding: '1px 6px', borderRadius: 3 }}>
              {criatura.tipo}
            </span>
            <span style={{ fontSize: 10, color: '#9b8a6a', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 3 }}>
              {criatura.tamanho}
            </span>
          </div>
        </div>

        {/* Barra de PV */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span className="font-medieval text-xs" style={{ color: '#9b8a6a' }}>Pontos de Vida</span>
            <span className="font-medieval text-xs" style={{ color: pv_atual <= 0 ? '#e07070' : '#c9a84c' }}>
              {pv_atual}/{pv_max}
            </span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.4)', border: '1px solid #3a2810', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${pvPct * 100}%`,
              background: pvPct > 0.5 ? '#3a7a3a' : pvPct > 0.25 ? '#7a6a20' : '#7a2020',
              transition: 'width 0.2s, background 0.2s',
            }} />
          </div>
        </div>

        {/* Controles de PV */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => alterarPv(pv_atual - 1)}
            style={{ width: 26, height: 26, borderRadius: 4, background: 'rgba(180,60,60,0.15)', border: '1px solid #7a2020', color: '#e07070', fontSize: 14, lineHeight: 1 }}
          >−</button>
          <input
            type="number"
            className="input-medieval text-center"
            style={{ width: 56, padding: '2px 4px', fontSize: 13 }}
            value={pvInput}
            min={0}
            max={pv_max}
            onChange={e => setPvInput(Number(e.target.value))}
            onBlur={e => alterarPv(Number(e.target.value))}
            onKeyDown={e => { if (e.key === 'Enter') alterarPv(Number(e.target.value)) }}
          />
          <button
            onClick={() => alterarPv(pv_atual + 1)}
            style={{ width: 26, height: 26, borderRadius: 4, background: 'rgba(60,120,60,0.15)', border: '1px solid #3a6a3a', color: '#6abf6a', fontSize: 14, lineHeight: 1 }}
          >+</button>
          <button
            onClick={() => alterarPv(pv_max)}
            className="font-medieval text-xs rounded-sm"
            style={{ marginLeft: 4, padding: '2px 8px', background: 'rgba(201,168,76,0.1)', border: '1px solid #6b4a1a', color: '#9b8a6a', fontSize: 10 }}
          >Full</button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap" style={{ gap: '6px 16px', fontSize: 11 }}>
          <span style={{ color: '#9b8a6a' }}><span style={{ color: '#c9a84c' }}>CA</span> {criatura.ca}</span>
          <span style={{ color: '#9b8a6a' }}><span style={{ color: '#c9a84c' }}>Atq</span> {criatura.ataque}</span>
          <span style={{ color: '#9b8a6a' }}><span style={{ color: '#c9a84c' }}>Dano</span> {criatura.dano}</span>
          <span style={{ color: '#9b8a6a' }}><span style={{ color: '#c9a84c' }}>Mov</span> {criatura.deslocamento}</span>
        </div>

        {/* Habilidades */}
        {criatura.habilidades?.length > 0 && (
          <p style={{ fontSize: 10, color: '#6b5a3a', lineHeight: 1.5 }}>
            {criatura.habilidades.join(' • ')}
          </p>
        )}
      </div>
    </div>
  )
}
