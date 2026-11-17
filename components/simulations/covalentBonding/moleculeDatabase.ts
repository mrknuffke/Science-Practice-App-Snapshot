/**
 * Molecule Database for Covalent Bonding Simulation
 * Contains common molecule names and atomic data for instant recognition
 */

export interface MoleculeInfo {
  common: string;
  iupac: string;
}

/**
 * Common molecules database for instant recognition
 * Key is the molecular formula in Hill notation
 */
export const COMMON_MOLECULES: Record<string, MoleculeInfo> = {
  // Diatomic molecules
  H2: { common: 'Hydrogen', iupac: 'Dihydrogen' },
  O2: { common: 'Oxygen', iupac: 'Dioxygen' },
  N2: { common: 'Nitrogen', iupac: 'Dinitrogen' },
  F2: { common: 'Fluorine', iupac: 'Difluorine' },
  Cl2: { common: 'Chlorine', iupac: 'Dichlorine' },

  // Simple hydrides
  H2O: { common: 'Water', iupac: 'Dihydrogen Monoxide' },
  NH3: { common: 'Ammonia', iupac: 'Ammonia' },
  CH4: { common: 'Methane', iupac: 'Methane' },
  H2S: { common: 'Hydrogen Sulfide', iupac: 'Dihydrogen Sulfide' },
  PH3: { common: 'Phosphine', iupac: 'Phosphine' },

  // Hydrogen halides
  HF: { common: 'Hydrofluoric Acid', iupac: 'Hydrogen Fluoride' },
  HCl: { common: 'Hydrochloric Acid', iupac: 'Hydrogen Chloride' },
  HBr: { common: 'Hydrobromic Acid', iupac: 'Hydrogen Bromide' },
  HI: { common: 'Hydroiodic Acid', iupac: 'Hydrogen Iodide' },

  // Carbon oxides
  CO: { common: 'Carbon Monoxide', iupac: 'Carbon Monoxide' },
  CO2: { common: 'Carbon Dioxide', iupac: 'Carbon Dioxide' },

  // Nitrogen oxides
  NO: { common: 'Nitric Oxide', iupac: 'Nitrogen Monoxide' },
  NO2: { common: 'Nitrogen Dioxide', iupac: 'Nitrogen Dioxide' },
  N2O: { common: 'Nitrous Oxide (Laughing Gas)', iupac: 'Dinitrogen Monoxide' },
  N2O4: { common: 'Dinitrogen Tetroxide', iupac: 'Dinitrogen Tetroxide' },

  // Sulfur oxides
  SO2: { common: 'Sulfur Dioxide', iupac: 'Sulfur Dioxide' },
  SO3: { common: 'Sulfur Trioxide', iupac: 'Sulfur Trioxide' },

  // Simple hydrocarbons
  C2H2: { common: 'Ethyne (Acetylene)', iupac: 'Ethyne' },
  C2H4: { common: 'Ethene (Ethylene)', iupac: 'Ethene' },
  C2H6: { common: 'Ethane', iupac: 'Ethane' },
  C3H8: { common: 'Propane', iupac: 'Propane' },
  C4H10: { common: 'Butane', iupac: 'Butane' },
  C6H6: { common: 'Benzene', iupac: 'Benzene' },

  // Organic compounds
  CH2O: { common: 'Formaldehyde', iupac: 'Methanal' },
  CH4O: { common: 'Methanol', iupac: 'Methanol' },
  CH3OH: { common: 'Methanol', iupac: 'Methanol' },
  C2H6O: { common: 'Ethanol', iupac: 'Ethanol' },
  C2H5OH: { common: 'Ethanol', iupac: 'Ethanol' },
  C2H4O2: { common: 'Acetic Acid', iupac: 'Ethanoic Acid' },
  CH3COOH: { common: 'Acetic Acid', iupac: 'Ethanoic Acid' },

  // Chlorides
  PCl3: { common: 'Phosphorus Trichloride', iupac: 'Phosphorus Trichloride' },
  PCl5: { common: 'Phosphorus Pentachloride', iupac: 'Phosphorus Pentachloride' },

  // Sulfur hexafluoride (expanded octet)
  SF6: { common: 'Sulfur Hexafluoride', iupac: 'Sulfur Hexafluoride' },
  SF4: { common: 'Sulfur Tetrafluoride', iupac: 'Sulfur Tetrafluoride' },

  // Xenon compounds (noble gas compounds)
  XeF2: { common: 'Xenon Difluoride', iupac: 'Xenon Difluoride' },
  XeF4: { common: 'Xenon Tetrafluoride', iupac: 'Xenon Tetrafluoride' },

  // Other common molecules
  HCN: { common: 'Hydrogen Cyanide', iupac: 'Hydrogen Cyanide' },
  CS2: { common: 'Carbon Disulfide', iupac: 'Carbon Disulfide' },
};

/**
 * Atomic masses for molar mass calculations (in g/mol)
 * Values from NIST atomic weights
 */
export const ATOMIC_MASSES: Record<string, number> = {
  H: 1.008,
  Be: 9.012,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Si: 28.085,
  S: 32.06,
  P: 30.974,
  Cl: 35.45,
  Br: 79.904,
  I: 126.90,
  Xe: 131.29,
  // Add more as needed
};

/**
 * Valence electron counts for common elements
 */
export const VALENCE_ELECTRONS: Record<string, number> = {
  H: 1,
  Be: 2,
  B: 3,
  C: 4,
  N: 5,
  O: 6,
  F: 7,
  Si: 4,
  S: 6,
  P: 5,
  Cl: 7,
  Br: 7,
  I: 7,
  Xe: 8,
};

/**
 * Target electron counts (octet rule)
 * H wants 2, most others want 8
 */
export const TARGET_ELECTRONS: Record<string, number> = {
  H: 2,
  Be: 4, // Beryllium is electron deficient
  B: 6,  // Boron is electron deficient
  C: 8,
  N: 8,
  O: 8,
  F: 8,
  Si: 8, // Can expand in AP
  S: 8, // Can expand to 10 or 12 in AP
  P: 8, // Can expand to 10 in AP
  Cl: 8,
  Br: 8,
  I: 8,
  Xe: 8, // Can expand in AP
};

/**
 * CPK coloring standard for atoms (for 3D visualization)
 */
export const ATOM_COLORS: Record<string, string> = {
  H: '#FFFFFF',  // White
  Be: '#C2FF00', // Yellow-green
  B: '#FFB5B5',  // Pink
  C: '#909090',  // Gray
  N: '#3050F8',  // Blue
  O: '#FF0D0D',  // Red
  F: '#90E050',  // Green
  Si: '#F0C8A0', // Tan/beige
  S: '#FFFF30',  // Yellow
  P: '#FF8000',  // Orange
  Cl: '#1FF01F', // Light Green
  Br: '#A62929', // Dark Red
  I: '#940094',  // Purple
  Xe: '#429EB0', // Cyan
};

/**
 * Electronegativity values (Pauling scale) for polarity calculations
 */
export const ELECTRONEGATIVITY: Record<string, number> = {
  H: 2.20,
  Be: 1.57,
  B: 2.04,
  C: 2.55,
  N: 3.04,
  O: 3.44,
  F: 3.98,
  Si: 1.90,
  S: 2.58,
  P: 2.19,
  Cl: 3.16,
  Br: 2.96,
  I: 2.66,
  Xe: 2.60,
};
