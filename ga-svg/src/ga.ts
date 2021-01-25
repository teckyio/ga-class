import { Gene, randomGene, randomTriangle } from './gene'
import { canvasConfig, paintGene } from './paint'

export let gaConfig = {
  populationSize: 100,
  targetImageData: null as ImageData,
  surviveRate: 0.8,
  mutationRate: 0.2,
  mutationAmount: 0.1,
}
let populations: Gene[]

export function initSeed() {
  populations = []
  for (let i = 0; i < gaConfig.populationSize; i++) {
    populations.push(randomGene())
  }
}

export function evaluate() {
  let ctx = canvasConfig.ctx
  let w = canvasConfig.width
  let h = canvasConfig.height
  let targetImageData = gaConfig.targetImageData
  let nDimension = targetImageData.data.length
  populations.forEach(gene => {
    paintGene(ctx, gene)
    let geneImageData = ctx.getImageData(0, 0, w, h)
    let totalSquareError = 0
    for (let i = 0; i < nDimension; i++) {
      let error = geneImageData.data[i] - targetImageData.data[i]
      totalSquareError += error * error
    }
    let meanSquareError = totalSquareError / nDimension
    gene.fitness = 1 / (1 + meanSquareError)
  })
}

export function select() {
  populations.sort((a, b) => a.fitness - b.fitness)
  let worse = populations[0].fitness
  let best = populations[populations.length - 1].fitness
  console.log({ worse: 1 / worse, best: 1 / best })
  let N = populations.length
  for (let i = 0; i < N; i++) {
    populations[i].survive = i / N < gaConfig.surviveRate
  }
}

export function crossover() {
  let N = populations.length
  for (let i = 0; i < N; i++) {
    let gene = populations[i]
    if (gene.survive) {
      continue
    }
    let a = Math.min(i + 1, N - 1)
    let b = Math.min(a + 1, N - 1)
    let parentA = populations[a]
    let parentB = populations[b]
    for (let i = 0; i < gene.triangles.length; i++) {
      if (Math.random() < 0.5) {
        gene.triangles[i] = JSON.parse(JSON.stringify(parentA.triangles[i]))
      } else {
        gene.triangles[i] = JSON.parse(JSON.stringify(parentB.triangles[i]))
      }
    }
  }
}

export function mutate() {
  for (let i = 0; i < populations.length; i++) {
    if (Math.random() < gaConfig.mutationRate) {
      let gene = populations[i]
      for (let i = 0; i < gene.triangles.length; i++) {
        if (Math.random() < gaConfig.mutationAmount) {
          gene.triangles[i] = randomTriangle()
        }
      }
    }
  }
}
