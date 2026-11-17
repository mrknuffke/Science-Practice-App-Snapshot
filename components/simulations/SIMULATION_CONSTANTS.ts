/**
 * Simulation Constants
 * Centralized configuration for all science simulations
 */

// Canvas and SVG dimensions
export const CANVAS = {
  // Covalent Bonding Canvas
  COVALENT: {
    WIDTH: 800,
    HEIGHT: 520,
    CENTER_X: 400,
    CENTER_Y: 260,
    ATOM_RADIUS: 100,
  },
  // Ionic Bonding Canvas
  IONIC: {
    WIDTH: 800,
    HEIGHT: 400,
    CATION_X: 150,
    CATION_Y: 200,
    ANION_X: 350,
    ANION_Y: 200,
  },
} as const;

// Periodic Table Configuration
export const PERIODIC_TABLE = {
  GRID: {
    COLUMNS: 18,
    ROWS: 7,
    MIN_CELL_WIDTH: 40,
    MIN_CELL_HEIGHT: 50,
    MAX_CELL_HEIGHT: 70,
  },
  TEMPERATURE: {
    MIN: 0,
    MAX: 6000,
    STEP: 10,
    ROOM_TEMP: 298, // Kelvin
    ABSOLUTE_ZERO: 0,
  },
} as const;

// State colors for temperature visualization
export const STATE_COLORS = {
  solid: '#3B82F6', // Tailwind blue-500
  liquid: '#F59E0B', // Tailwind amber-500
  gas: '#EF4444', // Tailwind red-500
  unknown: '#9CA3AF', // Tailwind gray-400
} as const;

// Atom sizing for visualizations
export const ATOM_SIZES = {
  SMALL: 30,
  MEDIUM: 50,
  LARGE: 70,
  EXTRA_LARGE: 90,
} as const;

// Bond dimensions
export const BOND = {
  LINE_WIDTH: 2,
  SPACING: 8, // Gap between double/triple bonds
  COLORS: {
    single: '#64748B', // Tailwind slate-600
    double: '#475569', // Tailwind slate-700
    triple: '#334155', // Tailwind slate-800
    bonding: '#10B981', // Tailwind green-500 (for bonding electrons)
    lonePair: '#F59E0B', // Tailwind amber-500 (for lone pairs)
  },
} as const;

// Touch targets (minimum for accessibility)
export const TOUCH_TARGET = {
  MIN_SIZE: 44, // iOS/Android standard
  RECOMMENDED: 48, // Material Design standard
} as const;

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Drag and drop configuration
export const DND = {
  ACTIVATION_DISTANCE: 8, // pixels to start drag
  POINTER_DEBOUNCE: 50, // ms
} as const;

// Z-index layers
export const Z_INDEX = {
  BASE: 1,
  DRAGGING: 1000,
  MODAL: 50,
  TOOLTIP: 100,
} as const;

// Message display duration
export const MESSAGE_DURATION = 3000; // ms

// Element categories for filtering
export const ELEMENT_CATEGORIES = {
  METALS: ['alkali metal', 'alkaline earth metal', 'transition metal', 'post-transition metal', 'lanthanide', 'actinide'],
  NONMETALS: ['nonmetal', 'halogen', 'noble gas'],
  METALLOIDS: ['metalloid'],
} as const;

// Opacity ranges for property visualization
export const PROPERTY_OPACITY = {
  MIN: 0.3,
  MAX: 1.0,
  UNKNOWN: 0.3,
} as const;

// Preset molecule difficulty levels
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// XP rewards for simulations
export const SIMULATION_XP = {
  BUILD_VALID_MOLECULE: 10,
  BUILD_COMPLEX_MOLECULE: 20,
  BUILD_PERFECT_OCTET: 15,
  COMPLETE_PRESET: 25,
  EXPLORE_PERIODIC_TABLE: 5,
  BUILD_IONIC_COMPOUND: 10,
  BUILD_LATTICE: 20,
} as const;

// Badge thresholds
export const SIMULATION_BADGES = {
  FIRST_MOLECULE: 1, // Build 1 valid molecule
  MOLECULE_BUILDER: 10, // Build 10 valid molecules
  CHEMISTRY_MASTER: 50, // Build 50 valid molecules
  PERIODIC_EXPLORER: 25, // View 25 different elements
  IONIC_BUILDER: 10, // Build 10 ionic compounds
} as const;
