import { ChallengeDef } from '../shared/ChallengeDeck';
import { Element, PERIODIC_TABLE_ELEMENTS } from './periodicTableData';

export type ViewMode = 'standard' | 'temperature' | 'property' | 'graph' | 'print';
export type PropertyMode =
  | 'none'
  | 'atomic_radius'
  | 'electronegativity'
  | 'ionization_energy'
  | 'metallic_character'
  | 'non_metallic_character'
  | 'metal_reactivity'
  | 'non_metal_reactivity'
  | 'electron_affinity'
  | 'density'
  | 'melting_point'
  | 'boiling_point';

export interface PeriodicTableSetup {
  atomicNumber: number | null;
  propertyMode: PropertyMode;
  viewMode: ViewMode;
  temperature: number;
}

export interface PeriodicTableChallenge extends ChallengeDef {
  id: string;
  title: string;
  description: string;
  hints: [string, string, string];
  solution: string;
  targetAtomicNumber: number;
  targetPropertyMode?: PropertyMode;
  targetViewMode?: ViewMode;
  targetTemperatureRange?: [number, number];
  start: PeriodicTableSetup;
  solutionSetup: PeriodicTableSetup;
}

export const PERIODIC_TABLE_CHALLENGES: PeriodicTableChallenge[] = [
  {
    id: 'pt_fluorine_electronegativity',
    title: '1. Peak Electronegativity & Halogen Reactivity',
    description:
      'Find the most electronegative reactive nonmetal on the table (Group 17, Period 2), select it, and turn on the Electronegativity property view.',
    hints: [
      'Which corner of the periodic table has the highest effective nuclear charge combined with the fewest shielding electron shells?',
      'Electronegativity increases across periods from left to right and decreases down groups. The most electronegative halogen has 7 valence electrons in shell n=2.',
      'Select Fluorine (F, atomic number 9) in Group 17, Period 2, and switch the property visualization mode to Electronegativity.',
    ],
    solution:
      'Selected Fluorine (F, Z=9) with Electronegativity property mode. With minimal shielding and high effective nuclear charge, Fluorine holds the periodic table peak at 3.98.',
    targetAtomicNumber: 9,
    targetPropertyMode: 'electronegativity',
    start: {
      atomicNumber: null,
      propertyMode: 'none',
      viewMode: 'standard',
      temperature: 298,
    },
    solutionSetup: {
      atomicNumber: 9,
      propertyMode: 'electronegativity',
      viewMode: 'property',
      temperature: 298,
    },
  },
  {
    id: 'pt_cesium_ionization',
    title: '2. Alkali Metal Ionization Threshold',
    description:
      'Find the stable alkali metal with the lowest first ionization energy in Period 6, Group 1, and view its Ionization Energy property profile.',
    hints: [
      'Why does removing a valence electron become easier as you descend Group 1 into larger electron shells?',
      'First ionization energy decreases down Group 1 due to increased distance from the nucleus and extensive inner-shell shielding. The Period 6 alkali metal holds its outer electron loosely.',
      'Select Cesium (Cs, atomic number 55) in Group 1, Period 6, and switch the property mode to Ionization Energy.',
    ],
    solution:
      'Selected Cesium (Cs, Z=55) with Ionization Energy property mode. Its 6s¹ valence electron is held loosely with just 375.7 kJ/mol due to heavy inner-shell shielding.',
    targetAtomicNumber: 55,
    targetPropertyMode: 'ionization_energy',
    start: {
      atomicNumber: null,
      propertyMode: 'none',
      viewMode: 'standard',
      temperature: 298,
    },
    solutionSetup: {
      atomicNumber: 55,
      propertyMode: 'ionization_energy',
      viewMode: 'property',
      temperature: 298,
    },
  },
  {
    id: 'pt_silicon_semiconductor',
    title: '3. Metalloid Semiconductor Corridor',
    description:
      'Find the Group 14 metalloid in Period 3 used in computer chips, select it, and turn on the Atomic Radius property view.',
    hints: [
      'Which Group 14 element straddles the metal/nonmetal dividing line directly below carbon and forms the physical basis of modern microelectronics?',
      'Silicon (Si, Z=14) in Period 3 has intermediate electronegativity (1.90) and an atomic radius of 111 pm, bridging conductors and insulators.',
      'Select Silicon (Si, atomic number 14) in Group 14, Period 3, and switch the property visualization mode to Atomic Radius.',
    ],
    solution:
      'Selected Silicon (Si, Z=14) with Atomic Radius property mode. Silicon sits right on the metalloid staircase, bridging metallic conductors and nonmetal insulators.',
    targetAtomicNumber: 14,
    targetPropertyMode: 'atomic_radius',
    start: {
      atomicNumber: null,
      propertyMode: 'none',
      viewMode: 'standard',
      temperature: 298,
    },
    solutionSetup: {
      atomicNumber: 14,
      propertyMode: 'atomic_radius',
      viewMode: 'property',
      temperature: 298,
    },
  },
  {
    id: 'pt_xenon_liquefaction',
    title: '4. Noble Gas Inertness & Thermal Liquefaction',
    description:
      'Find the stable noble gas in Period 5, switch to Temperature view, and dial the temperature between 161 K and 165 K to condense it into a liquid.',
    hints: [
      'Which noble gas in Period 5 has sufficiently strong London dispersion forces among its 54 electrons to condense into a liquid above 160 K?',
      'Xenon (Xe, Z=54) has a melting point of 161.4 K and a boiling point of 165.0 K. Between these narrow thermal boundaries, Xenon exists in the liquid phase.',
      'Select Xenon (Xe, atomic number 54), switch to Temperature view, and slide the temperature control between 161 K and 165 K.',
    ],
    solution:
      'Selected Xenon (Xe, Z=54) in Temperature view at 163 K. With 54 electrons, strong dispersion forces condense Xenon into a liquid between 161.4 K and 165.0 K.',
    targetAtomicNumber: 54,
    targetViewMode: 'temperature',
    targetTemperatureRange: [161, 165],
    start: {
      atomicNumber: null,
      propertyMode: 'none',
      viewMode: 'standard',
      temperature: 298,
    },
    solutionSetup: {
      atomicNumber: 54,
      propertyMode: 'none',
      viewMode: 'temperature',
      temperature: 163,
    },
  },
];

export interface PeriodicTableVerificationInput {
  selectedElement: Element | null;
  propertyMode: PropertyMode;
  viewMode: ViewMode;
  temperature: number;
}

export function verifyPeriodicTableChallenge(
  challengeId: string,
  state: PeriodicTableVerificationInput
): { success: boolean; message: string } {
  const challenge = PERIODIC_TABLE_CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) {
    return { success: false, message: 'Select a challenge to begin.' };
  }

  if (!state.selectedElement) {
    return {
      success: false,
      message: 'No element selected. Click on an element tile in the periodic table to inspect its properties.',
    };
  }

  if (state.selectedElement.atomicNumber !== challenge.targetAtomicNumber) {
    return {
      success: false,
      message: `You selected ${state.selectedElement.name} (Z=${state.selectedElement.atomicNumber}). This does not match the target element for this challenge. Review the hints and periodic trends.`,
    };
  }

  // Check property mode if required
  if (challenge.targetPropertyMode && state.propertyMode !== challenge.targetPropertyMode) {
    return {
      success: false,
      message: `Selected ${state.selectedElement.name}. Now activate the "${challenge.targetPropertyMode.replace(/_/g, ' ')}" property view from the controls above the table.`,
    };
  }

  // Check view mode if required
  if (challenge.targetViewMode && state.viewMode !== challenge.targetViewMode) {
    return {
      success: false,
      message: `Selected ${state.selectedElement.name}. Switch to the "${challenge.targetViewMode}" view mode to examine state transitions.`,
    };
  }

  // Check temperature range if required
  if (challenge.targetTemperatureRange) {
    const [minT, maxT] = challenge.targetTemperatureRange;
    if (state.temperature < minT || state.temperature > maxT) {
      return {
        success: false,
        message: `Current temperature is ${state.temperature} K. Adjust the temperature slider between ${minT} K and ${maxT} K to observe the liquid phase of ${state.selectedElement.name}.`,
      };
    }
  }

  return {
    success: true,
    message: `${challenge.solution}`,
  };
}

export function applyPeriodicTableChallengeSolution(
  challenge: PeriodicTableChallenge,
  setSelectedElement: (el: Element | null) => void,
  setPropertyMode: (pm: PropertyMode) => void,
  setViewMode: (vm: ViewMode) => void,
  setTemperature: (t: number) => void
): void {
  const el = PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === challenge.solutionSetup.atomicNumber) ?? null;
  setSelectedElement(el);
  setPropertyMode(challenge.solutionSetup.propertyMode);
  setViewMode(challenge.solutionSetup.viewMode);
  setTemperature(challenge.solutionSetup.temperature);
}
