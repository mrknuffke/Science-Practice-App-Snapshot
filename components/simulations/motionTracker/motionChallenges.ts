import { ChallengeDef } from '../shared/ChallengeDeck';
import {
  KinematicScenarioConfig,
  Point,
  generateGroundTruthPoints,
} from './motionEngine';

export interface MotionSetup {
  scenarioId: string;
  metersPerPixel: number;
  origin: { x: number; y: number };
  points: Point[];
  scaleLocked: boolean;
  originLocked: boolean;
}

export interface KinematicChallenge extends ChallengeDef {
  scenario: KinematicScenarioConfig;
  start: MotionSetup;
  solutionSetup: MotionSetup;
}

// --- 4 Canonical Kinematic Scenarios ---

export const GLIDER_SCENARIO: KinematicScenarioConfig = {
  id: 'glider_const_v',
  name: 'Horizontal Air-Track Glider',
  title: 'Constant Velocity on Frictionless Track',
  description: 'A low-friction glider glides horizontally across an air track at steady speed.',
  duration: 1.4,
  scaleBar: {
    x1: 250,
    y1: 70,
    x2: 550,
    y2: 70,
    lengthMeters: 1.0,
    label: 'Track Scale Bar',
    orientation: 'horizontal',
  },
  origin: { x: 100, y: 280 },
  metersPerPixel: 1.0 / 300, // 300px = 1.0m
  initialState: {
    x0: 0,
    y0: 0,
    vx0: 1.5,
    vy0: 0,
    ax: 0,
    ay: 0,
  },
  objectVisual: {
    type: 'glider',
    color: '#0284c7', // sky-600
    label: 'Glider',
    radius: 14,
  },
  apparatusType: 'air_track',
};

export const FREE_FALL_SCENARIO: KinematicScenarioConfig = {
  id: 'free_fall_g',
  name: 'Vertical Free Fall Drop Tower',
  title: 'Gravitational Free Fall of Steel Sphere',
  description: 'A solid steel sphere released from rest in a vertical drop tower accelerates downward.',
  duration: 0.55,
  scaleBar: {
    x1: 220,
    y1: 80,
    x2: 220,
    y2: 300,
    lengthMeters: 1.0,
    label: 'Vertical Meter Stick',
    orientation: 'vertical',
  },
  origin: { x: 400, y: 80 },
  metersPerPixel: 1.0 / 220, // 220px = 1.0m
  initialState: {
    x0: 0,
    y0: 0,
    vx0: 0,
    vy0: 0,
    ax: 0,
    ay: -9.8,
  },
  objectVisual: {
    type: 'sphere',
    color: '#94a3b8', // metallic slate
    label: 'Steel Ball',
    radius: 10,
  },
  apparatusType: 'drop_tower',
};

export const RAMP_SCENARIO: KinematicScenarioConfig = {
  id: 'ramp_accel',
  name: 'Dynamics Cart on Incline',
  title: 'Uniform Acceleration Down Incline Plane',
  description: 'A wheeled dynamics cart accelerates smoothly down an incline plane.',
  duration: 1.3,
  scaleBar: {
    x1: 150,
    y1: 60,
    x2: 400,
    y2: 60,
    lengthMeters: 1.0,
    label: 'Reference Gauge',
    orientation: 'horizontal',
  },
  origin: { x: 80, y: 140 },
  metersPerPixel: 1.0 / 250, // 250px = 1.0m
  initialState: {
    x0: 0,
    y0: 0,
    vx0: 0.4,
    vy0: 0,
    ax: 2.0,
    ay: 0,
  },
  objectVisual: {
    type: 'cart',
    color: '#10b981', // emerald-500
    label: 'Dynamics Cart',
    radius: 12,
  },
  apparatusType: 'incline_ramp',
};

export const PROJECTILE_SCENARIO: KinematicScenarioConfig = {
  id: 'projectile_2d',
  name: 'Two-Dimensional Projectile Flight',
  title: 'Angled Projectile Launch',
  description: 'A ball launched at an angle traces a parabolic arc in two dimensions.',
  duration: 0.8,
  scaleBar: {
    x1: 200,
    y1: 60,
    x2: 450,
    y2: 60,
    lengthMeters: 1.0,
    label: 'Range Gauge',
    orientation: 'horizontal',
  },
  origin: { x: 100, y: 360 },
  metersPerPixel: 1.0 / 250, // 250px = 1.0m
  initialState: {
    x0: 0,
    y0: 0,
    vx0: 3.0,
    vy0: 4.0,
    ax: 0,
    ay: -9.8,
  },
  objectVisual: {
    type: 'projectile',
    color: '#f97316', // orange-500
    label: 'Projectile Ball',
    radius: 9,
  },
  apparatusType: 'projectile_launcher',
};

export const PRESET_SCENARIOS: KinematicScenarioConfig[] = [
  GLIDER_SCENARIO,
  FREE_FALL_SCENARIO,
  RAMP_SCENARIO,
  PROJECTILE_SCENARIO,
];

// --- 4 Canonical Kinematic Challenges (Goals, Not Recipes) ---

export const MOTION_CHALLENGES: KinematicChallenge[] = [
  {
    id: 'glider_const_v',
    title: 'The Constant Glider',
    description:
      'An air-track glider moves horizontally without friction. Calibrate the 1.0 m scale, track the glider, and demonstrate that its horizontal velocity matches 1.50 m/s with zero acceleration.',
    hints: [
      'Watch how far the glider travels in each frame. Does the gap between successive dots change or stay uniform?',
      'Uniform motion yields a straight diagonal line on an x-position vs. time graph (slope = vx) and a flat line with zero slope on a vx-vs-t graph.',
      'Calibrate the 1.0 m yellow reference bar, set your origin (0,0) at the glider start, and track at least 8 frames. Fit a Linear Regression on x-Position vs. Time to measure velocity.',
    ],
    solution:
      'Scale calibrated to 1.0 m (300 px), origin set at glider release (x=100, y=280), tracked across 10 frames yielding vx = 1.50 m/s and ax = 0.00 m/s².',
    scenario: GLIDER_SCENARIO,
    start: {
      scenarioId: 'glider_const_v',
      metersPerPixel: 1.0,
      origin: { x: 0, y: 0 },
      points: [],
      scaleLocked: false,
      originLocked: false,
    },
    solutionSetup: {
      scenarioId: 'glider_const_v',
      metersPerPixel: GLIDER_SCENARIO.metersPerPixel,
      origin: GLIDER_SCENARIO.origin,
      points: generateGroundTruthPoints(GLIDER_SCENARIO),
      scaleLocked: true,
      originLocked: true,
    },
  },
  {
    id: 'free_fall_g',
    title: 'Free Fall Gravitational Pull',
    description:
      "A steel sphere is released from rest in a vertical drop tower. Calibrate the vertical 1.0 m reference, track the falling sphere, and determine Earth's local gravitational acceleration (-9.8 m/s²).",
    hints: [
      'As the sphere falls, notice whether the distance it drops between frames grows larger over time.',
      'Gravity exerts a constant downward force, producing uniform acceleration. On a y-position vs. time graph, this forms a parabola where the quadratic coefficient equals 1/2 ay.',
      'Calibrate the vertical 1.0 m scale on the left, set the origin at the top release magnet, track the sphere down the tower, and check the Quadratic Fit on y-Position vs. Time.',
    ],
    solution:
      'Vertical scale calibrated to 1.0 m (220 px), origin placed at release magnet (x=400, y=80), quadratic fit y(t) = -4.90t² yields vertical acceleration ay = -9.80 m/s².',
    scenario: FREE_FALL_SCENARIO,
    start: {
      scenarioId: 'free_fall_g',
      metersPerPixel: 1.0,
      origin: { x: 0, y: 0 },
      points: [],
      scaleLocked: false,
      originLocked: false,
    },
    solutionSetup: {
      scenarioId: 'free_fall_g',
      metersPerPixel: FREE_FALL_SCENARIO.metersPerPixel,
      origin: FREE_FALL_SCENARIO.origin,
      points: generateGroundTruthPoints(FREE_FALL_SCENARIO),
      scaleLocked: true,
      originLocked: true,
    },
  },
  {
    id: 'ramp_accel',
    title: 'Ramp Acceleration & Displacement',
    description:
      'A low-friction dynamics cart rolls down an inclined track with steady acceleration. Track its position to verify an acceleration of 2.00 m/s² and a total displacement of at least 2.0 m.',
    hints: [
      'How does the velocity of a cart rolling downhill change with time?',
      'Steady acceleration means velocity increases linearly (vx = vx0 + ax*t). The slope of the vx-vs-t graph represents the acceleration.',
      'Calibrate the 1.0 m reference gauge, set the origin at the cart release point, track the cart down the ramp, and apply a Linear Fit to x-Velocity vs. Time to measure ax = 2.00 m/s².',
    ],
    solution:
      'Scale calibrated to 1.0 m (250 px), origin set at ramp start (x=80, y=140), tracked across 1.3 s producing ax = 2.00 m/s² and total displacement Δx = 2.21 m.',
    scenario: RAMP_SCENARIO,
    start: {
      scenarioId: 'ramp_accel',
      metersPerPixel: 1.0,
      origin: { x: 0, y: 0 },
      points: [],
      scaleLocked: false,
      originLocked: false,
    },
    solutionSetup: {
      scenarioId: 'ramp_accel',
      metersPerPixel: RAMP_SCENARIO.metersPerPixel,
      origin: RAMP_SCENARIO.origin,
      points: generateGroundTruthPoints(RAMP_SCENARIO),
      scaleLocked: true,
      originLocked: true,
    },
  },
  {
    id: 'projectile_2d',
    title: '2D Projectile Independence',
    description:
      'A projectile is launched in two dimensions. Prove the independence of horizontal and vertical motion: maintain a constant horizontal velocity of 3.00 m/s while measuring vertical gravitational acceleration (-9.8 m/s²).',
    hints: [
      'Does horizontal forward motion prevent gravity from pulling an object downward at its normal rate?',
      'Horizontal and vertical components are independent: horizontal velocity remains constant (ax = 0) while vertical motion accelerates downward at -9.8 m/s².',
      'Calibrate the 1.0 m scale, set the origin at the launch mouth, track through the apex of the parabolic trajectory, and check both x-vs-t (linear slope ~3.0) and y-vs-t (quadratic curve ~ -4.9t²).',
    ],
    solution:
      'Scale calibrated to 1.0 m (250 px), origin set at launch mouth (x=100, y=360), tracked through apex yielding vx = 3.00 m/s (ax = 0) and ay = -9.80 m/s² with peak height y = 0.82 m.',
    scenario: PROJECTILE_SCENARIO,
    start: {
      scenarioId: 'projectile_2d',
      metersPerPixel: 1.0,
      origin: { x: 0, y: 0 },
      points: [],
      scaleLocked: false,
      originLocked: false,
    },
    solutionSetup: {
      scenarioId: 'projectile_2d',
      metersPerPixel: PROJECTILE_SCENARIO.metersPerPixel,
      origin: PROJECTILE_SCENARIO.origin,
      points: generateGroundTruthPoints(PROJECTILE_SCENARIO),
      scaleLocked: true,
      originLocked: true,
    },
  },
];
