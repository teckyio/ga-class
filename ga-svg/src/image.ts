import { geneRange } from './gene'
import { canvasConfig } from './paint'

export function cloneImageData(data: ImageData): ImageData {
  return {
    width: data.width,
    height: data.height,
    data: data.data.slice(),
  }
}

export function getImageData(image): ImageData {
  let w = geneRange.MaxWidth
  let h = geneRange.MaxHeight
  let ctx = canvasConfig.ctx
  ctx.drawImage(image, 0, 0, w, h)
  return ctx.getImageData(0, 0, w, h)
}
