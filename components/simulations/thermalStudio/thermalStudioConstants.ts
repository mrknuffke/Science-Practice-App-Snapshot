/**
 * Thermal & Thermochemistry Studio: Constants and Datasets
 * Standard reference thermodynamic values for specific heats, latent heats, and enthalpy of solution.
 * Strict invariant: Zero em-dashes across all strings and comments.
 */

export interface MetalData {
  id: string;
  name: string;
  symbol: string;
  c: number; // J/g·°C
  color: string;
  density: number; // g/cm³
}

export const METALS: Record<string, MetalData> = {
  Al: { id: 'Al', name: 'Aluminum', symbol: 'Al', c: 0.897, color: '#94a3b8', density: 2.70 },
  Cu: { id: 'Cu', name: 'Copper', symbol: 'Cu', c: 0.385, color: '#d97706', density: 8.96 },
  Fe: { id: 'Fe', name: 'Iron', symbol: 'Fe', c: 0.449, color: '#64748b', density: 7.87 },
  Pb: { id: 'Pb', name: 'Lead', symbol: 'Pb', c: 0.129, color: '#475569', density: 11.34 },
  Au: { id: 'Au', name: 'Gold', symbol: 'Au', c: 0.129, color: '#eab308', density: 19.32 },
  UnkX: { id: 'UnkX', name: 'Unknown Metal X', symbol: 'X', c: 0.240, color: '#8b5cf6', density: 8.90 },
  UnkY: { id: 'UnkY', name: 'Unknown Metal Y', symbol: 'Y', c: 0.160, color: '#06b6d4', density: 10.50 }
};

export interface LiquidData {
  id: string;
  name: string;
  formula: string;
  c: number; // J/g·°C
  color: string;
}

export const LIQUIDS: Record<string, LiquidData> = {
  water: { id: 'water', name: 'Pure Water', formula: 'H2O', c: 4.184, color: '#38bdf8' },
  ethanol: { id: 'ethanol', name: 'Ethanol', formula: 'C2H5OH', c: 2.440, color: '#a855f7' },
  oil: { id: 'oil', name: 'Mineral Oil', formula: 'CnH2n+2', c: 1.670, color: '#f59e0b' }
};

export interface HeatingSubstanceData {
  id: string;
  name: string;
  formula: string;
  molarMass: number; // g/mol
  tMelt: number; // °C
  tBoil: number; // °C
  cSolid: number; // J/g·°C
  cLiquid: number; // J/g·°C
  cGas: number; // J/g·°C
  hFus: number; // J/g
  hVap: number; // J/g
  color: string;
}

export const HEATING_SUBSTANCES: Record<string, HeatingSubstanceData> = {
  water: {
    id: 'water',
    name: 'Water (Ice to Steam)',
    formula: 'H2O',
    molarMass: 18.02,
    tMelt: 0,
    tBoil: 100,
    cSolid: 2.09,
    cLiquid: 4.184,
    cGas: 2.01,
    hFus: 334,
    hVap: 2260,
    color: '#0284c7'
  },
  ethanol: {
    id: 'ethanol',
    name: 'Ethanol',
    formula: 'C2H5OH',
    molarMass: 46.07,
    tMelt: -114,
    tBoil: 78.4,
    cSolid: 0.97,
    cLiquid: 2.44,
    cGas: 1.42,
    hFus: 108,
    hVap: 838,
    color: '#7c3aed'
  },
  benzene: {
    id: 'benzene',
    name: 'Benzene',
    formula: 'C6H6',
    molarMass: 78.11,
    tMelt: 5.5,
    tBoil: 80.1,
    cSolid: 1.25,
    cLiquid: 1.74,
    cGas: 1.05,
    hFus: 127,
    hVap: 394,
    color: '#d97706'
  }
};

export interface SaltReactionData {
  id: string;
  name: string;
  formula: string;
  molarMass: number; // g/mol
  deltaH: number; // kJ/mol (positive = endothermic, negative = exothermic)
  description: string;
  type: 'endothermic' | 'exothermic';
  initialEthBars: number; // LOL integer blocks for thermal energy
  initialEchBars: number; // LOL integer blocks for chemical potential energy
}

export const SALTS: Record<string, SaltReactionData> = {
  nh4no3: {
    id: 'nh4no3',
    name: 'Ammonium Nitrate',
    formula: 'NH4NO3',
    molarMass: 80.04,
    deltaH: 25.7,
    description: 'Instant cold pack reaction: absorbs thermal energy from surrounding water as crystal lattice dissociates into aqueous ions.',
    type: 'endothermic',
    initialEthBars: 4,
    initialEchBars: 2
  },
  cacl2: {
    id: 'cacl2',
    name: 'Calcium Chloride',
    formula: 'CaCl2',
    molarMass: 110.98,
    deltaH: -81.3,
    description: 'Strongly exothermic dissolution: ion hydration shell formation releases intense thermal energy into surrounding solution.',
    type: 'exothermic',
    initialEthBars: 2,
    initialEchBars: 6
  },
  naoh: {
    id: 'naoh',
    name: 'Sodium Hydroxide',
    formula: 'NaOH',
    molarMass: 40.00,
    deltaH: -44.5,
    description: 'Caustic exothermic dissolution: releases heat as sodium and hydroxide ions separate and hydrate.',
    type: 'exothermic',
    initialEthBars: 2,
    initialEchBars: 5
  },
  kno3: {
    id: 'kno3',
    name: 'Potassium Nitrate',
    formula: 'KNO3',
    molarMass: 101.10,
    deltaH: 34.9,
    description: 'Endothermic dissolution: strong crystal lattice demands heat input from solvent, causing temperature drop.',
    type: 'endothermic',
    initialEthBars: 4,
    initialEchBars: 1
  }
};

export const THERMAL_SOCRATIC_TIPS = [
  "Remember the distinction between temperature and thermal energy: temperature is average kinetic energy per particle, while thermal energy depends on both temperature and total mass.",
  "On a heating curve plateau, why does temperature remain constant even when heat is continuously pumped in? The energy is converting potential energy by overcoming intermolecular bonds rather than increasing molecular speed.",
  "In coffee-cup calorimetry, the calorimeter is treated as an isolated system: q_reaction + q_solution = 0, meaning q_reaction = -q_solution.",
  "Look at the LOL energy bar diagram: chemical potential energy (E_ch) and thermal energy (E_th) must balance before and after reaction, with heat flow (q) crossing the system boundary.",
  "Notice why water has such a long vaporization plateau compared to melting: breaking all hydrogen bonds in vaporization requires over 6 times more energy than loosening them in melting."
];
