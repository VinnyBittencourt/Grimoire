import { useEffect, useRef, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLang } from '../i18n'
import { Button, IconButton } from './Button'
import { Icon } from './Icon'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), [contenteditable=true]'

/**
 * Modal acessível: role=dialog, aria-modal, Esc fecha, foco preso dentro e devolvido ao sair.
 * Para escolher o campo que recebe o foco ao abrir, use `data-autofocus` (não `autoFocus`:
 * o React não renderiza o atributo e foca o filho antes de o Modal guardar o foco anterior).
 * Clicar fora NÃO fecha por padrão (no v1 isso jogava fora preparações e notas não salvas);
 * passe closeOnBackdrop para modais só de leitura/seleção.
 * confirmClose: com alterações não salvas, Esc/×/clique fora pedem confirmação antes de descartar.
 */
export function Modal({ open, onClose, title, subtitle, children, footer, width = 560, closeOnBackdrop = false, confirmClose = false, className = '' }) {
  const { t } = useLang()
  const ref = useRef(null)
  const titleId = useId()
  const [asking, setAsking] = useState(false)
  const keepRef = useRef(null)
  useEffect(() => { if (asking) keepRef.current?.focus() }, [asking])
  // onClose costuma ser uma função inline: guardada em ref para o efeito rodar só ao abrir/fechar
  // (senão o foco voltaria ao primeiro campo a cada render)
  const requestClose = () => (confirmClose ? setAsking(true) : close())
  const close = () => { setAsking(false); onClose() }
  const requestRef = useRef(requestClose)
  useEffect(() => { requestRef.current = requestClose })

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    const node = ref.current
    const first = node?.querySelector('[data-autofocus]') ?? node?.querySelector(FOCUSABLE)
    ;(first ?? node)?.focus()

    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); requestRef.current() }
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
      onMouseDown={e => { if (closeOnBackdrop && e.target === e.currentTarget) requestClose() }}
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
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-gold text-base tracking-wide m-0 truncate">{title}</h2>
              {subtitle && <p className="caption m-0 mt-0.5">{subtitle}</p>}
            </div>
            <IconButton label={t('common.close')} hintSide="bottom" onClick={requestClose}><Icon name="close" size={18} /></IconButton>
          </header>
        )}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">{children}</div>
        {asking ? (
          <footer className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--color-warning)] bg-warn-faint shrink-0" role="alert">
            <Icon name="warning" className="text-warn" />
            <span className="text-sm text-parchment mr-auto">{t('common.discardChanges')}</span>
            <Button variant="ghost" onClick={() => setAsking(false)} ref={keepRef}>{t('common.keepEditing')}</Button>
            <Button variant="danger" onClick={close}>{t('common.discard')}</Button>
          </footer>
        ) : footer && <footer className="flex items-center justify-end gap-2 px-5 py-3 border-t border-subtle shrink-0">{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

/**
 * Confirmação de ação destrutiva com consequência por escrito. O foco inicial fica em Cancelar.
 */
export function ConfirmDialog({ open, title, children, confirmLabel, onConfirm, onCancel, busy = false }) {
  const { t } = useLang()
  return (
    <Modal open={open} onClose={onCancel} title={title} width={440}
      footer={<>
        <Button variant="subtle" data-autofocus onClick={onCancel}>{t('common.cancel')}</Button>
        <Button variant="danger" disabled={busy} onClick={onConfirm}><Icon name="trash" size={14} />{confirmLabel ?? t('common.delete')}</Button>
      </>}>
      <div className="text-sm text-body leading-relaxed">{children}</div>
    </Modal>
  )
}
