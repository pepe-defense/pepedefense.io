<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import TWEEN from '@tweenjs/tween.js'

import {
  TILE_PIXEL_SIZE,
  TICK_TIME,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../core/constant.js'
import Game from '../core/Waves.js'
const cvs = ref()
const mouse = {
  x: 0,
  y: 0,
}
onMounted(() => {
  const canvas = cvs.value
  canvas.width = MAP_WIDTH * TILE_PIXEL_SIZE
  canvas.height = MAP_HEIGHT * TILE_PIXEL_SIZE

  /** @type {CanvasRenderingContext2D} */
  const c = canvas.getContext('2d')
  const game = new Game()

  // game.place_tower(0)

  canvas.addEventListener('mousemove', ({ clientX, clientY }) => {
    const { top, left } = cvs.value.getBoundingClientRect()
    const x = clientX - left
    const y = clientY - top
    Object.assign(mouse, { x, y })
  })

  canvas.addEventListener('click', () => {
    if(!game.started)
  })

  let last_tick = 0

  function animate(time) {
    const elapsed = Date.now() - last_tick
    if (elapsed >= TICK_TIME) {
      last_tick = Date.now()
      game.on_tick()
    }
    TWEEN.update(time)
    game.on_render(c, canvas.width, canvas.height, mouse)
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
})
</script>

<template lang="pug">
.game__container
  canvas(ref="cvs")
</template>

<style lang="stylus" scoped>
b b

.game__container
  display flex
  width 100vw
  height 100vh
  justify-content center
  align-items center
  canvas
    background black
    // width 100%
    // height 100%
</style>
