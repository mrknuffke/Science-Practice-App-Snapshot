import { ChallengeDef } from '../shared/ChallengeDeck';
import { ISOTOPES } from './nuclearDecayEngine';

export interface NuclearSetup {
  isotopeKey: string;
  halfLives: number;
  userAge?: number;
  remainingInput: string;
}

export interface NuclearChallenge extends ChallengeDef {
  isotopeKey: string;
  measuredPercentRemaining: number;
  expectedAge: number;
  unit: string;
  context: string;
  start: NuclearSetup;
  solutionSetup: NuclearSetup & { userAge: number };
}

export const NUCLEAR_CHALLENGES: NuclearChallenge[] = [
  {
    id: 'c14_tomb_beam',
    title: 'Archaeology Mystery: Ancient Egyptian Tomb Cedar Beam',
    description:
      'A structural cedar beam discovered in an Egyptian royal tomb retains 50.0% of the Carbon-14 activity found in living trees. Select Carbon-14, align the decay simulation to 50% parent nuclei, and calculate the age of the wood artifact in years.',
    hints: [
      'If half of the original radioactive carbon has decayed away, how many half-lives have elapsed since the tree was harvested?',
      'One half-life (t½) is the time required for 50% of the parent nuclei to transmute into daughter nuclei. For Carbon-14, t½ = 5,730 years.',
      'Select Carbon-14, move the Half-Life slider to 1.00 t½ (50 parent nuclei in the grid), and enter 5730 in the age input box.',
    ],
    solution:
      'Carbon-14 selected. Exactly 1 half-life elapsed (50.0% parent remaining). Artifact age = 1 × 5,730 = 5,730 years.',
    isotopeKey: 'C14',
    measuredPercentRemaining: 50,
    expectedAge: 5730,
    unit: 'years',
    context: 'Egyptian Old Kingdom royal tomb structural timber.',
    start: {
      isotopeKey: 'C14',
      halfLives: 0,
      remainingInput: '50',
    },
    solutionSetup: {
      isotopeKey: 'C14',
      halfLives: 1.0,
      userAge: 5730,
      remainingInput: '50',
    },
  },
  {
    id: 'c14_cave_hearth',
    title: 'Prehistoric Mystery: Paleolithic Cave Charcoal',
    description:
      'Charcoal excavated from a Neanderthal cave hearth in France contains 25.0% of modern Carbon-14 activity. Adjust the decay state to 25% parent nuclei (2 half-lives) and determine the age of the campfire in years.',
    hints: [
      'After the first half-life leaves 50%, what fraction remains after a second consecutive half-life?',
      'Radioactive decay is exponential: (1/2)² = 1/4 = 25%. Two elapsed half-lives equal 2 × 5,730 years = 11,460 years.',
      'With Carbon-14 selected, advance the slider to 2.00 t½ (25 parent particles remain) and calculate the age as 11,460 years.',
    ],
    solution:
      'Carbon-14 selected. 2 half-lives elapsed (25.0% parent remaining). Campfire age = 2 × 5,730 = 11,460 years.',
    isotopeKey: 'C14',
    measuredPercentRemaining: 25,
    expectedAge: 11460,
    unit: 'years',
    context: 'Paleolithic hunter-gatherer campfire hearth remains.',
    start: {
      isotopeKey: 'C14',
      halfLives: 0,
      remainingInput: '25',
    },
    solutionSetup: {
      isotopeKey: 'C14',
      halfLives: 2.0,
      userAge: 11460,
      remainingInput: '25',
    },
  },
  {
    id: 'i131_radiopharm',
    title: 'Nuclear Medicine: Iodine-131 Radiopharmaceutical Storage',
    description:
      'A diagnostic vial of medical Iodine-131 has decayed until only 12.5% of its initial radioactivity remains. Switch to Iodine-131, adjust the half-life slider to 12.5% parent nuclei, and verify the elapsed storage time in days.',
    hints: [
      'How many successive halvings are needed to go from 100% to 50% to 25% to 12.5%?',
      '12.5% represents 1/8 = (1/2)³, corresponding to exactly 3 half-lives. For Iodine-131, t½ = 8.02 days: 3 × 8.02 = 24.06 days.',
      'Select Iodine-131 (t½ = 8.02 days), set the slider to 3.00 t½ (12 to 13 parent particles), and enter 24.1 days.',
    ],
    solution:
      'Iodine-131 selected. 3 half-lives elapsed (12.5% parent remaining). Vial storage duration = 3 × 8.02 = 24.06 days.',
    isotopeKey: 'I131',
    measuredPercentRemaining: 12.5,
    expectedAge: 24.06,
    unit: 'days',
    context: 'Hospital nuclear medicine diagnostic radioisotope vial.',
    start: {
      isotopeKey: 'I131',
      halfLives: 0,
      remainingInput: '12.5',
    },
    solutionSetup: {
      isotopeKey: 'I131',
      halfLives: 3.0,
      userAge: 24.06,
      remainingInput: '12.5',
    },
  },
  {
    id: 'u238_zircon_crust',
    title: "Geochronology: Zircon Crystal from Earth's Oldest Crust",
    description:
      "A zircon crystal from Western Australia's Jack Hills contains an equal 1:1 ratio of parent Uranium-238 to daughter products (50.0% parent remaining). Select Uranium-238, set decay to 1 half-life, and calculate the rock age in billion years (Ga).",
    hints: [
      'Why must geological dating of Earth rocks use Uranium-238 instead of Carbon-14?',
      'Carbon-14 vanishes after ~50,000 years. Dating the planetary crust requires a primordial radioisotope with a half-life of billions of years (U-238, t½ = 4.47 Ga).',
      'Select Uranium-238 (t½ = 4.47 billion years), set the slider to 1.00 t½ (50% parent), and enter 4.47 billion years.',
    ],
    solution:
      'Uranium-238 selected. 1 half-life elapsed (50.0% parent remaining). Rock formation age = 1 × 4.47 = 4.47 billion years.',
    isotopeKey: 'U238',
    measuredPercentRemaining: 50,
    expectedAge: 4.47,
    unit: 'billion years',
    context: 'Hadean Eon geological formation from primordial continental crust.',
    start: {
      isotopeKey: 'U238',
      halfLives: 0,
      remainingInput: '50',
    },
    solutionSetup: {
      isotopeKey: 'U238',
      halfLives: 1.0,
      userAge: 4.47,
      remainingInput: '50',
    },
  },
];

/**
 * Validates nuclear decay and radiometric dating calculations.
 */
export function verifyNuclearChallenge(
  challenge: NuclearChallenge,
  currentIsotopeKey: string,
  currentHalfLives: number,
  userAgeInput: string
): { success: boolean; message: string } {
  if (currentIsotopeKey !== challenge.isotopeKey) {
    const expectedName = ISOTOPES[challenge.isotopeKey].name;
    return {
      success: false,
      message: `Isotope mismatch. This scenario requires dating with ${expectedName}. Please select ${expectedName} from the isotope cards.`,
    };
  }

  const num = parseFloat(userAgeInput.replace(/,/g, ''));
  if (isNaN(num) || num <= 0) {
    return { success: false, message: 'Please enter a valid positive numeric age calculation.' };
  }

  const diff = Math.abs(num - challenge.expectedAge);
  const pct = (diff / challenge.expectedAge) * 100;

  if (pct > 6) {
    return {
      success: false,
      message: `Calculated age of ${num} ${challenge.unit} is outside tolerance (expected ~${challenge.expectedAge} ${challenge.unit}). Recall: t = n · t½ where n = -log₂(% remaining / 100).`,
    };
  }

  // Also check that the half-life slider has been aligned near the target (within 0.35 t½)
  const expectedHalfLives = -Math.log2(challenge.measuredPercentRemaining / 100);
  if (Math.abs(currentHalfLives - expectedHalfLives) > 0.35) {
    return {
      success: false,
      message: `Age calculation is correct (~${num} ${challenge.unit}). Now adjust the elapsed half-life slider to ${expectedHalfLives.toFixed(2)} t½ to align the particulate simulation grid.`,
    };
  }

  return {
    success: true,
    message: `You dated the artifact to ~${num} ${challenge.unit} (theory: ${challenge.expectedAge} ${challenge.unit}). Context: ${challenge.context}`,
  };
}
