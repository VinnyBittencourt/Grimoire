import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { EscolaIcon, ESCOLA_CORES } from '../../assets/icons/escolaIcons'
import SpellPrepModal from '../modals/SpellPrepModal'
import SummonCreatureModal from '../modals/SummonCreatureModal'

function isConvocarMonstro(nome) {
  return nome?.startsWith('Convocar Monstro')
}

export default function SpellBoard() {
  const { db, personagemAtivo, usarMagia, novoDia } = useApp()
  const [showPrep, setShowPrep] = useState(false)
  const [confirmNovoDia, setConfirmNovoDia] = useState(false)
  const [summonModal, setSummonModal] = useState(null)

  if (!personagemAtivo) return null

  const preparadas = (db?.magias_preparadas || []).filter(m => m.personagem_id === personagemAtivo.id)
  const todasMagias = db?.magias || []

  // Agrupar por nível
  const porNivel = {}
  for (const mp of preparadas) {
    const magia = todasMagias.find(m => m.id === mp.magia_id)
    if (!magia) continue
    const nivel = magia.nivel ?? 0
    if (!porNivel[nivel]) porNivel[nivel] = []
    porNivel[nivel].push({ mp, magia })
  }

  const niveisOrdenados = Object.keys(porNivel).sort((a, b) => Number(a) - Number(b))

  // Ataques normais (nível === 'normal' ou escola === 'Normal')
  const normais = (db?.magias || []).filter(m =>
    m.personagem_id === personagemAtivo.id && m.escola === 'Normal'
  )

  async function handleNovoDia() {
    if (!confirmNovoDia) { setConfirmNovoDia(true); return }
    await novoDia(personagemAtivo.id)
    setConfirmNovoDia(false)
  }

  return (
    <div className="panel flex flex-col h-full overflow-hidden" style={{ minWidth: 0 }}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: '1px solid #6b4a1a' }}>
        <h3 className="font-medieval text-base font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.03em' }}>
          Ataques / Magias Preparadas
        </h3>
        <div className="flex gap-2">
          <button className="btn-ghost text-xs" onClick={() => { setShowPrep(true); setConfirmNovoDia(false) }}>
            + Preparar Magias
          </button>
          <button
            className={confirmNovoDia ? 'btn-danger' : 'btn-ghost text-xs'}
            onClick={handleNovoDia}
            onBlur={() => setConfirmNovoDia(false)}>
            {confirmNovoDia ? '⚠ Confirmar Novo Dia' : 'Novo Dia'}
          </button>
        </div>
      </div>

      {/* Lista de magias */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
        {/* Ataques Normais */}
        {normais.length > 0 && (
          <div>
            <p className="label-medieval mb-3" style={{ letterSpacing: '0.08em', fontSize: 11 }}>Ataques Normais</p>
            <div className="flex flex-wrap gap-2">
              {normais.map(magia => (
                <SpellCard key={magia.id} magia={magia} mp={null} onUsar={null} />
              ))}
            </div>
          </div>
        )}

        {/* Por nível */}
        {niveisOrdenados.length === 0 && normais.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-50">
            <p className="font-medieval text-sm" style={{ color: '#6b5a3a' }}>
              Nenhuma magia preparada
            </p>
            <p className="text-xs" style={{ color: '#6b5a3a' }}>
              Clique em "Preparar Magias" para começar
            </p>
          </div>
        )}

        {niveisOrdenados.map(nivel => (
          <div key={nivel}>
            <p className="label-medieval mb-3" style={{ letterSpacing: '0.08em', fontSize: 11 }}>
              {nivel === '0' ? 'Nível 0 (Orações)' : `Nível ${nivel}`}
            </p>
            <div className="flex flex-wrap gap-2">
              {porNivel[nivel].map(({ mp, magia }) => (
                <SpellCard
                  key={mp.id}
                  magia={magia}
                  mp={mp}
                  onUsar={
                    isConvocarMonstro(magia.nome)
                      ? () => setSummonModal({ mp, magia })
                      : () => usarMagia(mp.id)
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showPrep && (
        <SpellPrepModal onClose={() => setShowPrep(false)} />
      )}
      {summonModal && (
        <SummonCreatureModal
          mp={summonModal.mp}
          magia={summonModal.magia}
          onClose={() => setSummonModal(null)}
        />
      )}
    </div>
  )
}

function SpellCard({ magia, mp, onUsar }) {
  const esgotada = mp && mp.usos_restantes <= 0
  const cor = ESCOLA_CORES[magia.escola] || '#c9a84c'

  return (
    <div
      className={`spell-card ${esgotada ? 'depleted' : ''}`}
      style={{ width: 80, border: `1px solid ${esgotada ? '#3a2810' : cor + '66'}` }}
      onClick={onUsar && !esgotada ? onUsar : undefined}
      title={magia.descricao || magia.nome}
    >
      {/* Ícone */}
      <div className="flex items-center justify-center" style={{ filter: esgotada ? 'grayscale(1)' : 'none' }}>
        <EscolaIcon escola={magia.escola} size={36} />
      </div>

      {/* Nome */}
      <p className="text-center leading-tight" style={{ fontSize: 11, color: '#c9a84c', fontFamily: 'Cinzel, serif' }}>
        {magia.nome}
      </p>

      {/* Contador */}
      {mp && (
        <p className="font-medieval text-xs font-bold"
          style={{ color: esgotada ? '#6b5a3a' : '#f0e6c8' }}>
          {mp.usos_restantes}/{mp.usos_max}
        </p>
      )}
    </div>
  )
}
