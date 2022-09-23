export default class {
  constructor(src, loop) {
    const sound = document.createElement('audio')
    this.sound = sound

    sound.src = src
    sound.setAttribute('preload', 'auto')
    sound.setAttribute('controls', 'none')
    sound.style.display = 'none'
    sound.loop = !!loop

    document.body.appendChild(sound)
    if (!loop)
      sound.addEventListener('ended', () => document.body.removeChild(sound))
  }

  play() {
    this.sound.play()
  }

  stop() {
    this.sound.pause()
  }
}
