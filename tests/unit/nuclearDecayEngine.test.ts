import { describe, it, expect } from 'vitest';
import { calculateDecay, calculateAgeFromPercent } from '../../components/simulations/nuclearDecay/nuclearDecayEngine';
import {
  NUCLEAR_CHALLENGES,
  verifyNuclearChallenge,
} from '../../components/simulations/nuclearDecay/nuclearDecayChallenges';

describe('Nuclear Decay Engine & Radiometric Dating', () => {
  describe('calculateDecay', () => {
    it('accurately calculates 1 half-life (50% parent, 50% daughter)', () => {
      const res = calculateDecay(5730, 1.0);
      expect(res.parentPercent).toBe(50);
      expect(res.daughterPercent).toBe(50);
      expect(res.parentCount).toBe(50);
      expect(res.realTime).toBe(5730);
    });

    it('accurately calculates 2 half-lives (25% parent, 75% daughter)', () => {
      const res = calculateDecay(5730, 2.0);
      expect(res.parentPercent).toBe(25);
      expect(res.daughterPercent).toBe(75);
      expect(res.parentCount).toBe(25);
      expect(res.realTime).toBe(11460);
    });

    it('accurately calculates 3 half-lives (12.5% parent, 87.5% daughter)', () => {
      const res = calculateDecay(8.02, 3.0);
      expect(res.parentPercent).toBeCloseTo(12.5, 3);
      expect(res.daughterPercent).toBeCloseTo(87.5, 3);
      expect(res.parentCount).toBe(13);
      expect(res.realTime).toBeCloseTo(24.06, 2);
    });
  });

  describe('calculateAgeFromPercent', () => {
    it('returns null for impossible percentages (<=0 or >=100)', () => {
      expect(calculateAgeFromPercent(5730, 0)).toBeNull();
      expect(calculateAgeFromPercent(5730, 100)).toBeNull();
      expect(calculateAgeFromPercent(5730, -5)).toBeNull();
    });

    it('calculates elapsed half-lives and age for 50% remaining', () => {
      const res = calculateAgeFromPercent(5730, 50);
      expect(res).not.toBeNull();
      expect(res!.nHalfLives).toBeCloseTo(1.0, 4);
      expect(res!.age).toBeCloseTo(5730, 1);
    });

    it('calculates elapsed half-lives and age for 25% remaining', () => {
      const res = calculateAgeFromPercent(5730, 25);
      expect(res).not.toBeNull();
      expect(res!.nHalfLives).toBeCloseTo(2.0, 4);
      expect(res!.age).toBeCloseTo(11460, 1);
    });
  });

  describe('verifyNuclearChallenge', () => {
    it('fails if radioisotope is mismatched', () => {
      const challenge = NUCLEAR_CHALLENGES[0]; // requires C14
      const res = verifyNuclearChallenge(challenge, 'U238', 1.0, '5730');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Isotope mismatch');
    });

    it('fails if calculated age is outside tolerance', () => {
      const challenge = NUCLEAR_CHALLENGES[0]; // expects 5730
      const res = verifyNuclearChallenge(challenge, 'C14', 1.0, '2000');
      expect(res.success).toBe(false);
      expect(res.message).toContain('outside tolerance');
    });

    it('fails if age is correct but slider is not aligned to the measured percentage', () => {
      const challenge = NUCLEAR_CHALLENGES[0]; // 50% requires halfLives ~ 1.0
      const res = verifyNuclearChallenge(challenge, 'C14', 0.0, '5730');
      expect(res.success).toBe(false);
      expect(res.message).toContain('adjust the elapsed half-life slider');
    });

    it('succeeds when isotope, age calculation, and decay slider are all aligned', () => {
      const challenge = NUCLEAR_CHALLENGES[0];
      const res = verifyNuclearChallenge(
        challenge,
        challenge.solutionSetup.isotopeKey,
        challenge.solutionSetup.halfLives,
        String(challenge.solutionSetup.userAge)
      );
      expect(res.success).toBe(true);
      expect(res.message).toContain('You dated the artifact to');
    });
  });
});
