// Blocos de layout da ficha: seções, caixas de estatística, estados vazios e de carregamento.
// Densidade: padding de seção 16 px; gap entre seções 16; entre linhas de lista 6–8; grades de campo 8 (compacta) ou 12.
import { useLang } from '../i18n'
import { Icon } from './Icon'
import { Popover } from './Popover'

/**
 * Seção com título. editing/onToggleEdit: mostra o botão [Editar]/[Concluir] no cabeçalho
 * (modo leitura por padrão; os campos aparecem só em edição).
 */
export function Section({ title, icon, actions, children, className = '', bodyClassName = '', editing, onToggleEdit, subtitle }) {
  const { t } = useLang()
  return (
    <section className={`panel flex flex-col min-h-0 ${className}`}>
      {(title || actions || onToggleEdit) && (
        <header className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 shrink-0 min-h-11">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <Icon name={icon} size={15} className="text-gold-lo" />}
            {title && <h3 className="section-title m-0 truncate">{title}</h3>}
            {subtitle && <span className="caption truncate">{subtitle}</span>}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {actions}
            {onToggleEdit && (
              <button type="button" aria-pressed={Boolean(editing)} onClick={onToggleEdit}
                className={`inline-flex items-center gap-1.5 min-h-7 px-2.5 rounded-sm border text-xs font-display tracking-wide cursor-pointer transition-colors ${editing ? 'border-gold bg-gold text-[var(--color-wood-darkest)]' : 'border-wood text-gold hover:border-gold hover:bg-gold-faint'}`}>
                <Icon name={editing ? 'check' : 'pencil'} size={14} />{editing ? t('common.done') : t('common.edit')}
              </button>
            )}
          </div>
        </header>
      )}
      <div className={`px-4 pb-4 min-h-0 ${bodyClassName}`}>{children}</div>
    </section>
  )
}

const TONES = {
  hp: 'bg-[var(--color-hp-bg)] border-[var(--color-hp-border)] text-hp-ink',
  ac: 'bg-[var(--color-ac-bg)] border-[var(--color-ac-border)] text-[var(--color-ac)]',
  save: 'bg-[var(--color-save-bg)] border-[var(--color-save-border)] text-[var(--color-save)]',
  magic: 'bg-[var(--color-magic-bg)] border-[var(--color-magic-border)] text-[var(--color-magic)]',
  gold: 'bg-sunken border-subtle text-gold',
  warn: 'bg-warn-faint border-[var(--color-warning)]/40 text-warn',
}

/**
 * Caixa de número grande com rótulo (CA, iniciativa, saves...).
 * explain: conteúdo da composição (abre um Popover ao clicar; o valor ganha sublinhado pontilhado).
 */
export function StatBox({ label, value, sub, tone = 'gold', title, className = '', children, explain, size = 'md' }) {
  const valueSize = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'
  const body = (
    <>
      <span className="text-2xs tracking-[var(--tracking-caps)] uppercase">{label}</span>
      <span className={`font-display font-bold ${valueSize} leading-tight text-parchment tabular-nums`}>{value}</span>
      {sub && <span className="text-xs text-muted leading-tight">{sub}</span>}
      {children}
    </>
  )
  const box = `flex flex-col items-center justify-center rounded-sm border px-2 py-1.5 ${TONES[tone]} ${className}`
  if (!explain) return <div className={box} title={title}>{body}</div>
  return (
    <Popover label={`${label}: ${value}`} trigger={body} className="w-full" width={250}
      triggerClassName={`${box} w-full hover:brightness-125 transition-[filter] [&>span:nth-child(2)]:underline [&>span:nth-child(2)]:decoration-dotted [&>span:nth-child(2)]:decoration-gold-lo [&>span:nth-child(2)]:underline-offset-4`}>
      {explain}
    </Popover>
  )
}

export function Badge({ children, tone = 'gold', className = '', title, icon }) {
  return (
    <span title={title} className={`inline-flex items-center gap-1 rounded-sm border px-1.5 py-px text-2xs tracking-wide whitespace-nowrap ${TONES[tone]} ${className}`}>
      {icon && <Icon name={icon} size={11} />}{children}
    </span>
  )
}

export function EmptyState({ title, hint, action, className = '', icon }) {
  return (
    <div className={`flex flex-col items-center justify-center text-center gap-2 py-8 px-4 ${className}`}>
      {icon && <Icon name={icon} size={28} className="text-gold-lo mb-1" strokeWidth={1.5} />}
      <p className="font-display text-muted m-0">{title}</p>
      {hint && <p className="caption m-0 max-w-sm">{hint}</p>}
      {action && <div className="mt-1">{action}</div>}
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
      <span className="font-display text-gold text-xs shrink-0">{label}</span>
      <span className="text-body text-xs truncate">{children}</span>
    </div>
  )
}
