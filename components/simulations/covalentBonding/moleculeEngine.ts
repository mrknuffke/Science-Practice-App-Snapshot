/**
 * Molecule Engine for Covalent Bonding Simulation
 * Core chemistry logic with electron apportionment mechanics
 */

import type { Atom, Bond, Molecule, MoleculeValidation, AtomStatus, CourseType } from '../../../types';
import { VALENCE_ELECTRONS, TARGET_ELECTRONS, ELECTRONEGATIVITY } from './moleculeDatabase';

/**
 * Gets the number of unassigned valence electrons for an atom
 */
export function getAvailableElectrons(atom: Atom): number {
  return atom.valenceElectrons - atom.electronAssignments.bonding;
}

/**
 * Validates if two atoms can form a bond based on available electrons
 */
export function canFormBond(
  atom1: Atom,
  atom2: Atom,
  bondType: 'single' | 'double' | 'triple'
): { valid: boolean; reason?: string } {
  const electronsNeeded = bondType === 'single' ? 1 : bondType === 'double' ? 2 : 3;

  const atom1Available = atom1.electronAssignments.available;
  const atom2Available = atom2.electronAssignments.available;

  if (atom1Available < electronsNeeded) {
    return {
      valid: false,
      reason: `${atom1.element} only has ${atom1Available} available electron${atom1Available !== 1 ? 's' : ''}, but needs ${electronsNeeded} for a ${bondType} bond`,
    };
  }

  if (atom2Available < electronsNeeded) {
    return {
      valid: false,
      reason: `${atom2.element} only has ${atom2Available} available electron${atom2Available !== 1 ? 's' : ''}, but needs ${electronsNeeded} for a ${bondType} bond`,
    };
  }

  // Check if atoms are already bonded
  if (atom1.bonds.some((bondId) => atom2.bonds.includes(bondId))) {
    return {
      valid: false,
      reason: `${atom1.element} and ${atom2.element} are already bonded`,
    };
  }

  return { valid: true };
}

/**
 * Creates a bond between two atoms by apportioning electrons
 * Updates both atoms' electron assignments
 */
export function createBond(
  molecule: Molecule,
  atom1Id: string,
  atom2Id: string,
  bondType: 'single' | 'double' | 'triple'
): { success: boolean; molecule?: Molecule; error?: string } {
  const atom1 = molecule.atoms.find((a) => a.id === atom1Id);
  const atom2 = molecule.atoms.find((a) => a.id === atom2Id);

  if (!atom1 || !atom2) {
    return { success: false, error: 'Atom not found' };
  }

  // Validate bond can be formed
  const validation = canFormBond(atom1, atom2, bondType);
  if (!validation.valid) {
    return { success: false, error: validation.reason };
  }

  // Calculate electrons for bond
  const electronsPerAtom = bondType === 'single' ? 1 : bondType === 'double' ? 2 : 3;
  const totalElectrons = electronsPerAtom * 2;

  // Create new bond
  const newBond: Bond = {
    id: `bond-${Date.now()}-${Math.random()}`,
    atom1Id,
    atom2Id,
    type: bondType,
    electrons: totalElectrons,
  };

  // Update atoms
  const updatedAtoms = molecule.atoms.map((atom) => {
    if (atom.id === atom1Id || atom.id === atom2Id) {
      return {
        ...atom,
        electronAssignments: {
          ...atom.electronAssignments,
          bonding: atom.electronAssignments.bonding + electronsPerAtom,
          available: atom.electronAssignments.available - electronsPerAtom,
        },
        bonds: [...atom.bonds, newBond.id],
      };
    }
    return atom;
  });

  return {
    success: true,
    molecule: {
      ...molecule,
      atoms: updatedAtoms,
      bonds: [...molecule.bonds, newBond],
    },
  };
}

/**
 * Breaks an existing bond, returning electrons to atoms' available pools
 */
export function breakBond(molecule: Molecule, bondId: string): Molecule {
  const bond = molecule.bonds.find((b) => b.id === bondId);
  if (!bond) {
    return molecule;
  }

  const electronsPerAtom = bond.electrons / 2;

  // Update atoms
  const updatedAtoms = molecule.atoms.map((atom) => {
    if (atom.id === bond.atom1Id || atom.id === bond.atom2Id) {
      return {
        ...atom,
        electronAssignments: {
          ...atom.electronAssignments,
          bonding: atom.electronAssignments.bonding - electronsPerAtom,
          available: atom.electronAssignments.available + electronsPerAtom,
        },
        bonds: atom.bonds.filter((id) => id !== bondId),
      };
    }
    return atom;
  });

  return assignLonePairs({
    ...molecule,
    atoms: updatedAtoms,
    bonds: molecule.bonds.filter((b) => b.id !== bondId),
  });
}

/**
 * Calculates lone pairs for an atom (available electrons ÷ 2)
 */
export function calculateLonePairs(atom: Atom): number {
  return Math.floor(atom.electronAssignments.available / 2);
}

/**
 * Assigns remaining available electrons as lone pairs
 */
export function assignLonePairs(molecule: Molecule): Molecule {
  const updatedAtoms = molecule.atoms.map((atom) => {
    // Available is simply valence minus what we've committed to bonds
    const availableElectrons = atom.valenceElectrons - atom.electronAssignments.bonding;
    const lonePairElectrons = Math.floor(availableElectrons / 2) * 2;

    return {
      ...atom,
      electronAssignments: {
        ...atom.electronAssignments,
        lonePairs: lonePairElectrons,
        available: availableElectrons, // Never reduce available by lone pairs!
      },
    };
  });

  return {
    ...molecule,
    atoms: updatedAtoms,
  };
}

/**
 * Checks if an atom satisfies the octet rule (or duet for H)
 */
export function checkOctetSatisfaction(atom: Atom): {
  satisfied: boolean;
  assigned: number;
  target: number;
} {
  // Octet count is original valence + electrons gained from forming bonds (which equals bonding)
  const assigned = atom.valenceElectrons + atom.electronAssignments.bonding;
  const target = TARGET_ELECTRONS[atom.element] || 8;

  return {
    satisfied: assigned >= target,
    assigned,
    target,
  };
}

/**
 * Gets status for all atoms in molecule
 */
export function getAtomStatuses(molecule: Molecule): AtomStatus[] {
  return molecule.atoms.map((atom) => {
    const { satisfied, assigned, target } = checkOctetSatisfaction(atom);
    return {
      atomId: atom.id,
      element: atom.element,
      octetSatisfied: satisfied,
      assignedElectrons: assigned,
      targetElectrons: target,
    };
  });
}

/**
 * Validates molecule based on course level
 * General/Honors: Strict octet rule
 * AP: Allows expanded octets for P, S, Cl, Br, I, Xe
 */
export function validateMolecule(molecule: Molecule, courseLevel: CourseType): MoleculeValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  let satisfiedCount = 0;

  const isAP = courseLevel.includes('AP');

  for (const atom of molecule.atoms) {
    const { satisfied, assigned, target } = checkOctetSatisfaction(atom);

    if (satisfied) {
      satisfiedCount++;
    } else if (assigned > target) {
      // Expanded octet
      if (isAP && ['P', 'S', 'Cl', 'Br', 'I', 'Xe'].includes(atom.element)) {
        satisfiedCount++;
        warnings.push(`${atom.element} has expanded octet (${assigned} electrons)`);
      } else {
        errors.push(`${atom.element} has too many electrons (${assigned}/${target})`);
      }
    } else {
      // Incomplete octet
      warnings.push(`${atom.element} needs ${target - assigned} more electron${target - assigned !== 1 ? 's' : ''}`);
    }
  }

  const completeness = molecule.atoms.length > 0 ? (satisfiedCount / molecule.atoms.length) * 100 : 0;

  return {
    valid: errors.length === 0 && completeness === 100,
    errors,
    warnings,
    completeness: Math.round(completeness),
  };
}

/**
 * Calculates molecular geometry using simple VSEPR theory
 * Based on electron groups around central atom
 */
export function calculateGeometry(molecule: Molecule): {
  geometry: string;
  bondAngles: number[];
  hybridization: string;
} {
  // For now, use simple heuristics
  // TODO: Implement full VSEPR calculation for complex molecules

  if (molecule.atoms.length === 1) {
    return { geometry: 'Atomic', bondAngles: [], hybridization: 's' };
  }

  if (molecule.atoms.length === 2) {
    return { geometry: 'Linear', bondAngles: [180], hybridization: 'sp' };
  }

  // Find central atom (most bonds)
  const central = molecule.atoms.reduce((max, atom) =>
    atom.bonds.length > max.bonds.length ? atom : max
  );

  const bondCount = central.bonds.length;
  const lonePairs = calculateLonePairs(central);
  const electronGroups = bondCount + lonePairs;

  // VSEPR geometry determination
  if (electronGroups === 2) {
    return { geometry: 'Linear', bondAngles: [180], hybridization: 'sp' };
  } else if (electronGroups === 3) {
    if (lonePairs === 0) {
      return { geometry: 'Trigonal Planar', bondAngles: [120], hybridization: 'sp²' };
    } else {
      return { geometry: 'Bent', bondAngles: [117], hybridization: 'sp²' }; // ~120° with lone pair
    }
  } else if (electronGroups === 4) {
    if (lonePairs === 0) {
      return { geometry: 'Tetrahedral', bondAngles: [109.5], hybridization: 'sp³' };
    } else if (lonePairs === 1) {
      return { geometry: 'Trigonal Pyramidal', bondAngles: [107], hybridization: 'sp³' }; // ~109.5° with lone pair
    } else {
      return { geometry: 'Bent', bondAngles: [104.5], hybridization: 'sp³' }; // ~109.5° with 2 lone pairs
    }
  } else if (electronGroups === 5) {
    if (lonePairs === 0) {
      return { geometry: 'Trigonal Bipyramidal', bondAngles: [90, 120], hybridization: 'sp³d' };
    } else if (lonePairs === 1) {
      return { geometry: 'Seesaw', bondAngles: [117, 87], hybridization: 'sp³d' }; // Distorted angles
    } else if (lonePairs === 2) {
      return { geometry: 'T-Shaped', bondAngles: [87], hybridization: 'sp³d' }; // Slightly less than 90°
    } else {
      return { geometry: 'Linear', bondAngles: [180], hybridization: 'sp³d' };
    }
  } else if (electronGroups === 6) {
    if (lonePairs === 0) {
      return { geometry: 'Octahedral', bondAngles: [90], hybridization: 'sp³d²' };
    } else if (lonePairs === 1) {
      return { geometry: 'Square Pyramidal', bondAngles: [87], hybridization: 'sp³d²' }; // Slightly less than 90°
    } else {
      return { geometry: 'Square Planar', bondAngles: [90], hybridization: 'sp³d²' };
    }
  }

  return { geometry: 'Unknown', bondAngles: [], hybridization: 'unknown' };
}

/**
 * Determines molecular polarity based on geometry and electronegativity
 */
export function calculatePolarity(molecule: Molecule): 'polar' | 'nonpolar' {
  if (molecule.atoms.length === 1) {
    return 'nonpolar';
  }

  if (molecule.atoms.length === 2) {
    const atom1 = molecule.atoms[0];
    const atom2 = molecule.atoms[1];
    const en1 = ELECTRONEGATIVITY[atom1.element] || 0;
    const en2 = ELECTRONEGATIVITY[atom2.element] || 0;
    return Math.abs(en1 - en2) > 0.4 ? 'polar' : 'nonpolar';
  }

  // For larger molecules, check for symmetry
  // This is a simplified approach
  const { geometry } = calculateGeometry(molecule);

  // Symmetric geometries are usually nonpolar if all atoms are identical
  const allSameElement = molecule.atoms.every((a) => a.element === molecule.atoms[0].element);
  if (allSameElement) {
    return 'nonpolar';
  }

  // Linear and symmetric geometries
  if (['Linear', 'Trigonal Planar', 'Tetrahedral', 'Octahedral'].includes(geometry)) {
    // Check if all peripheral atoms are the same
    const central = molecule.atoms.reduce((max, atom) =>
      atom.bonds.length > max.bonds.length ? atom : max
    );
    const peripheral = molecule.atoms.filter((a) => a.id !== central.id);
    const allPeripheralSame = peripheral.every((a) => a.element === peripheral[0].element);

    return allPeripheralSame ? 'nonpolar' : 'polar';
  }

  // Asymmetric geometries are usually polar
  return 'polar';
}

/**
 * Creates a new atom with initial electron assignments
 */
export function createAtom(element: string, position: { x: number; y: number }): Atom {
  const valence = VALENCE_ELECTRONS[element] || 0;

  return {
    id: `atom-${Date.now()}-${Math.random()}`,
    element,
    position,
    valenceElectrons: valence,
    electronAssignments: {
      bonding: 0,
      lonePairs: 0,
      available: valence,
    },
    bonds: [],
  };
}

/**
 * Removes an atom from the molecule (also removes connected bonds)
 */
export function removeAtom(molecule: Molecule, atomId: string): Molecule {
  const atom = molecule.atoms.find((a) => a.id === atomId);
  if (!atom) {
    return molecule;
  }

  // Remove all bonds connected to this atom
  let updatedMolecule = molecule;
  for (const bondId of atom.bonds) {
    updatedMolecule = breakBond(updatedMolecule, bondId);
  }

  // Remove the atom
  return {
    ...updatedMolecule,
    atoms: updatedMolecule.atoms.filter((a) => a.id !== atomId),
  };
}
