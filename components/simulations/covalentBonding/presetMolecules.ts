/**
 * Preset Molecules Library for Covalent Bonding Simulation
 * Pre-built molecules that students can quick-load for learning
 */

import type { Molecule, Atom, Bond } from '../../../types';

export interface PresetMolecule {
  id: string;
  name: string;
  formula: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'Simple' | 'Hydrocarbons' | 'Organic' | 'Expanded Octet' | 'Acids';
  description: string;
  molecule: Molecule;
}

/**
 * Helper function to create atoms with proper electron assignments
 */
function createPresetAtom(
  id: string,
  element: string,
  x: number,
  y: number,
  valence: number,
  bonding: number,
  lonePairs: number
): Atom {
  return {
    id,
    element,
    position: { x, y },
    valenceElectrons: valence,
    electronAssignments: {
      bonding,
      lonePairs,
      available: valence - bonding,
    },
    bonds: [], // Will be populated when we add bonds
  };
}

/**
 * Helper function to create bonds
 */
function createPresetBond(
  id: string,
  atom1Id: string,
  atom2Id: string,
  type: 'single' | 'double' | 'triple'
): Bond {
  const electrons = type === 'single' ? 2 : type === 'double' ? 4 : 6;
  return {
    id,
    atom1Id,
    atom2Id,
    type,
    electrons,
  };
}

/**
 * Helper to link bonds to atoms
 */
function linkBondsToAtoms(atoms: Atom[], bonds: Bond[]): Atom[] {
  return atoms.map(atom => ({
    ...atom,
    bonds: bonds.filter(b => b.atom1Id === atom.id || b.atom2Id === atom.id).map(b => b.id),
  }));
}

// ===== BEGINNER MOLECULES =====

// Hydrogen (H2) - Simplest molecule
const H2: PresetMolecule = {
  id: 'H2',
  name: 'Hydrogen Gas',
  formula: 'H₂',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Simplest diatomic molecule with single bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('H1', 'H', 200, 200, 1, 1, 0),
      createPresetAtom('H2', 'H', 300, 200, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'H1', 'H2', 'single'),
    ];
    return {
      id: 'molecule-H2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'H2',
    };
  })(),
};

// Hydrogen Fluoride (HF) - Linear, polar
const HF: PresetMolecule = {
  id: 'HF',
  name: 'Hydrogen Fluoride',
  formula: 'HF',
  difficulty: 'beginner',
  category: 'Acids',
  description: 'Highly polar bond between H and most electronegative element',
  molecule: (() => {
    const atoms = [
      createPresetAtom('H1', 'H', 200, 200, 1, 1, 0),
      createPresetAtom('F1', 'F', 300, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'H1', 'F1', 'single'),
    ];
    return {
      id: 'molecule-HF',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'HF',
    };
  })(),
};

// Water (H2O) - Bent, polar
const WATER: PresetMolecule = {
  id: 'H2O',
  name: 'Water',
  formula: 'H₂O',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Bent molecular geometry with 2 lone pairs on oxygen',
  molecule: (() => {
    const atoms = [
      createPresetAtom('O1', 'O', 250, 200, 6, 2, 4), // O: 2 bonding, 4 lone pairs
      createPresetAtom('H1', 'H', 200, 250, 1, 1, 0), // H: 1 bonding
      createPresetAtom('H2', 'H', 300, 250, 1, 1, 0), // H: 1 bonding
    ];
    const bonds = [
      createPresetBond('b1', 'O1', 'H1', 'single'),
      createPresetBond('b2', 'O1', 'H2', 'single'),
    ];
    return {
      id: 'molecule-H2O',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'H2O',
    };
  })(),
};

// Ammonia (NH3) - Trigonal pyramidal
const AMMONIA: PresetMolecule = {
  id: 'NH3',
  name: 'Ammonia',
  formula: 'NH₃',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Trigonal pyramidal geometry with 1 lone pair on nitrogen',
  molecule: (() => {
    const atoms = [
      createPresetAtom('N1', 'N', 250, 200, 5, 3, 2), // N: 3 bonding, 2 lone pairs
      createPresetAtom('H1', 'H', 200, 250, 1, 1, 0),
      createPresetAtom('H2', 'H', 250, 260, 1, 1, 0),
      createPresetAtom('H3', 'H', 300, 250, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'N1', 'H1', 'single'),
      createPresetBond('b2', 'N1', 'H2', 'single'),
      createPresetBond('b3', 'N1', 'H3', 'single'),
    ];
    return {
      id: 'molecule-NH3',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'NH3',
    };
  })(),
};

// Methane (CH4) - Tetrahedral
const METHANE: PresetMolecule = {
  id: 'CH4',
  name: 'Methane',
  formula: 'CH₄',
  difficulty: 'beginner',
  category: 'Hydrocarbons',
  description: 'Tetrahedral geometry, simplest hydrocarbon',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 250, 200, 4, 4, 0), // C: 4 bonding
      createPresetAtom('H1', 'H', 200, 170, 1, 1, 0),
      createPresetAtom('H2', 'H', 300, 170, 1, 1, 0),
      createPresetAtom('H3', 'H', 200, 250, 1, 1, 0),
      createPresetAtom('H4', 'H', 300, 250, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'H1', 'single'),
      createPresetBond('b2', 'C1', 'H2', 'single'),
      createPresetBond('b3', 'C1', 'H3', 'single'),
      createPresetBond('b4', 'C1', 'H4', 'single'),
    ];
    return {
      id: 'molecule-CH4',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'CH4',
    };
  })(),
};

// Hydrogen Chloride (HCl) - Linear
const HCL: PresetMolecule = {
  id: 'HCl',
  name: 'Hydrogen Chloride',
  formula: 'HCl',
  difficulty: 'beginner',
  category: 'Acids',
  description: 'Linear diatomic molecule, strong acid when dissolved',
  molecule: (() => {
    const atoms = [
      createPresetAtom('H1', 'H', 200, 200, 1, 1, 0),
      createPresetAtom('Cl1', 'Cl', 300, 200, 7, 1, 6), // Cl: 1 bonding, 6 lone pairs
    ];
    const bonds = [
      createPresetBond('b1', 'H1', 'Cl1', 'single'),
    ];
    return {
      id: 'molecule-HCl',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'HCl',
    };
  })(),
};

// ===== INTERMEDIATE MOLECULES =====

// Carbon Dioxide (CO2) - Linear with double bonds
const CO2: PresetMolecule = {
  id: 'CO2',
  name: 'Carbon Dioxide',
  formula: 'CO₂',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Linear geometry with two double bonds',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 250, 200, 4, 4, 0), // C: 4 bonding electrons (2 double bonds)
      createPresetAtom('O1', 'O', 150, 200, 6, 2, 4), // O: 2 bonding, 4 lone pairs
      createPresetAtom('O2', 'O', 350, 200, 6, 2, 4), // O: 2 bonding, 4 lone pairs
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'O1', 'double'),
      createPresetBond('b2', 'C1', 'O2', 'double'),
    ];
    return {
      id: 'molecule-CO2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'CO2',
    };
  })(),
};

// Oxygen (O2) - Diatomic with double bond
const O2: PresetMolecule = {
  id: 'O2',
  name: 'Oxygen Gas',
  formula: 'O₂',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Diatomic molecule with double bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('O1', 'O', 200, 200, 6, 2, 4), // O: 2 bonding, 4 lone pairs
      createPresetAtom('O2', 'O', 300, 200, 6, 2, 4), // O: 2 bonding, 4 lone pairs
    ];
    const bonds = [
      createPresetBond('b1', 'O1', 'O2', 'double'),
    ];
    return {
      id: 'molecule-O2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'O2',
    };
  })(),
};

// Nitrogen (N2) - Diatomic with triple bond
const N2: PresetMolecule = {
  id: 'N2',
  name: 'Nitrogen Gas',
  formula: 'N₂',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Diatomic molecule with triple bond (strongest bond)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('N1', 'N', 200, 200, 5, 3, 2), // N: 3 bonding, 2 lone pairs
      createPresetAtom('N2', 'N', 300, 200, 5, 3, 2), // N: 3 bonding, 2 lone pairs
    ];
    const bonds = [
      createPresetBond('b1', 'N1', 'N2', 'triple'),
    ];
    return {
      id: 'molecule-N2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'N2',
    };
  })(),
};

// Ethane (C2H6) - Single C-C bond
const ETHANE: PresetMolecule = {
  id: 'C2H6',
  name: 'Ethane',
  formula: 'C₂H₆',
  difficulty: 'intermediate',
  category: 'Hydrocarbons',
  description: 'Two carbon atoms with single bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 220, 200, 4, 4, 0),
      createPresetAtom('C2', 'C', 280, 200, 4, 4, 0),
      createPresetAtom('H1', 'H', 180, 170, 1, 1, 0),
      createPresetAtom('H2', 'H', 180, 230, 1, 1, 0),
      createPresetAtom('H3', 'H', 220, 250, 1, 1, 0),
      createPresetAtom('H4', 'H', 280, 150, 1, 1, 0),
      createPresetAtom('H5', 'H', 320, 170, 1, 1, 0),
      createPresetAtom('H6', 'H', 320, 230, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'C2', 'single'),
      createPresetBond('b2', 'C1', 'H1', 'single'),
      createPresetBond('b3', 'C1', 'H2', 'single'),
      createPresetBond('b4', 'C1', 'H3', 'single'),
      createPresetBond('b5', 'C2', 'H4', 'single'),
      createPresetBond('b6', 'C2', 'H5', 'single'),
      createPresetBond('b7', 'C2', 'H6', 'single'),
    ];
    return {
      id: 'molecule-C2H6',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'C2H6',
    };
  })(),
};

// Methanol (CH3OH) - Organic with hydroxyl group
const METHANOL: PresetMolecule = {
  id: 'CH3OH',
  name: 'Methanol',
  formula: 'CH₃OH',
  difficulty: 'intermediate',
  category: 'Organic',
  description: 'Simplest alcohol with hydroxyl (-OH) functional group',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 220, 200, 4, 4, 0),
      createPresetAtom('O1', 'O', 280, 200, 6, 2, 4),
      createPresetAtom('H1', 'H', 180, 170, 1, 1, 0),
      createPresetAtom('H2', 'H', 180, 230, 1, 1, 0),
      createPresetAtom('H3', 'H', 220, 250, 1, 1, 0),
      createPresetAtom('H4', 'H', 320, 200, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'O1', 'single'),
      createPresetBond('b2', 'O1', 'H4', 'single'),
      createPresetBond('b3', 'C1', 'H1', 'single'),
      createPresetBond('b4', 'C1', 'H2', 'single'),
      createPresetBond('b5', 'C1', 'H3', 'single'),
    ];
    return {
      id: 'molecule-CH3OH',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'CH3OH',
    };
  })(),
};

// ===== ADVANCED MOLECULES =====

// Sulfur Hexafluoride (SF6) - Expanded octet
const SF6: PresetMolecule = {
  id: 'SF6',
  name: 'Sulfur Hexafluoride',
  formula: 'SF₆',
  difficulty: 'advanced',
  category: 'Expanded Octet',
  description: 'Octahedral geometry - sulfur exceeds octet rule (12 electrons)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('S1', 'S', 250, 200, 6, 6, 0), // S: 6 bonding (expanded octet)
      createPresetAtom('F1', 'F', 200, 150, 7, 1, 6),
      createPresetAtom('F2', 'F', 300, 150, 7, 1, 6),
      createPresetAtom('F3', 'F', 200, 250, 7, 1, 6),
      createPresetAtom('F4', 'F', 300, 250, 7, 1, 6),
      createPresetAtom('F5', 'F', 150, 200, 7, 1, 6),
      createPresetAtom('F6', 'F', 350, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'S1', 'F1', 'single'),
      createPresetBond('b2', 'S1', 'F2', 'single'),
      createPresetBond('b3', 'S1', 'F3', 'single'),
      createPresetBond('b4', 'S1', 'F4', 'single'),
      createPresetBond('b5', 'S1', 'F5', 'single'),
      createPresetBond('b6', 'S1', 'F6', 'single'),
    ];
    return {
      id: 'molecule-SF6',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'SF6',
    };
  })(),
};

// Phosphorus Pentachloride (PCl5) - Expanded octet, trigonal bipyramidal
const PCL5: PresetMolecule = {
  id: 'PCl5',
  name: 'Phosphorus Pentachloride',
  formula: 'PCl₅',
  difficulty: 'advanced',
  category: 'Expanded Octet',
  description: 'Trigonal bipyramidal - phosphorus exceeds octet (10 electrons)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('P1', 'P', 250, 200, 5, 5, 0), // P: 5 bonding (expanded octet)
      createPresetAtom('Cl1', 'Cl', 250, 130, 7, 1, 6), // Axial
      createPresetAtom('Cl2', 'Cl', 250, 270, 7, 1, 6), // Axial
      createPresetAtom('Cl3', 'Cl', 180, 200, 7, 1, 6), // Equatorial
      createPresetAtom('Cl4', 'Cl', 320, 200, 7, 1, 6), // Equatorial
      createPresetAtom('Cl5', 'Cl', 250, 240, 7, 1, 6), // Equatorial
    ];
    const bonds = [
      createPresetBond('b1', 'P1', 'Cl1', 'single'),
      createPresetBond('b2', 'P1', 'Cl2', 'single'),
      createPresetBond('b3', 'P1', 'Cl3', 'single'),
      createPresetBond('b4', 'P1', 'Cl4', 'single'),
      createPresetBond('b5', 'P1', 'Cl5', 'single'),
    ];
    return {
      id: 'molecule-PCl5',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'PCl5',
    };
  })(),
};

// Ethene (C2H4) - Double bond between carbons
const ETHENE: PresetMolecule = {
  id: 'C2H4',
  name: 'Ethene (Ethylene)',
  formula: 'C₂H₄',
  difficulty: 'intermediate',
  category: 'Hydrocarbons',
  description: 'Carbon-carbon double bond, planar geometry',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 220, 200, 4, 4, 0),
      createPresetAtom('C2', 'C', 280, 200, 4, 4, 0),
      createPresetAtom('H1', 'H', 180, 170, 1, 1, 0),
      createPresetAtom('H2', 'H', 180, 230, 1, 1, 0),
      createPresetAtom('H3', 'H', 320, 170, 1, 1, 0),
      createPresetAtom('H4', 'H', 320, 230, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'C2', 'double'),
      createPresetBond('b2', 'C1', 'H1', 'single'),
      createPresetBond('b3', 'C1', 'H2', 'single'),
      createPresetBond('b4', 'C2', 'H3', 'single'),
      createPresetBond('b5', 'C2', 'H4', 'single'),
    ];
    return {
      id: 'molecule-C2H4',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'C2H4',
    };
  })(),
};

// Carbon Monoxide (CO) - Triple bond
const CO: PresetMolecule = {
  id: 'CO',
  name: 'Carbon Monoxide',
  formula: 'CO',
  difficulty: 'advanced',
  category: 'Simple',
  description: 'Triple bond with coordinate covalent character',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 200, 200, 4, 2, 2), // C: 2e to bond, 1 lone pair (dative bond from O)
      createPresetAtom('O1', 'O', 300, 200, 6, 4, 2), // O: 4e to bond (incl. dative pair), 1 lone pair
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'O1', 'triple'),
    ];
    return {
      id: 'molecule-CO',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'CO',
    };
  })(),
};

// Hydrogen Cyanide (HCN) - Triple bond with H
const HCN: PresetMolecule = {
  id: 'HCN',
  name: 'Hydrogen Cyanide',
  formula: 'HCN',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Linear molecule with C≡N triple bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('H1', 'H', 150, 200, 1, 1, 0),
      createPresetAtom('C1', 'C', 250, 200, 4, 4, 0), // C: 1 to H + 3 to N
      createPresetAtom('N1', 'N', 350, 200, 5, 3, 2), // N: 3 bonding, 1 lone pair
    ];
    const bonds = [
      createPresetBond('b1', 'H1', 'C1', 'single'),
      createPresetBond('b2', 'C1', 'N1', 'triple'),
    ];
    return {
      id: 'molecule-HCN',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'HCN',
    };
  })(),
};

// Formaldehyde (CH2O) - Carbonyl group
const FORMALDEHYDE: PresetMolecule = {
  id: 'CH2O',
  name: 'Formaldehyde',
  formula: 'CH₂O',
  difficulty: 'intermediate',
  category: 'Organic',
  description: 'Simplest aldehyde with C=O double bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 250, 200, 4, 4, 0), // C: 2 to O + 1 each to H
      createPresetAtom('O1', 'O', 250, 130, 6, 2, 4), // O: 2 bonding, 2 lone pairs
      createPresetAtom('H1', 'H', 180, 250, 1, 1, 0),
      createPresetAtom('H2', 'H', 320, 250, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'O1', 'double'),
      createPresetBond('b2', 'C1', 'H1', 'single'),
      createPresetBond('b3', 'C1', 'H2', 'single'),
    ];
    return {
      id: 'molecule-CH2O',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'CH2O',
    };
  })(),
};

// Ethyne / Acetylene (C2H2) - Triple bond between carbons
const ETHYNE: PresetMolecule = {
  id: 'C2H2',
  name: 'Ethyne (Acetylene)',
  formula: 'C₂H₂',
  difficulty: 'advanced',
  category: 'Hydrocarbons',
  description: 'Carbon-carbon triple bond, linear geometry',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 220, 200, 4, 4, 0), // C: 3 to C + 1 to H
      createPresetAtom('C2', 'C', 280, 200, 4, 4, 0),
      createPresetAtom('H1', 'H', 160, 200, 1, 1, 0),
      createPresetAtom('H2', 'H', 340, 200, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'C2', 'triple'),
      createPresetBond('b2', 'C1', 'H1', 'single'),
      createPresetBond('b3', 'C2', 'H2', 'single'),
    ];
    return {
      id: 'molecule-C2H2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'C2H2',
    };
  })(),
};

// Hydrogen Sulfide (H2S) - Bent like water
const H2S: PresetMolecule = {
  id: 'H2S',
  name: 'Hydrogen Sulfide',
  formula: 'H₂S',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Bent geometry like water, with sulfur central atom',
  molecule: (() => {
    const atoms = [
      createPresetAtom('S1', 'S', 250, 200, 6, 2, 4), // S: 2 bonding, 2 lone pairs
      createPresetAtom('H1', 'H', 200, 250, 1, 1, 0),
      createPresetAtom('H2', 'H', 300, 250, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'S1', 'H1', 'single'),
      createPresetBond('b2', 'S1', 'H2', 'single'),
    ];
    return {
      id: 'molecule-H2S',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'H2S',
    };
  })(),
};

// Fluorine gas (F2)
const F2: PresetMolecule = {
  id: 'F2',
  name: 'Fluorine Gas',
  formula: 'F₂',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Diatomic halogen with single bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('F1', 'F', 200, 200, 7, 1, 6),
      createPresetAtom('F2', 'F', 300, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'F1', 'F2', 'single'),
    ];
    return {
      id: 'molecule-F2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'F2',
    };
  })(),
};

// Chlorine gas (Cl2)
const CL2: PresetMolecule = {
  id: 'Cl2',
  name: 'Chlorine Gas',
  formula: 'Cl₂',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Diatomic halogen with single bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('Cl1', 'Cl', 200, 200, 7, 1, 6),
      createPresetAtom('Cl2', 'Cl', 300, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'Cl1', 'Cl2', 'single'),
    ];
    return {
      id: 'molecule-Cl2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'Cl2',
    };
  })(),
};

// Bromine gas (Br2)
const BR2: PresetMolecule = {
  id: 'Br2',
  name: 'Bromine Gas',
  formula: 'Br₂',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Diatomic halogen with single bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('Br1', 'Br', 200, 200, 7, 1, 6),
      createPresetAtom('Br2', 'Br', 300, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'Br1', 'Br2', 'single'),
    ];
    return {
      id: 'molecule-Br2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'Br2',
    };
  })(),
};

// Iodine gas (I2)
const I2: PresetMolecule = {
  id: 'I2',
  name: 'Iodine Gas',
  formula: 'I₂',
  difficulty: 'beginner',
  category: 'Simple',
  description: 'Diatomic halogen with single bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('I1', 'I', 200, 200, 7, 1, 6),
      createPresetAtom('I2', 'I', 300, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'I1', 'I2', 'single'),
    ];
    return {
      id: 'molecule-I2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'I2',
    };
  })(),
};

// Hydrogen Bromide (HBr)
const HBR: PresetMolecule = {
  id: 'HBr',
  name: 'Hydrogen Bromide',
  formula: 'HBr',
  difficulty: 'beginner',
  category: 'Acids',
  description: 'Linear diatomic molecule, strong acid',
  molecule: (() => {
    const atoms = [
      createPresetAtom('H1', 'H', 200, 200, 1, 1, 0),
      createPresetAtom('Br1', 'Br', 300, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'H1', 'Br1', 'single'),
    ];
    return {
      id: 'molecule-HBr',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'HBr',
    };
  })(),
};

// Sulfur Dioxide (SO2) - Bent with resonance
const SO2: PresetMolecule = {
  id: 'SO2',
  name: 'Sulfur Dioxide',
  formula: 'SO₂',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Bent molecule with one double bond and one single bond (resonance)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('S1', 'S', 250, 200, 6, 4, 2), // S: 2 to each O (double+single avg), 1 lone pair
      createPresetAtom('O1', 'O', 180, 260, 6, 2, 4), // double bond
      createPresetAtom('O2', 'O', 320, 260, 6, 1, 6), // single bond (resonance structure)
    ];
    const bonds = [
      createPresetBond('b1', 'S1', 'O1', 'double'),
      createPresetBond('b2', 'S1', 'O2', 'single'),
    ];
    return {
      id: 'molecule-SO2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'SO2',
    };
  })(),
};

// Phosphine (PH3) - Trigonal pyramidal
const PH3: PresetMolecule = {
  id: 'PH3',
  name: 'Phosphine',
  formula: 'PH₃',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Trigonal pyramidal like ammonia but with phosphorus',
  molecule: (() => {
    const atoms = [
      createPresetAtom('P1', 'P', 250, 200, 5, 3, 2), // P: 3 bonding, 1 lone pair
      createPresetAtom('H1', 'H', 200, 250, 1, 1, 0),
      createPresetAtom('H2', 'H', 250, 260, 1, 1, 0),
      createPresetAtom('H3', 'H', 300, 250, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'P1', 'H1', 'single'),
      createPresetBond('b2', 'P1', 'H2', 'single'),
      createPresetBond('b3', 'P1', 'H3', 'single'),
    ];
    return {
      id: 'molecule-PH3',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'PH3',
    };
  })(),
};

// Hydrogen Peroxide (H2O2)
const H2O2: PresetMolecule = {
  id: 'H2O2',
  name: 'Hydrogen Peroxide',
  formula: 'H₂O₂',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Bent chain with O-O single bond',
  molecule: (() => {
    const atoms = [
      createPresetAtom('O1', 'O', 220, 200, 6, 2, 4),
      createPresetAtom('O2', 'O', 280, 200, 6, 2, 4),
      createPresetAtom('H1', 'H', 180, 170, 1, 1, 0),
      createPresetAtom('H2', 'H', 320, 230, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'O1', 'O2', 'single'),
      createPresetBond('b2', 'O1', 'H1', 'single'),
      createPresetBond('b3', 'O2', 'H2', 'single'),
    ];
    return {
      id: 'molecule-H2O2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'H2O2',
    };
  })(),
};

// Nitric Oxide (NO)
const NO: PresetMolecule = {
  id: 'NO',
  name: 'Nitric Oxide',
  formula: 'NO',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Diatomic with 2.5 bond order (odd electron)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('N1', 'N', 200, 200, 5, 2, 3), // Has unpaired electron
      createPresetAtom('O1', 'O', 300, 200, 6, 2, 4),
    ];
    const bonds = [
      createPresetBond('b1', 'N1', 'O1', 'double'),
    ];
    return {
      id: 'molecule-NO',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'NO',
    };
  })(),
};

// Carbon Disulfide (CS2) - Linear like CO2
const CS2: PresetMolecule = {
  id: 'CS2',
  name: 'Carbon Disulfide',
  formula: 'CS₂',
  difficulty: 'advanced',
  category: 'Simple',
  description: 'Linear molecule with two C=S double bonds',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 250, 200, 4, 4, 0),
      createPresetAtom('S1', 'S', 150, 200, 6, 2, 4),
      createPresetAtom('S2', 'S', 350, 200, 6, 2, 4),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'S1', 'double'),
      createPresetBond('b2', 'C1', 'S2', 'double'),
    ];
    return {
      id: 'molecule-CS2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'CS2',
    };
  })(),
};

// Xenon Difluoride (XeF2) - Linear with 3 lone pairs on Xe
const XEF2: PresetMolecule = {
  id: 'XeF2',
  name: 'Xenon Difluoride',
  formula: 'XeF₂',
  difficulty: 'advanced',
  category: 'Expanded Octet',
  description: 'Linear geometry with 3 lone pairs on xenon (expanded octet)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('Xe1', 'Xe', 250, 200, 8, 2, 6), // Xe: 2 bonding, 3 lone pairs
      createPresetAtom('F1', 'F', 150, 200, 7, 1, 6),
      createPresetAtom('F2', 'F', 350, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'Xe1', 'F1', 'single'),
      createPresetBond('b2', 'Xe1', 'F2', 'single'),
    ];
    return {
      id: 'molecule-XeF2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'XeF2',
    };
  })(),
};

// Boron Trifluoride (BF3) - Electron deficient
const BF3: PresetMolecule = {
  id: 'BF3',
  name: 'Boron Trifluoride',
  formula: 'BF₃',
  difficulty: 'advanced',
  category: 'Expanded Octet',
  description: 'Trigonal planar - boron is electron deficient (only 6 electrons)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('B1', 'B', 250, 200, 3, 3, 0), // B: 3 bonding (electron deficient)
      createPresetAtom('F1', 'F', 200, 150, 7, 1, 6),
      createPresetAtom('F2', 'F', 300, 150, 7, 1, 6),
      createPresetAtom('F3', 'F', 250, 260, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'B1', 'F1', 'single'),
      createPresetBond('b2', 'B1', 'F2', 'single'),
      createPresetBond('b3', 'B1', 'F3', 'single'),
    ];
    return {
      id: 'molecule-BF3',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'BF3',
    };
  })(),
};

// Beryllium Chloride (BeCl2) - Electron deficient
const BECL2: PresetMolecule = {
  id: 'BeCl2',
  name: 'Beryllium Chloride',
  formula: 'BeCl₂',
  difficulty: 'advanced',
  category: 'Expanded Octet',
  description: 'Linear - beryllium is electron deficient (only 4 electrons)',
  molecule: (() => {
    const atoms = [
      createPresetAtom('Be1', 'Be', 250, 200, 2, 2, 0), // Be: 2 bonding (electron deficient)
      createPresetAtom('Cl1', 'Cl', 150, 200, 7, 1, 6),
      createPresetAtom('Cl2', 'Cl', 350, 200, 7, 1, 6),
    ];
    const bonds = [
      createPresetBond('b1', 'Be1', 'Cl1', 'single'),
      createPresetBond('b2', 'Be1', 'Cl2', 'single'),
    ];
    return {
      id: 'molecule-BeCl2',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'BeCl2',
    };
  })(),
};

// Silane (SiH4) - Tetrahedral like methane
const SIH4: PresetMolecule = {
  id: 'SiH4',
  name: 'Silane',
  formula: 'SiH₄',
  difficulty: 'intermediate',
  category: 'Simple',
  description: 'Tetrahedral geometry - silicon analog of methane',
  molecule: (() => {
    const atoms = [
      createPresetAtom('Si1', 'Si', 250, 200, 4, 4, 0),
      createPresetAtom('H1', 'H', 200, 170, 1, 1, 0),
      createPresetAtom('H2', 'H', 300, 170, 1, 1, 0),
      createPresetAtom('H3', 'H', 200, 250, 1, 1, 0),
      createPresetAtom('H4', 'H', 300, 250, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'Si1', 'H1', 'single'),
      createPresetBond('b2', 'Si1', 'H2', 'single'),
      createPresetBond('b3', 'Si1', 'H3', 'single'),
      createPresetBond('b4', 'Si1', 'H4', 'single'),
    ];
    return {
      id: 'molecule-SiH4',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'SiH4',
    };
  })(),
};

// Propane (C3H8)
const PROPANE: PresetMolecule = {
  id: 'C3H8',
  name: 'Propane',
  formula: 'C₃H₈',
  difficulty: 'advanced',
  category: 'Hydrocarbons',
  description: 'Three-carbon alkane chain',
  molecule: (() => {
    const atoms = [
      createPresetAtom('C1', 'C', 200, 200, 4, 4, 0),
      createPresetAtom('C2', 'C', 250, 200, 4, 4, 0),
      createPresetAtom('C3', 'C', 300, 200, 4, 4, 0),
      createPresetAtom('H1', 'H', 170, 170, 1, 1, 0),
      createPresetAtom('H2', 'H', 170, 230, 1, 1, 0),
      createPresetAtom('H3', 'H', 200, 250, 1, 1, 0),
      createPresetAtom('H4', 'H', 250, 150, 1, 1, 0),
      createPresetAtom('H5', 'H', 250, 250, 1, 1, 0),
      createPresetAtom('H6', 'H', 300, 150, 1, 1, 0),
      createPresetAtom('H7', 'H', 330, 170, 1, 1, 0),
      createPresetAtom('H8', 'H', 330, 230, 1, 1, 0),
    ];
    const bonds = [
      createPresetBond('b1', 'C1', 'C2', 'single'),
      createPresetBond('b2', 'C2', 'C3', 'single'),
      createPresetBond('b3', 'C1', 'H1', 'single'),
      createPresetBond('b4', 'C1', 'H2', 'single'),
      createPresetBond('b5', 'C1', 'H3', 'single'),
      createPresetBond('b6', 'C2', 'H4', 'single'),
      createPresetBond('b7', 'C2', 'H5', 'single'),
      createPresetBond('b8', 'C3', 'H6', 'single'),
      createPresetBond('b9', 'C3', 'H7', 'single'),
      createPresetBond('b10', 'C3', 'H8', 'single'),
    ];
    return {
      id: 'molecule-C3H8',
      atoms: linkBondsToAtoms(atoms, bonds),
      bonds,
      formula: 'C3H8',
    };
  })(),
};

// ===== EXPORT ALL PRESETS =====

export const PRESET_MOLECULES: PresetMolecule[] = [
  // Beginner
  H2,
  HF,
  HCL,
  HBR,
  WATER,
  AMMONIA,
  METHANE,
  H2S,
  F2,
  CL2,
  BR2,
  I2,

  // Intermediate
  CO2,
  O2,
  N2,
  NO,
  ETHANE,
  ETHENE,
  METHANOL,
  HCN,
  FORMALDEHYDE,
  SO2,
  PH3,
  H2O2,
  SIH4,

  // Advanced
  CO,
  SF6,
  PCL5,
  ETHYNE,
  CS2,
  XEF2,
  BF3,
  BECL2,
  PROPANE,
];

/**
 * Get presets by difficulty level
 */
export function getPresetsByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): PresetMolecule[] {
  return PRESET_MOLECULES.filter(p => p.difficulty === difficulty);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): PresetMolecule[] {
  return PRESET_MOLECULES.filter(p => p.category === category);
}

/**
 * Get preset by ID
 */
export function getPresetById(id: string): PresetMolecule | undefined {
  return PRESET_MOLECULES.find(p => p.id === id);
}
