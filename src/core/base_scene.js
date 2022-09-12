import { Scene, Cameras } from 'phaser'

import map from '../assets/map.json' assert { type: 'json' }
import TX_Plant from '../assets/TX Plant.png'
import TX_Props from '../assets/TX Props.png'
import TX_Struct from '../assets/TX Struct.png'
import TX_Grass from '../assets/TX Tileset Grass.png'
import TX_Stone from '../assets/TX Tileset Stone Ground.png'
import TX_Wall from '../assets/TX Tileset Wall.png'
import tree_1 from '../assets/tree_1.png'
import tree_2 from '../assets/tree_2.png'
import tree_3 from '../assets/tree_3.png'

const scene = new Scene({ key: 'base_scene' })
const Tiles = [
  'TX Props',
  'TX Struct',
  'TX Tileset Grass',
  'TX Tileset Stone Ground',
  'TX Tileset Wall',
]

const Layers = [
  'ground',
  'plants',
  'columns',
  'towers',
  'walls',
  'misc',
  'walls2',
  'particles',
]

let controls

export default Object.assign(scene, {
  preload() {
    scene.load.image(Tiles[0], TX_Props)
    scene.load.image(Tiles[1], TX_Struct)
    scene.load.image(Tiles[2], TX_Grass)
    scene.load.image(Tiles[3], TX_Stone)
    scene.load.image(Tiles[4], TX_Wall)
    scene.load.image('tree_1', tree_1)
    scene.load.image('tree_2', tree_2)
    scene.load.image('tree_3', tree_3)
    scene.load.tilemapTiledJSON('map', map)
  },
  create() {
    const tilemap = scene.make.tilemap({ key: 'map' })
    const tiles = Tiles.map(name => tilemap.addTilesetImage(name, name))
    const layers = Layers.map(name => tilemap.createLayer(name, tiles))
    const camera = scene.cameras.main

    const trees = [
      ...tilemap.createFromObjects('trees', { gid: 1153, key: 'tree_1' }),
      ...tilemap.createFromObjects('trees', { gid: 1154, key: 'tree_2' }),
      ...tilemap.createFromObjects('trees', { gid: 1155, key: 'tree_3' }),
    ].forEach(tree => {
      tree.depth = tree.y
    })

    // scene.cameras.main.setBounds(
    //   0,
    //   0,
    //   tilemap.widthInPixels,
    //   tilemap.heightInPixels
    // )

    scene.add
      .text(16, 16, 'Arrow keys to scroll', {
        fontSize: '100px',
        padding: { x: 10, y: 5 },
        backgroundColor: '#000000',
        fill: '#ffffff',
      })
      .setScrollFactor(0)

    scene.input.on('pointermove', p => {
      if (!p.isDown) return

      camera.scrollX -= p.x - p.prevPosition.x
      camera.scrollY -= p.y - p.prevPosition.y
    })
  },
})
