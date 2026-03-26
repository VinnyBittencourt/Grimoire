import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { EquipSlotIcon } from '../../assets/icons/equipmentIcons'

// Layout da grade: null = célula vazia
const GRID = [
  ['amuleto',       'capacete',  'capa'           ],
  ['arma_principal','armadura',  'braco_esq'      ],
  ['luvas',         'cinto',     'botas'          ],
  ['anel_esq',      'arma_secundaria', 'anel_dir' ],
]

const SLOT_INFO = {
  capacete:       { nome: 'Capacete',       icon: '⛑️'  },
  amuleto:        { nome: 'Amuleto',        icon: '📿'  },
  capa:           { nome: 'Capa',           icon: '🧥'  },
  braco_esq:      { nome: 'Escudo',          icon: '🛡️'  },
  armadura:       { nome: 'Armadura',       icon: '🦺'  },
  braco_dir:      { nome: 'Braço Dir.',     icon: '💪'  },
  luvas:          { nome: 'Luvas',          icon: '🧤'  },
  cinto:          { nome: 'Cinto',          icon: '🎗️'  },
  botas:          { nome: 'Botas',          icon: '👢'  },
  anel_esq:       { nome: 'Anel Esq.',      icon: '💍'  },
  anel_dir:       { nome: 'Anel Dir.',      icon: '💍'  },
  arma_principal: { nome: 'Arma Principal', icon: '⚔️'  },
  arma_secundaria:{ nome: 'Arma Sec.',      icon: '🗡️'  },
}

export default function Equipments() {
  const { db, personagemAtivo, salvarEquipamento } = useApp()
  const [slotAberto, setSlotAberto] = useState(null)
  const [editForm, setEditForm] = useState({ nome: '', info: '' })

  if (!personagemAtivo) return null

  const equipamentos = (db?.equipamentos || []).filter(e => e.personagem_id === personagemAtivo.id)

  function getEquip(slotId) {
    return equipamentos.find(e => e.slot === slotId) || null
  }

  function abrirSlot(slotId) {
    const eq = getEquip(slotId)
    setEditForm({ nome: eq?.nome || '', info: eq?.info || '' })
    setSlotAberto(slotId)
  }

  async function salvar() {
    const info = SLOT_INFO[slotAberto]
    await salvarEquipamento(personagemAtivo.id, slotAberto, {
      ...editForm,
      tipo: info.nome,
    })
    setSlotAberto(null)
  }

  async function remover() {
    await salvarEquipamento(personagemAtivo.id, slotAberto, { nome: '', tipo: '', info: '' })
    setSlotAberto(null)
  }

  return (
    <div className="panel flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
      {/* Header */}
      <div className="px-4 pt-3 pb-2 shrink-0" style={{ borderBottom: '1px solid #6b4a1a' }}>
        <h3 className="font-medieval text-sm font-semibold" style={{ color: '#c9a84c', letterSpacing: '0.05em' }}>Equipamentos</h3>
      </div>

      {/* Grade de slots */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-3 gap-1.5">
          {GRID.flat().map((slotId, i) => {
            if (!slotId) return <div key={i} />
            const info = SLOT_INFO[slotId]
            const eq = getEquip(slotId)
            const temItem = eq && eq.nome

            return (
              <button
                key={slotId}
                onClick={() => abrirSlot(slotId)}
                className="flex flex-col items-center justify-center gap-0.5 rounded-sm p-1.5 transition-colors"
                style={{
                  background: temItem ? 'rgba(201,168,76,0.08)' : 'rgba(0,0,0,0.35)',
                  border: temItem ? '1px solid #6b4a1a' : '1px dashed #3a2810',
                  minHeight: '68px',
                  cursor: 'pointer',
                }}
                title={info.nome}
              >
                <EquipSlotIcon slot={slotId} size={30} />
                <span className="font-medieval text-center leading-tight"
                  style={{ fontSize: '11px', color: '#9b8a6a', maxWidth: '100%' }}>
                  {info.nome}
                </span>
                {temItem && (
                  <span className="text-center leading-tight w-full truncate"
                    style={{ fontSize: '11px', color: '#f0e6c8' }}>
                    {eq.nome}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {slotAberto && (
        <div className="modal-overlay" onClick={() => setSlotAberto(null)}>
          <div className="modal-content p-6 w-80" onClick={e => e.stopPropagation()}>
            <h4 className="font-medieval text-base mb-4 text-center" style={{ color: '#c9a84c' }}>
              {SLOT_INFO[slotAberto].icon} {SLOT_INFO[slotAberto].nome}
            </h4>

            <div className="flex flex-col gap-3">
              <div>
                <label className="label-medieval">Nome do Item</label>
                <input className="input-medieval" placeholder={`Ex: ${SLOT_INFO[slotAberto].nome} +1`}
                  value={editForm.nome}
                  onChange={e => setEditForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className="label-medieval">Informações Extras</label>
                <textarea className="input-medieval resize-none" rows={3}
                  placeholder="Bônus, propriedades mágicas, peso..."
                  value={editForm.info}
                  onChange={e => setEditForm(f => ({ ...f, info: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              {getEquip(slotAberto)?.nome && (
                <button className="btn-danger text-xs" onClick={remover}>Remover</button>
              )}
              <div className="flex gap-2 ml-auto">
                <button className="btn-ghost text-xs" onClick={() => setSlotAberto(null)}>Cancelar</button>
                <button className="btn-gold text-xs" onClick={salvar}>Salvar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
