/* ============================================================
   MISSION: PHYSICA: GLOSSARY
   Terminology definitions. Each lesson term resolves here (a strong.term with a
   data-term key, or a key made from its words). The shared runtime shows the
   text as plain text, so notation is Unicode and a subscript is written x_f.
   Zero em-dashes.
   ============================================================ */

(function () {
  'use strict';

  window.TB_GLOSSARY = {
    'position': {
      term: 'Position',
      definition: 'The specific location of an object relative to a chosen reference point or coordinate origin (symbol: x or y, unit: meters).'
    },
    'displacement': {
      term: 'Displacement',
      definition: 'The straight-line vector change in position from initial to final point (Δx = x_f − x_i, unit: meters). Accounts for direction.'
    },
    'distance': {
      term: 'Distance',
      definition: 'The total length of the path traveled by an object, regardless of direction. A scalar quantity measured in meters.'
    },
    'scalar': {
      term: 'Scalar',
      definition: 'A physical quantity described completely by magnitude (numerical value and units) without any direction (e.g. speed, distance, mass, time).'
    },
    'vector': {
      term: 'Vector',
      definition: 'A physical quantity that has both magnitude (size) and direction in space (e.g. displacement, velocity, acceleration, force).'
    },
    'speed': {
      term: 'Speed',
      definition: 'The rate at which an object covers distance over time. A scalar quantity measured in meters per second (m/s).'
    },
    'average-velocity': {
      term: 'Average velocity',
      definition: 'The total displacement divided by the elapsed time interval (v = Δx / Δt). A vector quantity measured in meters per second (m/s).'
    },
    'instantaneous-velocity': {
      term: 'Instantaneous velocity',
      definition: 'The velocity of an object at an exact, specific moment in time. Represented by the tangent slope on a position vs. time graph.'
    },
    'acceleration': {
      term: 'Acceleration',
      definition: 'The rate of change of velocity over time (a = Δv / Δt). A vector quantity measured in meters per second squared (m/s²).'
    },
    'uniform-motion': {
      term: 'Uniform motion',
      definition: 'Motion in a straight line with constant velocity, where acceleration is zero and equal displacements occur in equal time intervals.'
    },
    'reference-frame': {
      term: 'Reference frame',
      definition: 'A coordinate system with an agreed origin and orientation used to measure and describe the position and motion of objects.'
    },
    'free-fall': {
      term: 'Free fall',
      definition: 'Motion under the sole influence of gravity, where air resistance is negligible and all objects accelerate downward at rate g.'
    },
    'projectile': {
      term: 'Projectile',
      definition: 'An object launched into the air that moves under the influence of gravity alone, combining independent horizontal and vertical motions.'
    },
    'slope': {
      term: 'Slope',
      definition: 'The ratio of vertical change to horizontal change (rise over run). On an x-t graph slope is velocity; on a v-t graph slope is acceleration.'
    },
    'linearization': {
      term: 'Linearization',
      definition: 'The mathematical technique of plotting transformed variables (such as x versus t²) to produce a straight line whose slope reveals physical constants.'
    },
    'area-under-curve': {
      term: 'Area under the curve',
      definition: 'The geometric region bounded by a graph line and the horizontal time axis. On a v-t graph, this area represents net displacement (Δx).'
    },
    'tangent-line': {
      term: 'Tangent line',
      definition: 'A straight line touching a curved graph at exactly one point, whose slope equals the instantaneous rate of change at that precise instant.'
    },
    'trajectory': {
      term: 'Trajectory',
      definition: 'The curved parabolic path followed by a projectile through space under the influence of gravity.'
    },
    'hang-time': {
      term: 'Hang time',
      definition: 'The total duration of time that a projectile remains airborne from launch to impact, determined solely by vertical drop height and gravitational acceleration.'
    },
    'range': {
      term: 'Range',
      definition: 'The horizontal distance traveled by a projectile between launch and landing point (Δx = v_x · t).'
    },
    'kinematics': {
      term: 'Kinematics',
      definition: 'The branch of classical mechanics describing the motion of points, bodies, and systems without consideration of the forces that cause them.'
    },
    'component': {
      term: 'Component',
      definition: 'The projection of a vector onto a coordinate axis (such as the independent horizontal x-component or vertical y-component).'
    },
    'force': {
      term: 'Force',
      definition: 'An interaction between two objects consisting of a push or a pull, capable of altering an object\'s state of motion (unit: Newtons, N).'
    },
    'net-force': {
      term: 'Net force',
      definition: 'The vector sum of all external forces acting simultaneously on a single object (symbol: ΣF or F_net, unit: Newtons).'
    },
    'inertia': {
      term: 'Inertia',
      definition: 'The intrinsic physical property of an object to resist changes in its state of motion or rest, directly proportional to its mass.'
    },
    'newtons-first-law': {
      term: 'Newton\'s first law',
      definition: 'A physical law stating that an object remains at rest or in uniform straight-line motion at constant velocity unless acted upon by a non-zero net external force.'
    },
    'equilibrium': {
      term: 'Equilibrium',
      definition: 'A physical state where the vector sum of all external forces acting on an object is zero (ΣF = 0), producing zero acceleration.'
    },
    'normal-force': {
      term: 'Normal force',
      definition: 'A perpendicular contact force exerted by a supporting surface against an object resting on or pressing into it (symbol: F_N).'
    },
    'tension': {
      term: 'Tension',
      definition: 'A pulling contact force transmitted through a string, rope, cable, or chain acting away from the object along the line of the connector (symbol: F_T).'
    },
    'free-body-diagram': {
      term: 'Free-body diagram',
      definition: 'A simplified diagram representing an isolated object as a point mass, displaying all external force vectors acting upon it.'
    },
    'mass': {
      term: 'Mass',
      definition: 'A scalar measure of the amount of matter in an object and its quantitative resistance to acceleration (unit: kilograms, kg).'
    },
    'weight': {
      term: 'Weight',
      definition: 'The downward gravitational force exerted on an object by a celestial body (F_g = m · g, unit: Newtons, N).'
    },
    'newton': {
      term: 'Newton (N)',
      definition: 'The SI unit of force. One newton is the force that gives a 1 kg mass an acceleration of 1 m/s².'
    },
    'friction': {
      term: 'Friction',
      definition: 'A contact force along the touching surfaces. It opposes sliding, or opposes the push that tries to start sliding.'
    },
    'balanced-forces': {
      term: 'Balanced forces',
      definition: 'Forces that add up to zero. The net force is zero, so the acceleration is zero. The object is at rest or moves at constant velocity.'
    },
    'newtons-second-law': {
      term: 'Newton\'s second law',
      definition: 'The net force on an object equals its mass times its acceleration (ΣF = ma). The acceleration points in the direction of the net force.'
    },
    'apparent-weight': {
      term: 'Apparent weight',
      definition: 'The support force a scale or floor pushes up with. It equals your weight only when you are not accelerating up or down.'
    },
    'newtons-third-law': {
      term: 'Newton\'s third law',
      definition: 'When body A pushes on body B, body B pushes back on A with a force of equal size in the opposite direction. The two forces act on different bodies.'
    },
    'momentum': {
      term: 'Momentum',
      definition: 'The mass of an object times its velocity (p = mv). A vector measured in kg·m/s. Its sign shows the direction.'
    },
    'conservation-of-momentum': {
      term: 'Conservation of momentum',
      definition: 'When no net outside force acts on a system, the total momentum of the system stays the same before and after an interaction.'
    },
    'asperity': {
      term: 'Asperity',
      definition: 'A tiny peak on a surface. Two touching surfaces meet only at their asperities.'
    },
    'static-friction': {
      term: 'Static friction',
      definition: 'The friction force between two surfaces that are not sliding. It matches the push up to a maximum value.'
    },
    'kinetic-friction': {
      term: 'Kinetic friction',
      definition: 'The friction force between two surfaces that slide past each other. It points against the sliding.'
    },
    'coefficient-of-friction': {
      term: 'Coefficient of friction',
      definition: 'A number (μ) that compares the friction force with the normal force. The static value (μs) is usually larger than the kinetic value (μk).'
    },
    'whole-system-method': {
      term: 'Whole-system method',
      definition: 'Treat connected masses as one body. Divide the net outside force by the total mass to get the acceleration. Cord tensions inside the system cancel.'
    }
  };

  // Common aliases
  const G = window.TB_GLOSSARY;
  G['velocity'] = G['average-velocity'];
  G['reference-point'] = G['reference-frame'];
  G['constant-velocity'] = G['uniform-motion'];
  G['area'] = G['area-under-curve'];
  G['flight-time'] = G['hang-time'];
  G['horizontal-range'] = G['range'];
  G['first-law'] = G['newtons-first-law'];
  G['fbd'] = G['free-body-diagram'];
  G['translational-equilibrium'] = G['equilibrium'];
  G['gravitational-force'] = G['weight'];
})();
