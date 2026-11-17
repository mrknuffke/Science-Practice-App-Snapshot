import { FbdForceType } from '../../../types';

export interface ForceDefinition {
  type: FbdForceType;
  label: string;
  symbol: string;
  defaultAngleDeg: number; // 0=right, 90=up, 180=left, 270=down
  color: string;
  description: string;
  category: 'contact' | 'field' | 'other';
}

export const FORCE_DEFINITIONS: Record<FbdForceType, ForceDefinition> = {
  gravity: {
    type: 'gravity',
    label: 'Gravity',
    symbol: 'Fg',
    defaultAngleDeg: 270,
    color: '#ef4444',
    description: 'Gravitational force pulling downward (weight)',
    category: 'field',
  },
  normal: {
    type: 'normal',
    label: 'Normal',
    symbol: 'Fn',
    defaultAngleDeg: 90,
    color: '#10b981',
    description: 'Perpendicular contact force from a surface',
    category: 'contact',
  },
  applied: {
    type: 'applied',
    label: 'Applied',
    symbol: 'Fa',
    defaultAngleDeg: 0,
    color: '#6366f1',
    description: 'External push or pull force',
    category: 'contact',
  },
  friction_kinetic: {
    type: 'friction_kinetic',
    label: 'Kinetic Friction',
    symbol: 'Fk',
    defaultAngleDeg: 180,
    color: '#f59e0b',
    description: 'Friction opposing motion (object is moving)',
    category: 'contact',
  },
  friction_static: {
    type: 'friction_static',
    label: 'Static Friction',
    symbol: 'Fs',
    defaultAngleDeg: 180,
    color: '#d97706',
    description: 'Friction preventing motion (object is stationary)',
    category: 'contact',
  },
  tension: {
    type: 'tension',
    label: 'Tension',
    symbol: 'T',
    defaultAngleDeg: 90,
    color: '#8b5cf6',
    description: 'Pulling force transmitted through a rope or string',
    category: 'contact',
  },
  drag: {
    type: 'drag',
    label: 'Air Resistance',
    symbol: 'Fd',
    defaultAngleDeg: 180,
    color: '#64748b',
    description: 'Drag force opposing motion through a fluid',
    category: 'contact',
  },
  spring: {
    type: 'spring',
    label: 'Spring Force',
    symbol: 'Fsp',
    defaultAngleDeg: 90,
    color: '#06b6d4',
    description: 'Restoring force from a compressed or stretched spring',
    category: 'contact',
  },
  buoyancy: {
    type: 'buoyancy',
    label: 'Buoyancy',
    symbol: 'Fb',
    defaultAngleDeg: 90,
    color: '#0284c7',
    description: 'Upward force from displaced fluid (Archimedes)',
    category: 'field',
  },
  electric: {
    type: 'electric',
    label: 'Electric Force',
    symbol: 'Fe',
    defaultAngleDeg: 0,
    color: '#f43f5e',
    description: 'Coulomb force between charged objects',
    category: 'field',
  },
  magnetic: {
    type: 'magnetic',
    label: 'Magnetic Force',
    symbol: 'Fm',
    defaultAngleDeg: 90,
    color: '#a855f7',
    description: 'Lorentz force on a moving charge in a magnetic field',
    category: 'field',
  },
};

export const CANVAS_WIDTH = 600;
export const CANVAS_HEIGHT = 500;
export const OBJECT_RADIUS = 32; // half-size for block

// Object sits on the surface line. Surface line Y position (from top).
// Object center Y = SURFACE_Y - OBJECT_RADIUS (so bottom of object touches surface)
export const SURFACE_Y = 390; // where the surface is drawn
export const OBJECT_CX = CANVAS_WIDTH / 2;
export const OBJECT_CY = SURFACE_Y - OBJECT_RADIUS; // object center, sitting on surface

export type SurfaceType = 'flat' | 'incline' | 'rope' | 'water' | 'air';

export const SURFACE_LABELS: Record<SurfaceType, string> = {
  flat: 'Flat Surface',
  incline: 'Inclined Plane',
  rope: 'Hanging (Rope/Pulley)',
  water: 'Submerged in Fluid',
  air: 'In Air (Free Fall)',
};

export type ObjectPreset = 'block' | 'sphere' | 'car' | 'person' | 'book' | 'crate' | 'custom';

export const OBJECT_PRESET_LABELS: Record<ObjectPreset, string> = {
  block: 'Block',
  sphere: 'Ball',
  car: 'Car',
  person: 'Person',
  book: 'Book',
  crate: 'Crate',
  custom: 'Custom',
};
export const ARROW_HEAD_LENGTH = 16;
export const ARROW_HEAD_ANGLE = Math.PI / 5; // ~36°, wider, more visible head
export const MIN_MAGNITUDE = 20;
export const MAX_MAGNITUDE = 200;
export const DEFAULT_MAGNITUDE = 80;

// How close an angle must be to be "correct" in practice mode (degrees)
export const ANGLE_TOLERANCE_DEG = 25;
// How much magnitude can differ and still be "correct" (ratio)
export const MAGNITUDE_TOLERANCE = 0.6;
