/**
 * Hardy-Weinberg Population Genetics Simulation
 * Types, constants, and default parameters
 */

export type Genotype = 'AA' | 'Aa' | 'aa';

export interface HWParams {
  populationSize: number;       // N: controls genetic drift magnitude
  initialP: number;             // Starting frequency of A allele (0 to 1)

  // Natural Selection
  selectionEnabled: boolean;
  fitnessAA: number;            // Relative fitness of AA (0 to 1)
  fitnessAa: number;            // Relative fitness of Aa (0 to 1)
  fitnessaa: number;            // Relative fitness of aa (0 to 1)

  // Mutation
  mutationEnabled: boolean;
  mutationForward: number;      // µ: A -> a per generation
  mutationBack: number;         // ν: a -> A per generation

  // Gene Flow
  geneFlowEnabled: boolean;
  geneFlowRate: number;         // m: fraction replaced by immigrants (0 to 0.5)
  geneFlowAlleleFreq: number;   // p of immigrant population (0 to 1)

  // Non-Random Mating
  inbreedingEnabled: boolean;
  inbreedingF: number;          // F: inbreeding coefficient (0 to 1)
}

export interface HistoryPoint {
  generation: number;
  p: number;
  q: number;
  AA: number;
  Aa: number;
  aa: number;
  expectedAA: number;
  expectedAa: number;
  expectedaa: number;
  meanFitness: number;
}

export interface HWState {
  generation: number;
  p: number;
  q: number;
  genotypeFreqs: { AA: number; Aa: number; aa: number };
  individuals: Genotype[];
  history: HistoryPoint[];
}

// Color palette: blue/violet/emerald for AA/Aa/aa
export const GENOTYPE_COLORS: Record<Genotype, string> = {
  AA: '#3B82F6',  // blue-500
  Aa: '#8B5CF6',  // violet-500
  aa: '#10B981',  // emerald-500
};

// Lighter fill versions for stat cells
export const GENOTYPE_BG: Record<Genotype, string> = {
  AA: 'bg-blue-100 text-blue-800',
  Aa: 'bg-violet-100 text-violet-800',
  aa: 'bg-emerald-100 text-emerald-800',
};

export const DEFAULT_PARAMS: HWParams = {
  populationSize: 100,
  initialP: 0.5,
  selectionEnabled: false,
  fitnessAA: 1.0,
  fitnessAa: 1.0,
  fitnessaa: 1.0,
  mutationEnabled: false,
  mutationForward: 0.001,
  mutationBack: 0.001,
  geneFlowEnabled: false,
  geneFlowRate: 0.05,
  geneFlowAlleleFreq: 0.5,
  inbreedingEnabled: false,
  inbreedingF: 0.2,
};

export const TICK_SPEEDS = [
  { label: 'Slow', ms: 600 },
  { label: 'Normal', ms: 250 },
  { label: 'Fast', ms: 80 },
  { label: 'Very Fast', ms: 20 },
];

