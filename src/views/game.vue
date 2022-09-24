<script setup>
import { onMounted, ref } from 'vue'
import TWEEN from '@tweenjs/tween.js'

import {
  TILE_PIXEL_SIZE,
  TICK_TIME,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../core/constant.js'
import Game from '../core/Game.js'
const cvs = ref()

onMounted(() => {
  const canvas = cvs.value
  canvas.width = MAP_WIDTH * TILE_PIXEL_SIZE
  canvas.height = MAP_HEIGHT * TILE_PIXEL_SIZE

  /** @type {CanvasRenderingContext2D} */
  const c = canvas.getContext('2d')
  c.font = '35px Raleway'
  c.textAlign = 'center'
  const game = new Game(canvas.width, canvas.height)

  canvas.addEventListener('mousemove', ({ clientX, clientY }) => {
    const { top, left } = cvs.value.getBoundingClientRect()
    Game.globals.mouse = {
      x: clientX - left,
      y: clientY - top,
    }
  })

  canvas.addEventListener('click', () => {
    game.on_click()
  })

  let last_tick = 0

  function animate(time) {
    const elapsed = Date.now() - last_tick
    if (elapsed >= TICK_TIME) {
      last_tick = Date.now()
      game.on_tick()
    }
    game.on_render(c)
    TWEEN.update(time)
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
.game__container
  display flex
  width 100vw
  height 100vh
  justify-content center
  align-items center
  flex-flow column nowrap
  .infos
    display flex
    flex-flow row nowrap
    color white
    margin-bottom .5em
    .leaderboard
      display flex
      flex-flow column nowrap
      .entry
        font-size .7em
        padding .25em
        margin .25em
        border 1px solid gold


    .life
      padding 0 1em
  canvas
    background black
    // width 100%
    // height 100%
</style>
