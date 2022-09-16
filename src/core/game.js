import {
  curve,
  MAX_WAVES,
  MOB_AMOUNT_MODIFIER,
  MOB_BASE_AMOUNT,
  MOB_BASE_DAMAGE,
  MOB_BASE_LIFE,
  MOB_BASE_SPEED,
  MOB_LIFE_MODIFIER,
  MOB_SPEED_MODIFIER,
} from './constant.js'

const default_state = () => ({
  wave: 1,
  life: 10,
  finished: false,
  score: 0,
  total_tick: 0,
  towers: [],
  mobs: [],
  mobs_spawned: 0,
  mobs_amount: 0,
  mobs_path: [],
})

const Modifiers = state => ({
  not_last_wave: () => {
    if (state.wave >= MAX_WAVES) throw 'There is no more waves'
    return Modifiers(state)
  },
  game_started: () => {
    if (state.wave < 1) throw 'The game must be started'
    return Modifiers(state)
  },
  not_dead: () => {
    if (state.life < 1) throw 'The game is over'
    return Modifiers(state)
  },
})

const wave_in_progress = state => {
  if (state.life < 1) return false
  if (state.all_spawned) return true

  return state.mobs.some(mob => !!mob.life)
}

const tower_can_fire =
  ({ tick }) =>
  tower =>
    tower.last_fired + tower.fire_rate <= tick

const is_in_range = tower => mob =>
  Math.hypot(mob.x - tower.x, mob.y - tower.y) <= tower.range

const Handlers = emitter => ({
  spawn_mobs: state => {
    if (state.mobs_spawned >= state.mobs_amount) return state
    const { wave } = state
    const mob = {
      life: curve({ base: MOB_BASE_LIFE, mod: MOB_LIFE_MODIFIER, wave }),
      speed: curve({
        base: MOB_BASE_SPEED,
        mod: MOB_SPEED_MODIFIER,
        wave,
      }),
      damage: MOB_BASE_DAMAGE,
      target_point: 1,
    }
    const next_state = {
      ...state,
      mobs_spawned: state.mobs_spawned + 1,
      mobs: [...state.mobs, mob],
    }
    emitter.emit('spawn_mob', { mob, state: next_state })
    return next_state
  },
  compute_towers: previous_state =>
    previous_state.towers.filter(tower_can_fire(previous_state)).reduce(
      (state, tower) => ({
        ...state,
        mobs: state.mobs.map(mob => {
          if (!mob.reached_goal && mob.life > 0 && is_in_range(tower)) {
            tower.last_fired = state.tick
            emitter.emit('damage_mob', { tower, mob, state })
            return {
              ...mob,
              life: mob.life - tower.damage,
            }
          }
          return mob
        }),
      }),
      previous_state
    ),
  compute_mobs: previous_state =>
    previous_state.mobs.reduce((state, mob) => {
      if (!mob.reached_goal && mob.life > 0) {
        mob.target_point += mob.speed
        emitter.emit('mob_move', { mob, state })
        if (mob.target_point >= state.mobs_path.length) {
          mob.reached_goal = true
          const next_state = {
            ...state,
            life: state.life - mob.damage,
          }
          emitter.emit('mob_reached_goal', { mob, state: next_state })
          return next_state
        }
      }
      return state
    }, previous_state),
})

const tick = (previous_state, emitter) => {
  if (wave_in_progress(previous_state))
    tick(
      Object.values(Handlers()).reduce(
        (state, handler) => handler(state, emitter),
        previous_state
      ),
      emitter
    )
}

const Game = state => ({
  reset: () => Game(default_state()),
  place_tower: ({ id, tower }) =>
    Game({
      ...state,
      towers: [
        ...state.towers.slice(0, id),
        tower,
        ...state.towers.slice(id, -1),
      ],
    }),
  start_wave: tick_emitter => {
    Modifiers(state).not_dead().game_started().not_last_wave()
    state.mobs_amount = curve({
      base: MOB_BASE_AMOUNT,
      mod: MOB_AMOUNT_MODIFIER,
      wave: state.wave,
    })
    tick(state, tick_emitter)
  },
})
