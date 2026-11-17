/**
 * Island biogeography engine (MacArthur and Wilson's equilibrium model).
 *
 * The mainland holds POOL bird species. Each species that is NOT on the island
 * arrives at rate i (per year); each species that IS on the island dies out
 * there at rate e (per year). Distance sets arrivals, area sets extinctions:
 *
 *   i = I0 * exp(-distance / D0)
 *   e = E0 * area^(-K)
 *
 * The count settles where arrivals balance losses: S* = POOL * i / (i + e).
 * Each species is followed one by one, so the count wobbles around S* and the
 * list of species keeps turning over.
 *
 * Calibration (one set of numbers with bio lesson 2b-2, Table 1):
 *   Krakatoa, 28 km2 and 40 km from the mainland  -> S* = 34 bird species
 *   Surtsey, 1.3 km2 and 32 km from the mainland  -> S* = 15 bird species
 * D0 is chosen (100 km); K and I0/E0 then follow from those two islands.
 * E0 sets the clock: Krakatoa gets most of the way to 34 in about 50 years.
 * Every other slider position is the same model, not data.
 */

export const POOL = 50;
export const D0 = 100;

export const KRAKATOA = { label: 'Krakatoa', area: 28, distance: 40, target: 34 };
export const SURTSEY = { label: 'Surtsey', area: 1.3, distance: 32, target: 15 };

/** i/e needed for an island to settle at `target` species. */
const ratioFor = (target: number) => target / (POOL - target);

// Solve for K and I0/E0 from the two islands.
export const K =
  (Math.log(ratioFor(KRAKATOA.target) / ratioFor(SURTSEY.target)) +
    (KRAKATOA.distance - SURTSEY.distance) / D0) /
  Math.log(KRAKATOA.area / SURTSEY.area);
const C = ratioFor(KRAKATOA.target) / (Math.pow(KRAKATOA.area, K) * Math.exp(-KRAKATOA.distance / D0));

// Krakatoa's i + e is 1/15 per year, so it is about 95% of the way there by 45 years.
const KRAKATOA_E = 1 / 15 / (1 + ratioFor(KRAKATOA.target));
export const E0 = KRAKATOA_E * Math.pow(KRAKATOA.area, K);
export const I0 = C * E0;

/** A land bridge lets mainland birds walk or hop across: arrivals this many times faster. */
export const BRIDGE_BOOST = 20;

export const AREA_MIN = 0.5;
export const AREA_MAX = 1000;
export const DIST_MIN = 1;
export const DIST_MAX = 500;

/** Years between model ticks. */
export const TICK_YEARS = 0.1;
/** Years averaged for the Record table. */
export const AVERAGE_YEARS = 100;

export const arrivalRate = (distance: number) => I0 * Math.exp(-distance / D0);
export const extinctionRate = (area: number) => E0 * Math.pow(area, -K);

export function equilibrium(area: number, distance: number, boost = 1): number {
  const i = arrivalRate(distance) * boost;
  const e = extinctionRate(area);
  return (POOL * i) / (i + e);
}

export type SpeciesEvent = 'arrived' | 'lost';

export interface IslandState {
  years: number;
  present: boolean[];          // one entry per mainland species
  lastEvent: Array<{ kind: SpeciesEvent; at: number } | null>;
  arrivals: number;            // counted since the run began
  losses: number;
  history: Array<{ t: number; s: number }>;  // one point per year
}

export const countOf = (st: IslandState) => st.present.filter(Boolean).length;

export function emptyIsland(): IslandState {
  return {
    years: 0,
    present: new Array(POOL).fill(false),
    lastEvent: new Array(POOL).fill(null),
    arrivals: 0,
    losses: 0,
    history: [{ t: 0, s: 0 }],
  };
}

/** A small seeded generator, so a test can repeat a run exactly. */
export function seeded(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The island while it was still joined to the mainland: each species is there
 * with the probability a land bridge would give. Used by "Cut off".
 */
export function joinedIsland(area: number, rand: () => number, years: number): IslandState {
  const p = equilibrium(area, 0, BRIDGE_BOOST) / POOL;
  const present = Array.from({ length: POOL }, () => rand() < p);
  const s = present.filter(Boolean).length;
  return {
    years,
    present,
    lastEvent: new Array(POOL).fill(null),
    arrivals: 0,
    losses: 0,
    history: [{ t: years, s }],
  };
}

const MAX_HISTORY = 600;

/** Advance the island by one tick. Returns a new state; the old one is not changed. */
export function tick(st: IslandState, area: number, distance: number, rand: () => number): IslandState {
  const pArrive = 1 - Math.exp(-arrivalRate(distance) * TICK_YEARS);
  const pLose = 1 - Math.exp(-extinctionRate(area) * TICK_YEARS);
  const years = Number((st.years + TICK_YEARS).toFixed(6));
  const present = st.present.slice();
  const lastEvent = st.lastEvent.slice();
  let { arrivals, losses } = st;
  for (let k = 0; k < POOL; k++) {
    if (present[k]) {
      if (rand() < pLose) { present[k] = false; lastEvent[k] = { kind: 'lost', at: years }; losses++; }
    } else if (rand() < pArrive) {
      present[k] = true; lastEvent[k] = { kind: 'arrived', at: years }; arrivals++;
    }
  }
  let history = st.history;
  const whole = Math.floor(years + 1e-6);
  if (whole > Math.floor(st.years + 1e-6)) {
    history = [...history, { t: whole, s: present.filter(Boolean).length }];
    if (history.length > MAX_HISTORY) history = history.filter((_, i) => i % 2 === 0 || i === history.length - 1);
  }
  return { years, present, lastEvent, arrivals, losses, history };
}

/** Wipe the island clean (a volcano), keeping the clock running. */
export function volcano(st: IslandState): IslandState {
  const lastEvent = st.present.map((p, k) => (p ? { kind: 'lost' as const, at: st.years } : st.lastEvent[k]));
  return {
    ...st,
    present: new Array(POOL).fill(false),
    lastEvent,
    history: [...st.history, { t: st.years, s: 0 }],
  };
}

/** Mean count over the last `span` years of history (or the whole run if shorter). */
export function recentAverage(st: IslandState, span = AVERAGE_YEARS): number {
  const from = st.years - span;
  const pts = st.history.filter(p => p.t >= from);
  if (!pts.length) return countOf(st);
  return pts.reduce((a, p) => a + p.s, 0) / pts.length;
}
