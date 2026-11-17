import { describe, it, expect } from 'vitest';
import {
  AREA_MAX, AREA_MIN, DIST_MAX, DIST_MIN, KRAKATOA, POOL, SURTSEY, BRIDGE_BOOST,
  countOf, emptyIsland, equilibrium, joinedIsland, recentAverage, seeded, tick, volcano,
} from '../../components/simulations/islandBiogeography/islandEngine';

const run = (area: number, distance: number, years: number, seed: number) => {
  let st = emptyIsland();
  const rand = seeded(seed);
  for (let k = 0; k < years * 10; k++) st = tick(st, area, distance, rand);
  return st;
};

describe('island biogeography engine', () => {
  // One set of numbers with bio lesson 2b-2, Table 1.
  it('settles Krakatoa on 34 and Surtsey on 15 bird species', () => {
    expect(equilibrium(KRAKATOA.area, KRAKATOA.distance)).toBeCloseTo(34, 6);
    expect(equilibrium(SURTSEY.area, SURTSEY.distance)).toBeCloseTo(15, 6);
  });

  it('a long run averages near the calibrated counts', () => {
    const k = [1, 2, 3, 4, 5].map(s => recentAverage(run(KRAKATOA.area, KRAKATOA.distance, 300, s)));
    const s = [1, 2, 3, 4, 5].map(seed => recentAverage(run(SURTSEY.area, SURTSEY.distance, 300, seed)));
    const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(Math.abs(mean(k) - 34)).toBeLessThan(2);
    expect(Math.abs(mean(s) - 15)).toBeLessThan(1.5);
  });

  it('bigger and nearer islands hold more species', () => {
    expect(equilibrium(280, 40)).toBeGreaterThan(equilibrium(28, 40));
    expect(equilibrium(28, 4)).toBeGreaterThan(equilibrium(28, 40));
  });

  it('stays inside 0 to POOL across the whole slider range', () => {
    for (const a of [AREA_MIN, 10, AREA_MAX]) for (const d of [DIST_MIN, 50, DIST_MAX]) {
      const st = run(a, d, 200, 9);
      for (const p of st.history) {
        expect(p.s).toBeGreaterThanOrEqual(0);
        expect(p.s).toBeLessThanOrEqual(POOL);
      }
    }
  });

  it('keeps turning species over once settled', () => {
    const st = run(KRAKATOA.area, KRAKATOA.distance, 400, 4);
    expect(st.arrivals).toBeGreaterThan(100);
    expect(st.losses).toBeGreaterThan(100);
  });

  it('trims its history on very long runs', () => {
    const st = run(SURTSEY.area, SURTSEY.distance, 3000, 2);
    expect(st.history.length).toBeLessThanOrEqual(601);
  });

  it('volcano empties the island and keeps the clock', () => {
    const st = run(KRAKATOA.area, KRAKATOA.distance, 100, 1);
    const after = volcano(st);
    expect(countOf(after)).toBe(0);
    expect(after.years).toBe(st.years);
  });

  it('a cut-off island starts above where it settles', () => {
    const joined = joinedIsland(5, seeded(3), 0);
    expect(equilibrium(5, 0, BRIDGE_BOOST)).toBeGreaterThan(45);
    expect(countOf(joined)).toBeGreaterThan(equilibrium(5, 150) + 20);
  });
});
