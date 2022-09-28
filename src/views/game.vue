<script setup>
import { onMounted, ref } from 'vue'
import TWEEN from '@tweenjs/tween.js'
import { ethers } from 'ethers'

import switch_network from '../core/switch_network.js'
import {
  TILE_PIXEL_SIZE,
  TICK_TIME,
  MAP_WIDTH,
  MAP_HEIGHT,
} from '../core/constant.js'
import Game from '../core/game/Game.js'
import ABI from '../assets/abi.json'

const {
  VITE_CHAIN_ID = 31337,
  VITE_CONTRACT_ADDRESS = '0x8A791620dd6260079BF849Dc5567aDC3F2FdC318',
} = import.meta.env

const cvs = ref()
const show_canvas = ref(true)

const connect = async () => {
  await switch_network(+VITE_CHAIN_ID)

  const network = window.ethereum.networkVersion
  console.log('current network', +network)
  show_canvas.value = +network === +VITE_CHAIN_ID
  const provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
  await provider.send('eth_requestAccounts', [])
  provider.on('network', new_network => {
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    show_canvas.value = +new_network.chainId === +VITE_CHAIN_ID
  })
  window.ethereum.on('accountsChanged', () => {
    alert(
      'metamask account changed, to logout or use another address please disconnect this app in the metamask interface first'
    )
  })
  if (show_canvas.value)
    return new ethers.Contract(VITE_CONTRACT_ADDRESS, ABI, provider.getSigner())
}

onMounted(async () => {
  if (!network.ethereum) {
    show_canvas.value = false
    return
  }
  const contract = await connect()
  if (!contract) return
  const address = await contract.signer.getAddress()
  const canvas = cvs.value
  if (!canvas) return
  canvas.width = MAP_WIDTH * TILE_PIXEL_SIZE
  canvas.height = MAP_HEIGHT * TILE_PIXEL_SIZE

  /** @type {CanvasRenderingContext2D} */
  const c = canvas.getContext('2d')
  c.font = '20px Raleway'
  c.textAlign = 'center'
  const game = new Game({ contract, address, canvas })
  await game.load()

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
  .pepe #[b PePe]Defense.io
  canvas(ref="cvs" v-if="show_canvas")
  div(v-else) #[b Wrong network] please install or configure metamask to use the Polygon chain and reload the page
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
    border-radius 12px
    box-shadow 1px 2px 5px black
  div
    text-shadow 1px 2px 3px black
    color white
    font-size 2em
    padding 2em
    display flex
    flex-flow column nowrap
    b
      font-weight 900
      color crimson
    &.pepe
      flex-flow row nowrap
      padding .5em
      b
        color green
</style>
