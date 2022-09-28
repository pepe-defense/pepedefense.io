import menu_background_png from '../../assets/menu_bg.png'
import play from '../../assets/button_play.png'

import Sound from './Sound.js'
import Sprite from './Sprite.js'
import Game from './Game.js'
import Text from './Text.js'

export default class {
  background = new Image()
  new_game_button
  loading_text

  constructor(game) {
    this.background.src = menu_background_png

    this.new_game_button = new Sprite({
      src: play,
      x: Game.globals.width / 2,
      y: Game.globals.height / 2,
      on_click: async () => {
        Game.set_loading_syncing()
        Game.globals.contract
          .new_game()
          .then(Game.set_loading_transaction)
          .catch(Game.set_loading_over)
      },
    })
  }

  on_click() {
    const { mouse } = Game.globals
    if (this.new_game_button?.collide(mouse)) this.new_game_button.on_click()
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
    this.new_game_button?.draw(c)
    this.loading_text?.draw(c)
  }
}
