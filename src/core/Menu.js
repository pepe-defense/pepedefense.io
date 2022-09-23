import menu_background_png from '../assets/menu_bg.png'
import play from '../assets/button_play.png'

import Sound from './Sound.js'
import Sprite from './Sprite.js'
import Game from './Game.js'

export default class {
  background = new Image()
  buttons = []

  constructor(game) {
    this.background.src = menu_background_png

    this.buttons = [
      new Sprite({
        src: play,
        x: Game.globals.width / 2,
        y: Game.globals.height / 2,
        on_click: () => {
          game.new_game()
        },
      }),
    ]
  }

  on_click() {
    const { mouse } = Game.globals
    this.buttons.find(btn => btn.collide(mouse))?.on_click()
  }

  on_tick() {}

  on_render(/** @type {CanvasRenderingContext2D} */ c) {
    const { width, height } = Game.globals
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
    this.buttons.forEach(btn => btn.draw(c))
  }
}
