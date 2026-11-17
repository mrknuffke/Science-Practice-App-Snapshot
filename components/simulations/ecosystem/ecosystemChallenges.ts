import { ChallengeDef } from '../shared/ChallengeDeck';
import { EcosystemParameters, INITIAL_PARAMETERS } from './ecosystemConstants';

export interface EcosystemChallenge extends ChallengeDef {
  /** Where the ecosystem starts when opened -- an unbalanced or perturbed state. */
  start: EcosystemParameters;
  /** What "Load Solution" sets once unlocked. */
  solutionSetup: EcosystemParameters;
}

export const ECOSYSTEM_CHALLENGES: EcosystemChallenge[] = [
  {
    id: 'green_world',
    title: 'The Green World: Herbivore Balance',
    description: 'Can plants and herbivores find peace without predators? Balance plant regrowth and herbivore appetite so that at least 100 plants and 20 herbivores thrive together for 80 ticks without any carnivores.',
    hints: [
      'If herbivores eat faster than plants can sprout back, what eventually happens to the whole food supply?',
      'To keep herbivores from overgrazing the landscape, plant regrowth must keep pace with grazing pressure.',
      'Try dialing down the herbivore reproduction rate or speeding up plant regrowth time, then let the clock run for 80 ticks.',
    ],
    solution: 'Seed 50 herbivores, 0 carnivores, plant regrowth 15 ticks, herbivore reproduction 0.03.',
    start: {
      ...INITIAL_PARAMETERS,
      seedPlantDensity: 0.5,
      seedHerbivores: 70,
      seedCarnivores: 0,
      plantRegrowthTime: 35,
      herbivoreReproduceChance: 0.07,
      herbivoreEnergyFromPlant: 5,
    },
    solutionSetup: {
      ...INITIAL_PARAMETERS,
      seedPlantDensity: 0.6,
      seedHerbivores: 50,
      seedCarnivores: 0,
      plantRegrowthTime: 15,
      herbivoreReproduceChance: 0.03,
      herbivoreEnergyFromPlant: 6,
    },
  },
  {
    id: 'three_trophic',
    title: 'Three-Trophic Coexistence',
    description: 'Keep all three levels of the food web alive. Balance the ecosystem so plants stay above 50, herbivores above 15, and carnivores above 8 for at least 100 ticks without anyone going extinct.',
    hints: [
      'If predators catch prey too easily or reproduce too quickly, what will they eat once the herbivore herd crashes?',
      'Apex predators keep herbivores from devouring every plant, but if predators are too efficient, they eat themselves out of house and home.',
      'Tune carnivore reproduction and energy per herbivore so the population waves rise and fall smoothly instead of crashing to zero.',
    ],
    solution: 'Seed 80 herbivores, 20 carnivores, plant regrowth 20, herbivore reproduction 0.04, carnivore reproduction 0.04.',
    start: {
      ...INITIAL_PARAMETERS,
      seedPlantDensity: 0.4,
      seedHerbivores: 90,
      seedCarnivores: 35,
      plantRegrowthTime: 30,
      herbivoreReproduceChance: 0.05,
      carnivoreReproduceChance: 0.08,
      herbivoreEnergyFromPlant: 4,
      carnivoreEnergyFromHerbivore: 35,
    },
    solutionSetup: {
      ...INITIAL_PARAMETERS,
      seedPlantDensity: 0.5,
      seedHerbivores: 80,
      seedCarnivores: 20,
      plantRegrowthTime: 20,
      herbivoreReproduceChance: 0.04,
      carnivoreReproduceChance: 0.04,
      herbivoreEnergyFromPlant: 5,
      carnivoreEnergyFromHerbivore: 22,
    },
  },
  {
    id: 'trophic_cascade',
    title: 'Trophic Cascade and Plant Rebound',
    description: 'Overgrazing has left this landscape stripped bare (fewer than 100 plants). Introduce carnivores to rein in the runaway herbivore herd and let the vegetation rebound past 250 plants.',
    hints: [
      'How can adding more hungry predators at the top of the food chain actually save the plants at the bottom?',
      'In a top-down trophic cascade, predators reduce herbivore numbers, lifting grazing pressure so plants can finally spread again.',
      'Introduce carnivores with a steady reproduction rate. Once they reduce the herbivore swarm, watch the green plants take over the grid.',
    ],
    solution: 'Introduce 30 carnivores with reproduction 0.05, suppress herbivores, and allow plant regrowth past 250.',
    start: {
      ...INITIAL_PARAMETERS,
      seedPlantDensity: 0.15,
      seedHerbivores: 100,
      seedCarnivores: 0,
      plantRegrowthTime: 15,
      herbivoreReproduceChance: 0.03,
      carnivoreReproduceChance: 0.05,
      herbivoreEnergyFromPlant: 4,
      carnivoreEnergyFromHerbivore: 25,
    },
    solutionSetup: {
      ...INITIAL_PARAMETERS,
      seedPlantDensity: 0.15,
      seedHerbivores: 100,
      seedCarnivores: 30,
      plantRegrowthTime: 15,
      herbivoreReproduceChance: 0.03,
      carnivoreReproduceChance: 0.05,
      herbivoreEnergyFromPlant: 4,
      carnivoreEnergyFromHerbivore: 25,
    },
  },
];
