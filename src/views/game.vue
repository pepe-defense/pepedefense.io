<script setup>
import { onMounted, reactive, ref } from 'vue'
import TWEEN from '@tweenjs/tween.js'

import {
  TILE_PIXEL_SIZE,
  TICK_TIME,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../core/constant.js'
import Game from '../core/Game.js'
const cvs = ref()
const state = reactive({
  life: 0,
  wave: 0,
})

onMounted(() => {
  const canvas = cvs.value
  canvas.width = MAP_WIDTH * TILE_PIXEL_SIZE
  canvas.height = MAP_HEIGHT * TILE_PIXEL_SIZE

  /** @type {CanvasRenderingContext2D} */
  const c = canvas.getContext('2d')
  const game = new Game(canvas.width, canvas.height)

  // game.place_tower(0)

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
      if (state.life !== game.scene.life) state.life = game.scene.life
      if (state.wave !== game.scene.wave) state.wave = game.scene.wave
    }
    TWEEN.update(time)
    game.on_render(c)
    requestAnimationFrame(animate)
  }

  requestAnimationFrame(animate)
})
</script>

<template lang="pug">
.game__container
  .infos
    .life Life: {{ state.life }}
    .wave Wave: {{ state.wave }}
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
    .life
      padding 0 1em
  canvas
    background black
    // width 100%
    // height 100%
</style>
