/**
 * unit2.js - XL Chemistry Practice Suite: Unit 2 (Measurement & Matter)
 * Deterministic problem generator, seeded PRNG, attempt tracker,
 * live answer evaluation, and dual-purpose single-page study report generator.
 *
 * Strictly adheres to the Zero Em-Dashes Invariant.
 */

(function () {
  'use strict';

  // ============================================================
  // 1. SEEDED PSEUDORANDOM NUMBER GENERATOR (PRNG)
  // ============================================================
  function cyrb53(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed,
      h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  function mulberry32(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  class SeededRNG {
    constructor(seedString) {
      this.seedInt = cyrb53(seedString.toLowerCase().trim());
      this.rng = mulberry32(this.seedInt);
    }
    random() {
      return this.rng();
    }
    float(min, max, decimals = 2) {
      const val = min + this.random() * (max - min);
      return parseFloat(val.toFixed(decimals));
    }
    int(min, max) {
      return Math.floor(min + this.random() * (max - min + 1));
    }
    pick(array) {
      const idx = Math.floor(this.random() * array.length);
      return array[idx];
    }
    shuffle(array) {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(this.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    }
  }

  // ============================================================
  // 2. CRYPTOGRAPHIC DIGITAL ANTI-TAMPER SEAL
  // ============================================================
  // The student name can come from ?name= in the link, so it is escaped before it goes into HTML.
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  async function computeDigitalSeal(studentName, seed, score, total, timestamp) {
    const secretSalt = 'XL-CHEM-2026-NIST-VERIFY';
    const message = `${studentName.trim().toLowerCase()}:${seed}:${score}:${total}:${timestamp}:${secretSalt}`;
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 4).toUpperCase()}-${hex.slice(4, 8).toUpperCase()}`;
  }

  // ============================================================
  // 3. PERIODIC TABLE DATASET (Z = 1..36)
  // ============================================================
  const PERIODIC_ELEMENTS = [
    { z: 1, sym: 'H', name: 'Hydrogen', mass: 1.008, group: 1, period: 1, shells: [1], valence: 1, kind: 'nonmetal', radius: 53, ie: 1312, en: 2.20, charge: '+1, -1' },
    { z: 2, sym: 'He', name: 'Helium', mass: 4.003, group: 18, period: 1, shells: [2], valence: 2, kind: 'noble', radius: 31, ie: 2372, en: null, charge: '0' },
    { z: 3, sym: 'Li', name: 'Lithium', mass: 6.94, group: 1, period: 2, shells: [2, 1], valence: 1, kind: 'metal', radius: 167, ie: 520, en: 0.98, charge: '+1' },
    { z: 4, sym: 'Be', name: 'Beryllium', mass: 9.012, group: 2, period: 2, shells: [2, 2], valence: 2, kind: 'metal', radius: 112, ie: 899, en: 1.57, charge: '+2' },
    { z: 5, sym: 'B', name: 'Boron', mass: 10.81, group: 13, period: 2, shells: [2, 3], valence: 3, kind: 'metalloid', radius: 87, ie: 801, en: 2.04, charge: '+3' },
    { z: 6, sym: 'C', name: 'Carbon', mass: 12.011, group: 14, period: 2, shells: [2, 4], valence: 4, kind: 'nonmetal', radius: 67, ie: 1086, en: 2.55, charge: '+4, -4' },
    { z: 7, sym: 'N', name: 'Nitrogen', mass: 14.007, group: 15, period: 2, shells: [2, 5], valence: 5, kind: 'nonmetal', radius: 56, ie: 1402, en: 3.04, charge: '-3' },
    { z: 8, sym: 'O', name: 'Oxygen', mass: 15.999, group: 16, period: 2, shells: [2, 6], valence: 6, kind: 'nonmetal', radius: 48, ie: 1314, en: 3.44, charge: '-2' },
    { z: 9, sym: 'F', name: 'Fluorine', mass: 18.998, group: 17, period: 2, shells: [2, 7], valence: 7, kind: 'nonmetal', radius: 42, ie: 1681, en: 3.98, charge: '-1' },
    { z: 10, sym: 'Ne', name: 'Neon', mass: 20.180, group: 18, period: 2, shells: [2, 8], valence: 8, kind: 'noble', radius: 38, ie: 2081, en: null, charge: '0' },
    { z: 11, sym: 'Na', name: 'Sodium', mass: 22.990, group: 1, period: 3, shells: [2, 8, 1], valence: 1, kind: 'metal', radius: 190, ie: 496, en: 0.93, charge: '+1' },
    { z: 12, sym: 'Mg', name: 'Magnesium', mass: 24.305, group: 2, period: 3, shells: [2, 8, 2], valence: 2, kind: 'metal', radius: 145, ie: 738, en: 1.31, charge: '+2' },
    { z: 13, sym: 'Al', name: 'Aluminum', mass: 26.982, group: 13, period: 3, shells: [2, 8, 3], valence: 3, kind: 'metal', radius: 118, ie: 578, en: 1.61, charge: '+3' },
    { z: 14, sym: 'Si', name: 'Silicon', mass: 28.085, group: 14, period: 3, shells: [2, 8, 4], valence: 4, kind: 'metalloid', radius: 111, ie: 786, en: 1.90, charge: '+4, -4' },
    { z: 15, sym: 'P', name: 'Phosphorus', mass: 30.974, group: 15, period: 3, shells: [2, 8, 5], valence: 5, kind: 'nonmetal', radius: 98, ie: 1012, en: 2.19, charge: '-3, +5' },
    { z: 16, sym: 'S', name: 'Sulfur', mass: 32.060, group: 16, period: 3, shells: [2, 8, 6], valence: 6, kind: 'nonmetal', radius: 88, ie: 1000, en: 2.58, charge: '-2, +4, +6' },
    { z: 17, sym: 'Cl', name: 'Chlorine', mass: 35.450, group: 17, period: 3, shells: [2, 8, 7], valence: 7, kind: 'nonmetal', radius: 79, ie: 1251, en: 3.16, charge: '-1' },
    { z: 18, sym: 'Ar', name: 'Argon', mass: 39.948, group: 18, period: 3, shells: [2, 8, 8], valence: 8, kind: 'noble', radius: 71, ie: 1521, en: null, charge: '0' },
    { z: 19, sym: 'K', name: 'Potassium', mass: 39.098, group: 1, period: 4, shells: [2, 8, 8, 1], valence: 1, kind: 'metal', radius: 243, ie: 419, en: 0.82, charge: '+1' },
    { z: 20, sym: 'Ca', name: 'Calcium', mass: 40.078, group: 2, period: 4, shells: [2, 8, 8, 2], valence: 2, kind: 'metal', radius: 194, ie: 590, en: 1.00, charge: '+2' },
    { z: 21, sym: 'Sc', name: 'Scandium', mass: 44.956, group: 3, period: 4, shells: [2, 8, 9, 2], valence: null, kind: 'metal', radius: 162, ie: 633, en: 1.36, charge: '+3' },
    { z: 22, sym: 'Ti', name: 'Titanium', mass: 47.867, group: 4, period: 4, shells: [2, 8, 10, 2], valence: null, kind: 'metal', radius: 147, ie: 659, en: 1.54, charge: '+4, +3' },
    { z: 23, sym: 'V', name: 'Vanadium', mass: 50.942, group: 5, period: 4, shells: [2, 8, 11, 2], valence: null, kind: 'metal', radius: 134, ie: 651, en: 1.63, charge: '+5, +4, +3, +2' },
    { z: 24, sym: 'Cr', name: 'Chromium', mass: 51.996, group: 6, period: 4, shells: [2, 8, 13, 1], valence: null, kind: 'metal', radius: 128, ie: 653, en: 1.66, charge: '+3, +6' },
    { z: 25, sym: 'Mn', name: 'Manganese', mass: 54.938, group: 7, period: 4, shells: [2, 8, 13, 2], valence: null, kind: 'metal', radius: 127, ie: 717, en: 1.55, charge: '+2, +4, +7' },
    { z: 26, sym: 'Fe', name: 'Iron', mass: 55.845, group: 8, period: 4, shells: [2, 8, 14, 2], valence: null, kind: 'metal', radius: 126, ie: 763, en: 1.83, charge: '+2, +3' },
    { z: 27, sym: 'Co', name: 'Cobalt', mass: 58.933, group: 9, period: 4, shells: [2, 8, 15, 2], valence: null, kind: 'metal', radius: 125, ie: 760, en: 1.88, charge: '+2, +3' },
    { z: 28, sym: 'Ni', name: 'Nickel', mass: 58.693, group: 10, period: 4, shells: [2, 8, 16, 2], valence: null, kind: 'metal', radius: 124, ie: 737, en: 1.91, charge: '+2' },
    { z: 29, sym: 'Cu', name: 'Copper', mass: 63.546, group: 11, period: 4, shells: [2, 8, 18, 1], valence: null, kind: 'metal', radius: 128, ie: 746, en: 1.90, charge: '+1, +2' },
    { z: 30, sym: 'Zn', name: 'Zinc', mass: 65.380, group: 12, period: 4, shells: [2, 8, 18, 2], valence: null, kind: 'metal', radius: 134, ie: 906, en: 1.65, charge: '+2' },
    { z: 31, sym: 'Ga', name: 'Gallium', mass: 69.723, group: 13, period: 4, shells: [2, 8, 18, 3], valence: 3, kind: 'metal', radius: 136, ie: 579, en: 1.81, charge: '+3' },
    { z: 32, sym: 'Ge', name: 'Germanium', mass: 72.630, group: 14, period: 4, shells: [2, 8, 18, 4], valence: 4, kind: 'metalloid', radius: 125, ie: 762, en: 2.01, charge: '+4' },
    { z: 33, sym: 'As', name: 'Arsenic', mass: 74.922, group: 15, period: 4, shells: [2, 8, 18, 5], valence: 5, kind: 'metalloid', radius: 114, ie: 947, en: 2.18, charge: '-3, +5' },
    { z: 34, sym: 'Se', name: 'Selenium', mass: 78.971, group: 16, period: 4, shells: [2, 8, 18, 6], valence: 6, kind: 'nonmetal', radius: 103, ie: 941, en: 2.55, charge: '-2, +4, +6' },
    { z: 35, sym: 'Br', name: 'Bromine', mass: 79.904, group: 17, period: 4, shells: [2, 8, 18, 7], valence: 7, kind: 'nonmetal', radius: 94, ie: 1140, en: 2.96, charge: '-1' },
    { z: 36, sym: 'Kr', name: 'Krypton', mass: 83.798, group: 18, period: 4, shells: [2, 8, 18, 8], valence: 8, kind: 'noble', radius: 88, ie: 1351, en: 3.00, charge: '0' }
  ];

  // ============================================================
  // 4. CURRICULUM TAXONOMY (8 SKILLS × 2 ITEMS = 16 ITEMS)
  // ============================================================
  const UNIT2_SKILLS = [
    { num: 1, title: 'Scientific Notation & Arithmetic', problems: [1, 2], lesson: 'Lesson 1-1' },
    { num: 2, title: 'Significant Figures in Calculations', problems: [3, 4], lesson: 'Lesson 1-1' },
    { num: 3, title: 'Ionic Nomenclature & Formulas', problems: [5, 6], lesson: 'Lesson 1-2c' },
    { num: 4, title: 'Covalent Molecular Nomenclature', problems: [7, 8], lesson: 'Lesson 1-2c' },
    { num: 5, title: 'Molar Mass & Percent Composition', problems: [9, 10], lesson: 'Lesson 2-7a' },
    { num: 6, title: 'Empirical & Molecular Formulas', problems: [11, 12], lesson: 'Lesson 2-7a' },
    { num: 7, title: 'The Mole & 1-Step Conversions', problems: [13, 14], lesson: 'Lesson 2-7b' },
    { num: 8, title: 'Multi-Step Dimensional Analysis', problems: [15, 16], lesson: 'Lesson 2-7c' }
  ];

  // Pool 1: Scientific Notation Conceptual & Magnitude Scenarios (MCQ)
  const SCI_NOTATION_SCENARIOS = [
    {
      context: 'Haze Particulate Matter (PM2.5) Scale',
      stem: 'In analyzing air pollution from Indonesian peat fires, atmospheric scientists measure fine particulate matter ($PM_{2.5}$) with an average aerodynamic diameter of $2.5 \\times 10^{-6}\\text{ m}$. A typical diatomic oxygen molecule ($O_2$) has an effective bond length of approximately $1.2 \\times 10^{-10}\\text{ m}$. By approximately how many orders of magnitude is a $PM_{2.5}$ particle larger than an oxygen molecule?',
      correct: '4 orders of magnitude ($10^4$ times larger).',
      distractors: [
        '16 orders of magnitude ($10^{16}$ times larger, calculated by adding the absolute exponents).',
        '2 orders of magnitude ($10^2$ times larger, based on the ratio of the mantissas 2.5 and 1.2).',
        '6 orders of magnitude ($10^6$ times larger, reflecting the negative exponent of PM2.5).'
      ],
      hint1: 'Subtract the exponent of the smaller quantity from the exponent of the larger quantity: $(-6) - (-10)$.',
      hint2: '$(-6) - (-10) = +4$. An order of magnitude represents a factor of 10, so a difference of 4 corresponds to $10^4$.',
      explanation: 'The ratio is $(2.5 \\times 10^{-6}) / (1.2 \\times 10^{-10}) \\approx 2.1 \\times 10^4$. The difference in powers of ten is $(-6) - (-10) = 4$, representing four orders of magnitude.'
    },
    {
      context: 'Atmospheric Trace Gas Concentration',
      stem: 'An analytical air monitor records an ambient carbon monoxide ($CO$) concentration of $0.0000485\\text{ moles per cubic meter}$. Which expression represents this value correctly formatted in standard scientific notation with the proper number of significant figures?',
      correct: '$4.85 \\times 10^{-5}\\text{ mol/m}^3$',
      distractors: [
        '$48.5 \\times 10^{-6}\\text{ mol/m}^3$ (convenient for micro-units but not normalized scientific notation).',
        '$4.850 \\times 10^{-5}\\text{ mol/m}^3$ (incorrectly introduces an extra trailing significant digit).',
        '$4.85 \\times 10^{5}\\text{ mol/m}^3$ (erroneously applies a positive exponent to a fractional quantity).'
      ],
      hint1: 'In standard scientific notation, the coefficient must be strictly between 1 and 10 ($1 \\le M < 10$).',
      hint2: 'Moving the decimal point 5 places to the right gives 4.85. Because the initial number is less than 1, the exponent is -5.',
      explanation: 'Standard scientific notation requires a single non-zero digit before the decimal point: $4.85 \\times 10^{-5}$. The leading zeros in 0.0000485 are placeholders and are not significant.'
    },
    {
      context: 'Avogadro Number Magnitude Comparison',
      stem: 'A macroscopic sample contains $3.011 \\times 10^{23}$ particles. If a laboratory counter could register one billion ($1.0 \\times 10^9$) particles every second, how long would it take to count this entire sample?',
      correct: 'Approximately $3.011 \\times 10^{14}$ seconds (nearly 10 million years).',
      distractors: [
        'Approximately $3.011 \\times 10^{32}$ seconds (multiplying powers of ten rather than dividing).',
        'Approximately $3.011 \\times 10^{-14}$ seconds (reversing numerator and denominator).',
        'Approximately $3.011 \\times 10^7$ seconds (subtracting coefficients directly without exponent division).'
      ],
      hint1: 'Time = Total Particles / Counting Rate = $(3.011 \\times 10^{23}) / (1.0 \\times 10^9)$.',
      hint2: 'When dividing powers of ten, subtract exponents: $23 - 9 = 14$.',
      explanation: 'Dividing $(3.011 \\times 10^{23}) / (1.0 \\times 10^9) = 3.011 \\times 10^{14}\\text{ seconds}$.'
    }
  ];

  // Pool 3: Measurement Precision & Glassware Sig Figs (MCQ)
  const SIG_FIG_MEASUREMENT_SCENARIOS = [
    {
      context: 'Buret Meniscus Reading',
      stem: 'A student performs a titration and reads the liquid level on a $50.00\\text{-mL}$ buret. The buret is etched with major calibration marks every $1\\text{ mL}$ and minor graduation lines every $0.1\\text{ mL}$. The bottom of the liquid meniscus lies between the $24.3\\text{ mL}$ and $24.4\\text{ mL}$ marks, closer to $24.4$. Which recorded measurement follows correct scientific measurement protocol?',
      correct: '$24.37\\text{ mL}$ (records all certain digits plus one estimated decimal place).',
      distractors: [
        '$24.4\\text{ mL}$ (rounds to the nearest printed graduation without estimating the final digit).',
        '$24.375\\text{ mL}$ (overstates precision by estimating beyond one-tenth of the smallest graduation).',
        '$24\\text{ mL}$ (discards certain digits provided by the printed graduation lines).'
      ],
      hint1: 'A measurement must contain all certain digits directly readable from graduations plus one final estimated digit.',
      hint2: 'Because minor lines are spaced at $0.1\\text{ mL}$, the estimated digit is in the hundredths place ($0.01\\text{ mL}$).',
      explanation: 'With graduations every $0.1\\text{ mL}$, the tenths place is certain. The observer estimates the hundredths place ($0.01\\text{ mL}$), giving four significant figures: $24.37\\text{ mL}$.'
    },
    {
      context: 'Analytical Balance Precision & Zero Rules',
      stem: 'An analytical balance outputs the mass of an anhydrous copper(II) sulfate sample as $0.05040\\text{ g}$. How many significant figures are present in this recorded mass, and which rule governs the determination?',
      correct: '4 significant figures; leading zeros are placeholders, captive zero and trailing zero after decimal are significant.',
      distractors: [
        '5 significant figures; all zeros after the decimal point are counted as significant.',
        '3 significant figures; neither the leading zeros nor the trailing zero are considered significant.',
        '2 significant figures; only non-zero integers 5 and 4 convey measurement certainty.'
      ],
      hint1: 'Leading zeros to the left of the first non-zero digit are never significant.',
      hint2: 'Captive zeros between non-zero digits (the zero between 5 and 4) and trailing zeros to the right of the decimal point are significant.',
      explanation: 'In $0.05040\\text{ g}$, the first two zeros are leading placeholders. The 5, captive 0, 4, and trailing 0 are significant, giving exactly 4 significant figures.'
    },
    {
      context: 'Reporting Mass on a Triple Beam vs Top-Loading Balance',
      stem: 'A top-loading balance has an uncertainty of $\\pm 0.01\\text{ g}$. A student places a crucible on the pan and the digital readout shows $42.00\\text{ g}$. Why is it scientifically essential to write $42.00\\text{ g}$ rather than $42\\text{ g}$ in the laboratory notebook?',
      correct: 'The trailing zeros signify that precision was measured to the hundredths place.',
      distractors: [
        'Writing $42\\text{ g}$ would indicate the crucible has zero grams of tare mass.',
        'The trailing zeros ensure that chemical calculations automatically round up.',
        'The international SI standard prohibits whole numbers without trailing zeros.'
      ],
      hint1: 'Trailing zeros following a decimal point indicate the sensitivity and precision limit of the instrument.',
      hint2: '$42.00\\text{ g}$ has 4 sig figs, whereas $42\\text{ g}$ has only 2 sig figs and implies uncertainty in the ones place.',
      explanation: 'Writing $42.00\\text{ g}$ communicates measurement precision to $\\pm 0.01\\text{ g}$. Omitting the zeros implies an uncertainty of $\\pm 1\\text{ g}$.'
    }
  ];

  // Pool 5: Systematic Ionic Nomenclature (MCQ)
  const IONIC_NOMENCLATURE_POOL = [
    {
      formula: 'CuCl₂',
      name: 'copper(II) chloride',
      stem: 'What is the correct systematic IUPAC name for the ionic compound with the chemical formula $\\text{CuCl}_2$?',
      correct: 'copper(II) chloride',
      distractors: [
        'copper dichloride (inappropriately applies covalent Greek prefixes to an ionic compound)',
        'copper(I) chloride (incorrectly assumes copper is in the +1 oxidation state)',
        'copper chlorine (fails to apply the characteristic -ide anion suffix)'
      ],
      hint1: 'Copper is a multivalent transition metal. Determine its oxidation state from the chloride ions ($-1$ each).',
      hint2: 'Two chloride ions carry a total $-2$ charge, requiring $\\text{Cu}^{2+}$. Roman numerals indicate cation charge.',
      explanation: 'Chloride is $\\text{Cl}^-$. Two $\\text{Cl}^-$ require $\\text{Cu}^{2+}$ for electrical neutrality. The systematic name is copper(II) chloride.'
    },
    {
      formula: 'Fe₂(SO₄)₃',
      name: 'iron(III) sulfate',
      stem: 'What is the correct systematic IUPAC name for the ionic compound $\\text{Fe}_2(\\text{SO}_4)_3$?',
      correct: 'iron(III) sulfate',
      distractors: [
        'iron(II) sulfate (confuses the iron subscript 2 with its ionic oxidation state)',
        'diiron trisulfate (incorrectly applies covalent Greek prefixes to an ionic salt)',
        'iron(III) sulfite (confuses the sulfate ion $\\text{SO}_4^{2-}$ with sulfite $\\text{SO}_3^{2-}$)'
      ],
      hint1: 'Sulfate is a polyatomic ion: $\\text{SO}_4^{2-}$. Three sulfate ions carry a total charge of $-6$.',
      hint2: 'Two iron cations must supply $+6$ total charge, so each is $\\text{Fe}^{3+}$.',
      explanation: 'Three $\\text{SO}_4^{2-}$ give $-6$. Two Fe ions must balance with $+6$, giving $\\text{Fe}^{3+}$. The name is iron(III) sulfate.'
    },
    {
      formula: 'Pb(NO₃)₂',
      name: 'lead(II) nitrate',
      stem: 'What is the systematic IUPAC name for the water-soluble lead salt $\\text{Pb(NO}_3)_2$?',
      correct: 'lead(II) nitrate',
      distractors: [
        'lead dinitrate (inappropriately uses Greek numerical prefix on an ionic compound)',
        'lead(IV) nitrate (incorrectly assumes lead carries its higher +4 charge state)',
        'lead(II) nitrite (confuses nitrate $\\text{NO}_3^-$ with nitrite $\\text{NO}_2^-$)'
      ],
      hint1: 'Nitrate is $\\text{NO}_3^-$. Two nitrate ions supply a total $-2$ charge.',
      hint2: 'The single lead cation must balance $-2$, making it $\\text{Pb}^{2+}$.',
      explanation: 'Each nitrate has a $-1$ charge. With two nitrates, lead must be $\\text{Pb}^{2+}$. The name is lead(II) nitrate.'
    },
    {
      formula: 'Al₂(SO₄)₃',
      name: 'aluminum sulfate',
      stem: 'What is the systematic IUPAC name for $\\text{Al}_2(\\text{SO}_4)_3$?',
      correct: 'aluminum sulfate',
      distractors: [
        'aluminum(III) sulfate (unnecessarily includes Roman numeral for a fixed +3 main-group metal)',
        'dialuminum trisulfate (incorrectly uses Greek numerical prefixes for an ionic compound)',
        'aluminum sulfide (confuses polyatomic sulfate $\\text{SO}_4^{2-}$ with binary sulfide $\\text{S}^{2-}$)'
      ],
      hint1: 'Aluminum is a Group 13 metal with an invariant $+3$ charge; Roman numerals are not used for fixed-charge metals.',
      hint2: 'Combine the metal name aluminum with the polyatomic anion name sulfate.',
      explanation: 'Because aluminum only forms $\\text{Al}^{3+}$ ions, Roman numerals are omitted. The name is aluminum sulfate.'
    },
    {
      formula: 'SnO₂',
      name: 'tin(IV) oxide',
      stem: 'What is the systematic IUPAC name for the mineral cassiterite, chemical formula $\\text{SnO}_2$?',
      correct: 'tin(IV) oxide',
      distractors: [
        'tin(II) oxide (confuses the formula with unreduced SnO)',
        'tin dioxide (inappropriately applies covalent Greek prefixes to an ionic metal oxide)',
        'tin(IV) dioxide (combines both Roman numeral charge and covalent prefix redundantly)'
      ],
      hint1: 'Oxide is $\\text{O}^{2-}$. Two oxide ions carry a combined charge of $-4$.',
      hint2: 'A single tin ion balances $-4$, so tin is in the $+4$ oxidation state: $\\text{Sn}^{4+}$.',
      explanation: 'Two oxide ions ($\text{O}^{2-}$) provide a total $-4$ charge. One tin cation balances this with $+4$, yielding tin(IV) oxide.'
    }
  ];

  // Pool 6: Ionic Formula Construction (MCQ)
  const IONIC_FORMULA_POOL = [
    {
      name: 'calcium phosphate',
      stem: 'What is the correct chemical formula for calcium phosphate, the primary mineral component of bone and tooth enamel?',
      correct: '$\\text{Ca}_3(\\text{PO}_4)_2$',
      distractors: [
        '$\\text{Ca}_2(\\text{PO}_4)_3$ (reverses the cation and anion charges in the subscript ratio)',
        '$\\text{Ca}_3\\text{PO}_42$ (omits parentheses around the polyatomic phosphate ion)',
        '$\\text{CaPO}_4$ (fails to balance the +2 calcium cation against the -3 phosphate anion)'
      ],
      hint1: 'Calcium is an alkaline earth metal: $\\text{Ca}^{2+}$. Phosphate is $\\text{PO}_4^{3-}$.',
      hint2: 'Find the lowest common multiple of 2 and 3, which is 6. Three $\\text{Ca}^{2+}$ (+6) and two $\\text{PO}_4^{3-}$ (-6).',
      explanation: 'Balancing charges requires $3 \\times (+2) = +6$ and $2 \\times (-3) = -6$. The formula is $\\text{Ca}_3(\\text{PO}_4)_2$.'
    },
    {
      name: 'iron(III) oxide',
      stem: 'What is the chemical formula for iron(III) oxide (rust)?',
      correct: '$\\text{Fe}_2\\text{O}_3$',
      distractors: [
        '$\\text{FeO}$ (represents iron(II) oxide with a 1:1 ratio)',
        '$\\text{Fe}_3\\text{O}_2$ (inverts the charge-derived subscript ratio)',
        '$\\text{Fe}_3\\text{O}$ (incorrectly treats Roman numeral III as an iron subscript)'
      ],
      hint1: 'Iron(III) is $\\text{Fe}^{3+}$. Oxide is $\\text{O}^{2-}$.',
      hint2: 'Lowest common multiple of 3 and 2 is 6. Two $\\text{Fe}^{3+}$ (+6) balance three $\\text{O}^{2-}$ (-6).',
      explanation: 'Two $\\text{Fe}^{3+}$ (+6) balance three $\\text{O}^{2-}$ (-6), yielding $\\text{Fe}_2\\text{O}_3$.'
    },
    {
      name: 'copper(II) nitrate',
      stem: 'What is the chemical formula for copper(II) nitrate?',
      correct: '$\\text{Cu(NO}_3)_2$',
      distractors: [
        '$\\text{Cu}_2\\text{NO}_3$ (applies the +2 charge as a copper subscript)',
        '$\\text{CuNO}_32$ (omits parentheses around the nitrate group)',
        '$\\text{Cu}_2(\\text{NO}_3)_2$ (fails to simplify the empirical formula)'
      ],
      hint1: 'Copper(II) is $\\text{Cu}^{2+}$. Nitrate is $\\text{NO}_3^-$.',
      hint2: 'Two nitrate ions are required to balance one $\\text{Cu}^{2+}$ ion.',
      explanation: '$\\text{Cu}^{2+}$ requires two $\\text{NO}_3^-$ anions. The formula is $\\text{Cu(NO}_3)_2$.'
    },
    {
      name: 'ammonium sulfate',
      stem: 'What is the chemical formula for ammonium sulfate, an agricultural fertilizer salt?',
      correct: '$(\\text{NH}_4)_2\\text{SO}_4$',
      distractors: [
        '$\\text{NH}_4\\text{SO}_4$ (fails to balance the +1 ammonium against the -2 sulfate)',
        '$\\text{NH}_4(\\text{SO}_4)_2$ (inverts the charge ratio between cation and anion)',
        '(\\text{NH}_4)_2(\\text{SO}_4)_2$ (contains redundant subscripts on the sulfate group)'
      ],
      hint1: 'Ammonium is $\\text{NH}_4^+$. Sulfate is $\\text{SO}_4^{2-}$.',
      hint2: 'Two $\\text{NH}_4^+$ (+2 total) are needed to balance one $\\text{SO}_4^{2-}$ (-2).',
      explanation: 'Two polyatomic $\\text{NH}_4^+$ cations balance one $\\text{SO}_4^{2-}$ anion: $(\\text{NH}_4)_2\\text{SO}_4$.'
    }
  ];

  // Pool 7: Binary Covalent Nomenclature (MCQ)
  const COVALENT_NOMENCLATURE_POOL = [
    {
      formula: 'N₂O₄',
      stem: 'What is the systematic IUPAC name for the molecular compound $\\text{N}_2\\text{O}_4$, a rocket propellant oxidizer?',
      correct: 'dinitrogen tetroxide',
      distractors: [
        'nitrogen tetroxide (omits the required prefix di- on the first element)',
        'dinitrogen tetraoxide (retains the redundant terminal "a" before oxide)',
        'nitrogen(IV) oxide (applies an ionic Roman numeral convention instead of prefixes)'
      ],
      hint1: 'Binary covalent compounds use Greek prefixes for both elements (except mono- is omitted on the first element).',
      hint2: '2 is di- and 4 is tetra-. When tetra- precedes oxide, the "a" is dropped: tetroxide.',
      explanation: 'Two nitrogen atoms give dinitrogen; four oxygen atoms give tetroxide. The name is dinitrogen tetroxide.'
    },
    {
      formula: 'SF₆',
      stem: 'What is the systematic IUPAC name for the electrical insulator gas $\\text{SF}_6$?',
      correct: 'sulfur hexafluoride',
      distractors: [
        'monosulfur hexafluoride (violates the rule that mono- is never used on the first element)',
        'sulfur hexachloride (substitutes chlorine for fluorine)',
        'sulfur(VI) fluoride (applies ionic oxidation state conventions instead of covalent prefixes)'
      ],
      hint1: 'The first element has one atom, so mono- is omitted.',
      hint2: 'The second element has 6 atoms (hexa-) and ends in -ide (fluoride).',
      explanation: 'The first element is simply sulfur; six fluorine atoms give hexafluoride: sulfur hexafluoride.'
    },
    {
      formula: 'PCl₅',
      stem: 'What is the systematic IUPAC name for the reagent $\\text{PCl}_5$?',
      correct: 'phosphorus pentachloride',
      distractors: [
        'monophosphorus pentachloride (incorrectly includes mono- on the initial element)',
        'phosphorus(V) chloride (uses Stock system Roman numerals rather than molecular prefixes)',
        'phosphorus pentachlorine (fails to replace the elemental ending with -ide)'
      ],
      hint1: 'Prefix for 5 is penta-. The first element carries no prefix when singular.',
      hint2: 'The suffix -ide replaces the end of chlorine: pentachloride.',
      explanation: 'One phosphorus (no mono-) and five chlorines give phosphorus pentachloride.'
    },
    {
      formula: 'CCl₄',
      stem: 'What is the systematic IUPAC name for $\\text{CCl}_4$, formerly used as an industrial solvent and dry cleaning agent?',
      correct: 'carbon tetrachloride',
      distractors: [
        'monocarbon tetrachloride (erroneously applies mono- to the leading element)',
        'carbon(IV) chloride (treats a covalent molecule with transition metal Stock notation)',
        'carbon tetrachlorine (fails to use the characteristic -ide suffix)'
      ],
      hint1: 'Prefix for 4 is tetra-. Carbon is singular so it takes no prefix.',
      hint2: 'Second element chlorine becomes tetrachloride.',
      explanation: 'Single carbon plus four chlorines gives carbon tetrachloride.'
    }
  ];

  // ============================================================
  // 5. MAIN APPLICATION CONTROLLER
  // ============================================================
  class XLChemStation {
    constructor() {
      this.studentName = '';
      this.seed = '';
      this.run = 1;
      this.problems = [];
      this.currentStatus = {};
      this.maxAttempts = 3;

      this.initDOM();
      this.checkStoredProfile();
    }

    initDOM() {
      this.elStationHeader = document.getElementById('stationHeader');
      this.elProblemDeck = document.getElementById('problemDeck');
      this.elProgressFill = document.getElementById('progressFill');
      this.elMetricsLabel = document.getElementById('metricsLabel');
      this.elStudentPill = document.getElementById('studentPill');
      this.elStudentNameDisplay = document.getElementById('studentNameDisplay');
      this.elSeedChip = document.getElementById('seedChip');
      this.elExportBtn = document.getElementById('exportBtn');
      this.elProfileModal = document.getElementById('profileModal');
      this.elProfileInput = document.getElementById('profileInput');
      this.elProfileStartBtn = document.getElementById('profileStartBtn');

      // Theme toggle
      this.elThemeToggle = document.getElementById('themeToggleBtn');
      this.elThemeIcon = document.getElementById('themeIcon');
      const savedTheme = localStorage.getItem('xl_chem_theme') || 'auto';
      this.applyTheme(savedTheme);
      if (this.elThemeToggle) {
        this.elThemeToggle.addEventListener('click', () => this.toggleTheme());
      }

      // Reference Drawer & Periodic Table
      this.elRefBtn = document.getElementById('refBtn');
      this.elRefDrawer = document.getElementById('refDrawer');
      this.elCloseRefDrawerBtn = document.getElementById('closeRefDrawerBtn');
      if (this.elRefBtn && this.elRefDrawer) {
        this.elRefBtn.addEventListener('click', () => this.elRefDrawer.classList.toggle('open'));
      }
      if (this.elCloseRefDrawerBtn && this.elRefDrawer) {
        this.elCloseRefDrawerBtn.addEventListener('click', () => this.elRefDrawer.classList.remove('open'));
      }
      this.initReferenceCenter();

      // Mini Calculator Widget
      this.elCalcBtn = document.getElementById('calcBtn');
      this.elCalcWidget = document.getElementById('calcWidget');
      this.elCloseCalcBtn = document.getElementById('closeCalcBtn');
      this.elCalcExpr = document.getElementById('calcExpr');
      this.elCalcVal = document.getElementById('calcVal');
      this.calcBuffer = '';

      if (this.elCalcBtn && this.elCalcWidget) {
        this.elCalcBtn.addEventListener('click', () => this.elCalcWidget.classList.toggle('open'));
      }
      if (this.elCloseCalcBtn && this.elCalcWidget) {
        this.elCloseCalcBtn.addEventListener('click', () => this.elCalcWidget.classList.remove('open'));
      }
      this.initCalculator();

      // Export / Print Receipt
      if (this.elExportBtn) {
        this.elExportBtn.addEventListener('click', () => this.handleExportReport());
      }

      // Student Pill Profile Click
      if (this.elStudentPill) {
        this.elStudentPill.addEventListener('click', () => {
          this.elProfileModal.style.display = 'flex';
          this.elProfileInput.value = this.studentName;
          this.elProfileInput.focus();
        });
      }

      // Profile Start Button
      if (this.elProfileStartBtn) {
        this.elProfileStartBtn.addEventListener('click', () => {
          const val = this.elProfileInput.value.trim();
          if (val) {
            this.setStudentName(val);
            this.elProfileModal.style.display = 'none';
          }
        });
      }
    }

    applyTheme(theme) {
      document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      if (theme === 'light') {
        document.documentElement.classList.add('theme-light');
        document.body.classList.add('theme-light');
        if (this.elThemeIcon) this.elThemeIcon.textContent = '🌙';
      } else if (theme === 'dark') {
        document.documentElement.classList.add('theme-dark');
        document.body.classList.add('theme-dark');
        if (this.elThemeIcon) this.elThemeIcon.textContent = '☀️';
      } else {
        document.documentElement.classList.add('theme-auto');
        document.body.classList.add('theme-auto');
        if (this.elThemeIcon) this.elThemeIcon.textContent = '☀️';
      }
      localStorage.setItem('xl_chem_theme', theme);
    }

    toggleTheme() {
      const current = localStorage.getItem('xl_chem_theme') || 'auto';
      const next = current === 'dark' ? 'light' : 'dark';
      this.applyTheme(next);
    }

    checkStoredProfile() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = (urlParams.get('student') || urlParams.get('name'));
      const urlRun = parseInt(urlParams.get('run'), 10);
      if (urlRun && urlRun > 1) {
        this.run = urlRun;
      }

      const storedName = urlName || localStorage.getItem('xl_chem_student_name');
      if (storedName) {
        this.setStudentName(storedName);
      } else {
        this.elProfileModal.style.display = 'flex';
      }
    }

    setStudentName(name) {
      this.studentName = name;
      localStorage.setItem('xl_chem_student_name', name);

      const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const seedBase = `${cleanName}-u2`;
      this.seed = this.run > 1 ? `${seedBase}-r${this.run}` : seedBase;

      if (this.elStudentNameDisplay) {
        this.elStudentNameDisplay.textContent = name;
      }
      const avatar = document.getElementById('studentAvatar');
      if (avatar) {
        const initials = name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        avatar.textContent = initials || 'S';
      }
      if (this.elSeedChip) {
        this.elSeedChip.textContent = `Seed: #${this.seed}`;
      }

      this.generateDeck();
      this.loadSavedState();
      this.renderDeck();
    }

    // ============================================================
    // 6. GENERATE INDIVIDUALIZED PROBLEM DECK (16 PROBLEMS)
    // ============================================================
    generateDeck() {
      const rng = new SeededRNG(this.seed);
      this.problems = [
        this.genProblem1_SciNotationMCQ(rng),
        this.genProblem2_SciNotationCalc(rng),
        this.genProblem3_SigFigMeasurementMCQ(rng),
        this.genProblem4_SigFigOperationsCalc(rng),
        this.genProblem5_IonicNomenclatureMCQ(rng),
        this.genProblem6_IonicFormulaMCQ(rng),
        this.genProblem7_CovalentNomenclatureMCQ(rng),
        this.genProblem8_CovalentFormulaAndParticle(rng),
        this.genProblem9_PercentCompositionCalc(rng),
        this.genProblem10_PercentCompRanking(rng),
        this.genProblem11_EmpiricalFormulaCalc(rng),
        this.genProblem12_MolecularFormulaCalc(rng),
        this.genProblem13_MoleConversionsCalc(rng),
        this.genProblem14_STPGasVolumeCalc(rng),
        this.genProblem15_CompoundToAtomsCalc(rng),
        this.genProblem16_HazeEnvironmentalDA(rng)
      ];
    }

    // --- Problem 1: Scientific Notation Magnitude (MCQ) ---
    genProblem1_SciNotationMCQ(rng) {
      const item = rng.pick(SCI_NOTATION_SCENARIOS);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p1_sci_not_mcq',
        num: 1,
        topic: 'Scientific Notation: Magnitude & Principles',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 2: Scientific Notation Arithmetic (Calculation - 5 attempts) ---
    genProblem2_SciNotationCalc(rng) {
      const a = rng.float(1.5, 6.0, 2);
      const expA = rng.int(4, 8);
      const b = rng.float(1.2, 5.0, 2);
      const expB = rng.int(3, 6);
      const c = rng.float(2.0, 5.0, 2);
      const expC = rng.int(2, 5);

      const valNumerator = (a * Math.pow(10, expA)) * (b * Math.pow(10, expB));
      const valDenominator = c * Math.pow(10, expC);
      const targetVal = valNumerator / valDenominator;

      return {
        id: 'p2_sci_not_calc',
        num: 2,
        topic: 'Scientific Notation: Multi-Step Arithmetic',
        stem: `Calculate the result of the following expression, entering your answer in standard scientific notation with two decimal places:<br><br>$$\\frac{(${a} \\times 10^{${expA}}) \\times (${b} \\times 10^{${expB}})}{${c} \\times 10^{${expC}}}$$`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: targetVal,
          tolerance: 0.03
        },
        placeholder: 'e.g. 2.40 x 10^5 or 2.40e5',
        hint1: 'Multiply the coefficients in the numerator and add their exponents. Then divide by the denominator coefficient and subtract its exponent.',
        hint2: `Numerator: (${a} × ${b}) = ${(a * b).toFixed(2)}, exponent = ${expA} + ${expB} = ${expA + expB}. Divide by ${c} × 10^${expC}.`,
        workedSolution: `1. Numerator: (${a} × ${b}) × 10^(${expA} + ${expB}) = ${(a * b).toFixed(3)} × 10^${expA + expB}.\n2. Division: (${(a * b).toFixed(3)} / ${c}) × 10^(${expA + expB} - ${expC}) = ${targetVal.toExponential(2)}.`
      };
    }

    // --- Problem 3: Significant Figures in Measurement & Glassware (MCQ) ---
    genProblem3_SigFigMeasurementMCQ(rng) {
      const item = rng.pick(SIG_FIG_MEASUREMENT_SCENARIOS);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p3_sig_fig_measurement',
        num: 3,
        topic: 'Measurement: Precision & Zero Rules',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 4: Multi-Step Operations with Significant Figures (Calculation - 5 attempts) ---
    genProblem4_SigFigOperationsCalc(rng) {
      const a = rng.float(12.1, 19.8, 2);
      const b = rng.float(2.15, 6.85, 2);
      const c = rng.float(1.5, 4.5, 1);

      // (a - b) / c
      const diff = a - b;
      const quotient = diff / c;
      const targetVal = parseFloat(quotient.toFixed(2));

      return {
        id: 'p4_sig_fig_calc',
        num: 4,
        topic: 'Significant Figures: Multi-Step Operations',
        stem: `Perform the following calculation and enter the final result rounded to the correct number of significant figures dictated by the rules for mixed operations:<br><br>$$\\frac{${a} - ${b}}{${c}}$$`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: targetVal,
          tolerance: 0.05
        },
        placeholder: 'e.g. 3.9',
        hint1: 'Subtract first in the numerator and identify its decimal precision. Then divide and round to the fewest significant figures between the numerator difference and the denominator.',
        hint2: `Numerator difference: ${a} - ${b} = ${diff.toFixed(2)} (two decimal places, 3 sig figs). Denominator ${c} has 2 sig figs. The final answer must have 2 sig figs.`,
        workedSolution: `1. Subtraction rule: ${a} - ${b} = ${diff.toFixed(2)} (retains hundredths place, giving 3 sig figs).\n2. Division rule: ${diff.toFixed(2)} / ${c} = ${quotient.toFixed(4)}.\n3. The denominator has 2 sig figs, so round the final answer to 2 sig figs: ${quotient.toPrecision(2)}.`
      };
    }

    // --- Problem 5: Systematic Ionic Nomenclature (MCQ) ---
    genProblem5_IonicNomenclatureMCQ(rng) {
      const item = rng.pick(IONIC_NOMENCLATURE_POOL);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p5_ionic_nomen_mcq',
        num: 5,
        topic: 'Chemical Nomenclature: Ionic Compounds',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 6: Ionic Formula Construction (MCQ) ---
    genProblem6_IonicFormulaMCQ(rng) {
      const item = rng.pick(IONIC_FORMULA_POOL);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p6_ionic_formula_mcq',
        num: 6,
        topic: 'Chemical Formulas: Ionic Compounds',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 7: Binary Covalent Nomenclature (MCQ) ---
    genProblem7_CovalentNomenclatureMCQ(rng) {
      const item = rng.pick(COVALENT_NOMENCLATURE_POOL);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p7_covalent_nomen_mcq',
        num: 7,
        topic: 'Chemical Nomenclature: Covalent Molecules',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 8: Covalent Formulas & Particle Models (MCQ with SVG) ---
    genProblem8_CovalentFormulaAndParticle(rng) {
      const systems = [
        {
          name: 'dinitrogen pentoxide',
          formula: 'N₂O₅',
          svgType: 'n2o5',
          correct: '$\\text{N}_2\\text{O}_5$',
          distractors: [
            '$\\text{NO}_5$ (omits the di- prefix subscript for nitrogen)',
            '$\\text{N}_5\\text{O}_2$ (reverses the subscript indices between nitrogen and oxygen)',
            '$\\text{N}_2\\text{O}_4$ (identifies dinitrogen tetroxide instead of pentoxide)'
          ],
          explanation: 'Dinitrogen pentoxide specifies 2 nitrogen atoms and 5 oxygen atoms: $\\text{N}_2\\text{O}_5$.'
        },
        {
          name: 'tetraphosphorus decoxide',
          formula: 'P₄O₁₀',
          svgType: 'p4o10',
          correct: '$\\text{P}_4\\text{O}_{10}$',
          distractors: [
            '$\\text{PO}_{10}$ (omits the tetra- prefix subscript on phosphorus)',
            '$\\text{P}_2\\text{O}_5$ (represents the empirical formula rather than molecular formula)',
            '$\\text{P}_{10}\\text{O}_4$ (inverts the stoichiometry between phosphorus and oxygen)'
          ],
          explanation: 'Tetra- indicates 4 phosphorus atoms and deca- indicates 10 oxygen atoms: $\\text{P}_4\\text{O}_{10}$.'
        },
        {
          name: 'xenon tetrafluoride',
          formula: 'XeF₄',
          svgType: 'xef4',
          correct: '$\\text{XeF}_4$',
          distractors: [
            '$\\text{Xe}_4\\text{F}$ (places the tetra- prefix as a xenon subscript)',
            '$\\text{XeF}_6$ (represents xenon hexafluoride rather than tetrafluoride)',
            '$\\text{Xe}_2\\text{F}_4$ (incorrectly doubles the noble gas cation ratio)'
          ],
          explanation: 'Single xenon atom plus four fluorine atoms gives $\\text{XeF}_4$.'
        }
      ];

      const item = rng.pick(systems);
      const svgGraphic = this.generateCovalentSVG(item.svgType);
      const options = rng.shuffle([item.correct, ...item.distractors]);

      return {
        id: 'p8_covalent_particle_mcq',
        num: 8,
        topic: 'Molecular Formulas & Particle Models',
        stem: `Examine the particulate model below representing molecules of <strong>${item.name}</strong>. Which chemical formula correctly corresponds to this molecular compound?`,
        type: 'mcq_with_diagram',
        svgGraphic,
        options,
        expectedOption: item.correct,
        hint1: 'Prefixes directly determine the exact subscripts in molecular formulas.',
        hint2: 'Match the numerical prefixes to the elemental subscripts in the choices.',
        workedSolution: item.explanation
      };
    }

    generateCovalentSVG(type) {
      if (type === 'n2o5') {
        return `
          <svg viewBox="0 0 280 140" width="100%" height="140" style="background:#0f172a; border-radius:6px; border:1px solid #334155; display:block;">
            <text x="140" y="24" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="sans-serif">Molecular Particle Diagram: N₂O₅</text>
            <g transform="translate(140, 75)">
              <!-- Bridging oxygen -->
              <circle cx="0" cy="0" r="10" fill="#f87171" stroke="#dc2626" stroke-width="1.5" />
              <!-- Two nitrogens -->
              <circle cx="-35" cy="0" r="13" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
              <circle cx="35" cy="0" r="13" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
              <!-- Terminal oxygens -->
              <circle cx="-60" cy="-22" r="10" fill="#f87171" stroke="#dc2626" stroke-width="1.5" />
              <circle cx="-60" cy="22" r="10" fill="#f87171" stroke="#dc2626" stroke-width="1.5" />
              <circle cx="60" cy="-22" r="10" fill="#f87171" stroke="#dc2626" stroke-width="1.5" />
              <circle cx="60" cy="22" r="10" fill="#f87171" stroke="#dc2626" stroke-width="1.5" />
            </g>
            <text x="140" y="128" text-anchor="middle" fill="#cbd5e1" font-size="10" font-family="monospace">Blue = Nitrogen (2) | Red = Oxygen (5)</text>
          </svg>
        `;
      } else if (type === 'p4o10') {
        return `
          <svg viewBox="0 0 280 140" width="100%" height="140" style="background:#0f172a; border-radius:6px; border:1px solid #334155; display:block;">
            <text x="140" y="24" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="sans-serif">Cage Molecule Model: P₄O₁₀</text>
            <g transform="translate(140, 75)">
              <circle cx="-30" cy="-20" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
              <circle cx="30" cy="-20" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
              <circle cx="-30" cy="25" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
              <circle cx="30" cy="25" r="12" fill="#fbbf24" stroke="#d97706" stroke-width="1.5" />
              <circle cx="0" cy="-20" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
              <circle cx="0" cy="25" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
              <circle cx="-30" cy="2" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
              <circle cx="30" cy="2" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
              <circle cx="-60" cy="-30" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
              <circle cx="60" cy="-30" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
              <circle cx="-60" cy="35" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
              <circle cx="60" cy="35" r="8" fill="#f87171" stroke="#dc2626" stroke-width="1.2" />
            </g>
            <text x="140" y="128" text-anchor="middle" fill="#cbd5e1" font-size="10" font-family="monospace">Yellow = Phosphorus (4) | Red = Oxygen (10)</text>
          </svg>
        `;
      } else {
        return `
          <svg viewBox="0 0 280 140" width="100%" height="140" style="background:#0f172a; border-radius:6px; border:1px solid #334155; display:block;">
            <text x="140" y="24" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="sans-serif">Planar Geometry: XeF₄</text>
            <g transform="translate(140, 75)">
              <circle cx="0" cy="0" r="16" fill="#a855f7" stroke="#7e22ce" stroke-width="1.5" />
              <circle cx="-45" cy="-25" r="10" fill="#34d399" stroke="#059669" stroke-width="1.2" />
              <circle cx="45" cy="-25" r="10" fill="#34d399" stroke="#059669" stroke-width="1.2" />
              <circle cx="-45" cy="25" r="10" fill="#34d399" stroke="#059669" stroke-width="1.2" />
              <circle cx="45" cy="25" r="10" fill="#34d399" stroke="#059669" stroke-width="1.2" />
            </g>
            <text x="140" y="128" text-anchor="middle" fill="#cbd5e1" font-size="10" font-family="monospace">Purple = Xenon (1) | Green = Fluorine (4)</text>
          </svg>
        `;
      }
    }

    // --- Problem 9: Percent Composition Calculation (Calculation - 5 attempts) ---
    genProblem9_PercentCompositionCalc(rng) {
      const compounds = [
        { name: 'calcium carbonate', formula: 'CaCO₃', targetElem: 'calcium', elemSym: 'Ca', elemMass: 40.08, n: 1, molarMass: 100.09 },
        { name: 'water', formula: 'H₂O', targetElem: 'oxygen', elemSym: 'O', elemMass: 16.00, n: 1, molarMass: 18.02 },
        { name: 'carbon dioxide', formula: 'CO₂', targetElem: 'carbon', elemSym: 'C', elemMass: 12.01, n: 1, molarMass: 44.01 },
        { name: 'copper(II) sulfate', formula: 'CuSO₄', targetElem: 'copper', elemSym: 'Cu', elemMass: 63.55, n: 1, molarMass: 159.61 },
        { name: 'aluminum sulfate', formula: 'Al₂(SO₄)₃', targetElem: 'aluminum', elemSym: 'Al', elemMass: 26.98, n: 2, molarMass: 342.15 },
        { name: 'magnesium hydroxide', formula: 'Mg(OH)₂', targetElem: 'magnesium', elemSym: 'Mg', elemMass: 24.31, n: 1, molarMass: 58.33 }
      ];

      const item = rng.pick(compounds);
      const totalElemMass = item.elemMass * item.n;
      const percentVal = parseFloat(((totalElemMass / item.molarMass) * 100).toFixed(2));

      return {
        id: 'p9_pct_comp_calc',
        num: 9,
        topic: 'Percent Composition by Mass',
        stem: `Calculate the percent composition by mass of <strong>${item.targetElem}</strong> in pure <strong>${item.name}</strong> (${item.formula}). Express your answer as a percentage with units (e.g. <code>40.04%</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: percentVal,
          unit: '%',
          tolerance: 0.05
        },
        placeholder: 'e.g. 40.04 % or 40.04%',
        hint1: 'Percent Composition = (Total mass of target element in 1 mole / Molar mass of compound) × 100%.',
        hint2: `Molar mass of ${item.formula} = ${item.molarMass} g/mol. Mass of ${item.targetElem} = ${item.n} × ${item.elemMass} = ${totalElemMass.toFixed(2)} g/mol.`,
        workedSolution: `1. Mass of ${item.elemSym} = ${item.n} × ${item.elemMass} = ${totalElemMass.toFixed(2)} g/mol.\n2. Molar mass of ${item.formula} = ${item.molarMass} g/mol.\n3. Percent by mass = (${totalElemMass.toFixed(2)} / ${item.molarMass}) × 100% = ${percentVal}%.`
      };
    }

    // --- Problem 10: Comparative Percent Composition Ranking (Reorderable Cards) ---
    genProblem10_PercentCompRanking(rng) {
      const sets = [
        {
          theme: 'Agricultural Nitrogen Fertilizers',
          instruction: 'Rank the following nitrogen-containing fertilizer compounds in order of decreasing nitrogen content (% N by mass), placing the highest percentage at the top.',
          cards: [
            { id: 'urea', title: 'Urea: CO(NH₂)₂', value: 46.6, note: '46.6% N' },
            { id: 'nh4no3', title: 'Ammonium nitrate: NH₄NO₃', value: 35.0, note: '35.0% N' },
            { id: 'nh42so4', title: 'Ammonium sulfate: (NH₄)₂SO₄', value: 21.2, note: '21.2% N' },
            { id: 'kno3', title: 'Potassium nitrate: KNO₃', value: 13.9, note: '13.9% N' }
          ]
        },
        {
          theme: 'Commercial Iron Ores',
          instruction: 'Rank the following iron oxide minerals in order of decreasing iron content (% Fe by mass), placing the richest iron ore at the top.',
          cards: [
            { id: 'feo', title: 'Wüstite: FeO', value: 77.7, note: '77.7% Fe' },
            { id: 'fe3o4', title: 'Magnetite: Fe₃O₄', value: 72.4, note: '72.4% Fe' },
            { id: 'fe2o3', title: 'Hematite: Fe₂O₃', value: 69.9, note: '69.9% Fe' },
            { id: 'feso4', title: 'Iron(II) sulfate: FeSO₄', value: 36.8, note: '36.8% Fe' }
          ]
        }
      ];

      const item = rng.pick(sets);
      const correctOrder = [...item.cards].sort((a, b) => b.value - a.value).map((c) => c.id);
      const shuffledCards = rng.shuffle(item.cards);

      return {
        id: 'p10_ranking_comp',
        num: 10,
        topic: 'Comparative Percent Composition: Element Abundance',
        stem: `${item.instruction}<br><small style="color:var(--xl-ink-mute);">Drag items or use the up and down arrow buttons to arrange.</small>`,
        type: 'ranking',
        cards: shuffledCards,
        correctOrder,
        hint1: 'Calculate or estimate the ratio of the element total mass to the overall formula mass for each compound.',
        hint2: `Highest: ${item.cards.find((c) => c.id === correctOrder[0]).title}. Lowest: ${item.cards.find((c) => c.id === correctOrder[correctOrder.length - 1]).title}.`,
        workedSolution: `Descending order: ${correctOrder.map((id) => item.cards.find((c) => c.id === id).title).join(' > ')}.`
      };
    }

    // --- Problem 11: Empirical Formula Determination (Calculation - 5 attempts) ---
    genProblem11_EmpiricalFormulaCalc(rng) {
      const systems = [
        {
          stem: 'A sample of a compound is analyzed and found to contain <strong>40.0% carbon</strong>, <strong>6.7% hydrogen</strong>, and <strong>53.3% oxygen</strong> by mass. What is the empirical formula of the compound?',
          correct: 'CH2O',
          cSub: 1,
          hSub: 2,
          oSub: 1,
          hint2: 'Moles: C = 40.0 / 12.01 = 3.33 mol; H = 6.7 / 1.008 = 6.65 mol; O = 53.3 / 16.00 = 3.33 mol. Ratio C:H:O = 1:2:1.',
          worked: '1. Assume 100 g: 40.0 g C, 6.7 g H, 53.3 g O.\n2. Convert to moles: C = 3.33 mol, H = 6.65 mol, O = 3.33 mol.\n3. Divide by smallest (3.33): C = 1, H = 2, O = 1.\nEmpirical formula = CH₂O.'
        },
        {
          stem: 'A sample contains <strong>1.28 g of sulfur</strong> and <strong>1.92 g of oxygen</strong>. What is the empirical formula of the oxide of sulfur?',
          correct: 'SO3',
          sSub: 1,
          oSub: 3,
          hint2: 'Moles S = 1.28 / 32.06 = 0.0399 mol; Moles O = 1.92 / 16.00 = 0.120 mol. Ratio 0.120 / 0.0399 = 3.0.',
          worked: '1. Moles S: 1.28 g / 32.06 g/mol = 0.0399 mol.\n2. Moles O: 1.92 g / 16.00 g/mol = 0.120 mol.\n3. Ratio O:S = 0.120 / 0.0399 = 3.0.\nEmpirical formula = SO₃.'
        },
        {
          stem: 'A compound is analyzed to contain <strong>27.29% carbon</strong> and <strong>72.71% oxygen</strong> by mass. What is its empirical formula?',
          correct: 'CO2',
          cSub: 1,
          oSub: 2,
          hint2: 'Moles C = 27.29 / 12.01 = 2.272 mol; Moles O = 72.71 / 16.00 = 4.544 mol. Ratio 4.544 / 2.272 = 2.0.',
          worked: '1. In 100 g: 27.29 g C = 2.272 mol; 72.71 g O = 4.544 mol.\n2. Ratio O:C = 4.544 / 2.272 = 2.0.\nEmpirical formula = CO₂.'
        },
        {
          stem: 'An organic solvent consists of <strong>52.14% carbon</strong>, <strong>13.13% hydrogen</strong>, and <strong>34.73% oxygen</strong> by mass. Determine its empirical formula.',
          correct: 'C2H6O',
          cSub: 2,
          hSub: 6,
          oSub: 1,
          hint2: 'Moles: C = 52.14 / 12.01 = 4.34 mol; H = 13.13 / 1.008 = 13.03 mol; O = 34.73 / 16.00 = 2.17 mol. Divide by 2.17: C = 2, H = 6, O = 1.',
          worked: '1. Moles: C = 4.341 mol, H = 13.026 mol, O = 2.171 mol.\n2. Divide by 2.171: C = 2.0, H = 6.0, O = 1.0.\nEmpirical formula = C₂H₆O.'
        }
      ];

      const item = rng.pick(systems);

      return {
        id: 'p11_empirical_calc',
        num: 11,
        topic: 'Empirical Formula Determination',
        stem: item.stem,
        type: 'formula_entry',
        maxAttempts: 5,
        expectedFormula: item.correct,
        placeholder: 'e.g. CH2O',
        hint1: 'Assume a 100 g sample, convert grams of each element to moles using atomic masses, and divide by the smallest mole value to find whole-number mole ratios.',
        hint2: item.hint2,
        workedSolution: item.worked
      };
    }

    // --- Problem 12: Molecular Formula Determination (Calculation - 5 attempts) ---
    genProblem12_MolecularFormulaCalc(rng) {
      const systems = [
        {
          empirical: 'CH₂',
          empMass: 14.03,
          multiplier: 6,
          molarMass: 84.16,
          molecular: 'C6H12',
          explanation: 'Molar mass / Empirical mass = 84.16 / 14.03 = 6. Multiply CH₂ by 6 to obtain C₆H₁₂.'
        },
        {
          empirical: 'C₃H₄O₂',
          empMass: 72.06,
          multiplier: 2,
          molarMass: 144.12,
          molecular: 'C6H8O4',
          explanation: 'Molar mass / Empirical mass = 144.12 / 72.06 = 2. Multiply C₃H₄O₂ by 2 to obtain C₆H₈O₄.'
        },
        {
          empirical: 'NO₂',
          empMass: 46.01,
          multiplier: 2,
          molarMass: 92.02,
          molecular: 'N2O4',
          explanation: 'Molar mass / Empirical mass = 92.02 / 46.01 = 2. Multiply NO₂ by 2 to obtain N₂O₄.'
        },
        {
          empirical: 'CH₂O',
          empMass: 30.03,
          multiplier: 6,
          molarMass: 180.16,
          molecular: 'C6H12O6',
          explanation: 'Molar mass / Empirical mass = 180.16 / 30.03 = 6. Multiply CH₂O by 6 to obtain C₆H₁₂O₆ (glucose).'
        }
      ];

      const item = rng.pick(systems);

      return {
        id: 'p12_molecular_calc',
        num: 12,
        topic: 'Molecular Formula from Molar Mass',
        stem: `A chemical compound has the empirical formula <strong>${item.empirical}</strong> and an experimentally measured molecular molar mass of <strong>${item.molarMass} g/mol</strong>. Determine its molecular formula.`,
        type: 'formula_entry',
        maxAttempts: 5,
        expectedFormula: item.molecular,
        placeholder: 'e.g. C6H12',
        hint1: 'Calculate the molar mass of the empirical formula unit, then divide the experimental molar mass by the empirical formula mass to find integer multiple n.',
        hint2: `Empirical mass of ${item.empirical} = ${item.empMass} g/mol. n = ${item.molarMass} / ${item.empMass} = ${item.multiplier}.`,
        workedSolution: `1. Empirical mass (${item.empirical}) = ${item.empMass} g/mol.\n2. Multiple n = ${item.molarMass} / ${item.empMass} = ${item.multiplier}.\n3. Molecular formula = (${item.empirical}) × ${item.multiplier} = ${item.molecular}.`
      };
    }

    // --- Problem 13: Grams <-> Moles <-> Particles Conversions (Calculation - 5 attempts) ---
    genProblem13_MoleConversionsCalc(rng) {
      const mode = rng.pick(['mass_to_mol', 'mol_to_particles', 'particles_to_mol']);

      if (mode === 'mass_to_mol') {
        const compounds = [
          { name: 'sodium chloride (NaCl)', massPerMol: 58.44 },
          { name: 'magnesium (Mg)', massPerMol: 24.31 },
          { name: 'calcium carbonate (CaCO₃)', massPerMol: 100.09 },
          { name: 'water (H₂O)', massPerMol: 18.02 }
        ];
        const item = rng.pick(compounds);
        const moles = rng.float(1.2, 4.5, 2);
        const givenGrams = parseFloat((moles * item.massPerMol).toFixed(1));

        return {
          id: 'p13_mole_conversion',
          num: 13,
          topic: 'The Mole: Mass to Molar Conversions',
          stem: `How many moles are present in a sample containing <strong>${givenGrams} grams</strong> of ${item.name}? Include units in your response (e.g. <code>2.50 mol</code>).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: moles,
            unit: 'mol',
            tolerance: 0.02
          },
          placeholder: 'e.g. 2.50 mol',
          hint1: 'Moles = mass in grams / molar mass (g/mol).',
          hint2: `Divide ${givenGrams} g by ${item.massPerMol} g/mol.`,
          workedSolution: `Moles = ${givenGrams} g / ${item.massPerMol} g/mol = ${moles} mol.`
        };
      } else if (mode === 'mol_to_particles') {
        const elem = rng.pick([
          { name: 'iron (Fe)', sym: 'Fe' },
          { name: 'copper (Cu)', sym: 'Cu' },
          { name: 'zinc (Zn)', sym: 'Zn' },
          { name: 'silver (Ag)', sym: 'Ag' }
        ]);
        const moles = rng.float(0.4, 2.5, 2);
        const particles = moles * 6.022e23;

        return {
          id: 'p13_mole_conversion',
          num: 13,
          topic: 'The Mole: Moles to Particle Count',
          stem: `Calculate the total number of individual atoms present in <strong>${moles} moles</strong> of pure ${elem.name}. Enter your answer in scientific notation with units (e.g. <code>atoms</code>).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: particles,
            unit: 'atoms',
            tolerance: 0.03
          },
          placeholder: 'e.g. 4.52 x 10^23 atoms',
          hint1: 'Atoms = moles × Avogadro\'s number (6.022 × 10²³ atoms/mol).',
          hint2: `Multiply ${moles} mol by 6.022 × 10²³ atoms/mol.`,
          workedSolution: `Atoms = ${moles} mol × 6.022 × 10²³ atoms/mol = ${particles.toExponential(2)} atoms.`
        };
      } else {
        const factor = rng.float(1.5, 5.0, 2);
        const particles = factor * 1e24;
        const moles = parseFloat((particles / 6.022e23).toFixed(2));

        return {
          id: 'p13_mole_conversion',
          num: 13,
          topic: 'The Mole: Particles to Molar Quantity',
          stem: `A sample contains <strong>${particles.toExponential(2)} molecules</strong> of water (H₂O). Calculate the quantity of water in moles, entering your answer with units (e.g. <code>2.50 mol</code>).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: moles,
            unit: 'mol',
            tolerance: 0.03
          },
          placeholder: 'e.g. 2.50 mol',
          hint1: 'Moles = number of particles / Avogadro\'s number (6.022 × 10²³ molecules/mol).',
          hint2: `Divide ${particles.toExponential(2)} by 6.022 × 10²³.`,
          workedSolution: `Moles = (${particles.toExponential(2)}) / (6.022 × 10²³) = ${moles} mol.`
        };
      }
    }

    // --- Problem 14: Gas Volume at STP Conversions (Calculation - 5 attempts) ---
    genProblem14_STPGasVolumeCalc(rng) {
      const mode = rng.pick(['liters_to_moles', 'moles_to_liters', 'liters_to_mass']);

      if (mode === 'liters_to_moles') {
        const gas = rng.pick(['carbon dioxide (CO₂)', 'nitrogen gas (N₂)', 'oxygen gas (O₂)', 'methane (CH₄)']);
        const volumeL = rng.pick([11.2, 22.4, 33.6, 44.8, 5.60, 16.8]);
        const moles = parseFloat((volumeL / 22.414).toFixed(2));

        return {
          id: 'p14_stp_volume',
          num: 14,
          topic: 'Gas Volumes at STP: Molar Gas Volume',
          stem: `At standard temperature and pressure (STP: 0 °C, 1 atm), 1 mole of any ideal gas occupies exactly <strong>22.414 L</strong>. Calculate the number of moles present in a <strong>${volumeL} L</strong> sample of ${gas} at STP. Include units in your answer (e.g. <code>mol</code>).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: moles,
            unit: 'mol',
            tolerance: 0.02
          },
          placeholder: 'e.g. 1.00 mol',
          hint1: 'Moles of gas at STP = Volume in liters / 22.414 L/mol.',
          hint2: `Divide ${volumeL} L by 22.414 L/mol.`,
          workedSolution: `Moles = ${volumeL} L / 22.414 L/mol = ${moles} mol.`
        };
      } else if (mode === 'moles_to_liters') {
        const moles = rng.float(0.5, 3.5, 2);
        const volumeL = parseFloat((moles * 22.414).toFixed(1));

        return {
          id: 'p14_stp_volume',
          num: 14,
          topic: 'Gas Volumes at STP: Molar Volume Expansion',
          stem: `What volume in liters does a <strong>${moles} mol</strong> sample of neon gas occupy at standard temperature and pressure (STP)? Include units in your answer (e.g. <code>22.4 L</code>).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: volumeL,
            unit: 'l',
            tolerance: 0.03
          },
          placeholder: 'e.g. 22.4 L',
          hint1: 'Volume at STP = moles × 22.414 L/mol.',
          hint2: `Multiply ${moles} mol by 22.414 L/mol.`,
          workedSolution: `Volume = ${moles} mol × 22.414 L/mol = ${volumeL} L.`
        };
      } else {
        const gas = rng.pick([
          { name: 'oxygen gas (O₂)', molarMass: 32.00 },
          { name: 'carbon dioxide (CO₂)', molarMass: 44.01 },
          { name: 'helium gas (He)', molarMass: 4.00 }
        ]);
        const volumeL = rng.pick([11.2, 22.4, 33.6, 5.6]);
        const moles = volumeL / 22.414;
        const massG = parseFloat((moles * gas.molarMass).toFixed(1));

        return {
          id: 'p14_stp_volume',
          num: 14,
          topic: 'Gas Volumes at STP: Volume to Mass Chain',
          stem: `Calculate the mass in grams of a <strong>${volumeL} L</strong> sample of pure ${gas.name} at standard temperature and pressure (STP). Include units in your answer (e.g. <code>32.0 g</code>).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: massG,
            unit: 'g',
            tolerance: 0.03
          },
          placeholder: 'e.g. 32.0 g',
          hint1: 'Step 1: Convert liters to moles using 22.414 L/mol. Step 2: Convert moles to grams using the gas molar mass.',
          hint2: `Moles = ${volumeL} / 22.414 = ${moles.toFixed(3)} mol. Mass = ${moles.toFixed(3)} mol × ${gas.molarMass} g/mol.`,
          workedSolution: `1. Moles = ${volumeL} L / 22.414 L/mol = ${moles.toFixed(3)} mol.\n2. Mass = ${moles.toFixed(3)} mol × ${gas.molarMass} g/mol = ${massG} g.`
        };
      }
    }

    // --- Problem 15: Compound Mass to Constituent Atoms (Calculation - 5 attempts) ---
    genProblem15_CompoundToAtomsCalc(rng) {
      const items = [
        {
          name: 'glucose (C₆H₁₂O₆)',
          molarMass: 180.16,
          targetAtom: 'oxygen atoms',
          atomSubscript: 6,
          massGrams: rng.int(20, 90)
        },
        {
          name: 'aluminum sulfate, Al₂(SO₄)₃',
          molarMass: 342.15,
          targetAtom: 'aluminum atoms',
          atomSubscript: 2,
          massGrams: rng.int(30, 85)
        },
        {
          name: 'ethanol (C₂H₅OH)',
          molarMass: 46.07,
          targetAtom: 'hydrogen atoms',
          atomSubscript: 6,
          massGrams: rng.int(25, 75)
        }
      ];

      const item = rng.pick(items);
      const molesCompound = item.massGrams / item.molarMass;
      const molesAtoms = molesCompound * item.atomSubscript;
      const totalAtoms = molesAtoms * 6.022e23;

      return {
        id: 'p15_compound_to_atoms',
        num: 15,
        topic: 'Dimensional Analysis: Mass to Constituent Atoms',
        stem: `How many individual <strong>${item.targetAtom}</strong> are present in a <strong>${item.massGrams} g</strong> sample of pure ${item.name}? Enter your answer in scientific notation with units (e.g. <code>atoms</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: totalAtoms,
          unit: 'atoms',
          tolerance: 0.04
        },
        placeholder: 'e.g. 9.03 x 10^23 atoms',
        hint1: 'Dimensional analysis chain: grams of compound → moles of compound → moles of target element → total atoms.',
        hint2: `Moles compound = ${item.massGrams} g / ${item.molarMass} g/mol. Moles atoms = Moles compound × ${item.atomSubscript}. Total atoms = Moles atoms × 6.022 × 10²³.`,
        workedSolution: `1. Moles compound: ${item.massGrams} g / ${item.molarMass} g/mol = ${molesCompound.toFixed(4)} mol.\n2. Moles of target atoms: ${molesCompound.toFixed(4)} mol × ${item.atomSubscript} = ${molesAtoms.toFixed(4)} mol.\n3. Total atoms: ${molesAtoms.toFixed(4)} mol × 6.022 × 10²³ atoms/mol = ${totalAtoms.toExponential(2)} atoms.`
      };
    }

    // --- Problem 16: Environmental Chemistry Dimensional Analysis (Calculation - 5 attempts) ---
    genProblem16_HazeEnvironmentalDA(rng) {
      const rateMicrograms = rng.int(500, 750);
      const hoursPerDay = rng.int(6, 8);
      const daysPerWeek = rng.int(5, 6);
      const weeks = rng.int(15, 30);
      const leadMolarMass = 207.2;

      const totalHours = hoursPerDay * daysPerWeek * weeks;
      const totalMicrograms = rateMicrograms * totalHours;
      const totalGrams = totalMicrograms / 1e6;
      const totalMoles = parseFloat((totalGrams / leadMolarMass).toFixed(5));

      return {
        id: 'p16_haze_environmental_da',
        num: 16,
        topic: 'Applied Dimensional Analysis: Atmospheric Pollutants',
        stem: `During a severe seasonal haze event in Southeast Asia, an air particulate filtration unit samples airborne lead (Pb, molar mass = <strong>207.2 g/mol</strong>). The apparatus collects <strong>${rateMicrograms} μg of lead per hour</strong> ($1\\text{ g} = 10^6\\text{ μg}$). The monitoring station operates <strong>${hoursPerDay} hours per day</strong>, <strong>${daysPerWeek} days per week</strong>, for <strong>${weeks} weeks</strong>. Using dimensional analysis, calculate the total quantity of lead collected in <strong>moles</strong>. Enter your answer with units (e.g. <code>mol</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: totalMoles,
          unit: 'mol',
          tolerance: 0.03
        },
        placeholder: 'e.g. 0.00243 mol or 2.43 x 10^-3 mol',
        hint1: 'Set up a continuous unit conversion chain: hours → total micrograms → grams → moles of lead.',
        hint2: `Total hours = ${hoursPerDay} hr/day × ${daysPerWeek} day/wk × ${weeks} wks = ${totalHours} hr. Total grams = (${totalHours} × ${rateMicrograms} μg) / 10⁶ = ${totalGrams.toFixed(4)} g. Divide by 207.2 g/mol.`,
        workedSolution: `1. Total Operating Hours: ${hoursPerDay} hr/day × ${daysPerWeek} day/wk × ${weeks} wk = ${totalHours} hours.\n2. Total Mass of Lead: ${totalHours} hr × ${rateMicrograms} μg/hr = ${totalMicrograms.toLocaleString()} μg = ${totalGrams.toFixed(4)} g.\n3. Moles of Lead: ${totalGrams.toFixed(4)} g / 207.2 g/mol = ${totalMoles} mol (${totalMoles.toExponential(2)} mol).`
      };
    }

    // ============================================================
    // 7. STATE PERSISTENCE & GRADING
    // ============================================================
    loadSavedState() {
      const key = `xl_chem_state_${this.seed}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          this.currentStatus = JSON.parse(saved);
        } catch {
          this.currentStatus = {};
        }
      } else {
        this.currentStatus = {};
      }

      this.problems.forEach((p) => {
        if (!this.currentStatus[p.id]) {
          this.currentStatus[p.id] = {
            attempts: 0,
            solved: false,
            exhausted: false,
            score: 0,
            feedback: '',
            userEntry: '',
            rankingOrder: p.type === 'ranking' ? p.cards.map((c) => c.id) : null
          };
        }
      });
      this.updateMetrics();
    }

    saveState() {
      const key = `xl_chem_state_${this.seed}`;
      localStorage.setItem(key, JSON.stringify(this.currentStatus));
      this.updateMetrics();
    }

    updateMetrics() {
      let solvedCount = 0;
      let totalCount = this.problems.length;
      let totalAttempts = 0;

      this.problems.forEach((p) => {
        const s = this.currentStatus[p.id];
        if (s) {
          if (s.solved) solvedCount++;
          totalAttempts += s.attempts || 0;
        }
      });

      const pct = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
      if (this.elProgressFill) {
        this.elProgressFill.style.width = `${pct}%`;
      }
      if (this.elMetricsLabel) {
        this.elMetricsLabel.textContent = `${solvedCount} of ${totalCount} Solved (${pct}%)`;
      }

      const bannerStats = document.getElementById('bannerAttemptStats');
      if (bannerStats) {
        bannerStats.innerHTML = `<span style="font-size:0.85rem; color:var(--xl-ink-mute); font-family:var(--font-mono);">Progress: <b>${solvedCount}/${totalCount}</b> complete &middot; Total attempts: <b>${totalAttempts}</b></span>`;
      }

      if (this.elExportBtn) {
        this.elExportBtn.disabled = solvedCount === 0;
      }
    }

    // ============================================================
    // 8. DYNAMIC DOM RENDERING
    // ============================================================
    renderDeck() {
      if (!this.elProblemDeck) return;
      this.elProblemDeck.innerHTML = '';

      this.problems.forEach((prob) => {
        const card = document.createElement('article');
        card.className = 'problem-card';
        card.id = `card_${prob.id}`;

        const state = this.currentStatus[prob.id] || {
          attempts: 0,
          solved: false,
          exhausted: false
        };

        if (state.solved) {
          card.classList.add('solved');
        } else if (state.exhausted) {
          card.classList.add('exhausted');
        }

        const max = prob.maxAttempts || this.maxAttempts;
        const dotsHTML = this.renderAttemptDots(state, prob);

        let contentHTML = '';
        if (prob.type === 'mcq' || prob.type === 'mcq_with_diagram') {
          contentHTML = this.renderMCQContent(prob, state);
        } else if (prob.type === 'ranking') {
          contentHTML = this.renderRankingContent(prob, state);
        } else if (prob.type === 'formula_entry') {
          contentHTML = this.renderFormulaEntryContent(prob, state);
        } else {
          contentHTML = this.renderCalculationContent(prob, state);
        }

        card.innerHTML = `
          <div class="problem-card-header">
            <div class="problem-meta">
              <span class="problem-number">#${prob.num}</span>
              <span class="problem-topic">${prob.topic}</span>
            </div>
            <div class="attempt-tracker">
              <span class="attempt-label">${state.attempts}/${max} Tries</span>
              <div class="attempt-dots">${dotsHTML}</div>
            </div>
          </div>

          <div class="problem-stem">${prob.stem}</div>

          ${prob.svgGraphic ? `<div style="margin:1rem 0;">${prob.svgGraphic}</div>` : ''}

          ${contentHTML}

          ${
            state.feedback
              ? `
            <div class="feedback-banner ${state.solved ? 'feedback-success' : 'feedback-error'}">
              ${state.feedback}
            </div>
          `
              : ''
          }

          ${
            state.exhausted && !state.solved
              ? `
            <div class="worked-solution-box">
              <div class="solution-header">Step-by-Step Worked Solution</div>
              <div class="solution-body">${prob.workedSolution.replace(/\\n/g, '<br>')}</div>
            </div>
          `
              : ''
          }
        `;

        this.elProblemDeck.appendChild(card);
        this.bindCardEvents(card, prob, state);
      });

      if (window.renderMathInElement) {
        window.renderMathInElement(this.elProblemDeck, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false }
          ],
          throwOnError: false
        });
      }
    }

    renderAttemptDots(state, prob) {
      const max = prob && prob.maxAttempts ? prob.maxAttempts : this.maxAttempts;
      let html = '';
      for (let i = 1; i <= max; i++) {
        let cls = 'attempt-dot';
        if (state.solved && i === state.attempts) {
          cls += ' success';
        } else if (i <= state.attempts) {
          cls += ' used';
        }
        html += `<span class="${cls}"></span>`;
      }
      return html;
    }

    renderMCQContent(prob, state) {
      const disabled = state.solved || state.exhausted ? 'disabled' : '';
      const optionsHTML = prob.options
        .map((opt, idx) => {
          const isSelected = state.userEntry === opt;
          let optCls = 'mcq-option-label';
          if (isSelected) optCls += ' selected';
          if (state.solved && isSelected) optCls += ' correct';
          if (state.exhausted && opt === prob.expectedOption) optCls += ' reveal-correct';

          return `
            <label class="${optCls}" data-val="${opt}">
              <input type="radio" name="opt_${prob.id}" value="${opt}" ${isSelected ? 'checked' : ''} ${disabled}>
              <span class="mcq-indicator">${String.fromCharCode(65 + idx)}</span>
              <span class="mcq-text">${opt}</span>
            </label>
          `;
        })
        .join('');

      return `
        <div class="mcq-grid" id="mcq_${prob.id}">
          ${optionsHTML}
        </div>
        ${
          !state.solved && !state.exhausted
            ? `
          <div style="margin-top:1rem; display:flex; justify-content:flex-end;">
            <button class="btn btn-primary btn-sm btn-submit-mcq" data-prob="${prob.id}">Submit Answer</button>
          </div>
        `
            : ''
        }
      `;
    }

    renderFormulaEntryContent(prob, state) {
      const disabled = state.solved || state.exhausted ? 'disabled' : '';
      return `
        <div class="input-entry-row" style="margin-top:1rem; display:flex; gap:0.5rem; align-items:center;">
          <input type="text" class="modal-input" id="in_${prob.id}" placeholder="${prob.placeholder || 'e.g. CH2O'}" value="${state.userEntry || ''}" ${disabled} style="max-width:260px; font-family:var(--font-mono);">
          ${
            !state.solved && !state.exhausted
              ? `
            <button class="btn btn-primary btn-sm btn-submit-calc" data-prob="${prob.id}">Check Formula</button>
          `
              : ''
          }
        </div>
      `;
    }

    renderCalculationContent(prob, state) {
      const disabled = state.solved || state.exhausted ? 'disabled' : '';
      return `
        <div class="input-entry-row" style="margin-top:1rem; display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <input type="text" class="modal-input" id="in_${prob.id}" placeholder="${prob.placeholder || 'Value and unit'}" value="${state.userEntry || ''}" ${disabled} style="max-width:320px; font-family:var(--font-mono);">
          ${
            !state.solved && !state.exhausted
              ? `
            <button class="btn btn-primary btn-sm btn-submit-calc" data-prob="${prob.id}">Check Answer</button>
          `
              : ''
          }
        </div>
      `;
    }

    renderRankingContent(prob, state) {
      const order = state.rankingOrder || prob.cards.map((c) => c.id);
      const disabled = state.solved || state.exhausted;

      const cardsHTML = order
        .map((id, idx) => {
          const card = prob.cards.find((c) => c.id === id);
          return `
            <div class="ranking-card" data-id="${id}">
              <div class="ranking-rank">${idx + 1}</div>
              <div class="ranking-content">
                <div class="ranking-title">${card.title}</div>
                ${state.solved || state.exhausted ? `<div class="ranking-meta">${card.note}</div>` : ''}
              </div>
              ${
                !disabled
                  ? `
                <div class="ranking-controls">
                  <button type="button" class="btn-rank-move btn-rank-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>▲</button>
                  <button type="button" class="btn-rank-move btn-rank-down" data-idx="${idx}" ${idx === order.length - 1 ? 'disabled' : ''}>▼</button>
                </div>
              `
                  : ''
              }
            </div>
          `;
        })
        .join('');

      return `
        <div class="ranking-list" id="rankList_${prob.id}">
          ${cardsHTML}
        </div>
        ${
          !disabled
            ? `
          <div style="margin-top:1rem; display:flex; justify-content:flex-end;">
            <button class="btn btn-primary btn-sm btn-submit-rank" data-prob="${prob.id}">Submit Ranking Order</button>
          </div>
        `
            : ''
        }
      `;
    }

    bindCardEvents(card, prob, state) {
      if (prob.type === 'mcq' || prob.type === 'mcq_with_diagram') {
        const labels = card.querySelectorAll('.mcq-option-label');
        labels.forEach((lbl) => {
          lbl.addEventListener('click', () => {
            if (state.solved || state.exhausted) return;
            labels.forEach((l) => l.classList.remove('selected'));
            lbl.classList.add('selected');
            const radio = lbl.querySelector('input');
            if (radio) radio.checked = true;
          });
        });

        const submitBtn = card.querySelector('.btn-submit-mcq');
        if (submitBtn) {
          submitBtn.addEventListener('click', () => {
            const selected = card.querySelector('input[type="radio"]:checked');
            if (!selected) {
              alert('Please select an option first.');
              return;
            }
            this.handleAnswerCheck(prob, selected.value);
          });
        }
      } else if (prob.type === 'ranking') {
        const upBtns = card.querySelectorAll('.btn-rank-up');
        const downBtns = card.querySelectorAll('.btn-rank-down');

        upBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (idx > 0) {
              const order = [...state.rankingOrder];
              [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
              state.rankingOrder = order;
              this.renderDeck();
            }
          });
        });

        downBtns.forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (idx < state.rankingOrder.length - 1) {
              const order = [...state.rankingOrder];
              [order[idx + 1], order[idx]] = [order[idx], order[idx + 1]];
              state.rankingOrder = order;
              this.renderDeck();
            }
          });
        });

        const submitRankBtn = card.querySelector('.btn-submit-rank');
        if (submitRankBtn) {
          submitRankBtn.addEventListener('click', () => {
            this.handleRankingCheck(prob);
          });
        }
      } else {
        const checkBtn = card.querySelector('.btn-submit-calc');
        const input = card.querySelector(`#in_${prob.id}`);
        if (checkBtn && input) {
          checkBtn.addEventListener('click', () => {
            this.handleAnswerCheck(prob, input.value.trim());
          });
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              this.handleAnswerCheck(prob, input.value.trim());
            }
          });
        }
      }
    }

    handleRankingCheck(prob) {
      const state = this.currentStatus[prob.id];
      if (state.solved || state.exhausted) return;

      state.attempts++;
      const current = state.rankingOrder;
      const expected = prob.correctOrder;

      const isCorrect = current.every((id, idx) => id === expected[idx]);
      state.userEntry = current.join(' > ');

      if (isCorrect) {
        state.solved = true;
        state.score = 1;
        state.feedback = 'Correct! All compounds are arranged in the precise descending order.';
      } else {
        state.score = 0;
        const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
        state.feedback = `Incorrect order. ${hint}`;
      }

      const max = prob.maxAttempts || this.maxAttempts;
      if (!state.solved && state.attempts >= max) {
        state.exhausted = true;
        state.feedback += ' Attempts exhausted. Review the worked solution below.';
      }

      this.saveState();
      this.renderDeck();
    }

    handleAnswerCheck(prob, rawInput) {
      const state = this.currentStatus[prob.id];
      if (state.solved || state.exhausted) return;

      if (!rawInput) {
        alert('Please enter or select an answer.');
        return;
      }

      state.attempts++;
      state.userEntry = rawInput;

      if (prob.type === 'mcq' || prob.type === 'mcq_with_diagram') {
        if (rawInput === prob.expectedOption) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Outstanding conceptual reasoning.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect choice. ${hint}`;
        }
      } else if (prob.type === 'formula_entry') {
        const cleanInput = rawInput.replace(/\s+/g, '').toUpperCase();
        const cleanExpected = prob.expectedFormula.replace(/\s+/g, '').toUpperCase();

        if (cleanInput === cleanExpected) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct chemical formula!';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Formula does not match expected stoichiometry. ${hint}`;
        }
      } else {
        const parsed = window.SmartParser.parse(rawInput);
        const res = window.SmartParser.evaluate(parsed, prob.expected);

        if (res.status === 'correct') {
          state.solved = true;
          state.score = 1;
          state.feedback = res.feedback + (res.sigFigWarning ? ' ' + res.sigFigWarning : '');
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `${res.feedback} ${hint}`;
        }
      }

      const max = prob.maxAttempts || this.maxAttempts;
      if (!state.solved && state.attempts >= max) {
        state.exhausted = true;
        state.feedback += ' Attempts exhausted. Study the worked solution below.';
      }

      this.saveState();
      this.renderDeck();
    }

    // ============================================================
    // 9. REFERENCE DRAWER & PERIODIC TABLE
    // ============================================================
    initReferenceCenter() {
      const tabBtns = document.querySelectorAll('.drawer-tab-btn');
      tabBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          tabBtns.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const targetId = btn.dataset.target;
          document.querySelectorAll('.drawer-tab-content').forEach((c) => (c.style.display = 'none'));
          const target = document.getElementById(targetId);
          if (target) target.style.display = 'block';
        });
      });

      this.renderPeriodicTable();
    }

    renderPeriodicTable() {
      const grid = document.getElementById('refPtableGrid');
      if (!grid) return;
      grid.innerHTML = '';

      PERIODIC_ELEMENTS.forEach((elem) => {
        const cell = document.createElement('div');
        cell.className = `ptable-cell cell-${elem.kind}`;
        cell.style.gridColumn = elem.group;
        cell.style.gridRow = elem.period;
        cell.innerHTML = `
          <div class="ptable-num">${elem.z}</div>
          <div class="ptable-sym">${elem.sym}</div>
          <div class="ptable-mass">${elem.mass.toFixed(2)}</div>
        `;

        cell.addEventListener('click', () => this.inspectElement(elem));
        grid.appendChild(cell);
      });
    }

    inspectElement(elem) {
      const emptyBox = document.getElementById('inspectorEmpty');
      const detailBox = document.getElementById('inspectorDetails');
      if (emptyBox) emptyBox.style.display = 'none';
      if (!detailBox) return;

      detailBox.style.display = 'block';
      detailBox.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--xl-border); padding-bottom:0.4rem;">
          <div>
            <span style="font-size:1.25rem; font-weight:800; color:var(--xl-primary);">${elem.name} (${elem.sym})</span>
            <span style="font-size:0.75rem; color:var(--xl-ink-mute); font-family:var(--font-mono); margin-left:0.5rem;">Atomic # ${elem.z}</span>
          </div>
          <span class="station-badge">${elem.kind.toUpperCase()}</span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:0.5rem; margin-top:0.6rem; font-size:0.8rem; font-family:var(--font-mono);">
          <div>Molar Mass: <b>${elem.mass.toFixed(3)} g/mol</b></div>
          <div>Period: <b>${elem.period}</b> | Group: <b>${elem.group}</b></div>
          <div>Common Charges: <b>${elem.charge}</b></div>
          <div>Atomic Radius: <b>${elem.radius} pm</b></div>
          <div>1st Ionization: <b>${elem.ie} kJ/mol</b></div>
          <div>Electronegativity: <b>${elem.en || 'N/A'}</b></div>
        </div>
      `;
    }

    // ============================================================
    // 10. DRAGGABLE SCIENTIFIC MINI-CALCULATOR
    // ============================================================
    initCalculator() {
      const keys = document.querySelectorAll('.calc-btn');
      keys.forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.key;
          this.handleCalcKey(key);
        });
      });

      const handle = document.getElementById('calcDragHandle');
      if (handle && this.elCalcWidget) {
        let isDragging = false;
        let startY = 0;
        let startTop = 0;

        handle.addEventListener('pointerdown', (e) => {
          isDragging = true;
          startY = e.clientY;
          startTop = this.elCalcWidget.offsetTop;
          handle.setPointerCapture(e.pointerId);
        });

        handle.addEventListener('pointermove', (e) => {
          if (!isDragging) return;
          const dy = e.clientY - startY;
          this.elCalcWidget.style.top = `${Math.max(60, startTop + dy)}px`;
        });

        handle.addEventListener('pointerup', (e) => {
          isDragging = false;
          handle.releasePointerCapture(e.pointerId);
        });
      }
    }

    handleCalcKey(key) {
      if (key === 'clear') {
        this.calcBuffer = '';
        this.elCalcVal.textContent = '0';
        this.elCalcExpr.textContent = '';
      } else if (key === 'del') {
        this.calcBuffer = this.calcBuffer.slice(0, -1);
        this.elCalcVal.textContent = this.calcBuffer || '0';
      } else if (key === '=') {
        try {
          let expr = this.calcBuffer
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/EE/g, '*10**');
          const res = Function(`"use strict"; return (${expr})`)();
          this.elCalcExpr.textContent = `${this.calcBuffer} =`;
          this.elCalcVal.textContent = String(Number(res.toPrecision(8)));
          this.calcBuffer = String(res);
        } catch {
          this.elCalcVal.textContent = 'Error';
        }
      } else if (key === 'sqrt') {
        try {
          const val = Function(`"use strict"; return (${this.calcBuffer || '0'})`)();
          const res = Math.sqrt(val);
          this.elCalcExpr.textContent = `√(${this.calcBuffer}) =`;
          this.elCalcVal.textContent = String(Number(res.toPrecision(8)));
          this.calcBuffer = String(res);
        } catch {
          this.elCalcVal.textContent = 'Error';
        }
      } else if (key === 'pm') {
        if (this.calcBuffer.startsWith('-')) {
          this.calcBuffer = this.calcBuffer.slice(1);
        } else {
          this.calcBuffer = '-' + this.calcBuffer;
        }
        this.elCalcVal.textContent = this.calcBuffer;
      } else if (key === 'ee') {
        this.calcBuffer += 'EE';
        this.elCalcVal.textContent = this.calcBuffer;
      } else {
        this.calcBuffer += key;
        this.elCalcVal.textContent = this.calcBuffer;
      }
    }

    // ============================================================
    // 11. REPORT GENERATOR & DIGITAL SEAL (PRINT / EXPORT)
    // ============================================================
    async handleExportReport() {
      const total = this.problems.length;
      let solvedCount = 0;
      let totalScore = 0;
      let totalAttempts = 0;
      let firstTry = 0;
      let secondTry = 0;
      let thirdTry = 0;
      let exhaustedCount = 0;

      this.problems.forEach((p) => {
        const s = this.currentStatus[p.id];
        if (s.solved) {
          solvedCount++;
          totalScore += s.score || 0;
          if (s.attempts === 1) firstTry++;
          else if (s.attempts === 2) secondTry++;
          else if (s.attempts >= 3) thirdTry++;
        } else if (s.exhausted) {
          exhaustedCount++;
        }
        totalAttempts += s.attempts;
      });

      const avgAttempts = total > 0 ? (totalAttempts / total).toFixed(1) : '0';
      const timestamp = new Date().toISOString();
      const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      const sealCode = await computeDigitalSeal(
        this.studentName,
        this.seed,
        totalScore,
        total,
        timestamp.split('T')[0]
      );

      // Build QR Code pointing to verify.html with unit=2
      const baseUrl =
        window.location.protocol === 'file:'
          ? 'verify.html'
          : window.location.origin + window.location.pathname.replace('unit2.html', 'verify.html');
      const verifyUrl = `${baseUrl}?unit=2&name=${encodeURIComponent(this.studentName)}&score=${totalScore}&total=${total}&seal=${sealCode}&att1=${firstTry}&att2=${secondTry}&att3=${thirdTry}&m=${exhaustedCount}&run=${this.run}`;
      const qrSVG = window.generateQRCodeSVG ? window.generateQRCodeSVG(verifyUrl, 54) : '';

      // Format 8-Skill Mastery Scorecard
      const skillCardsHTML = UNIT2_SKILLS.map((skill) => {
        const p1 = this.problems.find((p) => p.num === skill.problems[0]);
        const p2 = this.problems.find((p) => p.num === skill.problems[1]);
        const s1 = p1 ? this.currentStatus[p1.id] : null;
        const s2 = p2 ? this.currentStatus[p2.id] : null;

        let correctCount = 0;
        if (s1 && s1.solved) correctCount++;
        if (s2 && s2.solved) correctCount++;

        let tagClass = 'tag-needs-work';
        let tagText = 'NEEDS WORK (0/2)';
        let studyNotice = `<span class="study-rec">Review: ${skill.lesson}</span>`;

        if (correctCount === 2) {
          tagClass = 'tag-mastered';
          tagText = 'MASTERED (2/2)';
          studyNotice = '<span class="study-mastered">Objective Mastered</span>';
        } else if (correctCount === 1) {
          tagClass = 'tag-developing';
          tagText = 'DEVELOPING (1/2)';
          studyNotice = `<span class="study-rec">Review: ${skill.lesson}</span>`;
        }

        return `
          <div class="print-skill-card">
            <div class="print-skill-header">
              <span class="print-skill-num">Skill ${skill.num}</span>
              <span class="print-skill-status ${tagClass}">${tagText}</span>
            </div>
            <div class="print-skill-name">${skill.title}</div>
            <div class="print-skill-guide">${studyNotice}</div>
          </div>
        `;
      }).join('');

      // Format 16-row summary matrix
      const matrixRowsHTML = this.problems
        .map((p) => {
          const s = this.currentStatus[p.id];
          const givenParam = this.getProblemGivenSummary(p);
          const userResponse = s.userEntry || 'None';
          const statusCls = s.solved ? 'status-tag-solved' : 'status-tag-exhausted';
          const statusText = s.solved ? 'SOLVED' : s.exhausted ? 'EXHAUSTED' : 'INCOMPLETE';
          const max = p.maxAttempts || this.maxAttempts;

          return `
            <tr>
              <td style="text-align:center; font-family:var(--font-mono); font-weight:700;">#${p.num}</td>
              <td style="font-weight:600;">${p.topic}</td>
              <td style="font-family:var(--font-mono); color:#334155;">${givenParam}</td>
              <td style="font-family:var(--font-mono); word-break:break-word;">${userResponse}</td>
              <td style="text-align:center; font-family:var(--font-mono);">${s.attempts}/${max}</td>
              <td style="text-align:center;"><span class="print-matrix-status ${statusCls}">${statusText}</span></td>
            </tr>
          `;
        })
        .join('');

      // Single-page printable report sheet
      const printContainer = document.getElementById('studyReportSheet');
      printContainer.innerHTML = `
        <div class="print-receipt-header">
          <div class="print-title-area">
            <h2>XL Chem Practice Receipt</h2>
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 2:</b> Measurement &amp; Matter &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
            <p>Date: ${dateStr} &nbsp;|&nbsp; Seed: #${this.seed}</p>
          </div>
          <div class="print-header-center">
            <div class="print-big-score">${totalScore} / ${total}</div>
            <div style="font-size:7.5pt; color:#444;">${solvedCount}/${total} solved</div>
            <div class="print-attempt-pill">
              1st: ${firstTry} &middot; 2nd: ${secondTry} &middot; 3rd: ${thirdTry}${exhaustedCount > 0 ? ' &middot; Missed: ' + exhaustedCount : ''}
            </div>
          </div>
          <div class="print-seal-container">
            <div class="print-qr-code">${qrSVG}</div>
            <div class="print-seal-meta">
              <div>CHECK CODE</div>
              <div class="print-seal-code">${sealCode}</div>
              <div>Avg Tries: ${avgAttempts}</div>
            </div>
          </div>
        </div>

        <div class="print-scorecard-section">
          <div class="print-scorecard-title">Curriculum Skill Mastery &amp; Targeted Study Guide</div>
          <div class="print-scorecard-grid">
            ${skillCardsHTML}
          </div>
        </div>

        <table class="print-matrix-table">
          <thead>
            <tr>
              <th style="width:22pt; text-align:center;">#</th>
              <th style="width:125pt;">Skill &amp; Topic</th>
              <th style="width:130pt;">Given Scenario / Parameters</th>
              <th>Submitted Student Response</th>
              <th style="width:34pt; text-align:center;">Tries</th>
              <th style="width:50pt; text-align:center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${matrixRowsHTML}
          </tbody>
        </table>

        <div style="margin-top:4pt; padding:4pt 6pt; border:0.5pt solid #cbd5e1; border-radius:3pt; background:#f8fafc; font-size:6.2pt; color:#475569; font-family:var(--font-mono);">
          <b>Unit 2 Quick Reference Key:</b> N_A = 6.022 × 10²³ particles/mol &middot; STP Volume = 22.414 L/mol &middot; % Mass = (m_element / m_total) × 100% &middot; n = (Molar Mass) / (Empirical Mass) &middot; 1 g = 10⁶ μg
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_sci_not_mcq') return 'Scientific notation scale scenario';
      if (p.id === 'p2_sci_not_calc') return 'Multi-step exponential arithmetic';
      if (p.id === 'p3_sig_fig_measurement') return 'Glassware and precision rules';
      if (p.id === 'p4_sig_fig_calc') return 'Mixed operations sig fig rules';
      if (p.id === 'p5_ionic_nomen_mcq') return 'Systematic IUPAC formula to name';
      if (p.id === 'p6_ionic_formula_mcq') return 'Charge-balanced formula construction';
      if (p.id === 'p7_covalent_nomen_mcq') return 'Binary molecular Greek prefixes';
      if (p.id === 'p8_covalent_particle_mcq') return 'Particulate molecular diagram';
      if (p.id === 'p9_pct_comp_calc') return 'Compound percent mass determination';
      if (p.id === 'p10_ranking_comp') return 'Comparative elemental abundance ranking';
      if (p.id === 'p11_empirical_calc') return 'Elemental percent / mass data';
      if (p.id === 'p12_molecular_calc') return 'Empirical formula and molar mass';
      if (p.id === 'p13_mole_conversion') return 'Gram / Mole / Particle 1-step conversion';
      if (p.id === 'p14_stp_volume') return 'Gas volume at STP (22.414 L/mol)';
      if (p.id === 'p15_compound_to_atoms') return 'Multi-step mass to atom conversion';
      if (p.id === 'p16_haze_environmental_da') return 'Atmospheric haze pollutant rate';
      return 'Unit 2 practice item';
    }
  }

  window.XLChemStation = XLChemStation;

  window.addEventListener('DOMContentLoaded', () => {
    window.xlStation = new XLChemStation();
  });

  window.addEventListener('load', () => {
    if (window.renderMathInElement && window.xlStation && window.xlStation.elProblemDeck) {
      window.renderMathInElement(window.xlStation.elProblemDeck, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  });
})();
