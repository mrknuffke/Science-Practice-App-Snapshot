/**
 * Ionic Bonding Database
 * Contains element data, ion properties, and common ionic compounds
 */

export interface ElementInfo {
  symbol: string;
  name: string;
  atomicNumber: number;
  atomicMass: number;
  valenceElectrons: number;
  group: number;
  period: number;
  type: 'metal' | 'nonmetal' | 'polyatomic';
  commonOxidationStates: number[]; // e.g., [+1] for Na, [+2, +3] for Fe
  color: string; // CPK color
  electronegativity?: number;
}

export interface IonicCompoundInfo {
  formula: string;
  name: string;
  type: 'binary' | 'ternary';
  solubility: 'soluble' | 'insoluble' | 'slightly soluble';
  color?: string; // For colored compounds
}

/**
 * Metals (form cations)
 */
export const METALS: Record<string, ElementInfo> = {
  // Alkali metals (Group 1)
  Li: {
    symbol: 'Li',
    name: 'Lithium',
    atomicNumber: 3,
    atomicMass: 6.94,
    valenceElectrons: 1,
    group: 1,
    period: 2,
    type: 'metal',
    commonOxidationStates: [+1],
    color: '#CC80FF',
    electronegativity: 0.98,
  },
  Na: {
    symbol: 'Na',
    name: 'Sodium',
    atomicNumber: 11,
    atomicMass: 22.99,
    valenceElectrons: 1,
    group: 1,
    period: 3,
    type: 'metal',
    commonOxidationStates: [+1],
    color: '#AB5CF2',
    electronegativity: 0.93,
  },
  K: {
    symbol: 'K',
    name: 'Potassium',
    atomicNumber: 19,
    atomicMass: 39.10,
    valenceElectrons: 1,
    group: 1,
    period: 4,
    type: 'metal',
    commonOxidationStates: [+1],
    color: '#8F40D4',
    electronegativity: 0.82,
  },

  // Alkaline earth metals (Group 2)
  Mg: {
    symbol: 'Mg',
    name: 'Magnesium',
    atomicNumber: 12,
    atomicMass: 24.31,
    valenceElectrons: 2,
    group: 2,
    period: 3,
    type: 'metal',
    commonOxidationStates: [+2],
    color: '#8AFF00',
    electronegativity: 1.31,
  },
  Ca: {
    symbol: 'Ca',
    name: 'Calcium',
    atomicNumber: 20,
    atomicMass: 40.08,
    valenceElectrons: 2,
    group: 2,
    period: 4,
    type: 'metal',
    commonOxidationStates: [+2],
    color: '#3DFF00',
    electronegativity: 1.00,
  },
  Ba: {
    symbol: 'Ba',
    name: 'Barium',
    atomicNumber: 56,
    atomicMass: 137.33,
    valenceElectrons: 2,
    group: 2,
    period: 6,
    type: 'metal',
    commonOxidationStates: [+2],
    color: '#00C900',
    electronegativity: 0.89,
  },

  // Group 13
  Al: {
    symbol: 'Al',
    name: 'Aluminum',
    atomicNumber: 13,
    atomicMass: 26.98,
    valenceElectrons: 3,
    group: 13,
    period: 3,
    type: 'metal',
    commonOxidationStates: [+3],
    color: '#BFA6A6',
    electronegativity: 1.61,
  },

  // Transition metals with variable oxidation states
  Fe: {
    symbol: 'Fe',
    name: 'Iron',
    atomicNumber: 26,
    atomicMass: 55.85,
    valenceElectrons: 2, // 4s electrons (simplified)
    group: 8,
    period: 4,
    type: 'metal',
    commonOxidationStates: [+2, +3],
    color: '#E06633',
    electronegativity: 1.83,
  },
  Cu: {
    symbol: 'Cu',
    name: 'Copper',
    atomicNumber: 29,
    atomicMass: 63.55,
    valenceElectrons: 1, // 4s electron (simplified)
    group: 11,
    period: 4,
    type: 'metal',
    commonOxidationStates: [+1, +2],
    color: '#C88033',
    electronegativity: 1.90,
  },
  Zn: {
    symbol: 'Zn',
    name: 'Zinc',
    atomicNumber: 30,
    atomicMass: 65.38,
    valenceElectrons: 2,
    group: 12,
    period: 4,
    type: 'metal',
    commonOxidationStates: [+2],
    color: '#7D80B0',
    electronegativity: 1.65,
  },
  Ag: {
    symbol: 'Ag',
    name: 'Silver',
    atomicNumber: 47,
    atomicMass: 107.87,
    valenceElectrons: 1,
    group: 11,
    period: 5,
    type: 'metal',
    commonOxidationStates: [+1],
    color: '#C0C0C0',
    electronegativity: 1.93,
  },
  Pb: {
    symbol: 'Pb',
    name: 'Lead',
    atomicNumber: 82,
    atomicMass: 207.2,
    valenceElectrons: 2,
    group: 14,
    period: 6,
    type: 'metal',
    commonOxidationStates: [+2, +4],
    color: '#575961',
    electronegativity: 2.33,
  },
};

/**
 * Non-metals (form anions)
 */
export const NONMETALS: Record<string, ElementInfo> = {
  // Halogens (Group 17)
  F: {
    symbol: 'F',
    name: 'Fluorine',
    atomicNumber: 9,
    atomicMass: 19.00,
    valenceElectrons: 7,
    group: 17,
    period: 2,
    type: 'nonmetal',
    commonOxidationStates: [-1],
    color: '#90E050',
    electronegativity: 3.98,
  },
  Cl: {
    symbol: 'Cl',
    name: 'Chlorine',
    atomicNumber: 17,
    atomicMass: 35.45,
    valenceElectrons: 7,
    group: 17,
    period: 3,
    type: 'nonmetal',
    commonOxidationStates: [-1],
    color: '#1FF01F',
    electronegativity: 3.16,
  },
  Br: {
    symbol: 'Br',
    name: 'Bromine',
    atomicNumber: 35,
    atomicMass: 79.90,
    valenceElectrons: 7,
    group: 17,
    period: 4,
    type: 'nonmetal',
    commonOxidationStates: [-1],
    color: '#A62929',
    electronegativity: 2.96,
  },
  I: {
    symbol: 'I',
    name: 'Iodine',
    atomicNumber: 53,
    atomicMass: 126.90,
    valenceElectrons: 7,
    group: 17,
    period: 5,
    type: 'nonmetal',
    commonOxidationStates: [-1],
    color: '#940094',
    electronegativity: 2.66,
  },

  // Chalcogens (Group 16)
  O: {
    symbol: 'O',
    name: 'Oxygen',
    atomicNumber: 8,
    atomicMass: 16.00,
    valenceElectrons: 6,
    group: 16,
    period: 2,
    type: 'nonmetal',
    commonOxidationStates: [-2],
    color: '#FF0D0D',
    electronegativity: 3.44,
  },
  S: {
    symbol: 'S',
    name: 'Sulfur',
    atomicNumber: 16,
    atomicMass: 32.07,
    valenceElectrons: 6,
    group: 16,
    period: 3,
    type: 'nonmetal',
    commonOxidationStates: [-2],
    color: '#FFFF30',
    electronegativity: 2.58,
  },

  // Pnictogens (Group 15)
  N: {
    symbol: 'N',
    name: 'Nitrogen',
    atomicNumber: 7,
    atomicMass: 14.01,
    valenceElectrons: 5,
    group: 15,
    period: 2,
    type: 'nonmetal',
    commonOxidationStates: [-3],
    color: '#3050F8',
    electronegativity: 3.04,
  },
  P: {
    symbol: 'P',
    name: 'Phosphorus',
    atomicNumber: 15,
    atomicMass: 30.97,
    valenceElectrons: 5,
    group: 15,
    period: 3,
    type: 'nonmetal',
    commonOxidationStates: [-3],
    color: '#FF8000',
    electronegativity: 2.19,
  },
};

/**
 * Polyatomic ions (treated as single units)
 */
export interface PolyatomicIon {
  formula: string;
  name: string;
  charge: number;
  atoms: Array<{ element: string; count: number }>;
  color: string; // Display color
}

export const POLYATOMIC_IONS: Record<string, PolyatomicIon> = {
  // Negative polyatomic ions
  NO3: {
    formula: 'NO₃⁻',
    name: 'Nitrate',
    charge: -1,
    atoms: [
      { element: 'N', count: 1 },
      { element: 'O', count: 3 },
    ],
    color: '#60A5FA',
  },
  SO4: {
    formula: 'SO₄²⁻',
    name: 'Sulfate',
    charge: -2,
    atoms: [
      { element: 'S', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#FBBF24',
  },
  CO3: {
    formula: 'CO₃²⁻',
    name: 'Carbonate',
    charge: -2,
    atoms: [
      { element: 'C', count: 1 },
      { element: 'O', count: 3 },
    ],
    color: '#A78BFA',
  },
  PO4: {
    formula: 'PO₄³⁻',
    name: 'Phosphate',
    charge: -3,
    atoms: [
      { element: 'P', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#F97316',
  },
  OH: {
    formula: 'OH⁻',
    name: 'Hydroxide',
    charge: -1,
    atoms: [
      { element: 'O', count: 1 },
      { element: 'H', count: 1 },
    ],
    color: '#34D399',
  },
  ClO3: {
    formula: 'ClO₃⁻',
    name: 'Chlorate',
    charge: -1,
    atoms: [
      { element: 'Cl', count: 1 },
      { element: 'O', count: 3 },
    ],
    color: '#6EE7B7',
  },
  MnO4: {
    formula: 'MnO₄⁻',
    name: 'Permanganate',
    charge: -1,
    atoms: [
      { element: 'Mn', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#A855F7',
  },
  C2H3O2: {
    formula: 'C₂H₃O₂⁻',
    name: 'Acetate',
    charge: -1,
    atoms: [
      { element: 'C', count: 2 },
      { element: 'H', count: 3 },
      { element: 'O', count: 2 },
    ],
    color: '#94A3B8',
  },

  NO2: {
    formula: 'NO₂⁻',
    name: 'Nitrite',
    charge: -1,
    atoms: [
      { element: 'N', count: 1 },
      { element: 'O', count: 2 },
    ],
    color: '#5EEAD4',
  },
  SO3: {
    formula: 'SO₃²⁻',
    name: 'Sulfite',
    charge: -2,
    atoms: [
      { element: 'S', count: 1 },
      { element: 'O', count: 3 },
    ],
    color: '#FDE68A',
  },
  ClO4: {
    formula: 'ClO₄⁻',
    name: 'Perchlorate',
    charge: -1,
    atoms: [
      { element: 'Cl', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#6EE7B7',
  },
  CN: {
    formula: 'CN⁻',
    name: 'Cyanide',
    charge: -1,
    atoms: [
      { element: 'C', count: 1 },
      { element: 'N', count: 1 },
    ],
    color: '#D1D5DB',
  },
  SCN: {
    formula: 'SCN⁻',
    name: 'Thiocyanate',
    charge: -1,
    atoms: [
      { element: 'S', count: 1 },
      { element: 'C', count: 1 },
      { element: 'N', count: 1 },
    ],
    color: '#FCA5A5',
  },
  CrO4: {
    formula: 'CrO₄²⁻',
    name: 'Chromate',
    charge: -2,
    atoms: [
      { element: 'Cr', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#FCD34D',
  },
  Cr2O7: {
    formula: 'Cr₂O₇²⁻',
    name: 'Dichromate',
    charge: -2,
    atoms: [
      { element: 'Cr', count: 2 },
      { element: 'O', count: 7 },
    ],
    color: '#FB923C',
  },
  S2O3: {
    formula: 'S₂O₃²⁻',
    name: 'Thiosulfate',
    charge: -2,
    atoms: [
      { element: 'S', count: 2 },
      { element: 'O', count: 3 },
    ],
    color: '#E9D5FF',
  },
  HCO3: {
    formula: 'HCO₃⁻',
    name: 'Bicarbonate',
    charge: -1,
    atoms: [
      { element: 'H', count: 1 },
      { element: 'C', count: 1 },
      { element: 'O', count: 3 },
    ],
    color: '#BAE6FD',
  },
  HSO4: {
    formula: 'HSO₄⁻',
    name: 'Bisulfate',
    charge: -1,
    atoms: [
      { element: 'H', count: 1 },
      { element: 'S', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#FDE68A',
  },
  H2PO4: {
    formula: 'H₂PO₄⁻',
    name: 'Dihydrogen Phosphate',
    charge: -1,
    atoms: [
      { element: 'H', count: 2 },
      { element: 'P', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#FDA4AF',
  },
  HPO4: {
    formula: 'HPO₄²⁻',
    name: 'Hydrogen Phosphate',
    charge: -2,
    atoms: [
      { element: 'H', count: 1 },
      { element: 'P', count: 1 },
      { element: 'O', count: 4 },
    ],
    color: '#FCA5A5',
  },

  // Positive polyatomic ion
  NH4: {
    formula: 'NH₄⁺',
    name: 'Ammonium',
    charge: +1,
    atoms: [
      { element: 'N', count: 1 },
      { element: 'H', count: 4 },
    ],
    color: '#818CF8',
  },
};

/**
 * Common ionic compounds for instant recognition
 */
export const COMMON_IONIC_COMPOUNDS: Record<string, IonicCompoundInfo> = {
  // Binary compounds
  NaCl: { formula: 'NaCl', name: 'Sodium Chloride (Table Salt)', type: 'binary', solubility: 'soluble' },
  KCl: { formula: 'KCl', name: 'Potassium Chloride', type: 'binary', solubility: 'soluble' },
  MgO: { formula: 'MgO', name: 'Magnesium Oxide', type: 'binary', solubility: 'slightly soluble' },
  CaO: { formula: 'CaO', name: 'Calcium Oxide (Quicklime)', type: 'binary', solubility: 'slightly soluble' },
  Al2O3: { formula: 'Al₂O₃', name: 'Aluminum Oxide', type: 'binary', solubility: 'insoluble' },
  MgCl2: { formula: 'MgCl₂', name: 'Magnesium Chloride', type: 'binary', solubility: 'soluble' },
  CaCl2: { formula: 'CaCl₂', name: 'Calcium Chloride', type: 'binary', solubility: 'soluble' },
  Na2O: { formula: 'Na₂O', name: 'Sodium Oxide', type: 'binary', solubility: 'soluble' },
  K2O: { formula: 'K₂O', name: 'Potassium Oxide', type: 'binary', solubility: 'soluble' },
  FeO: { formula: 'FeO', name: 'Iron(II) Oxide', type: 'binary', solubility: 'insoluble' },
  Fe2O3: { formula: 'Fe₂O₃', name: 'Iron(III) Oxide (Rust)', type: 'binary', solubility: 'insoluble', color: 'rust-red' },
  CuO: { formula: 'CuO', name: 'Copper(II) Oxide', type: 'binary', solubility: 'insoluble', color: 'black' },
  Cu2O: { formula: 'Cu₂O', name: 'Copper(I) Oxide', type: 'binary', solubility: 'insoluble', color: 'red' },
  AgCl: { formula: 'AgCl', name: 'Silver Chloride', type: 'binary', solubility: 'insoluble', color: 'white' },
  PbO: { formula: 'PbO', name: 'Lead(II) Oxide', type: 'binary', solubility: 'insoluble', color: 'yellow/red' },
  PbO2: { formula: 'PbO₂', name: 'Lead(IV) Oxide', type: 'binary', solubility: 'insoluble', color: 'brown' },

  // Ternary compounds (with polyatomic ions)
  NaNO3: { formula: 'NaNO₃', name: 'Sodium Nitrate', type: 'ternary', solubility: 'soluble' },
  KNO3: { formula: 'KNO₃', name: 'Potassium Nitrate (Saltpeter)', type: 'ternary', solubility: 'soluble' },
  Na2SO4: { formula: 'Na₂SO₄', name: 'Sodium Sulfate', type: 'ternary', solubility: 'soluble' },
  CaSO4: { formula: 'CaSO₄', name: 'Calcium Sulfate (Gypsum)', type: 'ternary', solubility: 'slightly soluble' },
  BaSO4: { formula: 'BaSO₄', name: 'Barium Sulfate', type: 'ternary', solubility: 'insoluble', color: 'white' },
  Na2CO3: { formula: 'Na₂CO₃', name: 'Sodium Carbonate (Washing Soda)', type: 'ternary', solubility: 'soluble' },
  CaCO3: { formula: 'CaCO₃', name: 'Calcium Carbonate (Limestone)', type: 'ternary', solubility: 'insoluble' },
  NH4Cl: { formula: 'NH₄Cl', name: 'Ammonium Chloride', type: 'ternary', solubility: 'soluble' },
  NH4NO3: { formula: 'NH₄NO₃', name: 'Ammonium Nitrate', type: 'ternary', solubility: 'soluble' },
  Ca3P2O8: { formula: 'Ca₃(PO₄)₂', name: 'Calcium Phosphate', type: 'ternary', solubility: 'insoluble' },
  NaOH: { formula: 'NaOH', name: 'Sodium Hydroxide (Lye)', type: 'ternary', solubility: 'soluble' },
  KOH: { formula: 'KOH', name: 'Potassium Hydroxide', type: 'ternary', solubility: 'soluble' },
  Ca_OH_2: { formula: 'Ca(OH)₂', name: 'Calcium Hydroxide (Slaked Lime)', type: 'ternary', solubility: 'slightly soluble' },
};

/**
 * Ionic radii (in picometers) for lattice visualization
 */
export const IONIC_RADII: Record<string, number> = {
  // Cations
  'Li+': 76,
  'Na+': 102,
  'K+': 138,
  'Mg2+': 72,
  'Ca2+': 100,
  'Ba2+': 135,
  'Al3+': 54,
  'Fe2+': 78,
  'Fe3+': 65,
  'Cu+': 77,
  'Cu2+': 73,
  'Zn2+': 74,
  'Ag+': 115,
  'Pb2+': 119,
  'Pb4+': 78,

  // Anions
  'F-': 133,
  'Cl-': 181,
  'Br-': 196,
  'I-': 220,
  'O2-': 140,
  'S2-': 184,
  'N3-': 171,
  'P3-': 212,
};

/**
 * Lattice energy qualitative values (for educational purposes)
 * Higher = stronger ionic bond = higher melting point
 */
export const LATTICE_ENERGY_QUALITATIVE: Record<string, 'Very Strong' | 'Strong' | 'Moderate' | 'Weak'> = {
  MgO: 'Very Strong',
  CaO: 'Very Strong',
  Al2O3: 'Very Strong',
  NaCl: 'Strong',
  KCl: 'Strong',
  MgCl2: 'Strong',
  CaCl2: 'Strong',
  NaBr: 'Moderate',
  KBr: 'Moderate',
  NaI: 'Moderate',
};
