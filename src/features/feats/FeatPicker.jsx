import { useMemo, useState } from 'react'
import { useLang } from '../../i18n'
import { useRefData } from '../../queries/characters'
import { Modal } from '../../ui/Modal'
import { Button } from '../../ui/Button'
import { Badge } from '../../ui/layout'
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
    const name = query.trim() || t('feats.custom')
    const row = await actions.create('feats', { kind: kind === 'flaw' ? 'flaw' : 'feat', name })
    if (row) { toast.success(t('feats.added', { name })); onClose() }
  }

  return (
    <Modal open={open} onClose={onClose} title={kind === 'flaw' ? t('feats.addFlaw') : t('feats.picker')} width={960} closeOnBackdrop className="h-[80vh]">
      <div className="flex flex-col gap-3 h-full">
        <div className="flex gap-2">
          <input autoFocus className="field flex-1" placeholder={t('common.search')} value={query} onChange={e => setQuery(e.target.value)} aria-label={t('common.search')} />
          {books.length > 1 && (
            <select className="field w-56" value={book} onChange={e => setBook(e.target.value)} aria-label={t('feats.allBooks')}>
              <option value="">{t('feats.allBooks')}</option>
              {books.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
          <Button onClick={addCustom}>{t('feats.createCustom')}</Button>
        </div>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {[null, ...categories].map(c => (
              <button key={c ?? 'all'} type="button" onClick={() => setCategory(c)} aria-pressed={category === c}
                className={`px-2 py-0.5 rounded-sm border text-[11px] cursor-pointer ${category === c ? 'border-gold text-gold bg-gold-faint' : 'border-subtle text-muted hover:text-parchment'}`}>
                {c ?? t('feats.categories')}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 min-h-0 grid grid-cols-[1fr_1.2fr] gap-3">
          <ul className="overflow-y-auto list-none p-0 m-0 border border-subtle rounded-sm" role="listbox" aria-label={t('feats.picker')}>
            {results.map(f => (
              <li key={f.id} role="option" aria-selected={selected === f.id}>
                <button type="button" onClick={() => setSelected(f.id)} onDoubleClick={() => add(f)}
                  className={`w-full text-left px-3 py-1.5 border-b border-subtle cursor-pointer ${selected === f.id ? 'bg-gold-faint' : 'hover:bg-[rgba(255,255,255,0.03)]'}`}>
                  <span className={`block text-sm ${owned.has(f.id) ? 'text-gold' : 'text-parchment'}`}>{f.nome}{owned.has(f.id) ? ' ✓' : ''}</span>
                  <span className="block text-dim text-[10px]">{f.nome_en} · {f.livro}</span>
                </button>
              </li>
            ))}
          </ul>
          <div className="overflow-y-auto border border-subtle rounded-sm p-4">
            {current ? (
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-gold text-lg m-0">{current.nome}</h3>
                <p className="text-dim text-xs m-0">{current.nome_en} · {current.livro}{REPEATABLE_FEATS.has(current.id) ? ` · ${t('feats.repeatable')}` : ''}</p>
                {current.prerequisitos && <p className="text-xs m-0"><span className="label">{t('feats.prerequisites')}</span> <span className="text-body">{current.prerequisitos}</span></p>}
                <p className="text-body text-sm m-0 whitespace-pre-line">{current.descricao}</p>
                <div className="flex flex-wrap gap-1">
                  {(current.efeitos ?? []).length
                    ? current.efeitos.map((e, i) => <Badge key={i} tone="magic">{formatEffect(e, { t, signed })}</Badge>)
                    : <span className="text-dim text-[11px]">{t('feats.noEffects')}</span>}
                </div>
                <Button variant="gold" className="self-start mt-2" onClick={() => add(current)}>{t('common.add')}</Button>
              </div>
            ) : <p className="text-dim text-sm m-0">{t('journal.selectItem')}</p>}
          </div>
        </div>
      </div>
    </Modal>
  )
}
