import Game from './Game.js'

export default class Text {
  constructor({ x, y, text, icon, scale = 1, offset_y = 5, align = 'left' }) {
    if (icon) {
      this.img = new Image()
      this.img.src = icon
    }

    Object.assign(this, { x, y, text, scale, offset_y, align })
  }

  total_width(text_width) {
    const img_width = (this.img?.width ?? 0) * this.scale
    const width = text_width + img_width * 0.8
    return width + 10 + img_width / 3
  }

  draw_tick = 0

  draw(/** @type {CanvasRenderingContext2D} */ c) {
    if (this.draw_tick >= 1_000_000) this.draw_tick = 0

    const text =
      typeof this.text === 'string' ? this.text : this.text(this.draw_tick++)
    const { width: text_width } = c.measureText(text)
    const img_width = (this.img?.width ?? 0) * this.scale
    const img_height = (this.img?.height ?? 0) * this.scale
    const width = text_width + img_width * 0.8
    const total_width = this.total_width(text_width)

    const x = this.align === 'center' ? this.x + 5 - total_width / 2 : this.x

    c.fillStyle = 'rgba(0,0,0,0.85)'
    c.beginPath()
    c.roundRect(x, this.y, width + 10, 25, [7])
    c.fill()
    c.fillStyle = 'white'
    c.textAlign = this.align
    c.fillText(text, this.x + 5 + img_width * 0.8, this.y + 18)
    if (this.img)
      c.drawImage(
        this.img,
        0,
        0,
        this.img.width,
        this.img.height,
        this.x - img_width / 3,
        this.y - this.offset_y,
        img_width,
        img_height
      )
  }

  static create_loader() {
    let loading_dots = 0
    const x = Game.globals.width / 2
    const y = Game.globals.height / 2
    return new Text({
      x,
      y,
      text: tick => {
        if (tick % 30 === 0) {
          loading_dots++
          if (loading_dots >= 5) loading_dots = 0
        }
        return `Waiting transaction confirmation${'.'.repeat(loading_dots)}`
      },
      align: 'center',
    })
  }
}
