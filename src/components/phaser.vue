<script setup>
import { inject, onMounted, onUnmounted, ref } from 'vue'
import Phaser from 'phaser'

import base_scene from '../core/base_scene.js'

const canvas = ref()
const phaser = inject('game')

onMounted(() => {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    pixelArt: true,
    parent: canvas.value,
    scale: {
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
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
