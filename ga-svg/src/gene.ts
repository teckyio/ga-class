export type Gene = {
  triangles: Triangle[]
  fitness?: number
  survive?: boolean
}
export type Triangle = {
  points: Point[]
  fillColor: Color
  strokeColor: Color
  lineWidth: number
}
export type Point = {
  x: number
  y: number
}
export type Color = {
  r: number
  g: number
  b: number
}

export let geneRange = {
  NTriangle: 20,
  MaxWidth: 0,
  MaxHeight: 0,
  MaxThickness: 0,
}

export function randomGene(): Gene {
  let gene: Gene = { triangles: [] }
  for (let i = 0; i < geneRange.NTriangle; i++) {
    gene.triangles.push(randomTriangle())
  }
  return gene
}

export function randomTriangle(): Triangle {
  return {
    fillColor: randomColor(),
    strokeColor: randomColor(),
    lineWidth: randomInt(geneRange.MaxThickness),
    points: [
      randomPoint(geneRange.MaxWidth, geneRange.MaxHeight),
      randomPoint(geneRange.MaxWidth, geneRange.MaxHeight),
      randomPoint(geneRange.MaxWidth, geneRange.MaxHeight),
    ],
  }
}

export function randomPoint(W: number, H: number): Point {
  return {
    x: randomInt(W),
    y: randomInt(H),
  }
}

export function randomColor(): Color {
  return {
    r: randomInt(256),
    g: randomInt(256),
    b: randomInt(256),
  }
}

export function randomInt(n: number): number {
  return Math.floor(Math.random() * n)
}

export function colorToHex(color: Color) {
  return '#' + numToHex(color.r) + numToHex(color.g) + numToHex(color.b)
}

function numToHex(num: number) {
  if (num < 16) {
    return '0' + num.toString(16)
  } else {
    return num.toString(16)
  }
}



