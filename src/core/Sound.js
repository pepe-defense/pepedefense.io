import Game from './Game.js'

const simple_sounds = new Set()
const looping_sounds = new Set()

export default class {
  constructor(src, loop) {
    if (Game.globals.sound || loop) {
      const sound = document.createElement('audio')
      this.sound = sound

      sound.src = src
      sound.setAttribute('preload', 'auto')
      sound.setAttribute('controls', 'none')
      sound.style.display = 'none'
      sound.loop = !!loop

      document.body.appendChild(sound)
      if (loop) looping_sounds.add(sound)
      else {
        simple_sounds.add(sound)
        sound.addEventListener('ended', () => {
          simple_sounds.delete(sound)
          document.body.removeChild(sound)
        })
      }
    }
  }

  play() {
    if (Game.globals.sound) this.sound.play()
  }

  static allow_sounds(allow) {
    if (allow) looping_sounds.forEach(sound => sound.play())
    else {
      looping_sounds.forEach(sound => sound.pause())
      simple_sounds.forEach(sound => sound.remove())
      simple_sounds.clear()
    }
  }
}
