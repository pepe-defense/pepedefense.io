import background_mp3 from '../assets/background_music.mp3'
import sound_on from '../assets/button_music.png'
import sound_off from '../assets/button_music_off.png'

import Menu from './Menu.js'
import Waves from './Waves.js'
import Sound from './Sound.js'
import Sprite from './Sprite.js'

export default class Game {
  buttons = []

  static globals = {
    sound: false,
    width: 0,
    height: 0,
    mouse: { x: 0, y: 0 },
    leaderboard: new Map(),
  }

  constructor(width, height) {
    Object.assign(Game.globals, { width, height })

    this.menu = new Menu(this)
    this.scene = this.menu
    new Sound(background_mp3, true).play()

    const sound_button = new Sprite({
      src: sound_off,
      x: width - 40,
      y: 40,
      on_click: function () {
        Game.globals.sound = !Game.globals.sound
        this.img.src = Game.globals.sound ? sound_on : sound_off
        Sound.allow_sounds(Game.globals.sound)
      },
    })

    this.buttons = [sound_button]
  }

  new_game() {
    this.scene = new Waves(() => (this.scene = this.menu))
  }

  on_click() {
    const { mouse } = Game.globals
    this.scene.on_click(mouse)
    this.buttons.find(btn => btn.collide(mouse))?.on_click()
  }

  on_tick() {
    this.scene.on_tick()
  }

  on_render(/** @type {CanvasRenderingContext2D} */ c) {
    this.scene.on_render(c)
    this.buttons.forEach(btn => btn.draw(c))
  }

  static set_score(name, score) {
    const current_score = Game.globals.leaderboard.get(name)
    if (current_score > score) return
    Game.globals.leaderboard.set(name, score)
    Game.globals.leaderboard = new Map(
      [...Game.globals.leaderboard.entries()]
        .sort(([, p1], [, p2]) => p1.score - p2.score)
        .slice(0, 10)
    )
  }
}
