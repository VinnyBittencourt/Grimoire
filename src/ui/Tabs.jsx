import { useRef } from 'react'

/**
 * Abas acessíveis (role=tablist, setas ←/→, Home/End navegam).
 * tabs: [{ id, label, badge?, icon? }]; o painel é renderizado pelo chamador com
 * id={`${idPrefix}-panel`} e aria-labelledby={`${idPrefix}-tab-${active}`}.
 */
export function Tabs({ tabs, active, onChange, className = '', size = 'md', label, idPrefix = 'tabs' }) {
  const refs = useRef({})
  function onKey(e, index) {
    const map = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 }
    if (!(e.key in map)) return
    e.preventDefault()
    const next = tabs[(map[e.key] + tabs.length) % tabs.length]
    onChange(next.id)
    refs.current[next.id]?.focus()
  }
  const pad = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-xs'
  return (
    <div role="tablist" aria-label={label} className={`flex items-end gap-1 overflow-x-auto ${className}`}>
      {tabs.map((tab, i) => {
        const selected = tab.id === active
        return (
          <button
            key={tab.id}
            ref={el => { refs.current[tab.id] = el }}
            id={`${idPrefix}-tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={e => onKey(e, i)}
            className={`inline-flex items-center gap-1.5 font-display tracking-wider uppercase whitespace-nowrap border-b-2 transition-colors cursor-pointer ${pad} ${
              selected ? 'text-gold border-gold' : 'text-muted border-transparent hover:text-parchment hover:border-wood'}`}
          >
            {tab.label}
            {tab.badge != null && <span className={`min-w-5 px-1 rounded-full text-2xs tabular-nums ${selected ? 'bg-gold-faint text-gold' : 'bg-sunken text-muted'}`}>{tab.badge}</span>}
          </button>
        )
      })}
    </div>
  )
}
