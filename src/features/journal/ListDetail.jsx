import { useState } from 'react'
import { useLang } from '../../i18n'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/layout'

// Padrão lista à esquerda + detalhe à direita, usado por jogadores, NPCs, locais e missões
export function ListDetail({ data, actions, collection, newLabel, Detail, subtitle }) {
  const { t } = useLang()
  const items = data[collection] ?? []
  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null)
  const [query, setQuery] = useState('')
  const selected = items.find(i => i.id === selectedId) ?? null
  const filtered = items.filter(i => !query || `${i.name} ${i.notes ?? ''}`.toLowerCase().includes(query.toLowerCase()))

  async function add() {
    const row = await actions.create(collection, { name: newLabel.replace('+ ', '') })
    if (row) setSelectedId(row.id)
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4 h-full min-h-0">
      <div className="panel flex flex-col min-h-0">
        <div className="flex gap-2 p-3 border-b border-subtle">
          <input className="field field-sm flex-1" placeholder={t('common.search')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('common.search')} />
          <Button size="sm" onClick={add}>{newLabel}</Button>
        </div>
        <ul className="flex-1 overflow-y-auto list-none p-0 m-0">
          {filtered.map(item => (
            <li key={item.id}>
              <button type="button" onClick={() => setSelectedId(item.id)} aria-current={item.id === selectedId}
                className={`w-full text-left px-3 py-2 border-b border-subtle cursor-pointer ${item.id === selectedId ? 'bg-gold-faint' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}>
                <span className="block text-sm text-parchment truncate">{item.name || t('journal.untitled')}</span>
                {subtitle && subtitle(item) && <span className="block text-[10px] text-dim truncate">{subtitle(item)}</span>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li><EmptyState title={t('common.empty')} /></li>}
        </ul>
      </div>
      <div className="panel p-4 overflow-y-auto min-h-0">
        {selected
          ? <Detail key={selected.id} item={selected} data={data} actions={actions}
              onDelete={() => { actions.remove(collection, selected.id); setSelectedId(items.find(i => i.id !== selected.id)?.id ?? null) }} />
          : <EmptyState title={t('journal.selectItem')} />}
      </div>
    </div>
  )
}
