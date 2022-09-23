import EventEmitter from 'events'

import { FACTOR } from '../core/constant.js'

export default class {
  img = new Image()
  emitter = new EventEmitter()

  constructor({
    src,
    frame_max = 1,
    frame_hold = 5,
    scale = FACTOR,
    offset_x = 0.5,
    offset_y = 0.5,
    x = 0,
    y = 0,
    on_click = () => {},
  }) {
    this.img.src = src
    this.frames = {
      current: 0,
      hold: frame_hold,
      max: frame_max,
      elapsed: 0,
      offset_x,
      offset_y,
      loop: true,
    }
    Object.assign(this, { x, y, scale, on_click })
  }

  get crop_width() {
    return this.img.width / this.frames.max
  }

  get scaled_width() {
    return this.crop_width * this.scale
  }

  get scaled_height() {
    return this.img.height * this.scale
  }

  collide({ x: target_x, y: target_y }) {
    const { x, y, scaled_width, scaled_height, frames } = this
    const top_left_x = x - scaled_width * frames.offset_x
    const top_left_y = y - scaled_height * frames.offset_y
    const bottom_right_x = top_left_x + scaled_width
    const bottom_right_y = top_left_y + scaled_height
    return (
      target_x > top_left_x &&
      target_x < bottom_right_x &&
      target_y > top_left_y &&
      target_y < bottom_right_y
    )
  }

  draw(c) {
    const {
      frames,
      img: { width, height },
      img,
      scale,
      x,
      y,
      crop_width,
      scaled_width,
      scaled_height,
    } = this
    if (!frames.loop && frames.current >= frames.max) return
    c.drawImage(
      img,
      crop_width * frames.current,
      0,
      crop_width,
      height,
      x - scaled_width * frames.offset_x,
      y - scaled_height * frames.offset_y,
      scaled_width,
      scaled_height
    )

    if (++frames.elapsed % frames.hold === 0)
      if (++frames.current >= frames.max - 1) {
        this.emitter.emit('frame_loop')
        if (frames.loop) frames.current = 0
      }
  }
}
