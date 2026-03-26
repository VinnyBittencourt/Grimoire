// Ícones SVG por escola de magia D&D 3.5

export const EscolaIcon = ({ escola, size = 36 }) => {
  const icons = {

    // ──────────────────────────────────────────────
    // ABJURAÇÃO — Escudo protetor com selo arcano
    // ──────────────────────────────────────────────
    'Abjuração': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="abj-glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#6ab0ff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#1a3a6a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="abj-shield" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ec8e3" />
            <stop offset="100%" stopColor="#2a6fad" />
          </linearGradient>
        </defs>
        {/* Glow de fundo */}
        <ellipse cx="18" cy="19" rx="13" ry="13" fill="url(#abj-glow)" />
        {/* Escudo principal */}
        <path d="M18 4 L30 9 L30 19 C30 26 24 31 18 33 C12 31 6 26 6 19 L6 9 Z"
          stroke="url(#abj-shield)" strokeWidth="1.8" fill="rgba(74,144,217,0.12)" />
        {/* Escudo interno */}
        <path d="M18 9 L25 12.5 L25 19 C25 23.5 22 27 18 28.5 C14 27 11 23.5 11 19 L11 12.5 Z"
          stroke="#4a90d9" strokeWidth="1" fill="rgba(74,144,217,0.08)" strokeOpacity="0.6" />
        {/* Cruz central dourada */}
        <line x1="18" y1="12" x2="18" y2="25" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="12" y1="18" x2="24" y2="18" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round" />
        {/* Pontos decorativos */}
        <circle cx="18" cy="12" r="1.2" fill="#c9a84c" />
        <circle cx="18" cy="25" r="1.2" fill="#c9a84c" />
        <circle cx="12" cy="18" r="1.2" fill="#c9a84c" />
        <circle cx="24" cy="18" r="1.2" fill="#c9a84c" />
        <circle cx="18" cy="18" r="2" fill="#4a90d9" opacity="0.7" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // ADIVINHAÇÃO — Olho que tudo vê
    // ──────────────────────────────────────────────
    'Adivinhação': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="adv-iris" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#cc88ff" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#8833cc" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#4a0080" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="adv-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#9b59b6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3d1260" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Glow */}
        <ellipse cx="18" cy="18" rx="14" ry="14" fill="url(#adv-glow)" />
        {/* Raios externos dourados */}
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const r = 3.14159/180
          const x1 = 18 + Math.cos(deg*r)*11
          const y1 = 18 + Math.sin(deg*r)*11
          const x2 = 18 + Math.cos(deg*r)*14
          const y2 = 18 + Math.sin(deg*r)*14
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#c9a84c" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        })}
        {/* Pálpebras */}
        <path d="M5 18 Q18 8 31 18 Q18 28 5 18 Z"
          stroke="#9b59b6" strokeWidth="1.5" fill="rgba(155,89,182,0.1)" />
        {/* Íris */}
        <circle cx="18" cy="18" r="7" fill="url(#adv-iris)" />
        {/* Íris detalhe */}
        <circle cx="18" cy="18" r="5" stroke="#c9a84c" strokeWidth="0.8" fill="none" opacity="0.5" />
        {/* Pupila */}
        <ellipse cx="18" cy="18" rx="2.5" ry="3.5" fill="#1a0030" />
        {/* Brilho */}
        <circle cx="16.5" cy="16.5" r="1" fill="white" opacity="0.7" />
        {/* Cílios dourados */}
        <path d="M5 18 Q18 8 31 18" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.4" />
        <path d="M5 18 Q18 28 31 18" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.4" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // CONJURAÇÃO — Portal de invocação pentagramático
    // ──────────────────────────────────────────────
    'Conjuração': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="conj-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#27ae60" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0d3320" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="18" rx="14" ry="14" fill="url(#conj-glow)" />
        {/* Círculo externo */}
        <circle cx="18" cy="18" r="13" stroke="#c9a84c" strokeWidth="1.2" fill="none" opacity="0.5" />
        {/* Círculo interno */}
        <circle cx="18" cy="18" r="10" stroke="#27ae60" strokeWidth="1" fill="rgba(39,174,96,0.08)" />
        {/* Pentagrama */}
        {(() => {
          const pts = Array.from({length:5}, (_,i) => {
            const a = (i * 4 * Math.PI / 5) - Math.PI/2
            return [18 + 8*Math.cos(a), 18 + 8*Math.sin(a)]
          })
          const d = pts.map((p,i) => `${i===0?'M':'L'}${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ') + ' Z'
          return <path d={d} stroke="#27ae60" strokeWidth="1.4" fill="rgba(39,174,96,0.15)" strokeLinejoin="round" />
        })()}
        {/* Pontos do pentagrama */}
        {Array.from({length:5}, (_,i) => {
          const a = (i * 4 * Math.PI / 5) - Math.PI/2
          return <circle key={i} cx={18 + 8*Math.cos(a)} cy={18 + 8*Math.sin(a)} r="1.5" fill="#c9a84c" />
        })}
        {/* Centro */}
        <circle cx="18" cy="18" r="2.5" fill="#27ae60" opacity="0.8" />
        <circle cx="18" cy="18" r="1" fill="#c9a84c" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // ENCANTAMENTO — Espiral de charme com coração
    // ──────────────────────────────────────────────
    'Encantamento': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="enc-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ff69b4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#5a0030" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="18" rx="14" ry="14" fill="url(#enc-glow)" />
        {/* Espiral externa */}
        <path d="M18 5 C28 5 31 10 31 18 C31 26 26 31 18 31 C10 31 7 26 7 18 C7 12 10 9 14 9 C18 9 20 12 20 15 C20 18 18 20 16 19"
          stroke="#e91e8c" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
        {/* Coração central */}
        <path d="M18 23 C18 23 12 19 12 15 C12 12.5 14 11 16 11 C17 11 18 12 18 12 C18 12 19 11 20 11 C22 11 24 12.5 24 15 C24 19 18 23 18 23Z"
          stroke="#c9a84c" strokeWidth="1.2" fill="rgba(233,30,140,0.25)" />
        {/* Brilhos dourados */}
        <circle cx="14" cy="9" r="1.2" fill="#c9a84c" opacity="0.8" />
        <circle cx="27" cy="13" r="1" fill="#c9a84c" opacity="0.6" />
        <circle cx="10" cy="22" r="1" fill="#c9a84c" opacity="0.6" />
        <circle cx="18" cy="15.5" r="1.5" fill="#e91e8c" opacity="0.7" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // EVOCAÇÃO — Estrela de energia explosiva
    // ──────────────────────────────────────────────
    'Evocação': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="evo-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffdd66" stopOpacity="1" />
            <stop offset="40%" stopColor="#ff8800" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#cc2200" stopOpacity="0.5" />
          </radialGradient>
          <radialGradient id="evo-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#e74c3c" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4a0000" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="18" rx="14" ry="14" fill="url(#evo-glow)" />
        {/* Raios da estrela — camada exterior fina */}
        <path d="M18 2 L19.8 13 L30 8 L22 17 L34 18 L22 19 L30 28 L19.8 23 L18 34 L16.2 23 L6 28 L14 19 L2 18 L14 17 L6 8 L16.2 13 Z"
          stroke="#c9a84c" strokeWidth="0.8" fill="rgba(201,168,76,0.12)" opacity="0.7" />
        {/* Estrela principal */}
        <path d="M18 5 L20.5 14.5 L30 14.5 L22.5 20 L25 29.5 L18 24 L11 29.5 L13.5 20 L6 14.5 L15.5 14.5 Z"
          stroke="url(#evo-core)" strokeWidth="1.5" fill="rgba(231,76,60,0.2)" />
        {/* Núcleo brilhante */}
        <circle cx="18" cy="18" r="4.5" fill="url(#evo-core)" opacity="0.9" />
        <circle cx="18" cy="18" r="2" fill="#ffeeaa" opacity="0.9" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // ILUSÃO — Diamante espelhado com facetas
    // ──────────────────────────────────────────────
    'Ilusão': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="ilu-facet1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5fffee" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#16a085" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="ilu-facet2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#16a085" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0a4a3a" stopOpacity="0.1" />
          </linearGradient>
          <radialGradient id="ilu-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#1abc9c" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#042a22" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="18" rx="14" ry="14" fill="url(#ilu-glow)" />
        {/* Diamante — faceta superior esquerda */}
        <path d="M18 4 L8 16 L18 22 Z" fill="url(#ilu-facet1)" stroke="#16a085" strokeWidth="0.8" />
        {/* Faceta superior direita */}
        <path d="M18 4 L28 16 L18 22 Z" fill="url(#ilu-facet2)" stroke="#16a085" strokeWidth="0.8" />
        {/* Faceta inferior esquerda */}
        <path d="M8 16 L18 22 L18 32 Z" fill="url(#ilu-facet2)" stroke="#16a085" strokeWidth="0.8" />
        {/* Faceta inferior direita */}
        <path d="M28 16 L18 22 L18 32 Z" fill="url(#ilu-facet1)" stroke="#16a085" strokeWidth="0.8" />
        {/* Linha da cintura */}
        <line x1="8" y1="16" x2="28" y2="16" stroke="#c9a84c" strokeWidth="1" opacity="0.7" />
        {/* Outline completo */}
        <path d="M18 4 L28 16 L18 32 L8 16 Z" stroke="#c9a84c" strokeWidth="1.4" fill="none" />
        {/* Reflexo brilhante */}
        <path d="M13 10 L17 15 L12 15 Z" fill="white" opacity="0.25" />
        <circle cx="18" cy="18" r="1.2" fill="#c9a84c" opacity="0.8" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // NECROMANCIA — Crânio ornamentado
    // ──────────────────────────────────────────────
    'Necromancia': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="nec-glow" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#9b59b6" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#1a0030" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="nec-skull" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#d4b896" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#2a1a0a" stopOpacity="0.1" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="17" rx="13" ry="13" fill="url(#nec-glow)" />
        {/* Aura decorativa */}
        <circle cx="18" cy="17" r="13" stroke="#8e44ad" strokeWidth="0.8" fill="none" strokeDasharray="2.5 2" opacity="0.5" />
        {/* Crânio — cabeça */}
        <path d="M10 17 C10 10 14 6 18 6 C22 6 26 10 26 17 C26 20 24.5 22 23 23 L23 26 C23 27 22 28 21 28 L15 28 C14 28 13 27 13 26 L13 23 C11.5 22 10 20 10 17 Z"
          stroke="#c9a84c" strokeWidth="1.4" fill="url(#nec-skull)" />
        {/* Órbitas dos olhos */}
        <ellipse cx="14.5" cy="16" rx="2.5" ry="2.8" fill="#1a0030" stroke="#8e44ad" strokeWidth="0.8" />
        <ellipse cx="21.5" cy="16" rx="2.5" ry="2.8" fill="#1a0030" stroke="#8e44ad" strokeWidth="0.8" />
        {/* Brilho nos olhos */}
        <circle cx="14" cy="15" r="0.8" fill="#9b59b6" opacity="0.9" />
        <circle cx="21" cy="15" r="0.8" fill="#9b59b6" opacity="0.9" />
        {/* Nariz */}
        <path d="M17 19.5 L18 21.5 L19 19.5" stroke="#8e44ad" strokeWidth="0.8" fill="none" />
        {/* Maxilar — dentes */}
        <line x1="13" y1="26" x2="23" y2="26" stroke="#c9a84c" strokeWidth="0.8" opacity="0.7" />
        <line x1="15" y1="24" x2="15" y2="27.5" stroke="#c9a84c" strokeWidth="0.8" opacity="0.6" />
        <line x1="18" y1="24" x2="18" y2="27.5" stroke="#c9a84c" strokeWidth="0.8" opacity="0.6" />
        <line x1="21" y1="24" x2="21" y2="27.5" stroke="#c9a84c" strokeWidth="0.8" opacity="0.6" />
        {/* Runas laterais */}
        <line x1="6" y1="12" x2="9" y2="12" stroke="#8e44ad" strokeWidth="1" opacity="0.5" />
        <line x1="7.5" y1="10" x2="7.5" y2="14" stroke="#8e44ad" strokeWidth="1" opacity="0.5" />
        <line x1="27" y1="12" x2="30" y2="12" stroke="#8e44ad" strokeWidth="1" opacity="0.5" />
        <line x1="28.5" y1="10" x2="28.5" y2="14" stroke="#8e44ad" strokeWidth="1" opacity="0.5" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // TRANSMUTAÇÃO — Frasco alquímico em transformação
    // ──────────────────────────────────────────────
    'Transmutação': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="tra-liquid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffcc44" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#f39c12" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#a85800" stopOpacity="0.6" />
          </linearGradient>
          <radialGradient id="tra-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#f39c12" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3a1a00" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="18" rx="14" ry="14" fill="url(#tra-glow)" />
        {/* Frasco — gargalo */}
        <path d="M14 4 L14 10 L9 18 L9 28 C9 29.5 10 31 11.5 31 L24.5 31 C26 31 27 29.5 27 28 L27 18 L22 10 L22 4 Z"
          stroke="#c9a84c" strokeWidth="1.5" fill="rgba(243,156,18,0.08)" />
        {/* Tampa do frasco */}
        <rect x="13" y="3" width="10" height="3" rx="1"
          stroke="#c9a84c" strokeWidth="1.2" fill="rgba(201,168,76,0.3)" />
        {/* Líquido */}
        <path d="M9 23 L9 28 C9 29.5 10 31 11.5 31 L24.5 31 C26 31 27 29.5 27 28 L27 23 Z"
          fill="url(#tra-liquid)" opacity="0.85" />
        {/* Ondulação do líquido */}
        <path d="M9 23 Q13.5 21 18 23 Q22.5 25 27 23" stroke="#ffdd66" strokeWidth="1" fill="none" opacity="0.8" />
        {/* Bolhas */}
        <circle cx="14" cy="25.5" r="1.2" fill="#ffdd66" opacity="0.6" />
        <circle cx="20" cy="27" r="0.9" fill="#ffdd66" opacity="0.5" />
        {/* Setas de transformação */}
        <path d="M4 10 Q4 7 7 7 Q10 7 10 10" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M9 8 L10 10 L11 8" stroke="#c9a84c" strokeWidth="1" fill="none" strokeLinejoin="round" />
        <path d="M32 26 Q32 29 29 29 Q26 29 26 26" stroke="#f39c12" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        <path d="M27 28 L26 26 L25 28" stroke="#f39c12" strokeWidth="1" fill="none" strokeLinejoin="round" />
        {/* Brilho no frasco */}
        <path d="M11 16 Q11.5 14 12 16" stroke="white" strokeWidth="0.8" fill="none" opacity="0.4" />
      </svg>
    ),

    // ──────────────────────────────────────────────
    // UNIVERSAL — Círculo arcano com estrela de 8 pontas
    // ──────────────────────────────────────────────
    'Universal': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="uni-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#f0d070" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3a2200" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="uni-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffe066" stopOpacity="1" />
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.6" />
          </radialGradient>
        </defs>
        <ellipse cx="18" cy="18" rx="14" ry="14" fill="url(#uni-glow)" />
        {/* Anel externo */}
        <circle cx="18" cy="18" r="13.5" stroke="#c9a84c" strokeWidth="1" fill="none" opacity="0.4" />
        {/* Anel médio ornamentado */}
        <circle cx="18" cy="18" r="11" stroke="#8b6914" strokeWidth="0.8" fill="none" strokeDasharray="3 1.5" />
        {/* Estrela de 8 pontas */}
        <path d="M18 5 L19.7 14.5 L28 10 L21.5 17.5 L32 18 L21.5 18.5 L28 26 L19.7 21.5 L18 31 L16.3 21.5 L8 26 L14.5 18.5 L4 18 L14.5 17.5 L8 10 L16.3 14.5 Z"
          stroke="#c9a84c" strokeWidth="1.2" fill="rgba(201,168,76,0.15)" />
        {/* Círculo interior */}
        <circle cx="18" cy="18" r="5" stroke="#c9a84c" strokeWidth="1" fill="rgba(201,168,76,0.1)" />
        {/* Centro radiante */}
        <circle cx="18" cy="18" r="3" fill="url(#uni-center)" />
        <circle cx="18" cy="18" r="1.2" fill="#fff8d0" opacity="0.9" />
        {/* Micro ornamentos nos eixos */}
        {[0,45,90,135,180,225,270,315].map((deg, i) => {
          const r = 3.14159/180
          const x = 18 + Math.cos(deg*r)*11
          const y = 18 + Math.sin(deg*r)*11
          return <circle key={i} cx={x} cy={y} r="0.9" fill="#c9a84c" opacity="0.7" />
        })}
      </svg>
    ),

    // ──────────────────────────────────────────────
    // NORMAL — Espada cruzada simples
    // ──────────────────────────────────────────────
    'Normal': (
      <svg width={size} height={size} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="nor-blade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e0d0a0" />
            <stop offset="100%" stopColor="#8b7a50" />
          </linearGradient>
        </defs>
        {/* Lâmina */}
        <path d="M18 3 L20 27 L18 32 L16 27 Z" fill="url(#nor-blade)" stroke="#c9a84c" strokeWidth="1" />
        {/* Guarda */}
        <rect x="10" y="22" width="16" height="3" rx="1.5" fill="#8b6914" stroke="#c9a84c" strokeWidth="1" />
        {/* Punho */}
        <rect x="16.5" y="25" width="3" height="7" rx="1" fill="#6b4a1a" stroke="#c9a84c" strokeWidth="0.8" />
        {/* Brilho da lâmina */}
        <line x1="17" y1="5" x2="17" y2="24" stroke="white" strokeWidth="0.7" opacity="0.3" />
      </svg>
    ),

  }

  return icons[escola] || icons['Universal']
}

export const ESCOLA_CORES = {
  'Abjuração':   '#4a90d9',
  'Adivinhação': '#9b59b6',
  'Conjuração':  '#27ae60',
  'Encantamento':'#e91e8c',
  'Evocação':    '#e74c3c',
  'Ilusão':      '#16a085',
  'Necromancia': '#8e44ad',
  'Transmutação':'#f39c12',
  'Universal':   '#c9a84c',
  'Normal':      '#8b7a50',
  'Domínio':     '#c9a84c',
}
