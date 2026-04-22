import { createContext, useContext, useState } from 'react'
import { translations } from '../i18n/translations'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('grimoire_lang') || 'pt')

  function toggle() {
    setLang(l => {
      const next = l === 'pt' ? 'en' : 'pt'
      localStorage.setItem('grimoire_lang', next)
      return next
    })
  }

  function t(section, key) {
    const val = translations[lang]?.[section]?.[key] ?? translations.pt?.[section]?.[key] ?? key
    return val
  }

  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
