import { useState } from 'react'
import SessionNotesModal from '../modals/SessionNotesModal'
import { useLang } from '../../context/LangContext'

export default function SectionNotes() {
  const [modalAberto, setModalAberto] = useState(null)
  const { t } = useLang()

  const TABS = [
    { key: 'background', label: t('notes', 'background') },
    { key: 'players', label: t('notes', 'players') },
    { key: 'npcs', label: t('notes', 'npcs') },
    { key: 'locais', label: t('notes', 'locations') },
    { key: 'quests', label: t('notes', 'quests') },
    { key: 'anotacoes', label: t('notes', 'notes') },
  ]

  return (
    <>
      <div className="panel flex flex-col" style={{ minWidth: 0 }}>
        <div className="px-4 pt-2 pb-2 shrink-0" style={{ borderBottom: '1px solid #6b4a1a' }}>
          <h3 className="font-medieval font-semibold text-sm" style={{ color: '#c9a84c' }}>{t('notes', 'title')}</h3>
        </div>

        <div className="flex flex-wrap gap-1 p-2">
          {TABS.map(tab => (
            <button key={tab.key} className="tab-btn active px-8 flex-1 text-md" style={{ fontSize: '0.75rem', fontWeight: '500'}}
              onClick={() => setModalAberto(tab.key)}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* <div className="px-4 py-3 text-xs text-center" style={{ color: '#6b5a3a' }}>
          Clique em uma aba para abrir
        </div> */}
      </div>

      {modalAberto && (
        <SessionNotesModal
          abaInicial={modalAberto}
          onClose={() => setModalAberto(null)}
        />
      )}
    </>
  )
}
