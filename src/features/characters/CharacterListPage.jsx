import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../../i18n'
import { useCharacters, useDeleteCharacter } from '../../queries/characters'
import { AppHeader } from '../shell/AppHeader'
import { ExchangeModal } from '../shell/ExchangeModal'
import { Button } from '../../ui/Button'
import { ConfirmButton } from '../../ui/ConfirmButton'
import { EmptyState, Loading } from '../../ui/layout'
import { useToast } from '../../ui/Toast'
import { photoUrl } from '../../api/client'

export default function CharacterListPage() {
  const { t, className } = useLang()
  const { data, isLoading, error, refetch } = useCharacters()
  const del = useDeleteCharacter()
  const toast = useToast()
  const navigate = useNavigate()
  const [exchange, setExchange] = useState(false)

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader actions={<Button size="sm" onClick={() => setExchange(true)}>{t('list.import')}</Button>} />
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-display text-gold text-2xl tracking-wide m-0">{t('list.title')}</h1>
            <p className="text-muted text-xs mt-1 mb-0">{t('app.tagline')}</p>
          </div>
          <Button variant="gold" onClick={() => navigate('/personagem/novo')}>{t('list.new')}</Button>
        </div>

        {isLoading && <Loading label={t('common.loading')} />}
        {error && (
          <EmptyState title={error.message} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />
        )}
        {data && data.length === 0 && (
          <div className="panel"><EmptyState title={t('list.empty')} hint={t('list.emptyHint')} className="py-16"
            action={<div className="flex gap-2 mt-2"><Button variant="gold" onClick={() => navigate('/personagem/novo')}>{t('list.new')}</Button>
              <Button onClick={() => setExchange(true)}>{t('list.import')}</Button></div>} /></div>
        )}

        <ul className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))] list-none p-0 m-0">
          {data?.map(c => {
            const level = c.classes.reduce((a, k) => a + k.level, 0)
            return (
              <li key={c.id} className="panel group overflow-hidden flex flex-col hover:border-gold-lo transition-colors">
                <Link to={`/personagem/${c.id}`} className="flex flex-col no-underline">
                  <div className="h-44 bg-sunken flex items-center justify-center overflow-hidden border-b border-subtle">
                    {c.photo
                      ? <img src={photoUrl(c.photo)} alt="" className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform" />
                      : <span className="text-5xl opacity-40" aria-hidden>⚔️</span>}
                  </div>
                  <div className="px-4 pt-3 pb-2">
                    <h2 className="font-display text-parchment text-base m-0 truncate">{c.name || '—'}</h2>
                    <p className="text-gold text-xs mt-1 mb-0 truncate">
                      {c.classes.map(k => `${className(k)} ${k.level}`).join(' / ') || '—'}
                    </p>
                    <p className="text-dim text-[11px] mt-0.5 mb-0">{t('list.level', { n: level })}</p>
                  </div>
                </Link>
                <div className="flex justify-end px-2 pb-2">
                  <ConfirmButton label={t('common.delete')} confirmLabel={t('list.deleteConfirm', { name: c.name })}
                    className="text-dim hover:text-bad text-[11px] px-2 py-1"
                    onConfirm={() => del.mutate(c.id, {
                      onSuccess: () => toast.info(t('common.removed', { name: c.name })),
                      onError: e => toast.error(e.message),
                    })}>
                    {t('common.delete')}
                  </ConfirmButton>
                </div>
              </li>
            )
          })}
        </ul>
      </main>
      <ExchangeModal open={exchange} onClose={() => setExchange(false)} />
    </div>
  )
}
