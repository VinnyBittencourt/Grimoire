import { AbilitiesPanel } from './AbilitiesPanel'
import { DefensePanel } from './DefensePanel'
import { CombatPanel } from './CombatPanel'
import { AttacksPanel } from './AttacksPanel'
import { IdentityPanel } from './IdentityPanel'
import { ClassesPanel } from './ClassesPanel'

// Aba Principal: regras em modo leitura (equações) com [Editar] por seção; ataques e identidade em largura total
export default function CoreTab(props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-2 items-start">
        <div className="flex flex-col gap-4">
          <AbilitiesPanel {...props} />
          <CombatPanel {...props} />
        </div>
        <div className="flex flex-col gap-4">
          <DefensePanel {...props} />
          <ClassesPanel {...props} />
        </div>
      </div>
      <AttacksPanel {...props} />
      <IdentityPanel {...props} />
    </div>
  )
}
