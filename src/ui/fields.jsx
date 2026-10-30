// Campos que salvam ao confirmar (blur ou Enter) e cancelam com Esc.
// O valor local só é ressincronizado com a prop quando o campo não está em edição,
// então uma atualização do servidor não "pula" o cursor enquanto se digita.
import { useState, useEffect, useRef, useId } from 'react'

function useCommitField(value, onCommit, parse = v => v) {
  const [draft, setDraft] = useState(value ?? '')
  const editing = useRef(false)

  useEffect(() => { if (!editing.current) setDraft(value ?? '') }, [value])

  const commit = () => {
    editing.current = false
    const parsed = parse(draft)
    if (parsed === undefined) { setDraft(value ?? ''); return }
    setDraft(parsed ?? '') // mostra o valor normalizado (ex.: limitado por min/max)
    // null, undefined e '' são o mesmo "vazio": não manda PATCH só por ter passado pelo campo
    if (String(parsed ?? '') !== String(value ?? '')) onCommit(parsed)
  }
  const cancel = () => { editing.current = false; setDraft(value ?? '') }

  return {
    value: draft,
    onChange: e => { editing.current = true; setDraft(e.target.value) },
    onBlur: commit,
    onKeyDown: e => {
      if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); e.currentTarget.blur() }
      if (e.key === 'Escape') { e.stopPropagation(); cancel(); requestAnimationFrame(() => e.target.blur()) }
    },
  }
}

export function Label({ htmlFor, children, className = '' }) {
  return <label htmlFor={htmlFor} className={`label block mb-1 ${className}`}>{children}</label>
}

export function TextField({ label, value, onCommit, className = '', inputClassName = '', placeholder, multiline, rows = 3, nullable = true, ...props }) {
  const id = useId()
  const field = useCommitField(value, onCommit, v => {
    const s = String(v)
    return nullable && s.trim() === '' ? null : s
  })
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <Tag id={id} className={`field ${multiline ? 'resize-y' : ''} ${inputClassName}`} placeholder={placeholder}
        rows={multiline ? rows : undefined} {...field} {...props} />
    </div>
  )
}

/**
 * Número inteiro (ou decimal com step). Vazio → null se nullable, senão volta ao valor anterior.
 * compact: caixa pequena centralizada, para grades de ficha.
 */
export function NumberField({ label, value, onCommit, min, max, step = 1, nullable = false, compact, className = '', inputClassName = '', title, ...props }) {
  const id = useId()
  const field = useCommitField(value, onCommit, v => {
    const s = String(v).trim().replace(',', '.')
    if (s === '' || s === '-') return nullable ? null : undefined
    let n = Number(s)
    if (!Number.isFinite(n)) return undefined
    if (step === 1) n = Math.trunc(n)
    if (min != null) n = Math.max(min, n)
    if (max != null) n = Math.min(max, n)
    return n
  })
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <input id={id} type="text" inputMode={step === 1 ? 'numeric' : 'decimal'} title={title}
        className={`field ${compact ? 'field-sm text-center w-12 px-1' : ''} ${inputClassName}`} {...field} {...props} />
    </div>
  )
}

export function SelectField({ label, value, onCommit, options, className = '', inputClassName = '', placeholder, ...props }) {
  const id = useId()
  return (
    <div className={className}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <select id={id} className={`field ${inputClassName}`} value={value ?? ''}
        onChange={e => onCommit(e.target.value === '' ? null : e.target.value)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

export function Checkbox({ label, checked, onChange, className = '', title }) {
  return (
    <label className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`} title={title}>
      <input type="checkbox" checked={Boolean(checked)} onChange={e => onChange(e.target.checked)}
        className="w-3.5 h-3.5 accent-[var(--color-gold-primary)] cursor-pointer" />
      {label && <span className="text-body text-xs">{label}</span>}
    </label>
  )
}
