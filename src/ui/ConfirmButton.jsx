import { useState, useEffect, useRef } from 'react'
import { useLang } from '../i18n'
import { Icon } from './Icon'

/**
 * Ação destrutiva em dois cliques: o primeiro arma (mostra "Confirmar?"), o segundo executa.
 * Desarma sozinho depois de 3 s ou ao perder o foco. Substitui o window.confirm do v1.
 * icon: variante compacta com lixeira (alvo de 24 px); para exclusão com consequências, use ConfirmDialog.
 */
export function ConfirmButton({ onConfirm, children, confirmLabel, className = '', armedClassName = '', label, icon = false, ...props }) {
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

  const armedText = confirmLabel ?? t('common.confirmShort')
  const base = icon
    ? `min-w-6 h-6 px-1 text-xs ${armed ? 'px-2' : 'text-muted hover:text-bad hover:bg-bad-faint'}`
    : 'text-xs px-2 py-1 text-muted hover:text-bad'
  return (
    <button
      type="button"
      aria-label={armed ? armedText : label}
      title={armed ? undefined : label}
      onClick={click}
      onBlur={() => setArmed(false)}
      className={`inline-flex items-center justify-center gap-1 rounded-sm whitespace-nowrap transition-colors cursor-pointer ${base} ${armed ? `text-bad bg-bad-faint font-semibold ${armedClassName}` : ''} ${className}`}
      {...props}
    >
      {armed ? armedText : (icon ? <Icon name="trash" size={14} /> : children)}
    </button>
  )
}
