import { ChallengeDef } from '../shared/ChallengeDeck';
import { HWParams, DEFAULT_PARAMS } from './hwConstants';

export interface HWChallenge extends ChallengeDef {
  /** Where the population parameters start when challenge opens -- never the solution. */
  start: HWParams;
  /** What "Load Solution" sets once unlocked. */
  solutionSetup: HWParams;
}

export const HW_CHALLENGES: HWChallenge[] = [
  {
    id: 'hw_null',
    title: 'Hardy-Weinberg Null Baseline',
    description: 'Show what happens when evolution stands still. Set up an ideal population where allele frequency p stays within 0.05 of its starting 0.50 value for at least 25 generations.',
    hints: [
      'What conditions must be met for a gene pool to remain completely unchanged from generation to generation?',
      'Hardy-Weinberg equilibrium is a null baseline: without selection, mutation, migration, or drift in a large population, frequencies stay put.',
      'Set the population size high (N = 1000) and turn off selection, mutation, gene flow, and inbreeding. Then hit play.',
    ],
    solution: 'N=1000, initial p=0.50, all evolutionary forces disabled. Run for 25 generations.',
    start: {
      ...DEFAULT_PARAMS,
      populationSize: 500,
      initialP: 0.50,
      selectionEnabled: true,
      fitnessAA: 1.0,
      fitnessAa: 0.8,
      fitnessaa: 0.2,
      mutationEnabled: true,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
    solutionSetup: {
      ...DEFAULT_PARAMS,
      populationSize: 1000,
      initialP: 0.50,
      selectionEnabled: false,
      mutationEnabled: false,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
  },
  {
    id: 'selection_recessive',
    title: 'Directional Selection Against Recessive (aa)',
    description: 'Apply strong selection against homozygous recessive individuals (aa) until allele frequency q drops below 0.20 across 30 generations. Notice how tough it is to eliminate q entirely.',
    hints: [
      'Why does natural selection have such a hard time wiping out a harmful recessive allele in a diploid population?',
      'Selection acts on phenotypes, not bare alleles. Recessive alleles hide in plain sight inside heterozygous carriers (Aa) who have normal fitness.',
      'Turn selection ON, keep fitness at AA = 1.0 and Aa = 1.0 while setting aa = 0.0, and run for 30 or more generations.',
    ],
    solution: 'Selection ON: fitnessAA=1.0, fitnessAa=1.0, fitnessaa=0.0; run until generation >= 30 and q < 0.20.',
    start: {
      ...DEFAULT_PARAMS,
      populationSize: 500,
      initialP: 0.50,
      selectionEnabled: false,
      mutationEnabled: false,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
    solutionSetup: {
      ...DEFAULT_PARAMS,
      populationSize: 500,
      initialP: 0.50,
      selectionEnabled: true,
      fitnessAA: 1.0,
      fitnessAa: 1.0,
      fitnessaa: 0.0,
      mutationEnabled: false,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
  },
  {
    id: 'genetic_drift',
    title: 'Genetic Drift and Allele Fixation',
    description: 'Watch pure random sampling error hijack a gene pool. Without any natural selection acting at all, force one allele to fix completely (p = 1.0 or p = 0.0).',
    hints: [
      'Do allele frequencies wander more wildly in a tiny island flock or in a continental herd of millions?',
      'Genetic drift happens because small sample sizes lead to random sampling error when gametes combine each generation.',
      'Shrink the population size down to N = 20 with all selection OFF. Run the clock and watch drift march one allele right to the edge.',
    ],
    solution: 'N=20, Selection OFF; run until p reaches 1.0 or 0.0.',
    start: {
      ...DEFAULT_PARAMS,
      populationSize: 1000,
      initialP: 0.50,
      selectionEnabled: false,
      mutationEnabled: false,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
    solutionSetup: {
      ...DEFAULT_PARAMS,
      populationSize: 20,
      initialP: 0.50,
      selectionEnabled: false,
      mutationEnabled: false,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
  },
  {
    id: 'heterozygote_advantage',
    title: 'Heterozygote Advantage (Balanced Polymorphism)',
    description: 'Craft a scenario where heterozygotes outperform both homozygotes, locking allele frequency p into a stable balance between 0.55 and 0.75 for 30 generations.',
    hints: [
      'How can natural selection keep a harmful allele around at high frequency instead of purging it?',
      'When heterozygotes (Aa) have higher reproductive fitness than either homozygote (overdominance), selection actively protects both alleles.',
      'Turn selection ON with fitness AA = 0.70, Aa = 1.00, and aa = 0.40. Hit play and watch p home in on a stable plateau near 0.67.',
    ],
    solution: 'Selection ON: w_AA=0.7, w_Aa=1.0, w_aa=0.4; run for 30+ generations to verify stable p near 0.67.',
    start: {
      ...DEFAULT_PARAMS,
      populationSize: 500,
      initialP: 0.30,
      selectionEnabled: false,
      mutationEnabled: false,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
    solutionSetup: {
      ...DEFAULT_PARAMS,
      populationSize: 500,
      initialP: 0.30,
      selectionEnabled: true,
      fitnessAA: 0.70,
      fitnessAa: 1.00,
      fitnessaa: 0.40,
      mutationEnabled: false,
      geneFlowEnabled: false,
      inbreedingEnabled: false,
    },
  },
];
