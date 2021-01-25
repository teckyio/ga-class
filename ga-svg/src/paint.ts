import { colorToHex, Gene, Triangle } from './gene'

export let canvasConfig = {
  canvas: null as HTMLCanvasElement,
  ctx: null as CanvasRenderingContext2D,
  width: 0,
  height: 0,
}

export function clearCanvas() {
  let ctx = canvasConfig.ctx
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvasConfig.width, canvasConfig.height)
}

export function paintGene(ctx: CanvasRenderingContext2D, gene: Gene) {
  clearCanvas()
  gene.triangles.forEach(triangle => paintTriangle(ctx, triangle))

}

function paintTriangle(ctx: CanvasRenderingContext2D, triangle: Triangle) {
  ctx.beginPath()
  ctx.moveTo(triangle.points[0].x, triangle.points[0].y)
  ctx.lineTo(triangle.points[1].x, triangle.points[1].y)
  ctx.lineTo(triangle.points[2].x, triangle.points[2].y)
  ctx.closePath()

  ctx.lineWidth = triangle.lineWidth
  ctx.strokeStyle = colorToHex(triangle.strokeColor)
  ctx.stroke()

  ctx.fillStyle = colorToHex(triangle.fillColor)
  ctx.fill()
}
