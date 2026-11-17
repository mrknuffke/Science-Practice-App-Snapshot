import { ChallengeDef } from '../shared/ChallengeDeck';
import {
  INITIAL_PISTON_Y,
  PISTON_MIN,
  PISTON_MAX,
  INITIAL_GAS_A_COUNT,
  INITIAL_GAS_B_COUNT,
} from './gasLawsConstants';
import { GasState, createParticle } from './gasLawsEngine';

export interface GasLawsSetup {
  pistonY: number;
  temperature: number;
  countA: number;
  countB: number;
}

export interface GasLawsChallenge extends ChallengeDef {
  id: string;
  title: string;
  description: string;
  hints: [string, string, string];
  solution: string;
  law: 'boyle' | 'charles' | 'gay_lussac' | 'dalton';
  start: GasLawsSetup;
  solutionSetup: GasLawsSetup;
}

export const GAS_LAWS_CHALLENGES: GasLawsChallenge[] = [
  {
    id: 'gas_boyle',
    title: "1. Boyle's Law: Isothermal Compression",
    description:
      'Double total pressure to around 2.0 atm by compressing the container, while keeping temperature steady between 270 and 330 K.',
    hints: [
      'How can you increase the collision rate without changing particle speed?',
      "Boyle's Law states that pressure is inversely proportional to volume (P ∝ 1/V). Halving the volume doubles how often particles strike each unit of wall area.",
      'Leave heating off to stay near 300 K, and drag the volume slider left until total pressure reaches roughly 2.00 atm.',
    ],
    solution:
      'Compressed the container to about half its original volume at constant 300 K, doubling wall collisions to reach 2.00 atm.',
    law: 'boyle',
    start: {
      pistonY: INITIAL_PISTON_Y,
      temperature: 300,
      countA: INITIAL_GAS_A_COUNT,
      countB: INITIAL_GAS_B_COUNT,
    },
    solutionSetup: {
      pistonY: PISTON_MIN + 45,
      temperature: 300,
      countA: INITIAL_GAS_A_COUNT,
      countB: INITIAL_GAS_B_COUNT,
    },
  },
  {
    id: 'gas_charles',
    title: "2. Charles's Law: Isobaric Thermal Expansion",
    description:
      'Heat the gas above 450 K while keeping pressure steady between 1.00 and 1.50 atm by letting the piston expand.',
    hints: [
      'Faster particles hit the walls harder and more often. How can giving them more space keep the pressure from spiking?',
      "Charles's Law states that volume is proportional to temperature (V ∝ T) at constant pressure. Expanding the container gives fast-moving particles more room to roam.",
      'Click Add Heat until temperature passes 450 K, then drag the volume slider right until pressure settles between 1.00 and 1.50 atm.',
    ],
    solution:
      'Heated above 450 K and expanded the piston. Giving faster particles more volume kept wall pressure steady around 1.25 atm.',
    law: 'charles',
    start: {
      pistonY: INITIAL_PISTON_Y,
      temperature: 300,
      countA: INITIAL_GAS_A_COUNT,
      countB: INITIAL_GAS_B_COUNT,
    },
    solutionSetup: {
      pistonY: PISTON_MAX - 30,
      temperature: 480,
      countA: INITIAL_GAS_A_COUNT,
      countB: INITIAL_GAS_B_COUNT,
    },
  },
  {
    id: 'gas_gay_lussac',
    title: "3. Gay-Lussac's Law: Isochoric Pressurization",
    description:
      'Keep the container size fixed and heat the gas until pressure climbs to at least 2.50 atm.',
    hints: [
      'If the container walls cannot move, what happens to wall collisions as particles speed up?',
      "Gay-Lussac's Law states that pressure is proportional to Kelvin temperature (P ∝ T) in a rigid container.",
      'Leave the piston at its resting mark and click Add Heat until faster collisions drive pressure above 2.50 atm.',
    ],
    solution:
      'Kept container volume fixed and added heat. Faster particles struck the walls harder, pushing pressure over 2.50 atm.',
    law: 'gay_lussac',
    start: {
      pistonY: INITIAL_PISTON_Y,
      temperature: 300,
      countA: INITIAL_GAS_A_COUNT,
      countB: INITIAL_GAS_B_COUNT,
    },
    solutionSetup: {
      pistonY: INITIAL_PISTON_Y,
      temperature: 550,
      countA: INITIAL_GAS_A_COUNT,
      countB: INITIAL_GAS_B_COUNT,
    },
  },
  {
    id: 'gas_dalton',
    title: "4. Dalton's Law: Equimolar Partial Pressures",
    description:
      'Build a gas mixture with at least 30 particles of Gas A and 30 particles of Gas B, balancing their partial pressures within 0.30 atm at a total pressure of at least 1.50 atm.',
    hints: [
      'At the same temperature and volume, does particle mass change how much pressure each particle exerts on the wall?',
      "Dalton's Law states that total pressure equals the sum of partial pressures (P_total = P_A + P_B). Equal numbers of particles exert equal partial pressures.",
      'Add at least 30 particles of each gas, then compress the piston or add heat until total pressure reaches 1.50 atm.',
    ],
    solution:
      'Created an equal mix of Gas A and Gas B particles. Sharing the same volume, both gases produced matching partial pressures adding up to over 1.50 atm.',
    law: 'dalton',
    start: {
      pistonY: INITIAL_PISTON_Y,
      temperature: 300,
      countA: INITIAL_GAS_A_COUNT,
      countB: INITIAL_GAS_B_COUNT,
    },
    solutionSetup: {
      pistonY: INITIAL_PISTON_Y - 30,
      temperature: 320,
      countA: 35,
      countB: 35,
    },
  },
];

export interface GasLawsVerificationInput {
  temperature: number;
  totalPressure: number;
  pressureA: number;
  pressureB: number;
  pistonY: number;
  countA: number;
  countB: number;
}

export function verifyGasLawsChallenge(
  challengeId: string,
  state: GasLawsVerificationInput
): { success: boolean; message: string } {
  if (challengeId === 'gas_boyle') {
    if (state.temperature < 270 || state.temperature > 330) {
      return {
        success: false,
        message: `Temperature is ${state.temperature.toFixed(0)} K. Boyle's Law requires a constant temperature (270 to 330 K). Reset or let the gas return to room temperature.`,
      };
    }
    if (state.totalPressure >= 1.8 && state.totalPressure <= 2.2) {
      return {
        success: true,
        message: `Total pressure hit ${state.totalPressure.toFixed(2)} atm at ${state.temperature.toFixed(0)} K. You demonstrated P ∝ 1/V.`,
      };
    }
    return {
      success: false,
      message: `Current pressure is ${state.totalPressure.toFixed(2)} atm. Compress the container until pressure reaches 1.80 to 2.20 atm.`,
    };
  }

  if (challengeId === 'gas_charles') {
    if (state.temperature < 445) {
      return {
        success: false,
        message: `Current temperature is ${state.temperature.toFixed(0)} K. Add heat until the gas passes 450 K.`,
      };
    }
    if (state.totalPressure >= 1.0 && state.totalPressure <= 1.5) {
      return {
        success: true,
        message: `At ${state.temperature.toFixed(0)} K, expanding the volume kept pressure at ${state.totalPressure.toFixed(2)} atm. Charles's Law (V ∝ T) confirmed.`,
      };
    }
    return {
      success: false,
      message: `Temperature is ${state.temperature.toFixed(0)} K, but pressure is ${state.totalPressure.toFixed(2)} atm. Adjust the volume slider until pressure settles between 1.00 and 1.50 atm.`,
    };
  }

  if (challengeId === 'gas_gay_lussac') {
    if (Math.abs(state.pistonY - INITIAL_PISTON_Y) > 25) {
      return {
        success: false,
        message: `Container volume must stay constant for Gay-Lussac's Law. Keep the piston near its starting mark (~${INITIAL_PISTON_Y}px).`,
      };
    }
    if (state.totalPressure >= 2.5) {
      return {
        success: true,
        message: `Heating at constant volume drove pressure to ${state.totalPressure.toFixed(2)} atm. Gay-Lussac's Law (P ∝ T) confirmed.`,
      };
    }
    return {
      success: false,
      message: `Current pressure is ${state.totalPressure.toFixed(2)} atm. Heat the gas until pressure reaches at least 2.50 atm.`,
    };
  }

  if (challengeId === 'gas_dalton') {
    if (state.countA < 30 || state.countB < 30) {
      return {
        success: false,
        message: `Add more particles. You need at least 30 particles of Gas A (currently ${state.countA}) and 30 of Gas B (currently ${state.countB}).`,
      };
    }
    const diff = Math.abs(state.pressureA - state.pressureB);
    if (diff <= 0.3 && state.totalPressure >= 1.5) {
      return {
        success: true,
        message: `P_A (${state.pressureA.toFixed(2)} atm) + P_B (${state.pressureB.toFixed(2)} atm) = P_total (${state.totalPressure.toFixed(2)} atm). Dalton's Law confirmed.`,
      };
    }
    return {
      success: false,
      message: `Partial pressure difference is ${diff.toFixed(2)} atm (Total: ${state.totalPressure.toFixed(2)} atm). Equalize the particle counts to balance partial pressures.`,
    };
  }

  return { success: false, message: 'Select a challenge to begin.' };
}

export function applyGasLawsChallengeSolution(
  challenge: GasLawsChallenge,
  gasState: GasState,
  setPistonY: (y: number) => void
): { countA: number; countB: number } {
  setPistonY(challenge.solutionSetup.pistonY);
  gasState.pistonY = challenge.solutionSetup.pistonY;

  if (challenge.id === 'gas_boyle') {
    const targetY = challenge.solutionSetup.pistonY;
    gasState.pistonY = targetY;
    return { countA: INITIAL_GAS_A_COUNT, countB: INITIAL_GAS_B_COUNT };
  }

  if (challenge.id === 'gas_charles') {
    gasState.particles.forEach((p) => {
      p.vx *= 1.35;
      p.vy *= 1.35;
    });
    return { countA: INITIAL_GAS_A_COUNT, countB: INITIAL_GAS_B_COUNT };
  }

  if (challenge.id === 'gas_gay_lussac') {
    gasState.particles.forEach((p) => {
      p.vx *= 1.6;
      p.vy *= 1.6;
    });
    return { countA: INITIAL_GAS_A_COUNT, countB: INITIAL_GAS_B_COUNT };
  }

  if (challenge.id === 'gas_dalton') {
    const particlesA = Array.from({ length: 35 }, () =>
      createParticle('A', challenge.solutionSetup.pistonY)
    );
    const particlesB = Array.from({ length: 35 }, () =>
      createParticle('B', challenge.solutionSetup.pistonY)
    );
    gasState.particles = [...particlesA, ...particlesB];
    return { countA: 35, countB: 35 };
  }

  return { countA: INITIAL_GAS_A_COUNT, countB: INITIAL_GAS_B_COUNT };
}
