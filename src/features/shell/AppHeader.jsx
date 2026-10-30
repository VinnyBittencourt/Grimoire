import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useIsMutating, useQueryClient } from '@tanstack/react-query'
import { useLang } from '../../i18n'
import { SegmentedControl } from '../../ui/controls'
import { Icon } from '../../ui/Icon'
import logo from '../../assets/LogoWhite.svg'

// Barra superior: logo (volta à lista), conteúdo do meio, estado de salvamento e idioma
export function AppHeader({ children, actions }) {
  const { t, lang, setLang } = useLang()
  const saving = useIsMutating() > 0
  const [justSaved, setJustSaved] = useState(false)
  const qc = useQueryClient()

  // "Salvo" aparece por 2 s depois de uma gravação bem-sucedida (erros já viram toast)
  useEffect(() => {
    let timer
    const unsubscribe = qc.getMutationCache().subscribe(event => {
      if (event.type !== 'updated' || event.mutation.state.status !== 'success') return
      setJustSaved(true)
      clearTimeout(timer)
      timer = setTimeout(() => setJustSaved(false), 2000)
    })
    return () => { unsubscribe(); clearTimeout(timer) }
  }, [qc])

  return (
    <header className="h-[var(--header-height)] shrink-0 flex items-center gap-4 px-4 border-b border-wood bg-[linear-gradient(180deg,var(--color-wood-dark),var(--color-wood-darkest))]">
      <Link to="/" className="flex items-center gap-2 shrink-0" aria-label={t('list.title')}>
        <img src={logo} alt={t('app.title')} className="h-7 w-auto" />
      </Link>
      <div className="flex-1 min-w-0 flex items-center gap-3">{children}</div>
      <span className="inline-flex items-center gap-1.5 text-xs min-w-20 justify-end" aria-live="polite">
        {saving && <><Icon name="hourglass" size={14} className="text-gold animate-pulse" /><span className="text-gold">{t('common.saving')}</span></>}
        {!saving && justSaved && <><Icon name="check" size={14} className="text-[var(--color-save)]" /><span className="text-muted">{t('common.saved')}</span></>}
      </span>
      {actions}
      <SegmentedControl label={t('app.language')} value={lang} onChange={setLang}
        options={[{ value: 'pt', label: 'PT' }, { value: 'en', label: 'EN' }]} />
    </header>
  )
}
