import { describe, it, expect } from 'vitest';
import {
  createParticle,
  initGasState,
  stepGasLaws,
  computeMeanKE,
  getParticleColor,
} from '../../components/simulations/gasLaws/gasLawsEngine';
import { VESSEL_LEFT, VESSEL_RIGHT, VESSEL_BOTTOM, INITIAL_PISTON_Y } from '../../components/simulations/gasLaws/gasLawsConstants';
import { verifyGasLawsChallenge } from '../../components/simulations/gasLaws/gasLawsChallenges';

describe('gasLawsEngine', () => {
  it('creates particles within vessel horizontal bounds and below pistonY', () => {
    const pA = createParticle('A', INITIAL_PISTON_Y);
    expect(pA.type).toBe('A');
    expect(pA.mass).toBe(2);
    expect(pA.x).toBeGreaterThanOrEqual(VESSEL_LEFT);
    expect(pA.x).toBeLessThanOrEqual(VESSEL_RIGHT);
    expect(pA.y).toBeGreaterThanOrEqual(INITIAL_PISTON_Y);
    expect(pA.y).toBeLessThanOrEqual(VESSEL_BOTTOM);

    const pB = createParticle('B', INITIAL_PISTON_Y);
    expect(pB.type).toBe('B');
    expect(pB.mass).toBe(1);
    expect(pB.x).toBeGreaterThanOrEqual(VESSEL_LEFT);
    expect(pB.x).toBeLessThanOrEqual(VESSEL_RIGHT);
  });

  it('initializes gas state with requested particle populations', () => {
    const state = initGasState(INITIAL_PISTON_Y, 20, 15);
    expect(state.particles.length).toBe(35);
    expect(state.particles.filter((p) => p.type === 'A').length).toBe(20);
    expect(state.particles.filter((p) => p.type === 'B').length).toBe(15);
    expect(state.pistonY).toBe(INITIAL_PISTON_Y);
    expect(state.isBroken).toBe(false);
  });

  it('steps particle kinematics, updates kinetic energy, and accumulates temperature', () => {
    let state = initGasState(INITIAL_PISTON_Y, 10, 10);
    const initialMeanKE = computeMeanKE(state.particles);
    expect(initialMeanKE).toBeGreaterThan(0);

    // Step the simulation for several frames
    for (let i = 0; i < 20; i++) {
      state = stepGasLaws(state, INITIAL_PISTON_Y, 0, true);
    }
    expect(state.temperature).toBeGreaterThan(0);
    expect(state.totalPressure).toBeGreaterThanOrEqual(0);
  });

  it('increases particle kinetic energy and temperature when heatDelta > 0', () => {
    let state = initGasState(INITIAL_PISTON_Y, 15, 15);
    const t0 = computeMeanKE(state.particles);

    for (let i = 0; i < 30; i++) {
      state = stepGasLaws(state, INITIAL_PISTON_Y, 0.05, true);
    }
    const t1 = computeMeanKE(state.particles);
    expect(t1).toBeGreaterThan(t0);
  });

  it('respects indestructible vessel mode under extreme pressure', () => {
    let state = initGasState(INITIAL_PISTON_Y, 50, 50);
    // Indestructible true: should not break
    for (let i = 0; i < 15; i++) {
      state = stepGasLaws(state, INITIAL_PISTON_Y, 0.5, true);
    }
    expect(state.isBroken).toBe(false);
  });

  it('computes particle colors based on kinetic energy relative to mean', () => {
    const pA = createParticle('A', INITIAL_PISTON_Y);
    const colorA = getParticleColor(pA, 2.0);
    expect(colorA).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);

    const pB = createParticle('B', INITIAL_PISTON_Y);
    const colorB = getParticleColor(pB, 2.0);
    expect(colorB).toMatch(/rgb\(\d+,\s*\d+,\s*\d+\)/);
  });
});

describe('gasLawsChallenges verification', () => {
  it('correctly verifies Boyle isothermal compression challenge', () => {
    // Failing: too cold
    expect(
      verifyGasLawsChallenge('gas_boyle', {
        temperature: 250,
        totalPressure: 2.0,
        pressureA: 1.0,
        pressureB: 1.0,
        pistonY: 120,
        countA: 20,
        countB: 0,
      }).success
    ).toBe(false);

    // Failing: pressure too low
    expect(
      verifyGasLawsChallenge('gas_boyle', {
        temperature: 300,
        totalPressure: 1.5,
        pressureA: 1.5,
        pressureB: 0,
        pistonY: 180,
        countA: 20,
        countB: 0,
      }).success
    ).toBe(false);

    // Passing: isothermal and target pressure
    expect(
      verifyGasLawsChallenge('gas_boyle', {
        temperature: 300,
        totalPressure: 2.0,
        pressureA: 2.0,
        pressureB: 0,
        pistonY: 120,
        countA: 20,
        countB: 0,
      }).success
    ).toBe(true);
  });

  it('correctly verifies Charles isobaric expansion challenge', () => {
    // Failing: not heated enough
    expect(
      verifyGasLawsChallenge('gas_charles', {
        temperature: 380,
        totalPressure: 1.25,
        pressureA: 1.25,
        pressureB: 0,
        pistonY: 260,
        countA: 20,
        countB: 0,
      }).success
    ).toBe(false);

    // Passing: heated > 450K with pressure 1.0-1.5 atm
    expect(
      verifyGasLawsChallenge('gas_charles', {
        temperature: 475,
        totalPressure: 1.25,
        pressureA: 1.25,
        pressureB: 0,
        pistonY: 270,
        countA: 20,
        countB: 0,
      }).success
    ).toBe(true);
  });

  it('correctly verifies Gay-Lussac isochoric challenge', () => {
    // Failing: piston moved (violates constant volume)
    expect(
      verifyGasLawsChallenge('gas_gay_lussac', {
        temperature: 550,
        totalPressure: 2.6,
        pressureA: 2.6,
        pressureB: 0,
        pistonY: 130, // significantly changed from 200
        countA: 20,
        countB: 0,
      }).success
    ).toBe(false);

    // Passing: constant volume and P >= 2.5 atm
    expect(
      verifyGasLawsChallenge('gas_gay_lussac', {
        temperature: 550,
        totalPressure: 2.65,
        pressureA: 2.65,
        pressureB: 0,
        pistonY: INITIAL_PISTON_Y,
        countA: 20,
        countB: 0,
      }).success
    ).toBe(true);
  });

  it('correctly verifies Dalton equimolar partial pressures challenge', () => {
    // Failing: not enough particles
    expect(
      verifyGasLawsChallenge('gas_dalton', {
        temperature: 300,
        totalPressure: 1.8,
        pressureA: 0.9,
        pressureB: 0.9,
        pistonY: 180,
        countA: 20,
        countB: 20,
      }).success
    ).toBe(false);

    // Failing: unbalanced partial pressures
    expect(
      verifyGasLawsChallenge('gas_dalton', {
        temperature: 300,
        totalPressure: 2.0,
        pressureA: 1.5,
        pressureB: 0.5,
        pistonY: 180,
        countA: 35,
        countB: 35,
      }).success
    ).toBe(false);

    // Passing: balanced populations and equal partial pressures
    expect(
      verifyGasLawsChallenge('gas_dalton', {
        temperature: 300,
        totalPressure: 1.8,
        pressureA: 0.9,
        pressureB: 0.9,
        pistonY: 180,
        countA: 35,
        countB: 35,
      }).success
    ).toBe(true);
  });
});
