/**
 * Formula Engine for Covalent Bonding Simulation
 * Handles chemical formula generation, molar mass calculation, and molecule identification
 */

import type { Molecule } from '../../../types';
import { ATOMIC_MASSES, COMMON_MOLECULES, ELECTRONEGATIVITY, type MoleculeInfo } from './moleculeDatabase';

/**
 * Generates chemical formula in Hill notation with hydride convention
 * Hill notation: C first, then H, then all other elements alphabetically
 * Special case: For simple hydrides (no carbon), element comes before H
 * Examples: CH4, C2H6, CO2, H2O, NH3, H2S
 */
export function generateChemicalFormula(molecule: Molecule): string {
  if (!molecule.atoms || molecule.atoms.length === 0) {
    return '';
  }

  // Count atoms by element
  const elementCounts: Record<string, number> = {};
  for (const atom of molecule.atoms) {
    elementCounts[atom.element] = (elementCounts[atom.element] || 0) + 1;
  }

  // Hill notation ordering
  const elements: string[] = [];

  // Check if this is a carbon-containing compound
  const hasCarbon = !!elementCounts.C;

  if (hasCarbon) {
    // Standard Hill notation for organic compounds
    // 1. Carbon first
    if (elementCounts.C) {
      elements.push(`C${elementCounts.C > 1 ? elementCounts.C : ''}`);
      delete elementCounts.C;
    }

    // 2. Hydrogen second
    if (elementCounts.H) {
      elements.push(`H${elementCounts.H > 1 ? elementCounts.H : ''}`);
      delete elementCounts.H;
    }

    // 3. All others alphabetically
    const remaining = Object.keys(elementCounts).sort();
    for (const element of remaining) {
      const count = elementCounts[element];
      elements.push(`${element}${count > 1 ? count : ''}`);
    }
  } else {
    // For non-carbon compounds (inorganic)
    // Use hydride convention: element before hydrogen for simple binary hydrides
    // Check if this is a simple hydride (only H + one other element)
    const elementList = Object.keys(elementCounts);
    const isSimpleHydride = elementList.length === 2 && elementCounts.H;

    if (isSimpleHydride) {
      // Put non-hydrogen element first, then hydrogen
      const otherElement = elementList.find(e => e !== 'H')!;
      elements.push(`${otherElement}${elementCounts[otherElement] > 1 ? elementCounts[otherElement] : ''}`);
      elements.push(`H${elementCounts.H > 1 ? elementCounts.H : ''}`);
    } else {
      // Inorganic convention: less electronegative element first
      const sorted = Object.keys(elementCounts).sort((a, b) => {
        const enA = ELECTRONEGATIVITY[a] ?? 2.5;
        const enB = ELECTRONEGATIVITY[b] ?? 2.5;
        return enA - enB; // less electronegative first
      });
      for (const element of sorted) {
        const count = elementCounts[element];
        elements.push(`${element}${count > 1 ? count : ''}`);
      }
    }
  }

  return elements.join('');
}

/**
 * Calculates the molar mass of a molecule in g/mol
 */
export function calculateMolarMass(molecule: Molecule): number {
  let totalMass = 0;

  for (const atom of molecule.atoms) {
    const mass = ATOMIC_MASSES[atom.element];
    if (mass) {
      totalMass += mass;
    }
  }

  // Round to 2 decimal places
  return Math.round(totalMass * 100) / 100;
}

/**
 * Calculates the formal charge of the entire molecule
 * Sum of all individual atomic formal charges
 * Formal charge = valence electrons - (non-bonding electrons + 1/2 bonding electrons)
 */
export function calculateFormalCharge(molecule: Molecule): number {
  let totalCharge = 0;

  for (const atom of molecule.atoms) {
    const valence = atom.valenceElectrons;
    const nonBonding = atom.electronAssignments.lonePairs * 2;
    const bondingShare = atom.electronAssignments.bonding / 2;

    const formalCharge = valence - (nonBonding + bondingShare);
    totalCharge += formalCharge;
  }

  return totalCharge;
}

/**
 * Identifies a molecule by its chemical formula
 * Returns common name and IUPAC name if recognized
 */
export function identifyMolecule(formula: string): MoleculeInfo | null {
  // Direct lookup
  if (COMMON_MOLECULES[formula]) {
    return COMMON_MOLECULES[formula];
  }

  // Try alternative formulas (e.g., OH2 vs H2O)
  // This handles cases where atoms aren't in Hill notation order
  const altFormula = normalizeFormula(formula);
  if (COMMON_MOLECULES[altFormula]) {
    return COMMON_MOLECULES[altFormula];
  }

  return null;
}

/**
 * Normalizes a formula to Hill notation for lookup
 * Example: OH2 → H2O
 */
function normalizeFormula(formula: string): string {
  // Parse the formula into element counts
  const elementCounts: Record<string, number> = {};
  const regex = /([A-Z][a-z]?)(\d*)/g;
  let match;

  while ((match = regex.exec(formula)) !== null) {
    const element = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;
    elementCounts[element] = (elementCounts[element] || 0) + count;
  }

  // Rebuild in Hill notation
  const elements: string[] = [];

  if (elementCounts.C) {
    elements.push(`C${elementCounts.C > 1 ? elementCounts.C : ''}`);
    delete elementCounts.C;
  }

  if (elementCounts.H) {
    elements.push(`H${elementCounts.H > 1 ? elementCounts.H : ''}`);
    delete elementCounts.H;
  }

  const remaining = Object.keys(elementCounts).sort((a, b) => {
    const enA = ELECTRONEGATIVITY[a] ?? 2.5;
    const enB = ELECTRONEGATIVITY[b] ?? 2.5;
    return enA - enB;
  });
  for (const element of remaining) {
    const count = elementCounts[element];
    elements.push(`${element}${count > 1 ? count : ''}`);
  }

  return elements.join('');
}

/**
 * Converts formula to display format with subscripts
 * Example: H2O → H₂O
 */
export function formatFormulaWithSubscripts(formula: string): string {
  const subscriptMap: Record<string, string> = {
    '0': '₀',
    '1': '₁',
    '2': '₂',
    '3': '₃',
    '4': '₄',
    '5': '₅',
    '6': '₆',
    '7': '₇',
    '8': '₈',
    '9': '₉',
  };

  return formula.replace(/\d/g, (digit) => subscriptMap[digit] || digit);
}
