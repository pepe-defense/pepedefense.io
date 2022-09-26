import tower_sprite from '../../assets/tower.png'
import {
  TOWERS_CELLS,
  TILE_PIXEL_SIZE,
  MAP_WIDTH,
  MAP_HEIGHT,
  cell_id,
} from '../constant.js'

import { Lightning } from './Lightning.js'
import Sprite from './Sprite.js'

export default class extends Sprite {
  lightnings = new Set()

  constructor({
    tile_index,
    range,
    damage = 1,
    fire_rate = 5,
    score_value = 100,
  }) {
    super({ src: tower_sprite, offset_y: 0.7 })
    this.tile_index = tile_index
    const { x, y } = this.tile
    this.cell_id = cell_id({ x, y })
    Object.assign(this, {
      range,
      damage,
      fire_rate,
      score_value,
      last_fired: 0,
      x: x * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
      y: y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
    })
  }

  get blockchain_tower() {
    const { cell_id, damage, range, fire_rate, score_value } = this
    return { cell_id, damage, range, fire_rate, score_value, last_fired: 0 }
  }

  get tile() {
    return TOWERS_CELLS[this.tile_index]
  }

  is_tile_in_range(target) {
    return this.distance_manhattan(target) <= this.range
  }

  can_fire(tick) {
    return this.last_fired + this.fire_rate <= tick
  }

  on_tick({ tick, mobs }) {
    if (this.can_fire(tick)) {
      const mob = mobs.find(mob => {
        return this.is_tile_in_range(mob.cell) && !mob.dead
      })
      if (mob) {
        this.last_fired = tick
        const lightning = new Lightning(mob)
        this.lightnings.add(lightning)
        lightning.emitter.on('frame_loop', () =>
          this.lightnings.delete(lightning)
        )
        mob.hit(this.damage)
      }
    }
  }

  distance_manhattan(target) {
    const { x, y } = this.tile
    return Math.abs(x - target.x) + Math.abs(y - target.y)
  }

  draw(/** @type {CanvasRenderingContext2D} */ c, mouse) {
    c.fillStyle = 'rgba(25, 118, 210, 0.3)'
    if (this.collide(mouse))
      for (let x = 0; x < MAP_WIDTH; x++) {
        for (let y = 0; y < MAP_HEIGHT; y++) {
          if (this.is_tile_in_range({ x, y }))
            c.fillRect(
              x * TILE_PIXEL_SIZE,
              y * TILE_PIXEL_SIZE,
              TILE_PIXEL_SIZE,
              TILE_PIXEL_SIZE
            )
        }
      }
    this.lightnings.forEach(lightning => lightning.draw(c))
    super.draw(c)
  }
}
