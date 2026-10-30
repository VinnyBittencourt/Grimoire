// Botões do tema. variant: gold | ghost | danger | subtle; size: sm | md
const VARIANTS = {
  gold: 'text-[var(--color-wood-darkest)] border-[var(--color-gold-primary)] bg-[linear-gradient(135deg,var(--color-gold-dark)_0%,var(--color-gold-primary)_50%,var(--color-gold-dark)_100%)] hover:bg-[linear-gradient(135deg,var(--color-gold-primary)_0%,var(--color-gold-light)_50%,var(--color-gold-primary)_100%)] shadow-[var(--shadow-button)] font-display font-semibold',
  ghost: 'text-gold border-wood bg-transparent hover:border-gold hover:bg-gold-faint font-display',
  danger: 'text-bad border-[var(--color-hp-border)] bg-transparent hover:border-bad hover:bg-bad-faint',
  subtle: 'text-muted border-transparent bg-transparent hover:text-parchment hover:bg-gold-faint',
}
const SIZES = { sm: 'min-h-7 px-2.5 py-1 text-xs', md: 'min-h-8 px-4 py-1.5 text-sm' }

export function Button({ variant = 'ghost', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 border rounded-sm tracking-wide transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}

/**
 * Dica curta que aparece no hover e no foco do teclado (o `title` nativo não aparece no foco).
 * O elemento pai precisa ter a classe `group` e `relative`.
 */
export function Hint({ children, side = 'top' }) {
  const pos = side === 'bottom' ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
  return (
    <span role="tooltip"
      className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${pos} z-40 whitespace-nowrap rounded-sm border border-wood bg-[var(--color-wood-darkest)] px-2 py-1 text-xs font-sans normal-case tracking-normal text-parchment shadow-[var(--shadow-pop)] opacity-0 transition-opacity delay-300 group-hover:opacity-100 group-focus-visible:opacity-100`}>
      {children}
    </span>
  )
}

const ICON_SIZES = { sm: 'w-6 h-6', md: 'w-7 h-7', lg: 'w-8 h-8' }

// Botão só com ícone: exige `label` (vira aria-label e dica visível no hover/foco)
export function IconButton({ label, className = '', type = 'button', size = 'md', tone = 'default', hintSide, children, ...props }) {
  const toneClass = tone === 'danger' ? 'text-muted hover:text-bad hover:bg-bad-faint' : 'text-muted hover:text-gold hover:bg-gold-faint'
  return (
    <button
      type={type}
      aria-label={label}
      className={`group relative inline-flex items-center justify-center shrink-0 ${ICON_SIZES[size]} rounded-sm transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${toneClass} ${className}`}
      {...props}
    >
      {children}
      <Hint side={hintSide}>{label}</Hint>
    </button>
  )
}
