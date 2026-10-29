import { useState } from 'react'
import { useLang } from '../../i18n'
import { useJournal } from '../../queries/characters'
import { Tabs } from '../../ui/Tabs'
import { Loading, Section } from '../../ui/layout'
import { RichText } from '../../ui/RichText'
import { NotesPanel } from './NotesPanel'
import { ListDetail } from './ListDetail'
import { NpcDetail, PlaceDetail, QuestDetail, PlayerDetail } from './details'

const SUBTABS = ['notes', 'background', 'players', 'npcs', 'places', 'quests']

export default function JournalTab({ ch, actions }) {
  const { t } = useLang()
  const journal = useJournal(ch.id)
  const [tab, setTab] = useState('notes')
  if (journal.isLoading || !journal.data) return <Loading label={t('common.loading')} />
  const data = journal.data
  const common = { data, actions }

  return (
    <div className="flex flex-col gap-3 h-full min-h-[600px]">
      <Tabs size="sm" active={tab} onChange={setTab} label={t('sheet.tabs.journal')}
        tabs={SUBTABS.map(id => ({ id, label: t(`journal.${id}`), badge: Array.isArray(data[id]) ? data[id].length || null : null }))} />
      <div className="flex-1 min-h-0">
        {tab === 'background' && (
          <Section title={t('journal.background')} className="h-full" bodyClassName="flex-1 flex flex-col min-h-0">
            <RichText className="flex-1" docKey="background" value={data.background} placeholder={t('journal.backgroundPlaceholder')}
              onSave={html => actions.patchCharacter({ background: html })} />
          </Section>
        )}
        {tab === 'notes' && <NotesPanel {...common} />}
        {tab === 'players' && <ListDetail {...common} collection="players" newLabel={t('journal.newPlayer')} Detail={PlayerDetail}
          subtitle={p => [p.class, p.race].filter(Boolean).join(' · ')} />}
        {tab === 'npcs' && <ListDetail {...common} collection="npcs" newLabel={t('journal.newNpc')} Detail={NpcDetail}
          subtitle={n => n.occupation} />}
        {tab === 'places' && <ListDetail {...common} collection="places" newLabel={t('journal.newPlace')} Detail={PlaceDetail} />}
        {tab === 'quests' && <ListDetail {...common} collection="quests" newLabel={t('journal.newQuest')} Detail={QuestDetail}
          subtitle={q => `${t(`journal.${q.kind}`)} · ${t(`journal.${q.status}`)}`} />}
      </div>
    </div>
  )
}
