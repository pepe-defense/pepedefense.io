import { Scene, Cameras, GameObjects } from 'phaser'

import map from '../assets/map.json' assert { type: 'json' }
import background from '../assets/background.jpeg'
import orc from '../assets/mob_1.png'

import spawn_mob from './spawn_mob.js'
import handle_camera from './handle_camera.js'

const scene = new Scene({ key: 'base_scene' })

class Point extends GameObjects.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y)
    setTimeout(() => this.destroy(), 1)
  }
}

export default Object.assign(scene, {
  preload() {
    scene.load.image('background', background)
    scene.load.spritesheet('orc', orc, {
      frameWidth: 310,
      frameHeight: 298,
    })
    scene.load.tilemapTiledJSON('map', map)
  },
  create() {
    const tilemap = scene.make.tilemap({ key: 'map' })
    tilemap.createFromObjects('background', { gid: 1, key: 'background' })

    const graphics = scene.add.graphics()
    graphics.lineStyle(10, 0xff, 1)

    const towers = tilemap.createFromObjects('towers')
    const points = tilemap.createFromObjects('points', {
      classType: Point,
    })
    const spawn_options = { scene, points, wave: 1 }
    spawn_mob(spawn_options)

    setTimeout(() => spawn_mob(spawn_options), 2000)

    handle_camera({
      scene,
      width: tilemap.widthInPixels,
      height: tilemap.heightInPixels,
    })
  },
})
