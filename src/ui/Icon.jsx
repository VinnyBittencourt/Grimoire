import { ICON_PATHS } from './iconPaths'

/**
 * Ícone de interface em SVG (cor = currentColor). Decorativo por padrão (aria-hidden);
 * com `label` vira imagem acessível. Use className para a cor (ex.: "text-gold").
 */
export function Icon({ name, size = 16, label, className = '', strokeWidth = 1.75 }) {
  const paths = ICON_PATHS[name] ?? ICON_PATHS.info
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}
      {...(label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true, focusable: 'false' })}>
      {paths.map(d => <path key={d} d={d} />)}
    </svg>
  )
}
