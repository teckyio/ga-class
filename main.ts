import { to_csv, json_to_csv } from '@beenotung/tslib/csv';
import { writeFileSync } from 'fs';

// y = 3 x^2 + 5 x + 6
// minimize y
function question(x: number) {
  return 3 * x * x + 5 * x + 6;
}

class Gene {
  x: number;
  fitness: number;
  dead = false;

  constructor() {
    let number = Math.random(); // 0 .. 1
    number -= 0.5; // -0.5 .. 0.5
    number *= 2 * 500; // -500 .. 500
    this.x = number;
  }
}

class Population {
  gene_list: Gene[];
  population_size: number;

  cross_over_rate = 0.9;
  mutation_rate = 0.1;
  mutation_amount = 0.2;

  best_gene: Gene;

  seed(n: number) {
    this.population_size = n;
    this.gene_list = [];
    for (let i = 0; i < n; i++) {
      let gene = new Gene();
      this.gene_list.push(gene);
    }
  }

  evaluate() {
    this.gene_list.forEach((gene) => {
      let y = question(gene.x);
      gene.fitness = 1 / y;
    });
  }

  select() {
    // sort by fitness, in ascending order
    this.gene_list.sort((a, b) => a.fitness - b.fitness);
    this.best_gene = this.gene_list[this.population_size - 1];
    this.best_gene = { ...this.best_gene };
    let number_of_gene_to_kill =
      this.population_size * (1 - this.cross_over_rate);
    for (let i = 0; i < number_of_gene_to_kill; i++) {
      this.gene_list[i].dead = true;
    }
  }

  crossover() {
    for (let i = 0; i < this.population_size; i++) {
      let gene = this.gene_list[i];
      if (gene.dead) {
        // this is a slot for crossover
        let mother = this.selectParent();
        let father = this.selectParent();
        let ratio = Math.random(); // 0 .. 1
        let newX = mother.x * ratio + father.x * (1 - ratio);
        gene.x = newX;
        gene.dead = false;
      }
    }
  }

  selectParent() {
    for (;;) {
      let idx = Math.floor(Math.random() * this.population_size); // 0 .. n-1
      let gene = this.gene_list[idx];
      if (gene.dead) {
        continue;
      }
      return gene;
    }
  }

  mutate() {
    for (let i = 0; i < this.population_size; i++) {
      if (Math.random() >= this.mutation_rate) {
        continue;
      }
      let gene = this.gene_list[i];
      let alien = new Gene();
      let newX =
        alien.x * this.mutation_amount + gene.x * (1 - this.mutation_amount);
      gene.x = newX;
    }
  }
}

let world = new Population();
world.seed(10);

let allReport: any[] = [];
let allHistoryBestGene: Gene;
for (let generation = 0; generation < 1000; generation++) {
  world.evaluate();
  world.select();
  world.crossover();
  world.mutate();
  let currentBestGene = world.best_gene;
  if (
    !allHistoryBestGene ||
    allHistoryBestGene.fitness < currentBestGene.fitness
  ) {
    allHistoryBestGene = currentBestGene;
  }
  let report = {
    generation,
    x: currentBestGene.x,
    y: question(currentBestGene.x),
  };
  console.log(report);
  allReport.push(report);
}
let rows = json_to_csv(allReport);
let text = to_csv(rows);

writeFileSync('report.csv', text);
console.log('saved to report.csv');

console.log('all best:', {
  x: allHistoryBestGene.x,
  y: question(allHistoryBestGene.x),
});
