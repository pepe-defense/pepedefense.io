const scale_canvas = scene => {
  const containerWidth = scene.scale.canvas.parentElement.offsetWidth + 1 // + 1 to ensure the size of the camera is not 1px short after rounding
  const containerHeight = scene.scale.canvas.parentElement.offsetHeight + 1 // same

  const gameWidth = scene.scale.gameSize.width
  const gameHeight = scene.scale.gameSize.height
  const gameRatio = gameWidth / gameHeight

  let newWidth = containerWidth
  let newHeight = containerWidth / gameRatio

  if (newHeight < containerHeight) {
    newHeight = containerHeight
    newWidth = containerHeight * gameRatio
  }
  const marginTop = (containerHeight - newHeight) / 2
  const marginLeft = (containerWidth - newWidth) / 2

  // Scale the canvas
  scene.scale.canvas.style.width = Math.round(newWidth) + 'px'
  scene.scale.canvas.style.height = Math.round(newHeight) + 'px'

  // Center it into view
  scene.scale.canvas.style.marginTop = Math.round(marginTop) + 'px'
  scene.scale.canvas.style.marginLeft = Math.round(marginLeft) + 'px'

  const scaleRatioX = marginTop ? containerWidth / gameWidth : 1
  const scaleRatioY = marginLeft ? containerHeight / gameHeight : 1
  const offsetX = Math.floor(-marginLeft / scaleRatioY)
  const offsetY = Math.floor(-marginTop / scaleRatioX)

  // Update the camera size and position
  scene.cameras.main.setViewport(
    offsetX,
    offsetY,
    marginLeft ? gameWidth - offsetX * 2 : gameWidth,
    marginTop ? gameHeight - offsetY * 2 : gameHeight
  )
}

export default ({ scene, width, height }) => {
  const camera = scene.cameras.main

  scene.cameras.main.setBounds(0, 0, width, height)
  scene.scale.displaySize.setAspectRatio(1)

  scale_canvas(scene)

  scene.input.on('pointermove', p => {
    if (!p.isDown) return

    camera.scrollX -= p.x - p.prevPosition.x
    camera.scrollY -= p.y - p.prevPosition.y
  })
}
