export const MAP_WIDTH = 10
export const MAX_WAVES = 20
export const MOB_BASE_LIFE = 3
export const MOB_BASE_SPEED = 15
export const MOB_BASE_AMOUNT = 5
export const MOB_BASE_DAMAGE = 1
export const MOB_LIFE_MODIFIER = 151
export const MOB_AMOUNT_MODIFIER = 110
export const MOB_SPEED_MODIFIER = 116

export const curve = ({ base, mod, wave }) =>
  (base * 100 * mod ** wave) / 100 ** (wave + 1)
