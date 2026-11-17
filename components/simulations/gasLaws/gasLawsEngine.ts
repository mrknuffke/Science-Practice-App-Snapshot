import { VESSEL_LEFT, VESSEL_RIGHT, VESSEL_BOTTOM, GAS_A_RADIUS, GAS_B_RADIUS, MAX_SPEED, PRESSURE_SMOOTH, PRESSURE_BREAK_THRESHOLD, KE_TO_KELVIN, VENT_OFFSET_TOP, VENT_OFFSET_BOTTOM } from './gasLawsConstants';

export type GasType = 'A' | 'B';

export interface GasParticle {
  id: string;
  type: GasType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
}

export interface GasState {
  particles: GasParticle[];
  pistonY: number;         // Y coordinate of the top wall (lower = smaller volume)
  pressureA: number;       // Smoothed partial pressure from Gas A hits
  pressureB: number;       // Smoothed partial pressure from Gas B hits
  totalPressure: number;   // pressureA + pressureB
  temperature: number;     // Mean KE * KE_TO_KELVIN (displayed in K)
  isBroken: boolean;
  breakProgress: number;   // 0 to 1 animation progress
  ventOpen: boolean;       // when true, a gap in the right wall lets particles escape
}

let _idCounter = 0;
function makeId() { return `p_${_idCounter++}`; }

function randomSpeed(): number {
  return 1.5 + Math.random() * 2;
}

export function createParticle(type: GasType, pistonY: number): GasParticle {
  const r = type === 'A' ? GAS_A_RADIUS : GAS_B_RADIUS;
  const mass = type === 'A' ? 2 : 1;
  const x = VESSEL_LEFT + r + Math.random() * (VESSEL_RIGHT - VESSEL_LEFT - r * 2);
  const y = pistonY + r + Math.random() * (VESSEL_BOTTOM - pistonY - r * 2);

  const speed = randomSpeed();
  const angle = Math.random() * Math.PI * 2;

  return {
    id: makeId(),
    type,
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    radius: r,
    mass,
  };
}

export function initGasState(initialPistonY: number, countA: number, countB: number): GasState {
  const particles: GasParticle[] = [];
  for (let i = 0; i < countA; i++) particles.push(createParticle('A', initialPistonY));
  for (let i = 0; i < countB; i++) particles.push(createParticle('B', initialPistonY));

  return {
    particles,
    pistonY: initialPistonY,
    pressureA: 0,
    pressureB: 0,
    totalPressure: 0,
    temperature: 0,
    isBroken: false,
    breakProgress: 0,
    ventOpen: false,
  };
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function stepGasLaws(
  state: GasState,
  targetPistonY: number,  // user-dragged value
  heatDelta: number,      // +HEAT_DELTA, -HEAT_DELTA, or 0
  indestructible: boolean = false,
): GasState {
  if (state.isBroken) {
    const bp = Math.min(1, state.breakProgress + 0.04);
    return { ...state, breakProgress: bp };
  }

  // Smoothly move piston toward target
  const pistonY = state.pistonY + (targetPistonY - state.pistonY) * 0.15;

  // Adiabatic scaling: in 2D ideal gas (γ=2), T·V = const, so v ∝ 1/√V.
  // Scaling all velocities by √(V_old / V_new) each tick gives reversible
  // compression heating / expansion cooling, symmetric in collision count.
  // (The per-collision moving-wall formula is correct in continuum but
  // asymmetric here because expansion produces fewer wall hits than compression).
  const oldHeight = VESSEL_BOTTOM - state.pistonY;
  const newHeight = VESSEL_BOTTOM - pistonY;
  const adiabaticScale = oldHeight > 0 && newHeight > 0
    ? Math.sqrt(oldHeight / newHeight)
    : 1;

  const particles = state.particles.map(p => ({ ...p }));

  // Apply adiabatic work, then heat/cool
  if (adiabaticScale !== 1) {
    for (const p of particles) {
      p.vx *= adiabaticScale;
      p.vy *= adiabaticScale;
    }
  }
  if (heatDelta !== 0) {
    const scale = 1 + heatDelta;
    for (const p of particles) {
      p.vx *= scale;
      p.vy *= scale;
    }
  }
  // Clamp to MAX_SPEED (prevents runaway from extreme compression + heating).
  // Note: leave MIN_SPEED unclamped so expansion can genuinely cool the gas.
  for (const p of particles) {
    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
    if (speed > MAX_SPEED) { const s = MAX_SPEED / speed; p.vx *= s; p.vy *= s; }
  }

  // Accumulate wall-hit impulses this tick for pressure
  let rawImpulseA = 0;
  let rawImpulseB = 0;

  // Vent geometry: a gap in the right wall just below the piston
  const ventTop = pistonY + VENT_OFFSET_TOP;
  const ventBottom = pistonY + VENT_OFFSET_BOTTOM;
  const ventOpen = state.ventOpen;
  const escapedIds = new Set<string>();

  // Move particles and handle wall collisions (all walls treated as stationary)
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;

    const inVent = ventOpen && p.y >= ventTop && p.y <= ventBottom;

    // Left wall
    if (p.x - p.radius < VESSEL_LEFT) {
      p.x = VESSEL_LEFT + p.radius;
      const impulse = Math.abs(p.vx) * 2 * p.mass;
      if (p.type === 'A') rawImpulseA += impulse; else rawImpulseB += impulse;
      p.vx = Math.abs(p.vx);
    }
    // Right wall: skip bounce when in vent and moving outward
    if (p.x + p.radius > VESSEL_RIGHT && !inVent) {
      p.x = VESSEL_RIGHT - p.radius;
      const impulse = Math.abs(p.vx) * 2 * p.mass;
      if (p.type === 'A') rawImpulseA += impulse; else rawImpulseB += impulse;
      p.vx = -Math.abs(p.vx);
    }
    // Mark for removal once well past the vessel boundary
    if (inVent && p.x > VESSEL_RIGHT + 60) {
      escapedIds.add(p.id);
    }
    // Bottom wall
    if (p.y + p.radius > VESSEL_BOTTOM) {
      p.y = VESSEL_BOTTOM - p.radius;
      const impulse = Math.abs(p.vy) * 2 * p.mass;
      if (p.type === 'A') rawImpulseA += impulse; else rawImpulseB += impulse;
      p.vy = -Math.abs(p.vy);
    }
    // Piston (top wall): stationary bounce; energy transfer comes from the
    // adiabatic scaling above, not from a moving-wall formula.
    if (p.y - p.radius < pistonY) {
      p.y = pistonY + p.radius;
      const impulse = Math.abs(p.vy) * 2 * p.mass;
      if (p.type === 'A') rawImpulseA += impulse; else rawImpulseB += impulse;
      p.vy = Math.abs(p.vy);
    }

    // Hard clamp inside vessel, but leave escaping particles free to drift out
    if (!inVent) {
      p.x = clamp(p.x, VESSEL_LEFT + p.radius, VESSEL_RIGHT - p.radius);
    } else {
      p.x = Math.max(VESSEL_LEFT + p.radius, p.x);
    }
    p.y = clamp(p.y, pistonY + p.radius, VESSEL_BOTTOM - p.radius);
  }

  // Drop particles that have drifted out through the vent
  const liveParticles = escapedIds.size > 0
    ? particles.filter(p => !escapedIds.has(p.id))
    : particles;

  // Simple particle-particle collision (broad-phase O(N²), fine for ≤200 particles)
  for (let i = 0; i < liveParticles.length; i++) {
    for (let j = i + 1; j < liveParticles.length; j++) {
      const a = liveParticles[i];
      const b = liveParticles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy;
      const minDist = a.radius + b.radius;
      if (distSq < minDist * minDist && distSq > 0.001) {
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;

        // Push apart
        const overlap = minDist - dist;
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;

        // Elastic collision along normal
        const dvx = a.vx - b.vx;
        const dvy = a.vy - b.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot > 0) {
          const mt = a.mass + b.mass;
          const imp = (2 * dot) / mt;
          a.vx -= imp * b.mass * nx;
          a.vy -= imp * b.mass * ny;
          b.vx += imp * a.mass * nx;
          b.vy += imp * a.mass * ny;
        }
      }
    }
  }

  // Smooth pressure via EMA
  const pressureA = state.pressureA * (1 - PRESSURE_SMOOTH) + rawImpulseA * PRESSURE_SMOOTH * 30;
  const pressureB = state.pressureB * (1 - PRESSURE_SMOOTH) + rawImpulseB * PRESSURE_SMOOTH * 30;
  const totalPressure = pressureA + pressureB;

  // Temperature from mean KE
  let sumKE = 0;
  for (const p of liveParticles) {
    sumKE += 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
  }
  const meanKE = liveParticles.length > 0 ? sumKE / liveParticles.length : 0;
  const temperature = meanKE * KE_TO_KELVIN;

  // Check vessel break (skipped when the user has enabled indestructible mode)
  if (!indestructible && totalPressure > PRESSURE_BREAK_THRESHOLD) {
    return {
      particles: liveParticles,
      pistonY,
      pressureA,
      pressureB,
      totalPressure,
      temperature,
      isBroken: true,
      breakProgress: 0,
      ventOpen,
    };
  }

  return {
    particles: liveParticles,
    pistonY,
    pressureA,
    pressureB,
    totalPressure,
    temperature,
    isBroken: false,
    breakProgress: 0,
    ventOpen,
  };
}

// Gas A = red scale (dim red → bright red), Gas B = blue scale (dim blue → bright blue)
// ratio 0 = cold (dim/dark), ratio 1 = hot (vivid/bright)
export function getParticleColor(p: GasParticle, meanKE: number): string {
  const ke = 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
  const ratio = meanKE > 0 ? clamp(ke / (meanKE * 2), 0, 1) : 0.5;

  if (p.type === 'A') {
    // Dim red (#7f1d1d) → vivid red (#ef4444)
    const r = Math.round(127 + ratio * (239 - 127));
    const g = Math.round(29 + ratio * (68 - 29));
    const b = Math.round(29 + ratio * (68 - 29));
    return `rgb(${r},${g},${b})`;
  } else {
    // Dim blue (#1e3a5f) → vivid blue (#3b82f6)
    const r = Math.round(30 + ratio * (59 - 30));
    const g = Math.round(58 + ratio * (130 - 58));
    const b = Math.round(95 + ratio * (246 - 95));
    return `rgb(${r},${g},${b})`;
  }
}

export function computeMeanKE(particles: GasParticle[]): number {
  if (particles.length === 0) return 0;
  let sum = 0;
  for (const p of particles) sum += 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
  return sum / particles.length;
}
