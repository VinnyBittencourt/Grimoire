// Atributos D&D 3.5. Os ids seguem a ficha Roll20 (str, dex, con, int, wis, cha).
export const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha']

// Componentes guardados por atributo (colunas `<ab>_<comp>` em characters)
export const ABILITY_PARTS = ['base', 'enh', 'misc', 'temp', 'damage', 'drain']

// Nomes v1 (pt) → id
export const ABILITY_FROM_V1 = { for: 'str', des: 'dex', con: 'con', int: 'int', sab: 'wis', car: 'cha' }

export const SAVES = ['fort', 'ref', 'will']
export const SAVE_ABILITY = { fort: 'con', ref: 'dex', will: 'wis' }

export const ALIGNMENTS = ['lg', 'ng', 'cg', 'ln', 'n', 'cn', 'le', 'ne', 'ce']

export const ALIGNMENT_FROM_V1 = {
  'Leal e Bom': 'lg', 'Neutro e Bom': 'ng', 'Caótico e Bom': 'cg',
  'Leal e Neutro': 'ln', 'Neutro': 'n', 'Caótico e Neutro': 'cn',
  'Leal e Mau': 'le', 'Neutro e Mau': 'ne', 'Caótico e Mau': 'ce',
}

export const GENDERS = ['male', 'female', 'other']
export const GENDER_FROM_V1 = { Masculino: 'male', Feminino: 'female', Outro: 'other' }
