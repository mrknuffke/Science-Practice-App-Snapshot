import { FbdScenario } from '../../../types';

export const FBD_SCENARIOS: FbdScenario[] = [
  // Flat surface
  {
    id: 'flat_rest',
    title: 'Block at Rest in Static Equilibrium',
    description:
      'A wooden block sits motionless on a flat table. Add the two forces acting on it so they balance out to zero net force (ΣF = 0).',
    category: 'flat',
    objectIcon: 'block',
    targetAcceleration: {
      state: 'equilibrium',
      description: 'Zero net acceleration in static equilibrium (ΣF = 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'normal', label: 'Fn', angle: 90 },
    ],
    hint: 'Earth pulls downward while the solid table pushes upward with equal magnitude.',
    hints: [
      'When an object stays stationary on a horizontal table, what is its net force?',
      'Downward gravity (Fg at 270°) balances the upward normal support force (Fn at 90°).',
      'Place Fg downward at 270° (80 N) and Fn upward at 90° (80 N) so vertical forces balance.',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_fn', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
    ],
  },
  {
    id: 'flat_pushed',
    title: 'Block Accelerating Under Applied Force with Friction',
    description:
      'A person pushes a block across a rough floor, accelerating it to the right. Balance the vertical forces, and make sure the forward push beats friction.',
    category: 'flat',
    objectIcon: 'block',
    targetAcceleration: {
      state: 'accelerating_right',
      description: 'Net horizontal acceleration to the right (ΣFx > 0, ΣFy = 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'normal', label: 'Fn', angle: 90 },
      { type: 'applied', label: 'Fa', angle: 0 },
      { type: 'friction_kinetic', label: 'Fk', angle: 180 },
    ],
    hint: 'The forward push must exceed opposing kinetic friction while vertical forces cancel.',
    hints: [
      'What horizontal contact force opposes the sliding motion of the block across the floor?',
      'Vertical forces must balance (Fn = Fg). To accelerate right, the forward push (Fa at 0°) must exceed kinetic friction (Fk at 180°).',
      'Set Fg (270°, 80 N) and Fn (90°, 80 N). Set Fa (0°, 100 N) and Fk (180°, 50 N) for +50 N net force.',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_fn', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
      { id: 'sol_fa', type: 'applied', label: 'Fa', angle: 0, magnitude: 100, color: '#6366f1' },
      { id: 'sol_fk', type: 'friction_kinetic', label: 'Fk', angle: 180, magnitude: 50, color: '#f59e0b' },
    ],
  },
  {
    id: 'flat_equilibrium',
    title: 'Block in Horizontal Static Equilibrium',
    description:
      'Someone pulls horizontally on a crate, but static friction keeps it locked in place. Balance all forces so the crate stays motionless (ΣF = 0).',
    category: 'flat',
    objectIcon: 'block',
    targetAcceleration: {
      state: 'equilibrium',
      description: 'Complete two-axis static equilibrium (ΣF = 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'normal', label: 'Fn', angle: 90 },
      { type: 'applied', label: 'Fa', angle: 0 },
      { type: 'friction_static', label: 'Fs', angle: 180 },
    ],
    hint: 'Static friction exactly counterbalances the applied horizontal pull.',
    hints: [
      'When a crate is pulled horizontally but does not move, how does static friction respond?',
      'Static friction (Fs at 180°) must match the applied pull (Fa at 0°). Meanwhile, Fn balances Fg.',
      'Set Fg (270°, 80 N), Fn (90°, 80 N), Fa (0°, 60 N), and Fs (180°, 60 N).',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_fn', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
      { id: 'sol_fa', type: 'applied', label: 'Fa', angle: 0, magnitude: 60, color: '#6366f1' },
      { id: 'sol_fs', type: 'friction_static', label: 'Fs', angle: 180, magnitude: 60, color: '#d97706' },
    ],
  },

  // Inclined plane
  {
    id: 'incline_rest',
    title: 'Block Released on Frictionless 30° Incline',
    description:
      'A block is released on a frictionless 30° ramp. Add gravity and the surface normal force, showing net acceleration down the incline.',
    category: 'incline',
    objectIcon: 'block',
    inclineAngle: 30,
    targetAcceleration: {
      state: 'down_incline',
      description: 'Acceleration down the 30° incline.',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'normal', label: 'Fn', angle: 120 },
    ],
    hint: 'Normal force is perpendicular to the 30° incline (90° + 30° = 120°).',
    hints: [
      'In what direction does a ramp exert its support force on an inclined object?',
      'Normal force is perpendicular to the ramp (120°). Downslope gravity drives acceleration down the incline.',
      'Place gravity Fg downward at 270° (80 N) and normal force Fn at 120° (69 N).',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_fn', type: 'normal', label: 'Fn', angle: 120, magnitude: 69, color: '#10b981' },
    ],
  },
  {
    id: 'incline_sliding',
    title: 'Block Sliding Down 30° Ramp with Kinetic Friction',
    description:
      'A block slides down a rough 30° ramp, speeding up as it travels. Add gravity, normal force, and kinetic friction so the downslope pull wins.',
    category: 'incline',
    objectIcon: 'block',
    inclineAngle: 30,
    targetAcceleration: {
      state: 'down_incline',
      description: 'Net acceleration down the 30° incline.',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'normal', label: 'Fn', angle: 120 },
      { type: 'friction_kinetic', label: 'Fk', angle: 30 },
    ],
    hint: 'Kinetic friction points parallel up the ramp (30°), opposing downward slide.',
    hints: [
      'Which direction does kinetic friction point when an object slides down a ramp?',
      'Kinetic friction acts parallel up the slope (30°). Downslope gravity must exceed friction for downward acceleration.',
      'Set Fg at 270° (80 N), Fn at 120° (69 N), and kinetic friction Fk at 30° (20 N).',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_fn', type: 'normal', label: 'Fn', angle: 120, magnitude: 69, color: '#10b981' },
      { id: 'sol_fk', type: 'friction_kinetic', label: 'Fk', angle: 30, magnitude: 20, color: '#f59e0b' },
    ],
  },
  {
    id: 'incline_held',
    title: 'Block Held Stationary on 20° Incline',
    description:
      'A crate sits on a 20° ramp, held motionless by static friction. Balance all forces along both axes so net force equals zero.',
    category: 'incline',
    objectIcon: 'block',
    inclineAngle: 20,
    targetAcceleration: {
      state: 'equilibrium',
      description: 'Static equilibrium on incline (ΣF = 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'normal', label: 'Fn', angle: 110 },
      { type: 'friction_static', label: 'Fs', angle: 20 },
    ],
    hint: 'Static friction acts parallel up the 20° ramp, balancing downslope gravity.',
    hints: [
      'If the crate is held motionless on the ramp, what is the net force?',
      'Normal force (Fn at 110°) balances perpendicular gravity. Static friction (Fs at 20°) balances downslope gravity.',
      'Set Fg (270°, 80 N), Fn (110°, 75 N), and Fs (20°, 27 N) so forces sum to zero.',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_fn', type: 'normal', label: 'Fn', angle: 110, magnitude: 75, color: '#10b981' },
      { id: 'sol_fs', type: 'friction_static', label: 'Fs', angle: 20, magnitude: 27, color: '#d97706' },
    ],
  },

  // Pulley / hanging
  {
    id: 'hanging_rope',
    title: 'Suspended Mass at Rest on Vertical Cable',
    description:
      'A heavy load hangs motionless from a single crane cable. Balance downward gravity with upward cable tension so net vertical force is zero.',
    category: 'pulley',
    objectIcon: 'mass-on-rope',
    targetAcceleration: {
      state: 'equilibrium',
      description: 'Vertical static equilibrium (ΣF = 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'tension', label: 'T', angle: 90 },
    ],
    hint: 'Upward cable tension exactly balances downward gravitational force.',
    hints: [
      'What upward contact force balances the downward pull of gravity on a hanging load?',
      'Cable tension pulls upward (T at 90°) with magnitude equal to downward gravity (Fg at 270°).',
      'Place Fg at 270° (80 N) and tension T at 90° (80 N) so net vertical force equals zero.',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_t', type: 'tension', label: 'T', angle: 90, magnitude: 80, color: '#8b5cf6' },
    ],
  },
  {
    id: 'atwood',
    title: 'Ascending Mass in Atwood Machine',
    description:
      'A counterweighted mass on a pulley accelerates upward. Balance the forces so upward cable tension beats downward gravity.',
    category: 'pulley',
    objectIcon: 'mass-on-rope',
    targetAcceleration: {
      state: 'accelerating_up',
      description: 'Net upward vertical acceleration (ΣFy > 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'tension', label: 'T', angle: 90 },
    ],
    hint: 'For upward acceleration, upward cable tension must exceed downward gravity.',
    hints: [
      'Which vertical force must be greater for a mass to accelerate upward?',
      'Upward tension (T at 90°) must exceed downward gravity (Fg at 270°) for upward acceleration.',
      'Set downward gravity Fg at 270° (60 N) and upward tension T at 90° (100 N).',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 60, color: '#ef4444' },
      { id: 'sol_t', type: 'tension', label: 'T', angle: 90, magnitude: 100, color: '#8b5cf6' },
    ],
  },

  // Vertical motion
  {
    id: 'free_fall',
    title: 'Object in Free Fall',
    description:
      'A steel sphere is dropped in a vacuum chamber with no air resistance. Add the single force causing downward acceleration.',
    category: 'vertical',
    objectIcon: 'sphere',
    targetAcceleration: {
      state: 'accelerating_down',
      description: 'Net downward gravitational acceleration (ΣFy < 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
    ],
    hint: 'In ideal free fall, gravity is the only force acting on the object.',
    hints: [
      'Are there any contact surfaces or air molecules interacting with an object in free fall?',
      'In ideal free fall, gravity (Fg at 270°) is the only force acting on the body.',
      'Place a single downward gravity force Fg at 270° (80 N).',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
    ],
  },
  {
    id: 'elevator_up',
    title: 'Passenger in Upward-Accelerating Elevator',
    description:
      'A passenger stands on a floor scale inside an elevator accelerating upward. Show why the scale reads heavier than true weight.',
    category: 'vertical',
    objectIcon: 'block',
    targetAcceleration: {
      state: 'accelerating_up',
      description: 'Net upward vertical acceleration (ΣFy > 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'normal', label: 'Fn', angle: 90 },
    ],
    hint: 'The normal force from the floor must exceed gravity to accelerate upward.',
    hints: [
      'Why does a scale read higher than true weight when an elevator accelerates upward?',
      'To accelerate upward (ΣFy > 0), upward normal force (Fn at 90°) must exceed downward gravity (Fg at 270°).',
      'Set gravity Fg at 270° (70 N) and normal force Fn at 90° (110 N) for +40 N net force.',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 70, color: '#ef4444' },
      { id: 'sol_fn', type: 'normal', label: 'Fn', angle: 90, magnitude: 110, color: '#10b981' },
    ],
  },
  {
    id: 'terminal_velocity',
    title: 'Skydiver at Constant Terminal Velocity',
    description:
      'A skydiver falls through the air at constant terminal speed. Balance downward gravity with upward air resistance so net force is zero.',
    category: 'vertical',
    objectIcon: 'sphere',
    targetAcceleration: {
      state: 'equilibrium',
      description: 'Dynamic equilibrium at constant terminal velocity (ΣF = 0).',
    },
    expectedForces: [
      { type: 'gravity', label: 'Fg', angle: 270 },
      { type: 'drag', label: 'Fd', angle: 90 },
    ],
    hint: 'At terminal velocity, acceleration is zero, so air drag exactly balances gravity.',
    hints: [
      'At terminal velocity, speed is constant (a = 0). What does Newton dictate about net force?',
      'At terminal velocity, upward air drag (Fd at 90°) balances downward gravity (Fg at 270°).',
      'Place gravity Fg at 270° (80 N) and upward drag Fd at 90° (80 N) so net force equals 0 N.',
    ],
    solutionForces: [
      { id: 'sol_fg', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: 'sol_fd', type: 'drag', label: 'Fd', angle: 90, magnitude: 80, color: '#64748b' },
    ],
  },
];
