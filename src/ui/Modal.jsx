import { useEffect, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../i18n'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable=true]'

/**
 * Modal acessível: role=dialog, aria-modal, Esc fecha, foco preso dentro e devolvido ao sair.
 * Para escolher o campo que recebe o foco ao abrir, use `data-autofocus` (não `autoFocus`:
 * o React não renderiza o atributo e foca o filho antes de o Modal guardar o foco anterior).
 * Clicar fora NÃO fecha por padrão (no v1 isso jogava fora preparações e notas não salvas);
 * passe closeOnBackdrop para modais só de leitura/seleção.
 */
export function Modal({ open, onClose, title, children, footer, width = 560, closeOnBackdrop = false, className = '' }) {
  const { t } = useLang()
  const ref = useRef(null)
  const titleId = useId()
  // onClose costuma ser uma função inline: guardada em ref para o efeito rodar só ao abrir/fechar
  // (senão o foco voltaria ao primeiro campo a cada render)
  const onCloseRef = useRef(onClose)
  useEffect(() => { onCloseRef.current = onClose })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const node = ref.current
    const first = node?.querySelector('[data-autofocus]') ?? node?.querySelector(FOCUSABLE)
    ;(first ?? node)?.focus()

    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); onCloseRef.current() }
      if (e.key !== 'Tab' || !node) return
      const items = [...node.querySelectorAll(FOCUSABLE)].filter(el => el.offsetParent !== null)
      if (!items.length) return
      const [a, z] = [items[0], items[items.length - 1]]
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus() }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus() }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--color-overlay)] animate-fade"
      onMouseDown={e => { if (closeOnBackdrop && e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={`panel flex flex-col max-h-[90vh] w-full animate-rise ${className}`}
        style={{ maxWidth: width }}
      >
        {title && (
          <header className="flex items-center justify-between gap-3 px-5 py-3 border-b border-subtle shrink-0">
            <h2 id={titleId} className="font-display text-gold text-base tracking-wide m-0">{title}</h2>
            <button type="button" onClick={onClose} aria-label={t('common.close')} title={t('common.close')}
              className="w-7 h-7 rounded-sm text-muted hover:text-gold hover:bg-gold-faint text-lg leading-none cursor-pointer">×</button>
          </header>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 px-5 py-3 border-t border-subtle shrink-0">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}
