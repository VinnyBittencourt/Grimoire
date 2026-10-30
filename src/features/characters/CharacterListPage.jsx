import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../../i18n'
import { useCharacters, useDeleteCharacter, useRefData } from '../../queries/characters'
import { AppHeader } from '../shell/AppHeader'
import { ExchangeModal } from '../shell/ExchangeModal'
import { Button } from '../../ui/Button'
import { ConfirmDialog } from '../../ui/Modal'
import { Menu } from '../../ui/controls'
import { Icon } from '../../ui/Icon'
import { EmptyState, Loading } from '../../ui/layout'
import { useToast } from '../../ui/Toast'
import { photoUrl, downloadJson } from '../../api/client'
import { characterLevel } from '../../../shared/rules/progression.js'

export default function CharacterListPage() {
  const { t, className, relativeTime } = useLang()
  const { data, isLoading, error, refetch } = useCharacters()
  const races = useRefData('ref_racas')
  const del = useDeleteCharacter()
  const toast = useToast()
  const navigate = useNavigate()
  const [exchange, setExchange] = useState(false)
  const [removing, setRemoving] = useState(null)
  const raceName = c => (c.race_id ? races.data?.find(r => r.id === c.race_id)?.nome : c.race_name) ?? null

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader actions={<Button size="sm" onClick={() => setExchange(true)}><Icon name="upload" size={14} />{t('list.import')}</Button>} />
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-gold text-2xl tracking-wide m-0">{t('list.title')}</h1>
            <p className="caption mt-1 mb-0">{t('app.tagline')}</p>
          </div>
          <Button variant="gold" onClick={() => navigate('/personagem/novo')}><Icon name="plus" size={16} />{t('list.new')}</Button>
        </div>

        {isLoading && <Loading label={t('common.loading')} />}
        {error && (
          <EmptyState icon="warning" title={error.message} action={<Button onClick={() => refetch()}>{t('common.retry')}</Button>} />
        )}
        {data && data.length === 0 && (
          <div className="panel"><EmptyState icon="shield" title={t('list.empty')} hint={t('list.emptyHint')} className="py-16"
            action={<div className="flex gap-2 mt-2"><Button variant="gold" onClick={() => navigate('/personagem/novo')}>{t('list.new')}</Button>
              <Button onClick={() => setExchange(true)}>{t('list.import')}</Button></div>} /></div>
        )}

        <ul className="grid gap-5 grid-cols-[repeat(auto-fill,minmax(230px,1fr))] list-none p-0 m-0">
          {data?.map(c => {
            const level = characterLevel(c.classes)
            const meta = [raceName(c), t('list.level', { n: level })].filter(Boolean).join(' · ')
            return (
              <li key={c.id} className="panel group overflow-hidden flex flex-col hover:border-gold-lo transition-colors">
                <Link to={`/personagem/${c.id}`} className="flex flex-col no-underline focus-visible:!shadow-none">
                  <div className="h-48 bg-sunken flex items-center justify-center overflow-hidden border-b border-subtle">
                    {c.photo
                      ? <img src={photoUrl(c.photo)} alt="" className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform" />
                      : <span className="font-display text-5xl text-gold-lo" aria-hidden>{(c.name || '?').trim().charAt(0).toUpperCase()}</span>}
                  </div>
                  <div className="px-4 pt-3 pb-1">
                    <h2 className="font-display text-parchment text-base m-0 truncate group-hover:text-gold transition-colors">{c.name || '—'}</h2>
                    <p className="text-gold text-xs mt-1 mb-0 truncate">{c.classes.map(k => `${className(k)} ${k.level}`).join(' / ') || '—'}</p>
                    <p className="caption mt-0.5 mb-0 truncate">{meta}</p>
                  </div>
                </Link>
                <div className="flex items-center justify-between gap-2 pl-4 pr-2 pb-2 mt-auto">
                  <span className="caption truncate" title={c.updated_at}>{t('list.updated', { date: relativeTime(c.updated_at) })}</span>
                  <Menu label={t('list.cardMenu', { name: c.name })} size="sm" items={[
                    { label: t('common.open'), icon: 'book', onSelect: () => navigate(`/personagem/${c.id}`) },
                    { label: t('list.exportGrimoire'), icon: 'download', onSelect: () => downloadJson(`/api/characters/${c.id}/export`).catch(e => toast.error(e.message)) },
                    { label: t('list.deleteEllipsis'), icon: 'trash', tone: 'danger', onSelect: () => setRemoving(c) },
                  ]} />
                </div>
              </li>
            )
          })}
        </ul>
      </main>
      <ExchangeModal open={exchange} onClose={() => setExchange(false)} />
      <ConfirmDialog open={Boolean(removing)} title={removing ? t('list.deleteTitle', { name: removing.name }) : ''} confirmLabel={t('list.deleteForever')}
        busy={del.isPending} onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const c = removing
          del.mutate(c.id, {
            onSuccess: () => { setRemoving(null); toast.info(t('common.removed', { name: c.name })) },
            onError: e => toast.error(e.message),
          })
        }}>
        {t('list.deleteBody')}
      </ConfirmDialog>
    </div>
  )
}
