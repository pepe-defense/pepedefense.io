<script setup>
import { provide, ref } from 'vue'

import Phaser from '../components/phaser.vue'

const game = ref()

provide('game', game)
</script>

<template lang="pug">
.game__container
  Suspense
    Phaser
    template(#fallback)
      .placeholder Downloading..
</template>

<style lang="stylus" scoped>

.game__container
  display flex
  width 100vw
  height 100vh
  justify-content center
  align-items center
  .placeholder
    font-size 2rem
</style>
