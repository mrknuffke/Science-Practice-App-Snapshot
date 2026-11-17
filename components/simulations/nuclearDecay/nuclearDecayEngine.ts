export interface IsotopeInfo {
  name: string;
  symbol: string;
  mass: number;
  atomicNum: number;
  daughterSymbol: string;
  daughterMass: number;
  daughterAtomicNum: number;
  decayType: 'alpha' | 'beta';
  halfLifeVal: number;
  halfLifeUnit: string;
  parentColor: string;
  daughterColor: string;
}

export const ISOTOPES: Record<string, IsotopeInfo> = {
  C14: {
    name: 'Carbon-14',
    symbol: 'C',
    mass: 14,
    atomicNum: 6,
    daughterSymbol: 'N',
    daughterMass: 14,
    daughterAtomicNum: 7,
    decayType: 'beta',
    halfLifeVal: 5730,
    halfLifeUnit: 'years',
    parentColor: '#10b981', // Emerald
    daughterColor: '#64748b', // Slate
  },
  I131: {
    name: 'Iodine-131',
    symbol: 'I',
    mass: 131,
    atomicNum: 53,
    daughterSymbol: 'Xe',
    daughterMass: 131,
    daughterAtomicNum: 54,
    decayType: 'beta',
    halfLifeVal: 8.02,
    halfLifeUnit: 'days',
    parentColor: '#8b5cf6', // Violet
    daughterColor: '#64748b',
  },
  U238: {
    name: 'Uranium-238',
    symbol: 'U',
    mass: 238,
    atomicNum: 92,
    daughterSymbol: 'Th',
    daughterMass: 234,
    daughterAtomicNum: 90,
    decayType: 'alpha',
    halfLifeVal: 4.47,
    halfLifeUnit: 'billion years',
    parentColor: '#f59e0b', // Amber
    daughterColor: '#64748b',
  },
  Co60: {
    name: 'Cobalt-60',
    symbol: 'Co',
    mass: 60,
    atomicNum: 27,
    daughterSymbol: 'Ni',
    daughterMass: 60,
    daughterAtomicNum: 28,
    decayType: 'beta',
    halfLifeVal: 5.27,
    halfLifeUnit: 'years',
    parentColor: '#3b82f6', // Blue
    daughterColor: '#64748b',
  },
};

// Deterministic pseudo-random sequence for 100 particles
export const PARTICLE_DECAY_RANKS = [
  34, 12, 89, 45, 67, 23, 91, 5, 78, 56,
  99, 3, 44, 82, 19, 61, 38, 72, 15, 88,
  27, 65, 41, 94, 8, 52, 79, 33, 17, 85,
  60, 2, 49, 75, 22, 96, 37, 70, 14, 83,
  30, 68, 43, 92, 7, 54, 80, 25, 18, 87,
  62, 1, 47, 74, 21, 95, 36, 69, 13, 81,
  29, 66, 42, 93, 6, 53, 77, 24, 16, 86,
  63, 0, 48, 76, 20, 97, 35, 71, 11, 84,
  28, 64, 40, 90, 9, 51, 78, 31, 10, 80,
  59, 4, 46, 73, 26, 98, 39, 68, 50, 58,
];

/**
 * Calculates first-order radioactive decay metrics given elapsed half-lives.
 */
export function calculateDecay(halfLifeVal: number, halfLives: number) {
  const parentPercent = Math.pow(0.5, halfLives) * 100;
  const daughterPercent = 100 - parentPercent;
  const parentCount = Math.round(parentPercent);
  const realTime = halfLives * halfLifeVal;

  return { parentPercent, daughterPercent, parentCount, realTime };
}

/**
 * Solves radiometric age from measured percent remaining:
 * t = -log2(remaining / 100) * t_half
 */
export function calculateAgeFromPercent(halfLifeVal: number, percentRemaining: number) {
  if (percentRemaining <= 0 || percentRemaining >= 100) return null;
  const nHalfLives = -Math.log2(percentRemaining / 100);
  const age = nHalfLives * halfLifeVal;
  return { nHalfLives, age };
}
