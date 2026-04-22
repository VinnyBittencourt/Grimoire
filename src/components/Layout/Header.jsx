import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useLang } from '../../context/LangContext'
import logo from '../../assets/LogoWhite.svg'

export default function Header({ mostrarAcoes = true }) {
  const navigate = useNavigate()
  const { personagemAtivo, salvando } = useApp()
  const { lang, toggle, t } = useLang()

  return (
    <header className="flex items-center justify-between px-6 py-3"
      style={{ background: 'linear-gradient(90deg, #0d0902 0%, #1a1208 50%, #0d0902 100%)', borderBottom: '1px solid #6b4a1a' }}>
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
        <img src={logo} alt="Grimoire" className="h-10 w-auto" />
        {salvando && (
          <span className="text-xs" style={{ color: '#c9a84c', fontFamily: 'Cinzel, serif' }}>{t('header', 'saving')}</span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {mostrarAcoes && personagemAtivo && (
          <>
            <button className="btn-ghost" onClick={() => navigate('/personagens')}>
              {t('header', 'switchChar')}
            </button>
            <button className="btn-ghost" onClick={() => navigate(`/personagem/${personagemAtivo.id}/editar`)}>
              {t('header', 'editChar')}
            </button>
          </>
        )}
        <button
          onClick={toggle}
          title={lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
          style={{
            fontFamily: 'Cinzel, serif', fontSize: 11, padding: '3px 8px', borderRadius: 4,
            background: 'rgba(201,168,76,0.12)', border: '1px solid #6b4a1a',
            color: '#c9a84c', cursor: 'pointer', letterSpacing: '0.05em',
          }}>
          {t('header', 'lang')}
        </button>
      </div>
    </header>
  )
}
