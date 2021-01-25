import { Triangle, colorToHex, randomTriangle, geneRange } from './gene'
import { initSeed, evaluate, select, crossover, mutate, gaConfig } from './ga'
import { canvasConfig, clearCanvas } from './paint'
import { generateEnvModule } from 'snowpack/lib/build/build-import-proxy'
import { cloneImageData, getImageData } from './image'

console.log('ts')

let startButton = document.querySelector('button.start') as HTMLButtonElement
let poolCanvas = document.querySelector('canvas.pool') as HTMLCanvasElement
let widthInput = document.querySelector('input#width') as HTMLInputElement
let heightInput = document.querySelector('input#height') as HTMLInputElement

let targetSizeSpan = document.querySelector('.size.target') as HTMLSpanElement
let targetImg = document.querySelector('img.target') as HTMLImageElement
let targetUrl = document.querySelector(
  'input[type=url].target',
) as HTMLInputElement
let targetFile = document.querySelector(
  'input[type=file].target',
) as HTMLInputElement
let targetWidth: number
let targetHeight: number

canvasConfig.canvas = poolCanvas
canvasConfig.ctx = poolCanvas.getContext('2d')

startButton.addEventListener('click', start)

targetImg.addEventListener('load', resizeImage)

targetUrl.addEventListener('change', () => {
  targetImg.src = targetUrl.value
})

targetFile.addEventListener('change', () => {
  let file = targetFile.files.item(0)
  let reader = new FileReader()
  reader.onload = () => {
    targetImg.src = reader.result.toString()
  }
  reader.readAsDataURL(file)
})

widthInput.addEventListener('change', resizeCanvas)
heightInput.addEventListener('change', resizeCanvas)

function start() {
  resizeCanvas()
  let ctx = canvasConfig.ctx
  let w = geneRange.MaxWidth
  let h = geneRange.MaxHeight
  ctx.drawImage(targetImg, 0, 0, w, h)
  let imageData = ctx.getImageData(0, 0, w, h)
  imageData = cloneImageData(imageData)
  gaConfig.targetImageData = imageData
  console.log('target image data', imageData)

  // test loop
  clearCanvas()
  initSeed()
  loop()
}

function loop() {
  evaluate()
  select()
  crossover()
  mutate()
  requestAnimationFrame(loop)
}

function resizeImage() {
  targetWidth = targetImg.naturalWidth
  targetHeight = targetImg.naturalHeight
  resizeGeneRange()
  targetSizeSpan.textContent = targetWidth + 'x' + targetHeight
}

function resizeCanvas() {
  canvasConfig.width = widthInput.valueAsNumber
  canvasConfig.height = heightInput.valueAsNumber
  poolCanvas.width = canvasConfig.width
  poolCanvas.height = canvasConfig.height
  resizeGeneRange()
}

function resizeGeneRange() {
  geneRange.MaxWidth = Math.min(targetWidth, canvasConfig.width)
  geneRange.MaxHeight = Math.min(targetHeight, canvasConfig.height)
  // geneRange.MaxThickness = Math.max(geneRange.MaxWidth, geneRange.MaxHeight)
  geneRange.MaxThickness = 10
}

resizeCanvas()
resizeImage()
