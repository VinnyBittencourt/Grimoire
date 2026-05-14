import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { CRIATURAS_CONVOCAR } from '../../services/dnd35Tables'

const NUMERAIS = { IX: 9, VIII: 8, VII: 7, VI: 6, V: 5, IV: 4, III: 3, II: 2, I: 1 }

function nivelDaSpell(nome) {
  const m = nome?.match(/\b(IX|VIII|VII|VI|IV|V|III|II|I)\b/)
  return m ? NUMERAIS[m[1]] : 1
}

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

const CUSTOM_EMPTY = { nome: '', pv: '', ca: '', ataque: '', dano: '', deslocamento: '' }

export default function SummonCreatureModal({ mp, magia, onClose }) {
  const { personagemAtivo, usarMagia, salvarCriaturaInvocada } = useApp()
  const nivelMax = nivelDaSpell(magia.nome)
  const [nivelTab, setNivelTab] = useState(nivelMax)
  const [selecionada, setSelecionada] = useState(null)
  const [customMode, setCustomMode] = useState(false)
  const [customForm, setCustomForm] = useState(CUSTOM_EMPTY)

  const criaturas = CRIATURAS_CONVOCAR[nivelTab] || []

  const customValida = customForm.nome.trim() && customForm.pv

  async function convocar() {
    const criatura = customMode
      ? { ...customForm, pv: Number(customForm.pv), ca: Number(customForm.ca), tipo: 'Customizado', habilidades: [] }
      : selecionada
    if (!criatura) return
    try { await usarMagia(mp.id) } catch (_) {}
    try {
      await salvarCriaturaInvocada(personagemAtivo.id, {
        criatura,
        pv_atual: Number(criatura.pv),
        pv_max: Number(criatura.pv),
        nivel_sm: nivelTab,
      })
    } finally {
      onClose()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ width: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #6b4a1a', flexShrink: 0 }}>
          <h4 className="font-medieval text-base text-center" style={{ color: '#c9a84c' }}>
            {magia.nome}
          </h4>
          <p className="text-center text-xs" style={{ color: '#9b8a6a', marginTop: 4 }}>
            Escolha a criatura a ser convocada
          </p>
        </div>

        {/* Tabs de nível */}
        <div
          className="flex"
          style={{ padding: '10px 20px 0', gap: 6, flexShrink: 0, borderBottom: '1px solid #6b4a1a', flexWrap: 'wrap' }}
        >
          {Array.from({ length: nivelMax }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => { setNivelTab(n); setSelecionada(null); setCustomMode(false) }}
              className="font-medieval text-xs"
              style={{
                padding: '4px 10px',
                borderRadius: '4px 4px 0 0',
                border: '1px solid #6b4a1a',
                borderBottom: nivelTab === n && !customMode ? '1px solid #0d0902' : '1px solid #6b4a1a',
                background: nivelTab === n && !customMode ? 'rgba(201,168,76,0.18)' : 'rgba(0,0,0,0.3)',
                color: nivelTab === n && !customMode ? '#c9a84c' : '#6b5a3a',
                marginBottom: -1,
                cursor: 'pointer',
              }}
            >
              SM {['I','II','III','IV','V','VI','VII','VIII','IX'][n - 1]}
            </button>
          ))}
          <button
            onClick={() => { setCustomMode(true); setSelecionada(null) }}
            className="font-medieval text-xs"
            style={{
              padding: '4px 10px',
              borderRadius: '4px 4px 0 0',
              border: '1px solid #6b4a1a',
              borderBottom: customMode ? '1px solid #0d0902' : '1px solid #6b4a1a',
              background: customMode ? 'rgba(201,168,76,0.18)' : 'rgba(0,0,0,0.3)',
              color: customMode ? '#c9a84c' : '#6b5a3a',
              marginBottom: -1,
              cursor: 'pointer',
            }}
          >
            ✦ Custom
          </button>
        </div>

        {/* Lista de criaturas / formulário custom */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customMode && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Nome', key: 'nome', type: 'text', required: true },
                { label: 'PV Total', key: 'pv', type: 'number' },
                { label: 'CA', key: 'ca', type: 'number' },
                { label: 'Ataque', key: 'ataque', type: 'text' },
                { label: 'Dano', key: 'dano', type: 'text' },
                { label: 'Movimento', key: 'deslocamento', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="label-medieval" style={{ fontSize: 10 }}>{label}</label>
                  <input
                    className="input-medieval"
                    type={type}
                    value={customForm[key]}
                    onChange={e => setCustomForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ marginTop: 2 }}
                  />
                </div>
              ))}
            </div>
          )}
          {!customMode && criaturas.map((c, idx) => {
            const sel = selecionada?.nome === c.nome
            const cor = corDoTipo(c.tipo)
            return (
              <div
                key={idx}
                onClick={() => setSelecionada(c)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 4,
                  border: `1px solid ${sel ? cor : '#6b4a1a'}`,
                  background: sel ? `${cor}18` : 'rgba(201,168,76,0.04)',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {/* Nome + tipo + tamanho */}
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span className="font-medieval" style={{ color: sel ? cor : '#e8d5a0', fontSize: 13 }}>
                    {c.nome}
                  </span>
                  <div className="flex gap-2">
                    <span style={{ fontSize: 10, color: cor, background: `${cor}22`, padding: '1px 6px', borderRadius: 3 }}>
                      {c.tipo}
                    </span>
                    <span style={{ fontSize: 10, color: '#9b8a6a', background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 3 }}>
                      {c.tamanho}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap" style={{ gap: '6px 16px', fontSize: 11, color: '#9b8a6a' }}>
                  <span><span style={{ color: '#c9a84c' }}>PV</span> {c.pv}</span>
                  <span><span style={{ color: '#c9a84c' }}>CA</span> {c.ca}</span>
                  <span><span style={{ color: '#c9a84c' }}>Atq</span> {c.ataque}</span>
                  <span><span style={{ color: '#c9a84c' }}>Dano</span> {c.dano}</span>
                  <span><span style={{ color: '#c9a84c' }}>Mov</span> {c.deslocamento}</span>
                </div>

                {/* Habilidades */}
                {c.habilidades?.length > 0 && (
                  <p style={{ fontSize: 10, color: '#6b5a3a', marginTop: 5, lineHeight: 1.4 }}>
                    {c.habilidades.join(' • ')}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}

        <div
          className="flex justify-end gap-3"
          style={{ padding: '12px 20px', borderTop: '1px solid #6b4a1a', flexShrink: 0 }}
        >
          <button className="btn-ghost text-xs" onClick={onClose}>Cancelar</button>
          <button
            className="btn-gold text-xs"
            onClick={convocar}
            disabled={customMode ? !customValida : !selecionada}
            style={{ opacity: (customMode ? customValida : selecionada) ? 1 : 0.4, cursor: (customMode ? customValida : selecionada) ? 'pointer' : 'not-allowed' }}
          >
            ✦ Convocar
          </button>
        </div>
      </div>
    </div>
  )
}
