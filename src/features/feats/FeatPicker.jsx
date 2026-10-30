import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { useRefData } from '../../queries/characters'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Badge, EmptyState, Loading } from '../../ui/layout'
import { Icon } from '../../ui/Icon'
import { useToast } from '../../ui/Toast'
import { REPEATABLE_FEATS } from '../../../shared/rules/effects.js'
import { formatEffect } from './formatEffect'

const norm = s => (s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Seletor de talentos/falhas de referência com busca (pt/en/descrição/pré-requisitos), categoria e livro
export function FeatPicker({ open, kind, onClose, ch, actions }) {
  const { t, signed } = useLang()
  const toast = useToast()
  const source = useRefData(kind === 'flaw' ? 'ref_falhas' : 'ref_talentos')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(null)
  const [book, setBook] = useState('')
  const [selected, setSelected] = useState(null)

  const all = useMemo(() => source.data ?? [], [source.data])
  const categories = useMemo(() => [...new Set(all.flatMap(f => f.categoria ?? []))], [all])
  const books = useMemo(() => [...new Set(all.map(f => f.livro).filter(Boolean))], [all])
  const owned = new Set(ch.feats.map(f => f.ref_id).filter(Boolean))

  const results = useMemo(() => {
    const q = norm(query)
    return all.filter(f =>
      (!category || f.categoria?.includes(category)) &&
      (!book || f.livro === book) &&
      (!q || [f.nome, f.nome_en, f.descricao, f.prerequisitos].some(s => norm(s).includes(q))))
  }, [all, query, category, book])

  const current = results.find(f => f.id === selected) ?? null

  async function add(ref) {
    if (owned.has(ref.id) && !REPEATABLE_FEATS.has(ref.id)) { toast.info(t('feats.alreadyHas')); return }
    const row = await actions.create('feats', { ref_id: ref.id, kind: kind === 'flaw' ? 'flaw' : 'feat', name: ref.nome })
    if (row) toast.success(t('feats.added', { name: ref.nome }))
  }

  async function addCustom() {
    const name = query.trim()
    if (!name) { document.getElementById('feat-search')?.focus(); return }
    const row = await actions.create('feats', { kind: kind === 'flaw' ? 'flaw' : 'feat', name })
    if (row) { toast.success(t('feats.added', { name })); onClose() }
  }

  return (
    <Modal open={open} onClose={onClose} title={kind === 'flaw' ? t('feats.pickerFlaw') : t('feats.picker')} width={980} closeOnBackdrop className="h-[82vh]">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex gap-2">
          <label className="relative flex-1">
            <Icon name="search" size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input id="feat-search" data-autofocus className="field pl-8" placeholder={t('feats.searchRef')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('feats.searchRef')} />
          </label>
          {books.length > 1 && (
            <select className="field w-56" value={book} onChange={e => setBook(e.target.value)} aria-label={t('feats.allBooks')}>
              <option value="">{t('feats.allBooks')}</option>
              {books.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          <Button onClick={addCustom} title={query.trim() ? undefined : t('feats.createHint')}>
            <Icon name="plus" size={14} />{query.trim() ? t('feats.createNamed', { name: query.trim() }) : t('feats.createCustom')}
          </Button>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {[null, ...categories].map(c => (
              <button key={c ?? 'all'} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
                className={`min-h-6 px-2 rounded-sm border text-xs cursor-pointer ${category === c ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment'}`}>
                {c ?? t('feats.allCategories')}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.2fr] gap-3">
          <div className="flex flex-col min-h-0 border border-subtle rounded-sm">
          <p className="caption m-0 px-3 py-1.5 border-b border-subtle">{t('feats.results', { n: results.length })}</p>
          <ul className="flex-1 overflow-y-auto list-none p-0 m-0" role="listbox" aria-label={t('feats.picker')}>
            {source.isLoading && <li><Loading label={t('common.loading')} /></li>}
            {source.error && <li><EmptyState title={t('feats.loadError')} action={<Button size="sm" onClick={() => source.refetch()}>{t('common.retry')}</Button>} /></li>}
            {source.data && results.length === 0 && (
              <li><EmptyState title={t('common.notFound', { q: query })} hint={query.trim() ? t('feats.notFoundHint') : undefined}
                action={query.trim() && <Button size="sm" onClick={addCustom}>{t('feats.createNamed', { name: query.trim() })}</Button>} /></li>
            )}
            {results.map(f => (
              <li key={f.id} role="option" aria-selected={selected === f.id}>
                <button type="button" onClick={() => setSelected(f.id)} onDoubleClick={() => add(f)}
                  className={`w-full text-left px-3 py-1.5 border-b border-subtle cursor-pointer ${selected === f.id ? 'bg-gold-faint' : 'row-hover'}`}>
                  <span className={`flex items-center gap-1.5 text-sm ${owned.has(f.id) ? 'text-gold' : 'text-parchment'}`}>
                    {f.nome}{owned.has(f.id) && <Icon name="check" size={13} label={t('feats.owned')} />}
                  </span>
                  <span className="block caption">{f.nome_en} · {f.livro}</span>
                </button>
              </li>
            ))}
          </ul>
          </div>
          <div className="overflow-y-auto border border-subtle rounded-sm p-4">
            {current ? (
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-gold text-lg m-0">{current.nome}</h3>
                <p className="caption m-0">{current.nome_en} · {current.livro}{REPEATABLE_FEATS.has(current.id) ? ` · ${t('feats.repeatable')}` : ''}</p>
                {current.prerequisitos && <p className="text-xs m-0"><span className="label">{t('feats.prerequisites')}</span> <span className="text-body">{current.prerequisitos}</span></p>}
                <p className="text-body text-sm m-0 whitespace-pre-line">{current.descricao}</p>
                <div className="flex flex-wrap gap-1">
                  {(current.efeitos ?? []).length
                    ? current.efeitos.map((e, i) => <Badge key={i} tone="magic">{formatEffect(e, { t, signed })}</Badge>)
                    : <span className="caption">{t('feats.noEffects')}</span>}
                </div>
                <Button variant="gold" className="self-start mt-2" onClick={() => add(current)}>
                  <Icon name="plus" size={14} />{owned.has(current.id) && !REPEATABLE_FEATS.has(current.id) ? t('feats.alreadyHas') : t('feats.addThis')}
                </Button>
                <p className="caption m-0">{t('feats.doubleClickHint')}</p>
              </div>
            ) : <EmptyState icon="star" title={t('feats.pickHint')} />}
          </div>
        </div>
      </div>
    </Modal>
  )
}
