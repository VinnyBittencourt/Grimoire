import { AbilitiesPanel } from './AbilitiesPanel'
import { DefensePanel } from './DefensePanel'
import { CombatPanel } from './CombatPanel'
import { AttacksPanel } from './AttacksPanel'
import { IdentityPanel } from './IdentityPanel'
import { ClassesPanel } from './ClassesPanel'

export default function CoreTab(props) {
  return (
    <div className="grid gap-4 xl:grid-cols-2 items-start">
      <div className="flex flex-col gap-4">
        <AbilitiesPanel {...props} />
        <CombatPanel {...props} />
        <AttacksPanel {...props} />
      </div>
      <div className="flex flex-col gap-4">
        <DefensePanel {...props} />
        <ClassesPanel {...props} />
        <IdentityPanel {...props} />
      </div>
    </div>
  )
}
