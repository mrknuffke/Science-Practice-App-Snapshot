import { SubstanceProperties, CANVAS_WIDTH, CANVAS_HEIGHT } from './phaseChangeConstants';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  latticeX: number;
  latticeY: number;
  state: 'solid' | 'liquid' | 'gas';
  rotation: number;       // radians: drives molecule orientation rendering
  rotationSpeed: number;  // radians per tick
}

export interface SimulationState {
  heatEnergy: number; // The independent variable driven by the heater/cooler
  temperature: number; // Derived from heatEnergy
  particles: Particle[];
  substance: SubstanceProperties;
}

// Arbitrary heat-capacity constants to balance the visual simulation
const C_SOLID = 2.0;
const C_LIQUID = 1.5;
const C_GAS = 1.0;

// Heat at which a fresh sample sits half-way through its solid region: guarantees
// every substance (including Neon, mp=24K) starts visibly solid regardless of how
// low its melting point is. Without this, a fixed initial heat (e.g. 100) puts Neon
// past its boiling point on load.
export function getInitialHeat(substance: SubstanceProperties): number {
  return (substance.meltingPoint * C_SOLID) / 2;
}

export function calculateThermodynamics(heat: number, substance: SubstanceProperties) {
  // CO₂ and similar substances that sublime skip the liquid phase entirely.
  // sublimates: boolean flag on substance.
  if (substance.sublimates) {
    const H_subStart = substance.meltingPoint * C_SOLID; // reuse meltingPoint as sublimation point
    const H_subEnd = H_subStart + substance.enthalpyVaporization;

    let temp = 0;
    let solidFraction = 0.0;
    let liquidFraction = 0.0;
    let gasFraction = 0.0;

    if (heat < H_subStart) {
      temp = heat / C_SOLID;
      solidFraction = 1.0;
    } else if (heat < H_subEnd) {
      temp = substance.meltingPoint;
      const progress = (heat - H_subStart) / substance.enthalpyVaporization;
      solidFraction = 1.0 - progress;
      gasFraction = progress;
    } else {
      temp = substance.meltingPoint + (heat - H_subEnd) / C_GAS;
      gasFraction = 1.0;
    }

    return {
      temp,
      solidFraction,
      liquidFraction,
      gasFraction,
      H_meltStart: H_subStart,
      H_boilStart: H_subStart,
    };
  }

  const H_FUSION = substance.enthalpyFusion;
  const H_VAPORIZATION = substance.enthalpyVaporization;

  const H_meltStart = substance.meltingPoint * C_SOLID;
  const H_meltEnd = H_meltStart + H_FUSION;

  const tempRiseLiquid = substance.boilingPoint - substance.meltingPoint;
  const H_boilStart = H_meltEnd + (tempRiseLiquid * C_LIQUID);
  const H_boilEnd = H_boilStart + H_VAPORIZATION;

  let temp = 0;
  let solidFraction = 0.0;
  let liquidFraction = 0.0;
  let gasFraction = 0.0;

  if (heat < H_meltStart) {
    temp = heat / C_SOLID;
    solidFraction = 1.0;
  } else if (heat < H_meltEnd) {
    temp = substance.meltingPoint;
    const progress = (heat - H_meltStart) / H_FUSION;
    solidFraction = 1.0 - progress;
    liquidFraction = progress;
  } else if (heat < H_boilStart) {
    temp = substance.meltingPoint + (heat - H_meltEnd) / C_LIQUID;
    liquidFraction = 1.0;
  } else if (heat < H_boilEnd) {
    temp = substance.boilingPoint;
    const progress = (heat - H_boilStart) / H_VAPORIZATION;
    liquidFraction = 1.0 - progress;
    gasFraction = progress;
  } else {
    temp = substance.boilingPoint + (heat - H_boilEnd) / C_GAS;
    gasFraction = 1.0;
  }

  return { temp, solidFraction, liquidFraction, gasFraction, H_meltStart, H_boilStart };
}

export function initializeParticles(count: number, substance: SubstanceProperties): Particle[] {
  const particles: Particle[] = [];
  const spacing = substance.particleSize * 2.2;
  const cols = Math.floor(Math.sqrt(count));
  const rows = Math.ceil(count / cols);

  const startX = CANVAS_WIDTH / 2 - (cols * spacing) / 2;
  const startY = CANVAS_HEIGHT - 20 - (rows * spacing);

  let id = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (id >= count) break;
      const lx = startX + c * spacing;
      const ly = startY + r * spacing;
      particles.push({
        id,
        x: lx,
        y: ly,
        vx: 0,
        vy: 0,
        latticeX: lx,
        latticeY: ly,
        state: 'solid',
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
      id++;
    }
  }
  return particles;
}

export function updateParticles(
  particles: Particle[],
  substance: SubstanceProperties,
  temperature: number,
  solidFrac: number,
  liquidFrac: number,
  gasFrac: number,
  dt: number = 1
) {
  const N = particles.length;

  // Target counts derived from fractions. We reassign by adjusting state of the
  // *minimum number of particles needed* per tick to match the targets, so
  // most particles keep their state across frames (no flickering).
  const targetSolid = Math.round(N * solidFrac);
  const targetGas = Math.round(N * gasFrac);
  const targetLiquid = N - targetSolid - targetGas;

  // Count current states
  let curSolid = 0, curLiquid = 0, curGas = 0;
  for (const p of particles) {
    if (p.state === 'solid') curSolid++;
    else if (p.state === 'liquid') curLiquid++;
    else curGas++;
  }

  const tRatio = Math.max(0.1, temperature / Math.max(1, substance.meltingPoint));
  const baseJiggle = 0.5 * tRatio;
  const P_SIZE = substance.particleSize;

  // Phase transitions: step at most a few particles per tick toward target.
  // This prevents flicker and looks like gradual melting/boiling.
  // Heating: solid → liquid → gas (lowest-y particles boil/melt first: those at top of pile)
  // Cooling: gas → liquid → solid (highest-y "fallen" particles condense first)

  // SOLID → LIQUID (melting): too many solids
  while (curSolid > targetSolid && curLiquid < targetLiquid + (curSolid - targetSolid)) {
    // Pick the solid with the highest Y (top of the pile, easiest to melt)
    let topIdx = -1;
    let topY = Infinity;
    for (let i = 0; i < N; i++) {
      if (particles[i].state === 'solid' && particles[i].y < topY) {
        topY = particles[i].y;
        topIdx = i;
      }
    }
    if (topIdx === -1) break;
    const p = particles[topIdx];
    p.state = 'liquid';
    p.vx += (Math.random() - 0.5) * 1.5;
    p.vy += (Math.random() - 0.5) * 1.5;
    curSolid--;
    curLiquid++;
  }

  // LIQUID → SOLID (freezing): too few solids.
  // On freeze, reassign the particle's lattice slot to the closest unoccupied
  // one (so the crystal nucleates near where freezing happens), then hard-snap
  // position to that slot: atoms locking into a lattice.
  while (curSolid < targetSolid && curLiquid > 0) {
    // Pick the liquid with highest Y (lowest in vessel: bottom of liquid pool freezes first)
    let bottomIdx = -1;
    let bottomY = -Infinity;
    for (let i = 0; i < N; i++) {
      if (particles[i].state === 'liquid' && particles[i].y > bottomY) {
        bottomY = particles[i].y;
        bottomIdx = i;
      }
    }
    if (bottomIdx === -1) break;
    const p = particles[bottomIdx];

    // Build the set of lattice slots already claimed by solid particles.
    const occupied = new Set<string>();
    for (let i = 0; i < N; i++) {
      if (i === bottomIdx) continue;
      if (particles[i].state === 'solid') {
        occupied.add(`${particles[i].latticeX},${particles[i].latticeY}`);
      }
    }

    // Find the closest unoccupied slot among all particles' lattice positions.
    let bestOwner = -1;
    let bestDistSq = Infinity;
    for (let i = 0; i < N; i++) {
      const key = `${particles[i].latticeX},${particles[i].latticeY}`;
      if (occupied.has(key)) continue;
      const dx = particles[i].latticeX - p.x;
      const dy = particles[i].latticeY - p.y;
      const dsq = dx * dx + dy * dy;
      if (dsq < bestDistSq) {
        bestDistSq = dsq;
        bestOwner = i;
      }
    }

    // Swap lattice assignments with the slot's current owner (if not p itself).
    if (bestOwner !== -1 && bestOwner !== bottomIdx) {
      const tmpX = p.latticeX;
      const tmpY = p.latticeY;
      p.latticeX = particles[bestOwner].latticeX;
      p.latticeY = particles[bestOwner].latticeY;
      particles[bestOwner].latticeX = tmpX;
      particles[bestOwner].latticeY = tmpY;
    }

    // Snap into the lattice: crystallization.
    p.x = p.latticeX;
    p.y = p.latticeY;
    p.vx = 0;
    p.vy = 0;
    p.state = 'solid';
    curLiquid--;
    curSolid++;
  }

  // LIQUID → GAS (boiling): too few gas particles
  while (curGas < targetGas && curLiquid > 0) {
    // Pick the liquid with the lowest Y (top of liquid surface boils off first)
    let topIdx = -1;
    let topY = Infinity;
    for (let i = 0; i < N; i++) {
      if (particles[i].state === 'liquid' && particles[i].y < topY) {
        topY = particles[i].y;
        topIdx = i;
      }
    }
    if (topIdx === -1) break;
    const p = particles[topIdx];
    p.state = 'gas';
    // Scatter anywhere in the vessel: gas fills the whole container
    p.x = P_SIZE + Math.random() * (CANVAS_WIDTH - P_SIZE * 2);
    p.y = P_SIZE + Math.random() * (CANVAS_HEIGHT - P_SIZE * 2);
    const speedScale = Math.min(2, Math.max(0.5, temperature / Math.max(1, substance.boilingPoint)));
    const gasSpeed = (1.0 + Math.random() * 1.5) * speedScale;
    const angle = Math.random() * Math.PI * 2;
    p.vx = Math.cos(angle) * gasSpeed;
    p.vy = Math.sin(angle) * gasSpeed;
    curLiquid--;
    curGas++;
  }

  // GAS → LIQUID (condensing): too many gas particles
  while (curGas > targetGas && curLiquid < targetLiquid + (curGas - targetGas)) {
    // Pick any gas particle (random: condensation drops appear randomly)
    let gasIdx = -1;
    for (let i = 0; i < N; i++) {
      if (particles[i].state === 'gas') { gasIdx = i; break; }
    }
    if (gasIdx === -1) break;
    const p = particles[gasIdx];
    p.state = 'liquid';
    // Drop it near the bottom of the liquid pool
    p.y = CANVAS_HEIGHT - P_SIZE * 2 - Math.random() * P_SIZE * 4;
    p.x = P_SIZE + Math.random() * (CANVAS_WIDTH - P_SIZE * 2);
    p.vx *= 0.3;
    p.vy = Math.abs(p.vy) * 0.3; // falling
    curGas--;
    curLiquid++;
  }

  // Per-particle physics
  for (let i = 0; i < N; i++) {
    const p = particles[i];

    if (p.state === 'solid') {
      // Spring back to lattice
      const dx = p.latticeX - p.x;
      const dy = p.latticeY - p.y;
      p.vx += dx * 0.1;
      p.vy += dy * 0.1;
      p.vx *= 0.8;
      p.vy *= 0.8;
      p.x += (Math.random() - 0.5) * baseJiggle * 2;
      p.y += (Math.random() - 0.5) * baseJiggle * 2;
      p.rotationSpeed = baseJiggle * 0.02;

    } else if (p.state === 'liquid') {
      p.vy += 0.2; // gravity
      p.vx += (Math.random() - 0.5) * baseJiggle;
      p.vy += (Math.random() - 0.5) * baseJiggle;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.rotationSpeed = (Math.random() - 0.5) * baseJiggle * 0.05;

    } else { // gas: ideal gas: ballistic motion, no per-tick jiggle, no damping
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      p.rotationSpeed = speed * 0.01 * (p.id % 2 === 0 ? 1 : -1);
    }

    // Update rotation
    p.rotation += p.rotationSpeed;

    // Apply velocity (solids use spring force, all others ballistic)
    if (p.state !== 'solid') {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    // Wall collisions
    if (p.x < P_SIZE) {
      p.x = P_SIZE;
      p.vx = Math.abs(p.vx);
    } else if (p.x > CANVAS_WIDTH - P_SIZE) {
      p.x = CANVAS_WIDTH - P_SIZE;
      p.vx = -Math.abs(p.vx);
    }

    if (p.y < P_SIZE) {
      p.y = P_SIZE;
      p.vy = Math.abs(p.vy);
    } else if (p.y > CANVAS_HEIGHT - P_SIZE) {
      p.y = CANVAS_HEIGHT - P_SIZE;
      // Gas: fully elastic. Liquid: small energy loss. Solid: not applicable (uses lattice).
      p.vy = p.state === 'gas' ? -Math.abs(p.vy) : -Math.abs(p.vy) * 0.7;
    }
  }

  // Elastic collisions between non-solid particles (liquid-liquid, gas-gas, liquid-gas).
  // Equal-mass simplification: swap the normal component of velocity. Solid particles
  // are excluded: they oscillate around lattice sites and use spring forces instead.
  const minDist = P_SIZE * 2;
  const minDistSq = minDist * minDist;
  for (let i = 0; i < N; i++) {
    if (particles[i].state === 'solid') continue;
    for (let j = i + 1; j < N; j++) {
      if (particles[j].state === 'solid') continue;
      const a = particles[i];
      const b = particles[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < minDistSq && distSq > 0.01) {
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;

        // Push apart so they don't overlap visually
        const overlap = minDist - dist;
        a.x -= nx * overlap * 0.5;
        a.y -= ny * overlap * 0.5;
        b.x += nx * overlap * 0.5;
        b.y += ny * overlap * 0.5;

        // Elastic collision along the contact normal: only when approaching
        const dvx = a.vx - b.vx;
        const dvy = a.vy - b.vy;
        const dot = dvx * nx + dvy * ny;
        if (dot > 0) {
          a.vx -= dot * nx;
          a.vy -= dot * ny;
          b.vx += dot * nx;
          b.vy += dot * ny;
        }
      }
    }
  }
}
