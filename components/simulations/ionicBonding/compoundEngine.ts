/**
 * Compound Engine - Generates chemical formulas and IUPAC names for ionic compounds
 */

import { METALS, NONMETALS, POLYATOMIC_IONS, COMMON_IONIC_COMPOUNDS } from './ionicDatabase';
import type { IonicCompound } from './ionEngine';

/**
 * Convert number to subscript Unicode characters
 */
function toSubscript(num: number): string {
  if (num === 1) return '';

  const subscripts: Record<string, string> = {
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

  return num
    .toString()
    .split('')
    .map(digit => subscripts[digit] || digit)
    .join('');
}

/**
 * Convert number to superscript (for charges)
 */
function toSuperscript(num: number, sign: '+' | '-'): string {
  const superscripts: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
    '+': '⁺',
    '-': '⁻',
  };

  if (num === 1) {
    return superscripts[sign];
  }

  return (
    num
      .toString()
      .split('')
      .map(digit => superscripts[digit] || digit)
      .join('') + superscripts[sign]
  );
}

/**
 * Generate chemical formula for an ionic compound
 */
export function generateFormula(compound: IonicCompound): string {
  if (compound.cations.length === 0 || compound.anions.length === 0) {
    return '';
  }

  const cation = compound.cations[0];
  const anion = compound.anions[0];

  let formula = '';

  // Cation part
  if (cation.polyatomicId) {
    const polyatomic = POLYATOMIC_IONS[cation.polyatomicId];
    // Remove charge symbols from polyatomic formula
    const cleanFormula = polyatomic.formula.replace(/[⁺⁻¹²³⁴]/g, '');
    if (cation.count > 1) {
      formula += `(${cleanFormula})${toSubscript(cation.count)}`;
    } else {
      formula += cleanFormula;
    }
  } else if (cation.element) {
    formula += cation.element;
    if (cation.count > 1) {
      formula += toSubscript(cation.count);
    }
  }

  // Anion part
  if (anion.polyatomicId) {
    const polyatomic = POLYATOMIC_IONS[anion.polyatomicId];
    const cleanFormula = polyatomic.formula.replace(/[⁺⁻¹²³⁴]/g, '');
    if (anion.count > 1) {
      formula += `(${cleanFormula})${toSubscript(anion.count)}`;
    } else {
      formula += cleanFormula;
    }
  } else if (anion.element) {
    formula += anion.element;
    if (anion.count > 1) {
      formula += toSubscript(anion.count);
    }
  }

  return formula;
}

/**
 * Generate IUPAC name for an ionic compound
 */
export function generateIUPACName(compound: IonicCompound): string {
  if (compound.cations.length === 0 || compound.anions.length === 0) {
    return '';
  }

  const cation = compound.cations[0];
  const anion = compound.anions[0];

  let name = '';

  // Cation name
  if (cation.polyatomicId) {
    const polyatomic = POLYATOMIC_IONS[cation.polyatomicId];
    name += polyatomic.name;
  } else if (cation.element) {
    const elementInfo = METALS[cation.element];
    if (elementInfo) {
      name += elementInfo.name;

      // Add Roman numeral for transition metals with variable oxidation states
      if (elementInfo.commonOxidationStates.length > 1) {
        const romanNumerals: Record<number, string> = {
          1: 'I',
          2: 'II',
          3: 'III',
          4: 'IV',
          5: 'V',
        };
        name += `(${romanNumerals[cation.charge] || cation.charge})`;
      }
    }
  }

  name += ' ';

  // Anion name
  if (anion.polyatomicId) {
    const polyatomic = POLYATOMIC_IONS[anion.polyatomicId];
    name += polyatomic.name;
  } else if (anion.element) {
    const elementInfo = NONMETALS[anion.element];
    if (elementInfo) {
      // Change ending to -ide for monoatomic anions
      const elementName = elementInfo.name;
      if (elementName.endsWith('ine')) {
        // Chlorine -> Chloride, Fluorine -> Fluoride
        name += elementName.slice(0, -3) + 'ide';
      } else if (elementName.endsWith('gen')) {
        // Oxygen -> Oxide, Nitrogen -> Nitride
        name += elementName.slice(0, -3) + 'ide';
      } else if (elementName.endsWith('ur')) {
        // Sulfur -> Sulfide
        name += elementName + 'ide';
      } else if (elementName.endsWith('orus')) {
        // Phosphorus -> Phosphide
        name += elementName.slice(0, -4) + 'ide';
      } else {
        // Default: just add -ide
        name += elementName + 'ide';
      }
    }
  }

  return name;
}

/**
 * Identify if the compound is a known common compound
 */
export function identifyCompound(formula: string): string | null {
  const compound = COMMON_IONIC_COMPOUNDS[formula];
  return compound ? compound.name : null;
}

/**
 * Calculate formula mass (molar mass) of the compound
 */
export function calculateFormulaMass(compound: IonicCompound): number {
  let totalMass = 0;

  // Cations
  for (const cation of compound.cations) {
    if (cation.polyatomicId) {
      const polyatomic = POLYATOMIC_IONS[cation.polyatomicId];
      let polyatomicMass = 0;

      // Calculate mass of polyatomic ion
      for (const atom of polyatomic.atoms) {
        const element = METALS[atom.element] || NONMETALS[atom.element];
        if (element) {
          polyatomicMass += element.atomicMass * atom.count;
        }
      }

      totalMass += polyatomicMass * cation.count;
    } else if (cation.element) {
      const element = METALS[cation.element];
      if (element) {
        totalMass += element.atomicMass * cation.count;
      }
    }
  }

  // Anions
  for (const anion of compound.anions) {
    if (anion.polyatomicId) {
      const polyatomic = POLYATOMIC_IONS[anion.polyatomicId];
      let polyatomicMass = 0;

      for (const atom of polyatomic.atoms) {
        const element = METALS[atom.element] || NONMETALS[atom.element];
        if (element) {
          polyatomicMass += element.atomicMass * atom.count;
        }
      }

      totalMass += polyatomicMass * anion.count;
    } else if (anion.element) {
      const element = NONMETALS[anion.element];
      if (element) {
        totalMass += element.atomicMass * anion.count;
      }
    }
  }

  return totalMass;
}

/**
 * Get the ionic equation showing the formation of the compound
 * e.g., "Na⁺ + Cl⁻ → NaCl" or "Mg²⁺ + 2Cl⁻ → MgCl₂"
 */
export function getIonicEquation(compound: IonicCompound): string {
  if (compound.cations.length === 0 || compound.anions.length === 0) {
    return '';
  }

  const cation = compound.cations[0];
  const anion = compound.anions[0];

  let equation = '';

  // Left side (reactants)
  // Cation
  if (cation.count > 1) {
    equation += `${cation.count}`;
  }
  if (cation.polyatomicId) {
    equation += POLYATOMIC_IONS[cation.polyatomicId].formula;
  } else if (cation.element) {
    equation += `${cation.element}${toSuperscript(cation.charge, '+')}`;
  }

  equation += ' + ';

  // Anion
  if (anion.count > 1) {
    equation += `${anion.count}`;
  }
  if (anion.polyatomicId) {
    equation += POLYATOMIC_IONS[anion.polyatomicId].formula;
  } else if (anion.element) {
    equation += `${anion.element}${toSuperscript(Math.abs(anion.charge), '-')}`;
  }

  equation += ' → ';

  // Right side (product)
  equation += generateFormula(compound);

  return equation;
}

/**
 * Get bonding description for educational purposes
 */
export function getBondingDescription(compound: IonicCompound): string {
  if (compound.cations.length === 0 || compound.anions.length === 0) {
    return '';
  }

  const cation = compound.cations[0];
  const anion = compound.anions[0];

  const cationName = cation.element
    ? METALS[cation.element]?.name
    : POLYATOMIC_IONS[cation.polyatomicId || '']?.name;
  const anionName = anion.element
    ? NONMETALS[anion.element]?.name
    : POLYATOMIC_IONS[anion.polyatomicId || '']?.name;

  if (cation.element && anion.element) {
    // Monoatomic to monoatomic
    const electronsTransferred = Math.abs(cation.charge);
    return `${cationName} loses ${electronsTransferred} electron${electronsTransferred > 1 ? 's' : ''} to become ${cationName}${toSuperscript(cation.charge, '+')}. ${anionName} gains ${Math.abs(anion.charge)} electron${Math.abs(anion.charge) > 1 ? 's' : ''} to become ${anionName}${toSuperscript(Math.abs(anion.charge), '-')}. Electrostatic attraction forms the ionic bond.`;
  } else if (cation.polyatomicId || anion.polyatomicId) {
    // Polyatomic ion involved
    return `${cationName || 'Cation'} (charge: ${cation.charge > 0 ? '+' : ''}${cation.charge}) and ${anionName || 'Anion'} (charge: ${anion.charge}) attract via electrostatic forces to form a stable ionic compound.`;
  }

  return 'Ionic bond formed through electrostatic attraction between oppositely charged ions.';
}
