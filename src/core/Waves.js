import map from '../assets/map.png'
import background_mp3 from '../assets/background_music.mp3'
import skull from '../assets/skull.png'

import {
  curve,
  MAX_WAVES,
  MOB_AMOUNT_MODIFIER,
  MOB_BASE_AMOUNT,
  MOB_PATH,
  TILE_PIXEL_SIZE,
  TOWERS_CELLS,
} from './constant.js'
import Orc from './Orc.js'
import PlacementTile from './PlacementTile.js'
import Tower from './Tower.js'
import Sprite from './Sprite.js'
import Game from './Game.js'

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

  constructor(show_menu) {
    this.background.src = map
    this.show_menu = show_menu
    TOWERS_CELLS.forEach(({ x, y }, tile_index) => {
      this.placement_tiles.push(new PlacementTile({ tile_index }))
    })
    this.show_start_wave_button()
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

  show_start_wave_button() {
    this.start_wave_button = new Sprite({
      src: skull,
      x: 35,
      y: MOB_PATH[0].y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
      on_click: () => this.start(),
      frame_max: 13,
      frame_hold: 10,
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

  place_tower(tile_index) {
    if (this.towers.has(tile_index)) return
    this.towers.set(tile_index, new Tower({ tile_index, range: 150 }))
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

    if (this.started) return
    const { tile_index } =
      this.placement_tiles.find(placement_tile =>
        placement_tile.collide(mouse)
      ) ?? {}
    if (tile_index !== undefined && !this.towers.has(tile_index))
      this.towers.set(tile_index, new Tower({ tile_index, range: 3 }))
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

    if (this.all_spawned && !this.mobs.length) {
      this.started = false
      this.wave++
      this.mobs_spawned = 0
      this.show_start_wave_button()
    }

    this.tick++
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
  }
}
