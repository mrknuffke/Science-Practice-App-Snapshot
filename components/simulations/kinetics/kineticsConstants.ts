import { ReactantType } from '../../../types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const SIM_TICK_MS = 16;

export const BASE_ACTIVATION_ENERGY = {
  chemistry: 35, // High barrier for generic A + B
  biology: 15    // Lower barrier generally or specifically for bio
};

export const CATALYST_REDUCTION = 25; // How much lower Ea is if Catalyst is present in chemistry mode
export const BIO_ENZYME_EA = 10;      // E+S activation energy

// Temperature thresholds for enzyme biology mode (0 to 2 scale)
export const ENZYME_DENATURATION_TEMP = 1.7;  // Above this: enzyme denatures
export const ENZYME_COLD_THRESHOLD = 0.2;      // Below this: reactions suppressed

export const REACTANT_PROPERTIES: Record<ReactantType, { name: string; radius: number, mass: number, colors: { chemistry: string, biology: string } }> = {
  A: {
    name: "Reactant A",
    radius: 10,
    mass: 1,
    colors: { chemistry: '#f43f5e', biology: '#f43f5e' } // Rose
  },
  B: {
    name: "Reactant B",
    radius: 10,
    mass: 1,
    colors: { chemistry: '#3b82f6', biology: '#3b82f6' } // Blue
  },
  Product: {
    name: "Product C",
    radius: 14, // Slightly larger as they fused
    mass: 2,
    colors: { chemistry: '#8b5cf6', biology: '#34d399' } // Purple for chem (red+blue), Green for bio
  },
  // Specific to Biology
  Enzyme: {
    name: "Enzyme",
    radius: 20, // Huge
    mass: 5,
    colors: { chemistry: '#d946ef', biology: '#f59e0b' } // Amber / Orange
  },
  Enzyme_Complex: {
    name: "Enzyme-Substrate Complex",
    radius: 22,
    mass: 6,
    colors: { chemistry: '#d946ef', biology: '#fbbf24' }
  }
};

// Aliasing for Bio Mode:
// Substrate = A
// Enzyme = Enzyme
// Product = Product
