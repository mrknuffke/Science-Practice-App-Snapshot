import { describe, it, expect } from 'vitest';
import {
  initialState,
  step,
  readout,
  OsmosisParams,
  PRESSURE_MM_PER_M,
} from '../../components/simulations/osmosis/osmosisEngine';
import {
  createWindow,
  advanceWindow,
  crossingTally,
  WindowInputs,
} from '../../components/simulations/osmosis/osmosisParticles';

const run = (bagConc: number, params: OsmosisParams, seconds: number) =>
  step(initialState(bagConc), params, seconds);

describe('osmometer model', () => {
  it('rises and levels off below the undiluted target when the bag is sugarier', () => {
    const params: OsmosisParams = { beakerConc: 0, tube: 'medium', membrane: 'ideal' };
    const early = run(0.8, params, 20);
    const late = run(0.8, params, 600);
    expect(early.heightMm).toBeGreaterThan(0);
    expect(late.heightMm).toBeGreaterThan(early.heightMm);
    // Dilution means it stops short of 0.8 × PRESSURE_MM_PER_M.
    expect(late.heightMm).toBeLessThan(0.8 * PRESSURE_MM_PER_M);
    expect(Math.abs(readout(late, params).rateMmPerMin)).toBeLessThan(0.05);
  });

  it('falls below the surface when the beaker is sugarier', () => {
    const params: OsmosisParams = { beakerConc: 0.6, tube: 'medium', membrane: 'ideal' };
    expect(run(0.1, params, 300).heightMm).toBeLessThan(-30);
  });

  it('moves no net water when both sides match', () => {
    const params: OsmosisParams = { beakerConc: 0.5, tube: 'medium', membrane: 'ideal' };
    expect(Math.abs(run(0.5, params, 300).heightMm)).toBeLessThan(1e-9);
  });

  it('a narrow tube gets near its final height sooner, and a wide tube dilutes the bag more', () => {
    const narrow = run(1, { beakerConc: 0, tube: 'narrow', membrane: 'ideal' }, 30);
    const wide = run(1, { beakerConc: 0, tube: 'wide', membrane: 'ideal' }, 30);
    expect(narrow.heightMm).toBeGreaterThan(wide.heightMm);
    const narrowEnd = run(1, { beakerConc: 0, tube: 'narrow', membrane: 'ideal' }, 2000);
    const wideEnd = run(1, { beakerConc: 0, tube: 'wide', membrane: 'ideal' }, 2000);
    expect(narrowEnd.heightMm).toBeGreaterThan(wideEnd.heightMm);
  });

  it('a leaky membrane rises, then falls back toward the surface', () => {
    const params: OsmosisParams = { beakerConc: 0, tube: 'medium', membrane: 'leaky' };
    let s = initialState(1);
    let peak = 0;
    for (let t = 0; t < 1500; t++) {
      s = step(s, params, 1);
      peak = Math.max(peak, s.heightMm);
    }
    expect(peak).toBeGreaterThan(30);
    expect(s.heightMm).toBeLessThan(peak / 4);
  });
});

describe('particle window', () => {
  const tally = (inputs: WindowInputs, frames: number) => {
    const win = createWindow(inputs);
    let into = 0;
    let out = 0;
    for (let i = 0; i < frames; i++) {
      advanceWindow(win, inputs, 1 / 60);
      if ((i + 1) % 600 === 0 || i === frames - 1) {
        const t = crossingTally(win);
        into += t.into;
        out += t.out;
      }
    }
    return { into, out, sugarLeft: win.particles.filter(p => p.kind === 'sugar' && p.x > 300).length };
  };

  it('shows more water crossing into a sugary bag than out, with no push toward the sugar', () => {
    const t = tally({ bagConc: 1, beakerConc: 0, heightMm: 0, membrane: 'ideal' }, 3000);
    expect(t.into).toBeGreaterThan(t.out);
  });

  it('keeps sugar on its own side when the membrane is ideal', () => {
    const t = tally({ bagConc: 1, beakerConc: 0, heightMm: 0, membrane: 'ideal' }, 600);
    expect(t.sugarLeft).toBe(0);
  });
});
