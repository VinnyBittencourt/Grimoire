import { createContext, useContext, useState, useCallback, useMemo } from 'react'
import { translations } from './translations'
import spellNamesEn from '../data/spellNamesEn.json'

const LangContext = createContext(null)
const STORAGE_KEY = 'grimoire_lang'

function lookup(lang, path) {
  let node = translations[lang]
  for (const part of path.split('.')) node = node?.[part]
  return node
}

function readLang() {
  try { return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'pt' } catch { return 'pt' }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(readLang)

  const setLang = useCallback(next => {
    setLangState(next)
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* modo privado */ }
    document.documentElement.lang = next === 'en' ? 'en' : 'pt-BR'
  }, [])

  // t('secao.chave', { n: 1 }) → texto no idioma atual, com fallback para pt e por fim a própria chave
  const t = useCallback((path, vars) => {
    let text = lookup(lang, path) ?? lookup('pt', path) ?? path
    if (typeof text !== 'string') return path
    if (vars) text = text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] ?? m))
    return text
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t, ...unitHelpers(lang), ...labelHelpers(lang, t) }), [lang, setLang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang precisa estar dentro de LangProvider')
  return ctx
}

/*
 * Unidades: os dados são guardados em pés e libras (como nas regras e no Roll20).
 * Em pt exibimos em metros (1,5 m por quadrado de 5 pés) e quilos (convenção do livro
 * brasileiro: 1 lb = 0,5 kg).
 */
function unitHelpers(lang) {
  const metric = lang === 'pt'
  const num = v => Number(v.toFixed(2)).toLocaleString(metric ? 'pt-BR' : 'en-US')
  return {
    metric,
    distance: ft => (metric ? `${num((Number(ft) || 0) * 0.3)} m` : `${num(Number(ft) || 0)} ft`),
    weight: lb => (metric ? `${num((Number(lb) || 0) / 2)} kg` : `${num(Number(lb) || 0)} lb`),
    toDisplayWeight: lb => (metric ? (Number(lb) || 0) / 2 : Number(lb) || 0),
    fromDisplayWeight: v => (metric ? (Number(v) || 0) * 2 : Number(v) || 0),
    toDisplayDistance: ft => (metric ? Number(((Number(ft) || 0) * 0.3).toFixed(1)) : Number(ft) || 0),
    fromDisplayDistance: v => (metric ? Math.round((Number(v) || 0) / 0.3) : Number(v) || 0),
  }
}

function labelHelpers(lang, t) {
  return {
    signed: n => (n >= 0 ? `+${n}` : `${n}`),
    className: row => (row?.class_id === 'custom' && row.custom_name ? row.custom_name : t(`classes.${row?.class_id ?? row}`)),
    skillName: row => {
      const base = t(`skillNames.${row.skill_id}`)
      if (row.custom_name) return base === `skillNames.${row.skill_id}` ? row.custom_name : `${base} (${row.custom_name})`
      return base
    },
    // Magias da lista padrão estão em pt; em inglês usamos o mapa de nomes quando existe
    spellName: name => (lang === 'en' ? spellNamesEn[name] ?? name : name),
    // "2026-10-29 21:04:00" (datetime('now') do SQLite, em UTC) → "há 2 dias" / "2 days ago"
    relativeTime: sqlDate => {
      const d = new Date(`${String(sqlDate ?? '').replace(' ', 'T')}Z`)
      if (Number.isNaN(d.getTime())) return ''
      const rtf = new Intl.RelativeTimeFormat(lang === 'en' ? 'en' : 'pt-BR', { numeric: 'auto' })
      const sec = (d.getTime() - Date.now()) / 1000
      for (const [unit, size] of [['year', 31536000], ['month', 2592000], ['week', 604800], ['day', 86400], ['hour', 3600], ['minute', 60]]) {
        if (Math.abs(sec) >= size) return rtf.format(Math.round(sec / size), unit)
      }
      return rtf.format(0, 'minute')
    },
    schoolName: school => {
      if (!school) return ''
      const label = t(`spells.schools.${school}`)
      return label === `spells.schools.${school}` ? school : label
    },
  }
}
