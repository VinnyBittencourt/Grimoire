import { useState } from 'react'
import { useLang } from '../../i18n'
import { EmptyState } from '../../ui/layout'
import { CasterBlock } from './CasterBlock'
import { SpellbookPanel } from './SpellbookPanel'
import { SummonModal } from '../summons/SummonModal'
import { classDef } from '../../../shared/rules/progression.js'

export default function SpellsTab(props) {
  const { ch, sheet } = props
  const { t } = useLang()
  const [summon, setSummon] = useState(null) // { level, preparedId? }

  if (!sheet.casting.length) return <EmptyState icon="wand" title={t('spells.noCaster')} hint={t('spells.noCasterHint')} className="panel py-16" />

  const firstCaster = ch.classes.find(c => classDef(c).caster)

  return (
    <div className="flex flex-col gap-4">
      {sheet.casting.map(cast => (
        <div key={cast.rowId} className="grid gap-4 2xl:grid-cols-[1.4fr_1fr] items-start">
          <CasterBlock {...props} cast={cast} onSummon={setSummon} />
          <SpellbookPanel {...props} cast={cast} isFirst={cast.rowId === firstCaster?.id} />
        </div>
      ))}
      <SummonModal open={Boolean(summon)} level={summon?.level} maxLevel={summon?.level} onClose={() => setSummon(null)} {...props}
        onSummoned={() => { if (summon?.preparedId) props.actions.update('prepared', summon.preparedId, { used: true }) }} />
    </div>
  )
}
