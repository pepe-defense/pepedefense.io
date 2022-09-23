import lightning from '../assets/lightning.png'
import lightning_mp3 from '../assets/lightning.mp3'

import Sprite from './Sprite.js'
import Sound from './Sound.js'

export class Lightning extends Sprite {
  constructor({ x, y }) {
    super({
      src: lightning,
      frame_max: 14,
      x,
      y,
      scale: 2,
      offset_y: 0.86,
      offset_x: 0.4,
      frame_hold: 2,
    })
    new Sound(lightning_mp3).play()
  }
}
