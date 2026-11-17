/**
 * Ecosystem Simulation Constants
 *
 * Grid-based agent simulation modeled after NetLogo Wolf Sheep Predation.
 * Agents live on a discrete grid. Consumption and predation require co-location.
 * Reproduction is probabilistic with energy splitting.
 */

export interface Agent {
  id: string;
  type: AgentType;
  col: number;
  row: number;
  energy: number;
}

export interface EcosystemState {
  agents: Agent[];
  grid: number[][]; // 0 = grown plant, >0 = ticks remaining until regrowth
  plantCount: number;
  herbivoreCount: number;
  carnivoreCount: number;
  tick: number;
}

// Grid dimensions
export const GRID_COLS = 40;
export const GRID_ROWS = 25;
export const CELL_SIZE = 20;

export const ECOSYSTEM_CANVAS = {
  WIDTH: GRID_COLS * CELL_SIZE,  // 800
  HEIGHT: GRID_ROWS * CELL_SIZE, // 500
};

export const AGENT_TYPES = {
  HERBIVORE: 'herbivore',
  CARNIVORE: 'carnivore',
} as const;

export type AgentType = typeof AGENT_TYPES[keyof typeof AGENT_TYPES];

export const COLORS = {
  PLANT_FULL: '#10B981',   // emerald-500
  PLANT_BARE: '#D2B48C',   // tan
  HERBIVORE: '#3B82F6',    // blue-500
  CARNIVORE: '#475569',    // slate-600
};

// Stability constants not exposed to the user
export const SIM = {
  HERBIVORE_MOVE_COST: 1,
  CARNIVORE_MOVE_COST: 1,
  MAX_AGENTS: 400,
};

// User-facing parameters
export interface EcosystemParameters {
  seedPlantDensity: number;            // 0.0 to 1.0 fraction of cells with plants
  seedHerbivores: number;
  seedCarnivores: number;
  plantRegrowthTime: number;           // ticks for bare cell to regrow
  herbivoreReproduceChance: number;    // probability per tick (0.01 to 0.15)
  carnivoreReproduceChance: number;    // probability per tick (0.01 to 0.15)
  herbivoreEnergyFromPlant: number;    // energy gained by eating a plant
  carnivoreEnergyFromHerbivore: number; // energy gained by eating a herbivore
}

export const INITIAL_PARAMETERS: EcosystemParameters = {
  seedPlantDensity: 0.5,
  seedHerbivores: 80,
  seedCarnivores: 25,
  plantRegrowthTime: 20,
  herbivoreReproduceChance: 0.04,
  carnivoreReproduceChance: 0.05,
  herbivoreEnergyFromPlant: 5,
  carnivoreEnergyFromHerbivore: 20,
};
