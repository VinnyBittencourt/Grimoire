import { useRef } from 'react'

/**
 * Abas acessíveis (role=tablist, setas ←/→ navegam).
 * tabs: [{ id, label, badge? }]; o painel é renderizado pelo chamador.
 */
export function Tabs({ tabs, active, onChange, className = '', size = 'md', label }) {
  const refs = useRef({})
  function onKey(e, index) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = tabs[(index + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length]
    onChange(next.id)
    refs.current[next.id]?.focus()
  }
  const pad = size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2.5 text-xs'
  return (
    <div role="tablist" aria-label={label} className={`flex items-end gap-1 overflow-x-auto ${className}`}>
      {tabs.map((tab, i) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            ref={el => { refs.current[tab.id] = el }}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={e => onKey(e, i)}
            className={`font-display tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors cursor-pointer ${pad} ${
              selected ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-parchment hover:border-wood'}`}
          >
            {tab.label}
            {tab.badge != null && <span className="ml-1.5 text-[10px] text-dim">{tab.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
