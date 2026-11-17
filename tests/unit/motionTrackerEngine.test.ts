import { describe, it, expect } from 'vitest';
import {
  calculateLinearRegression,
  calculateQuadraticRegression,
  computeKinematicPosition,
  generateGroundTruthPoints,
  verifyKinematicChallenge,
  Point,
} from '../../components/simulations/motionTracker/motionEngine';
import {
  GLIDER_SCENARIO,
  FREE_FALL_SCENARIO,
  RAMP_SCENARIO,
  PROJECTILE_SCENARIO,
} from '../../components/simulations/motionTracker/motionChallenges';

describe('Motion Tracker Engine & Mathematical Algorithms', () => {
  describe('calculateLinearRegression', () => {
    it('returns null if fewer than 3 points are supplied', () => {
      expect(calculateLinearRegression([])).toBeNull();
      expect(calculateLinearRegression([{ x: 1, y: 2 }])).toBeNull();
      expect(
        calculateLinearRegression([
          { x: 1, y: 2 },
          { x: 2, y: 4 },
        ])
      ).toBeNull();
    });

    it('accurately calculates slope, intercept, and R2 for a perfect linear dataset', () => {
      const data = [
        { x: 0, y: 1 },
        { x: 1, y: 3 },
        { x: 2, y: 5 },
        { x: 3, y: 7 },
      ]; // y = 2x + 1
      const res = calculateLinearRegression(data);
      expect(res).not.toBeNull();
      expect(res!.m).toBeCloseTo(2.0, 5);
      expect(res!.b).toBeCloseTo(1.0, 5);
      expect(res!.r2).toBeCloseTo(1.0, 4);
      expect(res!.fn(4)).toBeCloseTo(9.0, 5);
    });

    it('handles zero slope horizontal data correctly', () => {
      const data = [
        { x: 1, y: 5 },
        { x: 2, y: 5 },
        { x: 3, y: 5 },
      ];
      const res = calculateLinearRegression(data);
      expect(res).not.toBeNull();
      expect(res!.m).toBeCloseTo(0.0, 5);
      expect(res!.b).toBeCloseTo(5.0, 5);
      expect(res!.r2).toBe(1.0);
    });
  });

  describe('calculateQuadraticRegression', () => {
    it('returns null if fewer than 3 points are provided', () => {
      expect(calculateQuadraticRegression([{ x: 1, y: 1 }])).toBeNull();
    });

    it('accurately calculates quadratic coefficients for y = ax^2 + bx + c', () => {
      // y = 3x^2 - 2x + 4
      const data = [
        { x: 0, y: 4 },
        { x: 1, y: 5 }, // 3 - 2 + 4 = 5
        { x: 2, y: 12 }, // 12 - 4 + 4 = 12
        { x: 3, y: 25 }, // 27 - 6 + 4 = 25
      ];
      const res = calculateQuadraticRegression(data);
      expect(res).not.toBeNull();
      expect(res!.a).toBeCloseTo(3.0, 4);
      expect(res!.b).toBeCloseTo(-2.0, 4);
      expect(res!.c).toBeCloseTo(4.0, 4);
      expect(res!.r2).toBeCloseTo(1.0, 4);
    });

    it('accurately fits gravitational free fall y = -4.9 t^2', () => {
      const data = [
        { x: 0.1, y: -0.049 },
        { x: 0.2, y: -0.196 },
        { x: 0.3, y: -0.441 },
        { x: 0.4, y: -0.784 },
      ];
      const res = calculateQuadraticRegression(data);
      expect(res).not.toBeNull();
      expect(res!.a).toBeCloseTo(-4.9, 2);
      expect(res!.r2).toBeCloseTo(1.0, 3);
    });
  });

  describe('computeKinematicPosition', () => {
    it('computes exact position and velocity for constant velocity glider', () => {
      const state = computeKinematicPosition(GLIDER_SCENARIO, 1.0);
      expect(state.x).toBeCloseTo(1.5, 3);
      expect(state.y).toBeCloseTo(0.0, 3);
      expect(state.vx).toBeCloseTo(1.5, 3);
      expect(state.vy).toBeCloseTo(0.0, 3);
      expect(state.canvasX).toBeGreaterThan(GLIDER_SCENARIO.origin.x);
    });

    it('computes exact vertical displacement and velocity for free fall drop', () => {
      const state = computeKinematicPosition(FREE_FALL_SCENARIO, 0.4);
      // y = -0.5 * 9.8 * 0.16 = -0.784 m
      expect(state.y).toBeCloseTo(-0.784, 3);
      // vy = -9.8 * 0.4 = -3.92 m/s
      expect(state.vy).toBeCloseTo(-3.92, 3);
      // Inverted canvas Y means canvasY increases downwards
      expect(state.canvasY).toBeGreaterThan(FREE_FALL_SCENARIO.origin.y);
    });
  });

  describe('generateGroundTruthPoints', () => {
    it('produces an array of valid points spanning the scenario duration', () => {
      const points = generateGroundTruthPoints(GLIDER_SCENARIO, 0.04);
      expect(points.length).toBeGreaterThan(20);
      expect(points[0].t).toBe(0);
      expect(points[points.length - 1].t).toBeCloseTo(GLIDER_SCENARIO.duration, 1);
      points.forEach(p => {
        expect(p.canvasX).toBeGreaterThanOrEqual(0);
        expect(p.canvasY).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('verifyKinematicChallenge', () => {
    it('rejects if fewer than 6 points are recorded', () => {
      const points: Point[] = [
        { t: 0, x: 0, y: 0, canvasX: 0, canvasY: 0 },
        { t: 0.1, x: 0.15, y: 0, canvasX: 30, canvasY: 0 },
      ];
      const res = verifyKinematicChallenge('glider_const_v', points, 1.0 / 300);
      expect(res.success).toBe(false);
      expect(res.message).toContain('at least 6 to 8 frames');
    });

    it('verifies glider_const_v successfully with ground truth points', () => {
      const points = generateGroundTruthPoints(GLIDER_SCENARIO);
      const res = verifyKinematicChallenge('glider_const_v', points, GLIDER_SCENARIO.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('with near-zero acceleration');
    });

    it('fails glider_const_v if velocity is incorrect', () => {
      // Fake points with vx = 0.5 m/s instead of 1.5 m/s
      const points: Point[] = [];
      for (let i = 0; i < 10; i++) {
        const t = i * 0.05;
        points.push({
          t,
          x: 0.5 * t,
          y: 0,
          vx: 0.5,
          vy: 0,
          canvasX: 100 + i * 10,
          canvasY: 280,
        });
      }
      const res = verifyKinematicChallenge('glider_const_v', points, 1.0 / 300);
      expect(res.success).toBe(false);
      expect(res.message).toContain('Measured horizontal velocity is 0.50 m/s');
    });

    it('verifies free_fall_g successfully with ground truth points', () => {
      const points = generateGroundTruthPoints(FREE_FALL_SCENARIO);
      const res = verifyKinematicChallenge('free_fall_g', points, FREE_FALL_SCENARIO.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('gravitational acceleration');
    });

    it('verifies ramp_accel successfully with ground truth points', () => {
      const points = generateGroundTruthPoints(RAMP_SCENARIO);
      const res = verifyKinematicChallenge('ramp_accel', points, RAMP_SCENARIO.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('Measured acceleration');
    });

    it('verifies projectile_2d successfully with ground truth points', () => {
      const points = generateGroundTruthPoints(PROJECTILE_SCENARIO);
      const res = verifyKinematicChallenge('projectile_2d', points, PROJECTILE_SCENARIO.metersPerPixel);
      expect(res.success).toBe(true);
      expect(res.message).toContain('Demonstrated 2D independence');
    });
  });
});
