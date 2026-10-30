import { useEffect, useRef, useState } from 'react'
import { useLang } from '../i18n'
import { Button, IconButton } from './Button'
import { Icon } from './Icon'

/**
 * Menu de ações num botão (⋯). items: [{ label, icon?, onSelect, tone?, disabled? }]
 * Teclado: ↑/↓ navegam, Home/End, Esc fecha e devolve o foco.
 */
export function Menu({ label, items, icon = 'dots', size = 'md', align = 'end' }) {
  const [open, setOpen] = useState(false)
  const wrap = useRef(null)
  const refs = useRef([])
  const enabled = items.filter(Boolean)

  useEffect(() => {
    if (!open) return
    refs.current[0]?.focus()
    const onDown = e => { if (!wrap.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  function onKey(e, i) {
    const n = enabled.length
    const go = j => { e.preventDefault(); refs.current[(j + n) % n]?.focus() }
    if (e.key === 'ArrowDown') go(i + 1)
    else if (e.key === 'ArrowUp') go(i - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(n - 1)
    else if (e.key === 'Escape' || e.key === 'Tab') { e.stopPropagation(); setOpen(false); wrap.current?.querySelector('button')?.focus() }
  }

  return (
    <span ref={wrap} className="relative inline-flex">
      <IconButton label={label} size={size} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Icon name={icon} size={18} />
      </IconButton>
      {open && (
        <ul role="menu" aria-label={label}
          className={`absolute top-full mt-1 z-40 min-w-48 list-none m-0 p-1 panel !border animate-fade ${align === 'end' ? 'right-0' : 'left-0'}`}>
          {enabled.map((it, i) => (
            <li key={it.label} role="none">
              <button ref={el => { refs.current[i] = el }} type="button" role="menuitem" disabled={it.disabled}
                onKeyDown={e => onKey(e, i)}
                onClick={() => { setOpen(false); it.onSelect() }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-sm text-left text-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed focus:bg-gold-faint hover:bg-gold-faint ${it.tone === 'danger' ? 'text-bad' : 'text-parchment'}`}>
                {it.icon && <Icon name={it.icon} size={15} className={it.tone === 'danger' ? '' : 'text-gold'} />}
                {it.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  )
}

/** Escolha exclusiva em botões (role=radiogroup, setas navegam). options: [{ value, label, icon? }] */
export function SegmentedControl({ label, value, onChange, options, size = 'md', className = '' }) {
  const refs = useRef({})
  function onKey(e, i) {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return
    e.preventDefault()
    const next = options[(i + (e.key === 'ArrowRight' ? 1 : -1) + options.length) % options.length]
    onChange(next.value)
    refs.current[next.value]?.focus()
  }
  const pad = size === 'sm' ? 'px-2 min-h-6 text-2xs' : 'px-3 min-h-7 text-xs'
  return (
    <div role="radiogroup" aria-label={label} className={`inline-flex rounded-sm border border-wood overflow-hidden ${className}`}>
      {options.map((o, i) => {
        const on = o.value === value
        return (
          <button key={o.value} ref={el => { refs.current[o.value] = el }} type="button" role="radio" aria-checked={on} tabIndex={on ? 0 : -1}
            onClick={() => onChange(o.value)} onKeyDown={e => onKey(e, i)}
            className={`inline-flex items-center gap-1.5 font-display tracking-wider uppercase cursor-pointer transition-colors ${pad} ${i > 0 ? 'border-l border-wood' : ''} ${on ? 'bg-gold-faint text-gold' : 'text-muted hover:text-parchment hover:bg-hover'}`}>
            {o.icon && <Icon name={o.icon} size={14} />}{o.label}
          </button>
        )
      })}
    </div>
  )
}

/**
 * Criação inline: o usuário digita o nome e só então a linha é criada (nada de nome falso).
 * onSubmit(name, extra) → Promise; só limpa se resolver truthy (contrato de useSheetActions).
 * collapsed: mostra o botão `label` até o clique. withQty: campo de quantidade ao lado.
 */
export function QuickAdd({ label, placeholder, onSubmit, collapsed = false, defaultOpen, onCancel, compact = false, withQty = false, submitLabel, className = '', allowEmpty = false }) {
  const { t } = useLang()
  const [open, setOpen] = useState(defaultOpen ?? !collapsed)
  const cancel = () => { setName(''); if (collapsed) setOpen(false); onCancel?.() }
  const [name, setName] = useState('')
  const [qty, setQty] = useState('1')
  const [busy, setBusy] = useState(false)
  const input = useRef(null)

  async function submit(e) {
    e.preventDefault()
    const value = name.trim()
    if (!value && !allowEmpty) { input.current?.focus(); return }
    setBusy(true)
    const ok = await onSubmit(value, { qty: Math.max(0, Number(String(qty).replace(',', '.')) || 1) })
    setBusy(false)
    if (!ok) return
    setName(''); setQty('1')
    if (collapsed) setOpen(false)
    else input.current?.focus()
  }
  // Abrir já focado (ex.: depois de clicar no botão de um slot)
  useEffect(() => { if (open && collapsed) input.current?.focus() }, [open, collapsed])

  if (!open) {
    return <Button size="sm" className={className} onClick={() => { setOpen(true); requestAnimationFrame(() => input.current?.focus()) }}><Icon name="plus" size={14} />{label}</Button>
  }
  return (
    <form onSubmit={submit} className={`flex items-center gap-1.5 ${className}`}>
      <input ref={input} className="field field-sm flex-1 min-w-0" value={name} placeholder={placeholder} aria-label={placeholder}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); cancel() } }}
        onBlur={() => { if (compact && !name.trim()) cancel() }} />
      {withQty && (
        <input className="field field-sm w-14 text-center" inputMode="decimal" value={qty} aria-label={t('inventory.qty')}
          onChange={e => setQty(e.target.value)} />
      )}
      {!compact && <Button type="submit" size="sm" variant="gold" disabled={busy}>{submitLabel ?? t('common.add')}</Button>}
      {collapsed && !compact && <IconButton label={t('common.cancel')} size="sm" onClick={cancel}><Icon name="close" size={14} /></IconButton>}
    </form>
  )
}

/**
 * Valor + ações (ex.: Dano / Curar; Gastar / Recuperar; Receber / Gastar moedas).
 * actions: [{ id, label, icon?, tone?: 'danger'|'success'|'default' }]; Enter aplica a primeira.
 */
export function QuickAmount({ actions, secondary = [], onApply, ariaLabel, placeholder, extra, className = '', size = 'sm', hint }) {
  const { t } = useLang()
  const [amount, setAmount] = useState('')
  const tone = {
    danger: 'border-[var(--color-hp-text)]/50 text-bad hover:bg-bad-faint',
    success: 'border-[var(--color-save)]/50 text-[var(--color-save)] hover:bg-good-faint',
    default: 'border-field text-body hover:text-parchment hover:bg-hover',
  }
  function apply(id) {
    const n = Math.abs(parseInt(amount, 10))
    if (!n) return
    onApply(id, n)
    setAmount('')
  }
  const h = size === 'sm' ? 'min-h-7 text-xs' : 'min-h-8 text-sm'
  return (
    <form className={`flex flex-col gap-1 ${className}`} onSubmit={e => { e.preventDefault(); apply(actions[0].id) }}>
      <div className="flex items-stretch gap-1.5">
      <input className="field field-sm w-16 text-center" inputMode="numeric" placeholder={placeholder ?? t('vitals.amount')} aria-label={ariaLabel ?? t('vitals.amount')}
        title={t('controls.enterApplies', { action: actions[0].label })}
        value={amount} onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ''))} />
      {extra}
      {actions.map((a, i) => (
        <button key={a.id} type={i === 0 ? 'submit' : 'button'} onClick={i === 0 ? undefined : () => apply(a.id)}
          className={`flex-1 inline-flex items-center justify-center gap-1 px-2 rounded-sm border cursor-pointer transition-colors ${h} ${tone[a.tone ?? 'default']}`}>
          {a.icon && <Icon name={a.icon} size={14} />}{a.label}
        </button>
      ))}
      </div>
      {(secondary.length > 0 || hint) && (
        <div className={`flex items-center gap-2 ${hint ? 'justify-between' : 'justify-center'}`}>
          {hint && <span className="caption">{hint}</span>}
          {secondary.map(a => (
            <button key={a.id} type="button" onClick={() => apply(a.id)}
              className="inline-flex items-center gap-1 min-h-6 px-1.5 rounded-sm text-xs text-muted hover:text-parchment hover:bg-hover cursor-pointer">
              {a.icon && <Icon name={a.icon} size={13} />}{a.label}
            </button>
          ))}
        </div>
      )}
    </form>
  )
}

/**
 * Fichas de uso (recursos, slots). Gasto = apagado + traço (não só opacidade).
 * isUsed(i), onToggle?(i) (sem onToggle → só leitura), hasNote?(i), noteOf?(i)
 */
export function TokenTrack({ total, isUsed, onToggle, hasNote, noteOf, label, variant = 'round', size = 28, onContext }) {
  const { t } = useLang()
  const shape = variant === 'diamond' ? 'rotate-45 rounded-[3px]' : 'rounded-full'
  const s = variant === 'diamond' ? Math.round(size * 0.78) : size
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label={label}>
      {Array.from({ length: total }, (_, i) => {
        const used = isUsed(i)
        const accent = variant === 'diamond' ? 'border-[var(--color-magic)] bg-[radial-gradient(circle,var(--color-magic-glow),transparent_70%)]' : 'border-gold bg-[radial-gradient(circle,var(--color-gold-glow),transparent_70%)]'
        const cls = `relative inline-flex items-center justify-center border-2 transition-colors ${shape} ${used ? 'border-[var(--color-wood-border)] bg-[var(--color-wood-medium)]' : accent}`
        const state = used ? t('tokens.spent') : t('tokens.available')
        const aria = `${label}: ${t('tokens.position', { i: i + 1, total })}, ${state}${noteOf?.(i) ? ` — ${noteOf(i)}` : ''}`
        // Traço diagonal de "gasto" (no losango o próprio container já está girado 45°)
        const mark = used && <span aria-hidden className={`block w-3/5 h-0.5 rounded-full bg-[var(--color-text-muted)] ${variant === 'diamond' ? '' : '-rotate-45'}`} />
        const dot = hasNote?.(i) && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--color-magic)] border border-[var(--color-bg)]" aria-hidden />
        return onToggle ? (
          <button key={i} type="button" aria-pressed={used} aria-label={aria} title={noteOf?.(i) || undefined}
            onClick={() => onToggle(i)} onContextMenu={onContext ? e => { e.preventDefault(); onContext(i) } : undefined}
            className={`${cls} cursor-pointer hover:brightness-125`} style={{ width: s, height: s }}>
            {mark}{dot}
          </button>
        ) : (
          <span key={i} role="img" aria-label={aria} className={cls} style={{ width: s, height: s }}>{mark}</span>
        )
      })}
    </div>
  )
}
