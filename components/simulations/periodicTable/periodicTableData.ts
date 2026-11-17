/**
 * Periodic Table Data
 * Complete data for all 118 elements with electron configurations, properties, and classifications
 */

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  electronConfiguration: string;
  electronegativity: number | null;
  ionizationEnergy: number | null; // kJ/mol
  atomicRadius: number | null; // pm (picometers)
  group: number | null; // 1-18, null for lanthanides/actinides
  period: number;
  category: ElementCategory;
  oxidationStates: number[];
  density: number | null; // g/cm³ at STP (null for gases)
  meltingPoint: number | null; // K
  boilingPoint: number | null; // K
  discoveryYear: number | null;
  state: 'solid' | 'liquid' | 'gas' | 'unknown';
  metallicCharacter: number | null; // Relative Index 0-100
  nonMetallicCharacter: number | null; // Relative Index 0-100
  metalReactivity: number | null; // Relative Index 0-100 (metals only, null for non-metals)
  nonMetalReactivity: number | null; // Relative Index 0-100 (reactive non-metals only, null for metals/noble gases)
}

export type ElementCategory =
  | 'alkali metal'
  | 'alkaline earth metal'
  | 'transition metal'
  | 'post-transition metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble gas'
  | 'lanthanide'
  | 'actinide';

// Color scheme for element categories
export const CATEGORY_COLORS: Record<ElementCategory, string> = {
  'alkali metal': '#FF6B6B',
  'alkaline earth metal': '#FFD93D',
  'transition metal': '#FCA5A5',
  'post-transition metal': '#A8DADC',
  'metalloid': '#D4A373',
  'nonmetal': '#6BCB77',
  'halogen': '#4D96FF',
  'noble gas': '#C77DFF',
  'lanthanide': '#FF85A1',
  'actinide': '#FFA69E',
};

/**
 * Calculates Metallic Character Index (0-100)
 * Increases down a group and to the left across a period.
 * Maximum for Francium/Cesium (~100), minimum for Fluorine/Helium (0).
 */
export function calculateMetallicCharacter(el: {
  atomicNumber: number;
  category: ElementCategory;
  electronegativity: number | null;
  ionizationEnergy: number | null;
}): number | null {
  if (el.category === 'noble gas') return 0;
  if (el.atomicNumber === 87) return 100; // Fr
  if (el.atomicNumber === 55) return 99;  // Cs
  if (el.atomicNumber === 9) return 0;    // F
  if (el.atomicNumber === 2 || el.atomicNumber === 10) return 0; // He, Ne

  if (el.electronegativity === null && el.ionizationEnergy === null) {
    if (el.category.includes('metal')) return 70;
    return null;
  }

  const en = el.electronegativity ?? 1.5;
  const ie = el.ionizationEnergy ?? 700;

  // Normalized EN (0.79 to 3.98)
  const enNorm = Math.max(0, Math.min(1, (en - 0.79) / (3.98 - 0.79)));
  // Normalized IE (375 to 1681 pm/F ceiling)
  const ieNorm = Math.max(0, Math.min(1, (ie - 375.7) / (1681 - 375.7)));

  const rawScore = 100 * (1 - (0.65 * enNorm + 0.35 * ieNorm));
  return Math.round(Math.max(0, Math.min(100, rawScore)) * 10) / 10;
}

/**
 * Calculates Non-Metallic Character Index (0-100)
 * Increases up a group and to the right across a period.
 * Maximum for Fluorine (100), minimum for Francium/Cesium (0).
 * Noble gases are structurally nonmetals but chemically unreactive (scored 0).
 */
export function calculateNonMetallicCharacter(el: {
  atomicNumber: number;
  category: ElementCategory;
  electronegativity: number | null;
  ionizationEnergy: number | null;
}): number | null {
  if (el.category === 'noble gas') return 0;
  if (el.atomicNumber === 9) return 100; // F
  if (el.atomicNumber === 87 || el.atomicNumber === 55) return 0; // Fr, Cs

  if (el.electronegativity === null && el.ionizationEnergy === null) {
    if (el.category.includes('metal')) return 5;
    return null;
  }

  const en = el.electronegativity ?? 1.5;
  const ie = el.ionizationEnergy ?? 700;

  const enNorm = Math.max(0, Math.min(1, (en - 0.79) / (3.98 - 0.79)));
  const ieNorm = Math.max(0, Math.min(1, (ie - 375.7) / (1681 - 375.7)));

  const rawScore = 100 * (0.70 * enNorm + 0.30 * ieNorm);
  return Math.round(Math.max(0, Math.min(100, rawScore)) * 10) / 10;
}

/**
 * Calculates Metal Reactivity Index (0-100)
 * Only defined for metals. Non-metals and metalloids return null.
 * Based on the canonical Activity Series and ionization energy:
 * Group 1 (Fr > Cs > Rb > K > Na > Li) > Group 2 (Ra > Ba > Sr > Ca > Mg > Be) >
 * Transition / Post-transition metals down to noble metals (Au, Pt).
 */
export function calculateMetalReactivity(el: {
  atomicNumber: number;
  category: ElementCategory;
  electronegativity: number | null;
  ionizationEnergy: number | null;
}): number | null {
  const metalCategories: ElementCategory[] = [
    'alkali metal',
    'alkaline earth metal',
    'transition metal',
    'post-transition metal',
    'lanthanide',
    'actinide'
  ];

  if (!metalCategories.includes(el.category)) {
    return null;
  }

  const ANCHORS: Record<number, number> = {
    87: 100, // Fr
    55: 98,  // Cs
    37: 94,  // Rb
    19: 88,  // K
    88: 85,  // Ra
    56: 82,  // Ba
    11: 78,  // Na
    38: 76,  // Sr
    20: 68,  // Ca
    3:  68,  // Li
    12: 52,  // Mg
    13: 48,  // Al
    25: 44,  // Mn
    30: 40,  // Zn
    24: 38,  // Cr
    4:  38,  // Be
    26: 34,  // Fe
    48: 30,  // Cd
    27: 28,  // Co
    28: 26,  // Ni
    50: 24,  // Sn
    82: 22,  // Pb
    29: 14,  // Cu
    80: 12,  // Hg
    47: 8,   // Ag
    78: 4,   // Pt
    79: 2,   // Au
  };

  if (ANCHORS[el.atomicNumber] !== undefined) {
    return ANCHORS[el.atomicNumber];
  }

  if (el.category === 'lanthanide') {
    return Math.round((65 - (el.atomicNumber - 57) * 0.8) * 10) / 10;
  }
  if (el.category === 'actinide') {
    return Math.round((70 - (el.atomicNumber - 89) * 0.8) * 10) / 10;
  }

  if (el.ionizationEnergy && el.electronegativity) {
    const ieScore = Math.max(0, Math.min(1, (1000 - el.ionizationEnergy) / 600));
    const enScore = Math.max(0, Math.min(1, (2.5 - el.electronegativity) / 1.5));
    const score = 10 + (ieScore * 0.5 + enScore * 0.5) * 35;
    return Math.round(Math.max(2, Math.min(95, score)) * 10) / 10;
  }

  return 20;
}

/**
 * Calculates Non-Metal Reactivity Index (0-100)
 * Only defined for reactive nonmetals and halogens.
 * Noble gases, metals, and metalloids return null (chemically inert / not non-metals).
 * Halogens (F > Cl > Br > I) > Chalcogens (O > S > Se) > Pnictogens (N > P) > C > H.
 */
export function calculateNonMetalReactivity(el: {
  atomicNumber: number;
  category: ElementCategory;
  electronegativity: number | null;
}): number | null {
  if (el.category !== 'nonmetal' && el.category !== 'halogen') {
    return null;
  }

  const ANCHORS: Record<number, number> = {
    9: 100,  // F
    8: 90,   // O
    17: 86,  // Cl
    7: 72,   // N
    35: 72,  // Br
    16: 64,  // S
    53: 58,  // I
    15: 54,  // P
    34: 52,  // Se
    85: 45,  // At
    6: 42,   // C
    1: 38,   // H
    117: 35, // Ts
  };

  if (ANCHORS[el.atomicNumber] !== undefined) {
    return ANCHORS[el.atomicNumber];
  }

  if (el.electronegativity) {
    const enScore = (el.electronegativity - 2.0) / (4.0 - 2.0);
    return Math.round(Math.max(10, Math.min(100, 30 + enScore * 65)) * 10) / 10;
  }

  return null;
}

const RAW_ELEMENTS: Omit<Element, 'metallicCharacter' | 'nonMetallicCharacter' | 'metalReactivity' | 'nonMetalReactivity'>[] = [
  { atomicNumber: 1, symbol: 'H', name: 'Hydrogen', atomicMass: 1.008, electronConfiguration: '1s¹', electronegativity: 2.2, ionizationEnergy: 1312, atomicRadius: 37, group: 1, period: 1, category: 'nonmetal', oxidationStates: [], density: 0.08988, meltingPoint: 13.99, boilingPoint: 20.271, discoveryYear: null, state: 'gas' },
  { atomicNumber: 2, symbol: 'He', name: 'Helium', atomicMass: 4.0026022, electronConfiguration: '1s²', electronegativity: null, ionizationEnergy: 2372.3, atomicRadius: 32, group: 18, period: 1, category: 'noble gas', oxidationStates: [], density: 0.1786, meltingPoint: 0.95, boilingPoint: 4.222, discoveryYear: null, state: 'gas' },
  { atomicNumber: 3, symbol: 'Li', name: 'Lithium', atomicMass: 6.94, electronConfiguration: '[He] 2s¹', electronegativity: 0.98, ionizationEnergy: 520.2, atomicRadius: 134, group: 1, period: 2, category: 'alkali metal', oxidationStates: [], density: 0.534, meltingPoint: 453.65, boilingPoint: 1603, discoveryYear: null, state: 'solid' },
  { atomicNumber: 4, symbol: 'Be', name: 'Beryllium', atomicMass: 9.01218315, electronConfiguration: '[He] 2s²', electronegativity: 1.57, ionizationEnergy: 899.5, atomicRadius: 90, group: 2, period: 2, category: 'alkaline earth metal', oxidationStates: [], density: 1.85, meltingPoint: 1560, boilingPoint: 2742, discoveryYear: null, state: 'solid' },
  { atomicNumber: 5, symbol: 'B', name: 'Boron', atomicMass: 10.81, electronConfiguration: '[He] 2s² 2p¹', electronegativity: 2.04, ionizationEnergy: 800.6, atomicRadius: 82, group: 13, period: 2, category: 'metalloid', oxidationStates: [], density: 2.08, meltingPoint: 2349, boilingPoint: 4200, discoveryYear: null, state: 'solid' },
  { atomicNumber: 6, symbol: 'C', name: 'Carbon', atomicMass: 12.011, electronConfiguration: '[He] 2s² 2p²', electronegativity: 2.55, ionizationEnergy: 1086.5, atomicRadius: 77, group: 14, period: 2, category: 'nonmetal', oxidationStates: [], density: 1.821, meltingPoint: 3915, boilingPoint: 3915, discoveryYear: null, state: 'solid' },
  { atomicNumber: 7, symbol: 'N', name: 'Nitrogen', atomicMass: 14.007, electronConfiguration: '[He] 2s² 2p³', electronegativity: 3.04, ionizationEnergy: 1402.3, atomicRadius: 75, group: 15, period: 2, category: 'nonmetal', oxidationStates: [], density: 1.251, meltingPoint: 63.15, boilingPoint: 77.355, discoveryYear: null, state: 'gas' },
  { atomicNumber: 8, symbol: 'O', name: 'Oxygen', atomicMass: 15.999, electronConfiguration: '[He] 2s² 2p⁴', electronegativity: 3.44, ionizationEnergy: 1313.9, atomicRadius: 73, group: 16, period: 2, category: 'nonmetal', oxidationStates: [], density: 1.429, meltingPoint: 54.36, boilingPoint: 90.188, discoveryYear: null, state: 'gas' },
  { atomicNumber: 9, symbol: 'F', name: 'Fluorine', atomicMass: 18.9984031636, electronConfiguration: '[He] 2s² 2p⁵', electronegativity: 3.98, ionizationEnergy: 1681, atomicRadius: 71, group: 17, period: 2, category: 'nonmetal', oxidationStates: [], density: 1.696, meltingPoint: 53.48, boilingPoint: 85.03, discoveryYear: null, state: 'gas' },
  { atomicNumber: 10, symbol: 'Ne', name: 'Neon', atomicMass: 20.17976, electronConfiguration: '[He] 2s² 2p⁶', electronegativity: null, ionizationEnergy: 2080.7, atomicRadius: 69, group: 18, period: 2, category: 'noble gas', oxidationStates: [], density: 0.9002, meltingPoint: 24.56, boilingPoint: 27.104, discoveryYear: null, state: 'gas' },
  { atomicNumber: 11, symbol: 'Na', name: 'Sodium', atomicMass: 22.989769282, electronConfiguration: '[Ne] 3s¹', electronegativity: 0.93, ionizationEnergy: 495.8, atomicRadius: 154, group: 1, period: 3, category: 'alkali metal', oxidationStates: [], density: 0.968, meltingPoint: 370.944, boilingPoint: 1156.09, discoveryYear: null, state: 'solid' },
  { atomicNumber: 12, symbol: 'Mg', name: 'Magnesium', atomicMass: 24.305, electronConfiguration: '[Ne] 3s²', electronegativity: 1.31, ionizationEnergy: 737.7, atomicRadius: 130, group: 2, period: 3, category: 'alkaline earth metal', oxidationStates: [], density: 1.738, meltingPoint: 923, boilingPoint: 1363, discoveryYear: null, state: 'solid' },
  { atomicNumber: 13, symbol: 'Al', name: 'Aluminium', atomicMass: 26.98153857, electronConfiguration: '[Ne] 3s² 3p¹', electronegativity: 1.61, ionizationEnergy: 577.5, atomicRadius: 118, group: 13, period: 3, category: 'post-transition metal', oxidationStates: [], density: 2.7, meltingPoint: 933.47, boilingPoint: 2743, discoveryYear: null, state: 'solid' },
  { atomicNumber: 14, symbol: 'Si', name: 'Silicon', atomicMass: 28.085, electronConfiguration: '[Ne] 3s² 3p²', electronegativity: 1.9, ionizationEnergy: 786.5, atomicRadius: 111, group: 14, period: 3, category: 'metalloid', oxidationStates: [], density: 2.329, meltingPoint: 1687, boilingPoint: 3538, discoveryYear: null, state: 'solid' },
  { atomicNumber: 15, symbol: 'P', name: 'Phosphorus', atomicMass: 30.9737619985, electronConfiguration: '[Ne] 3s² 3p³', electronegativity: 2.19, ionizationEnergy: 1011.8, atomicRadius: 106, group: 15, period: 3, category: 'nonmetal', oxidationStates: [], density: 1.823, meltingPoint: 317.3, boilingPoint: 550, discoveryYear: null, state: 'solid' },
  { atomicNumber: 16, symbol: 'S', name: 'Sulfur', atomicMass: 32.06, electronConfiguration: '[Ne] 3s² 3p⁴', electronegativity: 2.58, ionizationEnergy: 999.6, atomicRadius: 102, group: 16, period: 3, category: 'nonmetal', oxidationStates: [], density: 2.07, meltingPoint: 388.36, boilingPoint: 717.8, discoveryYear: null, state: 'solid' },
  { atomicNumber: 17, symbol: 'Cl', name: 'Chlorine', atomicMass: 35.45, electronConfiguration: '[Ne] 3s² 3p⁵', electronegativity: 3.16, ionizationEnergy: 1251.2, atomicRadius: 99, group: 17, period: 3, category: 'nonmetal', oxidationStates: [], density: 3.2, meltingPoint: 171.6, boilingPoint: 239.11, discoveryYear: null, state: 'gas' },
  { atomicNumber: 18, symbol: 'Ar', name: 'Argon', atomicMass: 39.9481, electronConfiguration: '[Ne] 3s² 3p⁶', electronegativity: null, ionizationEnergy: 1520.6, atomicRadius: 97, group: 18, period: 3, category: 'noble gas', oxidationStates: [], density: 1.784, meltingPoint: 83.81, boilingPoint: 87.302, discoveryYear: null, state: 'gas' },
  { atomicNumber: 19, symbol: 'K', name: 'Potassium', atomicMass: 39.09831, electronConfiguration: '[Ar] 4s¹', electronegativity: 0.82, ionizationEnergy: 418.8, atomicRadius: 196, group: 1, period: 4, category: 'alkali metal', oxidationStates: [], density: 0.862, meltingPoint: 336.7, boilingPoint: 1032, discoveryYear: null, state: 'solid' },
  { atomicNumber: 20, symbol: 'Ca', name: 'Calcium', atomicMass: 40.0784, electronConfiguration: '[Ar] 4s²', electronegativity: 1, ionizationEnergy: 589.8, atomicRadius: 174, group: 2, period: 4, category: 'alkaline earth metal', oxidationStates: [], density: 1.55, meltingPoint: 1115, boilingPoint: 1757, discoveryYear: null, state: 'solid' },
  { atomicNumber: 21, symbol: 'Sc', name: 'Scandium', atomicMass: 44.9559085, electronConfiguration: '[Ar] 3d¹ 4s²', electronegativity: 1.36, ionizationEnergy: 633.1, atomicRadius: 144, group: 3, period: 4, category: 'transition metal', oxidationStates: [], density: 2.985, meltingPoint: 1814, boilingPoint: 3109, discoveryYear: null, state: 'solid' },
  { atomicNumber: 22, symbol: 'Ti', name: 'Titanium', atomicMass: 47.8671, electronConfiguration: '[Ar] 3d² 4s²', electronegativity: 1.54, ionizationEnergy: 658.8, atomicRadius: 136, group: 4, period: 4, category: 'transition metal', oxidationStates: [], density: 4.506, meltingPoint: 1941, boilingPoint: 3560, discoveryYear: null, state: 'solid' },
  { atomicNumber: 23, symbol: 'V', name: 'Vanadium', atomicMass: 50.94151, electronConfiguration: '[Ar] 3d³ 4s²', electronegativity: 1.63, ionizationEnergy: 650.9, atomicRadius: 125, group: 5, period: 4, category: 'transition metal', oxidationStates: [], density: 6, meltingPoint: 2183, boilingPoint: 3680, discoveryYear: null, state: 'solid' },
  { atomicNumber: 24, symbol: 'Cr', name: 'Chromium', atomicMass: 51.99616, electronConfiguration: '[Ar] 3d⁵ 4s¹', electronegativity: 1.66, ionizationEnergy: 652.9, atomicRadius: 127, group: 6, period: 4, category: 'transition metal', oxidationStates: [], density: 7.19, meltingPoint: 2180, boilingPoint: 2944, discoveryYear: null, state: 'solid' },
  { atomicNumber: 25, symbol: 'Mn', name: 'Manganese', atomicMass: 54.9380443, electronConfiguration: '[Ar] 3d⁵ 4s²', electronegativity: 1.55, ionizationEnergy: 717.3, atomicRadius: 139, group: 7, period: 4, category: 'transition metal', oxidationStates: [], density: 7.21, meltingPoint: 1519, boilingPoint: 2334, discoveryYear: null, state: 'solid' },
  { atomicNumber: 26, symbol: 'Fe', name: 'Iron', atomicMass: 55.8452, electronConfiguration: '[Ar] 3d⁶ 4s²', electronegativity: 1.83, ionizationEnergy: 762.5, atomicRadius: 125, group: 8, period: 4, category: 'transition metal', oxidationStates: [], density: 7.874, meltingPoint: 1811, boilingPoint: 3134, discoveryYear: null, state: 'solid' },
  { atomicNumber: 27, symbol: 'Co', name: 'Cobalt', atomicMass: 58.9331944, electronConfiguration: '[Ar] 3d⁷ 4s²', electronegativity: 1.88, ionizationEnergy: 760.4, atomicRadius: 126, group: 9, period: 4, category: 'transition metal', oxidationStates: [], density: 8.9, meltingPoint: 1768, boilingPoint: 3200, discoveryYear: null, state: 'solid' },
  { atomicNumber: 28, symbol: 'Ni', name: 'Nickel', atomicMass: 58.69344, electronConfiguration: '[Ar] 3d⁸ 4s²', electronegativity: 1.91, ionizationEnergy: 737.1, atomicRadius: 121, group: 10, period: 4, category: 'transition metal', oxidationStates: [], density: 8.908, meltingPoint: 1728, boilingPoint: 3003, discoveryYear: null, state: 'solid' },
  { atomicNumber: 29, symbol: 'Cu', name: 'Copper', atomicMass: 63.5463, electronConfiguration: '[Ar] 3d¹⁰ 4s¹', electronegativity: 1.9, ionizationEnergy: 745.5, atomicRadius: 138, group: 11, period: 4, category: 'transition metal', oxidationStates: [], density: 8.96, meltingPoint: 1357.77, boilingPoint: 2835, discoveryYear: null, state: 'solid' },
  { atomicNumber: 30, symbol: 'Zn', name: 'Zinc', atomicMass: 65.382, electronConfiguration: '[Ar] 3d¹⁰ 4s²', electronegativity: 1.65, ionizationEnergy: 906.4, atomicRadius: 131, group: 12, period: 4, category: 'transition metal', oxidationStates: [], density: 7.14, meltingPoint: 692.68, boilingPoint: 1180, discoveryYear: null, state: 'solid' },
  { atomicNumber: 31, symbol: 'Ga', name: 'Gallium', atomicMass: 69.7231, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p¹', electronegativity: 1.81, ionizationEnergy: 578.8, atomicRadius: 126, group: 13, period: 4, category: 'post-transition metal', oxidationStates: [], density: 5.91, meltingPoint: 302.9146, boilingPoint: 2673, discoveryYear: null, state: 'solid' },
  { atomicNumber: 32, symbol: 'Ge', name: 'Germanium', atomicMass: 72.6308, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p²', electronegativity: 2.01, ionizationEnergy: 762, atomicRadius: 122, group: 14, period: 4, category: 'metalloid', oxidationStates: [], density: 5.323, meltingPoint: 1211.4, boilingPoint: 3106, discoveryYear: null, state: 'solid' },
  { atomicNumber: 33, symbol: 'As', name: 'Arsenic', atomicMass: 74.9215956, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p³', electronegativity: 2.18, ionizationEnergy: 947, atomicRadius: 119, group: 15, period: 4, category: 'metalloid', oxidationStates: [], density: 5.727, meltingPoint: 1090, boilingPoint: 887, discoveryYear: null, state: 'solid' },
  { atomicNumber: 34, symbol: 'Se', name: 'Selenium', atomicMass: 78.9718, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁴', electronegativity: 2.55, ionizationEnergy: 941, atomicRadius: 116, group: 16, period: 4, category: 'nonmetal', oxidationStates: [], density: 4.81, meltingPoint: 494, boilingPoint: 958, discoveryYear: null, state: 'solid' },
  { atomicNumber: 35, symbol: 'Br', name: 'Bromine', atomicMass: 79.904, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁵', electronegativity: 2.96, ionizationEnergy: 1139.9, atomicRadius: 114, group: 17, period: 4, category: 'halogen', oxidationStates: [], density: 3.1028, meltingPoint: 265.8, boilingPoint: 332, discoveryYear: null, state: 'liquid' },
  { atomicNumber: 36, symbol: 'Kr', name: 'Krypton', atomicMass: 83.7982, electronConfiguration: '[Ar] 3d¹⁰ 4s² 4p⁶', electronegativity: 3, ionizationEnergy: 1350.8, atomicRadius: 110, group: 18, period: 4, category: 'noble gas', oxidationStates: [], density: 3.749, meltingPoint: 115.78, boilingPoint: 119.93, discoveryYear: null, state: 'gas' },
  { atomicNumber: 37, symbol: 'Rb', name: 'Rubidium', atomicMass: 85.46783, electronConfiguration: '[Kr] 5s¹', electronegativity: 0.82, ionizationEnergy: 403, atomicRadius: 211, group: 1, period: 5, category: 'alkali metal', oxidationStates: [], density: 1.532, meltingPoint: 312.45, boilingPoint: 961, discoveryYear: null, state: 'solid' },
  { atomicNumber: 38, symbol: 'Sr', name: 'Strontium', atomicMass: 87.621, electronConfiguration: '[Kr] 5s²', electronegativity: 0.95, ionizationEnergy: 549.5, atomicRadius: 192, group: 2, period: 5, category: 'alkaline earth metal', oxidationStates: [], density: 2.64, meltingPoint: 1050, boilingPoint: 1650, discoveryYear: null, state: 'solid' },
  { atomicNumber: 39, symbol: 'Y', name: 'Yttrium', atomicMass: 88.905842, electronConfiguration: '[Kr] 4d¹ 5s²', electronegativity: 1.22, ionizationEnergy: 600, atomicRadius: 162, group: 3, period: 5, category: 'transition metal', oxidationStates: [], density: 4.472, meltingPoint: 1799, boilingPoint: 3203, discoveryYear: null, state: 'solid' },
  { atomicNumber: 40, symbol: 'Zr', name: 'Zirconium', atomicMass: 91.2242, electronConfiguration: '[Kr] 4d² 5s²', electronegativity: 1.33, ionizationEnergy: 640.1, atomicRadius: 148, group: 4, period: 5, category: 'transition metal', oxidationStates: [], density: 6.52, meltingPoint: 2128, boilingPoint: 4650, discoveryYear: null, state: 'solid' },
  { atomicNumber: 41, symbol: 'Nb', name: 'Niobium', atomicMass: 92.906372, electronConfiguration: '[Kr] 4d⁴ 5s¹', electronegativity: 1.6, ionizationEnergy: 652.1, atomicRadius: 137, group: 5, period: 5, category: 'transition metal', oxidationStates: [], density: 8.57, meltingPoint: 2750, boilingPoint: 5017, discoveryYear: null, state: 'solid' },
  { atomicNumber: 42, symbol: 'Mo', name: 'Molybdenum', atomicMass: 95.951, electronConfiguration: '[Kr] 4d⁵ 5s¹', electronegativity: 2.16, ionizationEnergy: 684.3, atomicRadius: 145, group: 6, period: 5, category: 'transition metal', oxidationStates: [], density: 10.28, meltingPoint: 2896, boilingPoint: 4912, discoveryYear: null, state: 'solid' },
  { atomicNumber: 43, symbol: 'Tc', name: 'Technetium', atomicMass: 98, electronConfiguration: '[Kr] 4d⁵ 5s²', electronegativity: 1.9, ionizationEnergy: 702, atomicRadius: 156, group: 7, period: 5, category: 'transition metal', oxidationStates: [], density: 11, meltingPoint: 2430, boilingPoint: 4538, discoveryYear: null, state: 'solid' },
  { atomicNumber: 44, symbol: 'Ru', name: 'Ruthenium', atomicMass: 101.072, electronConfiguration: '[Kr] 4d⁷ 5s¹', electronegativity: 2.2, ionizationEnergy: 710.2, atomicRadius: 126, group: 8, period: 5, category: 'transition metal', oxidationStates: [], density: 12.45, meltingPoint: 2607, boilingPoint: 4423, discoveryYear: null, state: 'solid' },
  { atomicNumber: 45, symbol: 'Rh', name: 'Rhodium', atomicMass: 102.905502, electronConfiguration: '[Kr] 4d⁸ 5s¹', electronegativity: 2.28, ionizationEnergy: 719.7, atomicRadius: 135, group: 9, period: 5, category: 'transition metal', oxidationStates: [], density: 12.41, meltingPoint: 2237, boilingPoint: 3968, discoveryYear: null, state: 'solid' },
  { atomicNumber: 46, symbol: 'Pd', name: 'Palladium', atomicMass: 106.421, electronConfiguration: '[Kr] 4d¹⁰', electronegativity: 2.2, ionizationEnergy: 804.4, atomicRadius: 131, group: 10, period: 5, category: 'transition metal', oxidationStates: [], density: 12.023, meltingPoint: 1828.05, boilingPoint: 3236, discoveryYear: null, state: 'solid' },
  { atomicNumber: 47, symbol: 'Ag', name: 'Silver', atomicMass: 107.86822, electronConfiguration: '[Kr] 4d¹⁰ 5s¹', electronegativity: 1.93, ionizationEnergy: 731, atomicRadius: 153, group: 11, period: 5, category: 'transition metal', oxidationStates: [], density: 10.49, meltingPoint: 1234.93, boilingPoint: 2435, discoveryYear: null, state: 'solid' },
  { atomicNumber: 48, symbol: 'Cd', name: 'Cadmium', atomicMass: 112.4144, electronConfiguration: '[Kr] 4d¹⁰ 5s²', electronegativity: 1.69, ionizationEnergy: 867.8, atomicRadius: 148, group: 12, period: 5, category: 'transition metal', oxidationStates: [], density: 8.65, meltingPoint: 594.22, boilingPoint: 1040, discoveryYear: null, state: 'solid' },
  { atomicNumber: 49, symbol: 'In', name: 'Indium', atomicMass: 114.8181, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p¹', electronegativity: 1.78, ionizationEnergy: 558.3, atomicRadius: 144, group: 13, period: 5, category: 'post-transition metal', oxidationStates: [], density: 7.31, meltingPoint: 429.7485, boilingPoint: 2345, discoveryYear: null, state: 'solid' },
  { atomicNumber: 50, symbol: 'Sn', name: 'Tin', atomicMass: 118.7107, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p²', electronegativity: 1.96, ionizationEnergy: 708.6, atomicRadius: 141, group: 14, period: 5, category: 'post-transition metal', oxidationStates: [], density: 7.365, meltingPoint: 505.08, boilingPoint: 2875, discoveryYear: null, state: 'solid' },
  { atomicNumber: 51, symbol: 'Sb', name: 'Antimony', atomicMass: 121.7601, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p³', electronegativity: 2.05, ionizationEnergy: 834, atomicRadius: 138, group: 15, period: 5, category: 'metalloid', oxidationStates: [], density: 6.697, meltingPoint: 903.78, boilingPoint: 1908, discoveryYear: null, state: 'solid' },
  { atomicNumber: 52, symbol: 'Te', name: 'Tellurium', atomicMass: 127.603, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁴', electronegativity: 2.1, ionizationEnergy: 869.3, atomicRadius: 135, group: 16, period: 5, category: 'metalloid', oxidationStates: [], density: 6.24, meltingPoint: 722.66, boilingPoint: 1261, discoveryYear: null, state: 'solid' },
  { atomicNumber: 53, symbol: 'I', name: 'Iodine', atomicMass: 126.904473, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁵', electronegativity: 2.66, ionizationEnergy: 1008.4, atomicRadius: 133, group: 17, period: 5, category: 'halogen', oxidationStates: [], density: 4.933, meltingPoint: 386.85, boilingPoint: 457.4, discoveryYear: null, state: 'solid' },
  { atomicNumber: 54, symbol: 'Xe', name: 'Xenon', atomicMass: 131.2936, electronConfiguration: '[Kr] 4d¹⁰ 5s² 5p⁶', electronegativity: 2.6, ionizationEnergy: 1170.4, atomicRadius: 130, group: 18, period: 5, category: 'noble gas', oxidationStates: [], density: 5.894, meltingPoint: 161.4, boilingPoint: 165.051, discoveryYear: null, state: 'gas' },
  { atomicNumber: 55, symbol: 'Cs', name: 'Cesium', atomicMass: 132.905451966, electronConfiguration: '[Xe] 6s¹', electronegativity: 0.79, ionizationEnergy: 375.7, atomicRadius: 225, group: 1, period: 6, category: 'alkali metal', oxidationStates: [], density: 1.93, meltingPoint: 301.7, boilingPoint: 944, discoveryYear: null, state: 'solid' },
  { atomicNumber: 56, symbol: 'Ba', name: 'Barium', atomicMass: 137.3277, electronConfiguration: '[Xe] 6s²', electronegativity: 0.89, ionizationEnergy: 502.9, atomicRadius: 198, group: 2, period: 6, category: 'alkaline earth metal', oxidationStates: [], density: 3.51, meltingPoint: 1000, boilingPoint: 2118, discoveryYear: null, state: 'solid' },
  { atomicNumber: 57, symbol: 'La', name: 'Lanthanum', atomicMass: 138.905477, electronConfiguration: '[Xe] 5d¹⁶s²', electronegativity: 1.1, ionizationEnergy: 538.1, atomicRadius: 169, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 6.162, meltingPoint: 1193, boilingPoint: 3737, discoveryYear: null, state: 'solid' },
  { atomicNumber: 58, symbol: 'Ce', name: 'Cerium', atomicMass: 140.1161, electronConfiguration: '[Xe] 4f¹ 5d¹ 6s²', electronegativity: 1.12, ionizationEnergy: 534.4, atomicRadius: 185, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 6.77, meltingPoint: 1068, boilingPoint: 3716, discoveryYear: null, state: 'solid' },
  { atomicNumber: 59, symbol: 'Pr', name: 'Praseodymium', atomicMass: 140.907662, electronConfiguration: '[Xe] 4f³ 6s²', electronegativity: 1.13, ionizationEnergy: 527, atomicRadius: 185, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 6.77, meltingPoint: 1208, boilingPoint: 3403, discoveryYear: null, state: 'solid' },
  { atomicNumber: 60, symbol: 'Nd', name: 'Neodymium', atomicMass: 144.2423, electronConfiguration: '[Xe] 4f⁴ 6s²', electronegativity: 1.14, ionizationEnergy: 533.1, atomicRadius: 185, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 7.01, meltingPoint: 1297, boilingPoint: 3347, discoveryYear: null, state: 'solid' },
  { atomicNumber: 61, symbol: 'Pm', name: 'Promethium', atomicMass: 145, electronConfiguration: '[Xe] 4f⁵ 6s²', electronegativity: 1.13, ionizationEnergy: 540, atomicRadius: 185, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 7.26, meltingPoint: 1315, boilingPoint: 3273, discoveryYear: null, state: 'solid' },
  { atomicNumber: 62, symbol: 'Sm', name: 'Samarium', atomicMass: 150.362, electronConfiguration: '[Xe] 4f⁶ 6s²', electronegativity: 1.17, ionizationEnergy: 544.5, atomicRadius: 185, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 7.52, meltingPoint: 1345, boilingPoint: 2173, discoveryYear: null, state: 'solid' },
  { atomicNumber: 63, symbol: 'Eu', name: 'Europium', atomicMass: 151.9641, electronConfiguration: '[Xe] 4f⁷ 6s²', electronegativity: 1.2, ionizationEnergy: 547.1, atomicRadius: 185, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 5.264, meltingPoint: 1099, boilingPoint: 1802, discoveryYear: null, state: 'solid' },
  { atomicNumber: 64, symbol: 'Gd', name: 'Gadolinium', atomicMass: 157.253, electronConfiguration: '[Xe] 4f⁷ 5d¹ 6s²', electronegativity: 1.2, ionizationEnergy: 593.4, atomicRadius: 180, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 7.9, meltingPoint: 1585, boilingPoint: 3273, discoveryYear: null, state: 'solid' },
  { atomicNumber: 65, symbol: 'Tb', name: 'Terbium', atomicMass: 158.925352, electronConfiguration: '[Xe] 4f⁹ 6s²', electronegativity: 1.1, ionizationEnergy: 565.8, atomicRadius: 175, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 8.23, meltingPoint: 1629, boilingPoint: 3396, discoveryYear: null, state: 'solid' },
  { atomicNumber: 66, symbol: 'Dy', name: 'Dysprosium', atomicMass: 162.5001, electronConfiguration: '[Xe] 4f¹⁰ 6s²', electronegativity: 1.22, ionizationEnergy: 573, atomicRadius: 175, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 8.54, meltingPoint: 1680, boilingPoint: 2840, discoveryYear: null, state: 'solid' },
  { atomicNumber: 67, symbol: 'Ho', name: 'Holmium', atomicMass: 164.930332, electronConfiguration: '[Xe] 4f¹¹ 6s²', electronegativity: 1.23, ionizationEnergy: 581, atomicRadius: 175, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 8.79, meltingPoint: 1734, boilingPoint: 2873, discoveryYear: null, state: 'solid' },
  { atomicNumber: 68, symbol: 'Er', name: 'Erbium', atomicMass: 167.2593, electronConfiguration: '[Xe] 4f¹² 6s²', electronegativity: 1.24, ionizationEnergy: 589.3, atomicRadius: 175, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 9.066, meltingPoint: 1802, boilingPoint: 3141, discoveryYear: null, state: 'solid' },
  { atomicNumber: 69, symbol: 'Tm', name: 'Thulium', atomicMass: 168.934222, electronConfiguration: '[Xe] 4f¹³ 6s²', electronegativity: 1.25, ionizationEnergy: 596.7, atomicRadius: 175, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 9.32, meltingPoint: 1818, boilingPoint: 2223, discoveryYear: null, state: 'solid' },
  { atomicNumber: 70, symbol: 'Yb', name: 'Ytterbium', atomicMass: 173.0451, electronConfiguration: '[Xe] 4f¹⁴ 6s²', electronegativity: 1.1, ionizationEnergy: 603.4, atomicRadius: 175, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 6.9, meltingPoint: 1097, boilingPoint: 1469, discoveryYear: null, state: 'solid' },
  { atomicNumber: 71, symbol: 'Lu', name: 'Lutetium', atomicMass: 174.96681, electronConfiguration: '[Xe] 4f¹⁴ 5d¹ 6s²', electronegativity: 1.27, ionizationEnergy: 523.5, atomicRadius: 160, group: 3, period: 6, category: 'lanthanide', oxidationStates: [], density: 9.841, meltingPoint: 1925, boilingPoint: 3675, discoveryYear: null, state: 'solid' },
  { atomicNumber: 72, symbol: 'Hf', name: 'Hafnium', atomicMass: 178.492, electronConfiguration: '[Xe] 4f¹⁴ 5d² 6s²', electronegativity: 1.3, ionizationEnergy: 658.5, atomicRadius: 150, group: 4, period: 6, category: 'transition metal', oxidationStates: [], density: 13.31, meltingPoint: 2506, boilingPoint: 4876, discoveryYear: null, state: 'solid' },
  { atomicNumber: 73, symbol: 'Ta', name: 'Tantalum', atomicMass: 180.947882, electronConfiguration: '[Xe] 4f¹⁴ 5d³ 6s²', electronegativity: 1.5, ionizationEnergy: 761, atomicRadius: 138, group: 5, period: 6, category: 'transition metal', oxidationStates: [], density: 16.69, meltingPoint: 3290, boilingPoint: 5731, discoveryYear: null, state: 'solid' },
  { atomicNumber: 74, symbol: 'W', name: 'Tungsten', atomicMass: 183.841, electronConfiguration: '[Xe] 4f¹⁴ 5d⁴ 6s²', electronegativity: 2.36, ionizationEnergy: 770, atomicRadius: 146, group: 6, period: 6, category: 'transition metal', oxidationStates: [], density: 19.25, meltingPoint: 3695, boilingPoint: 6203, discoveryYear: null, state: 'solid' },
  { atomicNumber: 75, symbol: 'Re', name: 'Rhenium', atomicMass: 186.2071, electronConfiguration: '[Xe] 4f¹⁴ 5d⁵ 6s²', electronegativity: 1.9, ionizationEnergy: 760, atomicRadius: 159, group: 7, period: 6, category: 'transition metal', oxidationStates: [], density: 21.02, meltingPoint: 3459, boilingPoint: 5869, discoveryYear: null, state: 'solid' },
  { atomicNumber: 76, symbol: 'Os', name: 'Osmium', atomicMass: 190.233, electronConfiguration: '[Xe] 4f¹⁴ 5d⁶ 6s²', electronegativity: 2.2, ionizationEnergy: 840, atomicRadius: 128, group: 8, period: 6, category: 'transition metal', oxidationStates: [], density: 22.59, meltingPoint: 3306, boilingPoint: 5285, discoveryYear: null, state: 'solid' },
  { atomicNumber: 77, symbol: 'Ir', name: 'Iridium', atomicMass: 192.2173, electronConfiguration: '[Xe] 4f¹⁴ 5d⁷ 6s²', electronegativity: 2.2, ionizationEnergy: 880, atomicRadius: 137, group: 9, period: 6, category: 'transition metal', oxidationStates: [], density: 22.56, meltingPoint: 2719, boilingPoint: 4403, discoveryYear: null, state: 'solid' },
  { atomicNumber: 78, symbol: 'Pt', name: 'Platinum', atomicMass: 195.0849, electronConfiguration: '[Xe] 4f¹⁴ 5d⁹ 6s¹', electronegativity: 2.28, ionizationEnergy: 870, atomicRadius: 128, group: 10, period: 6, category: 'transition metal', oxidationStates: [], density: 21.45, meltingPoint: 2041.4, boilingPoint: 4098, discoveryYear: null, state: 'solid' },
  { atomicNumber: 79, symbol: 'Au', name: 'Gold', atomicMass: 196.9665695, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹', electronegativity: 2.54, ionizationEnergy: 890.1, atomicRadius: 144, group: 11, period: 6, category: 'transition metal', oxidationStates: [], density: 19.3, meltingPoint: 1337.33, boilingPoint: 3243, discoveryYear: null, state: 'solid' },
  { atomicNumber: 80, symbol: 'Hg', name: 'Mercury', atomicMass: 200.5923, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s²', electronegativity: 2, ionizationEnergy: 1007.1, atomicRadius: 149, group: 12, period: 6, category: 'transition metal', oxidationStates: [], density: 13.534, meltingPoint: 234.321, boilingPoint: 629.88, discoveryYear: null, state: 'liquid' },
  { atomicNumber: 81, symbol: 'Tl', name: 'Thallium', atomicMass: 204.38, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', electronegativity: 1.62, ionizationEnergy: 589.4, atomicRadius: 148, group: 13, period: 6, category: 'post-transition metal', oxidationStates: [], density: 11.85, meltingPoint: 577, boilingPoint: 1746, discoveryYear: null, state: 'solid' },
  { atomicNumber: 82, symbol: 'Pb', name: 'Lead', atomicMass: 207.21, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²', electronegativity: 1.87, ionizationEnergy: 715.6, atomicRadius: 147, group: 14, period: 6, category: 'post-transition metal', oxidationStates: [], density: 11.34, meltingPoint: 600.61, boilingPoint: 2022, discoveryYear: null, state: 'solid' },
  { atomicNumber: 83, symbol: 'Bi', name: 'Bismuth', atomicMass: 208.980401, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', electronegativity: 2.02, ionizationEnergy: 703, atomicRadius: 146, group: 15, period: 6, category: 'post-transition metal', oxidationStates: [], density: 9.78, meltingPoint: 544.7, boilingPoint: 1837, discoveryYear: null, state: 'solid' },
  { atomicNumber: 84, symbol: 'Po', name: 'Polonium', atomicMass: 209, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', electronegativity: 2, ionizationEnergy: 812.1, atomicRadius: 190, group: 16, period: 6, category: 'post-transition metal', oxidationStates: [], density: 9.196, meltingPoint: 527, boilingPoint: 1235, discoveryYear: null, state: 'solid' },
  { atomicNumber: 85, symbol: 'At', name: 'Astatine', atomicMass: 210, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', electronegativity: 2.2, ionizationEnergy: 899.003, atomicRadius: 150, group: 17, period: 6, category: 'halogen', oxidationStates: [], density: 6.35, meltingPoint: 575, boilingPoint: 610, discoveryYear: null, state: 'solid' },
  { atomicNumber: 86, symbol: 'Rn', name: 'Radon', atomicMass: 222, electronConfiguration: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', electronegativity: 2.2, ionizationEnergy: 1037, atomicRadius: 145, group: 18, period: 6, category: 'noble gas', oxidationStates: [], density: 9.73, meltingPoint: 202, boilingPoint: 211.5, discoveryYear: null, state: 'gas' },
  { atomicNumber: 87, symbol: 'Fr', name: 'Francium', atomicMass: 223, electronConfiguration: '[Rn] 7s¹', electronegativity: 0.79, ionizationEnergy: 380, atomicRadius: 260, group: 1, period: 7, category: 'alkali metal', oxidationStates: [], density: 1.87, meltingPoint: 300, boilingPoint: 950, discoveryYear: null, state: 'solid' },
  { atomicNumber: 88, symbol: 'Ra', name: 'Radium', atomicMass: 226, electronConfiguration: '[Rn] 7s²', electronegativity: 0.9, ionizationEnergy: 509.3, atomicRadius: 215, group: 2, period: 7, category: 'alkaline earth metal', oxidationStates: [], density: 5.5, meltingPoint: 1233, boilingPoint: 2010, discoveryYear: null, state: 'solid' },
  { atomicNumber: 89, symbol: 'Ac', name: 'Actinium', atomicMass: 227, electronConfiguration: '[Rn] 6d¹ 7s²', electronegativity: 1.1, ionizationEnergy: 499, atomicRadius: 195, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 10, meltingPoint: 1500, boilingPoint: 3500, discoveryYear: null, state: 'solid' },
  { atomicNumber: 90, symbol: 'Th', name: 'Thorium', atomicMass: 232.03774, electronConfiguration: '[Rn] 6d² 7s²', electronegativity: 1.3, ionizationEnergy: 587, atomicRadius: 180, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 11.724, meltingPoint: 2023, boilingPoint: 5061, discoveryYear: null, state: 'solid' },
  { atomicNumber: 91, symbol: 'Pa', name: 'Protactinium', atomicMass: 231.035882, electronConfiguration: '[Rn] 5f² 6d¹ 7s²', electronegativity: 1.5, ionizationEnergy: 568, atomicRadius: 180, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 15.37, meltingPoint: 1841, boilingPoint: 4300, discoveryYear: null, state: 'solid' },
  { atomicNumber: 92, symbol: 'U', name: 'Uranium', atomicMass: 238.028913, electronConfiguration: '[Rn] 5f³ 6d¹ 7s²', electronegativity: 1.38, ionizationEnergy: 597.6, atomicRadius: 175, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 19.1, meltingPoint: 1405.3, boilingPoint: 4404, discoveryYear: null, state: 'solid' },
  { atomicNumber: 93, symbol: 'Np', name: 'Neptunium', atomicMass: 237, electronConfiguration: '[Rn] 5f⁴ 6d¹ 7s²', electronegativity: 1.36, ionizationEnergy: 604.5, atomicRadius: 175, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 20.45, meltingPoint: 912, boilingPoint: 4447, discoveryYear: null, state: 'solid' },
  { atomicNumber: 94, symbol: 'Pu', name: 'Plutonium', atomicMass: 244, electronConfiguration: '[Rn] 5f⁶ 7s²', electronegativity: 1.28, ionizationEnergy: 584.7, atomicRadius: 175, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 19.816, meltingPoint: 912.5, boilingPoint: 3505, discoveryYear: null, state: 'solid' },
  { atomicNumber: 95, symbol: 'Am', name: 'Americium', atomicMass: 243, electronConfiguration: '[Rn] 5f⁷ 7s²', electronegativity: 1.13, ionizationEnergy: 578, atomicRadius: 175, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 12, meltingPoint: 1449, boilingPoint: 2880, discoveryYear: null, state: 'solid' },
  { atomicNumber: 96, symbol: 'Cm', name: 'Curium', atomicMass: 247, electronConfiguration: '[Rn] 5f⁷ 6d¹ 7s²', electronegativity: 1.28, ionizationEnergy: 581, atomicRadius: 176, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 13.51, meltingPoint: 1613, boilingPoint: 3383, discoveryYear: null, state: 'solid' },
  { atomicNumber: 97, symbol: 'Bk', name: 'Berkelium', atomicMass: 247, electronConfiguration: '[Rn] 5f⁹ 7s²', electronegativity: 1.3, ionizationEnergy: 601, atomicRadius: 174, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 14.78, meltingPoint: 1259, boilingPoint: 2900, discoveryYear: null, state: 'solid' },
  { atomicNumber: 98, symbol: 'Cf', name: 'Californium', atomicMass: 251, electronConfiguration: '[Rn] 5f¹⁰ 7s²', electronegativity: 1.3, ionizationEnergy: 608, atomicRadius: 186, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 15.1, meltingPoint: 1173, boilingPoint: 1743, discoveryYear: null, state: 'solid' },
  { atomicNumber: 99, symbol: 'Es', name: 'Einsteinium', atomicMass: 252, electronConfiguration: '[Rn] 5f¹¹ 7s²', electronegativity: 1.3, ionizationEnergy: 619, atomicRadius: 186, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: 8.84, meltingPoint: 1133, boilingPoint: 1269, discoveryYear: null, state: 'solid' },
  { atomicNumber: 100, symbol: 'Fm', name: 'Fermium', atomicMass: 257, electronConfiguration: '[Rn] 5f¹² 7s²', electronegativity: 1.3, ionizationEnergy: 627, atomicRadius: null, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: null, meltingPoint: 1800, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 101, symbol: 'Md', name: 'Mendelevium', atomicMass: 258, electronConfiguration: '[Rn] 5f¹³ 7s²', electronegativity: 1.3, ionizationEnergy: 635, atomicRadius: null, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: null, meltingPoint: 1100, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 102, symbol: 'No', name: 'Nobelium', atomicMass: 259, electronConfiguration: '[Rn] 5f¹⁴ 7s²', electronegativity: 1.3, ionizationEnergy: 642, atomicRadius: null, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: null, meltingPoint: 1100, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 103, symbol: 'Lr', name: 'Lawrencium', atomicMass: 266, electronConfiguration: '[Rn] 5f¹⁴ 7s² 7p¹', electronegativity: 1.3, ionizationEnergy: 470, atomicRadius: null, group: 3, period: 7, category: 'actinide', oxidationStates: [], density: null, meltingPoint: 1900, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 104, symbol: 'Rf', name: 'Rutherfordium', atomicMass: 267, electronConfiguration: '[Rn] 5f¹⁴ 6d² 7s²', electronegativity: null, ionizationEnergy: 580, atomicRadius: null, group: 4, period: 7, category: 'transition metal', oxidationStates: [], density: 23.2, meltingPoint: 2400, boilingPoint: 5800, discoveryYear: null, state: 'solid' },
  { atomicNumber: 105, symbol: 'Db', name: 'Dubnium', atomicMass: 268, electronConfiguration: '*[Rn] 5f¹⁴ 6d³ 7s²', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 5, period: 7, category: 'transition metal', oxidationStates: [], density: 29.3, meltingPoint: null, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 106, symbol: 'Sg', name: 'Seaborgium', atomicMass: 269, electronConfiguration: '*[Rn] 5f¹⁴ 6d⁴ 7s²', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 6, period: 7, category: 'transition metal', oxidationStates: [], density: 35, meltingPoint: null, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 107, symbol: 'Bh', name: 'Bohrium', atomicMass: 270, electronConfiguration: '*[Rn] 5f¹⁴ 6d⁵ 7s²', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 7, period: 7, category: 'transition metal', oxidationStates: [], density: 37.1, meltingPoint: null, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 108, symbol: 'Hs', name: 'Hassium', atomicMass: 269, electronConfiguration: '*[Rn] 5f¹⁴ 6d⁶ 7s²', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 8, period: 7, category: 'transition metal', oxidationStates: [], density: 40.7, meltingPoint: 126, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 109, symbol: 'Mt', name: 'Meitnerium', atomicMass: 278, electronConfiguration: '*[Rn] 5f¹⁴ 6d⁷ 7s²', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 9, period: 7, category: 'transition metal', oxidationStates: [], density: 37.4, meltingPoint: null, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 110, symbol: 'Ds', name: 'Darmstadtium', atomicMass: 281, electronConfiguration: '*[Rn] 5f¹⁴ 6d⁹ 7s¹', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 10, period: 7, category: 'transition metal', oxidationStates: [], density: 34.8, meltingPoint: null, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 111, symbol: 'Rg', name: 'Roentgenium', atomicMass: 282, electronConfiguration: '*[Rn] 5f¹⁴ 6d¹⁰ 7s¹', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 11, period: 7, category: 'transition metal', oxidationStates: [], density: 28.7, meltingPoint: null, boilingPoint: null, discoveryYear: null, state: 'solid' },
  { atomicNumber: 112, symbol: 'Cn', name: 'Copernicium', atomicMass: 285, electronConfiguration: '*[Rn] 5f¹⁴ 6d¹⁰ 7s²', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 12, period: 7, category: 'transition metal', oxidationStates: [], density: 14.0, meltingPoint: null, boilingPoint: 3570, discoveryYear: null, state: 'liquid' },
  { atomicNumber: 113, symbol: 'Nh', name: 'Nihonium', atomicMass: 286, electronConfiguration: '*[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 13, period: 7, category: 'transition metal', oxidationStates: [], density: 16, meltingPoint: 700, boilingPoint: 1430, discoveryYear: null, state: 'solid' },
  { atomicNumber: 114, symbol: 'Fl', name: 'Flerovium', atomicMass: 289, electronConfiguration: '*[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 14, period: 7, category: 'post-transition metal', oxidationStates: [], density: 14, meltingPoint: 340, boilingPoint: 420, discoveryYear: null, state: 'solid' },
  { atomicNumber: 115, symbol: 'Mc', name: 'Moscovium', atomicMass: 289, electronConfiguration: '*[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 15, period: 7, category: 'post-transition metal', oxidationStates: [], density: 13.5, meltingPoint: 670, boilingPoint: 1400, discoveryYear: null, state: 'solid' },
  { atomicNumber: 116, symbol: 'Lv', name: 'Livermorium', atomicMass: 293, electronConfiguration: '*[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 16, period: 7, category: 'post-transition metal', oxidationStates: [], density: 12.9, meltingPoint: 709, boilingPoint: 1085, discoveryYear: null, state: 'solid' },
  { atomicNumber: 117, symbol: 'Ts', name: 'Tennessine', atomicMass: 294, electronConfiguration: '*[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', electronegativity: null, ionizationEnergy: null, atomicRadius: null, group: 17, period: 7, category: 'halogen', oxidationStates: [], density: 7.17, meltingPoint: 723, boilingPoint: 883, discoveryYear: null, state: 'solid' },
];

export const PERIODIC_TABLE_ELEMENTS: Element[] = RAW_ELEMENTS.map(el => ({
  ...el,
  metallicCharacter: calculateMetallicCharacter(el),
  nonMetallicCharacter: calculateNonMetallicCharacter(el),
  metalReactivity: calculateMetalReactivity(el),
  nonMetalReactivity: calculateNonMetalReactivity(el),
}));

// Helper function to get element by atomic number
export const getElementById = (atomicNumber: number): Element | undefined => {
  return PERIODIC_TABLE_ELEMENTS.find(el => el.atomicNumber === atomicNumber);
};

// Helper function to get element by symbol
export const getElementBySymbol = (symbol: string): Element | undefined => {
  return PERIODIC_TABLE_ELEMENTS.find(el => el.symbol === symbol);
};

// Helper function to get elements by category
export const getElementsByCategory = (category: ElementCategory): Element[] => {
  return PERIODIC_TABLE_ELEMENTS.filter(el => el.category === category);
};

// Helper function to get elements by period
export const getElementsByPeriod = (period: number): Element[] => {
  return PERIODIC_TABLE_ELEMENTS.filter(el => el.period === period);
};

// Helper function to get elements by group
export const getElementsByGroup = (group: number): Element[] => {
  return PERIODIC_TABLE_ELEMENTS.filter(el => el.group === group);
};
