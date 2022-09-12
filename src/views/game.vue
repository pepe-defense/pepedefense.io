<script setup>
import { provide, ref } from 'vue'

import Phaser from '../components/phaser.vue'

const game = ref()

provide('game', game)
</script>

<template lang="pug">
Suspense
  Phaser
  template(#fallback)
    .placeholder Downloading..
</template>

<style lang="stylus" scoped>
.placeholder
  font-size 2rem

div
  color gold
</style>
