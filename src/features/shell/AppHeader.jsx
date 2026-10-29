import { Link } from 'react-router-dom'
import { useIsMutating } from '@tanstack/react-query'
import { useLang } from '../../i18n'
import logo from '../../assets/LogoWhite.svg'

// Barra superior: logo (volta à lista), conteúdo do meio, indicador de salvamento e idioma
export function AppHeader({ children, actions }) {
  const { t, lang, setLang } = useLang()
  const saving = useIsMutating() > 0
  return (
    <header className="h-[var(--header-height)] shrink-0 flex items-center gap-4 px-4 border-b border-wood bg-[linear-gradient(180deg,var(--color-wood-dark),var(--color-wood-darkest))]">
      <Link to="/" className="flex items-center gap-2 shrink-0" title={t('list.title')}>
        <img src={logo} alt={t('app.title')} className="h-7 w-auto" />
      </Link>
      <div className="flex-1 min-w-0 flex items-center gap-3">{children}</div>
      <span className={`text-[11px] tracking-wide transition-opacity ${saving ? 'text-gold opacity-100' : 'opacity-0'}`} aria-live="polite">
        {saving ? t('common.saving') : ''}
      </span>
      {actions}
      <div className="flex rounded-sm border border-wood overflow-hidden" role="group" aria-label={t('app.language')}>
        {['pt', 'en'].map(code => (
          <button key={code} type="button" onClick={() => setLang(code)} aria-pressed={lang === code} title={t(`app.${code}`)}
            className={`px-2 py-1 text-[10px] font-display tracking-wider uppercase cursor-pointer ${lang === code ? 'bg-gold-faint text-gold' : 'text-muted hover:text-parchment'}`}>
            {code}
          </button>
        ))}
      </div>
    </header>
  )
}
