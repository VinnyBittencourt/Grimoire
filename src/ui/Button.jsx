// Botões do tema. variant: gold | ghost | danger | subtle; size: sm | md
const VARIANTS = {
  gold: 'text-[var(--color-wood-darkest)] border-[var(--color-gold-primary)] bg-[linear-gradient(135deg,var(--color-gold-dark)_0%,var(--color-gold-primary)_50%,var(--color-gold-dark)_100%)] hover:bg-[linear-gradient(135deg,var(--color-gold-primary)_0%,var(--color-gold-light)_50%,var(--color-gold-primary)_100%)] shadow-[0_2px_8px_rgba(0,0,0,0.4)] font-display font-semibold',
  ghost: 'text-gold border-wood bg-transparent hover:border-gold hover:bg-gold-faint font-display',
  danger: 'text-bad border-[var(--color-hp-border)] bg-transparent hover:border-bad hover:bg-[rgba(192,57,43,0.12)]',
  subtle: 'text-muted border-transparent bg-transparent hover:text-parchment hover:bg-gold-faint',
}
const SIZES = { sm: 'px-2.5 py-1 text-xs', md: 'px-4 py-1.5 text-sm' }

export function Button({ variant = 'ghost', size = 'md', className = '', type = 'button', ...props }) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 border rounded-sm tracking-wide transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    />
  )
}

// Botão só com ícone/símbolo: exige `label` (vira aria-label e title)
export function IconButton({ label, className = '', type = 'button', children, ...props }) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-sm text-muted hover:text-gold hover:bg-gold-faint transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
