import PathFollower from 'phaser3-rex-plugins/plugins/pathfollower.js'
import { Math, Curves } from 'phaser'

import { curve, MOB_BASE_SPEED, MOB_SPEED_MODIFIER } from './constant.js'

export default ({ scene, points, wave }) => {
  const animation = scene.anims.create({
    key: 'walk',
    frames: scene.anims.generateFrameNumbers('orc'),
    frameRate: 16,
  })

  const sprite = scene.add.sprite(50, 300, 'orc')
  const path = new Curves.Spline(
    points
      .sort((p1, p2) => +p1.name - +p2.name)
      .map(point => new Math.Vector2(point.x, point.y))
  )

  console.log(path)

  sprite.play({ key: 'walk', repeat: -1 })

  sprite.flipX = true
  sprite.scale = 0.25

  const duration = curve({
    mod: MOB_SPEED_MODIFIER,
    base: MOB_BASE_SPEED,
    wave,
  })

  scene.tweens
    .add({
      targets: new PathFollower(sprite, {
        path,
        t: 0,
        rotateToPath: false,
        rotationOffset: 0,
        angleOffset: 0,
        spacedPoints: true,
      }),
      t: 1,
      duration: 60_000,
      ease: 'Linear',
    })
    .on('start', () => {})
    .on('complete', () => sprite.destroy())
    .on('update', (tween, key, target, current, previous) => {
      if (sprite.x < target.last_x && !sprite.flipX) {
        // going right
        sprite.flipX = true
        sprite.setOrigin(0.5, 0.5)
      } else if (sprite.x >= target.last_x && sprite.flipX) {
        // going left
        sprite.flipX = false
        sprite.setOrigin(0, 0.5)
      }
      target.last_x = sprite.x
    })
}
