// Ícones SVG por slot de equipamento — estilo medieval D&D

export function EquipSlotIcon({ slot, size = 30 }) {
  const s = size
  const icons = {

    // ── CAPACETE ──────────────────────────────────
    capacete: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Calota — cúpula */}
        <path d="M6 20 C6 8 11 3 18 3 C25 3 30 8 30 20"
          stroke="#c9a84c" strokeWidth="2" fill="rgba(201,168,76,0.14)" strokeLinecap="round"/>
        {/* Bochecheiras */}
        <path d="M6 20 L6 27 Q6 30 9 30 L27 30 Q30 30 30 27 L30 20"
          stroke="#c9a84c" strokeWidth="1.8" fill="rgba(201,168,76,0.10)"/>
        {/* Viseira — abertura escura */}
        <path d="M10 20 L10 27 L26 27 L26 20"
          fill="rgba(10,5,0,0.55)" stroke="#8b6010" strokeWidth="0.9"/>
        {/* Fendas horizontais */}
        <line x1="11.5" y1="21.5" x2="24.5" y2="21.5" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round" opacity="0.7"/>
        <line x1="11.5" y1="24"   x2="24.5" y2="24"   stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"/>
        <line x1="11.5" y1="26.5" x2="24.5" y2="26.5" stroke="#c9a84c" strokeWidth="1.1" strokeLinecap="round" opacity="0.35"/>
        {/* Proteção nasal */}
        <line x1="18" y1="20" x2="18" y2="30" stroke="#c9a84c" strokeWidth="1.3" strokeLinecap="round" opacity="0.55"/>
        {/* Borda da calota */}
        <line x1="6" y1="20" x2="30" y2="20" stroke="#8b6010" strokeWidth="1.1" opacity="0.8"/>
        {/* Crista decorativa */}
        <path d="M13 3.5 Q18 1 23 3.5" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.6"/>
        {/* Rebites junções */}
        <circle cx="10" cy="20" r="1.3" fill="#c9a84c" opacity="0.8"/>
        <circle cx="26" cy="20" r="1.3" fill="#c9a84c" opacity="0.8"/>
        <circle cx="6"  cy="20" r="1"   fill="#c9a84c" opacity="0.6"/>
        <circle cx="30" cy="20" r="1"   fill="#c9a84c" opacity="0.6"/>
      </svg>
    ),

    // ── AMULETO ──────────────────────────────────
    amuleto: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <defs>
          <radialGradient id="amulet-gem" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#fff0a0"/>
            <stop offset="45%" stopColor="#d4a020"/>
            <stop offset="100%" stopColor="#7a5000"/>
          </radialGradient>
          <radialGradient id="amulet-glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#c9a84c" stopOpacity="0.2"/>
            <stop offset="100%" stopColor="#c9a84c" stopOpacity="0"/>
          </radialGradient>
        </defs>
        {/* Corrente */}
        <path d="M8 7 Q18 4 28 7" stroke="#8b6010" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        <line x1="8"  y1="7"  x2="14" y2="15" stroke="#8b6010" strokeWidth="1.2"/>
        <line x1="28" y1="7"  x2="22" y2="15" stroke="#8b6010" strokeWidth="1.2"/>
        {/* Pingente — moldura */}
        <path d="M14 15 L11 21 L18 32 L25 21 L22 15 Z"
          stroke="#c9a84c" strokeWidth="1.8" fill="rgba(201,168,76,0.12)"/>
        {/* Gema principal */}
        <path d="M15 16.5 L12.5 21 L18 30 L23.5 21 L21 16.5 Z"
          fill="url(#amulet-gem)" stroke="#c9a84c" strokeWidth="0.9"/>
        {/* Facetas internas */}
        <line x1="15"  y1="16.5" x2="18"  y2="21" stroke="rgba(255,240,150,0.55)" strokeWidth="0.8"/>
        <line x1="21"  y1="16.5" x2="18"  y2="21" stroke="rgba(255,240,150,0.35)" strokeWidth="0.8"/>
        <line x1="18"  y1="21"   x2="18"  y2="30" stroke="rgba(255,240,150,0.25)" strokeWidth="0.7"/>
        {/* Brilho */}
        <circle cx="15.5" cy="18.5" r="1.1" fill="white" opacity="0.55"/>
        {/* Glows */}
        <ellipse cx="18" cy="23" rx="5" ry="7" fill="url(#amulet-glow)"/>
        {/* Detalhe topo corrente */}
        <circle cx="18" cy="5.5" r="1.5" stroke="#8b6010" strokeWidth="1" fill="rgba(201,168,76,0.3)"/>
      </svg>
    ),

    // ── CAPA ──────────────────────────────────────
    capa: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Capuz */}
        <path d="M11 11 Q11 3 18 3 Q25 3 25 11 Q22 9 18 9 Q14 9 11 11 Z"
          stroke="#c9a84c" strokeWidth="1.6" fill="rgba(201,168,76,0.18)" strokeLinejoin="round"/>
        {/* Abertura interna do capuz */}
        <path d="M13 11 Q15 7 18 7 Q21 7 23 11"
          stroke="#8b6010" strokeWidth="1" fill="none" opacity="0.65" strokeLinecap="round"/>
        {/* Gola — ombros */}
        <path d="M7 13 Q11 10 18 11 Q25 10 29 13 L27 16 Q23 13 18 14 Q13 13 9 16 Z"
          stroke="#c9a84c" strokeWidth="1.6" fill="rgba(201,168,76,0.20)" strokeLinejoin="round"/>
        {/* Painel esquerdo */}
        <path d="M9 16 Q5 22 5 30 Q7 34 13 33 Q15 27 16 21 Q17 17 18 15"
          stroke="#c9a84c" strokeWidth="1.7" fill="rgba(201,168,76,0.12)" strokeLinejoin="round"/>
        {/* Painel direito */}
        <path d="M27 16 Q31 22 31 30 Q29 34 23 33 Q21 27 20 21 Q19 17 18 15"
          stroke="#c9a84c" strokeWidth="1.7" fill="rgba(201,168,76,0.10)" strokeLinejoin="round"/>
        {/* Pregas */}
        <path d="M11 18 Q9 25 8 31"  stroke="#8b6010" strokeWidth="1"   fill="none" opacity="0.55" strokeLinecap="round"/>
        <path d="M25 18 Q27 25 28 31" stroke="#8b6010" strokeWidth="1"   fill="none" opacity="0.55" strokeLinecap="round"/>
        <path d="M14 17 Q13 24 13 30" stroke="#8b6010" strokeWidth="0.8" fill="none" opacity="0.35" strokeLinecap="round"/>
        <path d="M22 17 Q23 24 23 30" stroke="#8b6010" strokeWidth="0.8" fill="none" opacity="0.35" strokeLinecap="round"/>
        {/* Fíbula */}
        <circle cx="18" cy="14" r="2.8" stroke="#c9a84c" strokeWidth="1.5" fill="rgba(201,168,76,0.22)"/>
        <circle cx="18" cy="14" r="1.2" fill="#c9a84c" opacity="0.85"/>
      </svg>
    ),

    // ── BRAÇO ESQ. — Escudo ───────────────────────
    braco_esq: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="shield-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5aa0e0" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#1a3a6a" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        {/* Escudo principal */}
        <path d="M5 5 L31 5 L31 20 C31 29 18 34 18 34 C18 34 5 29 5 20 Z"
          stroke="#c9a84c" strokeWidth="2" fill="url(#shield-bg)"/>
        {/* Borda interna */}
        <path d="M8 8 L28 8 L28 20 C28 27 18 31 18 31 C18 31 8 27 8 20 Z"
          stroke="#8b6010" strokeWidth="0.9" fill="none" opacity="0.65"/>
        {/* Divisória horizontal */}
        <line x1="8" y1="17" x2="28" y2="17" stroke="#c9a84c" strokeWidth="1" opacity="0.55"/>
        {/* Divisória vertical */}
        <line x1="18" y1="8" x2="18" y2="29" stroke="#c9a84c" strokeWidth="1" opacity="0.55"/>
        {/* Umbão central */}
        <circle cx="18" cy="17" r="4" stroke="#c9a84c" strokeWidth="1.5" fill="rgba(201,168,76,0.2)"/>
        <circle cx="18" cy="17" r="1.8" fill="#c9a84c" opacity="0.75"/>
        {/* Cantos decorativos */}
        <circle cx="8"  cy="8"  r="1.2" fill="#c9a84c" opacity="0.55"/>
        <circle cx="28" cy="8"  r="1.2" fill="#c9a84c" opacity="0.55"/>
      </svg>
    ),

    // ── ARMADURA ──────────────────────────────────
    armadura: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="armor-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4a030" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#3a2000" stopOpacity="0.1"/>
          </linearGradient>
        </defs>
        {/* Pauldron esquerdo */}
        <path d="M4 12 Q4 8 8 8 L11 8 L12 13 Q8 14 6 16 Z"
          stroke="#c9a84c" strokeWidth="1.4" fill="rgba(201,168,76,0.15)" strokeLinejoin="round"/>
        {/* Pauldron direito */}
        <path d="M32 12 Q32 8 28 8 L25 8 L24 13 Q28 14 30 16 Z"
          stroke="#c9a84c" strokeWidth="1.4" fill="rgba(201,168,76,0.15)" strokeLinejoin="round"/>
        {/* Peitoral */}
        <path d="M11 8 Q11 6 18 6 Q25 6 25 8 L27 22 C27 27 23 31 18 31 C13 31 9 27 9 22 Z"
          stroke="#c9a84c" strokeWidth="1.8" fill="url(#armor-body)"/>
        {/* Divisória central */}
        <line x1="18" y1="6" x2="18" y2="31" stroke="#8b6010" strokeWidth="1.1" opacity="0.7"/>
        {/* Bandas horizontais das placas */}
        <path d="M10 13 Q18 15 26 13" stroke="#8b6010" strokeWidth="0.9" fill="none" opacity="0.65"/>
        <path d="M10 18 Q18 20 26 18" stroke="#8b6010" strokeWidth="0.9" fill="none" opacity="0.65"/>
        <path d="M10 23 Q18 25 26 23" stroke="#8b6010" strokeWidth="0.9" fill="none" opacity="0.55"/>
        {/* Emblema central */}
        <path d="M15 9 L18 12 L21 9" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinejoin="round" opacity="0.85"/>
        {/* Rebites */}
        <circle cx="11" cy="10" r="1.1" fill="#c9a84c" opacity="0.6"/>
        <circle cx="25" cy="10" r="1.1" fill="#c9a84c" opacity="0.6"/>
        <circle cx="10" cy="26" r="1.1" fill="#c9a84c" opacity="0.5"/>
        <circle cx="26" cy="26" r="1.1" fill="#c9a84c" opacity="0.5"/>
      </svg>
    ),

    // ── LUVAS — Manopla ───────────────────────────
    luvas: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Polegar */}
        <path d="M7 21 Q4.5 20.5 4 18.5 Q4 16 6.5 15.5 L7 17"
          stroke="#c9a84c" strokeWidth="1.4" fill="rgba(201,168,76,0.12)" strokeLinejoin="round"/>
        {/* Silhueta unificada: 4 dedos + dorso */}
        <path d="M7 22 L7 18
          Q7 9  11 9  Q15 9  15 18
          Q15 8  18.5 8  Q22 8  22 18
          Q22 10  25 10  Q28 10  28 18
          Q28 13  30 13  Q32 13  32 18
          L32 22 Q32 24 30 24
          L9 24 Q7 24 7 22 Z"
          stroke="#c9a84c" strokeWidth="1.7" fill="rgba(201,168,76,0.15)" strokeLinejoin="round"/>
        {/* Linha dos nós */}
        <line x1="7" y1="18" x2="32" y2="18" stroke="#8b6010" strokeWidth="1.1" opacity="0.65"/>
        {/* Rebites dos nós */}
        <circle cx="11"   cy="18" r="1.3" fill="#c9a84c" opacity="0.8"/>
        <circle cx="18.5" cy="18" r="1.3" fill="#c9a84c" opacity="0.8"/>
        <circle cx="25"   cy="18" r="1.3" fill="#c9a84c" opacity="0.8"/>
        <circle cx="30"   cy="18" r="1.3" fill="#c9a84c" opacity="0.8"/>
        {/* Articulações dos dedos */}
        <line x1="7"  y1="14" x2="15" y2="14" stroke="#8b6010" strokeWidth="0.8" opacity="0.5"/>
        <line x1="15" y1="13" x2="22" y2="13" stroke="#8b6010" strokeWidth="0.8" opacity="0.5"/>
        <line x1="22" y1="14" x2="28" y2="14" stroke="#8b6010" strokeWidth="0.8" opacity="0.5"/>
        <line x1="28" y1="15" x2="32" y2="15" stroke="#8b6010" strokeWidth="0.8" opacity="0.5"/>
        {/* Faixa do dorso */}
        <path d="M7 21 Q19.5 22.5 32 21" stroke="#8b6010" strokeWidth="0.9" fill="none" opacity="0.5"/>
        {/* Cuff */}
        <path d="M7 24 L7 31 Q7 33 10 33 L29 33 Q32 33 32 31 L32 24"
          stroke="#c9a84c" strokeWidth="1.7" fill="rgba(201,168,76,0.17)" strokeLinejoin="round"/>
        <line x1="7" y1="24"   x2="32" y2="24"   stroke="#8b6010" strokeWidth="1"   opacity="0.7"/>
        <line x1="7" y1="28.5" x2="32" y2="28.5" stroke="#8b6010" strokeWidth="0.8" opacity="0.4"/>
        <circle cx="10"   cy="25.5" r="1" fill="#c9a84c" opacity="0.65"/>
        <circle cx="19.5" cy="25.5" r="1" fill="#c9a84c" opacity="0.65"/>
        <circle cx="29"   cy="25.5" r="1" fill="#c9a84c" opacity="0.65"/>
      </svg>
    ),

    // ── CINTO ─────────────────────────────────────
    cinto: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="belt-strap" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7a5010" stopOpacity="0.5"/>
            <stop offset="50%" stopColor="#c9a84c" stopOpacity="0.3"/>
            <stop offset="100%" stopColor="#7a5010" stopOpacity="0.5"/>
          </linearGradient>
        </defs>
        {/* Cinto esquerdo */}
        <rect x="2"  y="14" width="11" height="8" rx="1.5"
          stroke="#c9a84c" strokeWidth="1.5" fill="url(#belt-strap)"/>
        {/* Cinto direito */}
        <rect x="23" y="14" width="11" height="8" rx="1.5"
          stroke="#c9a84c" strokeWidth="1.5" fill="url(#belt-strap)"/>
        {/* Fivela — moldura exterior */}
        <rect x="13" y="11" width="10" height="14" rx="2"
          stroke="#c9a84c" strokeWidth="1.8" fill="rgba(201,168,76,0.2)"/>
        {/* Fivela — moldura interior */}
        <rect x="14.5" y="12.5" width="7" height="11" rx="1"
          stroke="#8b6010" strokeWidth="0.9" fill="rgba(139,96,16,0.25)"/>
        {/* Pino horizontal */}
        <line x1="13" y1="18" x2="23" y2="18" stroke="#c9a84c" strokeWidth="1.5" strokeLinecap="round"/>
        {/* Furos do cinto */}
        <circle cx="5"   cy="18" r="1"   fill="#8b6010" opacity="0.6"/>
        <circle cx="8"   cy="18" r="1"   fill="#8b6010" opacity="0.6"/>
        <circle cx="11"  cy="18" r="1"   fill="#8b6010" opacity="0.6"/>
        <circle cx="25"  cy="18" r="1"   fill="#8b6010" opacity="0.6"/>
        <circle cx="28"  cy="18" r="1"   fill="#8b6010" opacity="0.6"/>
        <circle cx="31"  cy="18" r="1"   fill="#8b6010" opacity="0.6"/>
        {/* Cantos decorativos da fivela */}
        <circle cx="14.5" cy="13.5" r="0.9" fill="#c9a84c" opacity="0.6"/>
        <circle cx="21.5" cy="13.5" r="0.9" fill="#c9a84c" opacity="0.6"/>
        <circle cx="14.5" cy="22.5" r="0.9" fill="#c9a84c" opacity="0.6"/>
        <circle cx="21.5" cy="22.5" r="0.9" fill="#c9a84c" opacity="0.6"/>
      </svg>
    ),

    // ── BOTAS ─────────────────────────────────────
    botas: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Cano — parte alta */}
        <path d="M7 2 L16 2 L16 22 L7 22 Z"
          stroke="#c9a84c" strokeWidth="1.8" fill="rgba(201,168,76,0.14)" strokeLinejoin="round"/>
        {/* Topo do cano */}
        <path d="M7 2 Q11.5 1 16 2" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round" opacity="0.65"/>
        {/* Dobras do couro */}
        <path d="M7 8  Q11.5 9.5  16 8"  stroke="#8b6010" strokeWidth="1"   fill="none" opacity="0.6" strokeLinecap="round"/>
        <path d="M7 14 Q11.5 15.5 16 14" stroke="#8b6010" strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round"/>
        <path d="M7 20 Q11.5 21.5 16 20" stroke="#8b6010" strokeWidth="0.8" fill="none" opacity="0.4" strokeLinecap="round"/>
        {/* Ilhós pares */}
        <circle cx="9"  cy="5.5"  r="1.1" fill="#c9a84c" opacity="0.7"/>
        <circle cx="14" cy="5.5"  r="1.1" fill="#c9a84c" opacity="0.7"/>
        <circle cx="9"  cy="11"   r="1.1" fill="#c9a84c" opacity="0.6"/>
        <circle cx="14" cy="11"   r="1.1" fill="#c9a84c" opacity="0.6"/>
        <circle cx="9"  cy="16.5" r="1.1" fill="#c9a84c" opacity="0.55"/>
        <circle cx="14" cy="16.5" r="1.1" fill="#c9a84c" opacity="0.55"/>
        {/* Cadarço cruzado */}
        <line x1="9"  y1="5.5"  x2="14" y2="11"   stroke="#8b6010" strokeWidth="0.8" opacity="0.4"/>
        <line x1="14" y1="5.5"  x2="9"  y2="11"   stroke="#8b6010" strokeWidth="0.8" opacity="0.4"/>
        <line x1="9"  y1="11"   x2="14" y2="16.5" stroke="#8b6010" strokeWidth="0.8" opacity="0.35"/>
        <line x1="14" y1="11"   x2="9"  y2="16.5" stroke="#8b6010" strokeWidth="0.8" opacity="0.35"/>
        {/* Pé — transição e corpo */}
        <path d="M7 22 L7 27 Q7 29 9 29 L25 29 Q30 29 31 27 Q32 25 30 23 L16 22 Z"
          stroke="#c9a84c" strokeWidth="1.8" fill="rgba(201,168,76,0.13)" strokeLinejoin="round"/>
        {/* Calcanhar */}
        <path d="M7 25 Q5 25 5 28 Q5 29 7 29"
          stroke="#c9a84c" strokeWidth="1.4" fill="rgba(201,168,76,0.10)" strokeLinejoin="round"/>
        {/* Costura bico */}
        <path d="M10 28 Q20 29 30 27" stroke="#8b6010" strokeWidth="0.9" fill="none" opacity="0.5" strokeLinecap="round"/>
        {/* Sola */}
        <path d="M5 29 Q18 32 31 29" stroke="#c9a84c" strokeWidth="2" strokeLinecap="round" opacity="0.9"/>
      </svg>
    ),

    // ── ANEL ESQ. ─────────────────────────────────
    anel_esq: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Banda do anel — elipse espessa vista de leve ângulo */}
        <ellipse cx="18" cy="27" rx="12" ry="7"
          stroke="#c9a84c" strokeWidth="4.5" fill="rgba(201,168,76,0.09)"/>
        {/* Buraco interno — profundidade */}
        <ellipse cx="18" cy="27" rx="7.5" ry="3.5" fill="rgba(8,4,0,0.45)"/>
        {/* Sombra borda inferior */}
        <path d="M6.5 27 Q6.5 34 18 34 Q29.5 34 29.5 27"
          stroke="#8b6010" strokeWidth="0.8" fill="none" opacity="0.5"/>
        {/* Engaste */}
        <path d="M14 21 Q13.5 13 18 11 Q22.5 13 22 21"
          stroke="#c9a84c" strokeWidth="1.5" fill="rgba(201,168,76,0.15)" strokeLinejoin="round"/>
        {/* Gema — topázio âmbar */}
        <ellipse cx="18" cy="16" rx="3.5" ry="4.5"
          fill="rgba(225,175,15,0.78)" stroke="#c9a84c" strokeWidth="1.2"/>
        {/* Facetas */}
        <line x1="14.5" y1="16" x2="18" y2="12.5" stroke="rgba(255,248,140,0.75)" strokeWidth="1"/>
        <line x1="21.5" y1="16" x2="18" y2="12.5" stroke="rgba(255,248,140,0.38)" strokeWidth="1"/>
        {/* Brilho */}
        <circle cx="16.2" cy="13.5" r="1.1" fill="white" opacity="0.6"/>
      </svg>
    ),

    // ── ANEL DIR. ─────────────────────────────────
    anel_dir: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        {/* Banda do anel */}
        <ellipse cx="18" cy="27" rx="12" ry="7"
          stroke="#c9a84c" strokeWidth="4.5" fill="rgba(201,168,76,0.09)"/>
        {/* Buraco interno */}
        <ellipse cx="18" cy="27" rx="7.5" ry="3.5" fill="rgba(8,4,0,0.45)"/>
        {/* Sombra borda inferior */}
        <path d="M6.5 27 Q6.5 34 18 34 Q29.5 34 29.5 27"
          stroke="#8b6010" strokeWidth="0.8" fill="none" opacity="0.5"/>
        {/* Engaste */}
        <path d="M14 21 Q13.5 13 18 11 Q22.5 13 22 21"
          stroke="#c9a84c" strokeWidth="1.5" fill="rgba(201,168,76,0.15)" strokeLinejoin="round"/>
        {/* Gema — safira */}
        <ellipse cx="18" cy="16" rx="3.5" ry="4.5"
          fill="rgba(35,115,215,0.78)" stroke="#c9a84c" strokeWidth="1.2"/>
        {/* Facetas */}
        <line x1="14.5" y1="16" x2="18" y2="12.5" stroke="rgba(180,225,255,0.75)" strokeWidth="1"/>
        <line x1="21.5" y1="16" x2="18" y2="12.5" stroke="rgba(180,225,255,0.38)" strokeWidth="1"/>
        {/* Brilho */}
        <circle cx="16.2" cy="13.5" r="1.1" fill="white" opacity="0.6"/>
      </svg>
    ),

    // ── ARMA PRINCIPAL — Espada longa ─────────────
    arma_principal: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="sword-main" x1="0.3" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="#f0e0a0"/>
            <stop offset="40%" stopColor="#d4a840"/>
            <stop offset="100%" stopColor="#6a4010"/>
          </linearGradient>
          <linearGradient id="sword-edge" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="white" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="white" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* Lâmina */}
        <path d="M18 2 L20.5 25 L18 28 L15.5 25 Z"
          fill="url(#sword-main)" stroke="#c9a84c" strokeWidth="0.8"/>
        {/* Fio brilhante */}
        <line x1="16.5" y1="4" x2="16.5" y2="24" stroke="white" strokeWidth="0.7" opacity="0.35"/>
        {/* Sangradouro (fuller) */}
        <line x1="18.5" y1="5" x2="18.5" y2="23" stroke="rgba(120,80,20,0.4)" strokeWidth="0.8"/>
        {/* Guarda cruzada */}
        <path d="M8 25 L28 25" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Curva das quillons */}
        <path d="M8  25 Q8  22 11 22" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        <path d="M28 25 Q28 22 25 22" stroke="#c9a84c" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
        {/* Punho */}
        <rect x="16" y="25" width="4" height="7" rx="1.5"
          stroke="#8b6010" strokeWidth="1.3" fill="rgba(139,96,16,0.55)"/>
        {/* Enrolamento */}
        <line x1="16" y1="27" x2="20" y2="27" stroke="#c9a84c" strokeWidth="0.8" opacity="0.6"/>
        <line x1="16" y1="29" x2="20" y2="29" stroke="#c9a84c" strokeWidth="0.8" opacity="0.6"/>
        {/* Pomo */}
        <ellipse cx="18" cy="33" rx="3.5" ry="2.2"
          stroke="#c9a84c" strokeWidth="1.4" fill="rgba(201,168,76,0.3)"/>
        <circle cx="18" cy="33" r="1.2" fill="#c9a84c" opacity="0.85"/>
      </svg>
    ),

    // ── ARMA SECUNDÁRIA — Adaga ───────────────────
    arma_secundaria: (
      <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="dagger-blade" x1="0.3" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#e8d890"/>
            <stop offset="50%" stopColor="#c0a040"/>
            <stop offset="100%" stopColor="#6a4010"/>
          </linearGradient>
        </defs>
        {/* Lâmina curva */}
        <path d="M21 3 Q24 5 23 9 L19 21 L17 21 L16 9 Q16 5 19 3 Z"
          fill="url(#dagger-blade)" stroke="#c9a84c" strokeWidth="0.9"/>
        {/* Fio brilhante */}
        <line x1="21.5" y1="5" x2="19.5" y2="19" stroke="white" strokeWidth="0.7" opacity="0.35"/>
        {/* Guarda */}
        <path d="M12 21 L26 21" stroke="#c9a84c" strokeWidth="2.3" strokeLinecap="round"/>
        {/* Curvas da guarda */}
        <path d="M12 21 Q11 18 14 18" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        <path d="M26 21 Q27 18 24 18" stroke="#c9a84c" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
        {/* Punho */}
        <rect x="17" y="21" width="4" height="8" rx="1.5"
          stroke="#8b6010" strokeWidth="1.3" fill="rgba(139,96,16,0.55)"/>
        <line x1="17" y1="23.5" x2="21" y2="23.5" stroke="#c9a84c" strokeWidth="0.8" opacity="0.55"/>
        <line x1="17" y1="26"   x2="21" y2="26"   stroke="#c9a84c" strokeWidth="0.8" opacity="0.55"/>
        {/* Pomo */}
        <ellipse cx="19" cy="31.5" rx="3" ry="2"
          stroke="#c9a84c" strokeWidth="1.3" fill="rgba(201,168,76,0.3)"/>
        <circle cx="19" cy="31.5" r="1" fill="#c9a84c" opacity="0.8"/>
      </svg>
    ),

  }

  return icons[slot] || (
    <svg width={s} height={s} viewBox="0 0 36 36" fill="none">
      <rect x="6" y="6" width="24" height="24" rx="3"
        stroke="#c9a84c" strokeWidth="1.5" fill="rgba(201,168,76,0.08)" strokeDasharray="3 2"/>
      <line x1="12" y1="12" x2="24" y2="24" stroke="#c9a84c" strokeWidth="1" opacity="0.35"/>
      <line x1="24" y1="12" x2="12" y2="24" stroke="#c9a84c" strokeWidth="1" opacity="0.35"/>
    </svg>
  )
}
