import map from '../../assets/map.png'
import background_mp3 from '../../assets/background_music.mp3'
import skull_anim from '../../assets/skull_anim.png'
import skull from '../../assets/skull.png'
import heart from '../../assets/heart.png'
import table from '../../assets/table_down.png'
import star from '../../assets/star.png'
import confirm from '../../assets/btn_accept.png'
import restart from '../../assets/button_restart.png'
import failed from '../../assets/failed.png'
import win from '../../assets/win.png'
import {
  curve,
  MAX_WAVES,
  MOB_AMOUNT_MODIFIER,
  MOB_BASE_AMOUNT,
  MOB_PATH,
  TILE_PIXEL_SIZE,
  TOWERS_CELLS,
  cell_id,
} from '../constant.js'

import Text from './Text.js'
import Orc from './Orc.js'
import PlacementTile from './PlacementTile.js'
import Tower from './Tower.js'
import Sprite from './Sprite.js'
import Game from './Game.js'
import parse_struct from './parse_struct.js'

const NAME = 'sceat'

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
  mobs_amount

  background = new Image()
  start_wave_button
  place_tower_text
  place_tower_btn
  restart_button
  failed_sprite
  static_sprites = []

  constructor() {
    this.background.src = map
    TOWERS_CELLS.forEach(({ x, y }, tile_index) => {
      this.placement_tiles.push(new PlacementTile({ tile_index }))
    })
    this.restart_button = new Sprite({
      src: restart,
      x: Game.globals.width - 100,
      y: 40,
      on_click: () => {
        Game.set_loading_syncing()
        Game.globals.contract
          .new_game()
          .then(Game.set_loading_transaction)
          .catch(Game.set_loading_over)
      },
    })

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

  async load() {
    Game.set_loading_fetch()
    const { contract } = Game.globals
    const wave = await contract.get_wave()
    if (wave === 0) {
      Game.set_loading_over()
      return
    }
    const score = await contract.get_score()
    const tick = await contract.get_total_tick()
    const towers = await contract.get_towers()

    Object.assign(this, {
      finished: await contract.get_is_finished(),
      score: score.toNumber(),
      wave,
      life: await contract.get_life(),
      tick: tick.toNumber(),
      towers: new Map(
        towers
          .map(parse_struct)
          .map(tower => {
            const tile_index = TOWERS_CELLS.findIndex(
              ({ x, y }) => cell_id({ x, y }) === tower.cell_id
            )
            return [tile_index, new Tower({ tile_index, ...tower })]
          })
          .filter(x => !!x)
      ),
    })

    if (this.finished) this.show_end_sprite(true)
    else if (this.life === 0) this.show_end_sprite(false)
    else {
      this.show_start_wave_button()
      this.show_place_towers_ui()
    }

    Game.set_loading_over()
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
      src: skull_anim,
      x: 35,
      y: MOB_PATH[0].y * TILE_PIXEL_SIZE + TILE_PIXEL_SIZE / 2,
      on_click: () => {
        this.place_tower_text = undefined
        this.place_tower_btn = undefined
        Game.set_loading_syncing()
        Game.globals.contract.once(
          'wave',
          (
            player,
            current_wave,
            mobs,
            towers,
            life_remaining,
            tick,
            won_the_wave,
            score
          ) => {
            if (player === Game.globals.address) {
              const parsed_mobs = mobs.map(parse_struct)
              const parsed_towers = towers.map(parse_struct)
              const parsed_ticks = tick.toNumber()
              const parsed_score = score.toNumber()
              console.dir({
                player,
                current_wave,
                parsed_mobs,
                parsed_towers,
                life_remaining,
                parsed_ticks,
                won_the_wave,
                parsed_score,
              })
              this.wave = current_wave
              this.mobs_amount = parsed_mobs.length
              this.all_spawned = false
              this.start_wave_button = null
              this.started = true
              this.future_score = parsed_score
              Game.set_loading_over()
            }
          }
        )
        Game.globals.contract
          .start_wave()
          .then(Game.set_loading_transaction)
          .catch(Game.set_loading_over)
      },
      frame_max: 13,
      frame_hold: 10,
    })
  }

  show_end_sprite(game_won) {
    this.failed_sprite = new Sprite({
      src: game_won ? win : failed,
      x: Game.globals.width / 2,
      y: Game.globals.height / 2,
      scale: 1,
    })

    Object.assign(this.restart_button, {
      x: Game.globals.width / 2,
      y: Game.globals.height / 2 + 80,
      scale: 0.8,
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
        Game.set_loading_syncing()
        console.log(
          'storing',
          [...this.towers.values()].map(tower => tower.blockchain_tower)
        )
        Game.globals.contract
          .set_towers(
            [...this.towers.values()].map(tower => tower.blockchain_tower)
          )
          .then(Game.set_loading_transaction)
          .catch(Game.set_loading_over)
      },
    })
  }

  spawn_mob() {
    if (this.mobs_spawned >= this.mobs_amount) {
      if (!this.all_spawned) this.all_spawned = true
      return
    }

    this.mobs.push(new Orc(this.wave))
    this.mobs_spawned++
  }

  hit() {
    this.life--
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
    else if (this.restart_button?.collide(mouse)) this.restart_button.on_click()

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
      Game.set_score(NAME, this.future_score)
      this.score = Game.globals.leaderboard.get(NAME)
      this.started = false
      this.mobs_spawned = 0
      if (this.wave >= MAX_WAVES) {
        this.finished = true
        this.show_end_sprite(true)
      } else {
        this.wave++
        this.show_start_wave_button()
        this.show_place_towers_ui()
      }
    } else this.tick++

    if (this.life === 0) {
      this.started = false
      this.show_end_sprite(false)
    }
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
    this.placement_tiles.forEach(tile => tile.draw(c, mouse))
    this.mobs.forEach(mob => mob.draw(c))
    this.towers.forEach(tower => tower.draw(c, mouse))
    this.failed_sprite?.draw(c)

    if (!Game.globals.loading_state) {
      this.start_wave_button?.draw(c)
      this.place_tower_text?.draw(c)
      this.place_tower_btn?.draw(c)
      this.restart_button?.draw(c)
      this.static_sprites.forEach(sprite => sprite.draw(c))
    }
  }
}
