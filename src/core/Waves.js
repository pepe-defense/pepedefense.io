import map from '../assets/map.png'
import background_mp3 from '../assets/background_music.mp3'

import Sound from './Sound.js'
import {
  curve,
  MAX_WAVES,
  MOB_AMOUNT_MODIFIER,
  MOB_BASE_AMOUNT,
  TOWERS_CELLS,
} from './constant.js'
import Orc from './Orc.js'
import PlacementTile from './PlacementTile.js'
import Tower from './Tower.js'

export default class {
  finished = false
  score = 0
  wave = 0
  life = 10
  tick = 0
  towers = new Map()
  placement_tiles = []
  mobs = []
  mobs_spawned = 0
  mobs_amount = curve({
    base: MOB_BASE_AMOUNT,
    mod: MOB_AMOUNT_MODIFIER,
    wave: this.wave,
  })

  background = new Image()

  constructor() {
    this.background.src = map
    TOWERS_CELLS.forEach(({ x, y }, tile_index) => {
      this.placement_tiles.push(new PlacementTile({ tile_index }))
    })
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

  start() {
    this.started = true
    new Sound(background_mp3, true).play()
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
    alert('game lost')
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
    const { tile_index } =
      this.placement_tiles.find(placement_tile =>
        placement_tile.collide(mouse)
      ) ?? {}
    if (tile_index !== undefined && !this.towers.has(tile_index))
      this.towers.set(tile_index, new Tower({ tile_index, range: 3 }))
  }

  on_tick() {
    const { tick, mobs } = this
    if (this.is_wave_in_progress) {
      if (tick % 5 === 0) this.spawn_mob()

      this.towers.forEach(tower => tower.on_tick({ tick, mobs }))
      this.remove_dead_mobs()

      this.mobs.forEach(mob => {
        mob.move()
        if (mob.reached_goal) this.hit()
      })
      this.remove_reached_goal_mobs()
    }

    this.remove_dead_mobs()
    this.tick++
  }

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

    this.placement_tiles.forEach(tile => tile.draw(c, mouse))
    this.mobs.forEach(mob => mob.draw(c))
    this.towers.forEach(tower => tower.draw(c, mouse))
  }
}
