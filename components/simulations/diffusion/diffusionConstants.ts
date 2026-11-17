import { ParticleType } from '../../../types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;
export const SIMULATION_TICK_MS = 16; // ~60 FPS update logic decoupled from render if we want, or tied to raf

// Y coordinate for the horizontal membrane
export const MEMBRANE_Y = CANVAS_HEIGHT / 2;
export const MEMBRANE_THICKNESS = 40;

// Protein sizes
export const PROTEIN_WIDTH = 60;
export const PROTEIN_HEIGHT = MEMBRANE_THICKNESS + 20;

export const PARTICLE_CONFIGS: Record<ParticleType, { name: string; radius: number, speed: number, color: string, canDiffuse: boolean }> = {
  oxygen: {
    name: "Oxygen (O2)",
    radius: 6,
    speed: 2.5,
    color: "#38bdf8", // Sky blue
    canDiffuse: true, // Simple diffusion
  },
  glucose: {
    name: "Glucose",
    radius: 12,
    speed: 1.0,
    color: "#f43f5e", // Rose pink
    canDiffuse: false, // Too large/polar
  },
  sodium: {
    name: "Sodium Ion (Na+)",
    radius: 8,
    speed: 3.5,
    color: "#fbbf24", // Amber
    canDiffuse: false, // Charged
  }
};

// Start counts
export const INITIAL_EXTRACELLULAR = {
  oxygen: 30,
  glucose: 15,
  sodium: 40
};

export const INITIAL_INTRACELLULAR = {
  oxygen: 5,
  glucose: 5,
  sodium: 5
};
