import { useEffect, useId, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { Icon } from './Icon'

/**
 * Painel flutuante não modal preso a um botão. Esc ou clique fora fecham e o foco volta ao gatilho.
 * trigger: conteúdo do botão; label: nome acessível (quando o trigger não tem texto claro).
 * children: conteúdo, ou função ({ close }) => conteúdo.
 */
export function Popover({ trigger, label, children, className = '', triggerClassName = '', panelClassName = '', align = 'start', width = 280 }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const btn = useRef(null)
  const panel = useRef(null)
  const id = useId()
  useEffect(() => { if (open) panel.current?.focus({ preventScroll: true }) }, [open])

  useEffect(() => {
    if (!open) return
    const node = btn.current
    const onDown = e => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    const onKey = e => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); node?.focus() } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  // Fechar pelo conteúdo (ex.: depois de uma ação) devolve o foco ao gatilho: feito no efeito abaixo
  const [returnFocus, setReturnFocus] = useState(false)
  useEffect(() => {
    if (!open && returnFocus) btn.current?.focus()
  }, [open, returnFocus])
  const close = () => { setReturnFocus(true); setOpen(false) }
  return (
    <span ref={wrap} className={`relative inline-flex ${className}`}>
      <button ref={btn} type="button" aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} aria-label={label}
        onClick={() => { setReturnFocus(false); setOpen(o => !o) }} className={`cursor-pointer ${triggerClassName}`}>
        {trigger}
      </button>
      {open && (
        <div id={id} role="dialog" aria-label={label} tabIndex={-1} ref={panel}
          className={`absolute top-full mt-1.5 z-40 panel !border animate-fade p-3 text-left ${align === 'end' ? 'right-0' : 'left-0'} ${panelClassName}`}
          style={{ width }}>
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </span>
  )
}

/**
 * Composição de um valor: equação vertical (parcelas → total). Só exibe; quem calcula é o motor.
 * parts: [{ key, label, value, note? }]; parcelas zeradas ficam ocultas (exceto `always`).
 */
export function Breakdown({ title, total, parts = [], ignored = [], override, note }) {
  const { t, signed } = useLang()
  const shown = parts.filter(p => p.always || p.value !== 0)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="section-title">{title}</span>
        <span className="num-total">{total}</span>
      </div>
      <ul className="list-none p-0 m-0 flex flex-col gap-0.5">
        {shown.map(p => (
          <li key={p.key} className="flex items-baseline justify-between gap-3 text-xs">
            <span className="text-body">{p.label}{p.note && <span className="text-dim"> · {p.note}</span>}</span>
            <span className="num-part font-semibold">{p.raw ?? signed(p.value)}</span>
          </li>
        ))}
        {shown.length === 0 && <li className="caption">{t('breakdown.nothing')}</li>}
      </ul>
      {ignored.length > 0 && (
        <div className="mt-1 pt-1.5 border-t border-subtle">
          <p className="caption m-0 mb-0.5 text-warn">{t('breakdown.notStacking')}</p>
          <ul className="list-none p-0 m-0">
            {ignored.map((x, i) => <li key={i} className="text-xs text-dim line-through">{x}</li>)}
          </ul>
        </div>
      )}
      {override && (
        <p className="caption m-0 mt-1 pt-1.5 border-t border-subtle text-warn">{t('breakdown.override', { n: override.computed })}</p>
      )}
      {note && <p className="caption m-0">{note}</p>}
    </div>
  )
}

/**
 * Valor clicável que abre a composição (sublinhado pontilhado indica que há explicação).
 */
export function Explain({ value, label, className = '', align, children, width = 260 }) {
  return (
    <Popover label={label} align={align} width={width} trigger={value}
      triggerClassName={`explain rounded-sm ${className}`}>
      {children}
    </Popover>
  )
}

/** Aviso com ícone + texto (nunca só cor). tone: info | warn | danger | success */
export function Notice({ tone = 'info', title, children, action, className = '', compact = false }) {
  const map = {
    info: { icon: 'info', box: 'border-[var(--color-ac-border)] bg-info-faint', color: 'text-[var(--color-ac)]' },
    warn: { icon: 'warning', box: 'border-[var(--color-warning)]/40 bg-warn-faint', color: 'text-warn' },
    danger: { icon: 'warning', box: 'border-[var(--color-hp-border)] bg-bad-faint', color: 'text-bad' },
    success: { icon: 'check', box: 'border-[var(--color-save-border)] bg-good-faint', color: 'text-[var(--color-save)]' },
  }[tone]
  return (
    <div className={`flex items-start gap-2 rounded-sm border ${map.box} ${compact ? 'px-2 py-1.5' : 'px-3 py-2'} ${className}`}>
      <Icon name={map.icon} size={compact ? 14 : 16} className={`mt-px ${map.color}`} />
      <div className="flex-1 min-w-0 text-xs text-body leading-relaxed">
        {title && <p className={`m-0 font-semibold ${map.color}`}>{title}</p>}
        {children}
      </div>
      {action}
    </div>
  )
}
