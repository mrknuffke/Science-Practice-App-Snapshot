/**
 * Particle window for the osmosis sim: a zoomed-in slice of membrane with the
 * bag solution on the left and the beaker on the right.
 *
 * Nothing pushes water toward the sugar. Every particle wanders at random. Two
 * things make the net flow, and both are real:
 *  - Sugar takes up room, so the sugary side has fewer free water molecules
 *    near each pore. Fewer arrivals per second means fewer crossings out.
 *  - Column height raises the pressure in the bag, so a water molecule that
 *    reaches a pore from the bag side crosses more often (and less often when
 *    the column sits below the beaker surface).
 *
 * The window is open at its outer edges: a side with too much water loses a
 * molecule off its far edge, and a side with too little gains one. That keeps
 * each side matched to the large volume it stands for.
 */

import { MembraneKind } from './osmosisEngine';

export const WINDOW_W = 600;
export const WINDOW_H = 180;
export const MEMBRANE_X = WINDOW_W / 2;
export const MEMBRANE_HALF = 6;
export const PORE_COUNT = 6;
export const PORE_HALF = 10;
export const WATER_R = 3;
export const SUGAR_R = 7;

/** Water slots per side when the side holds no sugar. */
const WATER_PER_SIDE = 64;
/** How strongly sugar reduces free water near the membrane. */
const FREE_WATER_FACTOR = 0.6;
/**
 * How strongly column height changes crossings out of the bag: the boost is
 * exp(PRESSURE_FACTOR × height in mm). Tuned so crossings balance at the
 * height where osmosisEngine says the column stops.
 */
const PRESSURE_FACTOR = 0.0048;
const SUGAR_PER_MOLAR = 12;
const BASE_ACCEPT = 0.5;
const LEAK_ACCEPT = 0.12;
const CROSSING_WINDOW_S = 10;

export type Side = 'bag' | 'beaker';
export type Kind = 'water' | 'sugar';

export interface Particle {
  kind: Kind;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface WindowInputs {
  bagConc: number;
  beakerConc: number;
  heightMm: number;
  membrane: MembraneKind;
}

export interface Crossing {
  t: number;
  into: boolean;
}

export interface ParticleWindow {
  particles: Particle[];
  crossings: Crossing[];
  clock: number;
}

const sideOf = (p: Particle): Side => (p.x < MEMBRANE_X ? 'bag' : 'beaker');

export const poreCentres = (): number[] =>
  Array.from({ length: PORE_COUNT }, (_, i) => ((i + 0.5) * WINDOW_H) / PORE_COUNT);

const inPore = (y: number, r: number): boolean =>
  poreCentres().some(c => Math.abs(y - c) <= PORE_HALF - r * 0.5);

const targetCounts = (conc: number): { water: number; sugar: number } => ({
  water: Math.round(WATER_PER_SIDE / (1 + FREE_WATER_FACTOR * conc)),
  sugar: Math.round(SUGAR_PER_MOLAR * conc),
});

const randomIn = (side: Side, edge = false): { x: number; y: number } => {
  const margin = SUGAR_R + 2;
  const y = margin + Math.random() * (WINDOW_H - 2 * margin);
  if (edge) return { x: side === 'bag' ? margin : WINDOW_W - margin, y };
  const lo = side === 'bag' ? margin : MEMBRANE_X + MEMBRANE_HALF + margin;
  const hi = side === 'bag' ? MEMBRANE_X - MEMBRANE_HALF - margin : WINDOW_W - margin;
  return { x: lo + Math.random() * (hi - lo), y };
};

const makeParticle = (kind: Kind, side: Side, edge = false): Particle => {
  const speed = kind === 'water' ? 1.6 : 0.6;
  return {
    kind,
    ...randomIn(side, edge),
    vx: (Math.random() - 0.5) * 2 * speed,
    vy: (Math.random() - 0.5) * 2 * speed,
  };
};

export function createWindow(inputs: WindowInputs): ParticleWindow {
  const particles: Particle[] = [];
  (['bag', 'beaker'] as Side[]).forEach(side => {
    const t = targetCounts(side === 'bag' ? inputs.bagConc : inputs.beakerConc);
    for (let i = 0; i < t.water; i++) particles.push(makeParticle('water', side));
    for (let i = 0; i < t.sugar; i++) particles.push(makeParticle('sugar', side));
  });
  return { particles, crossings: [], clock: 0 };
}

/** Keep each side near its target count by trading particles at the outer edge. */
function rebalance(win: ParticleWindow, side: Side, kind: Kind, target: number): void {
  const mine = win.particles.filter(p => p.kind === kind && sideOf(p) === side);
  if (mine.length > target) {
    const far = mine.reduce((a, b) => (side === 'bag' ? (b.x < a.x ? b : a) : b.x > a.x ? b : a));
    win.particles.splice(win.particles.indexOf(far), 1);
  } else if (mine.length < target) {
    win.particles.push(makeParticle(kind, side, true));
  }
}

/**
 * Advance one animation frame. `seconds` is real time since the last frame,
 * used only to age out the crossing tally.
 */
export function advanceWindow(win: ParticleWindow, inputs: WindowInputs, seconds: number): void {
  win.clock += seconds;
  const pressureBoost = Math.exp(PRESSURE_FACTOR * inputs.heightMm);

  for (const p of win.particles) {
    const maxV = p.kind === 'water' ? 1.8 : 0.7;
    const jitter = p.kind === 'water' ? 0.35 : 0.12;
    p.vx = Math.max(-maxV, Math.min(maxV, p.vx + (Math.random() - 0.5) * jitter));
    p.vy = Math.max(-maxV, Math.min(maxV, p.vy + (Math.random() - 0.5) * jitter));

    const r = p.kind === 'water' ? WATER_R : SUGAR_R;
    const before = sideOf(p);
    let nx = p.x + p.vx;
    const ny = p.y + p.vy;

    const enteringMembrane =
      (before === 'bag' && nx + r > MEMBRANE_X - MEMBRANE_HALF) ||
      (before === 'beaker' && nx - r < MEMBRANE_X + MEMBRANE_HALF);

    if (enteringMembrane) {
      let accept = 0;
      if (inPore(ny, r)) {
        if (p.kind === 'water') accept = before === 'bag' ? BASE_ACCEPT * pressureBoost : BASE_ACCEPT;
        else if (inputs.membrane === 'leaky') accept = LEAK_ACCEPT;
      }
      if (Math.random() < Math.min(1, accept)) {
        nx = before === 'bag' ? MEMBRANE_X + MEMBRANE_HALF + r + 1 : MEMBRANE_X - MEMBRANE_HALF - r - 1;
        if (p.kind === 'water') win.crossings.push({ t: win.clock, into: before === 'beaker' });
      } else {
        p.vx = -p.vx;
        nx = p.x;
      }
    }

    p.x = Math.max(r, Math.min(WINDOW_W - r, nx));
    p.y = ny;
    if (p.y < r || p.y > WINDOW_H - r) {
      p.vy = -p.vy;
      p.y = Math.max(r, Math.min(WINDOW_H - r, p.y));
    }
    if (p.x <= r || p.x >= WINDOW_W - r) p.vx = -p.vx;
  }

  const bag = targetCounts(inputs.bagConc);
  const beaker = targetCounts(inputs.beakerConc);
  rebalance(win, 'bag', 'water', bag.water);
  rebalance(win, 'beaker', 'water', beaker.water);
  rebalance(win, 'bag', 'sugar', bag.sugar);
  rebalance(win, 'beaker', 'sugar', beaker.sugar);

  const cutoff = win.clock - CROSSING_WINDOW_S;
  if (win.crossings.length && win.crossings[0].t < cutoff) {
    win.crossings = win.crossings.filter(c => c.t >= cutoff);
  }
}

export function crossingTally(win: ParticleWindow): { into: number; out: number } {
  let into = 0;
  for (const c of win.crossings) if (c.into) into++;
  return { into, out: win.crossings.length - into };
}
