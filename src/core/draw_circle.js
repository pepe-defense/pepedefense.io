export default c =>
  ({ x, y }, radius, color, centerize) => {
    c.fillStyle = color
    c.beginPath()
    c.arc(
      centerize ? x - radius / 2 : x,
      centerize ? y - radius / 2 : y,
      radius,
      0,
      Math.PI * 2
    )
    c.fill()
  }
