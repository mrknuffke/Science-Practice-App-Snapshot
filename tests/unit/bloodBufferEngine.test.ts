import { describe, it, expect } from 'vitest';
import {
  calculateBloodPH,
  classifyBloodStatus,
  getLeChatelierShift,
} from '../../components/simulations/bloodBuffer/bloodBufferEngine';
import {
  BLOOD_BUFFER_CHALLENGES,
  verifyBloodBufferChallenge,
} from '../../components/simulations/bloodBuffer/bloodBufferChallenges';

describe('Blood Buffer Engine & Homeostatic Dynamics', () => {
  describe('calculateBloodPH', () => {
    it('yields baseline 7.40 at normal resting conditions (respRate=14, acid=0, buffered)', () => {
      const ph = calculateBloodPH({
        respRate: 14,
        metabolicAcid: 0,
        isBuffered: true,
        isRebreathing: false,
      });
      expect(ph).toBe(7.4);
    });

    it('hyperventilation (respRate=32) raises pH into alkalosis', () => {
      const ph = calculateBloodPH({
        respRate: 32,
        metabolicAcid: 0,
        isBuffered: true,
        isRebreathing: false,
      });
      expect(ph).toBeGreaterThan(7.55);
    });

    it('hypoventilation (respRate=5) lowers pH into acidosis', () => {
      const ph = calculateBloodPH({
        respRate: 5,
        metabolicAcid: 0,
        isBuffered: true,
        isRebreathing: false,
      });
      expect(ph).toBeLessThan(7.35);
    });

    it('rebreathing mask caps effective respiratory rate to normal baseline', () => {
      const phWithMask = calculateBloodPH({
        respRate: 32,
        metabolicAcid: 0,
        isBuffered: true,
        isRebreathing: true,
      });
      expect(phWithMask).toBe(7.4);
    });

    it('unbuffered saline exhibits massive catastrophic pH swings', () => {
      const phUnbuffered = calculateBloodPH({
        respRate: 14,
        metabolicAcid: 2,
        isBuffered: false,
        isRebreathing: false,
      });
      // 7.4 - 2 * 0.04 * 8.5 = 7.4 - 0.68 = 6.72 -> clamped to 6.8
      expect(phUnbuffered).toBe(6.8);
    });
  });

  describe('classifyBloodStatus', () => {
    it('classifies 7.40 as normal', () => {
      const res = classifyBloodStatus(7.4);
      expect(res.status).toBe('normal');
    });

    it('classifies 7.20 as acidosis', () => {
      const res = classifyBloodStatus(7.2);
      expect(res.status).toBe('acidosis');
    });

    it('classifies 6.95 as severe_acidosis', () => {
      const res = classifyBloodStatus(6.95);
      expect(res.status).toBe('severe_acidosis');
    });

    it('classifies 7.55 as alkalosis', () => {
      const res = classifyBloodStatus(7.55);
      expect(res.status).toBe('alkalosis');
    });

    it('classifies 7.85 as severe_alkalosis', () => {
      const res = classifyBloodStatus(7.85);
      expect(res.status).toBe('severe_alkalosis');
    });
  });

  describe('getLeChatelierShift', () => {
    it('shifts right under acidosis (CO2 accumulation or excess H+)', () => {
      expect(getLeChatelierShift(6, 0, 7.25)).toBe('right');
    });

    it('shifts left under alkalosis (CO2 blowoff)', () => {
      expect(getLeChatelierShift(30, 0, 7.55)).toBe('left');
    });

    it('remains balanced in normal homeostatic window', () => {
      expect(getLeChatelierShift(14, 0, 7.4)).toBe('balanced');
    });
  });

  describe('verifyBloodBufferChallenge', () => {
    it('fails if no clinical diagnosis is selected', () => {
      const challenge = BLOOD_BUFFER_CHALLENGES[0];
      const res = verifyBloodBufferChallenge(challenge, challenge.start, '');
      expect(res.success).toBe(false);
      expect(res.message).toContain('select a clinical diagnosis');
    });

    it('fails if diagnosis is incorrect', () => {
      const challenge = BLOOD_BUFFER_CHALLENGES[0];
      const res = verifyBloodBufferChallenge(challenge, challenge.start, 'respiratory_alkalosis');
      expect(res.success).toBe(false);
      expect(res.message).toContain('Diagnosis mismatch');
    });

    it('fails if diagnosis is correct but patient pH is still uncompensated', () => {
      const challenge = BLOOD_BUFFER_CHALLENGES[0]; // DKA start has pH 7.24
      const res = verifyBloodBufferChallenge(challenge, challenge.start, challenge.expectedDiagnosis);
      expect(res.success).toBe(false);
      expect(res.message).toContain('Your diagnosis of metabolic acidosis is spot on, but arterial pH is still');
    });

    it('succeeds when both diagnosis and physiological compensation targets are met', () => {
      const challenge = BLOOD_BUFFER_CHALLENGES[0];
      const res = verifyBloodBufferChallenge(
        challenge,
        challenge.solutionSetup,
        challenge.solutionSetup.diagnosis
      );
      expect(res.success).toBe(true);
      expect(res.message).toContain('You diagnosed metabolic acidosis correctly');
    });
  });
});
