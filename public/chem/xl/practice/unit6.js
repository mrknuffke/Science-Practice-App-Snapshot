/**
 * unit6.js - XL Chemistry Practice Suite: Unit 6 (Solutions & Chemical Equilibrium)
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
  // 4. UNIT 6 DECK GENERATOR (16 Problems, 8 Skills)
  // ============================================================
  class Unit6DeckGenerator {
    constructor(rng) {
      this.rng = rng;
    }

    generateDeck() {
      return [
        this.genProblem1_MolarityCalc(this.rng),
        this.genProblem2_ElectrolytesMCQ(this.rng),
        this.genProblem3_DilutionCalc(this.rng),
        this.genProblem4_SolutionStoichCalc(this.rng),
        this.genProblem5_DynamicEquilibriumMCQ(this.rng),
        this.genProblem6_KeqExpressionMCQ(this.rng),
        this.genProblem7_KeqCalculationCalc(this.rng),
        this.genProblem8_MagnitudeKeqMCQ(this.rng),
        this.genProblem9_ICETableCalc(this.rng),
        this.genProblem10_ReactionQuotientMCQ(this.rng),
        this.genProblem11_LeChatelierTempMCQ(this.rng),
        this.genProblem12_LeChatelierPressureMCQ(this.rng),
        this.genProblem13_KspSolubilityCalc(this.rng),
        this.genProblem14_SolubilityRanking(this.rng),
        this.genProblem15_OceanAcidificationCalc(this.rng),
        this.genProblem16_ShellfishDieOffSynthesisMCQ(this.rng)
      ];
    }

    // --- Problem 1: Molarity Concentration Calculation (Calculation - 5 attempts) ---
    genProblem1_MolarityCalc(rng) {
      const solutes = [
        { name: 'sodium chloride', formula: 'NaCl', molarMass: 58.44 },
        { name: 'potassium nitrate', formula: 'KNO3', molarMass: 101.10 },
        { name: 'copper(II) sulfate', formula: 'CuSO4', molarMass: 159.61 },
        { name: 'calcium chloride', formula: 'CaCl2', molarMass: 110.98 }
      ];
      const sol = rng.pick(solutes);
      const grams = rng.float(15.0, 70.0, 1);
      const volML = rng.pick([250, 400, 500, 750, 1000]);
      const volL = volML / 1000.0;
      const moles = grams / sol.molarMass;
      const molarity = moles / volL;
      const rounded = parseFloat(molarity.toFixed(3));

      return {
        id: 'p1_molarity_calc',
        num: 1,
        topic: 'Solution Concentration: Molarity Calculations',
        stem: `A chemist prepares an aqueous solution by dissolving <strong>${grams.toFixed(1)} g</strong> of ${sol.name} (${sol.formula}, molar mass = ${sol.molarMass} g/mol) into enough distilled water to create exactly <strong>${volML} mL</strong> of total solution.<br><br>Calculate the <strong>molarity (M)</strong> of the resulting solution in <strong>mol/L</strong>. Enter as a decimal (e.g. <code>0.450</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.01, rounded * 0.02)
        },
        placeholder: 'e.g. 0.450',
        hint1: 'Convert grams of solute to moles using molar mass, and convert milliliters of solution to liters (mL / 1000).',
        hint2: `Moles = ${grams.toFixed(1)} / ${sol.molarMass} = ${moles.toFixed(4)} mol. Volume = ${volL} L. Divide moles by liters.`,
        workedSolution: `1. Moles of ${sol.formula} = ${grams.toFixed(1)} g / ${sol.molarMass} g/mol = ${moles.toFixed(4)} mol.
2. Volume in liters = ${volML} mL / 1000 mL/L = ${volL} L.
3. Molarity = ${moles.toFixed(4)} mol / ${volL} L = ${molarity.toFixed(3)} M.`
      };
    }

    // --- Problem 2: Electrolytes & Hydration Shells (MCQ - 3 attempts) ---
    genProblem2_ElectrolytesMCQ(rng) {
      const correct = 'Ionic salts dissociate into freely moving solvated cations and anions surrounded by polar water dipoles.';
      const distractors = [
        'Water molecules fuse their hydrogen nuclei into copper atoms to create metallic conduction pathways.',
        'Dissolved ions form a continuous solid crystal lattice spanning the entire beaker to conduct voltage.',
        'Electrolytes conduct because water molecules decompose into elemental hydrogen and oxygen gas bubbles.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p2_electrolytes_mcq',
        num: 2,
        topic: 'Aqueous Solutions: Electrolyte Conduction & Hydration',
        stem: 'Why does an aqueous solution of sodium chloride conduct an electric current efficiently, whereas an aqueous solution of sucrose (table sugar) does not conduct electricity?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Electrical conduction requires charged particles that are free to move.',
        hint2: 'Sucrose dissolves as neutral intact molecules, whereas NaCl dissociates into independent charged ions.',
        explanation: 'Electrolyte conduction requires mobile charged carriers. Soluble ionic compounds undergo dissociation into hydrated cations (Na+) and anions (Cl-) surrounded by water dipoles (ion-dipole forces), which freely migrate through the solution when a voltage is applied.'
      };
    }

    // --- Problem 3: Dilution Formula (Calculation - 5 attempts) ---
    genProblem3_DilutionCalc(rng) {
      const m1 = rng.pick([2.0, 3.0, 4.0, 6.0]);
      const m2 = rng.float(0.15, 0.65, 2);
      const v2 = rng.pick([250, 400, 500, 1000]);
      const v1 = (m2 * v2) / m1;
      const rounded = parseFloat(v1.toFixed(1));

      return {
        id: 'p3_dilution_calc',
        num: 3,
        topic: 'Solution Preparation: Dilution Calculations',
        stem: `A laboratory technician needs to prepare <strong>${v2} mL</strong> of <strong>${m2.toFixed(2)} M</strong> hydrochloric acid from a concentrated stock solution with a concentration of <strong>${m1.toFixed(1)} M</strong>.<br><br>What volume of concentrated stock solution in <strong>milliliters (mL)</strong> must be measured out and diluted with water? Enter as a decimal (e.g. <code>25.0</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.2, rounded * 0.02)
        },
        placeholder: 'e.g. 25.0',
        hint1: 'Use the dilution formula M1 &times; V1 = M2 &times; V2, solving for V1.',
        hint2: `V1 = (M2 &times; V2) / M1 = (${m2.toFixed(2)} &times; ${v2}) / ${m1.toFixed(1)}.`,
        workedSolution: `1. Formula: M1 &times; V1 = M2 &times; V2.
2. V1 = (M2 &times; V2) / M1 = (${m2.toFixed(2)} M &times; ${v2} mL) / ${m1.toFixed(1)} M.
3. V1 = ${(m2 * v2).toFixed(2)} / ${m1.toFixed(1)} = ${rounded} mL.`
      };
    }

    // --- Problem 4: Solution Precipitation Stoichiometry (Calculation - 5 attempts) ---
    genProblem4_SolutionStoichCalc(rng) {
      // Reaction: AgNO3(aq) + NaCl(aq) -> AgCl(s) + NaNO3(aq)
      // Molar mass of AgCl = 107.87 + 35.45 = 143.32 g/mol
      const volML = rng.pick([40.0, 50.0, 75.0, 100.0]);
      const molarity = rng.float(0.12, 0.35, 2);
      const molesAg = (volML / 1000.0) * molarity;
      const massPpt = molesAg * 143.32;
      const rounded = parseFloat(massPpt.toFixed(2));

      return {
        id: 'p4_solution_stoich_calc',
        num: 4,
        topic: 'Solution Stoichiometry: Gravimetric Precipitation',
        stem: `A student mixes <strong>${volML.toFixed(1)} mL</strong> of <strong>${molarity.toFixed(2)} M</strong> silver nitrate (AgNO₃) with an excess of sodium chloride (NaCl) solution, precipitating insoluble silver chloride according to:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          AgNO₃(aq) + NaCl(aq) &rarr; AgCl(s) + NaNO₃(aq)
        </div>
        What mass of solid silver chloride (AgCl, molar mass = 143.32 g/mol) in <strong>grams (g)</strong> will precipitate? Enter in grams (e.g. <code>1.43</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.02, rounded * 0.02)
        },
        placeholder: 'e.g. 1.43',
        hint1: 'First find moles of AgNO3 = Molarity &times; Volume(L). The mole ratio of AgCl to AgNO3 is 1:1.',
        hint2: `Moles AgNO3 = ${molarity.toFixed(2)} &times; ${(volML / 1000.0).toFixed(4)} = ${molesAg.toFixed(4)} mol. Multiply by 143.32 g/mol.`,
        workedSolution: `1. Volume in L = ${volML.toFixed(1)} mL / 1000 = ${(volML / 1000.0).toFixed(4)} L.
2. Moles AgNO3 = ${(volML / 1000.0).toFixed(4)} L &times; ${molarity.toFixed(2)} mol/L = ${molesAg.toFixed(4)} mol.
3. Moles AgCl formed = ${molesAg.toFixed(4)} mol (1:1 ratio).
4. Mass AgCl = ${molesAg.toFixed(4)} mol &times; 143.32 g/mol = ${rounded} g.`
      };
    }

    // --- Problem 5: Dynamic Chemical Equilibrium (MCQ - 3 attempts) ---
    genProblem5_DynamicEquilibriumMCQ(rng) {
      const correct = 'The rate of the forward reaction equals the rate of the reverse reaction, keeping all concentrations steady.';
      const distractors = [
        'All molecular collisions cease and all chemical activity permanently freezes in place.',
        'The molar concentration of every reactant must become numerically identical to every product.',
        'All reactants are completely consumed until zero reactant molecules remain in the flask.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p5_dynamic_equilibrium_mcq',
        num: 5,
        topic: 'Dynamic Equilibrium: Microscopic Balance of Rates',
        stem: 'Which statement accurately describes a closed chemical system that has achieved a state of dynamic chemical equilibrium?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Dynamic means ongoing motion; equilibrium means balance of opposing forces.',
        hint2: 'Forward and reverse reactions continue running at equal speeds.',
        explanation: 'Dynamic chemical equilibrium is reached when opposing forward and reverse reaction rates become equal. Molecules continuously react in both directions, but macroscopic concentrations remain constant over time.'
      };
    }

    // --- Problem 6: Equilibrium Expression Writing (MCQ - 3 attempts) ---
    genProblem6_KeqExpressionMCQ(rng) {
      const correct = 'K_eq = [CO2] because pure solids have constant concentrations and are omitted from equilibrium laws.';
      const distractors = [
        'K_eq = [CaO][CO2] / [CaCO3] because all chemical species present in the equation must be included.',
        'K_eq = [CaCO3] / [CO2] because reactant solids appear in the numerator of heterogeneous systems.',
        'K_eq = [CaO] / [CaCO3] because gaseous products cannot exert chemical activity in equilibrium ratios.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p6_keq_expression_mcq',
        num: 6,
        topic: 'Equilibrium Law: Heterogeneous Phase Exclusions',
        stem: `Consider the thermal decomposition of solid limestone in a closed container:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:1rem; text-align:center; margin-bottom:0.75rem;">
          CaCO₃(s) &rightleftharpoons; CaO(s) + CO₂(g)
        </div>
        What is the correct mathematical expression for the equilibrium constant (K_eq)?`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Recall the rule regarding pure solids and pure liquids in equilibrium expressions.',
        hint2: 'Substances marked (s) and (l) are omitted from K_eq.',
        explanation: 'Pure solids and pure liquids have invariant molar concentrations (densities). In accordance with the law of mass action, their activities are equal to 1, so CaCO3(s) and CaO(s) are omitted, leaving K_eq = [CO2].'
      };
    }

    // --- Problem 7: Calculating Keq from Concentrations (Calculation - 5 attempts) ---
    genProblem7_KeqCalculationCalc(rng) {
      // Reaction: N2(g) + 3 H2(g) <=> 2 NH3(g)
      // K_c = [NH3]^2 / ([N2] * [H2]^3)
      const n2 = rng.float(0.20, 0.50, 2);
      const h2 = rng.float(0.30, 0.60, 2);
      const nh3 = rng.float(0.10, 0.35, 2);
      const kc = Math.pow(nh3, 2) / (n2 * Math.pow(h2, 3));
      const rounded = parseFloat(kc.toFixed(2));

      return {
        id: 'p7_keq_calc',
        num: 7,
        topic: 'Equilibrium Constant: Numerical Calculation',
        stem: `At 450 &deg;C, an equilibrium mixture for the Haber-Bosch synthesis reaction is analyzed in a 1.0 L container:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          N₂(g) + 3 H₂(g) &rightleftharpoons; 2 NH₃(g)
        </div>
        The equilibrium concentrations are determined to be:
        <ul style="margin:0.5rem 0 0.5rem 1.25rem; font-size:0.85rem; font-family:var(--font-mono);">
          <li>[N₂] = ${n2.toFixed(2)} M</li>
          <li>[H₂] = ${h2.toFixed(2)} M</li>
          <li>[NH₃] = ${nh3.toFixed(2)} M</li>
        </ul>
        Calculate the equilibrium constant <strong>K_c</strong> for the reaction at this temperature. Enter as a decimal (e.g. <code>2.45</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.1, rounded * 0.03)
        },
        placeholder: 'e.g. 2.45',
        hint1: 'K_c = [NH3]² / ([N2] &times; [H2]³). Note the exponents match stoichiometric coefficients.',
        hint2: `Numerator = (${nh3.toFixed(2)})² = ${(nh3 * nh3).toFixed(4)}. Denominator = ${n2.toFixed(2)} &times; (${h2.toFixed(2)})³ = ${(n2 * Math.pow(h2, 3)).toFixed(5)}.`,
        workedSolution: `1. Expression: K_c = [NH3]² / ([N2] &times; [H2]³).
2. Numerator = (${nh3.toFixed(2)})² = ${(nh3 * nh3).toFixed(4)}.
3. Denominator = ${n2.toFixed(2)} &times; (${h2.toFixed(2)})³ = ${(n2 * Math.pow(h2, 3)).toFixed(5)}.
4. K_c = ${(nh3 * nh3).toFixed(4)} / ${(n2 * Math.pow(h2, 3)).toFixed(5)} = ${rounded}.`
      };
    }

    // --- Problem 8: Magnitude of Keq Interpretation (MCQ - 3 attempts) ---
    genProblem8_MagnitudeKeqMCQ(rng) {
      const correct = 'Products are overwhelmingly favored at equilibrium; the forward reaction goes virtually to completion.';
      const distractors = [
        'Reactants are overwhelmingly favored at equilibrium; virtually no product forms.',
        'The reaction speed is extremely slow and requires thousands of hours to reach equilibrium.',
        'The reaction must be strongly endothermic and freeze the reaction vessel.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p8_magnitude_keq_mcq',
        num: 8,
        topic: 'Equilibrium Constants: Quantitative Ratio Interpretation',
        stem: 'A reversible chemical reaction at 25 &deg;C is measured to have an equilibrium constant of K_eq = 4.8 &times; 10⁷. What does this large numerical value indicate regarding the composition of the mixture at equilibrium?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Remember that K = [Products] / [Reactants].',
        hint2: 'A very large number means the numerator is vastly larger than the denominator.',
        explanation: 'Because K_eq is the ratio of product activities to reactant activities, a value vastly greater than 1 (K >> 1) indicates that product concentrations vastly exceed reactant concentrations at equilibrium.'
      };
    }

    // --- Problem 9: ICE Table Equilibrium Calculation (Calculation - 5 attempts) ---
    genProblem9_ICETableCalc(rng) {
      // H2(g) + I2(g) <=> 2 HI(g)
      // Initial: [H2] = [I2] = C0, [HI] = 0
      // Kc = 49 (perfect square sqrt(49) = 7)
      // Kc = (2x)^2 / (C0 - x)^2 = 49 => 2x / (C0 - x) = 7
      // 2x = 7C0 - 7x => 9x = 7C0 => x = (7/9)*C0
      // [HI] = 2x = (14/9)*C0
      const c0 = rng.pick([0.45, 0.90, 1.35, 1.80]);
      const hiEq = (14.0 / 9.0) * c0;
      const rounded = parseFloat(hiEq.toFixed(2));

      return {
        id: 'p9_ice_table_calc',
        num: 9,
        topic: 'ICE Tables: Equilibrium Concentration Modeling',
        stem: `In a 1.00 L flask, <strong>${c0.toFixed(2)} mol</strong> of H₂(g) and <strong>${c0.toFixed(2)} mol</strong> of I₂(g) are mixed at 448 &deg;C with zero initial HI:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          H₂(g) + I₂(g) &rightleftharpoons; 2 HI(g) &nbsp;&nbsp; K_c = 49.0
        </div>
        Construct an ICE table and calculate the equilibrium concentration of <strong>[HI]</strong> in <strong>mol/L (M)</strong>. Enter as a decimal (e.g. <code>1.25</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: Math.max(0.02, rounded * 0.02)
        },
        placeholder: 'e.g. 1.25',
        hint1: 'Set up ICE table: [H2]_eq = C0 - x, [I2]_eq = C0 - x, [HI]_eq = 2x. Take the square root of both sides of Kc.',
        hint2: `sqrt(Kc) = sqrt(49) = 7.0. Equation: 2x / (${c0.toFixed(2)} - x) = 7.0. Solve for x, then [HI] = 2x.`,
        workedSolution: `1. Initial: [H2] = ${c0.toFixed(2)}, [I2] = ${c0.toFixed(2)}, [HI] = 0.
2. Change: -x, -x, +2x.
3. Equilibrium: (${c0.toFixed(2)} - x), (${c0.toFixed(2)} - x), 2x.
4. K_c = (2x)² / (${c0.toFixed(2)} - x)² = 49.0. Taking square root: 2x / (${c0.toFixed(2)} - x) = 7.0.
5. 2x = 7(${c0.toFixed(2)} - x) = ${(7 * c0).toFixed(2)} - 7x => 9x = ${(7 * c0).toFixed(2)} => x = ${((7 * c0) / 9).toFixed(4)} M.
6. [HI] = 2x = 2 &times; ${((7 * c0) / 9).toFixed(4)} = ${rounded} M.`
      };
    }

    // --- Problem 10: Reaction Quotient Q vs Keq (MCQ - 3 attempts) ---
    genProblem10_ReactionQuotientMCQ(rng) {
      const correct = 'Because Q > K_eq, product concentration is too high; reaction must shift left (reverse) to restore equilibrium.';
      const distractors = [
        'Because Q > K_eq, reactant concentration is too high; reaction must shift right (forward) to restore equilibrium.',
        'Because Q > K_eq, the system is at dynamic equilibrium and no net shift will occur.',
        'Because Q > K_eq, the activation energy becomes zero and all reactions halt completely.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p10_reaction_quotient_mcq',
        num: 10,
        topic: 'Reaction Quotient: Direction of Spontaneous Shift',
        stem: 'A chemist calculates the instantaneous reaction quotient for a system and discovers that Q = 18.5, while the known equilibrium constant is K_eq = 2.4. In which direction must the reaction proceed to achieve equilibrium, and why?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Compare Q to K: Q has the same mathematical form as K, but uses current non-equilibrium concentrations.',
        hint2: 'If Q is greater than K, there are too many products relative to reactants.',
        explanation: 'The reaction quotient Q measures current relative product-to-reactant ratio. When Q > K, there is an excess of products relative to the equilibrium state. In accordance with the law of mass action, the reaction shifts in reverse (left) to consume products and produce reactants until Q = K.'
      };
    }

    // --- Problem 11: Le Chatelier - Temperature on Exothermic System (MCQ - 3 attempts) ---
    genProblem11_LeChatelierTempMCQ(rng) {
      const correct = 'System shifts left (reverse) toward reactants, causing equilibrium K_eq to decrease.';
      const distractors = [
        'System shifts right (forward) toward products, causing equilibrium K_eq to increase.',
        'Equilibrium constant K_eq remains completely constant while forward reaction stops.',
        'System precipitates solid nitrogen without altering gas concentrations.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p11_le_chatelier_temp_mcq',
        num: 11,
        topic: "Le Chatelier's Principle: Thermal Stress & Keq Modulation",
        stem: `Consider the exothermic synthesis of sulfur trioxide at equilibrium:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          2 SO₂(g) + O₂(g) &rightleftharpoons; 2 SO₃(g) + heat &nbsp;&nbsp; (&Delta;H = -198 kJ)
        </div>
        If the temperature of the reaction vessel is increased, what is the net response of the equilibrium system?`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Treat heat as a product in exothermic reactions.',
        hint2: 'Adding a product shifts the equilibrium away from that side.',
        explanation: 'In an exothermic reaction, thermal energy behaves as a product. Increasing temperature stresses the system by adding heat. In response, Le Chatelier\'s Principle dictates a shift in reverse (left) to consume excess thermal energy, decreasing product concentrations and lowering K_eq.'
      };
    }

    // --- Problem 12: Le Chatelier - Pressure and Volume (MCQ - 3 attempts) ---
    genProblem12_LeChatelierPressureMCQ(rng) {
      const correct = 'System shifts right (forward) toward products because the product side has fewer moles of gas (2 moles vs 4 moles).';
      const distractors = [
        'System shifts left (reverse) toward reactants because reactant side has fewer moles of gas.',
        'System does not shift because gas pressure does not exert chemical stress on equilibrium.',
        'All gases condense into liquid immediately, halting all reversible reaction dynamics.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p12_le_chatelier_pressure_mcq',
        num: 12,
        topic: "Le Chatelier's Principle: Pressure & Volume Stresses",
        stem: `The Haber process reaches equilibrium inside a rigid cylinder equipped with a movable piston:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          N₂(g) + 3 H₂(g) &rightleftharpoons; 2 NH₃(g)
        </div>
        If the piston is pushed inward to reduce container volume to half its original size (doubling total pressure), how does the equilibrium respond?
        <div style="margin:1rem 0; background:var(--xl-surface-2, rgba(0,0,0,0.02)); border:1px solid var(--xl-border); border-radius:8px; padding:0.75rem; text-align:center;">
          <svg viewBox="0 0 540 220" style="width:100%; max-width:520px; height:auto; display:block; margin:0 auto; font-family:var(--font-sans);">
            <!-- Axes -->
            <line x1="60" y1="190" x2="500" y2="190" stroke="currentColor" stroke-width="2" />
            <line x1="60" y1="190" x2="60" y2="20" stroke="currentColor" stroke-width="2" />
            <polygon points="500,186 510,190 500,194" fill="currentColor" />
            <polygon points="56,20 60,10 64,20" fill="currentColor" />
            <text x="280" y="210" font-size="11" text-anchor="middle" fill="currentColor" opacity="0.8">Time &rarr;</text>
            <text x="25" y="105" font-size="11" text-anchor="middle" transform="rotate(-90 25 105)" fill="currentColor" opacity="0.8">Concentration (M) &rarr;</text>

            <!-- Disturbance vertical line -->
            <line x1="220" y1="190" x2="220" y2="30" stroke="#94a3b8" stroke-dasharray="4,4" stroke-width="1.5" />
            <text x="220" y="24" font-size="10" text-anchor="middle" fill="#64748b" font-weight="bold">Volume Halved (Pressure Doubled)</text>

            <!-- H2 line: (60,140) -> (220,140) -> instantaneous spike to (220,80) -> shift down to (360,105) -> plateau to (490,105) -->
            <path d="M 60 140 L 220 140 M 220 80 C 260 80, 300 105, 360 105 L 490 105" fill="none" stroke="#3b82f6" stroke-width="2.5" />
            <line x1="220" y1="140" x2="220" y2="80" stroke="#3b82f6" stroke-width="2" stroke-dasharray="2,2" />
            <text x="500" y="109" font-size="10" text-anchor="start" fill="#3b82f6" font-weight="bold">[H₂]</text>

            <!-- N2 line: (60,165) -> (220,165) -> instantaneous spike to (220,120) -> shift down to (360,135) -> plateau to (490,135) -->
            <path d="M 60 165 L 220 165 M 220 120 C 260 120, 300 135, 360 135 L 490 135" fill="none" stroke="#6366f1" stroke-width="2.5" />
            <line x1="220" y1="165" x2="220" y2="120" stroke="#6366f1" stroke-width="2" stroke-dasharray="2,2" />
            <text x="500" y="139" font-size="10" text-anchor="start" fill="#6366f1" font-weight="bold">[N₂]</text>

            <!-- NH3 line: (60,110) -> (220,110) -> instantaneous spike to (220,50) -> shift UP to (360,40) -> plateau to (490,40) -->
            <path d="M 60 110 L 220 110 M 220 50 C 260 50, 300 40, 360 40 L 490 40" fill="none" stroke="#10b981" stroke-width="2.5" />
            <line x1="220" y1="110" x2="220" y2="50" stroke="#10b981" stroke-width="2" stroke-dasharray="2,2" />
            <text x="500" y="44" font-size="10" text-anchor="start" fill="#10b981" font-weight="bold">[NH₃]</text>

            <text x="130" y="180" font-size="9" text-anchor="middle" fill="currentColor" opacity="0.65">Initial Equilibrium</text>
            <text x="420" y="180" font-size="9" text-anchor="middle" fill="currentColor" opacity="0.65">New Equilibrium (Shifted Right)</text>
          </svg>
          <div style="font-size:0.75rem; color:var(--xl-ink-mute); margin-top:0.4rem;">Le Chatelier Dynamic Response: Volume Compression and Concentration Readjustment</div>
        </div>`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Count the total stoichiometric moles of gas on each side of the balanced equation.',
        hint2: 'Reactants = 1 + 3 = 4 mol gas. Products = 2 mol gas. Higher pressure favors fewer gas molecules.',
        explanation: 'Compressing container volume increases total pressure and particle concentration. The system relieves this pressure by shifting toward the side with fewer gas molecules. Because there are 4 moles of gas on the reactant side and only 2 moles on the product side, the system shifts right (forward).'
      };
    }

    // --- Problem 13: Solubility Product Ksp (Calculation - 5 attempts) ---
    genProblem13_KspSolubilityCalc(rng) {
      // AgCl(s) <=> Ag+(aq) + Cl-(aq)  Ksp = 1.77 x 10^-10
      // s = sqrt(Ksp) = sqrt(1.77 x 10^-10) = 1.33 x 10^-5 M
      // Let's ask for molar solubility in micromolar (uM) or standard scientific notation
      // Value: 1.33 x 10^-5 M => in micromoles/L = 13.3 uM
      const ksp = 1.77e-10;
      const s = Math.sqrt(ksp); // 1.33e-5
      const sMicroM = parseFloat((s * 1e6).toFixed(1)); // 13.3 uM

      return {
        id: 'p13_ksp_calc',
        num: 13,
        topic: 'Solubility Equilibrium: Molar Solubility from Ksp',
        stem: `Silver chloride (AgCl) is a sparingly soluble ionic salt that dissolves according to:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
          AgCl(s) &rightleftharpoons; Ag⁺(aq) + Cl⁻(aq) &nbsp;&nbsp; K_sp = 1.77 &times; 10⁻¹⁰
        </div>
        Calculate the <strong>molar solubility</strong> of AgCl in pure water in <strong>micromoles per liter (&mu;mol/L or &mu;M)</strong> where 1 &mu;M = 10⁻⁶ M. Enter as a decimal (e.g. <code>13.3</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: sMicroM,
          tolerance: 0.5
        },
        placeholder: 'e.g. 13.3',
        hint1: 'K_sp = [Ag+][Cl-] = s &times; s = s². Calculate s = sqrt(K_sp) in mol/L, then multiply by 10⁶ to convert to &mu;mol/L.',
        hint2: `s = sqrt(1.77e-10) = 1.33 &times; 10⁻⁵ mol/L. In micromoles/L: 1.33 &times; 10⁻⁵ &times; 10⁶ = 13.3 &mu;M.`,
        workedSolution: `1. Expression: K_sp = [Ag⁺][Cl⁻] = s².
2. s = &radic;(1.77 &times; 10⁻¹⁰) = 1.330 &times; 10⁻⁵ mol/L.
3. Convert to &mu;mol/L: (1.330 &times; 10⁻⁵ mol/L) &times; (10⁶ &mu;mol / 1 mol) = 13.3 &mu;M.`
      };
    }

    // --- Problem 14: Sparingly Soluble Salts Molar Solubility Ranking (Ranking - 3 attempts) ---
    genProblem14_SolubilityRanking(rng) {
      const salts = [
        { id: 'agi', title: 'Silver Iodide (AgI)', note: 'K_sp = 8.5 × 10⁻¹⁷ (s = 9.2 × 10⁻⁹ M)' },
        { id: 'agbr', title: 'Silver Bromide (AgBr)', note: 'K_sp = 5.0 × 10⁻¹³ (s = 7.1 × 10⁻⁷ M)' },
        { id: 'baso4', title: 'Barium Sulfate (BaSO₄)', note: 'K_sp = 1.1 × 10⁻¹⁰ (s = 1.05 × 10⁻⁵ M)' },
        { id: 'agcl', title: 'Silver Chloride (AgCl)', note: 'K_sp = 1.8 × 10⁻¹⁰ (s = 1.34 × 10⁻⁵ M)' }
      ];
      const correctOrder = ['agi', 'agbr', 'baso4', 'agcl'];
      const shuffled = rng.shuffle([...salts]);

      return {
        id: 'p14_solubility_ranking',
        num: 14,
        topic: 'Solubility Product: Molar Solubility Ranking',
        stem: 'Rank the following four sparingly soluble 1:1 ionic salts in order of <strong>increasing molar solubility (s) in pure water at 25 &deg;C</strong> (from least soluble to most soluble).',
        type: 'ranking',
        maxAttempts: 3,
        cards: shuffled,
        correctOrder: correctOrder,
        orderLabels: {
          first: 'Least Soluble (Lowest s)',
          last: 'Most Soluble (Highest s)'
        },
        hint1: 'For a 1:1 electrolyte AB(s) <=> A+(aq) + B-(aq), K_sp = s², so s = sqrt(K_sp).',
        hint2: 'A smaller K_sp indicates a lower equilibrium concentration of dissolved ions in pure water.',
        workedSolution: 'For 1:1 salts, molar solubility s = sqrt(K_sp):\n1. AgI: s = sqrt(8.5 × 10⁻¹⁷) = 9.2 × 10⁻⁹ M (Least soluble)\n2. AgBr: s = sqrt(5.0 × 10⁻¹³) = 7.1 × 10⁻⁷ M\n3. BaSO₄: s = sqrt(1.1 × 10⁻¹⁰) = 1.05 × 10⁻⁵ M\n4. AgCl: s = sqrt(1.8 × 10⁻¹⁰) = 1.34 × 10⁻⁵ M (Most soluble)\n\nCorrect ranking order: AgI < AgBr < BaSO₄ < AgCl.'
      };
    }

    // --- Problem 15: Ocean Acidification Hydrogen Ion Increase (Calculation - 5 attempts) ---
    genProblem15_OceanAcidificationCalc(rng) {
      // Pre-industrial pH = 8.20 => [H+] = 10^-8.20 = 6.31 x 10^-9 M
      // Projected acidified pH = 7.80 => [H+] = 10^-7.80 = 1.58 x 10^-8 M
      // Fold increase = [H+]_acid / [H+]_pre = 10^(8.20 - 7.80) = 10^0.40 = 2.51 fold
      const phInitial = 8.20;
      const phFinal = rng.pick([7.80, 7.85, 7.90]);
      const foldIncrease = Math.pow(10, phInitial - phFinal);
      const rounded = parseFloat(foldIncrease.toFixed(2));

      return {
        id: 'p15_ocean_acidification_calc',
        num: 15,
        topic: 'Marine Equilibrium: Quantitative Ocean Acidification',
        stem: `In marine chemistry, pre-industrial ocean surface water had an average pH of <strong>8.20</strong>. Due to increased absorption of anthropogenic CO₂, modern coastal water pH has dropped in many regions to <strong>${phFinal.toFixed(2)}</strong>.<br><br>By what <strong>fold-factor</strong> has the concentration of hydrogen ions [H⁺] increased? Enter the ratio [H⁺]_modern / [H⁺]_pre-industrial as a decimal (e.g. <code>2.51</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: rounded,
          tolerance: 0.05
        },
        placeholder: 'e.g. 2.51',
        hint1: 'Recall that pH = -log[H+], so [H+] = 10^(-pH). The fold increase is 10^(pH_initial - pH_final).',
        hint2: `Fold factor = 10^(8.20 - ${phFinal.toFixed(2)}) = 10^(${(phInitial - phFinal).toFixed(2)}).`,
        workedSolution: `1. Initial [H⁺] = 10⁻⁸˙²⁰ = ${Math.pow(10, -phInitial).toExponential(3)} M.
2. Final [H⁺] = 10⁻${phFinal.toFixed(2)} = ${Math.pow(10, -phFinal).toExponential(3)} M.
3. Fold increase = 10^(8.20 - ${phFinal.toFixed(2)}) = 10^${(phInitial - phFinal).toFixed(2)} = ${rounded} &times; increase in [H⁺].`
      };
    }

    // --- Problem 16: Shellfish Die-Off Synthesis (MCQ - 3 attempts) ---
    genProblem16_ShellfishDieOffSynthesisMCQ(rng) {
      const correct = 'Excess H⁺ reacts with carbonate ions to form bicarbonate, depleting the CO₃²⁻ required for shell calcification.';
      const distractors = [
        'Acidic seawater causes all oceanic calcium atoms to undergo spontaneous radioactive decay.',
        'Carbon dioxide gas bubbles physically crush shellfish shells through hydrostatic wave pressure.',
        'Shellfish mistakenly consume aqueous acid molecules thinking they are microscopic phytoplankton.'
      ];
      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p16_shellfish_synthesis_mcq',
        num: 16,
        topic: 'Storyline Synthesis: Shellfish Die-Off & Carbonate Depletion',
        stem: 'Why does ocean acidification prevent juvenile oysters and marine calcifiers from building and maintaining calcium carbonate (CaCO₃) shells, leading to widespread shellfish die-offs?',
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Consider what chemical reaction occurs between excess H+ ions and carbonate ions (CO3²-).',
        hint2: 'H+ + CO3²- <=> HCO3- competes directly with Ca²+ + CO3²- <=> CaCO3.',
        explanation: 'Dissolved CO2 forms carbonic acid, producing excess H+ ions. These H+ ions react with free carbonate ions (H+ + CO3²- <=> HCO3-), depleting the carbonate pool. Without sufficient carbonate ion saturation, oysters cannot precipitate CaCO3 (Ca²+ + CO3²- <=> CaCO3), and existing shells begin dissolving into the undersaturated seawater.'
      };
    }
  }

  // ============================================================
  // 5. WORKSTATION CONTROLLER & STATE MANAGER
  // ============================================================
  class XLChemStation {
    constructor() {
      this.unit = 6;
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
      this.generator = new Unit6DeckGenerator(this.rng);
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
      const seedBase = `${cleanName}-u6`;
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
      this.generator = new Unit6DeckGenerator(this.rng);
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
          state.feedback = 'Correct! Outstanding conceptual chemical reasoning.';
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
          state.feedback = 'Correct! Outstanding molar solubility ranking analysis.';
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
        { name: 'Molarity & Solution Preparation', ids: ['p1_molarity_calc', 'p2_electrolytes_mcq'] },
        { name: 'Dilutions & Precipitation Stoichiometry', ids: ['p3_dilution_calc', 'p4_solution_stoich_calc'] },
        { name: 'Dynamic Equilibrium & Law of Mass Action', ids: ['p5_dynamic_equilibrium_mcq', 'p6_keq_expression_mcq'] },
        { name: 'Equilibrium Constant Calculations', ids: ['p7_keq_calc', 'p8_magnitude_keq_mcq'] },
        { name: 'ICE Table Modeling & Reaction Quotient', ids: ['p9_ice_table_calc', 'p10_reaction_quotient_mcq'] },
        { name: "Le Chatelier's Principle Dynamics", ids: ['p11_le_chatelier_temp_mcq', 'p12_le_chatelier_pressure_mcq'] },
        { name: 'Solubility Product & Common Ion Effect', ids: ['p13_ksp_calc', 'p14_solubility_ranking'] },
        { name: 'Ocean Acidification & Shellfish Synthesis', ids: ['p15_ocean_acidification_calc', 'p16_shellfish_synthesis_mcq'] }
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
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 6:</b> Solutions &amp; Equilibrium &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
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
          <b>Unit 6 Quick Reference Key:</b> M = mol / L &middot; M1V1 = M2V2 &middot; K_eq = [Products]^p / [Reactants]^r &middot; Q &lt; K shifts forward &middot; Q &gt; K shifts reverse &middot; Pure solids/liquids omitted
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_molarity_calc') return 'Molarity solution concentration calculation';
      if (p.id === 'p2_electrolytes_mcq') return 'Electrolyte conduction and ion hydration';
      if (p.id === 'p3_dilution_calc') return 'Volumetric dilution stock solution calculation';
      if (p.id === 'p4_solution_stoich_calc') return 'Precipitation stoichiometry mass calculation';
      if (p.id === 'p5_dynamic_equilibrium_mcq') return 'Dynamic equilibrium forward and reverse rates';
      if (p.id === 'p6_keq_expression_mcq') return 'Heterogeneous equilibrium expression writing';
      if (p.id === 'p7_keq_calc') return 'Numerical equilibrium constant Kc calculation';
      if (p.id === 'p8_magnitude_keq_mcq') return 'Magnitude of equilibrium constant interpretation';
      if (p.id === 'p9_ice_table_calc') return 'ICE table product equilibrium concentration';
      if (p.id === 'p10_reaction_quotient_mcq') return 'Reaction quotient Q direction of shift';
      if (p.id === 'p11_le_chatelier_temp_mcq') return 'Le Chatelier temperature stress on exothermic reaction';
      if (p.id === 'p12_le_chatelier_pressure_mcq') return 'Le Chatelier pressure and volume stress shift';
      if (p.id === 'p13_ksp_calc') return 'Solubility product Ksp molar solubility';
      if (p.id === 'p14_solubility_ranking') return 'Sparingly soluble salt molar solubility ranking';
      if (p.id === 'p15_ocean_acidification_calc') return 'Ocean acidification hydrogen ion fold increase';
      if (p.id === 'p16_shellfish_synthesis_mcq') return 'Shellfish die-off carbonate depletion synthesis';
      return 'Unit 6 practice item';
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
