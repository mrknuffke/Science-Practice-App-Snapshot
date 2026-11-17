/**
 * Pure statistical calculation engine for advanced graphing
 * Supports Box & Whisker plots, Histograms, and distribution statistics.
 */

export interface BoxPlotSummary {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  iqr: number;
  lowerWhisker: number;
  upperWhisker: number;
  outliers: number[];
  label?: string;
  mean: number;
  sampleSize: number;
}

export interface HistogramBin {
  binLabel: string;
  x0: number;
  x1: number;
  count: number;
  frequencyPercentage: number;
}

export interface DistributionStats {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  sampleSize: number;
}

/**
 * Calculates median of a sorted array of numbers
 */
function getMedian(sorted: number[]): number {
  const n = sorted.length;
  if (n === 0) return 0;
  const mid = Math.floor(n / 2);
  if (n % 2 !== 0) {
    return sorted[mid];
  }
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculates a complete 5-number summary with Tukey fences for whiskers and outliers.
 */
export function calculateFiveNumberSummary(
  rawValues: number[],
  label?: string
): BoxPlotSummary {
  const values = rawValues.filter((v) => typeof v === 'number' && !isNaN(v));
  if (values.length === 0) {
    return {
      min: 0,
      q1: 0,
      median: 0,
      q3: 0,
      max: 0,
      iqr: 0,
      lowerWhisker: 0,
      upperWhisker: 0,
      outliers: [],
      label: label || 'Series',
      mean: 0,
      sampleSize: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0];
  const max = sorted[n - 1];
  const median = getMedian(sorted);

  // Divide into lower and upper halves to calculate Q1 and Q3
  const mid = Math.floor(n / 2);
  const lowerHalf = n % 2 === 0 ? sorted.slice(0, mid) : sorted.slice(0, mid);
  const upperHalf = n % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

  const q1 = lowerHalf.length > 0 ? getMedian(lowerHalf) : min;
  const q3 = upperHalf.length > 0 ? getMedian(upperHalf) : max;
  const iqr = q3 - q1;

  // Tukey fences: 1.5 * IQR
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  // Whiskers extend to the most extreme data points within fences
  const nonOutliers = sorted.filter((v) => v >= lowerFence && v <= upperFence);
  const lowerWhisker = nonOutliers.length > 0 ? nonOutliers[0] : q1;
  const upperWhisker = nonOutliers.length > 0 ? nonOutliers[nonOutliers.length - 1] : q3;

  const outliers = sorted.filter((v) => v < lowerFence || v > upperFence);

  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  return {
    min,
    q1,
    median,
    q3,
    max,
    iqr,
    lowerWhisker,
    upperWhisker,
    outliers,
    label: label || 'Series',
    mean: Number(mean.toFixed(2)),
    sampleSize: n,
  };
}

/**
 * Computes frequency bins for a histogram given a series of raw values.
 */
export function calculateHistogramBins(
  rawValues: number[],
  requestedBinCount?: number
): { bins: HistogramBin[]; stats: DistributionStats } {
  const values = rawValues.filter((v) => typeof v === 'number' && !isNaN(v));
  if (values.length === 0) {
    return {
      bins: [],
      stats: { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, sampleSize: 0 },
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const min = sorted[0];
  const max = sorted[n - 1];

  // Determine bin count via Sturges' rule if not specified
  const numBins = requestedBinCount && requestedBinCount >= 2
    ? requestedBinCount
    : Math.max(3, Math.min(12, Math.ceil(1 + Math.log2(n))));

  const range = max - min;
  const binWidth = range === 0 ? 1 : range / numBins;

  const bins: HistogramBin[] = [];

  for (let i = 0; i < numBins; i++) {
    const x0 = min + i * binWidth;
    const x1 = i === numBins - 1 ? max : min + (i + 1) * binWidth;
    const label = `${x0.toFixed(1)} - ${x1.toFixed(1)}`;

    // Match items in [x0, x1) except last bin which is [x0, x1]
    const count = sorted.filter((v) => {
      if (i === numBins - 1) {
        return v >= x0 && v <= x1;
      }
      return v >= x0 && v < x1;
    }).length;

    const frequencyPercentage = Number(((count / n) * 100).toFixed(1));

    bins.push({
      binLabel: label,
      x0: Number(x0.toFixed(2)),
      x1: Number(x1.toFixed(2)),
      count,
      frequencyPercentage,
    });
  }

  const stats = calculateDistributionStats(values);

  return { bins, stats };
}

/**
 * Computes central tendency and variability metrics for a sample.
 */
export function calculateDistributionStats(rawValues: number[]): DistributionStats {
  const values = rawValues.filter((v) => typeof v === 'number' && !isNaN(v));
  const n = values.length;
  if (n === 0) {
    return { mean: 0, median: 0, stdDev: 0, min: 0, max: 0, sampleSize: 0 };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[n - 1];
  const median = getMedian(sorted);
  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / n;

  // Sample standard deviation (Bessel's correction n - 1)
  let variance = 0;
  if (n > 1) {
    const squaredDiffs = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0);
    variance = squaredDiffs / (n - 1);
  }
  const stdDev = Math.sqrt(variance);

  return {
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    min,
    max,
    sampleSize: n,
  };
}
