import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect } from 'react'
import { useLang } from '../i18n'
import { Icon } from './Icon'

const ToastContext = createContext(null)
const DURATION = { plain: 3500, undo: 8000 }

/**
 * Avisos no canto da tela. toast.info(msg, { undo }) mostra um botão "Desfazer" e dura mais;
 * toast.error(msg) fica até ser fechado e é anunciado como alerta. O tempo pausa com hover/foco.
 */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const seq = useRef(0)

  const dismiss = useCallback(id => setItems(list => list.filter(x => x.id !== id)), [])

  const push = useCallback((kind, message, opts = {}) => {
    const id = ++seq.current
    setItems(list => [...list.slice(-3), { id, kind, message, undo: opts.undo, ms: kind === 'error' ? null : opts.undo ? DURATION.undo : DURATION.plain }])
    return id
  }, [])

  const api = useMemo(() => ({
    info: (m, o) => push('info', m, o),
    success: (m, o) => push('success', m, o),
    error: (m, o) => push('error', m, o),
  }), [push])

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastList items={items} dismiss={dismiss} />
    </ToastContext.Provider>
  )
}

const TONE = {
  info: { border: 'border-wood', icon: 'info', color: 'text-gold' },
  success: { border: 'border-[var(--color-save-border)]', icon: 'check', color: 'text-[var(--color-save)]' },
  error: { border: 'border-[var(--color-hp-border)]', icon: 'warning', color: 'text-bad' },
}

function ToastList({ items, dismiss }) {
  const errors = items.filter(i => i.kind === 'error')
  const others = items.filter(i => i.kind !== 'error')
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-80">
      <div role="alert" className="flex flex-col gap-2">{errors.map(item => <ToastItem key={item.id} item={item} dismiss={dismiss} />)}</div>
      <div role="status" aria-live="polite" className="flex flex-col gap-2">{others.map(item => <ToastItem key={item.id} item={item} dismiss={dismiss} />)}</div>
    </div>
  )
}

function ToastItem({ item, dismiss }) {
  const { t } = useLang()
  const [paused, setPaused] = useState(false)
  const left = useRef(item.ms)
  const tone = TONE[item.kind]

  useEffect(() => {
    if (item.ms == null || paused) return
    const start = Date.now()
    const timer = setTimeout(() => dismiss(item.id), left.current)
    return () => { clearTimeout(timer); left.current -= Date.now() - start }
  }, [paused, item.id, item.ms, dismiss])

  return (
    <div className={`panel animate-rise flex items-start gap-2.5 px-3.5 py-3 border ${tone.border}`}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <Icon name={tone.icon} className={`mt-0.5 ${tone.color}`} />
      <span className={`flex-1 text-sm ${item.kind === 'error' ? 'text-bad' : 'text-parchment'}`}>{item.message}</span>
      {item.undo && (
        <button type="button" className="inline-flex items-center gap-1 min-h-6 px-2 rounded-sm text-gold text-xs font-display hover:bg-gold-faint cursor-pointer"
          onClick={() => { item.undo(); dismiss(item.id) }}><Icon name="undo" size={14} />{t('common.undo')}</button>
      )}
      <button type="button" aria-label={t('common.close')} className="inline-flex items-center justify-center w-6 h-6 rounded-sm text-muted hover:text-parchment hover:bg-hover cursor-pointer"
        onClick={() => dismiss(item.id)}><Icon name="close" size={14} /></button>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de ToastProvider')
  return ctx
}
