/**
 * unit5.js - XL Chemistry Practice Suite: Unit 5 (Kinetics & Thermochemistry)
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
  // 4. UNIT 5 DECK GENERATOR (16 Problems, 8 Skills)
  // ============================================================
  class Unit5DeckGenerator {
    constructor(rng) {
      this.rng = rng;
    }

    generateDeck() {
      return [
        this.genProblem1_SpecificHeatCalc(this.rng),
        this.genProblem2_SpecificHeatRanking(this.rng),
        this.genProblem3_LatentHeatCalc(this.rng),
        this.genProblem4_HeatingCurvePlateauMCQ(this.rng),
        this.genProblem5_MultiStepHeatingCalc(this.rng),
        this.genProblem6_CollisionTheoryMCQ(this.rng),
        this.genProblem7_ReactionProfileMCQ(this.rng),
        this.genProblem8_ThermochemStoichCalc(this.rng),
        this.genProblem9_BondEnergyCalc(this.rng),
        this.genProblem10_BondEnergyConceptMCQ(this.rng),
        this.genProblem11_HessLawCalc(this.rng),
        this.genProblem12_EnthalpyFormationCalc(this.rng),
        this.genProblem13_CoffeeCupCalorimetryCalc(this.rng),
        this.genProblem14_CalorimetryErrorMCQ(this.rng),
        this.genProblem15_FoodThermodynamicsCalc(this.rng),
        this.genProblem16_CulinaryReflectionMCQ(this.rng)
      ];
    }

    // --- Problem 1: Specific Heat Warming (Calculation - 5 attempts) ---
    genProblem1_SpecificHeatCalc(rng) {
      const substances = [
        { name: 'liquid water', c: 4.184, formula: 'H2O' },
        { name: 'aluminum metal', c: 0.897, formula: 'Al' },
        { name: 'iron skillet material', c: 0.449, formula: 'Fe' },
        { name: 'copper metal', c: 0.385, formula: 'Cu' }
      ];
      const sub = rng.pick(substances);
      const mass = rng.float(40.0, 250.0, 1);
      const ti = rng.float(18.0, 25.0, 1);
      const tf = rng.float(65.0, 95.0, 1);
      const deltaT = parseFloat((tf - ti).toFixed(1));
      const qJoules = mass * sub.c * deltaT;
      const qRounded = Math.round(qJoules);

      return {
        id: 'p1_specific_heat_calc',
        num: 1,
        topic: 'Specific Heat Capacity: Thermal Energy Transfer',
        stem: `A sample of <strong>${mass.toFixed(1)} g</strong> of ${sub.name} (specific heat capacity c = ${sub.c} J/(g &middot; &deg;C)) is warmed from an initial temperature of <strong>${ti.toFixed(1)} &deg;C</strong> to a final temperature of <strong>${tf.toFixed(1)} &deg;C</strong>.<br><br>Calculate the total quantity of thermal energy absorbed by the sample in <strong>Joules (J)</strong>. Enter an integer or decimal value (e.g. <code>1250</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: qRounded,
          tolerance: Math.max(15, qRounded * 0.02)
        },
        placeholder: 'e.g. 1250',
        hint1: 'Use the formula q = m &times; c &times; &Delta;T, where &Delta;T = T_final - T_initial.',
        hint2: `&Delta;T = ${tf.toFixed(1)} - ${ti.toFixed(1)} = ${deltaT.toFixed(1)} &deg;C. Multiply mass (${mass.toFixed(1)} g) &times; c (${sub.c}) &times; &Delta;T.`,
        workedSolution: `1. Calculate &Delta;T = ${tf.toFixed(1)} &deg;C - ${ti.toFixed(1)} &deg;C = ${deltaT.toFixed(1)} &deg;C.
2. Apply q = m &times; c &times; &Delta;T = (${mass.toFixed(1)} g) &times; (${sub.c} J/(g &middot; &deg;C)) &times; (${deltaT.toFixed(1)} &deg;C) = ${qJoules.toFixed(1)} J.
3. Rounded value: ${qRounded} J.`
      };
    }

    // --- Problem 2: Specific Heat Buffer Ranking (Ranking - 3 attempts) ---
    genProblem2_SpecificHeatRanking(rng) {
      const cards = [
        { id: 'water', title: 'Liquid Water (H₂O)', note: 'c = 4.184 J/(g · °C)' },
        { id: 'aluminum', title: 'Aluminum (Al)', note: 'c = 0.897 J/(g · °C)' },
        { id: 'iron', title: 'Iron (Fe)', note: 'c = 0.449 J/(g · °C)' },
        { id: 'lead', title: 'Lead (Pb)', note: 'c = 0.129 J/(g · °C)' }
      ];
      const correctOrder = ['water', 'aluminum', 'iron', 'lead'];
      const shuffled = rng.shuffle([...cards]);

      return {
        id: 'p2_specific_heat_ranking',
        num: 2,
        topic: 'Specific Heat Capacity: Thermal Buffer Ranking',
        stem: 'Identical <strong>100 g samples</strong> of four different pure substances at 20.0 &deg;C each absorb exactly <strong>2,000 J</strong> of thermal energy.<br><br>Rank the substances in order of <strong>temperature increase (&Delta;T) from smallest temperature change to largest temperature change</strong>.',
        type: 'ranking',
        maxAttempts: 3,
        cards: shuffled,
        correctOrder: correctOrder,
        orderLabels: {
          first: 'Smallest &Delta;T (Highest specific heat)',
          last: 'Largest &Delta;T (Lowest specific heat)'
        },
        hint1: 'Recall that &Delta;T = q / (m &times; c). A higher specific heat capacity requires more thermal energy to change temperature.',
        hint2: 'Water has the largest specific heat (4.184 J/(g·°C)), meaning it undergoes the smallest temperature increase. Lead has the smallest c (0.129 J/(g·°C)), yielding the largest &Delta;T.',
        workedSolution: 'From &Delta;T = q / (m &times; c), temperature increase is inversely proportional to specific heat capacity:\n1. Water: &Delta;T = 2000 / (100 &times; 4.184) = 4.78 &deg;C (Smallest &Delta;T)\n2. Aluminum: &Delta;T = 2000 / (100 &times; 0.897) = 22.3 &deg;C\n3. Iron: &Delta;T = 2000 / (100 &times; 0.449) = 44.5 &deg;C\n4. Lead: &Delta;T = 2000 / (100 &times; 0.129) = 155.0 &deg;C (Largest &Delta;T)\n\nCorrect ranking order: Liquid Water < Aluminum < Iron < Lead.'
      };
    }

    // --- Problem 3: Latent Heat of Phase Change (Calculation - 5 attempts) ---
    genProblem3_LatentHeatCalc(rng) {
      const isVap = rng.random() > 0.5;
      const mass = rng.float(25.0, 160.0, 1);
      const latentVal = isVap ? 2260 : 334;
      const processName = isVap ? 'vaporizing liquid water into steam at 100 &deg;C' : 'melting solid ice into liquid water at 0 &deg;C';
      const constantName = isVap ? 'heat of vaporization H_v = 2260 J/g' : 'heat of fusion H_f = 334 J/g';
      const qKJ = (mass * latentVal) / 1000.0;
      const qRounded = parseFloat(qKJ.toFixed(1));

      return {
        id: 'p3_latent_heat_calc',
        num: 3,
        topic: 'Latent Heat: Enthalpy of Phase Transitions',
        stem: `Calculate the quantity of heat required in <strong>kilojoules (kJ)</strong> for completely ${processName}.<br><br>The mass of the water sample is <strong>${mass.toFixed(1)} g</strong>, and the ${constantName}. Enter your answer in kJ (e.g. <code>45.2</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: qRounded,
          tolerance: Math.max(0.5, qRounded * 0.02)
        },
        placeholder: 'e.g. 45.2',
        hint1: 'Use q = m &times; H_f for melting or q = m &times; H_v for vaporization. Divide by 1000 to convert Joules to kilojoules.',
        hint2: `q = (${mass.toFixed(1)} g) &times; (${latentVal} J/g) = ${(mass * latentVal).toFixed(0)} J = ${qRounded} kJ.`,
        workedSolution: `1. Formula: q = m &times; H.
2. q = (${mass.toFixed(1)} g) &times; (${latentVal} J/g) = ${(mass * latentVal).toFixed(1)} J.
3. Convert to kJ: ${(mass * latentVal).toFixed(1)} / 1000 = ${qRounded} kJ.`
      };
    }

    // --- Problem 4: Heating Curve Plateaus (MCQ - 3 attempts) ---
    genProblem4_HeatingCurvePlateauMCQ(rng) {
      const correct = 'Added thermal energy overcomes intermolecular attractions (increasing potential energy) rather than speeding up particles.';
      const distractors = [
        'The thermometer bulb stops conducting heat once the melting point or boiling point threshold is reached.',
        'All added heat escapes to the surrounding atmosphere immediately, preventing any internal energy rise.',
        'The water molecules are undergoing nuclear transmutation that completely absorbs all incoming kinetic energy.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p4_heating_curve_plateau_mcq',
        num: 4,
        topic: 'Heating Curves: Phase Change Energy Partitioning',
        stem: `During a phase transition plateau on a heating curve (such as ice melting at 0 &deg;C or water boiling at 100 &deg;C), heat is continuously supplied yet the measured temperature does not change. Why does temperature remain constant?
        <div style="margin:1rem 0; background:var(--xl-surface-2, rgba(0,0,0,0.02)); border:1px solid var(--xl-border); border-radius:8px; padding:0.75rem; text-align:center;">
          <svg viewBox="0 0 540 220" style="width:100%; max-width:520px; height:auto; display:block; margin:0 auto; font-family:var(--font-sans);">
            <!-- Axes -->
            <line x1="60" y1="190" x2="510" y2="190" stroke="currentColor" stroke-width="2" />
            <line x1="60" y1="190" x2="60" y2="20" stroke="currentColor" stroke-width="2" />
            <polygon points="510,186 520,190 510,194" fill="currentColor" />
            <polygon points="56,20 60,10 64,20" fill="currentColor" />
            <text x="285" y="212" font-size="11" text-anchor="middle" fill="currentColor" opacity="0.8">Heat Added (Q) &rarr;</text>
            <text x="25" y="105" font-size="11" text-anchor="middle" transform="rotate(-90 25 105)" fill="currentColor" opacity="0.8">Temperature (&deg;C) &rarr;</text>

            <!-- Ticks -->
            <text x="52" y="194" font-size="10" text-anchor="end" fill="currentColor" opacity="0.7">-20</text>
            <line x1="56" y1="160" x2="60" y2="160" stroke="currentColor" stroke-width="1.5" />
            <text x="52" y="164" font-size="10" text-anchor="end" fill="currentColor" font-weight="bold">0</text>
            <line x1="56" y1="80" x2="60" y2="80" stroke="currentColor" stroke-width="1.5" />
            <text x="52" y="84" font-size="10" text-anchor="end" fill="currentColor" font-weight="bold">100</text>

            <!-- Curve segments -->
            <line x1="60" y1="185" x2="120" y2="160" stroke="#3b82f6" stroke-width="3" />
            <line x1="120" y1="160" x2="220" y2="160" stroke="#f59e0b" stroke-width="4" />
            <line x1="220" y1="160" x2="310" y2="80" stroke="#3b82f6" stroke-width="3" />
            <line x1="310" y1="80" x2="450" y2="80" stroke="#ef4444" stroke-width="4" />
            <line x1="450" y1="80" x2="500" y2="40" stroke="#3b82f6" stroke-width="3" />

            <!-- Highlights -->
            <rect x="120" y="145" width="100" height="30" rx="4" fill="#f59e0b" fill-opacity="0.15" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,3" />
            <text x="170" y="140" font-size="10" text-anchor="middle" fill="#d97706" font-weight="bold">Melting Plateau (&Delta;H_fus)</text>

            <rect x="310" y="65" width="140" height="30" rx="4" fill="#ef4444" fill-opacity="0.15" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
            <text x="380" y="60" font-size="10" text-anchor="middle" fill="#dc2626" font-weight="bold">Boiling Plateau (&Delta;H_vap)</text>

            <text x="85" y="180" font-size="9" text-anchor="middle" fill="currentColor" opacity="0.65">Solid</text>
            <text x="260" y="125" font-size="9" text-anchor="middle" fill="currentColor" opacity="0.65">Liquid</text>
            <text x="485" y="55" font-size="9" text-anchor="middle" fill="currentColor" opacity="0.65">Gas</text>
          </svg>
          <div style="font-size:0.75rem; color:var(--xl-ink-mute); margin-top:0.4rem;">Heating Curve for Water (H₂O) at 1.00 atm Pressure</div>
        </div>`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Temperature is a direct measure of average kinetic energy of particles.',
        hint2: 'During a phase change, energy goes into disrupting intermolecular attractions (potential energy), not particle speed.',
        explanation: 'Temperature measures average particle kinetic energy. During a phase change, supplied heat increases intermolecular potential energy by breaking or disrupting hydrogen bonds between molecules, leaving average molecular speed and temperature unchanged.'
      };
    }

    // --- Problem 5: Multi-Step Heating Calculation (Calculation - 5 attempts) ---
    genProblem5_MultiStepHeatingCalc(rng) {
      const mass = rng.float(15.0, 45.0, 1);
      const tInit = rng.float(-18.0, -6.0, 1);
      const tFinal = rng.float(25.0, 75.0, 1);

      // Step 1: ice from tInit to 0 C (c_ice = 2.09)
      const q1 = mass * 2.09 * (0 - tInit);
      // Step 2: melt ice at 0 C (Hf = 334)
      const q2 = mass * 334;
      // Step 3: liquid water from 0 to tFinal (c_liq = 4.184)
      const q3 = mass * 4.184 * (tFinal - 0);
      const qTotalJoules = q1 + q2 + q3;
      const qTotalKJ = parseFloat((qTotalJoules / 1000.0).toFixed(2));

      return {
        id: 'p5_multistep_heating_calc',
        num: 5,
        topic: 'Thermochemical Curves: Multi-Step Phase Heating',
        stem: `Calculate the total energy in <strong>kilojoules (kJ)</strong> required to convert <strong>${mass.toFixed(1)} g</strong> of solid ice at <strong>${tInit.toFixed(1)} &deg;C</strong> into warm liquid water at <strong>${tFinal.toFixed(1)} &deg;C</strong>.<br><br>Use the following thermal constants:
        <ul style="margin:0.5rem 0 0.5rem 1.25rem; font-size:0.85rem; font-family:var(--font-mono);">
          <li>Specific heat of ice: 2.09 J/(g &middot; &deg;C)</li>
          <li>Heat of fusion (H_f): 334 J/g</li>
          <li>Specific heat of liquid water: 4.184 J/(g &middot; &deg;C)</li>
        </ul>
        Enter the total heat required in kJ (e.g. <code>38.5</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: qTotalKJ,
          tolerance: Math.max(0.4, qTotalKJ * 0.02)
        },
        placeholder: 'e.g. 38.5',
        hint1: 'Break the problem into three stages: warming ice to 0 &deg;C, melting ice at 0 &deg;C, and warming liquid to the final temperature.',
        hint2: `q1 = m &times; 2.09 &times; (${Math.abs(tInit).toFixed(1)}), q2 = m &times; 334, q3 = m &times; 4.184 &times; (${tFinal.toFixed(1)}). Sum all three and divide by 1000.`,
        workedSolution: `1. Stage 1 (warm ice to 0 &deg;C): q1 = (${mass.toFixed(1)}) &times; 2.09 &times; (${Math.abs(tInit).toFixed(1)}) = ${q1.toFixed(1)} J.
2. Stage 2 (melt ice): q2 = (${mass.toFixed(1)}) &times; 334 = ${q2.toFixed(1)} J.
3. Stage 3 (warm liquid water): q3 = (${mass.toFixed(1)}) &times; 4.184 &times; (${tFinal.toFixed(1)}) = ${q3.toFixed(1)} J.
4. Total heat = ${q1.toFixed(1)} + ${q2.toFixed(1)} + ${q3.toFixed(1)} = ${qTotalJoules.toFixed(1)} J = ${qTotalKJ} kJ.`
      };
    }

    // --- Problem 6: Collision Theory Fundamentals (MCQ - 3 attempts) ---
    genProblem6_CollisionTheoryMCQ(rng) {
      const correct = 'Molecules must collide with kinetic energy exceeding activation energy and with proper steric orientation.';
      const distractors = [
        'Reactant molecules must have completely equal mass and collide precisely at right angles to trigger a reaction.',
        'Molecules only react when an external electrical current forces their atomic nuclei to fuse together.',
        'Reactant particles must lose all thermal energy and stop moving before chemical bonds can rearrange.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p6_collision_theory_mcq',
        num: 6,
        topic: 'Reaction Kinetics: Collision Theory Requirements',
        stem: 'According to Collision Theory, which two fundamental conditions must be satisfied during an encounter between reacting particles for a successful chemical transformation to occur?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Consider energy requirements (activation energy) and spatial arrangement.',
        hint2: 'A collision can fail if it lacks sufficient impact speed or hits at an unfavorable angle.',
        explanation: 'For bonds to break and new bonds to form, colliding particles must possess kinetic energy equal to or greater than the activation energy (E_a) and must collide with favorable three-dimensional steric orientation.'
      };
    }

    // --- Problem 7: Reaction Energy Profiles & Catalysts (MCQ - 3 attempts) ---
    genProblem7_ReactionProfileMCQ(rng) {
      const correct = 'A catalyst lowers the activation energy by offering an alternate pathway, without altering the net reaction enthalpy (&Delta;H).';
      const distractors = [
        'A catalyst shifts the reaction enthalpy (&Delta;H) to make an endothermic reaction strongly exothermic.',
        'A catalyst increases reactant potential energy so that the reaction runs backwards at higher speeds.',
        'A catalyst consumes intermediate heat energy, preventing any product molecules from cooling down.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p7_reaction_profile_mcq',
        num: 7,
        topic: 'Reaction Profiles: Catalysis & Activation Energy',
        stem: `How does introducing an enzyme or chemical catalyst affect the potential energy diagram of an elementary chemical reaction?
        <div style="margin:1rem 0; background:var(--xl-surface-2, rgba(0,0,0,0.02)); border:1px solid var(--xl-border); border-radius:8px; padding:0.75rem; text-align:center;">
          <svg viewBox="0 0 540 220" style="width:100%; max-width:520px; height:auto; display:block; margin:0 auto; font-family:var(--font-sans);">
            <!-- Axes -->
            <line x1="60" y1="190" x2="500" y2="190" stroke="currentColor" stroke-width="2" />
            <line x1="60" y1="190" x2="60" y2="20" stroke="currentColor" stroke-width="2" />
            <polygon points="500,186 510,190 500,194" fill="currentColor" />
            <polygon points="56,20 60,10 64,20" fill="currentColor" />
            <text x="280" y="210" font-size="11" text-anchor="middle" fill="currentColor" opacity="0.8">Reaction Coordinate (Progress) &rarr;</text>
            <text x="25" y="105" font-size="11" text-anchor="middle" transform="rotate(-90 25 105)" fill="currentColor" opacity="0.8">Potential Energy (kJ) &rarr;</text>

            <!-- Reactant plateau -->
            <line x1="60" y1="120" x2="140" y2="120" stroke="#2563eb" stroke-width="3" />
            <text x="100" y="112" font-size="11" text-anchor="middle" fill="#2563eb" font-weight="bold">Reactants</text>

            <!-- Uncatalyzed curve -->
            <path d="M 140 120 C 180 120, 220 35, 270 35 C 320 35, 360 160, 400 160" fill="none" stroke="#dc2626" stroke-width="2.5" />
            <text x="270" y="26" font-size="10" text-anchor="middle" fill="#dc2626" font-weight="bold">Uncatalyzed (Higher Ea)</text>

            <!-- Catalyzed curve -->
            <path d="M 140 120 C 180 120, 220 75, 270 75 C 320 75, 360 160, 400 160" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-dasharray="5,4" />
            <text x="270" y="94" font-size="10" text-anchor="middle" fill="#16a34a" font-weight="bold">Catalyzed (Lower Ea)</text>

            <!-- Product plateau -->
            <line x1="400" y1="160" x2="480" y2="160" stroke="#2563eb" stroke-width="3" />
            <text x="440" y="152" font-size="11" text-anchor="middle" fill="#2563eb" font-weight="bold">Products</text>

            <!-- Delta H bracket -->
            <line x1="475" y1="120" x2="495" y2="120" stroke="currentColor" stroke-dasharray="2,2" opacity="0.6" />
            <line x1="480" y1="120" x2="480" y2="160" stroke="#7c3aed" stroke-width="2" />
            <polygon points="477,125 480,120 483,125" fill="#7c3aed" />
            <polygon points="477,155 480,160 483,155" fill="#7c3aed" />
            <text x="510" y="144" font-size="10" text-anchor="middle" fill="#7c3aed" font-weight="bold">&Delta;H</text>
          </svg>
          <div style="font-size:0.75rem; color:var(--xl-ink-mute); margin-top:0.4rem;">Potential Energy Profile: Exothermic Reaction with Catalyst</div>
        </div>`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'A catalyst speeds up reactions without being consumed in the net equation.',
        hint2: 'The starting reactant energy and final product energy remain unchanged.',
        explanation: 'A catalyst provides an alternate transition state with lower activation energy (E_a). Because initial reactant enthalpy and final product enthalpy are state functions, net reaction enthalpy (&Delta;H) is completely unchanged.'
      };
    }

    // --- Problem 8: Thermochemical Stoichiometry (Calculation - 5 attempts) ---
    genProblem8_ThermochemStoichCalc(rng) {
      const reactions = [
        { name: 'combustion of methane', eq: 'CH4(g) + 2 O2(g) -> CO2(g) + 2 H2O(l)', deltaH: -890.4, molarMass: 16.04, substance: 'CH4' },
        { name: 'combustion of propane', eq: 'C3H8(g) + 5 O2(g) -> 3 CO2(g) + 4 H2O(l)', deltaH: -2220.0, molarMass: 44.10, substance: 'C3H8' },
        { name: 'synthesis of ammonia', eq: 'N2(g) + 3 H2(g) -> 2 NH3(g)', deltaH: -92.2, molarMass: 28.01, substance: 'N2' }
      ];
      const rxn = rng.pick(reactions);
      const grams = rng.float(12.0, 68.0, 1);
      const moles = grams / rxn.molarMass;
      const heatReleasedKJ = Math.abs(moles * rxn.deltaH);
      const rounded = parseFloat(heatReleasedKJ.toFixed(1));

      return {
        id: 'p8_thermochem_stoich_calc',
        num: 8,
        topic: 'Thermochemical Stoichiometry: Reaction Heat',
        stem: `Consider the thermochemical equation for the ${rxn.name}:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          ${rxn.eq} &nbsp;&nbsp; &Delta;H = ${rxn.deltaH} kJ/mol
        </div>
        How much heat in <strong>kilojoules (kJ)</strong> is released when <strong>${grams.toFixed(1)} g</strong> of ${rxn.substance} (molar mass = ${rxn.molarMass} g/mol) reacts completely with excess reagent? Enter a positive value for heat released (e.g. <code>150.5</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(1.0, rounded * 0.02)
        },
        placeholder: 'e.g. 150.5',
        hint1: 'First convert grams of reactant to moles using its molar mass, then multiply by &Delta;H per mole.',
        hint2: `Moles = ${grams.toFixed(1)} / ${rxn.molarMass} = ${moles.toFixed(3)} mol. Heat = ${moles.toFixed(3)} &times; ${Math.abs(rxn.deltaH)} kJ.`,
        workedSolution: `1. Moles of ${rxn.substance} = ${grams.toFixed(1)} g / ${rxn.molarMass} g/mol = ${moles.toFixed(4)} mol.
2. Heat released = ${moles.toFixed(4)} mol &times; ${Math.abs(rxn.deltaH)} kJ/mol = ${heatReleasedKJ.toFixed(1)} kJ.
3. Rounded answer: ${rounded} kJ.`
      };
    }

    // --- Problem 9: Bond Energies & Enthalpy Calculation (Calculation - 5 attempts) ---
    genProblem9_BondEnergyCalc(rng) {
      // H2 + Cl2 -> 2 HCl
      // Bonds broken: H-H (436), Cl-Cl (242) = 678 kJ
      // Bonds formed: 2 x H-Cl (431) = 862 kJ
      // Delta H = 678 - 862 = -184 kJ
      const deltaH = -184;

      return {
        id: 'p9_bond_energy_calc',
        num: 9,
        topic: 'Bond Energies: Molecular Enthalpy Estimation',
        stem: `Estimate the standard enthalpy change (&Delta;H_rxn) in <strong>kJ</strong> for the gas-phase reaction:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; text-align:center; margin-bottom:0.75rem;">
          H₂(g) + Cl₂(g) &rarr; 2 HCl(g)
        </div>
        Use the following average bond enthalpies:
        <ul style="margin:0.5rem 0 0.5rem 1.25rem; font-size:0.85rem; font-family:var(--font-mono);">
          <li>H-H bond energy: 436 kJ/mol</li>
          <li>Cl-Cl bond energy: 242 kJ/mol</li>
          <li>H-Cl bond energy: 431 kJ/mol</li>
        </ul>
        Enter the net &Delta;H value with its appropriate sign (e.g. <code>-184</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: deltaH,
          tolerance: 2.0
        },
        placeholder: 'e.g. -184',
        hint1: 'Recall that &Delta;H = &Sigma;(Bonds Broken) - &Sigma;(Bonds Formed).',
        hint2: 'Bonds broken = 436 + 242 = 678 kJ. Bonds formed = 2 &times; 431 = 862 kJ.',
        workedSolution: `1. Energy required to break reactant bonds: 1(H-H) + 1(Cl-Cl) = 436 + 242 = +678 kJ.
2. Energy released forming product bonds: 2(H-Cl) = 2 &times; 431 = 862 kJ.
3. &Delta;H_rxn = Bonds Broken - Bonds Formed = 678 - 862 = -184 kJ.`
      };
    }

    // --- Problem 10: Bond Energy Sign Convention (MCQ - 3 attempts) ---
    genProblem10_BondEnergyConceptMCQ(rng) {
      const correct = 'Breaking chemical bonds always requires energy input (endothermic); forming chemical bonds releases energy (exothermic).';
      const distractors = [
        'Breaking chemical bonds always releases energy; forming bonds requires constant input of thermal energy.',
        'Both breaking and forming chemical bonds release equal quantities of thermal energy into the surroundings.',
        'Bond breaking is endothermic in solids but exothermic when occurring between gaseous atoms.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p10_bond_concept_mcq',
        num: 10,
        topic: 'Bond Thermodynamics: Energy Sign Conventions',
        stem: 'Which statement accurately describes the thermodynamic energy changes associated with breaking and creating chemical bonds?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Remember the acronym: BEND - Breaking is ENdothermic, Forming is EXothermic.',
        hint2: 'You must put work into pulling bonded atoms apart against electrostatic attractions.',
        explanation: 'Separating bonded atoms requires input of energy to overcome electrostatic attraction (bond breaking is endothermic, positive &Delta;H). Bringing atoms together into stable configurations releases potential energy (bond formation is exothermic, negative &Delta;H).'
      };
    }

    // --- Problem 11: Hess's Law Addition (Calculation - 5 attempts) ---
    genProblem11_HessLawCalc(rng) {
      // Step 1: C(s) + 1/2 O2(g) -> CO(g)  Delta H = ?
      // Given:
      // A: C(s) + O2(g) -> CO2(g)  Delta H1 = -393.5 kJ
      // B: CO(s) + 1/2 O2(g) -> CO2(g) Delta H2 = -283.0 kJ
      // Target: C(s) + 1/2 O2(g) -> CO(g)
      // Equation = A - B = -393.5 - (-283.0) = -110.5 kJ
      const targetVal = -110.5;

      return {
        id: 'p11_hess_law_calc',
        num: 11,
        topic: "Hess's Law: Indirect Enthalpy Summation",
        stem: `Use Hess's Law to calculate the standard enthalpy change (&Delta;H) in <strong>kJ</strong> for the formation of carbon monoxide:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; text-align:center; margin-bottom:0.75rem;">
          C(s) + &frac12; O₂(g) &rarr; CO(g) &nbsp;&nbsp; &Delta;H = ?
        </div>
        Given the following known thermochemical equations:
        <ul style="margin:0.5rem 0 0.5rem 1.25rem; font-size:0.85rem; font-family:var(--font-mono);">
          <li>(1) C(s) + O₂(g) &rarr; CO₂(g) &nbsp;&nbsp; &Delta;H₁ = -393.5 kJ</li>
          <li>(2) CO(g) + &frac12; O₂(g) &rarr; CO₂(g) &nbsp;&nbsp; &Delta;H₂ = -283.0 kJ</li>
        </ul>
        Enter the target &Delta;H in kJ with its appropriate sign (e.g. <code>-110.5</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: targetVal,
          tolerance: 0.5
        },
        placeholder: 'e.g. -110.5',
        hint1: 'Reverse Equation (2) so that CO(g) appears on the product side, changing the sign of &Delta;H₂.',
        hint2: '&Delta;H = &Delta;H₁ + (-&Delta;H₂) = -393.5 - (-283.0) = -110.5 kJ.',
        workedSolution: `1. Keep Equation (1): C(s) + O₂(g) &rarr; CO₂(g) [&Delta;H₁ = -393.5 kJ].
2. Reverse Equation (2): CO₂(g) &rarr; CO(g) + 1/2 O₂(g) [&Delta;H = +283.0 kJ].
3. Sum equations: C(s) + 1/2 O₂(g) &rarr; CO(g).
4. Net &Delta;H = -393.5 + 283.0 = -110.5 kJ.`
      };
    }

    // --- Problem 12: Standard Enthalpy of Formation (Calculation - 5 attempts) ---
    genProblem12_EnthalpyFormationCalc(rng) {
      // Combustion of propane: C3H8(g) + 5 O2(g) -> 3 CO2(g) + 4 H2O(l)
      // Delta Hf values: C3H8: -103.8, O2: 0, CO2: -393.5, H2O: -285.8
      // Delta H rxn = [3(-393.5) + 4(-285.8)] - [-103.8]
      // = [-1180.5 - 1143.2] - [-103.8] = -2323.7 + 103.8 = -2219.9 kJ
      const deltaH = -2219.9;

      return {
        id: 'p12_enthalpy_formation_calc',
        num: 12,
        topic: 'Standard Enthalpy of Formation: Summation Calculation',
        stem: `Calculate standard enthalpy of combustion (&Delta;H&deg;_rxn) in <strong>kJ</strong> for propane gas:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          C₃H₈(g) + 5 O₂(g) &rarr; 3 CO₂(g) + 4 H₂O(l)
        </div>
        Given standard enthalpies of formation (&Delta;H&deg;_f):
        <ul style="margin:0.5rem 0 0.5rem 1.25rem; font-size:0.85rem; font-family:var(--font-mono);">
          <li>&Delta;H&deg;_f [C₃H₈(g)] = -103.8 kJ/mol</li>
          <li>&Delta;H&deg;_f [CO₂(g)] = -393.5 kJ/mol</li>
          <li>&Delta;H&deg;_f [H₂O(l)] = -285.8 kJ/mol</li>
          <li>&Delta;H&deg;_f [O₂(g)] = 0.0 kJ/mol</li>
        </ul>
        Enter the calculated &Delta;H&deg;_rxn in kJ (e.g. <code>-2219.9</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: deltaH,
          tolerance: 2.0
        },
        placeholder: 'e.g. -2219.9',
        hint1: 'Apply &Delta;H&deg;_rxn = &Sigma; n &Delta;H&deg;_f(products) - &Sigma; m &Delta;H&deg;_f(reactants).',
        hint2: 'Products = 3(-393.5) + 4(-285.8) = -2323.7 kJ. Reactants = 1(-103.8) + 5(0) = -103.8 kJ. Subtract reactants from products.',
        workedSolution: `1. Products = [3 &times; (-393.5)] + [4 &times; (-285.8)] = -1180.5 - 1143.2 = -2323.7 kJ.
2. Reactants = 1 &times; (-103.8) = -103.8 kJ.
3. &Delta;H&deg;_rxn = -2323.7 - (-103.8) = -2219.9 kJ.`
      };
    }

    // --- Problem 13: Coffee-Cup Calorimetry Experiment (Calculation - 5 attempts) ---
    genProblem13_CoffeeCupCalorimetryCalc(rng) {
      const massSalt = rng.float(4.0, 9.0, 1);
      const massWater = 100.0;
      const totalMass = massSalt + massWater;
      const tInit = 22.0;
      const deltaT = rng.float(4.2, 8.5, 1);
      const tFinal = tInit + deltaT;
      // Salt: NaOH (molar mass = 40.00 g/mol), exothermic
      const moles = massSalt / 40.0;
      const qSolnJoules = totalMass * 4.184 * deltaT;
      const qRxnKJ = -(qSolnJoules / 1000.0);
      const molarEnthalpy = qRxnKJ / moles;
      const rounded = parseFloat(molarEnthalpy.toFixed(1));

      return {
        id: 'p13_calorimetry_calc',
        num: 13,
        topic: 'Coffee-Cup Calorimetry: Solution Molar Enthalpy',
        stem: `In a coffee-cup calorimeter, a student dissolves <strong>${massSalt.toFixed(1)} g</strong> of solid sodium hydroxide (NaOH, molar mass = 40.00 g/mol) in <strong>100.0 g</strong> of water at 22.0 &deg;C. The solution temperature rises to <strong>${tFinal.toFixed(1)} &deg;C</strong>.<br><br>Assuming the specific heat of the solution is 4.184 J/(g &middot; &deg;C) and total mass is ${(totalMass).toFixed(1)} g, calculate the <strong>molar enthalpy of solution (&Delta;H_soln)</strong> in <strong>kJ/mol</strong> of NaOH. Enter with negative sign for exothermic (e.g. <code>-42.8</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(1.0, Math.abs(rounded) * 0.03)
        },
        placeholder: 'e.g. -42.8',
        hint1: 'First find q_solution = m_total &times; c &times; &Delta;T. Then q_reaction = -q_solution. Finally divide q_rxn in kJ by moles of NaOH.',
        hint2: `m_total = ${(totalMass).toFixed(1)} g, &Delta;T = ${deltaT.toFixed(1)} &deg;C, moles = ${massSalt.toFixed(1)} / 40.00.`,
        workedSolution: `1. q_soln = (${totalMass.toFixed(1)} g) &times; 4.184 J/(g &middot; &deg;C) &times; ${deltaT.toFixed(1)} &deg;C = ${qSolnJoules.toFixed(1)} J.
2. q_rxn = -${(qSolnJoules / 1000.0).toFixed(2)} kJ.
3. Moles NaOH = ${massSalt.toFixed(1)} / 40.00 = ${moles.toFixed(3)} mol.
4. &Delta;H_soln = q_rxn / moles = ${rounded} kJ/mol.`
      };
    }

    // --- Problem 14: Calorimetry Heat Loss Error Analysis (MCQ - 3 attempts) ---
    genProblem14_CalorimetryErrorMCQ(rng) {
      const correct = 'The measured temperature increase (&Delta;T) is artificially low, making calculated exothermic enthalpy less negative than true value.';
      const distractors = [
        'Escaping heat forces the water molecules to boil instantly, making the calculated enthalpy value infinitely positive.',
        'Heat loss to air causes the solution to undergo rapid freezing, reversing the sign of the measured reaction.',
        'Heat loss to the cup causes the experimental molar mass of the solute to appear double its true value.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p14_calorimetry_error_mcq',
        num: 14,
        topic: 'Experimental Error: Calorimetric Heat Dissipation',
        stem: 'During an exothermic coffee-cup calorimetry experiment, imperfect lid insulation allows some thermal energy to escape into the ambient room air. How does this systematic error impact the experimental &Delta;H value calculated by the student?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'If heat leaks out, will the thermometer measure the full temperature rise?',
        hint2: 'Smaller measured &Delta;T yields a smaller calculated q_rxn magnitude.',
        explanation: 'Heat escaping to surroundings reduces the maximum temperature reached by the solution. Consequently, &Delta;T is underestimated, resulting in an experimentally calculated exothermic &Delta;H that is lower in magnitude (less negative) than the theoretical literature value.'
      };
    }

    // --- Problem 15: Food Thermodynamics - Cooking Oil vs Water (Calculation - 5 attempts) ---
    genProblem15_FoodThermodynamicsCalc(rng) {
      // Comparing energy to heat 500g of cooking oil (c = 1.95) vs water (c = 4.184)
      const mass = rng.float(250.0, 600.0, 0);
      const ti = 20.0;
      const tf = 180.0;
      const deltaT = tf - ti;
      const cOil = 1.95;
      const qJoules = mass * cOil * deltaT;
      const qKJ = parseFloat((qJoules / 1000.0).toFixed(1));

      return {
        id: 'p15_food_thermo_calc',
        num: 15,
        topic: 'Food Chemistry: Culinary Heat Capacity & Searing',
        stem: `In culinary chemistry, cooking oil has a specific heat capacity of only <strong>1.95 J/(g &middot; &deg;C)</strong>, allowing it to heat up much faster than water.<br><br>Calculate the thermal energy in <strong>kilojoules (kJ)</strong> needed to heat <strong>${mass.toFixed(0)} g</strong> of canola oil from room temperature (<strong>20.0 &deg;C</strong>) to deep-frying temperature (<strong>180.0 &deg;C</strong>). Enter in kJ (e.g. <code>95.0</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: qKJ,
          tolerance: Math.max(1.0, qKJ * 0.02)
        },
        placeholder: 'e.g. 95.0',
        hint1: 'Apply q = m &times; c &times; &Delta;T, with &Delta;T = 180.0 - 20.0 = 160.0 &deg;C. Divide by 1000 for kJ.',
        hint2: `q = ${mass.toFixed(0)} &times; 1.95 &times; 160.0 = ${qJoules.toFixed(0)} J = ${qKJ} kJ.`,
        workedSolution: `1. &Delta;T = 180.0 &deg;C - 20.0 &deg;C = 160.0 &deg;C.
2. q = (${mass.toFixed(0)} g) &times; (1.95 J/(g &middot; &deg;C)) &times; (160.0 &deg;C) = ${qJoules.toFixed(1)} J.
3. Convert to kJ: ${qJoules.toFixed(1)} / 1000 = ${qKJ} kJ.`
      };
    }

    // --- Problem 16: Culinary Reflection & Maillard Reaction (MCQ - 3 attempts) ---
    genProblem16_CulinaryReflectionMCQ(rng) {
      const correct = 'Liquid water is capped at 100 &deg;C by vaporization, whereas oil or dry metal reaches high temperatures required for flavor browning.';
      const distractors = [
        'Water destroys protein molecules through radioactive disintegration at all temperatures above room temperature.',
        'Cast iron skitters atoms into the meat that chemically freeze food proteins in place before browning occurs.',
        'Oil reacts with oxygen to form solid crust crystals that protect steak interior from thermal energy.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p16_culinary_reflection_mcq',
        num: 16,
        topic: 'Storyline Reflection: Phase Limits in Food Preparation',
        stem: 'Why is it impossible to create a crisp, browned crust (Maillard reaction, requiring >140 &deg;C) by boiling food in liquid water, whereas searing in an oiled cast-iron skillet achieves rapid browning?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Consider the temperature plateau of water at its boiling point during phase change.',
        hint2: 'Water cannot exceed 100 &deg;C at atmospheric pressure without boiling away.',
        explanation: 'Due to the phase change plateau of water at 1 atm, liquid water cannot exceed 100 &deg;C. The Maillard browning reactions responsible for crust development require temperatures exceeding 140 &deg;C, which are easily achieved in high-boiling oils or preheated dry cast iron.'
      };
    }
  }

  // ============================================================
  // 5. WORKSTATION CONTROLLER & STATE MANAGER
  // ============================================================
  class XLChemStation {
    constructor() {
      this.unit = 5;
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
      this.generator = new Unit5DeckGenerator(this.rng);
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
      const seedBase = `${cleanName}-u5`;
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
      this.generator = new Unit5DeckGenerator(this.rng);
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
          state.feedback = 'Correct! Outstanding conceptual thermodynamic reasoning.';
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
          state.feedback = 'Correct! Outstanding thermal buffer ranking reasoning.';
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
          : { status: Math.abs(parseFloat(rawInput) - prob.expected.value) <= (prob.expected.tolerance || 0.5) ? 'correct' : 'incorrect', score: 1, feedback: 'Evaluated' };

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
        { name: 'Specific Heat Capacity', ids: ['p1_specific_heat_calc', 'p2_specific_heat_ranking'] },
        { name: 'Latent Heat & Heating Curves', ids: ['p3_latent_heat_calc', 'p4_heating_curve_plateau_mcq'] },
        { name: 'Multi-Step Phase Heating', ids: ['p5_multistep_heating_calc', 'p6_collision_theory_mcq'] },
        { name: 'Kinetics & Catalysis', ids: ['p7_reaction_profile_mcq', 'p8_thermochem_stoich_calc'] },
        { name: 'Bond Energies & Enthalpy', ids: ['p9_bond_energy_calc', 'p10_bond_concept_mcq'] },
        { name: "Hess's Law & Heat of Formation", ids: ['p11_hess_law_calc', 'p12_enthalpy_formation_calc'] },
        { name: 'Calorimetry & Error Analysis', ids: ['p13_calorimetry_calc', 'p14_calorimetry_error_mcq'] },
        { name: 'Food Prep Thermodynamics', ids: ['p15_food_thermo_calc', 'p16_culinary_reflection_mcq'] }
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
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 5:</b> Kinetics &amp; Thermochemistry &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
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
          <b>Unit 5 Quick Reference Key:</b> q = mc&Delta;T &middot; q = mH_f &middot; q = mH_v &middot; &Delta;H_rxn = &Sigma; Bonds Broken - &Sigma; Bonds Formed &middot; &Delta;H&deg;_rxn = &Sigma; n &Delta;H&deg;_f(prod) - &Sigma; m &Delta;H&deg;_f(react)
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_specific_heat_calc') return 'Specific heat warming calculation';
      if (p.id === 'p2_specific_heat_ranking') return 'Specific heat capacity thermal buffer ranking';
      if (p.id === 'p3_latent_heat_calc') return 'Latent heat enthalpy of phase transition';
      if (p.id === 'p4_heating_curve_plateau_mcq') return 'Heating curve potential vs kinetic energy';
      if (p.id === 'p5_multistep_heating_calc') return 'Multi-step warming from solid to liquid';
      if (p.id === 'p6_collision_theory_mcq') return 'Collision theory activation energy and orientation';
      if (p.id === 'p7_reaction_profile_mcq') return 'Reaction profile activation energy and catalyst';
      if (p.id === 'p8_thermochem_stoich_calc') return 'Thermochemical stoichiometry heat released';
      if (p.id === 'p9_bond_energy_calc') return 'Bond energy enthalpy estimation';
      if (p.id === 'p10_bond_concept_mcq') return 'Bond breaking vs bond forming energy sign';
      if (p.id === 'p11_hess_law_calc') return "Hess's Law indirect thermochemical summation";
      if (p.id === 'p12_enthalpy_formation_calc') return 'Standard enthalpy of formation summation';
      if (p.id === 'p13_calorimetry_calc') return 'Coffee-cup calorimetry molar enthalpy';
      if (p.id === 'p14_calorimetry_error_mcq') return 'Calorimeter heat dissipation systematic error';
      if (p.id === 'p15_food_thermo_calc') return 'Culinary thermodynamics canola oil heat';
      if (p.id === 'p16_culinary_reflection_mcq') return 'Maillard reaction boiling vs searing limits';
      return 'Unit 5 practice item';
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
