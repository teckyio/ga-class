console.log('ga-rocket.ts')

let canvas = document.querySelector('canvas#world') as HTMLCanvasElement
let ctx = canvas.getContext('2d')

window.addEventListener('resize', resize)
resize()

function resize() {
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
}

function paintBackground() {
  ctx.fillStyle = 'black'
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

class RocketGA {
  static Tick_Step = 10
  static Survive_Rate = 0.99
  static Mutation_Rate = 0.1
  static Mutation_Amount = 0.05

  population: Rocket[]

  seed(n: number) {
    this.population = []
    for (let i = 0; i < n; i++) {
      this.population.push(Rocket.random())
    }
  }

  evaluate(done: VoidFunction) {
    let initialPoint = initialPosition()
    this.population.forEach(rocket => rocket.init(initialPoint))
    this.tick(0, () => {
      let goalPoint = goalPosition()
      this.population.forEach(rocket => {
        let distanceToGoal = calcDistanceSquare(goalPoint, rocket.position)
        let distanceFromStart = calcDistanceSquare(initialPoint, rocket.position)
        rocket.fitness = 1 / (distanceToGoal + 1) * distanceFromStart
        // rocket.fitness = 1 / (distanceToGoal + 1)
      })
      done()
    })
  }

  tick(time: number, done: VoidFunction) {
    for (let i = 0; i < RocketGA.Tick_Step; i++) {
      if (time >= RocketGene.N_Move) break
      this.population.forEach(rocket => rocket.move(time))
      time++
    }
    this.paint()
    if (time < RocketGene.N_Move) {
      requestAnimationFrame(() => this.tick(time + 1, done))
    } else {
      done()
    }
  }

  selectBySort() {
    this.population.sort((a, b) => a.fitness - b.fitness)

    let numDie = this.population.length * (1 - RocketGA.Survive_Rate)
    for (let i = 0; i < this.population.length; i++) {
      this.population[i].survive = i <= numDie
    }

    // at least two individual survive
    this.population[this.population.length - 1].survive = true
    this.population[this.population.length - 2].survive = true
  }

  selectByChance() {
    let totalFitness = 0
    this.population.forEach(rocket => totalFitness += rocket.fitness)
    let numSurvival = this.population.length * RocketGA.Survive_Rate
    this.population.forEach(rocket => {
      let weight = rocket.fitness / totalFitness
      rocket.survive = randomBool(weight * numSurvival)
    })

    // at least two individual survive
    this.population[0].survive = true
    this.population[1].survive = true
  }

  select() {
    this.selectByChance()
  }

  crossover() {
    this.population.forEach((child, idx) => {
      if (child.survive) return

      let parent1Idx = this.pickParentIdx(idx)
      let parent2Idx = this.pickParentIdx(idx)

      // console.log(idx, '<-', parent1Idx, parent2Idx)

      let parent1 = this.population[parent1Idx]
      let parent2 = this.population[parent2Idx]

      child.gene.crossover(parent1.gene, parent2.gene)
    })
  }

  pickParentIdx(childIdx: number) {
    for (; ;) {
      let idx = randomInt(this.population.length)
      if (idx !== childIdx && this.population[idx].survive) {
        return idx
      }
    }
  }

  mutate() {
    this.population.forEach(rocket => {
      if (!randomBool(RocketGA.Mutation_Rate)) {
        return
      }
      rocket.gene.mutate(RocketGA.Mutation_Rate, RocketGA.Mutation_Amount)
    })
  }

  paint() {
    paintBackground()
    paintGoal()
    this.population.forEach(rocket => rocket.paintTrack())
    this.population.forEach(rocket => rocket.paintBody())
  }
}

/**
 * @return 0..n
 *    including 0
 *    excluding n
 * */
function randomInt(n: number) {
  return Math.floor(Math.random() * n)
}

/**
 * @param prob 0..1
 * */
function randomBool(prob: number) {
  return Math.random() < prob
}

function crossoverNumber(a: number, b: number) {
  if ('random') {
    return Math.random() < 0.5 ? a : b
  }
  if ('average') {
    return (a + b) / 2
  }
}

function minmax(min: number, value: number, max: number) {
  return value < min ? min
    : value > max ? max
      : value
}

class Color {
  r: number
  g: number
  b: number

  static random() {
    let color = new Color()
    color.r = randomInt(256)
    color.g = randomInt(256)
    color.b = randomInt(256)
    return color
  }

  static toHex(int: number) {
    return (int < 16 ? '0' : '') + int.toString(16)
  }

  toHex() {
    return '#'
      + Color.toHex(this.r)
      + Color.toHex(this.g)
      + Color.toHex(this.b)
  }

  crossover(a: Color, b: Color) {
    this.r = crossoverNumber(a.r, b.r)
    this.g = crossoverNumber(a.g, b.g)
    this.b = crossoverNumber(a.b, b.b)
  }

  mutate(mutationAmount: number) {
    this.r = minmax(0, this.r + (Math.random() - 0.5) * 256 * mutationAmount, 255)
    this.g = minmax(0, this.g + (Math.random() - 0.5) * 256 * mutationAmount, 255)
    this.b = minmax(0, this.b + (Math.random() - 0.5) * 256 * mutationAmount, 255)
  }
}

interface Point {
  x: number
  y: number
}

class Move {
  static Max_Move = 10

  // range: -1..1
  x: number
  y: number

  static randomVal() {
    return (Math.random() * 2 - 1) * this.Max_Move
  }

  static random() {
    let move = new Move()
    move.x = this.randomVal()
    move.y = this.randomVal()
    return move
  }

  crossover(a: Move, b: Move) {
    this.x = crossoverNumber(a.x, b.x)
    this.y = crossoverNumber(a.y, b.y)
  }

  mutate(amount: number) {
    this.x = minmax(-1, this.x + Move.randomVal() * amount, 1)
    this.y = minmax(-1, this.y + Move.randomVal() * amount, 1)
  }
}

class RocketGene {
  color: Color
  moves: Move[]
  static N_Move = 500

  static random() {
    let gene = new RocketGene()
    gene.color = Color.random()
    gene.moves = []
    for (let i = 0; i < this.N_Move; i++) {
      gene.moves.push(Move.random())
    }
    return gene
  }

  crossover(a: RocketGene, b: RocketGene) {
    this.color.crossover(a.color, b.color)
    for (let i = 0; i < RocketGene.N_Move; i++) {
      this.moves[i].crossover(a.moves[i], b.moves[i])
    }
  }

  mutate(prob, amount) {
    this.color.mutate(amount)
    this.moves.forEach(move => {
      if (randomBool(prob)) {
        move.mutate(amount)
      }
    })
  }
}

function initialPosition(): Point {
  return {
    x: canvas.width / 2,
    y: canvas.height - Rocket.Body_Size * 2,
  }
}

const Goal_Size = 20
const Goal_Color = 'cyan'

function goalPosition(): Point {
  if (!'top') {
    return {
      x: canvas.width / 2,
      y: Rocket.Body_Size * 2,
    }
  }
  if ('top-right') {
    return {
      x: canvas.width * 3 / 4,
      y: Rocket.Body_Size * 2,
    }
  }
  if (!'center') {
    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
    }
  }
  if (!'center-right') {
    return {
      x: canvas.width * 3 / 4,
      y: canvas.height / 2,
    }
  }
  if ('lower-right') {
    return {
      x: canvas.width * 3 / 4,
      y: canvas.height * 3 / 5,
    }
  }
}

function paintGoal() {
  ctx.lineWidth = Goal_Size / 4
  ctx.strokeStyle = Goal_Color
  paintRect(goalPosition(), Goal_Size)
}

class Rocket {
  static Body_Size = 10
  static Track_Size = 3

  static random() {
    let rocket = new Rocket()
    rocket.gene = RocketGene.random()
    return rocket
  }

  gene: RocketGene
  position: Point
  track: Point[]
  fitness: number
  survive: boolean

  init(position: Point) {
    this.position = {
      x: position.x,
      y: position.y,
    }
    this.track = [position]
  }

  move(time: number) {
    let index = time % this.gene.moves.length
    let move = this.gene.moves[index]
    this.position.x += move.x
    this.position.y += move.y
    this.track.push({
      x: this.position.x,
      y: this.position.y,
    })
  }

  paintTrack() {
    ctx.strokeStyle = this.gene.color.toHex()
    ctx.lineWidth = Rocket.Track_Size / 4

    this.track.forEach(point => paintRect(point, Rocket.Track_Size))
  }

  paintBody() {
    ctx.strokeStyle = this.gene.color.toHex()
    ctx.lineWidth = Rocket.Body_Size / 4

    paintRect(this.position, Rocket.Body_Size)
  }
}

function paintRect(position: Point, size: number) {
  let r = size / 2
  ctx.strokeRect(position.x - r, position.y - r, size, size)
}

function calcDistanceSquare(a: Point, b: Point) {
  let x = a.x - b.x
  let y = a.y - b.y
  return x * x + y * y
}

let Population_Size = 50
let Max_Generation = 100

let ga = new RocketGA()
ga.seed(Population_Size)
let generation = 0

function loop() {
  if (generation >= Max_Generation) {
    return
  }
  generation++
  ga.evaluate(() => {
    ga.select()
    // let numSurvive = 0
    // ga.population.forEach(rocket => numSurvive += rocket.survive ? 1 : 0)
    // console.log('survive:', numSurvive, '/', ga.population.length)
    ga.crossover()
    ga.mutate()
    console.log('generation:', generation, '/', Max_Generation)
    // console.log(ga.population[0])
    requestAnimationFrame(loop)
  })
}

loop()

