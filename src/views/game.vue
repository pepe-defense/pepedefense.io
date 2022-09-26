<script setup>
import { onMounted, ref } from 'vue'
import TWEEN from '@tweenjs/tween.js'
import { ethers } from 'ethers'

import abi from '../assets/abi.json'
import switch_network from '../core/switch_network.js'
import {
  TILE_PIXEL_SIZE,
  TICK_TIME,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../core/constant.js'
import Game from '../core/game/Game.js'
const cvs = ref()

const connect = async () => {
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
  provider.on('network', (_, oldNetwork) => {
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    if (oldNetwork) {
      setTimeout(() => switch_network('mumbai'), 1000)
      window.location.reload()
    }
  })
  await switch_network('mumbai')
  await provider.send('eth_requestAccounts', [])
  return new ethers.Contract(
    '0xF23214DDb8beBAe7d54b96309cE7EE5Bd9081ca3',
    abi,
    provider.getSigner()
  )
}

onMounted(async () => {
  const contract = await connect()
  const address = await contract.signer.getAddress()
  const canvas = cvs.value
  canvas.width = MAP_WIDTH * TILE_PIXEL_SIZE
  canvas.height = MAP_HEIGHT * TILE_PIXEL_SIZE

  /** @type {CanvasRenderingContext2D} */
  const c = canvas.getContext('2d')
  c.font = '20px Raleway'
  c.textAlign = 'center'
  const game = new Game({ contract, address, canvas })
  const wave = await contract.get_wave()

  if (wave > 0) game.load_game(wave)

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
