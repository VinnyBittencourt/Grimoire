// Categorias de tamanho (PHB p. 134). `mod` vale para CA e ataque; `grapple` é o modificador
// especial de agarrar; `hide` para Esconder; `carry` multiplica a capacidade de carga (bípedes).
export const SIZES = {
  fine:       { mod: 8,  grapple: -16, hide: 16,  carry: 1 / 8 },
  diminutive: { mod: 4,  grapple: -12, hide: 12,  carry: 1 / 4 },
  tiny:       { mod: 2,  grapple: -8,  hide: 8,   carry: 1 / 2 },
  small:      { mod: 1,  grapple: -4,  hide: 4,   carry: 3 / 4 },
  medium:     { mod: 0,  grapple: 0,   hide: 0,   carry: 1 },
  large:      { mod: -1, grapple: 4,   hide: -4,  carry: 2 },
  huge:       { mod: -2, grapple: 8,   hide: -8,  carry: 4 },
  gargantuan: { mod: -4, grapple: 12,  hide: -12, carry: 8 },
  colossal:   { mod: -8, grapple: 16,  hide: -16, carry: 16 },
}

export const SIZE_IDS = Object.keys(SIZES)

export const SIZE_FROM_V1 = {
  'Miúdo': 'tiny', 'Pequeno': 'small', 'Médio': 'medium', 'Grande': 'large',
  'Enorme': 'huge', 'Imenso': 'gargantuan', 'Colossal': 'colossal',
}
