import dot from '../../assets/dot.png'
import { TOWERS_CELLS, TILE_PIXEL_SIZE } from '../constant.js'

import Sprite from './Sprite.js'

export default class extends Sprite {
  constructor({ tile_index }) {
    super({ src: dot })
    this.tile_index = tile_index
    const { x, y } = this.tile
    Object.assign(this, {
      x: Math.round(x * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2),
      y: Math.round(y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2),
    })
  }

  get tile() {
    return TOWERS_CELLS[this.tile_index]
  }

  draw(c, mouse) {
    const { x, y } = this
    const half_tile = TILE_PIXEL_SIZE / 2
    super.draw(c)
    if (this.collide(mouse)) {
      c.globalCompositeOperation = 'color'
      c.fillStyle = '#09f'
      c.fillRect(
        x - TILE_PIXEL_SIZE / 2,
        y - TILE_PIXEL_SIZE / 2,
        TILE_PIXEL_SIZE,
        TILE_PIXEL_SIZE
      )
      c.globalCompositeOperation = 'source-over'
    }
  }
}
