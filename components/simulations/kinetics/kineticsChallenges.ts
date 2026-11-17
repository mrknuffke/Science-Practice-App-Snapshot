import { ChallengeDef } from '../shared/ChallengeDeck';
import { ScenarioMode } from '../../../types';

export interface VesselSetup {
  mode: ScenarioMode;
  temp: number;
  catalyst: boolean;
}

export interface KineticsChallenge extends ChallengeDef {
  /** Where the vessel starts when the challenge opens: never the answer. */
  start: VesselSetup;
  /** What "Load Solution" sets once it unlocks. */
  solutionSetup: VesselSetup;
}

// Each challenge names a target and leaves the lever for the student to find.
// Hints run from a question, to the concept, to naming the control.
export const KINETICS_CHALLENGES: KineticsChallenge[] = [
  {
    id: 'act_energy',
    title: 'Get It Going',
    description: 'The vessel is cool and almost nothing is reacting. Make at least 15 product molecules (C).',
    hints: [
      'Watch the Energy Diagram. Where is the System dot compared with the top of the hill?',
      'A and B only react when they collide with more energy than Eₐ. What would make collisions harder?',
      'Raise the Temperature, or add more A and B, then let it run.',
    ],
    solution: 'Temperature 1.8, simulation running.',
    start: { mode: 'chemistry', temp: 0.5, catalyst: false },
    solutionSetup: { mode: 'chemistry', temp: 1.8, catalyst: false },
  },
  {
    id: 'catalysis',
    title: 'No Extra Heat Allowed',
    description: 'Heating worked in Challenge 1, but this time the Temperature must stay at 0.8 or below. Make at least 12 product molecules anyway.',
    hints: [
      'If the particles can\'t get more energy, what else in the Energy Diagram could change?',
      'Collisions need to beat Eₐ. Instead of raising the particles, could the hill be lower?',
      'Add the Catalyst and keep the Temperature low.',
    ],
    solution: 'Catalyst on, Temperature 0.7.',
    start: { mode: 'chemistry', temp: 0.5, catalyst: false },
    solutionSetup: { mode: 'chemistry', temp: 0.7, catalyst: true },
  },
  {
    id: 'enzyme_saturation',
    title: 'Life at Body Temperature',
    description: 'In Biological Enzyme mode, the substrate won\'t react by itself, and a cell can\'t heat itself up. Make at least 20 products while keeping the Temperature between 0.9 and 1.4.',
    hints: [
      'In Challenge 2 you sped things up without heat. What plays that role inside a cell?',
      'Enzymes are biological catalysts: the substrate reacts when it collides with one.',
      'Add the Enzyme and let it run at a Temperature near 1.2.',
    ],
    solution: 'Biological Enzyme mode, Enzyme on, Temperature 1.2.',
    start: { mode: 'biology', temp: 1.0, catalyst: false },
    solutionSetup: { mode: 'biology', temp: 1.2, catalyst: true },
  },
  {
    id: 'denaturation',
    title: 'Is Hotter Always Faster?',
    description: 'Heat sped up the reaction in Challenge 1. With an enzyme working, find the temperature where the enzyme stops working.',
    hints: [
      'Enzymes are proteins with a specific shape. What might a lot of heat do to that shape?',
      'Get the enzyme working first, then keep watching the product count as you heat.',
      'With the Enzyme added, hold Heat until the red warning appears.',
    ],
    solution: 'Biological Enzyme mode, Enzyme on, Temperature 1.9.',
    start: { mode: 'biology', temp: 1.0, catalyst: false },
    solutionSetup: { mode: 'biology', temp: 1.9, catalyst: true },
  },
];
