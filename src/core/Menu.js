import menu_background_png from '../assets/menu_bg.png'
import background_mp3 from '../assets/background_music.mp3'

import Sound from './Sound.js'

export default class {
  background = new Image()

  constructor() {
    this.background.src = menu_background_png
  }

  on_click(mouse) {}

  on_render(/** @type {CanvasRenderingContext2D} */ c, width, height, mouse) {
    c.drawImage(
      this.background,
      0,
      0,
      this.background.width,
      this.background.height,
      0,
      0,
      width,
      height
    )
  }
}
