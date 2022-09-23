import TWEEN from '@tweenjs/tween.js'

import health_bar_green_png from '../assets/health_bar_green.png'
import health_bar_red_png from '../assets/health_bar_red.png'
import {
  curve,
  tile_percent,
  cell_center,
  MOB_PATH,
  MAX_WAVES,
  MOB_AMOUNT_MODIFIER,
  MOB_BASE_AMOUNT,
  MOB_BASE_DAMAGE,
  MOB_BASE_LIFE,
  MOB_BASE_SPEED,
  MOB_LIFE_MODIFIER,
  MOB_SPEED_MODIFIER,
  TICK_TIME,
  TILE_PIXEL_SIZE,
} from '../core/constant.js'

import Sprite from './Sprite.js'
import draw_circle from './draw_circle.js'

const cell_direction = (last, next) => {
  if (last.x < next.x) return 'LEFT'
  if (last.x > next.x) return 'RIGHT'
  if (last.y < next.y) return 'UP'
  return 'DOWN'
}

export default class Mob extends Sprite {
  steps = 0
  cell_index = 1
  health_bar_green = new Image()
  health_bar_red = new Image()

  constructor({
    wave,
    src,
    src_die,
    frame_max,
    frame_hold,
    frame_die_hold,
    scale,
    offset_x,
    offset_y,
  }) {
    super({
      src,
      frame_max,
      scale,
      frame_hold,
      offset_x,
    })
    const life = curve({ base: MOB_BASE_LIFE, mod: MOB_LIFE_MODIFIER, wave })
    Object.assign(this, {
      life,
      src_die,
      frame_die_hold,
      max_life: life,
      speed: curve({
        base: MOB_BASE_SPEED,
        mod: MOB_SPEED_MODIFIER,
        wave,
      }),
      damage: MOB_BASE_DAMAGE,
    })
    this.health_bar_green.src = health_bar_green_png
    this.health_bar_red.src = health_bar_red_png
  }

  get last_cell() {
    return MOB_PATH[this.cell_index - 1]
  }

  get next_cell() {
    return MOB_PATH[this.cell_index + 1]
  }

  get cell() {
    return MOB_PATH[this.cell_index]
  }

  get cell_position() {
    const { x, y } = this.cell
    return {
      x: x * TILE_PIXEL_SIZE,
      y: y * TILE_PIXEL_SIZE,
    }
  }

  update_position() {
    const half_tile = TILE_PIXEL_SIZE / 2
    const { x, y } = this.cell_position
    if (this.steps === 50) {
      this.x = x + half_tile
      this.y = y + half_tile
    }
    const direction =
      this.steps < 50
        ? cell_direction(this.last_cell, this.cell)
        : cell_direction(this.cell, this.next_cell)
    switch (direction) {
      case 'LEFT':
        this.x = x + tile_percent(this.steps)
        this.y = y + half_tile
        break
      case 'RIGHT':
        this.x = x + tile_percent(100 - this.steps)
        this.y = y + half_tile
        break
      case 'UP':
        this.x = x + half_tile
        this.y = y + tile_percent(this.steps)
        break
      case 'DOWN':
        this.x = x + half_tile
        this.y = y + tile_percent(100 - this.steps)
        break
    }
  }

  get has_reached_goal() {
    return !this.next_cell
  }

  die() {
    this.dead = true
    this.img.src = this.src_die
    this.frames.current = 0
    this.frames.elapsed = 0
    this.frames.hold = this.frame_die_hold
    this.frames.loop = false
    this.emitter.once('frame_loop', () => (this.can_be_removed = true))
  }

  hit(damage) {
    this.life -= damage
    if (this.life <= 0) this.die()
  }

  move() {
    const { cell, next_cell, cell_index, dead, steps } = this
    if (!next_cell || dead) return

    new TWEEN.Tween({ steps })
      .to({ steps: this.steps + this.speed }, TICK_TIME)
      .onUpdate(({ steps }) => {
        const cells_passed = Math.floor(steps / 100)
        this.steps = Math.floor(steps - cells_passed * 100)
        this.cell_index = cell_index + cells_passed
      })
      .start()
      .onComplete(() => {
        console.log('on complete')
        this.steps = steps + this.speed
        this.cell_index = cell_index
        while (this.steps >= 100) {
          this.steps -= 100
          this.cell_index++
        }
      })
  }

  draw_health(c) {
    if (this.dead) return
    const { health_bar_green: green, health_bar_red: red } = this
    const life_width = 25
    const life_remaining = (life_width * this.life) / this.max_life
    c.drawImage(
      red,
      0,
      0,
      red.width,
      red.height,
      this.x - this.crop_width * this.scale * 0.3,
      this.y - this.img.height * this.scale * 0.6,
      life_width,
      5
    )
    c.drawImage(
      green,
      0,
      0,
      red.width,
      red.height,
      this.x - this.crop_width * this.scale * 0.3,
      this.y - this.img.height * this.scale * 0.6,
      life_remaining,
      5
    )
  }

  color = `hsl(${360 * Math.random()}, 50%, 50%)`

  draw(/** @type {CanvasRenderingContext2D} */ c) {
    if (!this.cell) return
    this.update_position()
    super.draw(c)
    this.draw_health(c)
  }
}
