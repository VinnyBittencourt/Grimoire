import { useSearchParams } from 'react-router-dom'
import { useLang } from '../../i18n'
import { useJournal } from '../../queries/characters'
import { Tabs } from '../../ui/Tabs'
import { Loading, Section, EmptyState } from '../../ui/layout'
import { Button } from '../../ui/Button'
import { RichText } from '../../ui/RichText'
import { NotesPanel } from './NotesPanel'
import { ListDetail } from './ListDetail'
import { NpcDetail, PlaceDetail, QuestDetail, PlayerDetail } from './details'

const SUBTABS = ['notes', 'background', 'players', 'npcs', 'places', 'quests']

// Sub-aba e item selecionado ficam na URL (?sub=&sel=): trocar de aba e voltar não perde o lugar,
// e NPC/Local/Missão podem apontar uns para os outros
export default function JournalTab({ ch, actions }) {
  const { t } = useLang()
  const journal = useJournal(ch.id)
  const [params, setParams] = useSearchParams()
  const sub = SUBTABS.includes(params.get('sub')) ? params.get('sub') : 'notes'
  const sel = params.get('sel') ? Number(params.get('sel')) : null
  const go = (nextSub, id = null) => setParams(id ? { sub: nextSub, sel: String(id) } : { sub: nextSub }, { replace: true })

  if (journal.error) {
    return (
      <EmptyState icon="warning" className="panel py-16" title={t('errors.loadJournal')} hint={journal.error.message}
        action={<Button onClick={() => journal.refetch()}>{t('common.retry')}</Button>} />
    )
  }
  if (journal.isLoading || !journal.data) return <Loading label={t('common.loading')} />
  const data = journal.data
  const common = { data, actions, selectedId: sel, onSelect: id => go(sub, id), onNavigate: go }

  return (
    <div className="flex flex-col gap-3 h-full min-h-[600px]">
      <Tabs size="sm" active={sub} onChange={id => go(id)} label={t('sheet.tabs.journal')} idPrefix="journal"
        tabs={SUBTABS.map(id => ({ id, label: t(`journal.${id}`), badge: Array.isArray(data[id]) ? data[id].length || null : null }))} />
      <div className="flex-1 min-h-0" role="tabpanel" id="journal-panel" aria-labelledby={`journal-tab-${sub}`}>
        {sub === 'background' && (
          <Section title={t('journal.background')} className="h-full" bodyClassName="flex-1 flex flex-col min-h-0">
            <RichText className="flex-1" docKey="background" value={data.background} placeholder={t('journal.backgroundPlaceholder')}
              onSave={html => actions.patchCharacter({ background: html })} />
          </Section>
        )}
        {sub === 'notes' && <NotesPanel {...common} />}
        {sub === 'players' && <ListDetail {...common} collection="players" newLabel={t('journal.newPlayerShort')} Detail={PlayerDetail} icon="users"
          emptyTitle={t('journal.emptyPlayers')} subtitle={p => [p.class, p.race].filter(Boolean).join(' · ')} />}
        {sub === 'npcs' && <ListDetail {...common} collection="npcs" newLabel={t('journal.newNpcShort')} Detail={NpcDetail} icon="user"
          emptyTitle={t('journal.emptyNpcs')} emptyHint={t('journal.emptyNpcsHint')} subtitle={n => n.occupation} searchFields={n => [n.occupation]} />}
        {sub === 'places' && <ListDetail {...common} collection="places" newLabel={t('journal.newPlaceShort')} Detail={PlaceDetail} icon="map"
          emptyTitle={t('journal.emptyPlaces')} />}
        {sub === 'quests' && <ListDetail {...common} collection="quests" newLabel={t('journal.newQuestShort')} Detail={QuestDetail} icon="flag"
          emptyTitle={t('journal.emptyQuests')} subtitle={q => `${t(`journal.${q.kind}`)} · ${t(`journal.${q.status}`)}`} />}
      </div>
    </div>
  )
}
