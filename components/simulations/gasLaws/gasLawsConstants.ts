export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 500;

// Vessel geometry
export const VESSEL_LEFT = 60;
export const VESSEL_RIGHT = CANVAS_WIDTH - 60;
export const VESSEL_BOTTOM = CANVAS_HEIGHT - 60;
export const VESSEL_MIN_HEIGHT = 80;  // wall can't compress past this
export const VESSEL_MAX_HEIGHT = CANVAS_HEIGHT - 80;

export const PISTON_MIN = VESSEL_MIN_HEIGHT;
export const PISTON_MAX = VESSEL_BOTTOM - 80;

// Initial piston Y position (top wall)
export const INITIAL_PISTON_Y = 80;

// Particle properties
export const GAS_A_RADIUS = 10;
export const GAS_B_RADIUS = 6;
export const INITIAL_GAS_A_COUNT = 30;
export const INITIAL_GAS_B_COUNT = 0;

// Physics
export const HEAT_DELTA = 0.015;     // velocity scale factor per heat-button tick
export const COOL_DELTA = 0.015;
export const MIN_SPEED = 0.3;
export const MAX_SPEED = 15.0;

// Pressure: wall-hit impulse accumulator
export const PRESSURE_SMOOTH = 0.08; // EMA smoothing factor (lower = smoother)
export const PRESSURE_BREAK_THRESHOLD = 1500; // higher than the 600 default: vessel survives normal heat/compression sweeps

// Temperature: mean KE (½mv²), displayed in K via linear scale
export const KE_TO_KELVIN = 30;

// Vent (opening in right wall, just below piston): particles in this Y band can escape
export const VENT_OFFSET_TOP = 12;     // distance below piston where vent starts
export const VENT_OFFSET_BOTTOM = 60;  // distance below piston where vent ends

// Graph history
export const GRAPH_HISTORY_MAX = 150;

// Colors
export const GAS_A_BASE_COLOR = '#6366f1'; // indigo, tinted by speed
export const GAS_B_BASE_COLOR = '#f59e0b'; // amber, tinted by speed
export const VESSEL_WALL_COLOR = '#475569';
export const VESSEL_WALL_BREAK_COLOR = '#ef4444';
export const PISTON_COLOR = '#334155';
export const PISTON_HANDLE_COLOR = '#64748b';
