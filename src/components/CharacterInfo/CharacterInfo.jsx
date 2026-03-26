import { useApp } from '../../context/AppContext'
import { getModificador } from '../../services/dnd35Tables'

const ATRIBUTOS = ['for','des','con','int','sab','car']
const LABEL = { for:'FOR', des:'DES', con:'CON', int:'INT', sab:'SAB', car:'CAR' }

export default function CharacterInfo() {
  const { personagemAtivo } = useApp()
  if (!personagemAtivo) return null
  const p = personagemAtivo

  return (
    <div className="panel flex flex-col h-full overflow-y-auto" style={{ minWidth: 0 }}>


      {/* Foto */}
      <div className="relative flex flex-col items-center p-4 gap-3 overflow-hidden rounded-sm mx-3 mt-3"
        style={{ border: '1px solid #37332b82' }}>
        {p.foto_base64 && (
          <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <img src={p.foto_base64} aria-hidden="true"
              className="w-full h-full object-cover"
              style={{ filter: 'blur(2px)', transform: 'scale(1.6)', opacity: 0.55 }} />
            <div className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, rgba(13,9,2,0.3) 0%, rgba(13,9,2,0.55) 100%)' }} />
          </div>
        )}

        <div className="relative w-40 rounded-sm overflow-hidden shrink-0"
          style={{ zIndex: 1, height: '220px', border: '2px solid #6b4a1a', background: '#0d0902' }}>
          {p.foto_base64
            ? <img src={p.foto_base64} alt={p.nome} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-5xl">⚔️</div>
          }
        </div>

        <div className="relative text-center" style={{ zIndex: 1 }}>
          <h3 className="font-medieval text-lg font-bold" style={{ color: '#f0e6c8', letterSpacing: '0.02em' }}>{p.nome}</h3>
          <p className="text-xs mt-1" style={{ color: '#c9a84c' }}>
            {(() => {
              try {
                const mc = p.multiclasses ? JSON.parse(p.multiclasses) : null
                if (mc && mc.length > 1) return mc.map(c => `${c.classe} ${c.nivel}`).join(' / ')
              } catch {}
              return p.classe
            })()}
            {p.dominio ? ` — ${p.dominio}` : ''}
          </p>
        </div>
      </div>

      {/* <div className="divider-gold mx-4" /> */}

      {/* Atributos */}
      <div className="px-4 py-3">
        {/* <p className="label-medieval text-center mb-3 font-semibold">Atributos</p> */}
        <div className="grid grid-cols-3 gap-2">
          {ATRIBUTOS.map(a => {
            const val = Number(p[a]) || 10
            const mod = getModificador(val)
            return (
              <div key={a} className="flex flex-col items-center py-2 px-1 rounded-sm"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid #3a2810' }}>
                <span className="label-medieval text-center" style={{ fontSize: 10, letterSpacing: '0.05em' }}>{LABEL[a]}</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-medieval text-xl font-bold" style={{ color: '#f0e6c8', lineHeight: 1.2 }}>{val}</span>
                  <span className="font-medieval text-xs font-semibold" style={{ color: mod >= 0 ? '#c9a84c' : '#cc4444' }}>
                    {mod >= 0 ? '+' : ''}{mod}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* <div className="divider-gold mx-4" /> */}

      {/* PV e CA */}
      <div className="px-4 pb-3 pt-3 grid grid-cols-2 gap-3">

        {/* PV — Coração */}
        <div className="relative flex flex-col items-center justify-center rounded-sm overflow-hidden"
          style={{ height: '72px', background: 'linear-gradient(160deg, #2a0808 0%, #180303 100%)', border: '1px solid #6b1515' }}>
          {/* Ilustração de fundo */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
            className="absolute" style={{ opacity: 0.06, bottom: -6, right: -4 }}>
            <path d="M32 54 C32 54 8 38 8 22 C8 14 14 8 22 8 C27 8 31 11 32 13 C33 11 37 8 42 8 C50 8 56 14 56 22 C56 38 32 54 32 54Z"
              fill="#cc4444" />
          </svg>
          {/* Brilho sutil */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(204,68,68,0.08) 0%, transparent 70%)' }} />
          {/* Conteúdo */}
          <span className="relative mb-1 z-10" style={{ fontSize: 9, color: '#c36464', letterSpacing: '0.12em' }}>PONTOS DE VIDA (PV)</span>
          <span className="font-medieval font-bold relative z-10" style={{ fontSize: 28, color: '#e8d0d0', lineHeight: 1.15, textShadow: '0 0 8px rgba(204,68,68,0.3)' }}>{p.pv}</span>
        </div>

        {/* CA — Escudo */}
        <div className="relative flex flex-col items-center justify-center rounded-sm overflow-hidden"
          style={{ height: '72px', background: 'linear-gradient(160deg, #080d1a 0%, #030810 100%)', border: '1px solid #1a3a6a' }}>
          {/* Ilustração de fundo */}
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none"
            className="absolute" style={{ opacity: 0.06, bottom: -6, right: -4 }}>
            <path d="M32 6 L54 14 L54 32 C54 46 44 56 32 60 C20 56 10 46 10 32 L10 14 Z"
              fill="#4a90d9" />
            <path d="M32 14 L46 20 L46 32 C46 41 40 49 32 52 C24 49 18 41 18 32 L18 20 Z"
              fill="#4a90d9" />
          </svg>
          {/* Brilho sutil */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(74,144,217,0.08) 0%, transparent 70%)' }} />
          {/* Conteúdo */}
          <span className="font-semibold mb-1 relative z-10" style={{ fontSize: 9, color: '#5a82a9', letterSpacing: '0.12em' }}>CLASSE DE ARMADURA (CA)</span>
          <span className="font-medieval font-bold relative z-10" style={{ fontSize: 28, color: '#ccdff0', lineHeight: 1.15, textShadow: '0 0 8px rgba(74,144,217,0.3)' }}>{p.ca}</span>
        </div>

      </div>

      <div className="divider-gold mx-4" />

      {/* Info básica */}
      <div className="px-4 py-2 flex flex-col gap-2 text-xs">
        <div className="flex gap-2 w-full">
          {p.raca && <Row label="Raça" className="w-full" val={p.raca} />}
          {p.level && <Row label="Nível" className="w-full" val={p.level} />}
        </div>
        <div className="flex gap-2 w-full">
          {p.divindade && <Row label="Divindade" className="w-full" val={p.divindade} />}
          {p.idade && <Row label="Idade" className="w-full" val={p.idade} />}
        </div>
        <div className="flex gap-2 w-full">
          {p.tamanho && <Row label="Tamanho" className="w-full" val={p.tamanho} />}
          {p.deslocamento && <Row label="Desloc." className="w-full" val={`${p.deslocamento}m`} />}
        </div>
        <div className="flex gap-2 w-full">
          {p.tendencia && <Row label="Tendência" className="w-full" val={p.tendencia} />}
          {p.falha && <Row label="Falha" className="w-full" val={p.falha} />}
        </div>
      </div>

      {/* <div className="divider-gold mx-4" /> */}

      {/* Personalidade */}
      <div className="px-4 py-2 flex flex-col gap-2 text-xs pb-4">
        {p.personalidade && (
          <div>
            <span className="label-medieval block mb-1">Personalidade</span>
            <p style={{ color: '#9b8a6a', lineHeight: '1.5' }}>{p.personalidade}</p>
          </div>
        )}
      </div>


    </div>
  )
}

function Row({ label, val }) {
  return (
    <div className="flex gap-2 items-baseline w-full">
      <span className="font-medieval shrink-0" style={{ color: '#c9a84c', fontSize: 11, letterSpacing: '0.03em' }}>{label}</span>
      <span style={{ color: '#c0a882', fontSize: 11 }}>{val}</span>
    </div>
  )
}
