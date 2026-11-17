/**
 * Natural isotope abundances for the Build an Atom sandbox (Z 1 to 18).
 *
 * Keyed by atomic number, then by mass number (A = protons + neutrons).
 * Values are the percent natural (terrestrial) abundance of that stable
 * isotope. Isotopes not listed for an element do not occur naturally in
 * meaningful quantities (radioactive / synthetic / trace): `getIsotopeInfo`
 * returns `abundance: null` for those.
 *
 * Source: IUPAC representative isotopic composition values.
 */

export const ISOTOPE_ABUNDANCE: Record<number, Record<number, number>> = {
  1: { 1: 99.9885, 2: 0.0115 },
  2: { 3: 0.000134, 4: 99.999866 },
  3: { 6: 7.59, 7: 92.41 },
  4: { 9: 100 },
  5: { 10: 19.9, 11: 80.1 },
  6: { 12: 98.93, 13: 1.07 },
  7: { 14: 99.636, 15: 0.364 },
  8: { 16: 99.757, 17: 0.038, 18: 0.205 },
  9: { 19: 100 },
  10: { 20: 90.48, 21: 0.27, 22: 9.25 },
  11: { 23: 100 },
  12: { 24: 78.99, 25: 10.0, 26: 11.01 },
  13: { 27: 100 },
  14: { 28: 92.223, 29: 4.685, 30: 3.092 },
  15: { 31: 100 },
  16: { 32: 94.99, 33: 0.75, 34: 4.25, 36: 0.01 },
  17: { 35: 75.76, 37: 24.24 },
  18: { 36: 0.3336, 38: 0.0629, 40: 99.6035 },
};

export interface IsotopeInfo {
  massNumber: number;
  /** Percent natural abundance, or null if the isotope is not naturally occurring. */
  abundance: number | null;
}

/** Returns natural-abundance info for a given atomic number + mass number. */
export const getIsotopeInfo = (atomicNumber: number, massNumber: number): IsotopeInfo => {
  const abundance = ISOTOPE_ABUNDANCE[atomicNumber]?.[massNumber];
  return { massNumber, abundance: abundance ?? null };
};
