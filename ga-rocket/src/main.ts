console.log('ga-rocket.ts')

let seedBtn = document.querySelector('.controls button.seed') as HTMLButtonElement
let evolveBtn = document.querySelector('.controls button.evolve') as HTMLButtonElement
let pauseBtn = document.querySelector('.controls button.pause') as HTMLButtonElement
let initialBtn = document.querySelector('.controls button.initial') as HTMLButtonElement
let targetBtn = document.querySelector('.controls button.target') as HTMLButtonElement
let barrierBtn = document.querySelector('button.barrier') as HTMLButtonElement
let eraserBtn = document.querySelector('button.eraser') as HTMLButtonElement
let buttons = [seedBtn, evolveBtn, pauseBtn, initialBtn, targetBtn, barrierBtn, eraserBtn]


let populationInput = document.querySelector('.parameters input.population') as HTMLInputElement
let movesInput = document.querySelector('.parameters input.moves') as HTMLInputElement
let stepsInput = document.querySelector('.parameters input.steps') as HTMLInputElement

let surviveInput = document.querySelector('.parameters input.survive') as HTMLInputElement
let mutateRateInput = document.querySelector('.parameters input.mutate_rate') as HTMLInputElement
let mutateAmountInput = document.querySelector('.parameters input.mutate_amount') as HTMLInputElement

let canvas = document.querySelector('canvas#world') as HTMLCanvasElement
let ctx = canvas.getContext('2d')

let started = false
let penMode: 'initial' | 'target' | 'barrier' | 'eraser' | null = null
let penDown = false

buttons.forEach(button => button.addEventListener('click', () => setMode(button)))

function setMode(button: HTMLButtonElement) {
  buttons.forEach(button => button.classList.remove('active'))
  button.classList.add('active')

  penMode = null

  switch (button) {
    case seedBtn:
      seed()
      break
    case evolveBtn:
      started = true
      requestAnimationFrame(loop)
      break
    case pauseBtn:
      started = false
      break
    case initialBtn:
      penMode = 'initial'
      break
    case targetBtn:
      penMode = 'target'
      break
    case barrierBtn:
      penMode = 'barrier'
      break
    case eraserBtn:
      penMode = 'eraser'
      break
  }

  evolveBtn.disabled = started
  pauseBtn.disabled = !started
}

setMode(pauseBtn)

window.addEventListener('resize', resize)
resize()

canvas.addEventListener('mousedown', () => penDown = true)
canvas.addEventListener('mouseup', () => penDown = false)
canvas.addEventListener('mousemove', (event) => {
  if (penDown) {
    clickCanvas(event)
  }
})
canvas.addEventListener('click', clickCanvas)

function clickCanvas(event: MouseEvent) {
  if (!penMode) return
  let rect = canvas.getBoundingClientRect()
  let x = event.clientX - rect.left
  let y = event.clientY - rect.top
  let point = { x, y }
  console.log('click', point)
  switch (penMode) {
    case 'initial':
      userInitial = point
      break
    case 'target':
      userGoal = point
      break
    case 'barrier':
      barriers.push(point)
      break
    case 'eraser':
      barriers = barriers.filter(barrier => !isCloseToBarrier(barrier, point))
      break
  }
  paint()
}

function resize() {
  console.log('resize')
  canvas.removeAttribute('width')
  canvas.removeAttribute('height')
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
}

function paintBackground() {
  ctx.fillStyle = 'black'
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

class RocketGA {
  static Population_Size = 20
  static Tick_Step = 10000
  static Survive_Rate = 0.99
  static Mutation_Rate = 0.1
  static Mutation_Amount = 0.1


  population: Rocket[]

  seed() {
    this.population = []
    this.addSeed(RocketGA.Population_Size)
  }

  addSeed(n: number) {
    for (let i = 0; i < n; i++) {
      for (let i = 0; i < n; i++) {
        this.population.push(Rocket.random())
      }
    }
  }

  evaluate(done: VoidFunction) {
    // TODO evaluate
    let initialPoint = initialPosition()
    this.population.forEach(rocket => rocket.init(initialPoint))
    this.tick(0, () => {
      let goal = goalPosition()
      this.population.forEach(rocket => {
        // TODO set fitness
        rocket.fitness = 1
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


  select() {
    // TODO select
  }

  crossover() {
    // TODO crossover population
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
    // TODO mutate population
  }

  paint() {
    paintBackground()
    paintGoal()
    paintBarriers()
    if (this.population) {
      this.population.forEach(rocket => rocket.paintTrack())
      this.population.forEach(rocket => rocket.paintBody())
    }
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
function randomBool(prob: number): boolean {
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
    return (int < 16 ? '0' : '') + (int << 0).toString(16)
  }

  toHex() {
    return '#'
      + Color.toHex(this.r)
      + Color.toHex(this.g)
      + Color.toHex(this.b)
  }

  crossover(a: Color, b: Color) {
    // TODO crossover color
  }

  mutate(mutationAmount: number) {
    // TODO mutate color
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
    // TODO crossover move
  }

  mutate(amount: number) {
    // TODO mutate move
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

  resize() {
    while (RocketGene.N_Move > this.moves.length) {
      this.moves.push(Move.random())
    }
    while (RocketGene.N_Move < this.moves.length) {
      this.moves.pop()
    }
  }

  crossover(a: RocketGene, b: RocketGene) {
    // TODO crossover gene
  }

  mutate(prob, amount) {
    // TODO mutate gene
  }
}

let userInitial: Point

function initialPosition(): Point {
  if (userInitial) {
    return userInitial
  }
  return {
    x: canvas.width / 2,
    y: canvas.height - Rocket.Body_Size * 2,
  }
}

const Barrier_Size = 10
const Barrier_Color = 'red'
let barriers: Point[] = []

function isCloseToAnyBarrier(point: Point) {
  return barriers.some(barrier => calcDistanceSquare(barrier, point) < Barrier_Size ** 2)
}

function isCloseToBarrier(barrier: Point, point: Point) {
  return calcDistanceSquare(barrier, point) < Barrier_Size ** 2
}

function paintBarriers() {
  ctx.lineWidth = Barrier_Size / 4
  ctx.strokeStyle = Barrier_Color
  barriers.forEach(barrier => paintRect(barrier, Barrier_Size))
}

const Goal_Size = 20
const Goal_Color = 'cyan'
let userGoal: Point

function goalPosition(): Point {
  if (userGoal) {
    return userGoal
  }
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
  if (!'lower-right') {
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
  static Track_Size = 2

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
  hitWall: boolean

  init(position: Point) {
    this.position = {
      x: position.x,
      y: position.y,
    }
    this.track = [position]
    this.hitWall = false
  }

  move(time: number) {
    if (this.hitWall) return
    let index = time % this.gene.moves.length
    let move = this.gene.moves[index]
    this.position.x += move.x
    this.position.y += move.y
    this.track.push({
      x: this.position.x,
      y: this.position.y,
    })
    if (isCloseToAnyBarrier(this.position)) {
      this.hitWall = true
    }
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

let Max_Generation = 100000000

let ga = new RocketGA()
let generation: number

function loop() {
  if (!started) return
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

function seed() {
  generation = 0
  ga.seed()
}

function paint() {
  ga.paint()
}

paint()

function formatRate(rate: number) {
  return Math.round(rate * 100 * 100) / 100 + '%'
}

function formatNumber(value: number) {
  return value + ''
}

function toNumber(input: HTMLInputElement) {
  let value = input.value
  if (value.includes('%')) {
    return +value.replace('%', '') / 100
  }
  return +value
}

function bindInput<T extends object>(props: {
  input: HTMLInputElement,
  object: T
  key: keyof T
  onChange?: (value: number) => void
  format?: (value: number) => string
}) {
  let format = props.format || formatNumber
  props.input.value = format(props.object[props.key] as any)
  props.input.addEventListener('change', () => {
    let value = toNumber(props.input)
    props.object[props.key] = value as any
    props.onChange?.(value)
  })
}

function bindInputs() {

  bindInput({
    input: populationInput,
    object: RocketGA,
    key: 'Population_Size',
    onChange(Population_Size) {
      if (Population_Size > ga.population.length) {
        ga.addSeed(Population_Size - ga.population.length)
        return
      }
      if (Population_Size < ga.population.length) {
        ga.population.splice(0, ga.population.length - Population_Size)
        return
      }
    },
  })

  bindInput({
    input: movesInput,
    object: RocketGene,
    key: 'N_Move',
    onChange: () => ga.population?.forEach(rocket => rocket.gene.resize()),
  })

  bindInput({
    input: stepsInput,
    object: RocketGA,
    key: 'Tick_Step',
  })

  bindInput({
    input: surviveInput,
    object: RocketGA,
    key: 'Survive_Rate',
    format: formatRate,
  })

  bindInput({
    input: mutateRateInput,
    object: RocketGA,
    key: 'Mutation_Rate',
    format: formatRate,
  })

  bindInput({
    input: mutateAmountInput,
    object: RocketGA,
    key: 'Mutation_Amount',
    format: formatRate,
  })
}

bindInputs()
