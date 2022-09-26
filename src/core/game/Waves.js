import map from '../../assets/map.png'
import background_mp3 from '../../assets/background_music.mp3'
import skull_anim from '../../assets/skull_anim.png'
import skull from '../../assets/skull.png'
import heart from '../../assets/heart.png'
import table from '../../assets/table_down.png'
import star from '../../assets/star.png'
import confirm from '../../assets/btn_accept.png'
import {
  curve,
  MAX_WAVES,
  MOB_AMOUNT_MODIFIER,
  MOB_BASE_AMOUNT,
  MOB_PATH,
  TILE_PIXEL_SIZE,
  TOWERS_CELLS,
} from '../constant.js'

import Text from './Text.js'
import Orc from './Orc.js'
import PlacementTile from './PlacementTile.js'
import Tower from './Tower.js'
import Sprite from './Sprite.js'
import Game from './Game.js'

const NAME = 'sceat'

export default class {
  finished = false
  score = 0
  wave = 1
  life = 10
  tick = 0
  towers = new Map()
  placement_tiles = []
  mobs = []
  mobs_spawned = 0
  mobs_amount

  background = new Image()
  start_wave_button
  place_tower_text
  place_tower_btn
  static_sprites = []

  constructor(show_menu) {
    this.background.src = map
    this.show_menu = show_menu
    TOWERS_CELLS.forEach(({ x, y }, tile_index) => {
      this.placement_tiles.push(new PlacementTile({ tile_index }))
    })
    this.show_start_wave_button()
    this.show_place_towers_ui()

    this.static_sprites = [
      new Text({ x: 25, y: 25, text: () => this.life, icon: heart, scale: 1 }),
      new Text({
        x: 25,
        y: 65,
        text: () => `wave  ${this.wave}/${MAX_WAVES}`,
        icon: skull,
        scale: 0.3,
      }),
      new Text({
        x: 105,
        y: 25,
        text: () => this.score,
        icon: star,
        offset_y: 8,
      }),
    ]
  }

  get is_wave_in_progress() {
    if (this.life < 1) return false
    if (!this.all_spawned) return true

    return this.mobs.some(mob => !!mob.life)
  }

  get is_last_wave() {
    return this.wave >= MAX_WAVES
  }

  get is_player_dead() {
    return this.life < 1
  }

  load_state(state) {
    Object.assign(this, state)
  }

  show_start_wave_button() {
    this.start_wave_button = new Sprite({
      src: skull_anim,
      x: 35,
      y: MOB_PATH[0].y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
      on_click: () => {
        this.place_tower_text = undefined
        this.place_tower_btn = undefined
        Game.globals.loading = true
        Game.globals.contract.start_wave()
      },
      frame_max: 13,
      frame_hold: 10,
    })
  }

  show_place_towers_ui() {
    this.place_tower_text = new Text({
      x: Game.globals.width / 2,
      y: 10,
      align: 'center',
      text: 'Place some towers, click here to save them on the blockchain',
    })
    this.place_tower_btn = new Sprite({
      src: confirm,
      x: Game.globals.width / 2,
      y: 70,
      on_click: () => {
        Game.globals.loading = true
        console.log(
          'storing',
          [...this.towers.values()].map(tower => tower.blockchain_tower)
        )
        Game.globals.contract
          .set_towers(
            [...this.towers.values()].map(tower => tower.blockchain_tower)
          )
          .finally(() => (Game.globals.loading = false))
      },
    })
  }

  start() {
    this.mobs_amount = curve({
      base: MOB_BASE_AMOUNT,
      mod: MOB_AMOUNT_MODIFIER,
      wave: this.wave,
    })
    this.all_spawned = false
    this.start_wave_button = null
    this.started = true
  }

  spawn_mob() {
    if (this.mobs_spawned >= this.mobs_amount) {
      if (!this.all_spawned) this.all_spawned = true
      return
    }

    this.mobs.push(new Orc(this.wave))
    this.mobs_spawned++
  }

  on_game_lost() {
    this.show_menu()
  }

  hit() {
    this.life--
    if (this.life < 1) this.on_game_lost()
  }

  remove_dead_mobs() {
    this.mobs = this.mobs.filter(mob => !mob.can_be_removed)
  }

  remove_reached_goal_mobs() {
    this.mobs = this.mobs.filter(mob => !mob.has_reached_goal)
  }

  on_click(mouse) {
    if (this.start_wave_button?.collide(mouse))
      this.start_wave_button.on_click()
    else if (this.place_tower_btn?.collide(mouse))
      this.place_tower_btn.on_click()

    if (this.started) return
    const { tile_index } =
      this.placement_tiles.find(placement_tile =>
        placement_tile.collide(mouse)
      ) ?? {}
    if (tile_index !== undefined) {
      if (this.towers.has(tile_index)) this.towers.delete(tile_index)
      else this.towers.set(tile_index, new Tower({ tile_index, range: 3 }))
    }
  }

  compute_score() {
    const towers_value = [...this.towers.values()].reduce(
      (acc, { score_value }) => acc + score_value,
      0
    )
    const intermediate = towers_value * this.life * this.wave * this.wave
    return this.tick >= intermediate ? 0 : intermediate - this.tick
  }

  on_tick() {
    if (!this.started) return
    const { tick, mobs } = this
    if (this.is_wave_in_progress) {
      if (tick % 4 === 0) this.spawn_mob()

      this.towers.forEach(tower => tower.on_tick({ tick, mobs }))
      this.remove_dead_mobs()

      this.mobs.forEach(mob => {
        mob.move()
        if (mob.has_reached_goal) this.hit()
      })
      this.remove_reached_goal_mobs()
    }

    this.remove_dead_mobs()

    // wave end
    if (this.all_spawned && !this.mobs.length) {
      Game.set_score(NAME, this.compute_score())
      this.score = Game.globals.leaderboard.get(NAME)
      this.started = false
      this.wave++
      this.mobs_spawned = 0
      this.show_start_wave_button()
    } else this.tick++
  }

  on_render(/** @type {CanvasRenderingContext2D} */ c) {
    const { width, height, mouse } = Game.globals
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

    this.start_wave_button?.draw(c)
    this.placement_tiles.forEach(tile => tile.draw(c, mouse))
    this.mobs.forEach(mob => mob.draw(c))
    this.towers.forEach(tower => tower.draw(c, mouse))

    this.static_sprites.forEach(sprite => sprite.draw(c))
    this.place_tower_text?.draw(c)
    this.place_tower_btn?.draw(c)
    // c.fillText(Game.globals.leaderboard.get(NAME) ?? 0, 470, 49)
  }
}
