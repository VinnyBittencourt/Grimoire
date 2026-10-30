import { useState } from 'react'
import { useLang } from '../../i18n'
import { Button } from '../../ui/Button'
import { EmptyState } from '../../ui/layout'
import { Icon } from '../../ui/Icon'
import { UNDO_FIELDS } from '../../queries/undo'

/**
 * Padrão lista à esquerda + detalhe à direita, usado por jogadores, NPCs, locais e missões.
 * O botão "+" cria com o texto da busca como nome (ou vazio) e foca o campo Nome do detalhe.
 * selectedId/onSelect vêm do JournalTab (URL); sem eles, cai no primeiro item.
 */
export function ListDetail({ data, actions, collection, newLabel, Detail, subtitle, selectedId, onSelect, onNavigate, icon, emptyTitle, emptyHint, searchFields }) {
  const { t } = useLang()
  const items = data[collection] ?? []
  const [query, setQuery] = useState('')
  const [createdId, setCreatedId] = useState(null)
  const selected = items.find(i => i.id === selectedId) ?? (selectedId == null ? items[0] : null) ?? null
  const q = query.trim().toLowerCase()
  const filtered = items.filter(i => !q || [i.name, i.notes, ...(searchFields?.(i) ?? [])].filter(Boolean).join(' ').toLowerCase().includes(q))

  async function add() {
    const row = await actions.create(collection, { name: query.trim() })
    if (row) { setCreatedId(row.id); setQuery(''); onSelect(row.id) }
  }

  async function remove(item) {
    const next = items.find(i => i.id !== item.id)?.id ?? null
    const ok = UNDO_FIELDS[collection]
      ? await actions.removeUndoable(collection, item, t('common.removed', { name: item.name || t('journal.untitled') }))
      : await actions.remove(collection, item.id)
    if (ok) onSelect(next)
  }

  return (
    <div className="grid grid-cols-[300px_1fr] gap-4 h-full min-h-0">
      <div className="panel flex flex-col min-h-0">
        <div className="flex gap-2 p-3 border-b border-subtle">
          <label className="relative flex-1">
            <Icon name="search" size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input className="field field-sm pl-7" placeholder={t('journal.searchOrCreate')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('journal.searchOrCreate')}
              onKeyDown={e => { if (e.key === 'Enter' && query.trim() && filtered.length === 0) add() }} />
          </label>
          <Button size="sm" onClick={add} title={query.trim() ? t('journal.createNamed', { name: query.trim() }) : undefined}>
            <Icon name="plus" size={14} />{newLabel}
          </Button>
        </div>
        <ul className="flex-1 overflow-y-auto list-none p-0 m-0">
          {filtered.map(item => (
            <li key={item.id}>
              <button type="button" onClick={() => onSelect(item.id)} aria-current={item.id === selected?.id}
                className={`w-full text-left px-3 py-2 border-b border-subtle cursor-pointer ${item.id === selected?.id ? 'bg-gold-faint border-l-2 border-l-gold' : 'row-hover'}`}>
                <span className="block text-sm text-parchment truncate">{item.name || t('journal.untitled')}</span>
                {subtitle && subtitle(item) && <span className="block caption truncate">{subtitle(item)}</span>}
              </button>
            </li>
          ))}
          {items.length === 0 && <li><EmptyState icon={icon} title={emptyTitle ?? t('common.empty')} hint={emptyHint} /></li>}
          {items.length > 0 && filtered.length === 0 && (
            <li><EmptyState title={t('common.notFound', { q: query })}
              action={<Button size="sm" onClick={add}><Icon name="plus" size={14} />{t('journal.createNamed', { name: query.trim() })}</Button>} /></li>
          )}
        </ul>
      </div>
      <div className="panel p-5 overflow-y-auto min-h-0">
        {selected
          ? <Detail key={selected.id} item={selected} data={data} actions={actions} autoFocusName={createdId === selected.id}
              onNavigate={onNavigate} onDelete={() => remove(selected)} />
          : <EmptyState icon={icon} title={items.length ? t('journal.selectItem') : emptyTitle ?? t('common.empty')}
              action={<Button onClick={add}><Icon name="plus" size={14} />{newLabel}</Button>} />}
      </div>
    </div>
  )
}
