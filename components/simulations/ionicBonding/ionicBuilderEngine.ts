/**
 * Ionic Builder Engine
 * Handles the logic for the "atom-by-atom" ionic bonding experience.
 */

import { METALS, NONMETALS, POLYATOMIC_IONS } from './ionicDatabase';

export interface IonicAtom {
  id: string;
  element: string;
  position: { x: number; y: number };
  initialValence: number;
  currentValence: number;
  charge: number;
  isIonized: boolean; // Has it reached its target charge?
  type: 'cation' | 'anion';
  oxidationState?: number; // Chosen for transition metals
  transferredElectrons: number; // For anions: dots gained. For cations: dots lost.
  targetPosition?: { x: number; y: number } | null;
  /** If set, this atom represents a pre-formed polyatomic ion */
  polyatomicId?: string;
}

export interface ElectronTransfer {
  fromAtomId: string;
  toAtomId: string;
  count: number;
}

/**
 * Creates a new IonicAtom based on the element symbol
 */
export function createBuilderAtom(
  element: string,
  position: { x: number; y: number },
  oxidationState?: number
): IonicAtom {
  const info = METALS[element] || NONMETALS[element];
  if (!info) throw new Error(`Unknown element: ${element}`);

  const type = METALS[element] ? 'cation' : 'anion';
  
  return {
    id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    element,
    position,
    initialValence: info.valenceElectrons,
    currentValence: info.valenceElectrons,
    charge: 0,
    isIonized: false,
    type,
    oxidationState: oxidationState || info.commonOxidationStates[0],
    transferredElectrons: 0,
    targetPosition: null,
  };
}

/**
 * Creates a monoatomic ion that starts already fully ionized.
 * Used in ternary mode where electron transfer is not the focus.
 */
export function createPreIonizedAtom(
  element: string,
  position: { x: number; y: number },
  oxidationState?: number
): IonicAtom {
  const info = METALS[element] || NONMETALS[element];
  if (!info) throw new Error(`Unknown element: ${element}`);

  const type = METALS[element] ? 'cation' : 'anion';
  const chosenState = oxidationState ?? info.commonOxidationStates[0];
  const charge = chosenState; // positive for metals, negative for nonmetals

  return {
    id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    element,
    position,
    initialValence: info.valenceElectrons,
    currentValence: 0, // fully transferred: shown as ionized
    charge,
    isIonized: true,
    type,
    oxidationState: chosenState,
    transferredElectrons: Math.abs(chosenState),
    targetPosition: null,
  };
}

/**
 * Creates a pre-ionized IonicAtom for a polyatomic ion.
 * Polyatomics are always added already charged (no electron transfer needed).
 */
export function createPolyatomicBuilderAtom(
  polyatomicId: string,
  position: { x: number; y: number }
): IonicAtom {
  const info = POLYATOMIC_IONS[polyatomicId];
  if (!info) throw new Error(`Unknown polyatomic ion: ${polyatomicId}`);

  const type: 'cation' | 'anion' = info.charge > 0 ? 'cation' : 'anion';

  return {
    id: `atom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    element: info.formula, // display label
    position,
    initialValence: 0,
    currentValence: 0, // not electron-transferable
    charge: info.charge,
    isIonized: true, // already fully ionized
    type,
    transferredElectrons: 0,
    targetPosition: null,
    polyatomicId,
  };
}

/**
 * Checks if an electron can be transferred from source to target
 */
export function canTransfer(from: IonicAtom, to: IonicAtom): boolean {
  if (from.type !== 'cation' || to.type !== 'anion') return false;

  // Polyatomic cations can't donate individual electrons
  if (from.polyatomicId) return false;

  // From element must still have electrons to give
  if (from.currentValence <= 0) return false;

  // Polyatomic anion acts as an electron sink: the metal sheds electrons "into" it.
  // The polyatomic's own charge doesn't change (it's a pre-formed unit), but the metal
  // gets ionized. Allow this as long as the metal still has electrons to give.
  if (to.polyatomicId) return true;

  // Monoatomic anion: must have space (octet rule)
  if (to.currentValence >= 8) return false;

  return true;
}

/**
 * Performs electron transfer between two atoms
 */
export function transferElectron(from: IonicAtom, to: IonicAtom): { from: IonicAtom; to: IonicAtom } {
  if (!canTransfer(from, to)) return { from, to };

  const updatedFrom: IonicAtom = {
    ...from,
    currentValence: from.currentValence - 1,
    charge: from.charge + 1,
    transferredElectrons: from.transferredElectrons + 1,
  };

  if (updatedFrom.currentValence === 0) {
    updatedFrom.isIonized = true;
  }

  // Polyatomic anion: the electron is absorbed into the pre-formed ion unit.
  // The polyatomic's own charge and structure don't change: only the metal changes.
  if (to.polyatomicId) {
    return { from: updatedFrom, to };
  }

  // Monoatomic anion gains the electron normally
  const updatedTo: IonicAtom = {
    ...to,
    currentValence: to.currentValence + 1,
    charge: to.charge - 1,
    transferredElectrons: to.transferredElectrons + 1,
  };

  if (updatedTo.currentValence === 8) {
    updatedTo.isIonized = true;
  }

  return { from: updatedFrom, to: updatedTo };
}

/**
 * Calculates target lattice positions for a balanced compound
 */
export function calculateLatticePositions(atoms: IonicAtom[], centerX: number, centerY: number): IonicAtom[] {
  if (atoms.length === 0) return atoms;

  const spacing = 160; // Distance between ions in the lattice (increased to prevent bracket overlap)
  const cations = atoms.filter(a => a.type === 'cation');
  const anions = atoms.filter(a => a.type === 'anion');

  // Simple arrangement logic based on counts
  // 1:1, 1:2, 1:3, 2:1, 2:3, etc.
  
  if (cations.length === 1 && anions.length === 1) {
    // Linear 1:1 (NaCl)
    return atoms.map(a => ({
      ...a,
      targetPosition: a.type === 'cation' 
        ? { x: centerX - spacing/2, y: centerY } 
        : { x: centerX + spacing/2, y: centerY }
    }));
  }

  if (cations.length === 1 && anions.length > 1) {
    // Star arrangement (MgCl2, AlCl3)
    return atoms.map(a => {
      if (a.type === 'cation') return { ...a, targetPosition: { x: centerX, y: centerY } };
      
      const idx = anions.indexOf(a);
      const angle = (idx * (2 * Math.PI)) / anions.length;
      return {
        ...a,
        targetPosition: {
          x: centerX + spacing * Math.cos(angle),
          y: centerY + spacing * Math.sin(angle)
        }
      };
    });
  }

  if (anions.length === 1 && cations.length > 1) {
    // Inverse star (Na2O)
    return atoms.map(a => {
      if (a.type === 'anion') return { ...a, targetPosition: { x: centerX, y: centerY } };
      
      const idx = cations.indexOf(a);
      const angle = (idx * (2 * Math.PI)) / cations.length;
      return {
        ...a,
        targetPosition: {
          x: centerX + spacing * Math.cos(angle),
          y: centerY + spacing * Math.sin(angle)
        }
      };
    });
  }

  // Row-based alternating for more complex (Fe2O3)
  const _allSorted = [...cations, ...anions].sort((a,_b) => (a.type === 'cation' ? -1 : 1));
  return atoms.map((a, i) => {
    const rowIdx = Math.floor(i / 3);
    const colIdx = i % 3;
    return {
      ...a,
      targetPosition: {
        x: centerX + (colIdx - 1) * spacing,
        y: centerY + (rowIdx - 0.5) * spacing
      }
    };
  });
}

/**
 * Validates a collection of atoms to see if they form a balanced compound
 */
export function validateBuilderCompound(atoms: IonicAtom[]): {
  isBalanced: boolean,
  totalCharge: number,
  formula: string,
  name: string
} {
  if (atoms.length === 0) {
    return { isBalanced: false, totalCharge: 0, formula: '', name: '' };
  }

  const totalCharge = atoms.reduce((sum, a) => sum + a.charge, 0);
  const isBalanced = totalCharge === 0 && atoms.every(a => a.isIonized);

  // Build formula: polyatomics use their own formula string; monatomics use element symbol
  const cationAtoms = atoms.filter(a => a.type === 'cation');
  const anionAtoms = atoms.filter(a => a.type === 'anion');

  const buildSegment = (group: IonicAtom[]): string => {
    // Group by element/polyatomicId
    const counts: Record<string, number> = {};
    const labels: Record<string, string> = {};
    const isPoly: Record<string, boolean> = {};

    group.forEach(a => {
      const key = a.polyatomicId ?? a.element;
      counts[key] = (counts[key] || 0) + 1;
      if (a.polyatomicId) {
        // Strip charge superscripts from the stored formula for the base label
        labels[key] = POLYATOMIC_IONS[a.polyatomicId].formula.replace(/[⁺⁻¹²³⁴⁰]/g, '');
        isPoly[key] = true;
      } else {
        labels[key] = a.element;
        isPoly[key] = false;
      }
    });

    return Object.keys(counts).map(key => {
      const count = counts[key];
      const label = labels[key];
      if (isPoly[key] && count > 1) return `(${label})${formatSubscript(count)}`;
      if (count > 1) return `${label}${formatSubscript(count)}`;
      return label;
    }).join('');
  };

  const formula = buildSegment(cationAtoms) + buildSegment(anionAtoms);

  // Generate compound name
  const cationSample = cationAtoms[0];
  const anionSample = anionAtoms[0];
  let name = '';

  if (cationSample && anionSample) {
    // Cation name
    let cationName = '';
    if (cationSample.polyatomicId) {
      cationName = POLYATOMIC_IONS[cationSample.polyatomicId].name;
    } else {
      const info = METALS[cationSample.element];
      if (info) {
        cationName = info.name;
        if (info.commonOxidationStates.length > 1) {
          const roman = toRoman(cationSample.oxidationState || info.commonOxidationStates[0]);
          cationName += `(${roman})`;
        }
      }
    }

    // Anion name
    let anionName = '';
    if (anionSample.polyatomicId) {
      anionName = POLYATOMIC_IONS[anionSample.polyatomicId].name;
    } else {
      const info = NONMETALS[anionSample.element];
      if (info) {
        anionName = info.name.replace(/(ine|ogen|ygen|ur|orus)$/, '') + 'ide';
      }
    }

    if (cationName && anionName) name = `${cationName} ${anionName}`;
  }

  return { isBalanced, totalCharge, formula, name };
}

function formatSubscript(num: number): string {
  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
  };
  return num.toString().split('').map(d => subscripts[d] || d).join('');
}

function toRoman(num: number): string {
  const romans: Record<number, string> = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };
  return romans[num] || num.toString();
}
