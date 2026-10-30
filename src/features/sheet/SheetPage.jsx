import { useState, lazy, Suspense } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLang } from '../../i18n'
import { useSheet } from '../../hooks/useSheet'
import { AppHeader } from '../shell/AppHeader'
import { ExchangeModal } from '../shell/ExchangeModal'
import { Tabs } from '../../ui/Tabs'
import { Button } from '../../ui/Button'
import { Icon } from '../../ui/Icon'
import { EmptyState, Loading } from '../../ui/layout'
import { Sidebar } from './Sidebar'
import CoreTab from '../core/CoreTab'
import SkillsTab from '../skills/SkillsTab'
import FeatsTab from '../feats/FeatsTab'
import SpellsTab from '../spells/SpellsTab'
import InventoryTab from '../inventory/InventoryTab'
import SummonsTab from '../summons/SummonsTab'

// O Diário carrega o editor TipTap (~metade do bundle): só baixa quando a aba é aberta
const JournalTab = lazy(() => import('../journal/JournalTab'))

const TABS = { core: CoreTab, skills: SkillsTab, feats: FeatsTab, spells: SpellsTab, inventory: InventoryTab, summons: SummonsTab, journal: JournalTab }

export default function SheetPage() {
  const { id, tab = 'core' } = useParams()
  const navigate = useNavigate()
  const { t } = useLang()
  const ctx = useSheet(id)
  const [exchange, setExchange] = useState(false)
  const Active = TABS[tab] ?? CoreTab

  const header = (
    <AppHeader actions={ctx.ch && <Button size="sm" onClick={() => setExchange(true)}><Icon name="files" size={14} />{t('sheet.files')}</Button>}>
      <Link to="/" className="inline-flex items-center gap-1 text-muted hover:text-gold text-xs no-underline shrink-0">
        <Icon name="chevronRight" size={14} className="rotate-180" />{t('sheet.switch')}
      </Link>
      {ctx.ch && <><span className="w-px h-4 bg-[var(--color-wood-border)]" aria-hidden /><h1 className="font-display text-parchment text-sm m-0 truncate">{ctx.ch.name}</h1></>}
    </AppHeader>
  )

  if (ctx.isLoading) return <div className="flex flex-col h-screen">{header}<Loading label={t('common.loading')} /></div>
  if (ctx.error || !ctx.ch) {
    return (
      <div className="flex flex-col h-screen">{header}
        <EmptyState title={ctx.error?.status === 404 ? t('errors.notFound') : t('errors.loadSheet')} hint={ctx.error?.message}
          action={<div className="flex gap-2"><Button onClick={() => ctx.refetch()}>{t('common.retry')}</Button><Button onClick={() => navigate('/')}>{t('common.back')}</Button></div>} />
      </div>
    )
  }

  const tabs = [
    { id: 'core', label: t('sheet.tabs.core') },
    { id: 'skills', label: t('sheet.tabs.skills') },
    { id: 'feats', label: t('sheet.tabs.feats'), badge: ctx.ch.feats.length || null },
    { id: 'spells', label: t('sheet.tabs.spells'), badge: ctx.ch.spells.length || null },
    { id: 'inventory', label: t('sheet.tabs.inventory'), badge: ctx.ch.items.length || null },
    { id: 'summons', label: t('sheet.tabs.summons'), badge: ctx.ch.summons.length || null },
    { id: 'journal', label: t('sheet.tabs.journal') },
  ]

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {header}
      <div className="flex-1 min-h-0 flex">
        <Sidebar {...ctx} />
        <main className="flex-1 min-w-0 flex flex-col">
          <Tabs tabs={tabs} active={tab} onChange={next => navigate(`/personagem/${id}/${next}`)} label={ctx.ch.name} idPrefix="sheet"
            className="px-4 pt-2 border-b border-subtle shrink-0 bg-[var(--color-wood-darkest)]" />
          <div role="tabpanel" id="sheet-panel" aria-labelledby={`sheet-tab-${tab}`} className="flex-1 min-h-0 overflow-y-auto p-4 xl:p-5">
            <Suspense fallback={<Loading label={t('common.loading')} />}>
              <Active {...ctx} />
            </Suspense>
          </div>
        </main>
      </div>
      <ExchangeModal open={exchange} onClose={() => setExchange(false)} characterId={ctx.ch.id} />
    </div>
  )
}
