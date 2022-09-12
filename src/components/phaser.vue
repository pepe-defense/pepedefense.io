<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue'
import Phaser from 'phaser'

import base_scene from '../core/base_scene.js'

const canvas = ref()
const phaser = inject('game')
const SIZE = 960 * 2

onMounted(() => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: SIZE,
    height: SIZE,
    pixelArt: true,
    parent: canvas.value.el,
    // scale: {
    //   mode: Phaser.Scale.ENVELOP,
    //   autoCenter: Phaser.Scale.CENTER_BOTH,
    // },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false,
      },
    },
    scene: [base_scene],
  })

  phaser.value = game
})

onUnmounted(() => {
  phaser.value?.destroy(false)
})
</script>

<template lang="pug">
div(ref="canvas")
</template>
