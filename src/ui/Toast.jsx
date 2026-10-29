import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react'
import { useLang } from '../i18n'

const ToastContext = createContext(null)

/**
 * Avisos no canto da tela. toast.info(msg, { undo }) mostra um botão "Desfazer";
 * toast.error(msg) fica até ser fechado.
 */
export function ToastProvider({ children }) {
  const [items, setItems] = useState([])
  const seq = useRef(0)

  const dismiss = useCallback(id => setItems(list => list.filter(x => x.id !== id)), [])

  const push = useCallback((kind, message, opts = {}) => {
    const id = ++seq.current
    setItems(list => [...list.slice(-3), { id, kind, message, undo: opts.undo }])
    if (kind !== 'error') setTimeout(() => dismiss(id), opts.undo ? 6000 : 3000)
    return id
  }, [dismiss])

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

function ToastList({ items, dismiss }) {
  const { t } = useLang()
  const tone = { info: 'border-wood', success: 'border-[var(--color-save-border)]', error: 'border-[var(--color-hp-border)]' }
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-80" role="status" aria-live="polite">
      {items.map(item => (
        <div key={item.id} className={`panel animate-rise flex items-start gap-3 px-4 py-3 border ${tone[item.kind]}`}>
          <span className={`flex-1 text-sm ${item.kind === 'error' ? 'text-[var(--color-danger-light)]' : 'text-parchment'}`}>{item.message}</span>
          {item.undo && (
            <button type="button" className="text-gold text-xs font-display hover:text-gold-hi cursor-pointer"
              onClick={() => { item.undo(); dismiss(item.id) }}>{t('common.undo')}</button>
          )}
          <button type="button" aria-label={t('common.close')} className="text-muted hover:text-parchment cursor-pointer leading-none"
            onClick={() => dismiss(item.id)}>×</button>
        </div>
      ))}
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast precisa estar dentro de ToastProvider')
  return ctx
}
