/**
 * unit4.js - XL Chemistry Practice Suite: Unit 4 (Reactions & Stoichiometry)
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
  const UNIT4_SKILLS = [
    { num: 1, title: 'Balancing Equations & Conservation of Matter', problems: [1, 2], lesson: 'Lesson 1-2e' },
    { num: 2, title: 'Chemical Reaction Classification', problems: [3, 4], lesson: 'Lesson 1-2e' },
    { num: 3, title: 'Macroscopic Evidence & Reaction Observation', problems: [5, 6], lesson: 'Lesson 1-2d' },
    { num: 4, title: 'Mole Ratios & Particle Models', problems: [7, 8], lesson: 'Lesson 1-7c' },
    { num: 5, title: 'Mole-to-Mole & Mole-to-Mass Stoichiometry', problems: [9, 10], lesson: 'Lesson 1-7c' },
    { num: 6, title: 'Mass-to-Mass Stoichiometry & Particle Conversions', problems: [11, 12], lesson: 'Lesson 1-7c' },
    { num: 7, title: 'Limiting & Excess Reactants', problems: [13, 14], lesson: 'Lesson 1-7c' },
    { num: 8, title: 'Percent Yield & Culinary Recipe Stoichiometry', problems: [15, 16], lesson: 'Lesson 1-7c' }
  ];

  // Pool 1: Balancing Chemical Reactions (Calculation - 5 attempts)
  const BALANCING_REACTION_POOL = [
    {
      unbalanced: 'Al + Cl₂ → AlCl₃',
      balanced: '2Al + 3Cl₂ → 2AlCl₃',
      coeffs: [2, 3, 2],
      sum: 7,
      species: 'AlCl₃',
      targetCoeff: 2,
      note: '2 Al + 3 Cl₂ → 2 AlCl₃'
    },
    {
      unbalanced: 'Ti + Cl₂ → TiCl₄',
      balanced: 'Ti + 2Cl₂ → TiCl₄',
      coeffs: [1, 2, 1],
      sum: 4,
      species: 'Cl₂',
      targetCoeff: 2,
      note: '1 Ti + 2 Cl₂ → 1 TiCl₄'
    },
    {
      unbalanced: 'Mg + AlCl₃ → MgCl₂ + Al',
      balanced: '3Mg + 2AlCl₃ → 3MgCl₂ + 2Al',
      coeffs: [3, 2, 3, 2],
      sum: 10,
      species: 'MgCl₂',
      targetCoeff: 3,
      note: '3 Mg + 2 AlCl₃ → 3 MgCl₂ + 2 Al'
    },
    {
      unbalanced: 'Al + Cr₂O₃ → Cr + Al₂O₃',
      balanced: '2Al + Cr₂O₃ → 2Cr + Al₂O₃',
      coeffs: [2, 1, 2, 1],
      sum: 6,
      species: 'Al',
      targetCoeff: 2,
      note: '2 Al + 1 Cr₂O₃ → 2 Cr + 1 Al₂O₃'
    },
    {
      unbalanced: 'C₂H₅OH + O₂ → CO₂ + H₂O',
      balanced: 'C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O',
      coeffs: [1, 3, 2, 3],
      sum: 9,
      species: 'O₂',
      targetCoeff: 3,
      note: '1 C₂H₅OH + 3 O₂ → 2 CO₂ + 3 H₂O'
    },
    {
      unbalanced: 'AlBr₃ + NaOH → Al(OH)₃ + NaBr',
      balanced: 'AlBr₃ + 3NaOH → Al(OH)₃ + 3NaBr',
      coeffs: [1, 3, 1, 3],
      sum: 8,
      species: 'NaBr',
      targetCoeff: 3,
      note: '1 AlBr₃ + 3 NaOH → 1 Al(OH)₃ + 3 NaBr'
    }
  ];

  // Pool 2: Reaction Classification by Formula Pattern (MCQ)
  const REACTION_CLASSIFICATION_POOL = [
    {
      equation: 'Ti + 2Cl₂ → TiCl₄',
      correct: 'Synthesis (two simple reactants combine directly into a single product compound).',
      distractors: [
        'Single replacement (a free element displaces an ion in an aqueous ionic compound).',
        'Decomposition (a single complex compound breaks down into simpler constituents).',
        'Double replacement (two aqueous ionic compounds exchange ionic partners).'
      ],
      hint1: 'Look at the number of reactants versus products: multiple reactants yield one product.',
      hint2: 'A + B → AB represents a synthesis (combination) reaction pattern.',
      explanation: 'Titanium reacts with chlorine gas to form a single substance, titanium tetrachloride. This fits the synthesis (combination) reaction model.'
    },
    {
      equation: '2NaCl → 2Na + Cl₂',
      correct: 'Decomposition (a single compound breaks down into its constituent elements).',
      distractors: [
        'Synthesis (two separate elements combine into a single chemical compound).',
        'Single replacement (a more reactive element displaces a less reactive element).',
        'Combustion (a fuel reacts vigorously with oxygen gas to release heat and light).'
      ],
      hint1: 'There is only one reactant on the left side of the arrow.',
      hint2: 'AB → A + B represents a decomposition reaction pattern.',
      explanation: 'Solid sodium chloride breaks down into sodium metal and chlorine gas. A single reactant yielding two products is the definition of a decomposition reaction.'
    },
    {
      equation: '3Mg + 2AlCl₃ → 3MgCl₂ + 2Al',
      correct: 'Single replacement (magnesium metal displaces aluminum cations from the chloride salt).',
      distractors: [
        'Double replacement (two ionic compounds exchange cations and anions in solution).',
        'Synthesis (magnesium and aluminum chloride fuse into an alloy crystal lattice).',
        'Decomposition (aluminum chloride spontaneously releases chlorine gas to magnesium).'
      ],
      hint1: 'A pure element reacts with an ionic compound to produce a new compound and new element.',
      hint2: 'A + BC → AC + B is the classic single replacement formula pattern.',
      explanation: 'Elemental magnesium displaces aluminum from aluminum chloride, producing magnesium chloride and elemental aluminum. This is a single replacement reaction.'
    },
    {
      equation: 'AgNO₃ + NaCl → AgCl + NaNO₃',
      correct: 'Double replacement (silver and sodium cations exchange nitrate and chloride anions).',
      distractors: [
        'Single replacement (elemental silver replaces sodium in an aqueous salt solution).',
        'Synthesis (two soluble salts combine directly into a single double-salt complex).',
        'Decomposition (silver nitrate decomposes into silver metal and nitrogen dioxide).'
      ],
      hint1: 'Both reactants are compounds, and both products are compounds with swapped ions.',
      hint2: 'AB + CD → AD + CB represents double replacement (precipitation).',
      explanation: 'Aqueous silver nitrate and sodium chloride exchange anion partners to yield solid silver chloride precipitate and aqueous sodium nitrate. This is double replacement.'
    },
    {
      equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
      correct: 'Combustion (a hydrocarbon reacts rapidly with oxygen gas to produce CO₂, H₂O, and heat).',
      distractors: [
        'Single replacement (carbon replaces hydrogen atoms in diatomic oxygen molecules).',
        'Double replacement (methane and oxygen exchange hydrogen and oxygen atoms equally).',
        'Decomposition (methane breaks down into gaseous carbon and hydrogen vapor).'
      ],
      hint1: 'Reaction of a hydrocarbon with molecular oxygen producing carbon dioxide and water.',
      hint2: 'Rapid exothermic reaction with O₂ characterizes combustion.',
      explanation: 'Methane oxidizes vigorously in oxygen gas to yield carbon dioxide, water vapor, and thermal energy. This is a classic hydrocarbon combustion reaction.'
    }
  ];

  // Pool 3: Macroscopic Evidence Scenarios (MCQ)
  const MACROSCOPIC_EVIDENCE_SCENARIOS = [
    {
      context: 'Magnesium Ribbon in Bunsen Burner',
      stem: 'A chemistry student holds a piece of silvery magnesium ribbon in a flame. The metal ignites with a blinding bright white light and intense heat, leaving behind a crumbly white powder. Based on these macroscopic observations, which reaction type occurred and what compound formed?',
      correct: 'Synthesis reaction; magnesium combined with atmospheric oxygen to form solid magnesium oxide (MgO).',
      distractors: [
        'Decomposition reaction; magnesium ribbon broke down into individual subatomic protons and neutrons.',
        'Double replacement reaction; magnesium exchanged ionic partners with gaseous atmospheric nitrogen.',
        'Single replacement reaction; magnesium displaced carbon from airborne carbon dioxide exclusively.'
      ],
      hint1: 'A pure metal reacting with atmospheric oxygen gas to produce a single solid powder.',
      hint2: '2Mg(s) + O₂(g) → 2MgO(s) is an exothermic combination reaction.',
      explanation: 'The blinding white flame and white powder indicate the synthesis of magnesium oxide (MgO) from elemental magnesium and atmospheric oxygen gas.'
    },
    {
      context: 'Mixing Clear Aqueous Solutions',
      stem: 'In a laboratory investigation, a student mixes two completely clear, colorless aqueous solutions: lead(II) nitrate and potassium iodide. Instantly upon contact, the mixture turns bright canary yellow and an opaque solid settles to the bottom of the test tube. What reaction type does this macroscopic evidence represent?',
      correct: 'Double replacement reaction; exchange of ions produced an insoluble bright yellow precipitate (PbI₂).',
      distractors: [
        'Hydrocarbon combustion; thermal energy caused immediate vapor ignition and yellow flame ionization.',
        'Thermal decomposition; lead nitrate molecules broke apart into elemental lead and nitrogen gas.',
        'Single replacement; pure metallic potassium displaced lead atoms onto the glass test tube walls.'
      ],
      hint1: 'Two clear solutions forming an opaque solid precipitate upon mixing indicates ion exchange.',
      hint2: 'Pb(NO₃)₂(aq) + 2KI(aq) → PbI₂(s) + 2KNO₃(aq) is a double replacement precipitation.',
      explanation: 'The sudden appearance of an insoluble yellow solid when mixing two ionic solutions is definitive evidence of a double replacement reaction forming a precipitate (lead(II) iodide).'
    },
    {
      context: 'Bunsen Burner Natural Gas Flame',
      stem: 'When natural gas (methane, CH₄) burns at a laboratory burner, a steady blue flame emits continuous thermal energy and light. An inverted cool beaker held above the flame rapidly fogs with liquid droplets, and limewater held nearby turns cloudy from gas absorption. What reaction type is occurring?',
      correct: 'Combustion reaction; methane reacts with oxygen gas to produce carbon dioxide and water vapor.',
      distractors: [
        'Synthesis reaction; carbon dioxide and water combine under flame temperature to generate methane.',
        'Single replacement reaction; hydrogen atoms displace carbon nuclei to create a plasma field.',
        'Decomposition reaction; methane decomposes without oxygen into elemental carbon soot exclusively.'
      ],
      hint1: 'Fuel + oxygen → water vapor (fogging beaker) + carbon dioxide (cloudy limewater) + heat.',
      hint2: 'CH₄ + 2O₂ → CO₂ + 2H₂O is the standard combustion equation.',
      explanation: 'The consumption of oxygen and production of water vapor (beaker fogging) and carbon dioxide (limewater test) accompanied by heat and light prove combustion.'
    }
  ];

  // ============================================================
  // 5. PROBLEM GENERATION ENGINE
  // ============================================================
  class Unit4DeckGenerator {
    constructor(rng) {
      this.rng = rng;
    }

    generateDeck() {
      return [
        this.genProblem1_BalancingCalc(this.rng),
        this.genProblem2_ConservationMassMCQ(this.rng),
        this.genProblem3_ReactionClassMCQ(this.rng),
        this.genProblem4_ReplacementMechanismMCQ(this.rng),
        this.genProblem5_MacroscopicEvidenceMCQ(this.rng),
        this.genProblem6_PhysicalVsChemicalCookingMCQ(this.rng),
        this.genProblem7_MoleRatioConceptMCQ(this.rng),
        this.genProblem8_MoleToMoleCalc(this.rng),
        this.genProblem9_CombustionMoleMCQ(this.rng),
        this.genProblem10_MassToMassCalc(this.rng),
        this.genProblem11_StoichRanking(this.rng),
        this.genProblem12_ParticlesStoichMCQ(this.rng),
        this.genProblem13_LimitingReactantCalc(this.rng),
        this.genProblem14_LimitingConceptMCQ(this.rng),
        this.genProblem15_PercentYieldCalc(this.rng),
        this.genProblem16_CulinaryYieldDiscrepancyMCQ(this.rng)
      ];
    }

    // --- Problem 1: Balancing Chemical Equations (Calculation - 5 attempts) ---
    genProblem1_BalancingCalc(rng) {
      const rxn = rng.pick(BALANCING_REACTION_POOL);

      return {
        id: 'p1_balancing_calc',
        num: 1,
        topic: 'Chemical Equations: Stoichiometric Balancing',
        stem: `Balance the following skeleton chemical equation using the lowest whole-number integer coefficients:<br><br>
        <div style="padding:0.75rem 1rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1.05rem; margin-bottom:0.75rem; text-align:center;">
          <strong>${rxn.unbalanced}</strong>
        </div>
        What is the <strong>sum of all stoichiometric coefficients</strong> (reactants plus products) in the correctly balanced chemical equation? Enter a single whole number (e.g. <code>7</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rxn.sum,
          tolerance: 0.001
        },
        placeholder: 'e.g. 7',
        hint1: 'Ensure the count of each atom type on the reactant side equals its count on the product side.',
        hint2: `Balanced equation: ${rxn.note}. Sum the coefficients: ${rxn.coeffs.join(' + ')} = ${rxn.sum}.`,
        workedSolution: `1. Balancing steps: ${rxn.note}.\n2. Coefficients: ${rxn.coeffs.join(', ')}.\n3. Sum of all stoichiometric coefficients = ${rxn.coeffs.join(' + ')} = ${rxn.sum}.`
      };
    }

    // --- Problem 2: Conservation of Mass (MCQ - 3 attempts) ---
    genProblem2_ConservationMassMCQ(rng) {
      const correct = 'Atoms cannot be created or destroyed in chemical reactions; existing bonds break and atoms rearrange into new product configurations.';
      const distractors = [
        'Reactant mass is converted into nuclear binding energy, reducing the measured product mass by several grams.',
        'Atoms expand in physical volume during reactions, causing the products to weigh substantially more than reactants.',
        'Atoms decompose into pure energy during endothermic reactions and condense into new mass during exothermic reactions.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p2_conservation_mass_mcq',
        num: 2,
        topic: 'Conservation of Matter: Atomic Rearrangement',
        stem: 'According to the Law of Conservation of Mass and Dalton\'s atomic theory, what happens to the constituent atoms when reactants are converted into products during a chemical reaction?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Chemical reactions involve the breaking and forming of chemical bonds, not changes to atomic nuclei.',
        hint2: 'The total number and type of atoms before the reaction must equal the total number and type after.',
        explanation: 'In ordinary chemical reactions, atomic nuclei remain unchanged. Existing chemical bonds break and atoms rearrange to form new chemical bonds, strictly preserving total atom count and mass.'
      };
    }

    // --- Problem 3: Chemical Reaction Classification (MCQ - 3 attempts) ---
    genProblem3_ReactionClassMCQ(rng) {
      const scenario = rng.pick(REACTION_CLASSIFICATION_POOL);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p3_reaction_class_mcq',
        num: 3,
        topic: 'Reaction Types: Symbolic Pattern Recognition',
        stem: `Examine the balanced chemical equation below:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; margin-bottom:0.75rem; text-align:center;">
          <strong>${scenario.equation}</strong>
        </div>
        Which reaction category best classifies this chemical transformation?`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 4: Replacement Reaction Mechanisms (MCQ - 3 attempts) ---
    genProblem4_ReplacementMechanismMCQ(rng) {
      const correct = 'Single replacement involves a pure element transferring electrons to displace another element; double replacement involves two ionic compounds swapping partners.';
      const distractors = [
        'Single replacement always releases carbon dioxide gas; double replacement reactions produce pure elemental metals as precipitates.',
        'Single replacement occurs only at high temperatures above 1000 °C; double replacement occurs exclusively in nonpolar organic solvents.',
        'Single replacement requires three separate compounds; double replacement combines an elemental gas with an aqueous acid.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p4_replacement_mechanism_mcq',
        num: 4,
        topic: 'Reaction Mechanisms: Single vs Double Replacement',
        stem: 'How does a single replacement reaction fundamentally differ from a double replacement reaction in terms of reacting species and electron behavior?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'A + BC → AC + B versus AB + CD → AD + CB.',
        hint2: 'Single replacement involves oxidation-reduction (electron transfer); double replacement is typically an exchange of ions.',
        explanation: 'A single replacement reaction features a free element displacing an ion from a compound through redox electron transfer. A double replacement reaction features two ionic compounds exchanging partner ions.'
      };
    }

    // --- Problem 5: Macroscopic Evidence of Reactions (MCQ - 3 attempts) ---
    genProblem5_MacroscopicEvidenceMCQ(rng) {
      const scenario = rng.pick(MACROSCOPIC_EVIDENCE_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p5_macroscopic_evidence_mcq',
        num: 5,
        topic: 'Macroscopic Evidence: Laboratory Reaction Indicators',
        stem: `${scenario.stem}`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 6: Physical vs Chemical in Cooking & Baking (MCQ - 3 attempts) ---
    genProblem6_PhysicalVsChemicalCookingMCQ(rng) {
      const correct = 'Caramelization is a chemical change because heat breaks and rearranges covalent bonds to create new flavor compounds; dissolving is a physical dispersion.';
      const distractors = [
        'Both processes are purely physical changes because sugar molecules can be fully recovered unchanged from caramel.',
        'Dissolving sugar is a chemical change because water molecules permanently break sucrose into carbon and hydrogen gas.',
        'Caramelization is a physical change of state identical to melting ice, while dissolving sugar breaks nuclear atomic bonds.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p6_cooking_change_mcq',
        num: 6,
        topic: 'Culinary Chemistry: Chemical vs Physical Transformations',
        stem: 'In pastry baking, a chef dissolves sucrose in warm water to make a simple syrup, and in another pan heats dry sucrose until it browns and caramelizes. How do these two culinary processes differ at the molecular scale?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Does the chemical identity of the sucrose molecule change?',
        hint2: 'Dissolving separates sucrose molecules with hydration shells; caramelization thermally degrades sugar into hundreds of new compounds.',
        explanation: 'Dissolving sugar is a physical change: sucrose molecules remain intact surrounded by water. Caramelization is a complex chemical change: thermal decomposition breaks covalent bonds, producing hundreds of new compounds responsible for brown color and caramel aromas.'
      };
    }

    // --- Problem 7: Mole Ratio Concept & Coefficients (MCQ - 3 attempts) ---
    genProblem7_MoleRatioConceptMCQ(rng) {
      const correct = 'Coefficients represent relative numbers of moles or particles, not masses; 1 g of N₂ contains far fewer moles than 3 g of H₂ due to molar mass differences.';
      const distractors = [
        'Coefficients represent exact masses in grams; 1 g of N₂ reacts perfectly with 3 g of H₂ according to the Law of Conservation of Mass.',
        'The reaction must occur in a 1 to 3 volume ratio of solid crystals rather than gaseous molecular collisions.',
        'Coefficients indicate the speed of the reaction; nitrogen reacts three times faster than hydrogen gas during collisions.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p7_mole_ratio_concept_mcq',
        num: 7,
        topic: 'Stoichiometric Ratios: Coefficients vs Grams',
        stem: 'Given the balanced industrial Haber-Bosch equation: <strong>N₂ + 3H₂ → 2NH₃</strong>, why is it scientifically incorrect to assume that 1.00 gram of N₂ will react completely with 3.00 grams of H₂?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Coefficients reflect counting units (moles or molecules), not grams.',
        hint2: 'One mole of N₂ weighs 28.02 g, while one mole of H₂ weighs only 2.016 g.',
        explanation: 'Coefficients in balanced equations specify stoichiometric ratios of particles or moles, not grams. Because nitrogen and hydrogen have vastly different molar masses (28.02 g/mol vs 2.016 g/mol), 1 g of N₂ does not equal 1 mole of N₂.'
      };
    }

    // --- Problem 8: Mole-to-Mole Stoichiometry (Calculation - 5 attempts) ---
    genProblem8_MoleToMoleCalc(rng) {
      const molesAlBr3 = rng.float(1.20, 3.50, 2);
      const molesNaBr = parseFloat((molesAlBr3 * 3).toFixed(2));

      return {
        id: 'p8_mole_to_mole_calc',
        num: 8,
        topic: 'Mole-to-Mole Stoichiometry: Mole Ratios',
        stem: `Consider the double replacement precipitation reaction:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; margin-bottom:0.75rem; text-align:center;">
          <strong>AlBr₃ + 3NaOH → Al(OH)₃ + 3NaBr</strong>
        </div>
        How many <strong>moles of sodium bromide (NaBr)</strong> can be synthesized from <strong>${molesAlBr3} moles</strong> of aluminum bromide (AlBr₃) reacting with excess sodium hydroxide? Include units in your answer (e.g. <code>1.50 mol</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: molesNaBr,
          unit: 'mol',
          tolerance: 0.02
        },
        placeholder: 'e.g. 1.50 mol',
        hint1: 'Use the mole ratio from the balanced equation: 3 mol NaBr / 1 mol AlBr₃.',
        hint2: `Multiply ${molesAlBr3} mol AlBr₃ × 3 = ${molesNaBr} mol NaBr.`,
        workedSolution: `1. Mole ratio: (3 mol NaBr) / (1 mol AlBr₃).\n2. Calculation: ${molesAlBr3} mol AlBr₃ × (3 mol NaBr / 1 mol AlBr₃) = ${molesNaBr} mol NaBr.`
      };
    }

    // --- Problem 9: Combustion Stoichiometry Moles (MCQ - 3 attempts) ---
    genProblem9_CombustionMoleMCQ(rng) {
      const correct = '7.0 × 10⁻⁴ moles of O₂ (using the 2:1 mole ratio of O₂ to CO₂).';
      const distractors = [
        '3.5 × 10⁻⁴ moles of O₂ (assuming a 1:1 ratio between all reactants and products).',
        '1.75 × 10⁻⁴ moles of O₂ (incorrectly dividing the given moles of CO₂ by 2).',
        '1.4 × 10⁻³ moles of O₂ (inappropriately multiplying by 4 based on total hydrogen atoms).'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p9_combustion_mole_mcq',
        num: 9,
        topic: 'Combustion Stoichiometry: Scientific Notation Moles',
        stem: 'Methane gas combusts according to the balanced equation: <strong>CH₄ + 2O₂ → CO₂ + 2H₂O</strong>. How many moles of oxygen gas (O₂) are required to produce <strong>3.5 × 10⁻⁴ moles</strong> of carbon dioxide (CO₂)?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Examine the stoichiometric mole ratio between O₂ and CO₂: 2 mol O₂ per 1 mol CO₂.',
        hint2: 'Multiply (3.5 × 10⁻⁴ mol CO₂) × (2 mol O₂ / 1 mol CO₂).',
        explanation: 'From the balanced equation, each mole of CO₂ produced requires 2 moles of O₂. Therefore: (3.5 × 10⁻⁴ mol CO₂) × (2 mol O₂ / 1 mol CO₂) = 7.0 × 10⁻⁴ moles of O₂.'
      };
    }

    // --- Problem 10: Mass-to-Mass Theoretical Yield (Calculation - 5 attempts) ---
    genProblem10_MassToMassCalc(rng) {
      const massCaCO3 = rng.pick([50.0, 60.0, 75.0, 80.0, 100.0]);
      const mmCaCO3 = 100.09;
      const mmCaO = 56.08;
      const molesCaCO3 = massCaCO3 / mmCaCO3;
      const massCaO = parseFloat((molesCaCO3 * mmCaO).toFixed(2));

      return {
        id: 'p10_mass_to_mass_calc',
        num: 10,
        topic: 'Mass-to-Mass Stoichiometry: Theoretical Yield',
        stem: `Calcium carbonate decomposes upon heating according to the balanced equation:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; margin-bottom:0.75rem; text-align:center;">
          <strong>CaCO₃(s) → CaO(s) + CO₂(g)</strong>
        </div>
        (Molar masses: CaCO₃ = <strong>100.09 g/mol</strong>, CaO = <strong>56.08 g/mol</strong>).<br><br>
        If a sample of <strong>${massCaCO3} g</strong> of pure CaCO₃ is completely decomposed, calculate the <strong>theoretical yield of calcium oxide (CaO) in grams</strong>. Include units in your answer (e.g. <code>42.5 g</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: massCaO,
          unit: 'g',
          tolerance: 0.03
        },
        placeholder: 'e.g. 42.5 g',
        hint1: 'Step 1: Convert grams of CaCO₃ to moles (divide by 100.09 g/mol). Step 2: Use the 1:1 mole ratio. Step 3: Convert moles of CaO to grams (multiply by 56.08 g/mol).',
        hint2: `Moles CaCO₃ = ${massCaCO3} / 100.09 = ${molesCaCO3.toFixed(3)} mol. Mass CaO = ${molesCaCO3.toFixed(3)} × 56.08 = ${massCaO} g.`,
        workedSolution: `1. Moles CaCO₃: ${massCaCO3} g / 100.09 g/mol = ${molesCaCO3.toFixed(4)} mol.\n2. Moles CaO: ${molesCaCO3.toFixed(4)} mol × (1 mol CaO / 1 mol CaCO₃) = ${molesCaCO3.toFixed(4)} mol.\n3. Theoretical Mass CaO: ${molesCaCO3.toFixed(4)} mol × 56.08 g/mol = ${massCaO} g.`
      };
    }

    // --- Problem 11: Stoichiometric Quantities Ranking (Ranking - 3 attempts) ---
    genProblem11_StoichRanking(rng) {
      const cards = [
        { id: 'h2_req', title: 'H₂ Moles Required', note: '3 moles of H₂ consumed per mole of reaction' },
        { id: 'nh3_prod', title: 'NH₃ Moles Produced', note: '2 moles of NH₃ produced per mole of reaction' },
        { id: 'n2_req', title: 'N₂ Moles Required', note: '1 mole of N₂ consumed per mole of reaction' },
        { id: 'cat_net', title: 'Iron Catalyst Net Moles', note: '0 net moles consumed (catalyst is regenerated)' }
      ];

      const correctOrder = ['h2_req', 'nh3_prod', 'n2_req', 'cat_net'];
      const shuffledCards = rng.shuffle(cards);

      return {
        id: 'p11_stoich_ranking',
        num: 11,
        topic: 'Stoichiometric Coefficients: Relative Quantity Ranking',
        stem: 'For the complete synthesis of ammonia in the Haber-Bosch process: <strong>N₂ + 3H₂ → 2NH₃</strong> (catalyzed by solid iron), arrange the following chemical species in order of <strong>descending stoichiometric quantity</strong> (from the greatest number of moles at #1 to the smallest number of moles at #4).',
        type: 'ranking',
        maxAttempts: 3,
        cards: shuffledCards,
        correctOrder: correctOrder,
        hint1: 'Compare the stoichiometric coefficients in the balanced equation.',
        hint2: 'H₂ has coefficient 3, NH₃ has coefficient 2, N₂ has coefficient 1, and the catalyst is neither created nor consumed (net 0).',
        workedSolution: '1. H₂ required: 3 moles\n2. NH₃ produced: 2 moles\n3. N₂ required: 1 mole\n4. Catalyst consumed: 0 moles.\nDescending order: H₂ (3) > NH₃ (2) > N₂ (1) > Catalyst (0).'
      };
    }

    // --- Problem 12: Particle Stoichiometry Conversions (MCQ - 3 attempts) ---
    genProblem12_ParticlesStoichMCQ(rng) {
      const correct = '1.204 × 10²⁴ CO₂ molecules (2.00 moles of CO₂ × 6.022 × 10²³ molecules/mol).';
      const distractors = [
        '6.022 × 10²³ CO₂ molecules (assuming only 1.00 mole of CO₂ is produced per mole of ethanol).',
        '3.011 × 10²³ CO₂ molecules (inappropriately dividing Avogadro\'s number by the coefficient of 2).',
        '3.613 × 10²⁴ CO₂ molecules (confusing the water coefficient of 3 with the carbon dioxide yield).'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p12_particles_stoich_mcq',
        num: 12,
        topic: 'Particle Stoichiometry: Avogadro Conversions',
        stem: 'Ethanol combusts according to: <strong>C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O</strong>. How many individual <strong>molecules of carbon dioxide (CO₂)</strong> are generated when exactly <strong>1.00 mole of ethanol</strong> combusts completely in excess oxygen?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Determine moles of CO₂ produced first: 1.00 mol C₂H₅OH × 2 = 2.00 mol CO₂.',
        hint2: 'Multiply moles of CO₂ by Avogadro\'s number: 2.00 × 6.022 × 10²³ molecules/mol.',
        explanation: 'From the balanced equation, 1 mole of ethanol yields 2 moles of CO₂. Multiplying 2.00 mol by Avogadro\'s constant (6.022 × 10²³ molecules/mol) gives 1.204 × 10²⁴ molecules of CO₂.'
      };
    }

    // --- Problem 13: Limiting Reactant Theoretical Yield (Calculation - 5 attempts) ---
    genProblem13_LimitingReactantCalc(rng) {
      const massAl = rng.pick([5.00, 6.00, 7.50, 8.00]);
      const massCl2 = 20.0;
      const mmAl = 26.98;
      const mmCl2 = 70.90;
      const mmAlCl3 = 133.33;

      // 2Al + 3Cl2 -> 2AlCl3
      const yieldFromAl = (massAl / mmAl) * mmAlCl3;
      const yieldFromCl2 = (massCl2 / mmCl2) * (2 / 3) * mmAlCl3;
      const theoreticalYield = parseFloat(Math.min(yieldFromAl, yieldFromCl2).toFixed(2));

      return {
        id: 'p13_limiting_calc',
        num: 13,
        topic: 'Limiting Reactants: Maximum Theoretical Mass Yield',
        stem: `Solid aluminum reacts vigorously with chlorine gas according to the synthesis reaction:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; margin-bottom:0.75rem; text-align:center;">
          <strong>2Al(s) + 3Cl₂(g) → 2AlCl₃(s)</strong>
        </div>
        (Molar masses: Al = <strong>26.98 g/mol</strong>, Cl₂ = <strong>70.90 g/mol</strong>, AlCl₃ = <strong>133.33 g/mol</strong>).<br><br>
        A reaction vessel is charged with <strong>${massAl} g of Al</strong> and <strong>${massCl2} g of Cl₂</strong>. Determine which reactant is limiting, and calculate the <strong>maximum theoretical yield of aluminum chloride (AlCl₃) in grams</strong>. Include units in your answer (e.g. <code>24.5 g</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: theoreticalYield,
          unit: 'g',
          tolerance: 0.03
        },
        placeholder: 'e.g. 24.5 g',
        hint1: 'Calculate the mass of AlCl₃ produced if all Al reacts, and if all Cl₂ reacts. The smaller mass identifies the limiting reactant and theoretical yield.',
        hint2: `Yield from Al = (${massAl}/26.98) × 133.33 = ${yieldFromAl.toFixed(2)} g. Yield from Cl₂ = (${massCl2}/70.90) × (2/3) × 133.33 = ${yieldFromCl2.toFixed(2)} g. Take the smaller value.`,
        workedSolution: `1. Moles Al: ${massAl} g / 26.98 g/mol = ${(massAl/mmAl).toFixed(4)} mol Al → produces ${yieldFromAl.toFixed(2)} g AlCl₃.\n2. Moles Cl₂: ${massCl2} g / 70.90 g/mol = ${(massCl2/mmCl2).toFixed(4)} mol Cl₂ → produces ${yieldFromCl2.toFixed(2)} g AlCl₃.\n3. The limiting reactant is ${yieldFromAl < yieldFromCl2 ? 'Al' : 'Cl₂'}, giving a theoretical yield of ${theoreticalYield} g AlCl₃.`
      };
    }

    // --- Problem 14: Limiting Reactant Identification Concept (MCQ - 3 attempts) ---
    genProblem14_LimitingConceptMCQ(rng) {
      const correct = 'Oxygen gas (O₂); although 20.0 g of O₂ exceeds 10.0 g of ethanol in mass, the 3:1 stoichiometric ratio consumes O₂ faster than available.';
      const distractors = [
        'Ethanol (C₂H₅OH); because 10.0 g is smaller than 20.0 g, the reactant with the smaller initial mass is always limiting.',
        'Neither reactant; exactly 10.0 g and 20.0 g react in an ideal 1 to 2 stoichiometric mass balance leaving zero excess.',
        'Water vapor; the product molecules accumulate and reverse the combustion reaction before all ethanol is consumed.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p14_limiting_concept_mcq',
        num: 14,
        topic: 'Limiting Reactants: Mass Comparison Misconception',
        stem: 'Ethanol combusts in oxygen according to: <strong>C₂H₅OH + 3O₂ → 2CO₂ + 3H₂O</strong>. A reaction mixture contains <strong>10.0 g of ethanol</strong> (46.07 g/mol) and <strong>20.0 g of oxygen gas</strong> (32.00 g/mol). Which reactant is limiting, and why is judging by initial mass in grams misleading?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Convert both masses to moles: 10.0 g / 46.07 g/mol = 0.217 mol ethanol; 20.0 g / 32.00 g/mol = 0.625 mol O₂.',
        hint2: '0.217 mol ethanol requires (0.217 × 3) = 0.651 mol O₂. Only 0.625 mol O₂ is present.',
        explanation: '10.0 g ethanol = 0.217 mol. Complete reaction requires 0.217 × 3 = 0.651 mol O₂ (20.8 g). Because only 20.0 g (0.625 mol) of O₂ is present, O₂ is exhausted first. Looking only at grams fails because molar masses and mole ratios govern stoichiometry.'
      };
    }

    // --- Problem 15: Percent Yield Calculation (Calculation - 5 attempts) ---
    genProblem15_PercentYieldCalc(rng) {
      const scenarios = [
        { product: 'aluminum chloride (AlCl₃)', theoretical: 24.67, actual: 21.5, pct: 87.15 },
        { product: 'carbon dioxide (CO₂)', theoretical: 18.36, actual: 13.5, pct: 73.53 },
        { product: 'calcium oxide (CaO)', theoretical: 28.04, actual: 25.0, pct: 89.16 },
        { product: 'aspirin synthesized in lab', theoretical: 15.20, actual: 13.8, pct: 90.79 },
        { product: 'precipitated silver chloride (AgCl)', theoretical: 14.35, actual: 12.2, pct: 85.02 }
      ];

      const item = rng.pick(scenarios);
      const roundedPct = parseFloat(item.pct.toFixed(1));

      return {
        id: 'p15_percent_yield_calc',
        num: 15,
        topic: 'Percent Yield: Experimental Recovery Efficiency',
        stem: `In a laboratory synthesis of <strong>${item.product}</strong>, stoichiometric calculations indicate a theoretical yield of <strong>${item.theoretical} g</strong>. Following filtration, purification, and drying, the student isolates an actual experimental mass of <strong>${item.actual} g</strong>.<br><br>
        Calculate the <strong>percent yield</strong> of the synthesis. Enter your answer as a percentage (e.g. <code>85.2%</code> or <code>85.2</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: roundedPct,
          tolerance: 0.02
        },
        placeholder: 'e.g. 85.2%',
        hint1: 'Percent Yield = (Actual Yield / Theoretical Yield) × 100%.',
        hint2: `(${item.actual} g / ${item.theoretical} g) × 100% = ${roundedPct}%.`,
        workedSolution: `Percent Yield = (${item.actual} g / ${item.theoretical} g) × 100% = ${roundedPct}%.`
      };
    }

    // --- Problem 16: Culinary Recipe Analogy & Industrial Yield (MCQ - 3 attempts) ---
    genProblem16_CulinaryYieldDiscrepancyMCQ(rng) {
      const correct = 'Mechanical loss from batter sticking to mixing bowls and spatulas, evaporation, incomplete reaction, and side reactions reduce actual recovered yield.';
      const distractors = [
        'The heat of the commercial baking oven permanently destroys carbon and oxygen nuclei in violation of mass conservation.',
        'Flour and sugar atoms undergo spontaneous radioactive decay during baking, lowering the mass of finished pastries.',
        'Gravitational variations in commercial bakeries reduce the weight of finished cookies compared to raw batter.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p16_culinary_yield_mcq',
        num: 16,
        topic: 'Storyline Synthesis: Culinary Analogies & Practical Yield Losses',
        stem: 'In both professional pastry baking and industrial pharmaceutical manufacturing, the actual yield of finished product almost universally falls below 100% of theoretical yield calculated from recipe stoichiometry. What practical scientific factors account for this discrepancy?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Do you ever leave batter behind in a bowl or on a whisk when baking?',
        hint2: 'Physical transfer losses, competing side reactions, and incomplete reaction equilibrium reduce recovery.',
        explanation: 'In both baking and chemical manufacturing, 100% yield is rarely achieved due to mechanical transfer losses (residue left on vessels), incomplete reaction conversion, competing side reactions, and purification losses.'
      };
    }
  }

  // ============================================================
  // 6. MAIN WORKSTATION CONTROLLER CLASS
  // ============================================================
  class XLChemStation {
    constructor() {
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
      this.generator = new Unit4DeckGenerator(this.rng);
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
      const seedBase = `${cleanName}-u4`;
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
      const updatePill = () => {
        if (this.studentName) {
          const initials = this.studentName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
          if (this.elStudentAvatar) this.elStudentAvatar.textContent = initials || 'S';
          if (this.elStudentNameDisplay) {
            this.elStudentNameDisplay.textContent = `${this.studentName}${this.run > 1 ? ` (Run ${this.run})` : ''}`;
          }
        } else {
          if (this.elStudentAvatar) this.elStudentAvatar.textContent = '?';
          if (this.elStudentNameDisplay) this.elStudentNameDisplay.textContent = 'Set Student Name';
        }
      };

      updatePill();

      if (this.elProfilePill) {
        this.elProfilePill.addEventListener('click', () => {
          if (this.elProfileInput) this.elProfileInput.value = this.studentName;
          if (this.elProfileModal) this.elProfileModal.style.display = 'flex';
        });
      }

      if (this.elProfileStartBtn && this.elProfileInput) {
        this.elProfileStartBtn.addEventListener('click', () => {
          const name = this.elProfileInput.value.trim();
          if (name) {
            this.studentName = name;
            localStorage.setItem('xl_chem_student_name', name);
            if (this.elProfileModal) this.elProfileModal.style.display = 'none';
            this.seed = this.computeSeed();
            this.rng = new SeededRNG(this.seed);
            this.generator = new Unit4DeckGenerator(this.rng);
            this.problems = this.generator.generateDeck();
            if (this.elSeedChip) this.elSeedChip.textContent = `Seed: #${this.seed}`;
            updatePill();
            this.loadSavedState();
            this.renderDeck();
          }
        });
      }

      if (!this.studentName && this.elProfileModal) {
        this.elProfileModal.style.display = 'flex';
      }
    }

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
        if (prob.type === 'mcq') {
          contentHTML = this.renderMCQContent(prob, state);
        } else if (prob.type === 'ranking') {
          contentHTML = this.renderRankingContent(prob, state);
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
      if (prob.type === 'mcq') {
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
        state.feedback = 'Correct! All stoichiometric quantities are arranged in the precise descending order.';
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

      if (prob.type === 'mcq') {
        if (rawInput === prob.expectedOption) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Outstanding conceptual reasoning.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect choice. ${hint}`;
        }
      } else {
        const parsed = window.SmartParser ? window.SmartParser.parse(rawInput) : { isValid: true, value: parseFloat(rawInput), unit: '' };
        const res = window.SmartParser
          ? window.SmartParser.evaluate(parsed, prob.expected)
          : { status: Math.abs(parseFloat(rawInput) - prob.expected.value) < 0.05 ? 'correct' : 'incorrect', score: 1, feedback: 'Evaluated' };

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
    // 7. REFERENCE DRAWER & PERIODIC TABLE
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
          <div>Valence: <b>${elem.valence || 'Var'}</b></div>
          <div>1st Ionization: <b>${elem.ie} kJ/mol</b></div>
          <div>Electronegativity: <b>${elem.en !== null ? elem.en.toFixed(2) : 'N/A'}</b></div>
        </div>
      `;
    }

    // ============================================================
    // 8. DRAGGABLE SCIENTIFIC MINI-CALCULATOR
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
    // 9. REPORT GENERATOR & DIGITAL SEAL (PRINT / EXPORT)
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

      // Build QR Code pointing to verify.html with unit=4
      const baseUrl =
        window.location.protocol === 'file:'
          ? 'verify.html'
          : window.location.origin + window.location.pathname.replace('unit4.html', 'verify.html');
      const verifyUrl = `${baseUrl}?unit=4&name=${encodeURIComponent(this.studentName)}&score=${totalScore}&total=${total}&seal=${sealCode}&att1=${firstTry}&att2=${secondTry}&att3=${thirdTry}&m=${exhaustedCount}&run=${this.run}`;
      const qrSVG = window.generateQRCodeSVG ? window.generateQRCodeSVG(verifyUrl, 54) : '';

      // Format 8-Skill Mastery Scorecard
      const skillCardsHTML = UNIT4_SKILLS.map((skill) => {
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
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 4:</b> Reactions &amp; Stoichiometry &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
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
          <b>Unit 4 Quick Reference Key:</b> Moles = Mass / Molar Mass &middot; Mole Ratio = Coeff B / Coeff A &middot; Limiting Reactant = lowest product yield &middot; % Yield = (Actual / Theoretical) &times; 100% &middot; N_A = 6.022 &times; 10²³
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_balancing_calc') return 'Chemical equation balancing coefficient sum';
      if (p.id === 'p2_conservation_mass_mcq') return 'Law of conservation of mass principles';
      if (p.id === 'p3_reaction_class_mcq') return 'Chemical reaction pattern classification';
      if (p.id === 'p4_replacement_mechanism_mcq') return 'Single vs double replacement mechanisms';
      if (p.id === 'p5_macroscopic_evidence_mcq') return 'Laboratory macroscopic reaction evidence';
      if (p.id === 'p6_cooking_change_mcq') return 'Culinary chemical vs physical transformations';
      if (p.id === 'p7_mole_ratio_concept_mcq') return 'Stoichiometric coefficients vs mass ratios';
      if (p.id === 'p8_mole_to_mole_calc') return 'Mole-to-mole stoichiometric conversion';
      if (p.id === 'p9_combustion_mole_mcq') return 'Combustion mole ratio calculation';
      if (p.id === 'p10_mass_to_mass_calc') return 'Mass-to-mass theoretical yield calculation';
      if (p.id === 'p11_stoich_ranking') return 'Stoichiometric coefficient quantity ranking';
      if (p.id === 'p12_particles_stoich_mcq') return 'Avogadro product molecules determination';
      if (p.id === 'p13_limiting_calc') return 'Limiting reactant theoretical yield mass';
      if (p.id === 'p14_limiting_concept_mcq') return 'Limiting reactant mass misconception';
      if (p.id === 'p15_percent_yield_calc') return 'Experimental percent recovery calculation';
      if (p.id === 'p16_culinary_yield_mcq') return 'Practical and culinary yield loss analysis';
      return 'Unit 4 practice item';
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
