// Blocos de layout da ficha: seções, caixas de estatística, estados vazios e de carregamento.

export function Section({ title, actions, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`panel flex flex-col min-h-0 ${className}`}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 shrink-0">
          {title && <h3 className="section-title m-0">{title}</h3>}
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </header>
      )}
      <div className={`px-4 pb-4 min-h-0 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

const TONES = {
  hp: 'bg-[var(--color-hp-bg)] border-[var(--color-hp-border)] text-[var(--color-hp)]',
  ac: 'bg-[var(--color-ac-bg)] border-[var(--color-ac-border)] text-[var(--color-ac)]',
  save: 'bg-[var(--color-save-bg)] border-[var(--color-save-border)] text-[var(--color-save)]',
  magic: 'bg-[var(--color-magic-bg)] border-[var(--color-magic-border)] text-[var(--color-magic)]',
  gold: 'bg-sunken border-subtle text-gold',
}

// Caixa de número grande com rótulo (CA, iniciativa, saves...)
export function StatBox({ label, value, sub, tone = 'gold', title, className = '', children }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-sm border px-2 py-1.5 ${TONES[tone]} ${className}`} title={title}>
      <span className="text-[9px] tracking-[0.14em] uppercase opacity-90">{label}</span>
      <span className="font-display font-bold text-xl leading-tight text-parchment">{value}</span>
      {sub && <span className="text-[10px] text-muted leading-tight">{sub}</span>}
      {children}
    </div>
  )
}

export function Badge({ children, tone = 'gold', className = '', title }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-px text-[10px] tracking-wide ${TONES[tone]} ${className}`}>
      {children}
    </span>
  )
}

export function EmptyState({ title, hint, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-2 py-8 ${className}`}>
      <p className="font-display text-muted m-0">{title}</p>
      {hint && <p className="text-dim text-xs m-0 max-w-xs">{hint}</p>}
      {action}
    </div>
  )
}

export function Loading({ label }) {
  return (
    <div className="flex-1 flex items-center justify-center py-16" role="status">
      <span className="font-display text-gold animate-pulse tracking-widest">{label}</span>
    </div>
  )
}

// Linha "rótulo: valor" compacta
export function KeyValue({ label, children }) {
  return (
    <div className="flex items-baseline gap-2 min-w-0">
      <span className="font-display text-gold text-[11px] shrink-0">{label}</span>
      <span className="text-body text-xs truncate">{children}</span>
    </div>
  )
}
