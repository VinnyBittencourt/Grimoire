import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { loadData } from '../services/excelService'
import logo from '../assets/logo.svg'

export default function IntroPage() {
  const navigate = useNavigate()
  const { setDb } = useApp()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  async function handleEntrar() {
    setCarregando(true)
    setErro(null)
    try {
      const db = await loadData()
      setDb(db)
      if (db.personagens && db.personagens.length > 0) {
        navigate('/personagens')
      } else {
        navigate('/personagem/novo')
      }
    } catch (e) {
      setErro('Não foi possível conectar ao servidor. Certifique-se de que o app foi iniciado com "npm run dev:all".')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="intro-bg flex flex-col items-center justify-between h-screen overflow-hidden">
      {/* Decoração superior */}
      <div className="w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />

      {/* Conteúdo central */}
      <div className="flex flex-col items-center justify-center flex-1 gap-10 px-6 text-center">
        <div className="flex flex-col items-center gap-1">
          <img src={logo} alt="Grimoire" className="w-auto drop-shadow-2xl" style={{ height: 'min(28rem, 38vh)' }} />
          <div style={{ width: '100%', height: '1px', background: 'linear-gradient(90deg, transparent, #c9a84c44, transparent)' }} />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h1 className="font-medieval text-4xl md:text-5xl leading-tight"
            style={{ color: '#f0e6c8', textShadow: '0 2px 20px rgba(201,168,76,0.3)' }}>
            Sua campanha,<br />seu grimório,<br />sua história.
          </h1>
          <p className="font-medieval text-sm tracking-widest" style={{ color: '#c9a84c' }}>
            D&D 3.5
          </p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <button
            className="btn-gold text-base px-10 py-3"
            onClick={handleEntrar}
            disabled={carregando}>
            {carregando ? 'Carregando...' : 'Entrar'}
          </button>

          {erro && (
            <p className="text-xs max-w-sm text-center" style={{ color: '#cc4444' }}>
              {erro}
            </p>
          )}
        </div>
      </div>

      {/* Footer fixo + Decoração inferior */}
      <div className="w-full shrink-0">
        <footer className="text-center ">
          <p className="font-medieval text-s tracking-widest" style={{ color: '#6b5a3a', marginBottom: '1.5rem' }}>
            Criado por Vinny Bittencourt
          </p>
        </footer>
        <div className="w-full h-1" style={{ background: 'linear-gradient(90deg, transparent, #c9a84c, transparent)' }} />
      </div>
    </div>
  )
}
