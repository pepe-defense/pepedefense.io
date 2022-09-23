import map from '../assets/map.json'

export const MAP_WIDTH = 16
export const MAP_HEIGHT = 9
export const MAX_WAVES = 20
export const MOB_BASE_LIFE = 3
export const MOB_BASE_SPEED = 15
export const MOB_BASE_AMOUNT = 5
export const MOB_BASE_DAMAGE = 1
export const MOB_LIFE_MODIFIER = 151
export const MOB_AMOUNT_MODIFIER = 110
export const MOB_SPEED_MODIFIER = 116
export const FACTOR = 0.3
export const TICK_TIME = 200
export const TILE_PIXEL_SIZE = 256 * FACTOR

export const to_world_coords = ({ x, y }) => ({
  x: Math.round(x * FACTOR),
  y: Math.round(y * FACTOR),
})
const to_cell_coords = ({ x, y }) => ({
  x: Math.floor(x / TILE_PIXEL_SIZE),
  y: Math.floor(y / TILE_PIXEL_SIZE),
})

export const MOB_PATH = map.layers
  .find(({ name }) => name === 'path')
  .objects[0].polyline.map(to_world_coords)
  .map(to_cell_coords)

export const TOWERS_CELLS = map.layers
  .find(({ name }) => name === 'towers')
  .objects.map(to_world_coords)
  .map(to_cell_coords)

export const curve = ({ base, mod, wave }) =>
  Math.floor((base * 100 * mod ** wave) / 100 ** (wave + 1))

export const cell_center = ({ x, y }) => ({
  x: x * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
  y: y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
})
export const cell_id = ({ x, y }) => y * MAP_WIDTH * FACTOR + x
export const tile_percent = percent => (TILE_PIXEL_SIZE * percent) / 100
