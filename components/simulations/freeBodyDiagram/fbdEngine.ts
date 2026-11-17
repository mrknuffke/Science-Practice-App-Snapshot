import { FbdForce, FbdScenario, FbdVerifyResult, FbdTargetAcceleration } from '../../../types';
import { ANGLE_TOLERANCE_DEG } from './fbdConstants';

export interface NetForceResult {
  fx: number;
  fy: number;
  magnitude: number;
  angleDeg: number;
}

export function computeNetForce(forces: FbdForce[]): NetForceResult {
  let fx = 0;
  let fy = 0;
  for (const f of forces) {
    const rad = (f.angle * Math.PI) / 180;
    fx += f.magnitude * Math.cos(rad);
    fy += f.magnitude * Math.sin(rad);
  }
  const magnitude = Math.sqrt(fx * fx + fy * fy);
  const angleDeg = ((Math.atan2(fy, fx) * 180) / Math.PI + 360) % 360;
  return { fx, fy, magnitude, angleDeg };
}

export function getFxFy(force: FbdForce): { fx: number; fy: number } {
  const rad = (force.angle * Math.PI) / 180;
  return {
    fx: force.magnitude * Math.cos(rad),
    fy: force.magnitude * Math.sin(rad),
  };
}

// Normalise angle to [0, 360)
export function normalizeAngle(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

export function angleDiff(a: number, b: number): number {
  const diff = Math.abs(normalizeAngle(a) - normalizeAngle(b));
  return Math.min(diff, 360 - diff);
}

export function verifyNetForceState(
  net: NetForceResult,
  target: FbdTargetAcceleration,
  inclineAngle: number = 0
): { satisfied: boolean; feedback: string } {
  const TOLERANCE_EQUILIBRIUM = 12; // Net force <= 12 N considered equilibrium
  const MIN_ACCEL_FORCE = 15; // Net force >= 15 N considered accelerating

  switch (target.state) {
    case 'equilibrium': {
      if (net.magnitude <= TOLERANCE_EQUILIBRIUM) {
        return {
          satisfied: true,
          feedback: `Equilibrium verified: Net force is ${net.magnitude.toFixed(1)} N (≈ 0 N). The object has zero net acceleration.`,
        };
      }
      return {
        satisfied: false,
        feedback: `Equilibrium violation: All forces must balance to zero net force (ΣF = 0). Current net force is ${net.magnitude.toFixed(1)} N pointing at ${net.angleDeg.toFixed(0)}°.`,
      };
    }

    case 'accelerating_right': {
      if (net.fx >= MIN_ACCEL_FORCE && Math.abs(net.fy) <= TOLERANCE_EQUILIBRIUM) {
        return {
          satisfied: true,
          feedback: `Horizontal acceleration verified: Net force is directed to the right (+x direction, Fx = ${net.fx.toFixed(1)} N).`,
        };
      }
      return {
        satisfied: false,
        feedback: `Net force must point rightwards (Fx > 0) with vertical forces balanced. Current Fx = ${net.fx.toFixed(1)} N, Fy = ${net.fy.toFixed(1)} N.`,
      };
    }

    case 'accelerating_left': {
      if (net.fx <= -MIN_ACCEL_FORCE && Math.abs(net.fy) <= TOLERANCE_EQUILIBRIUM) {
        return {
          satisfied: true,
          feedback: `Horizontal acceleration verified: Net force is directed to the left (-x direction, Fx = ${net.fx.toFixed(1)} N).`,
        };
      }
      return {
        satisfied: false,
        feedback: `Net force must point leftwards (Fx < 0) with vertical forces balanced. Current Fx = ${net.fx.toFixed(1)} N, Fy = ${net.fy.toFixed(1)} N.`,
      };
    }

    case 'accelerating_up': {
      if (net.fy >= MIN_ACCEL_FORCE && Math.abs(net.fx) <= TOLERANCE_EQUILIBRIUM) {
        return {
          satisfied: true,
          feedback: `Upward acceleration verified: Net upward force (Fy = ${net.fy.toFixed(1)} N) exceeds opposing forces.`,
        };
      }
      return {
        satisfied: false,
        feedback: `Net force must point upward (Fy > 0) with horizontal forces balanced. Upward forces (e.g. Normal or Tension) must exceed gravity. Current Fy = ${net.fy.toFixed(1)} N.`,
      };
    }

    case 'accelerating_down': {
      if (net.fy <= -MIN_ACCEL_FORCE && Math.abs(net.fx) <= TOLERANCE_EQUILIBRIUM) {
        return {
          satisfied: true,
          feedback: `Downward acceleration verified: Net downward force (Fy = ${net.fy.toFixed(1)} N) drives downward acceleration.`,
        };
      }
      return {
        satisfied: false,
        feedback: `Net force must point downward (Fy < 0). Current Fy = ${net.fy.toFixed(1)} N.`,
      };
    }

    case 'down_incline': {
      // Incline slopes up-right at angle inclineAngle (e.g. 30°). Down the ramp points towards bottom-left (180° + inclineAngle).
      const expectedAngle = normalizeAngle(180 + inclineAngle);
      const diff = angleDiff(net.angleDeg, expectedAngle);
      if (net.magnitude >= MIN_ACCEL_FORCE && diff <= 35) {
        return {
          satisfied: true,
          feedback: `Incline acceleration verified: Net force of ${net.magnitude.toFixed(1)} N is directed down the ${inclineAngle}° slope (~${expectedAngle}°).`,
        };
      }
      return {
        satisfied: false,
        feedback: `Net force must be directed down the incline (~${expectedAngle}°). Current net force is ${net.magnitude.toFixed(1)} N at ${net.angleDeg.toFixed(0)}°.`,
      };
    }

    case 'up_incline': {
      const expectedAngle = normalizeAngle(inclineAngle);
      const diff = angleDiff(net.angleDeg, expectedAngle);
      if (net.magnitude >= MIN_ACCEL_FORCE && diff <= 35) {
        return {
          satisfied: true,
          feedback: `Incline acceleration verified: Net force of ${net.magnitude.toFixed(1)} N is directed up the ${inclineAngle}° slope (~${expectedAngle}°).`,
        };
      }
      return {
        satisfied: false,
        feedback: `Net force must be directed up the incline (~${expectedAngle}°). Current net force is ${net.magnitude.toFixed(1)} N at ${net.angleDeg.toFixed(0)}°.`,
      };
    }

    default:
      return { satisfied: true, feedback: 'Acceleration state satisfied.' };
  }
}

export function verifyFbd(studentForces: FbdForce[], scenario: FbdScenario): FbdVerifyResult {
  const expected = scenario.expectedForces;
  const correct: FbdForce[] = [];
  const misdirected: FbdForce[] = [];
  const extra: FbdForce[] = [];
  const matchedExpected = new Set<number>();

  for (const sf of studentForces) {
    const matchIdx = expected.findIndex((ef, idx) => {
      if (matchedExpected.has(idx)) return false;
      return ef.type === sf.type;
    });

    if (matchIdx === -1) {
      extra.push(sf);
      continue;
    }

    const ef = expected[matchIdx];
    const diff = angleDiff(sf.angle, ef.angle);

    if (diff <= ANGLE_TOLERANCE_DEG) {
      correct.push(sf);
      matchedExpected.add(matchIdx);
    } else {
      misdirected.push(sf);
      matchedExpected.add(matchIdx);
    }
  }

  const missing = expected
    .filter((_, idx) => !matchedExpected.has(idx))
    .map(ef => ef.label);

  const netForce = computeNetForce(studentForces);
  let netForceSatisfied: boolean | undefined = undefined;
  let netForceFeedback: string | undefined = undefined;

  if (scenario.targetAcceleration && missing.length === 0 && misdirected.length === 0 && extra.length === 0) {
    const netCheck = verifyNetForceState(netForce, scenario.targetAcceleration, scenario.inclineAngle);
    netForceSatisfied = netCheck.satisfied;
    netForceFeedback = netCheck.feedback;
  }

  return {
    correct,
    missing,
    extra,
    misdirected,
    netForceSatisfied,
    netForceFeedback,
  };
}
