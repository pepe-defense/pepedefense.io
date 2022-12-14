import background_mp3 from '../../assets/background_music.mp3'
import sound_on from '../../assets/button_music.png'
import sound_off from '../../assets/button_music_off.png'
import { cell_id, TOWERS_CELLS } from '../constant'

import Menu from './Menu.js'
import Waves from './Waves.js'
import Sound from './Sound.js'
import Sprite from './Sprite.js'
import Tower from './Tower.js'
import Text from './Text.js'
import parse_struct from './parse_struct.js'

export default class Game {
  buttons = []
  loading_text

  static globals = {
    sound: false,
    width: 0,
    height: 0,
    mouse: { x: 0, y: 0 },
    leaderboard: new Map(),
    loading_state: null,
    contract: {},
    address: '',
  }

  constructor({ contract, address, canvas: { width, height }, provider }) {
    Object.assign(Game.globals, { width, height, contract, address })

    this.loading_text = Text.create_loader()
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

    // contract events
    contract.on('game_created', async (player, wave, life) => {
      if (player === address) await this.load()
    })

    contract.on('towers_placed', player => {
      if (player === address) Game.set_loading_over()
    })
  }

  async load() {
    const waves = new Waves()
    await waves.load()
    if (waves.wave !== 0) this.scene = waves
    else Game.set_loading_over()
  }

  on_click() {
    if (Game.globals.loading_state) return
    const { mouse } = Game.globals
    this.scene.on_click(mouse)
    this.buttons.find(btn => btn.collide(mouse))?.on_click()
  }

  on_tick() {
    this.scene.on_tick()
  }

  on_render(/** @type {CanvasRenderingContext2D} */ c) {
    this.scene.on_render(c)
    if (Game.globals.loading_state) this.loading_text.draw(c)
    else this.buttons.forEach(btn => btn.draw(c))
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

  static set_loading_over() {
    Game.globals.loading_state = 0
  }

  static set_loading_syncing() {
    Game.globals.loading_state = 1
  }

  static set_loading_transaction() {
    Game.globals.loading_state = 2
  }

  static set_loading_fetch() {
    Game.globals.loading_state = 3
  }
}
