import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useLang } from '../../context/LangContext'
import logo from '../../assets/LogoWhite.svg'

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

export default function Header({ mostrarAcoes = true }) {
  const navigate = useNavigate()
  const { personagemAtivo, salvando } = useApp()
  const { lang, toggle, t } = useLang()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!showLangMenu) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowLangMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showLangMenu])

  function selectLang(target) {
    if (target !== lang) toggle()
    setShowLangMenu(false)
  }

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

        {/* Language dropdown */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(v => !v)}
            title={t('header', 'langLabel')}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 4,
              background: showLangMenu ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.12)',
              border: '1px solid #6b4a1a',
              color: '#c9a84c', cursor: 'pointer',
            }}>
            <GlobeIcon />
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" style={{ opacity: 0.6 }}>
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            </svg>
          </button>

          {showLangMenu && (
            <div style={{
              position: 'absolute', right: 0, top: 'calc(100% + 6px)', zIndex: 100,
              background: '#1a1208', border: '1px solid #6b4a1a', borderRadius: 4,
              minWidth: 140, boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
              overflow: 'hidden',
            }}>
              {[{ code: 'pt', label: t('header', 'langPt') }, { code: 'en', label: t('header', 'langEn') }].map(({ code, label }) => (
                <button
                  key={code}
                  onClick={() => selectLang(code)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '8px 14px',
                    background: lang === code ? 'rgba(201,168,76,0.12)' : 'transparent',
                    border: 'none', color: lang === code ? '#c9a84c' : '#9b8a6a',
                    cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 12,
                    textAlign: 'left', letterSpacing: '0.03em',
                  }}
                  onMouseEnter={e => { if (lang !== code) e.currentTarget.style.background = 'rgba(201,168,76,0.06)' }}
                  onMouseLeave={e => { if (lang !== code) e.currentTarget.style.background = 'transparent' }}
                >
                  {label}
                  {lang === code && <span style={{ fontSize: 13 }}>🎲</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
