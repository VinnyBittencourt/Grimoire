import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import logo from '../../assets/LogoWhite.svg'

export default function Header({ mostrarAcoes = true }) {
  const navigate = useNavigate()
  const { personagemAtivo, salvando } = useApp()

  return (
    <header className="flex items-center justify-between px-6 py-3"
      style={{ background: 'linear-gradient(90deg, #0d0902 0%, #1a1208 50%, #0d0902 100%)', borderBottom: '1px solid #6b4a1a' }}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <img src={logo} alt="Grimoire" className="h-10 w-auto" />
        {salvando && (
          <span className="text-xs" style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif' }}>Salvando...</span>
        )}
      </div>

      {mostrarAcoes && personagemAtivo && (
        <div className="flex items-center gap-3">
          <button className="btn-ghost" onClick={() => navigate('/personagens')}>
            Trocar Personagem
          </button>
          <button className="btn-ghost" onClick={() => navigate(`/personagem/${personagemAtivo.id}/editar`)}>
            Editar Personagem
          </button>
        </div>
      )}
    </header>
  )
}
