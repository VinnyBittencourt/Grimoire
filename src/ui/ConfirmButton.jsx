import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n'

/**
 * Ação destrutiva em dois cliques: o primeiro arma (mostra "Confirmar"), o segundo executa.
 * Desarma sozinho depois de 3 s ou ao perder o foco. Substitui o window.confirm do v1.
 */
export function ConfirmButton({ onConfirm, children, confirmLabel, className = '', armedClassName = '', label, ...props }) {
  const { t } = useLang()
  const [armed, setArmed] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  function click(e) {
    e.stopPropagation()
    if (armed) {
      clearTimeout(timer.current)
      setArmed(false)
      onConfirm()
      return
    }
    setArmed(true)
    timer.current = setTimeout(() => setArmed(false), 3000)
  }

  return (
    <button
      type="button"
      aria-label={armed ? confirmLabel ?? t('common.confirm') : label}
      title={armed ? confirmLabel ?? t('common.confirm') : label}
      onClick={click}
      onBlur={() => setArmed(false)}
      className={`inline-flex items-center justify-center gap-1 rounded-sm transition-colors cursor-pointer ${armed ? `text-bad bg-[rgba(192,57,43,0.15)] ${armedClassName}` : ''} ${className}`}
      {...props}
    >
      {armed ? confirmLabel ?? t('common.confirm') : children}
    </button>
  )
}
