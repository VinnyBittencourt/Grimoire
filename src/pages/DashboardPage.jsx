import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Header from '../components/Layout/Header'
import CharacterInfo from '../components/CharacterInfo/CharacterInfo'
import SpellBoard from '../components/SpellBoard/SpellBoard'
import Equipments from '../components/Equipments/Equipments'
import SectionNotes from '../components/SectionNotes/SectionNotes'
import Mochila from '../components/Mochila/Mochila'
import Talentos from '../components/Talentos/Talentos'
import RecursosClasse from '../components/RecursosClasse/RecursosClasse'

export default function DashboardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { db, personagemAtivo, setPersonagemAtivo } = useApp()

  useEffect(() => {
    if (!db) { navigate('/'); return }
    const p = db.personagens?.find(p => p.id === Number(id))
    if (!p) { navigate('/personagens'); return }
    setPersonagemAtivo(p)
  }, [id, db])

  if (!personagemAtivo) return null

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0d0902' }}>
      <Header mostrarAcoes={true} />

      {/* Layout 3 colunas */}
      <main className="flex-1 flex gap-3 p-4 overflow-hidden" style={{ minHeight: 0 }}>
        {/* Coluna esquerda — Info do personagem + Anotações */}
        <div className="shrink-0 flex flex-col gap-3" style={{ minHeight: 0, width: '25%' }}>
          <CharacterInfo />
          <SectionNotes />
        </div>

        {/* Coluna central — Magias + Talentos */}
        <div className="flex-1 flex flex-col gap-3" style={{ minWidth: 0 }}>
          <div className="flex-1 min-h-0">
            <SpellBoard />
          </div>
          <RecursosClasse />
          <Talentos />
        </div>

        {/* Coluna direita — Equipamentos + Mochila + Anotações */}
        <div className="shrink-0 flex flex-col gap-3" style={{ minHeight: 0, width: '25%' }}>
          <div className="shrink-0">
            <Equipments />
          </div>
          <div className="flex-1 overflow-hidden min-h-0">
            <Mochila />
          </div>
        </div>
      </main>
    </div>
  )
}
