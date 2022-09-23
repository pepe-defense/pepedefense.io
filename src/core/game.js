import Menu from './Menu.js'
import Waves from './Waves.js'

export default class {
  menu = new Menu()

  constructor() {
    this.scene = this.menu
  }

  new_game() {
    this.scene = new Waves()
  }

  on_click(mouse) {
    this.scene.on_click(mouse)
  }

  on_render(/** @type {CanvasRenderingContext2D} */ c, width, height, mouse) {
    this.scene.on_render(c, width, height, mouse)
  }
}
