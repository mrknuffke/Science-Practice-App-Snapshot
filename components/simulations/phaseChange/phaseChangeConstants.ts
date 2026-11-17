export interface SubstanceProperties {
  id: string;
  name: string;
  chemicalFormula: string;
  meltingPoint: number;       // in Kelvin
  boilingPoint: number;       // in Kelvin
  particleColor: string;
  particleSize: number;
  mass: number;
  attractionStrength: number;
  enthalpyFusion: number;
  enthalpyVaporization: number;
  sublimates?: boolean;       // true for CO₂: skip liquid phase
  // Molecule shape descriptor for rendering
  shape: 'sphere' | 'water' | 'diatomic' | 'co2';
  oxygenColor?: string;       // for water: central atom color
  hydrogenColor?: string;     // for water: small atom color
}

export const SUBSTANCES: Record<string, SubstanceProperties> = {
  water: {
    id: 'water',
    name: 'Water',
    chemicalFormula: 'H₂O',
    meltingPoint: 273,
    boilingPoint: 373,
    particleColor: '#0ea5e9',  // sky-500 for O atom
    particleSize: 8,
    mass: 18,
    attractionStrength: 100,
    enthalpyFusion: 250,
    enthalpyVaporization: 1100,
    shape: 'water',
    oxygenColor: '#ef4444',   // red for O
    hydrogenColor: '#e2e8f0', // near-white for H
  },
  neon: {
    id: 'neon',
    name: 'Neon',
    chemicalFormula: 'Ne',
    meltingPoint: 24,
    boilingPoint: 27,
    particleColor: '#f43f5e',
    particleSize: 6,
    mass: 20,
    attractionStrength: 15,
    enthalpyFusion: 29,
    enthalpyVaporization: 155,
    shape: 'sphere',
  },
  oxygen: {
    id: 'oxygen',
    name: 'Oxygen',
    chemicalFormula: 'O₂',
    meltingPoint: 54,
    boilingPoint: 90,
    particleColor: '#94a3b8',
    particleSize: 7,
    mass: 32,
    attractionStrength: 30,
    enthalpyFusion: 59,
    enthalpyVaporization: 408,
    shape: 'diatomic',
  },
  co2: {
    id: 'co2',
    name: 'Carbon Dioxide',
    chemicalFormula: 'CO₂',
    // CO₂ sublimes at ~194.5 K at 1 atm; we reuse meltingPoint as the sublimation point
    meltingPoint: 195,
    boilingPoint: 195, // not used: sublimation only
    particleColor: '#6b7280', // carbon gray
    particleSize: 8,
    mass: 44,
    attractionStrength: 25,
    enthalpyFusion: 0,          // not used: sublimation bypasses liquid
    enthalpyVaporization: 600,  // sublimation enthalpy
    sublimates: true,
    shape: 'co2',
    oxygenColor: '#ef4444',
  },
};

export const CANVAS_WIDTH = 400;
export const CANVAS_HEIGHT = 400;
export const PARTICLE_COUNT = 100;

export const THEME_COLORS = {
  solid: '#3b82f6',
  liquid: '#0ea5e9',
  gas: '#f59e0b',
  primary: '#8b5cf6',
  primaryDark: '#6d28d9',
};

export type PhaseState = 'solid' | 'liquid' | 'gas';
