/**
 * Hardy-Weinberg Population Genetics Engine
 * Pure functions: no React dependencies.
 * Applies evolutionary forces each generation in biologically correct order:
 * Selection -> Drift (Wright-Fisher sampling) -> Mutation -> Gene Flow -> Inbreeding
 */

import { Genotype, HistoryPoint, HWParams, HWState } from './hwConstants';

// ─── Helpers ────────────────────────────────────────────────────────────────

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

/** Sample k successes from Binomial(n, p) using normal approximation for large n */
function binomialSample(n: number, p: number): number {
  if (n === 0) return 0;
  const clampedP = clamp(p, 0, 1);
  if (clampedP === 0) return 0;
  if (clampedP === 1) return n;
  // For small n use exact Bernoulli sum; for large n use normal approximation
  if (n <= 200) {
    let count = 0;
    for (let i = 0; i < n; i++) {
      if (Math.random() < clampedP) count++;
    }
    return count;
  }
  // Normal approximation: N(np, np(1-p))
  const mean = n * clampedP;
  const sd = Math.sqrt(n * clampedP * (1 - clampedP));
  // Box-Muller
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
  return Math.round(clamp(mean + sd * z, 0, n));
}

/** Build a Genotype[] of size N from allele frequency p */
function sampleGenotypes(N: number, p: number): Genotype[] {
  const result: Genotype[] = [];
  for (let i = 0; i < N; i++) {
    const a1 = Math.random() < p ? 'A' : 'a';
    const a2 = Math.random() < p ? 'A' : 'a';
    if (a1 === 'A' && a2 === 'A') result.push('AA');
    else if (a1 === 'a' && a2 === 'a') result.push('aa');
    else result.push('Aa');
  }
  return result;
}

function calcFreqs(individuals: Genotype[]): { AA: number; Aa: number; aa: number } {
  const n = individuals.length;
  if (n === 0) return { AA: 0, Aa: 0, aa: 0 };
  let AA = 0, Aa = 0, aa = 0;
  for (const g of individuals) {
    if (g === 'AA') AA++;
    else if (g === 'Aa') Aa++;
    else aa++;
  }
  return { AA: AA / n, Aa: Aa / n, aa: aa / n };
}

function calcP(freqs: { AA: number; Aa: number; aa: number }): number {
  return clamp(freqs.AA + 0.5 * freqs.Aa, 0, 1);
}

export function calcMeanFitness(
  freqs: { AA: number; Aa: number; aa: number },
  params: HWParams
): number {
  return freqs.AA * params.fitnessAA + freqs.Aa * params.fitnessAa + freqs.aa * params.fitnessaa;
}

export function calcHWExpected(p: number): { AA: number; Aa: number; aa: number } {
  const q = 1 - p;
  return { AA: p * p, Aa: 2 * p * q, aa: q * q };
}

// ─── Initialization ──────────────────────────────────────────────────────────

export function initPopulation(params: HWParams): HWState {
  const N = params.populationSize;
  const p = clamp(params.initialP, 0, 1);
  const individuals = sampleGenotypes(N, p);
  const genotypeFreqs = calcFreqs(individuals);
  const actualP = calcP(genotypeFreqs);
  const expected = calcHWExpected(actualP);
  const meanFitness = calcMeanFitness(genotypeFreqs, params);

  const firstPoint: HistoryPoint = {
    generation: 0,
    p: actualP,
    q: 1 - actualP,
    ...genotypeFreqs,
    expectedAA: expected.AA,
    expectedAa: expected.Aa,
    expectedaa: expected.aa,
    meanFitness,
  };

  return {
    generation: 0,
    p: actualP,
    q: 1 - actualP,
    genotypeFreqs,
    individuals,
    history: [firstPoint],
  };
}

// ─── Step ────────────────────────────────────────────────────────────────────

export function stepGeneration(state: HWState, params: HWParams): HWState {
  const N = params.populationSize;
  let p = state.p;
  let genotypeFreqs = { ...state.genotypeFreqs };

  // ── Phase 1: Natural Selection (viability selection on current genotype freqs) ──
  if (params.selectionEnabled) {
    const wBar = calcMeanFitness(genotypeFreqs, params);
    if (wBar > 0) {
      genotypeFreqs = {
        AA: (genotypeFreqs.AA * params.fitnessAA) / wBar,
        Aa: (genotypeFreqs.Aa * params.fitnessAa) / wBar,
        aa: (genotypeFreqs.aa * params.fitnessaa) / wBar,
      };
      p = calcP(genotypeFreqs);
    }
  }

  // ── Phase 2: Genetic Drift (Wright-Fisher sampling) ──
  // Always active: this IS the population size effect.
  // For very large N the variance approaches zero (≈ infinite pop).
  const numAAlleles = binomialSample(2 * N, p);
  p = clamp(numAAlleles / (2 * N), 0, 1);

  // ── Phase 3: Mutation ──
  if (params.mutationEnabled) {
    const mu = clamp(params.mutationForward, 0, 1);
    const nu = clamp(params.mutationBack, 0, 1);
    p = clamp(p * (1 - mu) + (1 - p) * nu, 0, 1);
  }

  // ── Phase 4: Gene Flow ──
  if (params.geneFlowEnabled) {
    const m = clamp(params.geneFlowRate, 0, 1);
    const pMig = clamp(params.geneFlowAlleleFreq, 0, 1);
    p = clamp((1 - m) * p + m * pMig, 0, 1);
  }

  // Check for fixation
  if (p <= 0) p = 0;
  if (p >= 1) p = 1;

  // ── Phase 5: Random mating → genotype frequencies ──
  // Start from Hardy-Weinberg expectation given p
  const q = 1 - p;
  genotypeFreqs = { AA: p * p, Aa: 2 * p * q, aa: q * q };

  // ── Phase 6: Non-Random Mating (Inbreeding) ──
  // Adjusts genotype freqs without changing p
  if (params.inbreedingEnabled) {
    const F = clamp(params.inbreedingF, 0, 1);
    genotypeFreqs = {
      AA: p * p + F * p * q,
      Aa: 2 * p * q * (1 - F),
      aa: q * q + F * p * q,
    };
  }

  // ── Assign individuals ──
  const individuals = assignIndividuals(N, genotypeFreqs);
  const observedFreqs = calcFreqs(individuals);
  const observedP = calcP(observedFreqs);
  const expected = calcHWExpected(observedP);
  const meanFitness = calcMeanFitness(observedFreqs, params);

  const newGeneration = state.generation + 1;
  const point: HistoryPoint = {
    generation: newGeneration,
    p: observedP,
    q: 1 - observedP,
    ...observedFreqs,
    expectedAA: expected.AA,
    expectedAa: expected.Aa,
    expectedaa: expected.aa,
    meanFitness,
  };

  return {
    generation: newGeneration,
    p: observedP,
    q: 1 - observedP,
    genotypeFreqs: observedFreqs,
    individuals,
    history: [...state.history, point].slice(-300),
  };
}

/** Assign N individuals given target genotype frequencies */
function assignIndividuals(
  N: number,
  freqs: { AA: number; Aa: number; aa: number }
): Genotype[] {
  const result: Genotype[] = [];
  let remaining = N;
  // Assign by cumulative probability
  const cumAA = freqs.AA;
  const cumAa = freqs.AA + freqs.Aa;

  for (let i = 0; i < remaining; i++) {
    const r = Math.random();
    if (r < cumAA) result.push('AA');
    else if (r < cumAa) result.push('Aa');
    else result.push('aa');
  }
  return result;
}
