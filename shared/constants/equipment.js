// Locais de equipamento (items.location). 'backpack' = guardado, não equipado.
// Inspirado nos slots de item mágico do DMG + armadura e mãos.
export const EQUIPMENT_SLOTS = [
  'head', 'face', 'neck', 'cloak', 'armor', 'body', 'torso', 'arms',
  'hands', 'waist', 'ring1', 'ring2', 'feet', 'mainhand', 'offhand',
]

// Slot → chave do ícone em src/assets/icons/equipmentIcons.jsx (ids do v1)
export const SLOT_ICON = {
  head: 'capacete', face: 'capacete', neck: 'amuleto', cloak: 'capa', armor: 'armadura', body: 'armadura',
  torso: 'armadura', arms: 'braco_esq', hands: 'luvas', waist: 'cinto', ring1: 'anel_esq', ring2: 'anel_dir',
  feet: 'botas', mainhand: 'arma_principal', offhand: 'arma_secundaria',
}

export const AC_TYPES = ['armor', 'shield', 'natural', 'deflection', 'dodge', 'misc']

export const SPELL_SCHOOLS = ['Abjuração', 'Adivinhação', 'Conjuração', 'Encantamento', 'Evocação', 'Ilusão', 'Necromancia', 'Transmutação', 'Universal']

export const ITEM_ICONS = ['🎒', '⚔️', '🗡️', '🏹', '🛡️', '🪓', '🔨', '🪄', '📜', '📖', '🧪', '⚗️', '💍', '📿', '👑', '🧿', '💎', '🪙',
  '🕯️', '🔦', '🪢', '⛺', '🍖', '🍞', '🧀', '🍷', '💧', '🗝️', '🔑', '🧭', '🗺️', '🎻', '🪶', '🦴', '🌿', '🍄', '🧵', '🪨', '⚙️', '🎲']
