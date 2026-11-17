import { describe, it, expect } from 'vitest';
import {
  calculateFiveNumberSummary,
  calculateHistogramBins,
  calculateDistributionStats,
} from '../../services/graphingEngine';

describe('Graphing Engine (services/graphingEngine.ts)', () => {
  describe('calculateFiveNumberSummary', () => {
    it('accurately computes 5-number summary and IQR for odd-length dataset', () => {
      // 9 items: [2, 4, 4, 5, 6, 7, 8, 8, 9]
      // median = 6
      // lowerHalf = [2, 4, 4, 5] -> median = 4
      // upperHalf = [7, 8, 8, 9] -> median = 8
      const data = [2, 4, 4, 5, 6, 7, 8, 8, 9];
      const summary = calculateFiveNumberSummary(data, 'Test Series');

      expect(summary.min).toBe(2);
      expect(summary.max).toBe(9);
      expect(summary.median).toBe(6);
      expect(summary.q1).toBe(4);
      expect(summary.q3).toBe(8);
      expect(summary.iqr).toBe(4);
      expect(summary.outliers).toHaveLength(0);
      expect(summary.sampleSize).toBe(9);
    });

    it('accurately computes 5-number summary for even-length dataset', () => {
      // 8 items: [10, 20, 30, 40, 50, 60, 70, 80]
      // median = (40 + 50) / 2 = 45
      // lowerHalf = [10, 20, 30, 40] -> median = (20 + 30) / 2 = 25
      // upperHalf = [50, 60, 70, 80] -> median = (60 + 70) / 2 = 65
      const data = [10, 20, 30, 40, 50, 60, 70, 80];
      const summary = calculateFiveNumberSummary(data);

      expect(summary.min).toBe(10);
      expect(summary.max).toBe(80);
      expect(summary.median).toBe(45);
      expect(summary.q1).toBe(25);
      expect(summary.q3).toBe(65);
      expect(summary.iqr).toBe(40);
    });

    it('identifies outliers beyond 1.5 * IQR Tukey fences', () => {
      // Normal values around 10-20, one high outlier 90, one low outlier -30
      const data = [10, 12, 14, 15, 16, 17, 18, 19, 20, 90, -30];
      const summary = calculateFiveNumberSummary(data);

      expect(summary.outliers).toContain(90);
      expect(summary.outliers).toContain(-30);
      expect(summary.lowerWhisker).toBeGreaterThanOrEqual(-30);
      expect(summary.upperWhisker).toBeLessThanOrEqual(90);
    });

    it('handles empty and single-element datasets gracefully', () => {
      const empty = calculateFiveNumberSummary([]);
      expect(empty.sampleSize).toBe(0);
      expect(empty.median).toBe(0);

      const single = calculateFiveNumberSummary([42]);
      expect(single.min).toBe(42);
      expect(single.max).toBe(42);
      expect(single.median).toBe(42);
      expect(single.sampleSize).toBe(1);
    });
  });

  describe('calculateHistogramBins', () => {
    it('creates accurate frequency bins whose counts sum to total samples', () => {
      const data = [1, 2, 2, 3, 3, 3, 4, 4, 5, 8, 9, 10, 12, 15, 18, 20];
      const { bins, stats } = calculateHistogramBins(data, 4);

      expect(bins).toHaveLength(4);
      const totalCount = bins.reduce((acc, b) => acc + b.count, 0);
      expect(totalCount).toBe(data.length);
      expect(stats.sampleSize).toBe(data.length);
      expect(stats.min).toBe(1);
      expect(stats.max).toBe(20);
    });

    it('calculates frequency percentage per bin', () => {
      const data = [10, 20, 30, 40];
      const { bins } = calculateHistogramBins(data, 2);

      const totalPercentage = bins.reduce((acc, b) => acc + b.frequencyPercentage, 0);
      expect(Math.round(totalPercentage)).toBe(100);
    });
  });

  describe('calculateDistributionStats', () => {
    it('computes mean, median, and sample standard deviation accurately', () => {
      // Data: [2, 4, 4, 4, 5, 5, 7, 9] -> sum = 40, mean = 5.0
      // squared diffs: (2-5)^2=9, (4-5)^2*3=3, (5-5)^2*2=0, (7-5)^2=4, (9-5)^2=16
      // sum squared = 32 / (8 - 1) = 32 / 7 = 4.5714 -> stdDev = sqrt(4.5714) = 2.14
      const data = [2, 4, 4, 4, 5, 5, 7, 9];
      const stats = calculateDistributionStats(data);

      expect(stats.mean).toBe(5);
      expect(stats.median).toBe(4.5);
      expect(stats.stdDev).toBeCloseTo(2.14, 1);
      expect(stats.sampleSize).toBe(8);
    });
  });
});
