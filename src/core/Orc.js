import orc_png from '../assets/orc.png'
import orc_die_png from '../assets/orc_die.png'

import Mob from './Mob.js'

export default class Orc extends Mob {
  constructor(wave) {
    super({
      wave,
      src: orc_png,
      src_die: orc_die_png,
      frame_max: 10,
      scale: 0.12,
      frame_hold: 2,
      frame_die_hold: 7,
      offset_x: 0.3,
    })
  }
}
