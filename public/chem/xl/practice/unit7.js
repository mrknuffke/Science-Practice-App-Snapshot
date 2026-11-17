/**
 * unit7.js - XL Chemistry Practice Suite: Unit 7 (Acids & Bases)
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
    { z: 17, sym: 'Cl', name: 'Chlorine', mass: 35.45, group: 17, period: 3, shells: [2, 8, 7], valence: 7, kind: 'nonmetal', radius: 79, ie: 1251, en: 3.16, charge: '-1, +1, +5, +7' },
    { z: 18, sym: 'Ar', name: 'Argon', mass: 39.948, group: 18, period: 3, shells: [2, 8, 8], valence: 8, kind: 'noble', radius: 71, ie: 1520, en: null, charge: '0' },
    { z: 19, sym: 'K', name: 'Potassium', mass: 39.098, group: 1, period: 4, shells: [2, 8, 8, 1], valence: 1, kind: 'metal', radius: 243, ie: 419, en: 0.82, charge: '+1' },
    { z: 20, sym: 'Ca', name: 'Calcium', mass: 40.078, group: 2, period: 4, shells: [2, 8, 8, 2], valence: 2, kind: 'metal', radius: 194, ie: 590, en: 1.00, charge: '+2' },
    { z: 26, sym: 'Fe', name: 'Iron', mass: 55.845, group: 8, period: 4, shells: [2, 8, 14, 2], valence: 2, kind: 'metal', radius: 156, ie: 762, en: 1.83, charge: '+2, +3' },
    { z: 29, sym: 'Cu', name: 'Copper', mass: 63.546, group: 11, period: 4, shells: [2, 8, 18, 1], valence: 1, kind: 'metal', radius: 145, ie: 745, en: 1.90, charge: '+1, +2' },
    { z: 30, sym: 'Zn', name: 'Zinc', mass: 65.38, group: 12, period: 4, shells: [2, 8, 18, 2], valence: 2, kind: 'metal', radius: 142, ie: 906, en: 1.65, charge: '+2' },
    { z: 35, sym: 'Br', name: 'Bromine', mass: 79.904, group: 17, period: 4, shells: [2, 8, 18, 7], valence: 7, kind: 'nonmetal', radius: 94, ie: 1140, en: 2.96, charge: '-1, +1, +5' },
    { z: 36, sym: 'Kr', name: 'Krypton', mass: 83.798, group: 18, period: 4, shells: [2, 8, 18, 8], valence: 8, kind: 'noble', radius: 88, ie: 1351, en: 3.00, charge: '0' }
  ];

  // ============================================================
  // 4. UNIT 7 DECK GENERATOR (16 Problems, 8 Skills)
  // ============================================================
  class Unit7DeckGenerator {
    constructor(rng) {
      this.rng = rng;
    }

    generateDeck() {
      return [
        this.genProblem1_BronstedPairsMCQ(this.rng),
        this.genProblem2_AmphotericMCQ(this.rng),
        this.genProblem3_StrongAcidPHCalc(this.rng),
        this.genProblem4_StrongBasePOHCalc(this.rng),
        this.genProblem5_StrongVsWeakMCQ(this.rng),
        this.genProblem6_PercentIonizationCalc(this.rng),
        this.genProblem7_WeakAcidKaCalc(this.rng),
        this.genProblem8_PHStrengthRanking(this.rng),
        this.genProblem9_TitrationMonoproticCalc(this.rng),
        this.genProblem10_TitrationDiproticCalc(this.rng),
        this.genProblem11_EquivalenceEndpointMCQ(this.rng),
        this.genProblem12_TitrationCurvePHMCQ(this.rng),
        this.genProblem13_BufferPHCalc(this.rng),
        this.genProblem14_BufferMechanismMCQ(this.rng),
        this.genProblem15_AcidRainCalc(this.rng),
        this.genProblem16_OceanAcidSynthesisMCQ(this.rng)
      ];
    }

    // --- Problem 1: Bronsted-Lowry Conjugate Pairs (MCQ - 3 attempts) ---
    genProblem1_BronstedPairsMCQ(rng) {
      const correct = 'HF is the Bronsted-Lowry acid and F⁻ is its conjugate base; H₂O is the base and H₃O⁺ is its conjugate acid.';
      const distractors = [
        'HF is the Bronsted-Lowry base because it accepts protons, while H2O acts as an electron acceptor.',
        'H3O+ is the conjugate base of HF, while F- acts as the primary proton donor species.',
        'Both HF and H2O act as Lewis bases without transferring any protons between molecules.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p1_bronsted_pairs_mcq',
        num: 1,
        topic: 'Bronsted-Lowry Theory: Conjugate Acid-Base Pairs',
        stem: `Examine the reversible acid dissociation equilibrium below:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; text-align:center; margin-bottom:0.75rem;">
          HF(aq) + H₂O(l) &rightleftharpoons; H₃O⁺(aq) + F⁻(aq)
        </div>
        Which statement correctly identifies the Bronsted-Lowry acid, base, and corresponding conjugate pairs?`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'A Bronsted-Lowry acid donates a proton (H+), while a Bronsted-Lowry base accepts a proton.',
        hint2: 'A conjugate pair differs by exactly one H+ ion.',
        explanation: 'HF loses a proton to become F- (HF is the acid, F- is its conjugate base). H2O gains a proton to become H3O+ (H2O is the base, H3O+ is its conjugate acid).'
      };
    }

    // --- Problem 2: Amphoteric Behavior (MCQ - 3 attempts) ---
    genProblem2_AmphotericMCQ(rng) {
      const correct = 'It contains ionizable hydrogen to donate as an acid and a lone pair to accept protons as a base.';
      const distractors = [
        'It decomposes spontaneously into metallic calcium when placed in nonpolar organic solvents.',
        'It has an electrical dipole moment of zero and cannot participate in hydrogen bonding interactions.',
        'It contains three oxygen atoms that undergo rapid nuclear fusion in boiling water.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p2_amphoteric_mcq',
        num: 2,
        topic: 'Chemical Amphoterism: Dual Proton Donor/Acceptor',
        stem: 'The hydrogen carbonate ion, HCO₃⁻, is recognized as an amphoteric (or amphiprotic) chemical species. What molecular property enables HCO₃⁻ to function as both a Bronsted-Lowry acid and base?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Consider what happens when HCO3- reacts with OH- versus when it reacts with H+.',
        hint2: 'HCO3- can donate H+ to form CO3²-, or accept H+ to form H2CO3.',
        explanation: 'An amphiprotic species can both donate and accept protons. HCO3- can donate its proton to form carbonate (CO3²-) acting as an acid, or accept a proton onto an oxygen lone pair to form carbonic acid (H2CO3) acting as a base.'
      };
    }

    // --- Problem 3: Strong Acid pH Calculation (Calculation - 5 attempts) ---
    genProblem3_StrongAcidPHCalc(rng) {
      const molarity = rng.pick([0.0025, 0.0040, 0.0050, 0.0080, 0.015, 0.025]);
      const ph = -Math.log10(molarity);
      const rounded = parseFloat(ph.toFixed(2));

      return {
        id: 'p3_strong_acid_ph_calc',
        num: 3,
        topic: 'Logarithmic Acidity: Strong Acid pH Determination',
        stem: `Nitric acid (HNO₃) is a monoprotic strong acid that dissociates completely in water. A solution is prepared with a concentration of <strong>${molarity} M</strong> HNO₃.<br><br>Calculate the <strong>pH</strong> of this aqueous solution. Enter your answer to two decimal places (e.g. <code>2.45</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: 0.03
        },
        placeholder: 'e.g. 2.45',
        hint1: 'Because HNO3 dissociates 100%, [H+] = [HNO3]. Then apply pH = -log10[H+].',
        hint2: `pH = -log10(${molarity}) = ${rounded}.`,
        workedSolution: `1. For a strong acid, [H⁺] = ${molarity} M.
2. pH = -log₁₀[H⁺] = -log₁₀(${molarity}) = ${rounded}.`
      };
    }

    // --- Problem 4: Strong Base pOH and pH (Calculation - 5 attempts) ---
    genProblem4_StrongBasePOHCalc(rng) {
      const molarity = rng.pick([0.0020, 0.0035, 0.0050, 0.012, 0.020]);
      const poh = -Math.log10(molarity);
      const ph = 14.00 - poh;
      const rounded = parseFloat(ph.toFixed(2));

      return {
        id: 'p4_strong_base_poh_calc',
        num: 4,
        topic: 'Water Autoionization: Strong Base pH Determination',
        stem: `Sodium hydroxide (NaOH) is a strong base that dissociates completely in aqueous solution. An aqueous solution has an NaOH concentration of <strong>${molarity} M</strong> at 25 &deg;C.<br><br>Calculate the <strong>pH</strong> of the solution. Enter your answer to two decimal places (e.g. <code>11.50</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: 0.03
        },
        placeholder: 'e.g. 11.50',
        hint1: 'First calculate pOH = -log10[OH-], then use pH = 14.00 - pOH.',
        hint2: `pOH = -log10(${molarity}) = ${poh.toFixed(2)}. pH = 14.00 - ${poh.toFixed(2)} = ${rounded}.`,
        workedSolution: `1. [OH⁻] = ${molarity} M.
2. pOH = -log₁₀(${molarity}) = ${poh.toFixed(2)}.
3. pH = 14.00 - pOH = 14.00 - ${poh.toFixed(2)} = ${rounded}.`
      };
    }

    // --- Problem 5: Strong vs Weak Acids (MCQ - 3 attempts) ---
    genProblem5_StrongVsWeakMCQ(rng) {
      const correct = 'Acid strength depends on degree of ionization; a concentrated weak acid can have lower [H⁺] than a dilute strong acid.';
      const distractors = [
        'A weak acid is always safe to drink and touch because its molecules cannot break chemical bonds.',
        'Strong acids always have larger molecular masses and higher boiling points than weak acids.',
        'All weak acids become strong acids if heated above 50 degrees Celsius in an open beaker.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p5_strong_vs_weak_mcq',
        num: 5,
        topic: 'Acid Strength: Extent of Dissociation vs Concentration',
        stem: 'How does the chemical concept of acid strength fundamentally differ from acid concentration in aqueous solutions?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Strength is about how easily protons come off (equilibrium Ka), whereas concentration is total moles per liter.',
        hint2: 'A 6 M acetic acid solution is concentrated but weak; a 0.001 M HCl solution is dilute but strong.',
        explanation: 'Acid strength refers to the thermodynamic equilibrium extent of dissociation (Ka). Strong acids dissociate virtually 100%, whereas weak acids dissociate only partially (<5%). Concentration simply refers to the total moles of acid dissolved per liter of solution.'
      };
    }

    // --- Problem 6: Percent Ionization (Calculation - 5 attempts) ---
    genProblem6_PercentIonizationCalc(rng) {
      // HA(aq) <=> H+(aq) + A-(aq)
      // c0 = 0.10 M, [H+] = 1.34 x 10^-3 M => % ion = (1.34e-3 / 0.10) * 100 = 1.34%
      const c0 = rng.pick([0.10, 0.15, 0.20, 0.25]);
      const hConcExp = rng.pick([1.25, 1.45, 1.68, 1.92]); // in 10^-3 M
      const hConc = hConcExp * 1e-3;
      const pctIon = (hConc / c0) * 100.0;
      const rounded = parseFloat(pctIon.toFixed(2));

      return {
        id: 'p6_percent_ionization_calc',
        num: 6,
        topic: 'Weak Acid Dissociation: Percent Ionization',
        stem: `A <strong>${c0.toFixed(2)} M</strong> solution of a monoprotic weak acid (HA) is analyzed with a pH probe and found to have an equilibrium hydrogen ion concentration of <strong>${(hConcExp).toFixed(2)} &times; 10⁻³ M</strong>.<br><br>Calculate the <strong>percent ionization</strong> of this weak acid. Enter as a percentage value (e.g. <code>1.35</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: 0.05
        },
        placeholder: 'e.g. 1.35',
        hint1: 'Percent Ionization = ([H+]_equilibrium / [HA]_initial) &times; 100%.',
        hint2: `% = (${(hConcExp).toFixed(2)}e-3 / ${c0.toFixed(2)}) &times; 100 = ${rounded}%.`,
        workedSolution: `1. Formula: Percent Ionization = ([H⁺] / [HA]₀) &times; 100%.
2. Calculation: [${(hConcExp).toFixed(2)} &times; 10⁻³ M / ${c0.toFixed(2)} M] &times; 100% = ${rounded}%.`
      };
    }

    // --- Problem 7: Weak Acid Ka to pH (Calculation - 5 attempts) ---
    genProblem7_WeakAcidKaCalc(rng) {
      // Acetic acid: Ka = 1.8 x 10^-5
      // c0 = 0.20 M => [H+] = sqrt(Ka * c0) = sqrt(3.6e-6) = 1.897 x 10^-3 M
      // pH = -log10(1.897e-3) = 2.72
      const c0 = rng.pick([0.15, 0.20, 0.25, 0.30]);
      const ka = 1.8e-5;
      const hPlus = Math.sqrt(ka * c0);
      const ph = -Math.log10(hPlus);
      const rounded = parseFloat(ph.toFixed(2));

      return {
        id: 'p7_weak_acid_ka_calc',
        num: 7,
        topic: 'Equilibrium Modeling: Weak Acid pH from Ka',
        stem: `Acetic acid (CH₃COOH) has an acid dissociation constant of <strong>K_a = 1.8 &times; 10⁻⁵</strong> at 25 &deg;C. A solution of vinegar has an acetic acid concentration of <strong>${c0.toFixed(2)} M</strong>.<br><br>Using an ICE table approximation ([H⁺] &approx; &radic;(K_a &times; C₀)), calculate the <strong>pH</strong> of the solution. Enter to two decimal places (e.g. <code>2.72</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: 0.04
        },
        placeholder: 'e.g. 2.72',
        hint1: 'Calculate [H+] = sqrt(Ka &times; C0), then calculate pH = -log10[H+].',
        hint2: `[H+] = sqrt(1.8e-5 &times; ${c0.toFixed(2)}) = ${(hPlus).toExponential(3)} M. pH = ${rounded}.`,
        workedSolution: `1. Ka expression: Ka = [H⁺][CH₃COO⁻] / [CH₃COOH] &approx; x² / ${c0.toFixed(2)} = 1.8 &times; 10⁻⁵.
2. x² = 1.8 &times; 10⁻⁵ &times; ${c0.toFixed(2)} = ${(ka * c0).toExponential(3)}.
3. [H⁺] = &radic;${(ka * c0).toExponential(3)} = ${(hPlus).toExponential(3)} M.
4. pH = -log₁₀(${(hPlus).toExponential(3)}) = ${rounded}.`
      };
    }

    // --- Problem 8: Aqueous Solution pH Spectrum Ordering (Ranking - 3 attempts) ---
    genProblem8_PHStrengthRanking(rng) {
      const items = [
        { id: 'hcl', title: 'Hydrochloric Acid (0.10 M HCl)', note: 'Strong monoprotic acid (pH = 1.00)' },
        { id: 'acetic', title: 'Acetic Acid (0.10 M CH₃COOH)', note: 'Weak monoprotic acid (Ka = 1.8 × 10⁻⁵, pH = 2.87)' },
        { id: 'nacl', title: 'Sodium Chloride (0.10 M NaCl)', note: 'Neutral spectator salt (pH = 7.00)' },
        { id: 'nh3', title: 'Aqueous Ammonia (0.10 M NH₃)', note: 'Weak molecular base (Kb = 1.8 × 10⁻⁵, pH = 11.13)' },
        { id: 'naoh', title: 'Sodium Hydroxide (0.10 M NaOH)', note: 'Strong monoprotic base (pH = 13.00)' }
      ];
      const correctOrder = ['hcl', 'acetic', 'nacl', 'nh3', 'naoh'];
      const shuffled = rng.shuffle([...items]);

      return {
        id: 'p8_ph_strength_ranking',
        num: 8,
        topic: 'Aqueous Equilibria: Solution pH Spectrum Ordering',
        stem: 'Rank the following five aqueous solutions (each prepared at <strong>0.10 M at 25 &deg;C</strong>) in order of <strong>increasing pH (from most acidic / lowest pH to most basic / highest pH)</strong>.',
        type: 'ranking',
        maxAttempts: 3,
        cards: shuffled,
        correctOrder: correctOrder,
        orderLabels: {
          first: 'Lowest pH (Most Acidic)',
          last: 'Highest pH (Most Basic)'
        },
        hint1: 'Consider strong acid vs weak acid vs neutral salt vs weak base vs strong base.',
        hint2: 'HCl completely ionizes (pH 1.0). Acetic acid partially ionizes (pH ~2.9). NaCl is neutral (pH 7.0). Ammonia is a weak base (pH ~11.1). NaOH completely dissociates (pH 13.0).',
        workedSolution: 'Comparing pH values for 0.10 M solutions at 25 °C:\n1. 0.10 M HCl: [H+] = 0.10 M => pH = 1.00\n2. 0.10 M CH₃COOH: [H+] = sqrt(1.8 × 10⁻⁵ × 0.10) = 1.34 × 10⁻³ M => pH = 2.87\n3. 0.10 M NaCl: Neutral salt of strong acid and strong base => pH = 7.00\n4. 0.10 M NH₃: [OH-] = sqrt(1.8 × 10⁻⁵ × 0.10) = 1.34 × 10⁻³ M => pOH = 2.87 => pH = 11.13\n5. 0.10 M NaOH: [OH-] = 0.10 M => pOH = 1.00 => pH = 13.00\n\nCorrect ranking order: HCl < CH₃COOH < NaCl < NH₃ < NaOH.'
      };
    }

    // --- Problem 9: Monoprotic Titration Stoichiometry (Calculation - 5 attempts) ---
    genProblem9_TitrationMonoproticCalc(rng) {
      // Ma * Va = Mb * Vb
      const va = 25.0; // mL
      const mb = 0.100; // M
      const vb = rng.float(18.0, 36.0, 1);
      const ma = (mb * vb) / va;
      const rounded = parseFloat(ma.toFixed(3));

      return {
        id: 'p9_titration_monoprotic_calc',
        num: 9,
        topic: 'Analytical Titration: Monoprotic Acid Concentration',
        stem: `In an acid-base titration, a student titrates a <strong>${va.toFixed(1)} mL</strong> sample of hydrochloric acid (HCl) of unknown concentration with <strong>${mb.toFixed(3)} M</strong> standard sodium hydroxide (NaOH).<br><br>The phenolphthalein endpoint is reached after adding exactly <strong>${vb.toFixed(1)} mL</strong> of NaOH titrant according to:<br>
        <div style="padding:0.5rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.9rem; text-align:center; margin:0.5rem 0;">
          HCl(aq) + NaOH(aq) &rarr; NaCl(aq) + H₂O(l)
        </div>
        Calculate the <strong>molarity (M)</strong> of the unknown HCl sample in mol/L. Enter as a decimal (e.g. <code>0.125</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.003, rounded * 0.02)
        },
        placeholder: 'e.g. 0.125',
        hint1: 'At the equivalence point of a 1:1 reaction, Moles acid = Moles base: Ma &times; Va = Mb &times; Vb.',
        hint2: `Ma = (Mb &times; Vb) / Va = (${mb.toFixed(3)} &times; ${vb.toFixed(1)}) / ${va.toFixed(1)}.`,
        workedSolution: `1. Moles NaOH added = ${mb.toFixed(3)} mol/L &times; (${vb.toFixed(1)} / 1000 L) = ${(mb * vb / 1000).toFixed(5)} mol.
2. Moles HCl = Moles NaOH (1:1 stoichiometry).
3. Molarity HCl = ${(mb * vb / 1000).toFixed(5)} mol / (${va.toFixed(1)} / 1000 L) = ${rounded} M.`
      };
    }

    // --- Problem 10: Diprotic Neutralization (Calculation - 5 attempts) ---
    genProblem10_TitrationDiproticCalc(rng) {
      // H2SO4 + 2 NaOH -> Na2SO4 + 2 H2O
      // Moles NaOH = 2 * Moles H2SO4
      const vAcid = 20.0; // mL
      const mAcid = rng.float(0.08, 0.20, 2);
      const mBase = 0.150; // M
      const molesAcid = (vAcid / 1000.0) * mAcid;
      const molesBase = 2.0 * molesAcid;
      const vBase = (molesBase / mBase) * 1000.0;
      const rounded = parseFloat(vBase.toFixed(1));

      return {
        id: 'p10_titration_diprotic_calc',
        num: 10,
        topic: 'Stoichiometric Neutralization: Diprotic Acid Titration',
        stem: `Sulfuric acid (H₂SO₄) is a diprotic acid that reacts with potassium hydroxide (KOH) according to:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          H₂SO₄(aq) + 2 KOH(aq) &rarr; K₂SO₄(aq) + 2 H₂O(l)
        </div>
        What volume in <strong>milliliters (mL)</strong> of <strong>${mBase.toFixed(3)} M</strong> KOH is required to completely neutralize <strong>${vAcid.toFixed(1)} mL</strong> of <strong>${mAcid.toFixed(2)} M</strong> H₂SO₄? Enter in mL (e.g. <code>24.5</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.3, rounded * 0.02)
        },
        placeholder: 'e.g. 24.5',
        hint1: 'Note the 1:2 stoichiometric ratio: each mole of H2SO4 requires 2 moles of KOH.',
        hint2: `Moles H2SO4 = ${(vAcid / 1000).toFixed(4)} &times; ${mAcid.toFixed(2)}. Moles KOH = 2 &times; Moles H2SO4. Volume KOH = Moles KOH / ${mBase.toFixed(3)}.`,
        workedSolution: `1. Moles H₂SO₄ = (${vAcid.toFixed(1)} / 1000 L) &times; ${mAcid.toFixed(2)} mol/L = ${molesAcid.toFixed(4)} mol.
2. Moles KOH required = 2 &times; ${molesAcid.toFixed(4)} mol = ${molesBase.toFixed(4)} mol.
3. Volume KOH = (${molesBase.toFixed(4)} mol / ${mBase.toFixed(3)} mol/L) &times; 1000 mL/L = ${rounded} mL.`
      };
    }

    // --- Problem 11: Equivalence Point vs Endpoint (MCQ - 3 attempts) ---
    genProblem11_EquivalenceEndpointMCQ(rng) {
      const correct = 'Equivalence point is stoichiometric neutralization (moles H⁺ = moles OH⁻); endpoint is the physical indicator color transition.';
      const distractors = [
        'Equivalence point occurs when the burette runs out of liquid; endpoint occurs when the flask breaks from heat.',
        'Equivalence point only occurs at pH 14; endpoint only occurs when acid concentration drops to zero.',
        'Equivalence point refers to weak acids; endpoint refers exclusively to strong monoprotic bases.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p11_equivalence_endpoint_mcq',
        num: 11,
        topic: 'Volumetric Analysis: Equivalence Point vs Indicator Endpoint',
        stem: 'In quantitative analytical chemistry, how is the stoichiometric equivalence point distinguished from the experimental indicator endpoint?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'One is a theoretical mathematical point of equal moles; the other is a visible experimental cue.',
        hint2: 'A good titration indicator is selected so its color change (endpoint) matches the equivalence point pH.',
        explanation: 'The equivalence point is the theoretical stage where stoichiometrically equivalent quantities of titrant and analyte have reacted (moles H+ = moles OH-). The endpoint is the observable experimental signal (such as an indicator dye color change) where titration is stopped.'
      };
    }

    // --- Problem 12: Titration Curve Equivalence Point pH (MCQ - 3 attempts) ---
    genProblem12_TitrationCurvePHMCQ(rng) {
      const correct = 'pH > 7.00 because the conjugate base anion (CH₃COO⁻) undergoes hydrolysis with water to generate hydroxide ions.';
      const distractors = [
        'pH = 7.00 because all neutralization reactions produce neutral pure water and neutral sodium ions.',
        'pH < 7.00 because unreacted acetic acid molecules remain permanently trapped inside the sodium ions.',
        'pH = 0.00 because sodium acetate decomposes into concentrated hydrochloric acid gas.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p12_titration_curve_ph_mcq',
        num: 12,
        topic: 'Titration Curves: Salt Hydrolysis at Equivalence',
        stem: `When a sample of weak acetic acid (CH₃COOH) is titrated to the stoichiometric equivalence point with strong sodium hydroxide (NaOH), what is the pH of the resulting solution, and why?
        <div style="margin:1rem 0; background:var(--xl-surface-2, rgba(0,0,0,0.02)); border:1px solid var(--xl-border); border-radius:8px; padding:0.75rem; text-align:center;">
          <svg viewBox="0 0 540 220" style="width:100%; max-width:520px; height:auto; display:block; margin:0 auto; font-family:var(--font-sans);">
            <!-- Axes -->
            <line x1="60" y1="190" x2="500" y2="190" stroke="currentColor" stroke-width="2" />
            <line x1="60" y1="190" x2="60" y2="20" stroke="currentColor" stroke-width="2" />
            <polygon points="500,186 510,190 500,194" fill="currentColor" />
            <polygon points="56,20 60,10 64,20" fill="currentColor" />
            <text x="280" y="210" font-size="11" text-anchor="middle" fill="currentColor" opacity="0.8">Volume of 0.10 M NaOH Added (mL) &rarr;</text>
            <text x="25" y="105" font-size="11" text-anchor="middle" transform="rotate(-90 25 105)" fill="currentColor" opacity="0.8">Measured pH &rarr;</text>

            <!-- Y-Axis Ticks -->
            <text x="52" y="194" font-size="10" text-anchor="end" fill="currentColor" opacity="0.7">0</text>
            <line x1="56" y1="155" x2="60" y2="155" stroke="currentColor" stroke-width="1.5" />
            <text x="52" y="159" font-size="10" text-anchor="end" fill="currentColor">3</text>
            <line x1="56" y1="105" x2="60" y2="105" stroke="currentColor" stroke-width="1.5" />
            <text x="52" y="109" font-size="10" text-anchor="end" fill="currentColor">7</text>
            <line x1="56" y1="84" x2="60" y2="84" stroke="#ec4899" stroke-width="1.5" />
            <text x="52" y="88" font-size="10" text-anchor="end" fill="#ec4899" font-weight="bold">8.72</text>
            <line x1="56" y1="35" x2="60" y2="35" stroke="currentColor" stroke-width="1.5" />
            <text x="52" y="39" font-size="10" text-anchor="end" fill="currentColor">13</text>

            <!-- Neutral line pH 7 -->
            <line x1="60" y1="105" x2="480" y2="105" stroke="currentColor" stroke-dasharray="3,3" opacity="0.3" />

            <!-- Equivalence vertical grid line -->
            <line x1="280" y1="190" x2="280" y2="30" stroke="#cbd5e1" stroke-dasharray="3,3" stroke-width="1" />
            <text x="280" y="202" font-size="9" text-anchor="middle" fill="currentColor" opacity="0.7">25.0 mL (V_eq)</text>

            <!-- Half equivalence line -->
            <line x1="170" y1="190" x2="170" y2="135" stroke="#cbd5e1" stroke-dasharray="2,2" stroke-width="1" />
            <text x="170" y="202" font-size="8.5" text-anchor="middle" fill="currentColor" opacity="0.6">12.5 mL</text>

            <!-- Sigmoidal Titration Curve -->
            <!-- Start (60,158) -> Buffer region (170,135) -> Steep rise (270,115) to (280,84) to (290,48) -> Plateau (480,38) -->
            <path d="M 60 158 C 100 148, 140 138, 200 132 C 240 128, 265 125, 275 110 L 280 84 L 285 58 C 295 44, 340 38, 480 36" fill="none" stroke="#2563eb" stroke-width="3" />

            <!-- Buffer region bracket -->
            <rect x="90" y="125" width="140" height="25" rx="4" fill="#3b82f6" fill-opacity="0.1" stroke="#3b82f6" stroke-width="1" stroke-dasharray="2,2" />
            <text x="160" y="120" font-size="9" text-anchor="middle" fill="#2563eb" font-weight="bold">Buffer Region (pH = pKa at 12.5 mL)</text>

            <!-- Equivalence Point callout dot -->
            <circle cx="280" cy="84" r="5" fill="#ec4899" stroke="#fff" stroke-width="1.5" />
            <line x1="280" y1="84" x2="350" y2="70" stroke="#ec4899" stroke-width="1.5" />
            <rect x="350" y="58" width="140" height="24" rx="4" fill="#fdf2f8" stroke="#ec4899" stroke-width="1" />
            <text x="420" y="74" font-size="9.5" text-anchor="middle" fill="#be185d" font-weight="bold">Equivalence: pH = 8.72 &gt; 7.00</text>
          </svg>
          <div style="font-size:0.75rem; color:var(--xl-ink-mute); margin-top:0.4rem;">Titration Curve: 0.10 M Acetic Acid (CH₃COOH) titrated with 0.10 M NaOH</div>
        </div>`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Consider what product salt is present at equivalence: sodium acetate (CH3COONa).',
        hint2: 'Acetate ion (CH3COO-) is the conjugate base of a weak acid and hydrolyzes water: CH3COO- + H2O <=> CH3COOH + OH-.',
        explanation: 'At the equivalence point of a weak acid titrated with a strong base, all acid has been converted into its conjugate base (CH3COO-). The conjugate base undergoes hydrolysis (CH3COO- + H2O <=> CH3COOH + OH-), producing excess OH- ions and resulting in an equivalence point pH > 7.00.'
      };
    }

    // --- Problem 13: Henderson-Hasselbalch Buffer pH (Calculation - 5 attempts) ---
    genProblem13_BufferPHCalc(rng) {
      // pH = pKa + log10([A-] / [HA])
      // Acetic acid: pKa = 4.74
      // [HA] = 0.15 M, [A-] = 0.30 M => log10(0.30/0.15) = log10(2) = 0.301 => pH = 4.74 + 0.301 = 5.04
      const ha = rng.pick([0.10, 0.15, 0.20]);
      const ratio = rng.pick([1.5, 2.0, 2.5]);
      const aBase = ha * ratio;
      const pka = 4.74;
      const ph = pka + Math.log10(ratio);
      const rounded = parseFloat(ph.toFixed(2));

      return {
        id: 'p13_buffer_ph_calc',
        num: 13,
        topic: 'Buffer Systems: Henderson-Hasselbalch Equation',
        stem: `An aqueous buffer solution is prepared containing <strong>${ha.toFixed(2)} M</strong> acetic acid (CH₃COOH, pK_a = 4.74) and <strong>${aBase.toFixed(2)} M</strong> sodium acetate (CH₃COONa).<br><br>Using the Henderson-Hasselbalch equation:<br>
        <div style="padding:0.5rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.9rem; text-align:center; margin:0.5rem 0;">
          pH = pK_a + log₁₀([A⁻] / [HA])
        </div>
        Calculate the <strong>pH</strong> of this buffer solution. Enter to two decimal places (e.g. <code>4.85</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: 0.03
        },
        placeholder: 'e.g. 4.85',
        hint1: 'pH = pKa + log10([acetate] / [acetic acid]).',
        hint2: `Ratio = ${aBase.toFixed(2)} / ${ha.toFixed(2)} = ${ratio.toFixed(1)}. log10(${ratio.toFixed(1)}) = ${Math.log10(ratio).toFixed(3)}. pH = 4.74 + ${Math.log10(ratio).toFixed(3)}.`,
        workedSolution: `1. Ratio [A⁻] / [HA] = ${aBase.toFixed(2)} M / ${ha.toFixed(2)} M = ${ratio.toFixed(2)}.
2. log₁₀(${ratio.toFixed(2)}) = ${Math.log10(ratio).toFixed(3)}.
3. pH = 4.74 + ${Math.log10(ratio).toFixed(3)} = ${rounded}.`
      };
    }

    // --- Problem 14: Buffer Resistance Mechanism (MCQ - 3 attempts) ---
    genProblem14_BufferMechanismMCQ(rng) {
      const correct = 'Added H⁺ reacts with conjugate base A⁻ to form weak acid HA, preventing large changes in free [H⁺].';
      const distractors = [
        'Added H⁺ causes the water molecules to evaporate immediately, leaving acid crystals behind.',
        'The buffer solution converts all incoming protons into neutral argon atoms via nuclear fission.',
        'Added H⁺ increases pH to 14 because weak acids neutralize all incoming cations instantly.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p14_buffer_mechanism_mcq',
        num: 14,
        topic: 'Buffer Chemistry: Le Chatelier Homeostatic Resistance',
        stem: 'How does an equimolar acetic acid / sodium acetate buffer maintain a stable pH when a small quantity of strong hydrochloric acid (HCl) is introduced?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Strong acid adds H+ ions. Which component of the buffer can absorb H+ ions?',
        hint2: 'Acetate ion (CH3COO-) is the conjugate base that reacts with added H+ to form CH3COOH.',
        explanation: 'When strong acid is added, incoming H+ ions react with the conjugate base present in large reserve (CH3COO- + H+ -> CH3COOH). This consumes free hydronium ions and converts them into weak acid molecules, buffering the solution and causing only a negligible drop in pH.'
      };
    }

    // --- Problem 15: Environmental Acidification Calculation (Calculation - 5 attempts) ---
    genProblem15_AcidRainCalc(rng) {
      // Pristine rain pH = 5.60 (due to natural CO2)
      // Acid rain pH = 4.20 to 4.50
      // Fold increase in [H+] = 10^(5.60 - pH_acid)
      const phAcid = rng.pick([4.20, 4.30, 4.40]);
      const diff = 5.60 - phAcid;
      const foldFactor = Math.pow(10, diff);
      const rounded = parseFloat(foldFactor.toFixed(1));

      return {
        id: 'p15_acid_rain_calc',
        num: 15,
        topic: 'Atmospheric Chemistry: Acid Rain Hydrogen Ion Amplification',
        stem: `Unpolluted natural rainwater has a pH of <strong>5.60</strong> due to dissolved atmospheric carbon dioxide. In an industrial region impacted by sulfur dioxide emissions, acid rain is sampled with a pH of <strong>${phAcid.toFixed(2)}</strong>.<br><br>Calculate the <strong>fold-increase</strong> in hydronium ion concentration [H⁺] in the acid rain compared to unpolluted rain (i.e. [H⁺]_acid / [H⁺]_unpolluted). Enter as a decimal (e.g. <code>15.8</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.4, rounded * 0.03)
        },
        placeholder: 'e.g. 15.8',
        hint1: 'Fold increase = 10^(pH_initial - pH_acid) = 10^(5.60 - ' + phAcid.toFixed(2) + ').',
        hint2: `10^(${diff.toFixed(2)}) = ${rounded}.`,
        workedSolution: `1. Unpolluted [H⁺] = 10⁻⁵˙⁶⁰ = 2.51 &times; 10⁻⁶ M.
2. Acid rain [H⁺] = 10⁻${phAcid.toFixed(2)} = ${Math.pow(10, -phAcid).toExponential(2)} M.
3. Ratio = 10^(5.60 - ${phAcid.toFixed(2)}) = 10^${diff.toFixed(2)} = ${rounded} &times; increase in [H⁺].`
      };
    }

    // --- Problem 16: Marine Calcification & Storyline Synthesis (MCQ - 3 attempts) ---
    genProblem16_OceanAcidSynthesisMCQ(rng) {
      const correct = 'Dissolved CO₂ increases ocean [H⁺], which protonates carbonate into bicarbonate and dissolves existing calcium carbonate structures.';
      const distractors = [
        'Excess oceanic acid causes seawater to boil vigorously, cooking coral polyps in thermal steam.',
        'Dissolved carbon dioxide turns all marine calcium atoms into gaseous nitrogen bubbles.',
        'Marine coral reefs actively consume acid molecules to build titanium carbide outer shells.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p16_ocean_acid_synthesis_mcq',
        num: 16,
        topic: 'Storyline Synthesis: Coral Bleaching & Calcification Inhibition',
        stem: 'How does atmospheric carbon dioxide uptake and resultant ocean acidification compromise coral reef survival and calcium carbonate (CaCO₃) biomineralization?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Recall the carbonate equilibrium: H+ + CO3²- <=> HCO3-.',
        hint2: 'Coral skeletons are made of aragonite / calcium carbonate: Ca²+ + CO3²- <=> CaCO3.',
        explanation: 'As atmospheric CO2 dissolves, it forms carbonic acid that yields excess H+ ions. These protons react with marine carbonate ions to form bicarbonate (H+ + CO3²- <=> HCO3-), starving corals of the carbonate ions needed for biomineralization (Ca²+ + CO3²- <=> CaCO3) and causing existing carbonate structures to dissolve.'
      };
    }
  }

  // ============================================================
  // 5. WORKSTATION CONTROLLER & STATE MANAGER
  // ============================================================
  class XLChemStation {
    constructor() {
      this.unit = 7;
      this.studentName = localStorage.getItem('xl_chem_student_name') || '';
      this.run = parseInt(localStorage.getItem('xl_chem_run') || '1', 10);
      this.maxAttempts = 3;

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('name')) {
        this.studentName = (urlParams.get('student') || urlParams.get('name'));
        localStorage.setItem('xl_chem_student_name', this.studentName);
      }
      if (urlParams.has('run')) {
        this.run = parseInt(urlParams.get('run'), 10) || 1;
        localStorage.setItem('xl_chem_run', String(this.run));
      }

      this.seed = this.computeSeed();
      this.rng = new SeededRNG(this.seed);
      this.generator = new Unit7DeckGenerator(this.rng);
      this.problems = this.generator.generateDeck();

      this.initDOMElements();
      this.initTheme();
      this.initStudentProfile();
      this.initReferenceCenter();
      this.initCalculator();
      this.loadSavedState();
      this.renderDeck();
    }

    computeSeed() {
      const cleanName = (this.studentName || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const seedBase = `${cleanName}-u7`;
      return this.run > 1 ? `${seedBase}-r${this.run}` : seedBase;
    }

    initDOMElements() {
      this.elProblemDeck = document.getElementById('problemDeck');
      this.elProgressFill = document.getElementById('progressFill');
      this.elMetricsLabel = document.getElementById('metricsLabel');
      this.elSeedChip = document.getElementById('seedChip');
      this.elStudentAvatar = document.getElementById('studentAvatar');
      this.elStudentNameDisplay = document.getElementById('studentNameDisplay');
      this.elProfilePill = document.getElementById('studentPill');
      this.elProfileModal = document.getElementById('profileModal');
      this.elProfileInput = document.getElementById('profileInput');
      this.elProfileStartBtn = document.getElementById('profileStartBtn');
      this.elRefBtn = document.getElementById('refBtn');
      this.elRefDrawer = document.getElementById('refDrawer');
      this.elCloseRefDrawerBtn = document.getElementById('closeRefDrawerBtn');
      this.elCalcBtn = document.getElementById('calcBtn');
      this.elCalcWidget = document.getElementById('calcWidget');
      this.elCloseCalcBtn = document.getElementById('closeCalcBtn');
      this.elCalcExpr = document.getElementById('calcExpr');
      this.elCalcVal = document.getElementById('calcVal');
      this.elExportBtn = document.getElementById('exportBtn');
      this.calcBuffer = '';

      if (this.elSeedChip) {
        this.elSeedChip.textContent = `Seed: #${this.seed}`;
      }
      if (this.elExportBtn) {
        this.elExportBtn.addEventListener('click', () => this.handleExportReport());
      }
      if (this.elRefBtn && this.elRefDrawer) {
        this.elRefBtn.addEventListener('click', () => {
          this.elRefDrawer.classList.toggle('open');
        });
      }
      if (this.elCloseRefDrawerBtn && this.elRefDrawer) {
        this.elCloseRefDrawerBtn.addEventListener('click', () => {
          this.elRefDrawer.classList.remove('open');
        });
      }
      if (this.elCalcBtn && this.elCalcWidget) {
        this.elCalcBtn.addEventListener('click', () => {
          this.elCalcWidget.classList.toggle('open');
        });
      }
      if (this.elCloseCalcBtn && this.elCalcWidget) {
        this.elCloseCalcBtn.addEventListener('click', () => {
          this.elCalcWidget.classList.remove('open');
        });
      }
    }

    initTheme() {
      const themeBtn = document.getElementById('themeToggleBtn');
      const themeIcon = document.getElementById('themeIcon');
      const savedTheme = localStorage.getItem('xl_chem_theme') || 'auto';

      const applyTheme = (theme) => {
        document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
        if (theme === 'light') {
          document.documentElement.classList.add('theme-light');
          document.body.classList.add('theme-light');
          if (themeIcon) themeIcon.textContent = '🌙';
        } else if (theme === 'dark') {
          document.documentElement.classList.add('theme-dark');
          document.body.classList.add('theme-dark');
          if (themeIcon) themeIcon.textContent = '☀️';
        } else {
          document.documentElement.classList.add('theme-auto');
          document.body.classList.add('theme-auto');
          if (themeIcon) themeIcon.textContent = '☀️';
        }
        localStorage.setItem('xl_chem_theme', theme);
      };

      applyTheme(savedTheme);

      if (themeBtn) {
        themeBtn.addEventListener('click', () => {
          const current = localStorage.getItem('xl_chem_theme') || 'auto';
          const next = current === 'dark' ? 'light' : 'dark';
          applyTheme(next);
        });
      }
    }

    initStudentProfile() {
      if (this.studentName) {
        this.updateProfileDisplay();
      } else {
        if (this.elProfileModal) this.elProfileModal.style.display = 'flex';
      }

      if (this.elProfilePill) {
        this.elProfilePill.addEventListener('click', () => {
          if (this.elProfileInput) this.elProfileInput.value = this.studentName;
          if (this.elProfileModal) this.elProfileModal.style.display = 'flex';
        });
      }

      if (this.elProfileStartBtn) {
        this.elProfileStartBtn.addEventListener('click', () => {
          const val = this.elProfileInput ? this.elProfileInput.value.trim() : '';
          if (val) {
            this.setStudentName(val);
            if (this.elProfileModal) this.elProfileModal.style.display = 'none';
          } else {
            alert('Please enter your full name to proceed.');
          }
        });
      }
    }

    setStudentName(name) {
      this.studentName = name;
      localStorage.setItem('xl_chem_student_name', name);
      this.seed = this.computeSeed();
      this.rng = new SeededRNG(this.seed);
      this.generator = new Unit7DeckGenerator(this.rng);
      this.problems = this.generator.generateDeck();
      this.updateProfileDisplay();
      this.loadSavedState();
      this.renderDeck();
    }

    updateProfileDisplay() {
      if (!this.studentName) return;
      const initials = this.studentName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
      if (this.elStudentAvatar) this.elStudentAvatar.textContent = initials;
      if (this.elStudentNameDisplay) {
        this.elStudentNameDisplay.textContent = `${this.studentName}${this.run > 1 ? ` (Run #${this.run})` : ''}`;
      }
      if (this.elSeedChip) {
        this.elSeedChip.textContent = `Seed: #${this.seed}`;
      }
    }

    loadSavedState() {
      const key = `xl_chem_progress_u${this.unit}_${this.seed}`;
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
            score: 0,
            exhausted: false,
            userEntry: '',
            feedback: ''
          };
        }
      });
    }

    saveState() {
      const key = `xl_chem_progress_u${this.unit}_${this.seed}`;
      localStorage.setItem(key, JSON.stringify(this.currentStatus));
      this.updateProgressMetrics();
    }

    updateProgressMetrics() {
      const total = this.problems.length;
      let solvedCount = 0;
      let attempt1Count = 0;
      let attempt2Count = 0;
      let attempt3Count = 0;

      this.problems.forEach((p) => {
        const s = this.currentStatus[p.id];
        if (s.solved) {
          solvedCount++;
          if (s.attempts === 1) attempt1Count++;
          else if (s.attempts === 2) attempt2Count++;
          else attempt3Count++;
        }
      });

      const pct = Math.round((solvedCount / total) * 100);
      if (this.elProgressFill) this.elProgressFill.style.width = `${pct}%`;
      if (this.elMetricsLabel) {
        this.elMetricsLabel.textContent = `${solvedCount} of ${total} Solved (${pct}%)`;
      }
      if (this.elExportBtn) {
        this.elExportBtn.disabled = solvedCount < total;
      }

      const bannerStats = document.getElementById('bannerAttemptStats');
      if (bannerStats) {
        bannerStats.innerHTML = `
          <div style="font-size:0.75rem; color:var(--xl-ink-mute); font-family:var(--font-mono); display:flex; gap:0.75rem; flex-wrap:wrap;">
            <span>1st Attempt: <b>${attempt1Count}</b></span>
            <span>2nd Attempt: <b>${attempt2Count}</b></span>
            <span>3rd+ Attempt: <b>${attempt3Count}</b></span>
          </div>
        `;
      }
    }

    renderDeck() {
      if (!this.elProblemDeck) return;
      this.elProblemDeck.innerHTML = '';

      this.problems.forEach((prob) => {
        const state = this.currentStatus[prob.id];
        const card = document.createElement('div');
        card.className = `problem-card ${state.solved ? 'solved' : state.exhausted ? 'exhausted' : ''}`;
        card.id = `card_${prob.id}`;

        const maxTries = prob.maxAttempts || this.maxAttempts;
        const attemptsLeft = maxTries - state.attempts;

        let inputBlock = '';
        if (prob.type === 'mcq') {
          const optsHTML = prob.options
            .map((opt, idx) => {
              const checked = state.userEntry === opt ? 'checked' : '';
              const disabled = state.solved || state.exhausted ? 'disabled' : '';
              return `
                <label class="mcq-option ${state.userEntry === opt ? 'selected' : ''}">
                  <input type="radio" name="opt_${prob.id}" value="${opt}" ${checked} ${disabled}>
                  <span>${opt}</span>
                </label>
              `;
            })
            .join('');

          inputBlock = `
            <div class="mcq-group" id="mcqGroup_${prob.id}">
              ${optsHTML}
            </div>
            ${
              !state.solved && !state.exhausted
                ? `<button type="button" class="btn btn-primary btn-sm check-btn" data-id="${prob.id}" style="margin-top:0.75rem;">Submit Choice</button>`
                : ''
            }
          `;
        } else if (prob.type === 'ranking') {
          inputBlock = this.renderRankingContent(prob, state);
        } else {
          inputBlock = `
            <div class="input-row">
              <input type="text" class="solution-input" id="inp_${prob.id}" placeholder="${prob.placeholder || 'Your numerical answer'}" value="${state.userEntry || ''}" ${state.solved || state.exhausted ? 'disabled' : ''}>
              ${
                !state.solved && !state.exhausted
                  ? `<button type="button" class="btn btn-primary check-btn" data-id="${prob.id}">Check Answer</button>`
                  : ''
              }
            </div>
          `;
        }

        let feedbackBlock = '';
        if (state.feedback) {
          const fbCls = state.solved ? 'feedback-success' : 'feedback-error';
          feedbackBlock = `<div class="feedback-box ${fbCls}">${state.feedback}</div>`;
        }

        let solutionBlock = '';
        if (state.solved || state.exhausted) {
          solutionBlock = `
            <div class="worked-solution">
              <div class="worked-solution-title">Worked Scientific Solution &amp; Conceptual Rationalization:</div>
              <pre style="white-space:pre-wrap; font-family:var(--font-sans); font-size:0.85rem; margin-top:0.35rem; color:var(--xl-ink);">${prob.workedSolution}</pre>
            </div>
          `;
        }

        card.innerHTML = `
          <div class="problem-meta">
            <span class="problem-num">Problem ${prob.num}</span>
            <span class="skill-tag">${prob.topic}</span>
            <span style="margin-left:auto; font-size:0.75rem; font-family:var(--font-mono); color:var(--xl-ink-mute);">
              ${state.solved ? 'Mastered ✓' : state.exhausted ? 'Completed' : `${attemptsLeft} attempt${attemptsLeft === 1 ? '' : 's'} remaining`}
            </span>
          </div>
          <div class="problem-stem">${prob.stem}</div>
          ${inputBlock}
          ${feedbackBlock}
          ${solutionBlock}
        `;

        this.elProblemDeck.appendChild(card);
      });

      this.bindProblemDeckEvents();
      this.updateProgressMetrics();

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

    renderRankingContent(prob, state) {
      const disabled = state.solved || state.exhausted ? 'disabled' : '';
      const order = state.rankingOrder || prob.cards.map((c) => c.id);

      const itemsHTML = order
        .map((id, idx) => {
          const c = prob.cards.find((cardItem) => cardItem.id === id);
          return `
            <div class="ranking-card" data-id="${id}">
              <div class="ranking-rank">${idx + 1}</div>
              <div class="ranking-content">
                <div class="ranking-title">${c.title}</div>
                <div class="ranking-note">${c.note}</div>
              </div>
              <div class="ranking-controls">
                <button type="button" class="btn-rank-move btn-rank-up" data-idx="${idx}" ${disabled || idx === 0 ? 'disabled' : ''}>▲</button>
                <button type="button" class="btn-rank-move btn-rank-down" data-idx="${idx}" ${disabled || idx === order.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <div class="ranking-container">
          <div style="font-size:0.85rem; color:var(--xl-ink-mute); margin-bottom:0.75rem;">
            Use the <b>▲</b> and <b>▼</b> buttons to arrange from <b>${prob.orderLabels.first}</b> (top) to <b>${prob.orderLabels.last}</b> (bottom).
          </div>
          <div class="ranking-list" id="rankingList_${prob.id}">
            ${itemsHTML}
          </div>
          ${
            !disabled
              ? `
            <div style="margin-top:1rem; display:flex; justify-content:flex-end;">
              <button type="button" class="btn btn-primary btn-sm btn-submit-ranking" data-prob="${prob.id}">Check Ranking Order</button>
            </div>
          `
              : ''
          }
        </div>
      `;
    }

    refreshRankingList(card, prob, state) {
      const container = card.querySelector(`#rankingList_${prob.id}`);
      if (!container) return;
      const order = state.rankingOrder || prob.cards.map((c) => c.id);

      container.innerHTML = order
        .map((id, idx) => {
          const c = prob.cards.find((cardItem) => cardItem.id === id);
          return `
            <div class="ranking-card" data-id="${id}">
              <div class="ranking-rank">${idx + 1}</div>
              <div class="ranking-content">
                <div class="ranking-title">${c.title}</div>
                <div class="ranking-note">${c.note}</div>
              </div>
              <div class="ranking-controls">
                <button type="button" class="btn-rank-move btn-rank-up" data-idx="${idx}" ${idx === 0 ? 'disabled' : ''}>▲</button>
                <button type="button" class="btn-rank-move btn-rank-down" data-idx="${idx}" ${idx === order.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
            </div>
          `;
        })
        .join('');

      this.bindRankingEvents(card, prob, state);
    }

    bindRankingEvents(card, prob, state) {
      const upBtns = card.querySelectorAll('.btn-rank-up');
      const downBtns = card.querySelectorAll('.btn-rank-down');
      const submitBtn = card.querySelector('.btn-submit-ranking');

      upBtns.forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          if (idx <= 0) return;
          const order = state.rankingOrder || prob.cards.map((c) => c.id);
          const temp = order[idx - 1];
          order[idx - 1] = order[idx];
          order[idx] = temp;
          state.rankingOrder = order;
          this.refreshRankingList(card, prob, state);
        };
      });

      downBtns.forEach((btn) => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.idx, 10);
          const order = state.rankingOrder || prob.cards.map((c) => c.id);
          if (idx >= order.length - 1) return;
          const temp = order[idx + 1];
          order[idx + 1] = order[idx];
          order[idx] = temp;
          state.rankingOrder = order;
          this.refreshRankingList(card, prob, state);
        };
      });

      if (submitBtn) {
        submitBtn.onclick = () => {
          const order = state.rankingOrder || prob.cards.map((c) => c.id);
          this.handleAnswerCheck(prob, order);
        };
      }
    }

    bindProblemDeckEvents() {
      const checkBtns = document.querySelectorAll('.check-btn');
      checkBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const probId = btn.dataset.id;
          const prob = this.problems.find((p) => p.id === probId);
          if (!prob) return;

          let rawInput = '';
          if (prob.type === 'mcq') {
            const checkedRadio = document.querySelector(`input[name="opt_${probId}"]:checked`);
            if (checkedRadio) rawInput = checkedRadio.value;
          } else {
            const textInp = document.getElementById(`inp_${probId}`);
            if (textInp) rawInput = textInp.value.trim();
          }

          this.handleAnswerCheck(prob, rawInput);
        });
      });

      const mcqLabels = document.querySelectorAll('.mcq-option');
      mcqLabels.forEach((label) => {
        label.addEventListener('click', () => {
          const radio = label.querySelector('input[type="radio"]');
          if (radio && !radio.disabled) {
            radio.checked = true;
            const parent = label.closest('.mcq-group');
            if (parent) {
              parent.querySelectorAll('.mcq-option').forEach((l) => l.classList.remove('selected'));
            }
            label.classList.add('selected');
          }
        });
      });

      this.problems.forEach((prob) => {
        if (prob.type === 'ranking') {
          const card = document.getElementById(`card_${prob.id}`);
          const state = this.currentStatus[prob.id];
          if (card && state) {
            this.bindRankingEvents(card, prob, state);
          }
        }
      });
    }

    handleAnswerCheck(prob, rawInput) {
      const state = this.currentStatus[prob.id];
      if (state.solved || state.exhausted) return;

      if (!rawInput) {
        alert('Please enter or select an answer.');
        return;
      }

      state.attempts++;

      if (prob.type === 'mcq') {
        state.userEntry = rawInput;
        if (rawInput === prob.expectedOption) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Outstanding conceptual acid-base reasoning.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect choice. ${hint}`;
        }
      } else if (prob.type === 'ranking') {
        const submitted = Array.isArray(rawInput) ? rawInput : (state.rankingOrder || prob.cards.map((c) => c.id));
        state.userEntry = submitted.join(', ');
        const isMatch = submitted.every((id, idx) => id === prob.correctOrder[idx]);

        if (isMatch) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Outstanding solution pH spectrum analysis.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect ranking order. ${hint}`;
        }
      } else {
        state.userEntry = rawInput;
        const parsed = window.SmartParser ? window.SmartParser.parse(rawInput) : { isValid: true, value: parseFloat(rawInput), unit: '' };
        const res = window.SmartParser
          ? window.SmartParser.evaluate(parsed, prob.expected)
          : { status: Math.abs(parseFloat(rawInput) - prob.expected.value) <= (prob.expected.tolerance || 0.05) ? 'correct' : 'incorrect', score: 1, feedback: 'Evaluated' };

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
          <div>Valence: <b>${elem.valence || 'Var'}</b></div>
          <div>1st Ionization: <b>${elem.ie} kJ/mol</b></div>
          <div>Electronegativity: <b>${elem.en !== null ? elem.en.toFixed(2) : 'N/A'}</b></div>
        </div>
      `;
    }

    initCalculator() {
      const calcGrid = document.getElementById('calcGrid');
      if (!calcGrid) return;

      calcGrid.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const key = btn.dataset.key;

        if (key === 'clear') {
          this.calcBuffer = '';
          this.updateCalcDisplay('0');
        } else if (key === 'del') {
          this.calcBuffer = this.calcBuffer.slice(0, -1);
          this.updateCalcDisplay(this.calcBuffer || '0');
        } else if (key === '=') {
          this.evalCalculator();
        } else if (key === 'ee') {
          this.calcBuffer += '*10^';
          this.updateCalcDisplay(this.calcBuffer);
        } else if (key === 'sqrt') {
          this.calcBuffer += 'sqrt(';
          this.updateCalcDisplay(this.calcBuffer);
        } else if (key === 'pm') {
          if (this.calcBuffer.startsWith('-')) {
            this.calcBuffer = this.calcBuffer.slice(1);
          } else {
            this.calcBuffer = '-' + this.calcBuffer;
          }
          this.updateCalcDisplay(this.calcBuffer);
        } else {
          this.calcBuffer += key;
          this.updateCalcDisplay(this.calcBuffer);
        }
      });
    }

    updateCalcDisplay(val) {
      if (this.elCalcExpr) this.elCalcExpr.textContent = this.calcBuffer;
      if (this.elCalcVal) this.elCalcVal.textContent = val;
    }

    evalCalculator() {
      try {
        let clean = this.calcBuffer
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/\^/g, '**')
          .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)');

        if (!/^[0-9+\-*/().\sMath.sqrteE]+$/.test(clean)) {
          throw new Error('Invalid syntax');
        }
        const res = Function(`'use strict'; return (${clean})`)();
        const displayVal = Number.isInteger(res) ? String(res) : parseFloat(res.toFixed(4)).toString();
        this.updateCalcDisplay(displayVal);
        this.calcBuffer = displayVal;
      } catch {
        this.updateCalcDisplay('Error');
        this.calcBuffer = '';
      }
    }

    async handleExportReport() {
      const total = this.problems.length;
      let solvedCount = 0;
      let totalScore = 0;
      let firstTry = 0;
      let secondTry = 0;
      let thirdTry = 0;
      let exhaustedCount = 0;
      let totalAttemptsAll = 0;

      this.problems.forEach((p) => {
        const s = this.currentStatus[p.id];
        totalAttemptsAll += s.attempts;
        if (s.solved) {
          solvedCount++;
          totalScore += s.score;
          if (s.attempts === 1) firstTry++;
          else if (s.attempts === 2) secondTry++;
          else thirdTry++;
        } else if (s.exhausted) {
          exhaustedCount++;
        }
      });

      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const avgAttempts = solvedCount > 0 ? (totalAttemptsAll / total).toFixed(1) : '0.0';

      const sealCode = await computeDigitalSeal(
        this.studentName,
        this.seed,
        totalScore,
        total,
        dateStr
      );

      const verifyUrl = `${window.location.origin}/chem/xl/practice/verify.html?unit=${this.unit}&name=${encodeURIComponent(
        this.studentName
      )}&seed=${encodeURIComponent(this.seed)}&run=${this.run}&score=${totalScore}&total=${total}&seal=${sealCode}&att1=${firstTry}&att2=${secondTry}&att3=${thirdTry}&m=${exhaustedCount}`;

      let qrSVG = '';
      if (window.generateQRCodeSVG) {
        qrSVG = window.generateQRCodeSVG(verifyUrl, 120);
      } else {
        qrSVG = `<div style="font-family:var(--font-mono); font-size:7pt; word-break:break-all; border:1px solid #ccc; padding:4px;">${verifyUrl}</div>`;
      }

      // Group into 8 Curriculum Skills
      const skillGroups = [
        { name: 'Bronsted-Lowry & Amphoterism', ids: ['p1_bronsted_pairs_mcq', 'p2_amphoteric_mcq'] },
        { name: 'Strong Acid & Base pH/pOH', ids: ['p3_strong_acid_ph_calc', 'p4_strong_base_poh_calc'] },
        { name: 'Dissociation & Percent Ionization', ids: ['p5_strong_vs_weak_mcq', 'p6_percent_ionization_calc'] },
        { name: 'Weak Acid Equilibria & Ka', ids: ['p7_weak_acid_ka_calc', 'p8_ph_strength_ranking'] },
        { name: 'Neutralization Stoichiometry', ids: ['p9_titration_monoprotic_calc', 'p10_titration_diprotic_calc'] },
        { name: 'Titration Curves & Indicators', ids: ['p11_equivalence_endpoint_mcq', 'p12_titration_curve_ph_mcq'] },
        { name: 'Buffer Systems & Henderson-Hasselbalch', ids: ['p13_buffer_ph_calc', 'p14_buffer_mechanism_mcq'] },
        { name: 'Atmospheric & Ocean Acidification', ids: ['p15_acid_rain_calc', 'p16_ocean_acid_synthesis_mcq'] }
      ];

      const skillCardsHTML = skillGroups
        .map((g) => {
          const p1 = this.currentStatus[g.ids[0]];
          const p2 = this.currentStatus[g.ids[1]];
          const isMastered = p1 && p1.solved && p2 && p2.solved;
          const statusCls = isMastered ? 'badge-mastered' : 'badge-developing';
          const statusLabel = isMastered ? 'MASTERED' : 'DEVELOPING';

          return `
            <div class="print-skill-card">
              <span class="print-skill-badge ${statusCls}">${statusLabel}</span>
              <div class="print-skill-title">${g.name}</div>
              <div class="print-skill-desc">Items: ${g.ids[0].split('_')[0].toUpperCase()}, ${g.ids[1].split('_')[0].toUpperCase()}</div>
            </div>
          `;
        })
        .join('');

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

      const printContainer = document.getElementById('studyReportSheet');
      printContainer.innerHTML = `
        <div class="print-receipt-header">
          <div class="print-title-area">
            <h2>XL Chem Practice Receipt</h2>
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 7:</b> Acids &amp; Bases &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
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
          <b>Unit 7 Quick Reference Key:</b> pH = -log[H⁺] &middot; pH + pOH = 14.00 &middot; Ka = [H⁺][A⁻]/[HA] &middot; % Ionization = ([H⁺]/[HA]₀)&times;100% &middot; pH = pKa + log([A⁻]/[HA]) &middot; MaVa = MbVb
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_bronsted_pairs_mcq') return 'Bronsted-Lowry conjugate acid-base identification';
      if (p.id === 'p2_amphoteric_mcq') return 'Amphoteric dual donor and acceptor mechanism';
      if (p.id === 'p3_strong_acid_ph_calc') return 'Strong acid complete dissociation pH';
      if (p.id === 'p4_strong_base_poh_calc') return 'Strong base hydroxide pOH and pH';
      if (p.id === 'p5_strong_vs_weak_mcq') return 'Extents of dissociation vs acid concentration';
      if (p.id === 'p6_percent_ionization_calc') return 'Weak acid percent ionization calculation';
      if (p.id === 'p7_weak_acid_ka_calc') return 'Weak acid equilibrium Ka and pH';
      if (p.id === 'p8_ph_strength_ranking') return 'Aqueous solution pH spectrum ordering';
      if (p.id === 'p9_titration_monoprotic_calc') return 'Monoprotic acid titration molarity';
      if (p.id === 'p10_titration_diprotic_calc') return 'Diprotic acid neutralization volume KOH';
      if (p.id === 'p11_equivalence_endpoint_mcq') return 'Equivalence point vs indicator endpoint';
      if (p.id === 'p12_titration_curve_ph_mcq') return 'Weak acid titration equivalence point pH';
      if (p.id === 'p13_buffer_ph_calc') return 'Henderson-Hasselbalch buffer pH';
      if (p.id === 'p14_buffer_mechanism_mcq') return 'Buffer response to added strong acid';
      if (p.id === 'p15_acid_rain_calc') return 'Acid rain hydrogen ion fold increase';
      if (p.id === 'p16_ocean_acid_synthesis_mcq') return 'Ocean acidification coral calcification synthesis';
      return 'Unit 7 practice item';
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
