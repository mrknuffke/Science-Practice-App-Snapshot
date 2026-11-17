import { describe, it, expect } from 'vitest';
import {
  computeNetForce,
  getFxFy,
  verifyNetForceState,
  verifyFbd,
} from '../../components/simulations/freeBodyDiagram/fbdEngine';
import { FBD_SCENARIOS } from '../../components/simulations/freeBodyDiagram/fbdScenarios';
import { FbdForce } from '../../types';

describe('fbdEngine physics calculations', () => {
  it('computes zero net force for equal and opposite forces', () => {
    const forces: FbdForce[] = [
      { id: '1', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: '2', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
    ];
    const net = computeNetForce(forces);
    expect(net.magnitude).toBeLessThan(0.001);
    expect(Math.abs(net.fx)).toBeLessThan(0.001);
    expect(Math.abs(net.fy)).toBeLessThan(0.001);
  });

  it('computes positive horizontal net force when applied force exceeds friction', () => {
    const forces: FbdForce[] = [
      { id: '1', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: '2', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
      { id: '3', type: 'applied', label: 'Fa', angle: 0, magnitude: 100, color: '#6366f1' },
      { id: '4', type: 'friction_kinetic', label: 'Fk', angle: 180, magnitude: 40, color: '#f59e0b' },
    ];
    const net = computeNetForce(forces);
    expect(net.fx).toBeCloseTo(60, 1);
    expect(net.fy).toBeCloseTo(0, 1);
    expect(net.magnitude).toBeCloseTo(60, 1);
    expect(net.angleDeg).toBeCloseTo(0, 1);
  });

  it('computes upward vertical net force when tension exceeds gravity', () => {
    const forces: FbdForce[] = [
      { id: '1', type: 'gravity', label: 'Fg', angle: 270, magnitude: 60, color: '#ef4444' },
      { id: '2', type: 'tension', label: 'T', angle: 90, magnitude: 100, color: '#8b5cf6' },
    ];
    const net = computeNetForce(forces);
    expect(net.fx).toBeCloseTo(0, 1);
    expect(net.fy).toBeCloseTo(40, 1);
    expect(net.magnitude).toBeCloseTo(40, 1);
    expect(net.angleDeg).toBeCloseTo(90, 1);
  });

  it('decomposes individual force into Cartesian components via getFxFy', () => {
    const f: FbdForce = { id: '1', type: 'applied', label: 'Fa', angle: 30, magnitude: 100, color: '#6366f1' };
    const comps = getFxFy(f);
    expect(comps.fx).toBeCloseTo(86.6, 1);
    expect(comps.fy).toBeCloseTo(50.0, 1);
  });
});

describe('verifyNetForceState', () => {
  it('validates equilibrium when magnitude is below tolerance', () => {
    const res = verifyNetForceState(
      { fx: 2, fy: -1, magnitude: 2.23, angleDeg: 333 },
      { state: 'equilibrium', description: 'Zero net force' }
    );
    expect(res.satisfied).toBe(true);
    expect(res.feedback).toContain('Equilibrium verified');
  });

  it('rejects equilibrium when magnitude is too high', () => {
    const res = verifyNetForceState(
      { fx: 25, fy: 0, magnitude: 25, angleDeg: 0 },
      { state: 'equilibrium', description: 'Zero net force' }
    );
    expect(res.satisfied).toBe(false);
    expect(res.feedback).toContain('Equilibrium violation');
  });

  it('validates rightward horizontal acceleration state', () => {
    const res = verifyNetForceState(
      { fx: 40, fy: 2, magnitude: 40.05, angleDeg: 2.8 },
      { state: 'accelerating_right', description: 'Rightward acceleration' }
    );
    expect(res.satisfied).toBe(true);
  });

  it('validates upward vertical acceleration state', () => {
    const res = verifyNetForceState(
      { fx: 1, fy: 35, magnitude: 35.01, angleDeg: 88.3 },
      { state: 'accelerating_up', description: 'Upward acceleration' }
    );
    expect(res.satisfied).toBe(true);
  });

  it('validates downward incline acceleration state', () => {
    // 30° ramp: down the ramp is ~210°
    const res = verifyNetForceState(
      { fx: -26, fy: -15, magnitude: 30, angleDeg: 210 },
      { state: 'down_incline', description: 'Downhill acceleration' },
      30
    );
    expect(res.satisfied).toBe(true);
  });
});

describe('verifyFbd scenario matching', () => {
  const scenario = FBD_SCENARIOS.find(s => s.id === 'flat_pushed')!;

  it('detects missing forces', () => {
    const studentForces: FbdForce[] = [
      { id: '1', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: '2', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
    ];
    const res = verifyFbd(studentForces, scenario);
    expect(res.correct.length).toBe(2);
    expect(res.missing).toContain('Fa');
    expect(res.missing).toContain('Fk');
  });

  it('detects misdirected force angles', () => {
    const studentForces: FbdForce[] = [
      { id: '1', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: '2', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
      { id: '3', type: 'applied', label: 'Fa', angle: 90, magnitude: 100, color: '#6366f1' }, // wrong angle!
      { id: '4', type: 'friction_kinetic', label: 'Fk', angle: 180, magnitude: 40, color: '#f59e0b' },
    ];
    const res = verifyFbd(studentForces, scenario);
    expect(res.misdirected.length).toBe(1);
    expect(res.misdirected[0].label).toBe('Fa');
  });

  it('detects extra extraneous forces', () => {
    const studentForces: FbdForce[] = [
      { id: '1', type: 'gravity', label: 'Fg', angle: 270, magnitude: 80, color: '#ef4444' },
      { id: '2', type: 'normal', label: 'Fn', angle: 90, magnitude: 80, color: '#10b981' },
      { id: '3', type: 'applied', label: 'Fa', angle: 0, magnitude: 100, color: '#6366f1' },
      { id: '4', type: 'friction_kinetic', label: 'Fk', angle: 180, magnitude: 40, color: '#f59e0b' },
      { id: '5', type: 'tension', label: 'T', angle: 45, magnitude: 50, color: '#8b5cf6' }, // Extra!
    ];
    const res = verifyFbd(studentForces, scenario);
    expect(res.extra.length).toBe(1);
    expect(res.extra[0].label).toBe('T');
  });

  it('passes completely with acceleration state satisfied on scenario solution forces', () => {
    const res = verifyFbd(scenario.solutionForces!, scenario);
    expect(res.correct.length).toBe(scenario.expectedForces.length);
    expect(res.missing.length).toBe(0);
    expect(res.misdirected.length).toBe(0);
    expect(res.extra.length).toBe(0);
    expect(res.netForceSatisfied).toBe(true);
  });
});
