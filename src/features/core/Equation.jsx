import { useLang } from '../../i18n'

/**
 * Linha "Rótulo  Total  = parcela + parcela…" do modo leitura. parts já vêm traduzidas
 * (labelParts) e calculadas pelo motor; parcelas zeradas somem (exceto `always`).
 */
export function Equation({ label, total, parts, tone = 'text-parchment', extra }) {
  const { signed } = useLang()
  const shown = parts.filter(p => p.always || p.value !== 0)
  return (
    <div className="grid grid-cols-[7.5rem_6.5rem_1fr] items-baseline gap-x-3 py-1.5 border-t border-subtle first:border-t-0">
      <span className="font-display text-gold text-sm truncate">{label}</span>
      <span className={`num-total text-right whitespace-nowrap ${String(total).length > 6 ? '!text-sm' : ''} ${tone}`}>{total}</span>
      <span className="flex flex-wrap gap-x-1.5 text-xs text-muted leading-relaxed min-w-0">
        {shown.map((p, i) => (
          <span key={p.key} className="whitespace-nowrap">
            {i === 0 ? '= ' : p.value < 0 ? ' − ' : ' + '}
            <span className="num-part text-body">{i === 0 && p.value < 0 ? signed(p.value) : Math.abs(p.value)}</span> <span className="text-dim">{p.label}</span>
          </span>
        ))}
        {extra}
      </span>
    </div>
  )
}
