/**
 * unit8.js - XL Chemistry Practice Suite: Unit 8 (Gases & Pressure)
 * Deterministic problem generator, seeded PRNG, attempt tracker,
 * live answer evaluation with SmartParser, draggable scientific calculator,
 * reference center drawer, and dual-purpose single-page study report generator.
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
  // 3. CANONICAL PERIODIC TABLE DATASET (Z = 1..36)
  // ============================================================
  const PERIODIC_ELEMENTS = [
    { z: 1, sym: 'H', name: 'Hydrogen', mass: 1.008, group: 1, period: 1, kind: 'nonmetal', ie: 1312, en: 2.2, charge: '+1, -1' },
    { z: 2, sym: 'He', name: 'Helium', mass: 4.003, group: 18, period: 1, kind: 'noble', ie: 2372, en: null, charge: '0' },
    { z: 3, sym: 'Li', name: 'Lithium', mass: 6.94, group: 1, period: 2, kind: 'metal', ie: 520, en: 0.98, charge: '+1' },
    { z: 4, sym: 'Be', name: 'Beryllium', mass: 9.012, group: 2, period: 2, kind: 'metal', ie: 899, en: 1.57, charge: '+2' },
    { z: 5, sym: 'B', name: 'Boron', mass: 10.81, group: 13, period: 2, kind: 'metalloid', ie: 801, en: 2.04, charge: '+3' },
    { z: 6, sym: 'C', name: 'Carbon', mass: 12.011, group: 14, period: 2, kind: 'nonmetal', ie: 1086, en: 2.55, charge: '+4, -4' },
    { z: 7, sym: 'N', name: 'Nitrogen', mass: 14.007, group: 15, period: 2, kind: 'nonmetal', ie: 1402, en: 3.04, charge: '-3' },
    { z: 8, sym: 'O', name: 'Oxygen', mass: 15.999, group: 16, period: 2, kind: 'nonmetal', ie: 1314, en: 3.44, charge: '-2' },
    { z: 9, sym: 'F', name: 'Fluorine', mass: 18.998, group: 17, period: 2, kind: 'nonmetal', ie: 1681, en: 3.98, charge: '-1' },
    { z: 10, sym: 'Ne', name: 'Neon', mass: 20.18, group: 18, period: 2, kind: 'noble', ie: 2081, en: null, charge: '0' },
    { z: 11, sym: 'Na', name: 'Sodium', mass: 22.99, group: 1, period: 3, kind: 'metal', ie: 496, en: 0.93, charge: '+1' },
    { z: 12, sym: 'Mg', name: 'Magnesium', mass: 24.305, group: 2, period: 3, kind: 'metal', ie: 738, en: 1.31, charge: '+2' },
    { z: 13, sym: 'Al', name: 'Aluminum', mass: 26.982, group: 13, period: 3, kind: 'metal', ie: 578, en: 1.61, charge: '+3' },
    { z: 14, sym: 'Si', name: 'Silicon', mass: 28.085, group: 14, period: 3, kind: 'metalloid', ie: 786, en: 1.9, charge: '+4, -4' },
    { z: 15, sym: 'P', name: 'Phosphorus', mass: 30.974, group: 15, period: 3, kind: 'nonmetal', ie: 1012, en: 2.19, charge: '-3, +5' },
    { z: 16, sym: 'S', name: 'Sulfur', mass: 32.06, group: 16, period: 3, kind: 'nonmetal', ie: 1000, en: 2.58, charge: '-2, +4, +6' },
    { z: 17, sym: 'Cl', name: 'Chlorine', mass: 35.45, group: 17, period: 3, kind: 'nonmetal', ie: 1251, en: 3.16, charge: '-1' },
    { z: 18, sym: 'Ar', name: 'Argon', mass: 39.948, group: 18, period: 3, kind: 'noble', ie: 1521, en: null, charge: '0' },
    { z: 19, sym: 'K', name: 'Potassium', mass: 39.098, group: 1, period: 4, kind: 'metal', ie: 419, en: 0.82, charge: '+1' },
    { z: 20, sym: 'Ca', name: 'Calcium', mass: 40.078, group: 2, period: 4, kind: 'metal', ie: 590, en: 1.0, charge: '+2' },
    { z: 21, sym: 'Sc', name: 'Scandium', mass: 44.956, group: 3, period: 4, kind: 'transition', ie: 633, en: 1.36, charge: '+3' },
    { z: 22, sym: 'Ti', name: 'Titanium', mass: 47.867, group: 4, period: 4, kind: 'transition', ie: 659, en: 1.54, charge: '+4, +3' },
    { z: 23, sym: 'V', name: 'Vanadium', mass: 50.942, group: 5, period: 4, kind: 'transition', ie: 651, en: 1.63, charge: '+5, +4' },
    { z: 24, sym: 'Cr', name: 'Chromium', mass: 51.996, group: 6, period: 4, kind: 'transition', ie: 653, en: 1.66, charge: '+3, +6' },
    { z: 25, sym: 'Mn', name: 'Manganese', mass: 54.938, group: 7, period: 4, kind: 'transition', ie: 717, en: 1.55, charge: '+2, +4, +7' },
    { z: 26, sym: 'Fe', name: 'Iron', mass: 55.845, group: 8, period: 4, kind: 'transition', ie: 762, en: 1.83, charge: '+2, +3' },
    { z: 27, sym: 'Co', name: 'Cobalt', mass: 58.933, group: 9, period: 4, kind: 'transition', ie: 760, en: 1.88, charge: '+2, +3' },
    { z: 28, sym: 'Ni', name: 'Nickel', mass: 58.693, group: 10, period: 4, kind: 'transition', ie: 737, en: 1.91, charge: '+2' },
    { z: 29, sym: 'Cu', name: 'Copper', mass: 63.546, group: 11, period: 4, kind: 'transition', ie: 745, en: 1.9, charge: '+1, +2' },
    { z: 30, sym: 'Zn', name: 'Zinc', mass: 65.38, group: 12, period: 4, kind: 'transition', ie: 906, en: 1.65, charge: '+2' },
    { z: 31, sym: 'Ga', name: 'Gallium', mass: 69.723, group: 13, period: 4, kind: 'metal', ie: 579, en: 1.81, charge: '+3' },
    { z: 32, sym: 'Ge', name: 'Germanium', mass: 72.63, group: 14, period: 4, kind: 'metalloid', ie: 762, en: 2.01, charge: '+4' },
    { z: 33, sym: 'As', name: 'Arsenic', mass: 74.922, group: 15, period: 4, kind: 'metalloid', ie: 947, en: 2.18, charge: '-3, +3, +5' },
    { z: 34, sym: 'Se', name: 'Selenium', mass: 78.971, group: 16, period: 4, kind: 'nonmetal', ie: 941, en: 2.55, charge: '-2, +4' },
    { z: 35, sym: 'Br', name: 'Bromine', mass: 79.904, group: 17, period: 4, kind: 'nonmetal', ie: 1140, en: 2.96, charge: '-1' },
    { z: 36, sym: 'Kr', name: 'Krypton', mass: 83.798, group: 18, period: 4, kind: 'noble', ie: 1351, en: 3.0, charge: '0' }
  ];

  // ============================================================
  // 4. UNIT 8 DECK GENERATOR (16 DETERMINISTIC PROBLEMS)
  // ============================================================
  class Unit8DeckGenerator {
    constructor(rng) {
      this.rng = rng;
    }

    generateDeck() {
      const rng = this.rng;
      const problems = [];

      // --- Skill 1, Problem 1: Pressure Unit Conversions (Calculation - 5 attempts) ---
      {
        const mode = rng.int(0, 3);
        let promptText = '';
        let targetValue = 0;
        let targetUnit = '';
        let placeholder = '';
        let hint2Text = '';
        let workedText = '';

        if (mode === 0) {
          const pAtm = rng.float(0.85, 2.75, 3);
          targetValue = parseFloat((pAtm * 760).toFixed(1));
          targetUnit = 'mmHg';
          placeholder = 'e.g. 760 mmHg';
          promptText = `A deep-sea submersible research cabin maintains an internal atmospheric pressure of <strong>${pAtm.toFixed(3)} atm</strong>.<br><br>Convert this barometric pressure into <strong>millimeters of mercury (mmHg)</strong>, where $1\\text{ atm} = 760\\text{ mmHg}$.`;
          hint2Text = `Multiply ${pAtm.toFixed(3)} atm × 760 mmHg/atm.`;
          workedText = `1. Conversion: 1 atm = 760 mmHg.\n2. Calculation: ${pAtm.toFixed(3)} atm × (760 mmHg / 1 atm) = ${targetValue} mmHg.`;
        } else if (mode === 1) {
          const pAtm = rng.float(1.1, 3.2, 3);
          targetValue = parseFloat((pAtm * 101.325).toFixed(1));
          targetUnit = 'kPa';
          placeholder = 'e.g. 101.3 kPa';
          promptText = `A pressurized aircraft testing chamber registers an absolute internal pressure of <strong>${pAtm.toFixed(3)} atm</strong>.<br><br>Convert this pressure reading into <strong>kilopascals (kPa)</strong>, using the exact standard conversion factor $1\\text{ atm} = 101.325\\text{ kPa}$.`;
          hint2Text = `Multiply ${pAtm.toFixed(3)} atm × 101.325 kPa/atm.`;
          workedText = `1. Conversion: 1 atm = 101.325 kPa.\n2. Calculation: ${pAtm.toFixed(3)} atm × (101.325 kPa / 1 atm) = ${targetValue} kPa.`;
        } else if (mode === 2) {
          const pMm = rng.int(540, 1150);
          targetValue = parseFloat((pMm / 760).toFixed(3));
          targetUnit = 'atm';
          placeholder = 'e.g. 1.25 atm';
          promptText = `A high-altitude mountain research weather station barometer reads <strong>${pMm} mmHg</strong>.<br><br>Convert this ambient pressure into <strong>atmospheres (atm)</strong>, rounded to three decimal places.`;
          hint2Text = `Divide ${pMm} mmHg by 760 mmHg/atm.`;
          workedText = `1. Conversion: 760 mmHg = 1 atm.\n2. Calculation: ${pMm} mmHg / 760 mmHg/atm = ${targetValue} atm.`;
        } else {
          const pPsi = rng.float(18.5, 42.0, 1);
          targetValue = parseFloat((pPsi / 14.696).toFixed(3));
          targetUnit = 'atm';
          placeholder = 'e.g. 1.50 atm';
          promptText = `A scuba diving buoyancy compensator bladder is pressurized to <strong>${pPsi.toFixed(1)} psi</strong>.<br><br>Convert this gauge measurement into <strong>atmospheres (atm)</strong>, where $1\\text{ atm} = 14.696\\text{ psi}$. Round to three decimal places.`;
          hint2Text = `Divide ${pPsi.toFixed(1)} psi by 14.696 psi/atm.`;
          workedText = `1. Conversion: 14.696 psi = 1 atm.\n2. Calculation: ${pPsi.toFixed(1)} psi / 14.696 psi/atm = ${targetValue} atm.`;
        }

        problems.push({
          id: 'p1_pressure_units_calc',
          num: 1,
          topic: 'Pressure Units: Dimensional Analysis',
          stem: promptText,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetValue,
            unit: targetUnit,
            tolerance: 0.02
          },
          placeholder: placeholder,
          hint1: 'Apply dimensional analysis using the standard pressure equivalences: 1 atm = 760 mmHg = 101.325 kPa = 14.696 psi.',
          hint2: hint2Text,
          workedSolution: workedText
        });
      }

      // --- Skill 1, Problem 2: Barometers & Manometers (MCQ - 3 attempts) ---
      {
        const correct = 'Atmospheric pressure pushes down on the open mercury reservoir, balancing the weight of the sealed vacuum column.';
        const distractors = [
          'The vacuum at the top of the glass tube actively sucks the liquid mercury upward into the tube.',
          'Liquid mercury boils spontaneously at room temperature, generating high internal vapor pressure that lifts the column.',
          'Capillary action pulls the heavy mercury upward until liquid cohesion forces freeze the meniscus.'
        ];
        const options = rng.shuffle([correct, ...distractors]);

        problems.push({
          id: 'p2_barometer_manometer_mcq',
          num: 2,
          topic: 'Barometry & Manometers: Liquid Column Equilibrium',
          stem: 'A Torricellian mercury barometer consists of an inverted glass tube filled with mercury resting in an open dish of mercury. At sea level, the mercury column stands at a height of 760 mm. What physical force supports the weight of the mercury column in the tube?',
          type: 'mcq',
          maxAttempts: 3,
          options: options,
          expectedOption: correct,
          hint1: 'Consider what is exerting force on the exposed liquid surface in the open dish.',
          hint2: 'A vacuum cannot exert a pulling force; the surrounding atmospheric gas exerts downward pressure.',
          explanation: 'Atmospheric air particles collide with the surface of the mercury pool in the open dish, exerting an ambient pressure of 1 atm. This downward pressure forces liquid mercury up the evacuated tube until the downward hydrostatic gravitational weight of the mercury column exactly balances the external atmospheric force.'
        });
      }

      // --- Skill 2, Problem 3: Kinetic Molecular Theory Postulates (MCQ - 3 attempts) ---
      {
        const correct = 'Gas particle volume is negligible compared to total container volume, collisions are perfectly elastic, and average kinetic energy is directly proportional to absolute Kelvin temperature.';
        const distractors = [
          'Gas particles attract each other strongly through gravitational dipoles, slowing down whenever volume expands.',
          'Heavier gas molecules at the same temperature have higher average kinetic energy than lighter molecules.',
          'Gas particle collisions lose kinetic energy as sound and friction, causing unheated gases to settle out as liquids.'
        ];
        const options = rng.shuffle([correct, ...distractors]);

        problems.push({
          id: 'p3_kmt_postulates_mcq',
          num: 3,
          topic: 'Kinetic Molecular Theory: Fundamental Postulates',
          stem: 'Which statement accurately describes the core physical postulates of the Kinetic Molecular Theory (KMT) for an ideal gas?',
          type: 'mcq',
          maxAttempts: 3,
          options: options,
          expectedOption: correct,
          hint1: 'KMT assumes ideal gas particles have zero volume and experience no attractive or repulsive intermolecular forces.',
          hint2: 'Remember that temperature is a direct measure of average molecular kinetic energy: KE_avg = (3/2)kT.',
          explanation: 'The Kinetic Molecular Theory models ideal gases under three fundamental assumptions: (1) gas particles occupy negligible volume compared to container distance, (2) collisions between particles and walls are perfectly elastic (no net kinetic energy lost), and (3) average kinetic energy depends solely on absolute temperature in Kelvin.'
        });
      }

      // --- Skill 2, Problem 4: Root-Mean-Square Molecular Velocity (Calculation - 5 attempts) ---
      {
        const gases = [
          { name: 'Helium (He)', molarMassKg: 0.004003, formula: 'He' },
          { name: 'Neon (Ne)', molarMassKg: 0.02018, formula: 'Ne' },
          { name: 'Nitrogen (N₂)', molarMassKg: 0.028014, formula: 'N_2' },
          { name: 'Oxygen (O₂)', molarMassKg: 0.032, formula: 'O_2' },
          { name: 'Argon (Ar)', molarMassKg: 0.03995, formula: 'Ar' },
          { name: 'Carbon dioxide (CO₂)', molarMassKg: 0.04401, formula: 'CO_2' }
        ];
        const selectedGas = rng.pick(gases);
        const tempC = rng.int(15, 85);
        const tempK = tempC + 273.15;
        const R_J = 8.314; // J/(mol*K)
        const vRms = Math.sqrt((3 * R_J * tempK) / selectedGas.molarMassKg);
        const targetVal = parseFloat(vRms.toFixed(1));

        problems.push({
          id: 'p4_molecular_speed_calc',
          num: 4,
          topic: 'Molecular Velocities: Root-Mean-Square Speed',
          stem: `Calculate the root-mean-square speed ($v_{\\text{rms}}$) of <strong>${selectedGas.name}</strong> molecules at a temperature of <strong>${tempC} &deg;C</strong> (${tempK.toFixed(2)} K), in meters per second (m/s).<br><br>Use the gas constant $R = 8.314\\text{ J}/(\\text{mol}\\cdot\\text{K})$ and ensure molar mass is converted to kilograms per mole (kg/mol).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'm/s',
            tolerance: 0.02
          },
          placeholder: 'e.g. 420.5 m/s',
          hint1: 'Use the formula v_rms = sqrt(3*R*T / M), where R = 8.314 J/(mol*K), T is in Kelvin, and M must be expressed in kg/mol.',
          hint2: `M = ${selectedGas.molarMassKg} kg/mol. T = ${tempK.toFixed(2)} K. v_rms = sqrt(3 × 8.314 × ${tempK.toFixed(2)} / ${selectedGas.molarMassKg}).`,
          workedSolution: `1. Temperature in Kelvin: T = ${tempC} + 273.15 = ${tempK.toFixed(2)} K.\n2. Molar mass in kg/mol: M = ${selectedGas.molarMassKg} kg/mol.\n3. Calculation: v_rms = sqrt(3 × 8.314 × ${tempK.toFixed(2)} / ${selectedGas.molarMassKg}) = ${targetVal} m/s.`
        });
      }

      // --- Skill 3, Problem 5: Boyle's Law Isothermal Compression (Calculation - 5 attempts) ---
      {
        const v1 = rng.float(12.0, 36.0, 1);
        const p1 = rng.float(1.0, 2.5, 2);
        const p2 = rng.float(5.0, 14.0, 2);
        const v2 = (p1 * v1) / p2;
        const targetVal = parseFloat(v2.toFixed(2));

        problems.push({
          id: 'p5_boyles_law_calc',
          num: 5,
          topic: "Boyle's Law: Isothermal Pressure-Volume Shift",
          stem: `A sample of gas in a flexible piston occupies <strong>${v1.toFixed(1)} L</strong> under an initial pressure of <strong>${p1.toFixed(2)} atm</strong>.<br><br>If the gas is compressed isothermally (at constant temperature) until the pressure reaches <strong>${p2.toFixed(2)} atm</strong>, calculate the final volume of the gas in liters (L).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'L',
            tolerance: 0.02
          },
          placeholder: 'e.g. 5.40 L',
          hint1: "Apply Boyle's Law: P1 × V1 = P2 × V2, solving for V2 = (P1 × V1) / P2.",
          hint2: `V2 = (${p1.toFixed(2)} atm × ${v1.toFixed(1)} L) / ${p2.toFixed(2)} atm = ${targetVal} L.`,
          workedSolution: `1. Formula: P₁V₁ = P₂V₂.\n2. Solve for V₂: V₂ = (P₁V₁) / P₂ = (${p1.toFixed(2)} atm × ${v1.toFixed(1)} L) / ${p2.toFixed(2)} atm = ${targetVal} L.`
        });
      }

      // --- Skill 3, Problem 6: Charles's & Gay-Lussac's Thermal Law (Calculation - 5 attempts) ---
      {
        const isRigid = rng.pick([true, false]);
        if (isRigid) {
          const p1 = rng.float(1.5, 4.5, 2);
          const t1C = rng.int(18, 28);
          const t2C = rng.int(85, 175);
          const t1K = t1C + 273.15;
          const t2K = t2C + 273.15;
          const p2 = (p1 * t2K) / t1K;
          const targetVal = parseFloat(p2.toFixed(2));

          problems.push({
            id: 'p6_charles_gaylussac_calc',
            num: 6,
            topic: "Gay-Lussac's Law: Isochoric Thermal Pressure",
            stem: `A rigid steel gas cylinder with fixed internal volume holds neon gas at <strong>${p1.toFixed(2)} atm</strong> at <strong>${t1C} &deg;C</strong>.<br><br>The cylinder is placed in an industrial heating kiln and warmed to <strong>${t2C} &deg;C</strong>. Calculate the final internal pressure in atmospheres (atm). Be sure to convert temperatures to Kelvin.`,
            type: 'calculation',
            maxAttempts: 5,
            expected: {
              value: targetVal,
              unit: 'atm',
              tolerance: 0.02
            },
            placeholder: 'e.g. 4.50 atm',
            hint1: "Convert both temperatures to Kelvin: T(K) = T(°C) + 273.15. Then apply Gay-Lussac's Law: P1 / T1 = P2 / T2.",
            hint2: `T1 = ${t1K.toFixed(2)} K, T2 = ${t2K.toFixed(2)} K. P2 = ${p1.toFixed(2)} × (${t2K.toFixed(2)} / ${t1K.toFixed(2)}).`,
            workedSolution: `1. Convert temperatures: T₁ = ${t1C} + 273.15 = ${t1K.toFixed(2)} K; T₂ = ${t2C} + 273.15 = ${t2K.toFixed(2)} K.\n2. Gay-Lussac's Law: P₂ = P₁ × (T₂ / T₁) = ${p1.toFixed(2)} atm × (${t2K.toFixed(2)} K / ${t1K.toFixed(2)} K) = ${targetVal} atm.`
          });
        } else {
          const v1 = rng.float(2.4, 8.5, 2);
          const t1C = rng.int(20, 32);
          const t2C = rng.int(75, 140);
          const t1K = t1C + 273.15;
          const t2K = t2C + 273.15;
          const v2 = (v1 * t2K) / t1K;
          const targetVal = parseFloat(v2.toFixed(2));

          problems.push({
            id: 'p6_charles_gaylussac_calc',
            num: 6,
            topic: "Charles's Law: Isobaric Thermal Expansion",
            stem: `A flexible research balloon has an initial volume of <strong>${v1.toFixed(2)} L</strong> at <strong>${t1C} &deg;C</strong>.<br><br>The balloon is heated at constant external pressure to <strong>${t2C} &deg;C</strong>. Calculate the new expanded volume of the balloon in liters (L). Convert temperatures to Kelvin first.`,
            type: 'calculation',
            maxAttempts: 5,
            expected: {
              value: targetVal,
              unit: 'L',
              tolerance: 0.02
            },
            placeholder: 'e.g. 3.75 L',
            hint1: "Convert temperatures to Kelvin: T(K) = T(°C) + 273.15. Then apply Charles's Law: V1 / T1 = V2 / T2.",
            hint2: `T1 = ${t1K.toFixed(2)} K, T2 = ${t2K.toFixed(2)} K. V2 = ${v1.toFixed(2)} × (${t2K.toFixed(2)} / ${t1K.toFixed(2)}).`,
            workedSolution: `1. Convert temperatures: T₁ = ${t1C} + 273.15 = ${t1K.toFixed(2)} K; T₂ = ${t2C} + 273.15 = ${t2K.toFixed(2)} K.\n2. Charles's Law: V₂ = V₁ × (T₂ / T₁) = ${v1.toFixed(2)} L × (${t2K.toFixed(2)} K / ${t1K.toFixed(2)} K) = ${targetVal} L.`
          });
        }
      }

      // --- Skill 4, Problem 7: Combined Gas Law Multi-Variable Shift (Calculation - 5 attempts) ---
      {
        const v1 = rng.float(150, 480, 1);
        const p1 = rng.float(0.96, 1.05, 3);
        const t1C = rng.int(18, 26);
        const t1K = t1C + 273.15;

        const p2 = rng.float(0.24, 0.42, 3);
        const t2C = rng.int(-52, -25);
        const t2K = t2C + 273.15;

        const v2 = (p1 * v1 * t2K) / (p2 * t1K);
        const targetVal = parseFloat(v2.toFixed(1));

        problems.push({
          id: 'p7_combined_gas_calc',
          num: 7,
          topic: 'Combined Gas Law: Simultaneous Altitude Shifts',
          stem: `A high-altitude weather balloon is launched at sea level where the volume is <strong>${v1.toFixed(1)} L</strong>, ambient pressure is <strong>${p1.toFixed(3)} atm</strong>, and temperature is <strong>${t1C} &deg;C</strong>.<br><br>As it rises into the stratosphere, the ambient pressure drops to <strong>${p2.toFixed(3)} atm</strong> and the temperature drops to <strong>${t2C} &deg;C</strong>. Calculate the new volume of the weather balloon in liters (L).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'L',
            tolerance: 0.02
          },
          placeholder: 'e.g. 850.0 L',
          hint1: 'Apply the Combined Gas Law: (P1 × V1) / T1 = (P2 × V2) / T2. Solve for V2 = (P1 × V1 × T2) / (P2 × T1).',
          hint2: `Convert to Kelvin: T1 = ${t1C} + 273.15 = ${t1K.toFixed(2)} K; T2 = ${t2C} + 273.15 = ${t2K.toFixed(2)} K.`,
          workedSolution: `1. Convert temperatures: T₁ = ${t1K.toFixed(2)} K, T₂ = ${t2K.toFixed(2)} K.\n2. Combined Gas Law: V₂ = (P₁ × V₁ × T₂) / (P₂ × T₁) = (${p1.toFixed(3)} × ${v1.toFixed(1)} × ${t2K.toFixed(2)}) / (${p2.toFixed(3)} × ${t1K.toFixed(2)}) = ${targetVal} L.`
        });
      }

      // --- Skill 4, Problem 8: Microscopic Collision Frequency (MCQ - 3 attempts) ---
      {
        const correct = 'Molecules move faster at higher temperature, causing more frequent collisions with container walls and transferring greater momentum per impact.';
        const distractors = [
          'Gas molecules expand physically in size when heated, filling up empty space and pressing outward on the walls.',
          'Thermal energy creates electrostatic repulsion that pushes all gas particles simultaneously against the container walls.',
          'Heating causes gas molecules to undergo nuclear fission, multiplying the total number of particles.'
        ];
        const options = rng.shuffle([correct, ...distractors]);

        problems.push({
          id: 'p8_collision_frequency_mcq',
          num: 8,
          topic: 'Microscopic Gas Dynamics: Momentum & Collision Rates',
          stem: 'From a microscopic particulate perspective, why does heating a gas in a rigid container with fixed volume cause the measured pressure to increase?',
          type: 'mcq',
          maxAttempts: 3,
          options: options,
          expectedOption: correct,
          hint1: 'Pressure is defined macroscopically as force per unit area, caused microscopically by particle collisions.',
          hint2: 'Higher temperature increases average velocity, affecting both how often particles hit the wall and how hard they hit.',
          explanation: 'Pressure is the cumulative force exerted by gas particles colliding with container walls (P = F/A = Δp / Δt per area). When temperature increases, average molecular speed increases. This leads to two synergistic effects: (1) collisions occur more frequently, and (2) each collision imparts greater momentum, resulting in higher pressure.'
        });
      }

      // --- Skill 5, Problem 9: Ideal Gas Equation (Calculation - 5 attempts) ---
      {
        const nMoles = rng.float(0.45, 2.8, 2);
        const tempC = rng.int(22, 65);
        const tempK = tempC + 273.15;
        const volumeL = rng.float(5.0, 22.0, 1);
        const R = 0.08206;
        const pressureAtm = (nMoles * R * tempK) / volumeL;
        const targetVal = parseFloat(pressureAtm.toFixed(2));

        problems.push({
          id: 'p9_ideal_gas_calc',
          num: 9,
          topic: 'Ideal Gas Law: PV = nRT State Variables',
          stem: `A rigid gas canister with a volume of <strong>${volumeL.toFixed(1)} L</strong> is filled with <strong>${nMoles.toFixed(2)} moles</strong> of argon gas at a temperature of <strong>${tempC} &deg;C</strong>.<br><br>Calculate the pressure of the gas inside the canister in <strong>atmospheres (atm)</strong>. Use $R = 0.08206\\text{ L}\\cdot\\text{atm}/(\\text{mol}\\cdot\\text{K})$.`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'atm',
            tolerance: 0.02
          },
          placeholder: 'e.g. 2.45 atm',
          hint1: 'Use PV = nRT, solving for P = (n × R × T) / V. Remember that T must be in Kelvin.',
          hint2: `T = ${tempC} + 273.15 = ${tempK.toFixed(2)} K. P = (${nMoles.toFixed(2)} × 0.08206 × ${tempK.toFixed(2)}) / ${volumeL.toFixed(1)}.`,
          workedSolution: `1. T = ${tempC} + 273.15 = ${tempK.toFixed(2)} K.\n2. Ideal Gas Law: P = (nRT) / V = (${nMoles.toFixed(2)} mol × 0.08206 L·atm/(mol·K) × ${tempK.toFixed(2)} K) / ${volumeL.toFixed(1)} L = ${targetVal} atm.`
        });
      }

      // --- Skill 5, Problem 10: Dumas Bulb Vapor Molar Mass (Calculation - 5 attempts) ---
      {
        const liquids = [
          { name: 'hexane', actualM: 86.18 },
          { name: 'ethanol', actualM: 46.07 },
          { name: 'acetone', actualM: 58.08 },
          { name: 'cyclohexane', actualM: 84.16 },
          { name: 'isopropanol', actualM: 60.1 }
        ];
        const selected = rng.pick(liquids);
        const flaskVolumeML = rng.int(240, 275);
        const flaskVolumeL = flaskVolumeML / 1000.0;
        const baroMm = rng.int(745, 768);
        const baroAtm = baroMm / 760.0;
        const waterBathC = rng.int(98, 100);
        const waterBathK = waterBathC + 273.15;
        const R = 0.08206;

        const vaporMassG = (baroAtm * flaskVolumeL * selected.actualM) / (R * waterBathK);
        const vaporMassRounded = parseFloat(vaporMassG.toFixed(3));
        const calculatedM = (vaporMassRounded * R * waterBathK) / (baroAtm * flaskVolumeL);
        const targetVal = parseFloat(calculatedM.toFixed(1));

        problems.push({
          id: 'p10_gas_density_molar_mass_calc',
          num: 10,
          topic: 'Dumas Method: Volatile Vapor Molar Mass',
          stem: `In an analytical chemistry laboratory, a student uses the Dumas bulb method to determine the molar mass of an unknown volatile liquid.<br><br>The dry flask has a volume of <strong>${flaskVolumeML} mL</strong>. The boiling water bath temperature is <strong>${waterBathC} &deg;C</strong>, and the ambient barometric pressure is <strong>${baroMm} mmHg</strong>. After vaporization and condensation, the condensed vapor has a mass of <strong>${vaporMassRounded} g</strong>.<br><br>Calculate the <strong>molar mass (g/mol)</strong> of the volatile compound.`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'g/mol',
            tolerance: 0.02
          },
          placeholder: 'e.g. 74.1 g/mol',
          hint1: 'Convert pressure to atm (mmHg / 760), volume to liters (mL / 1000), and temperature to Kelvin. Then apply M = (m × R × T) / (P × V).',
          hint2: `P = ${baroAtm.toFixed(3)} atm, V = ${flaskVolumeL.toFixed(3)} L, T = ${waterBathK.toFixed(2)} K. M = (${vaporMassRounded} × 0.08206 × ${waterBathK.toFixed(2)}) / (${baroAtm.toFixed(3)} × ${flaskVolumeL.toFixed(3)}).`,
          workedSolution: `1. Unit conversions: P = ${baroMm} / 760 = ${baroAtm.toFixed(4)} atm; V = ${flaskVolumeML} / 1000 = ${flaskVolumeL.toFixed(3)} L; T = ${waterBathC} + 273.15 = ${waterBathK.toFixed(2)} K.\n2. Molar mass formula: M = (mRT) / (PV) = (${vaporMassRounded} g × 0.08206 × ${waterBathK.toFixed(2)} K) / (${baroAtm.toFixed(4)} atm × ${flaskVolumeL.toFixed(3)} L) = ${targetVal} g/mol.`
        });
      }

      // --- Skill 6, Problem 11: Dalton's Law of Partial Pressures (Calculation - 5 attempts) ---
      {
        const depthM = rng.pick([30, 40, 50, 60]);
        const pTotalAtm = 1.0 + depthM / 10.0;
        const o2Pct = rng.int(14, 21);
        const hePct = rng.int(35, 50);
        const n2Pct = 100 - o2Pct - hePct;

        const xO2 = o2Pct / 100.0;
        const pO2 = parseFloat((xO2 * pTotalAtm).toFixed(2));

        problems.push({
          id: 'p11_daltons_law_calc',
          num: 11,
          topic: "Dalton's Law: Trimix Diving Hyperbaric Partial Pressures",
          stem: `A technical scuba diver uses a Trimix breathing gas composed of <strong>${o2Pct}% O₂</strong>, <strong>${hePct}% He</strong>, and <strong>${n2Pct}% N₂</strong> by mole fraction.<br><br>At a depth of <strong>${depthM} meters</strong> of seawater, the total ambient hydrostatic pressure is <strong>${pTotalAtm.toFixed(1)} atm</strong>.<br><br>Calculate the <strong>partial pressure of oxygen ($P_{\\text{O}_2}$)</strong> in atmospheres (atm) delivered to the diver's lungs at this depth.`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: pO2,
            unit: 'atm',
            tolerance: 0.02
          },
          placeholder: 'e.g. 1.40 atm',
          hint1: "Apply Dalton's Law: P_A = X_A × P_total, where X_A is the mole fraction (percent / 100).",
          hint2: `P_O2 = (${o2Pct} / 100) × ${pTotalAtm.toFixed(1)} atm = ${pO2} atm.`,
          workedSolution: `1. Mole fraction of O₂: X_O₂ = ${o2Pct}% / 100% = ${xO2.toFixed(2)}.\n2. Dalton's Law: P_O₂ = X_O₂ × P_total = ${xO2.toFixed(2)} × ${pTotalAtm.toFixed(1)} atm = ${pO2} atm.`
        });
      }

      // --- Skill 6, Problem 12: Gas Collection Over Water & Vapor Pressure (Calculation - 5 attempts) ---
      {
        const vMl = rng.int(120, 280);
        const vL = vMl / 1000.0;
        const tC = rng.pick([20, 22, 24, 26]);
        const tK = tC + 273.15;
        const waterVaporTable = { 20: 17.5, 22: 19.8, 24: 22.4, 26: 25.2 };
        const pWaterTorr = waterVaporTable[tC];
        const pTotalTorr = rng.int(752, 768);

        const pDryTorr = pTotalTorr - pWaterTorr;
        const pDryAtm = pDryTorr / 760.0;
        const R = 0.08206;
        const nMoles = (pDryAtm * vL) / (R * tK);
        const targetVal = parseFloat((nMoles * 1000).toFixed(2)); // in millimoles or decimal moles

        problems.push({
          id: 'p12_water_vapor_eudiometer_calc',
          num: 12,
          topic: 'Pneumatic Troughs: Water Vapor Pressure Correction',
          stem: `In an experimental eudiometer tube, a student collects <strong>${vMl} mL</strong> of oxygen gas over water at <strong>${tC} &deg;C</strong>. The barometric pressure in the laboratory is <strong>${pTotalTorr} torr</strong>.<br><br>At ${tC} &deg;C, the saturated vapor pressure of water is <strong>${pWaterTorr} torr</strong>.<br><br>First correct for water vapor to find the partial pressure of dry oxygen, then calculate the total quantity of dry O₂ gas collected in <strong>millimoles (mmol)</strong>, where $1\\text{ mol} = 1000\\text{ mmol}$.`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'mmol',
            tolerance: 0.03
          },
          placeholder: 'e.g. 5.25 mmol',
          hint1: 'Step 1: P_dry = P_total - P_water. Step 2: Convert P_dry to atm (torr / 760). Step 3: Solve n = (P_dry × V) / (R × T). Multiply moles by 1000 to get mmol.',
          hint2: `P_dry = ${pTotalTorr} - ${pWaterTorr} = ${pDryTorr} torr = ${pDryAtm.toFixed(3)} atm. V = ${vL.toFixed(3)} L, T = ${tK.toFixed(2)} K.`,
          workedSolution: `1. Partial pressure of dry O₂: P_dry = ${pTotalTorr} torr - ${pWaterTorr} torr = ${pDryTorr} torr = ${(pDryTorr / 760).toFixed(4)} atm.\n2. Ideal gas equation: n = (PV) / (RT) = (${(pDryTorr / 760).toFixed(4)} atm × ${vL.toFixed(3)} L) / (0.08206 × ${tK.toFixed(2)} K) = ${nMoles.toFixed(5)} mol.\n3. Convert to millimoles: ${nMoles.toFixed(5)} mol × 1000 = ${targetVal} mmol.`
        });
      }

      // --- Skill 7, Problem 13: Gas Stoichiometry at STP (Calculation - 5 attempts) ---
      {
        const massMg = rng.float(1.2, 4.8, 2);
        const mmMg = 24.305;
        const molesMg = massMg / mmMg;
        const volL = molesMg * 22.414;
        const targetVal = parseFloat(volL.toFixed(2));

        problems.push({
          id: 'p13_gas_stoich_stp_calc',
          num: 13,
          topic: 'Gas Stoichiometry: STP Molar Volume',
          stem: `Solid magnesium metal reacts completely with excess hydrochloric acid according to the single replacement reaction:<br><br>
          <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
            Mg(s) + 2 HCl(aq) &rarr; MgCl₂(aq) + H₂(g)
          </div>
          If <strong>${massMg.toFixed(2)} g</strong> of pure magnesium reacts completely, calculate the volume of hydrogen gas ($H_2$) produced in <strong>liters (L)</strong> at standard temperature and pressure (STP, 0 &deg;C and 1.000 atm, where $1\\text{ mol} = 22.414\\text{ L}$).`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'L',
            tolerance: 0.02
          },
          placeholder: 'e.g. 2.45 L',
          hint1: 'Step 1: Convert grams of Mg to moles (divide by 24.31 g/mol). Step 2: Use the 1:1 mole ratio of Mg to H₂. Step 3: Multiply moles of H₂ by 22.414 L/mol.',
          hint2: `Moles Mg = ${massMg.toFixed(2)} / 24.305 = ${molesMg.toFixed(3)} mol. Volume = ${molesMg.toFixed(3)} × 22.414 L/mol.`,
          workedSolution: `1. Moles of Mg: ${massMg.toFixed(2)} g / 24.305 g/mol = ${molesMg.toFixed(4)} mol.\n2. Mole ratio: 1 mol H₂ per 1 mol Mg → ${molesMg.toFixed(4)} mol H₂.\n3. Volume at STP: ${molesMg.toFixed(4)} mol × 22.414 L/mol = ${targetVal} L.`
        });
      }

      // --- Skill 7, Problem 14: Non-STP Gas Generation Stoichiometry (Calculation - 5 attempts) ---
      {
        const massCaH2 = rng.float(2.5, 7.5, 1);
        const mmCaH2 = 42.1;
        const molesCaH2 = massCaH2 / mmCaH2;
        const molesH2 = molesCaH2 * 2.0; // 1 CaH2 -> 2 H2

        const pAtm = rng.float(0.92, 1.04, 2);
        const tC = rng.int(21, 35);
        const tK = tC + 273.15;
        const R = 0.08206;

        const volH2 = (molesH2 * R * tK) / pAtm;
        const targetVal = parseFloat(volH2.toFixed(1));

        problems.push({
          id: 'p14_gas_stoich_non_stp_calc',
          num: 14,
          topic: 'Non-STP Gas Stoichiometry: Inflatable Raft Hydride Tablets',
          stem: `Military survival life rafts utilize solid calcium hydride ($CaH_2$, molar mass = 42.10 g/mol) tablets to rapidly generate hydrogen gas upon contact with seawater according to:<br><br>
          <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.95rem; text-align:center; margin-bottom:0.75rem;">
            CaH₂(s) + 2 H₂O(l) &rarr; Ca(OH)₂(s) + 2 H₂(g)
          </div>
          If a survival canister reacts <strong>${massCaH2.toFixed(1)} g</strong> of CaH₂ at an ambient temperature of <strong>${tC} &deg;C</strong> and pressure of <strong>${pAtm.toFixed(2)} atm</strong>, calculate the volume of hydrogen gas generated in <strong>liters (L)</strong>.`,
          type: 'calculation',
          maxAttempts: 5,
          expected: {
            value: targetVal,
            unit: 'L',
            tolerance: 0.03
          },
          placeholder: 'e.g. 12.8 L',
          hint1: 'Step 1: Convert grams of CaH₂ to moles. Step 2: Use the 1:2 mole ratio to find moles of H₂. Step 3: Solve for volume using V = (nRT) / P.',
          hint2: `Moles CaH₂ = ${massCaH2.toFixed(1)} / 42.10 = ${molesCaH2.toFixed(3)} mol. Moles H₂ = 2 × ${molesCaH2.toFixed(3)} = ${molesH2.toFixed(3)} mol. T = ${tK.toFixed(2)} K.`,
          workedSolution: `1. Moles CaH₂: ${massCaH2.toFixed(1)} g / 42.10 g/mol = ${molesCaH2.toFixed(4)} mol.\n2. Moles H₂ generated: 2 × ${molesCaH2.toFixed(4)} mol = ${molesH2.toFixed(4)} mol.\n3. Non-STP Volume: V = (nRT) / P = (${molesH2.toFixed(4)} mol × 0.08206 × ${tK.toFixed(2)} K) / ${pAtm.toFixed(2)} atm = ${targetVal} L.`
        });
      }

      // --- Skill 8, Problem 15: Real Gas Deviations from Ideality (MCQ - 3 attempts) ---
      {
        const correct = 'At low temperatures, slow-moving particles feel intermolecular attractions; at high pressures, particle volume becomes a significant fraction of total container space.';
        const distractors = [
          'At high temperatures, molecules move so quickly that their nuclear charges invert, destroying Coulombic forces.',
          'At low pressures, gas particles cluster together and freeze into permanent solid crystals along the vessel floor.',
          'Real gases deviate only when exposed to magnetic fields because electrons align in parallel spin orbitals.'
        ];
        const options = rng.shuffle([correct, ...distractors]);

        problems.push({
          id: 'p15_real_vs_ideal_mcq',
          num: 15,
          topic: 'Real Gas Behavior: Van der Waals Deviations',
          stem: 'Under what physical conditions do real gases deviate most severely from the predictions of the Ideal Gas Law ($PV = nRT$), and why?',
          type: 'mcq',
          maxAttempts: 3,
          options: options,
          expectedOption: correct,
          hint1: 'Ideal behavior requires zero particle volume and zero intermolecular attractions.',
          hint2: 'Think about what conditions force particles very close together or slow them down enough for attractions to matter.',
          explanation: 'Real gases deviate from ideal behavior at LOW temperature and HIGH pressure. At high pressures, gas particles are forced close together so their finite volume is no longer negligible compared to the container volume. At low temperatures, particles move with low kinetic energy, allowing intermolecular attractions (van der Waals forces) to pull particles together and reduce collision force against the walls.'
        });
      }

      // --- Skill 8, Problem 16: Graham's Law Molecular Effusion / Velocity Ranking (Ranking - 3 attempts) ---
      {
        const gasPool = [
          { id: 'gas_he', title: 'Helium (He)', formula: 'He', molarMass: 4.003, note: 'M = 4.00 g/mol' },
          { id: 'gas_ne', title: 'Neon (Ne)', formula: 'Ne', molarMass: 20.18, note: 'M = 20.18 g/mol' },
          { id: 'gas_n2', title: 'Nitrogen (N₂)', formula: 'N₂', molarMass: 28.01, note: 'M = 28.01 g/mol' },
          { id: 'gas_ar', title: 'Argon (Ar)', formula: 'Ar', molarMass: 39.95, note: 'M = 39.95 g/mol' },
          { id: 'gas_co2', title: 'Carbon Dioxide (CO₂)', formula: 'CO₂', molarMass: 44.01, note: 'M = 44.01 g/mol' },
          { id: 'gas_so2', title: 'Sulfur Dioxide (SO₂)', formula: 'SO₂', molarMass: 64.07, note: 'M = 64.07 g/mol' }
        ];

        // Pick 4 distinct gases
        const picked = rng.shuffle(gasPool).slice(0, 4);
        // Correct order: increasing effusion rate (slowest/heaviest to fastest/lightest)
        const sortedBySpeed = [...picked].sort((a, b) => b.molarMass - a.molarMass);
        const correctOrder = sortedBySpeed.map((g) => g.id);
        const shuffledCards = rng.shuffle(picked);

        problems.push({
          id: 'p16_grahams_law_ranking',
          num: 16,
          topic: "Graham's Law: Effusion Rate & Molecular Velocity Ranking",
          stem: `According to <strong>Graham's Law of Effusion</strong>, the relative rate of effusion of a gas through a pinhole aperture is inversely proportional to the square root of its molar mass ($r \\propto 1/\\sqrt{M}$).<br><br>Arrange the following four gases in order of <strong>increasing effusion rate</strong> (from slowest effusion rate at #1 to fastest effusion rate at #4) at identical temperature and pressure.`,
          type: 'ranking',
          maxAttempts: 3,
          cards: shuffledCards,
          correctOrder: correctOrder,
          hint1: "Lighter molecules effuse and diffuse faster than heavier molecules at the same temperature. Heaviest gas is slowest (#1); lightest gas is fastest (#4).",
          hint2: `Compare molar masses: ${sortedBySpeed.map((g) => `${g.formula} (${g.molarMass} g/mol)`).join(' > ')}.`,
          workedSolution: `1. Graham's Law: Effusion rate is inversely proportional to the square root of molar mass (rate ∝ 1/√M).\n2. Rank from heaviest to lightest (slowest to fastest):\n${sortedBySpeed.map((g, idx) => `   #${idx + 1}: ${g.title} (${g.molarMass} g/mol)`).join('\n')}.`
        });
      }

      return problems;
    }
  }

  // ============================================================
  // 5. XL CHEM STATION CONTROLLER CLASS (UNIT 8)
  // ============================================================
  class XLChemStation {
    constructor() {
      this.unit = 8;
      this.maxAttempts = 5;

      const urlParams = new URLSearchParams(window.location.search);
      const studentParam = urlParams.get('student');
      const runParam = parseInt(urlParams.get('run'), 10);
      const seedParam = urlParams.get('seed');

      this.run = !isNaN(runParam) && runParam > 0 ? runParam : 1;
      this.studentName = studentParam ? studentParam.trim() : localStorage.getItem('xl_chem_student_name') || '';

      if (seedParam) {
        this.seed = seedParam.trim();
      } else {
        this.seed = this.computeSeed();
      }

      this.rng = new SeededRNG(this.seed);
      this.generator = new Unit8DeckGenerator(this.rng);
      this.problems = this.generator.generateDeck();

      this.currentStatus = {};
      this.initDOMElements();
      this.initTheme();
      this.initReferenceCenter();
      this.initCalculator();
      this.initStudentProfile();
      this.loadSavedState();
      this.renderDeck();
    }

    computeSeed() {
      const cleanName = (this.studentName || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '');
      const seedBase = `${cleanName}-u8`;
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
      this.generator = new Unit8DeckGenerator(this.rng);
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
              <div class="solution-body">${prob.workedSolution.replace(/\n/g, '<br>')}</div>
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
        if (i <= state.attempts) {
          cls += state.solved && i === state.attempts ? ' solved' : ' used';
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
          return `
            <label class="mcq-option ${isSelected ? 'selected' : ''}">
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
                <div class="ranking-note">${card.note}</div>
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
        <div class="ranking-container" id="ranking_${prob.id}">
          <div class="ranking-list" id="rankingList_${prob.id}">
            ${cardsHTML}
          </div>
          ${
            !disabled
              ? `
            <div style="margin-top:1rem; display:flex; justify-content:flex-end;">
              <button class="btn btn-primary btn-sm btn-submit-ranking" data-prob="${prob.id}">Check Ranking Order</button>
            </div>
          `
              : ''
          }
        </div>
      `;
    }

    bindCardEvents(card, prob, state) {
      // 1. MCQ Radio Selection & Submit
      if (prob.type === 'mcq') {
        const labels = card.querySelectorAll('.mcq-option');
        labels.forEach((label) => {
          label.addEventListener('click', () => {
            if (state.solved || state.exhausted) return;
            labels.forEach((l) => l.classList.remove('selected'));
            label.classList.add('selected');
            const radio = label.querySelector('input');
            if (radio) radio.checked = true;
          });
        });

        const submitBtn = card.querySelector('.btn-submit-mcq');
        if (submitBtn) {
          submitBtn.addEventListener('click', () => {
            const checked = card.querySelector(`input[name="opt_${prob.id}"]:checked`);
            if (!checked) {
              alert('Please select an option first.');
              return;
            }
            this.handleAnswerCheck(prob, checked.value);
          });
        }
      }

      // 2. Calculation Submit
      if (prob.type === 'calculation') {
        const input = card.querySelector(`#in_${prob.id}`);
        const submitBtn = card.querySelector('.btn-submit-calc');

        if (input && submitBtn) {
          input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submitBtn.click();
            }
          });
          submitBtn.addEventListener('click', () => {
            const val = input.value.trim();
            this.handleAnswerCheck(prob, val);
          });
        }
      }

      // 3. Ranking Movement & Submit
      if (prob.type === 'ranking') {
        const currentOrder = state.rankingOrder || prob.cards.map((c) => c.id);

        const bindButtons = () => {
          const upBtns = card.querySelectorAll('.btn-rank-up');
          const downBtns = card.querySelectorAll('.btn-rank-down');

          upBtns.forEach((btn) => {
            btn.onclick = () => {
              const idx = parseInt(btn.dataset.idx, 10);
              if (idx > 0) {
                const temp = currentOrder[idx];
                currentOrder[idx] = currentOrder[idx - 1];
                currentOrder[idx - 1] = temp;
                state.rankingOrder = currentOrder;
                this.refreshRankingList(card, prob, state);
              }
            };
          });

          downBtns.forEach((btn) => {
            btn.onclick = () => {
              const idx = parseInt(btn.dataset.idx, 10);
              if (idx < currentOrder.length - 1) {
                const temp = currentOrder[idx];
                currentOrder[idx] = currentOrder[idx + 1];
                currentOrder[idx + 1] = temp;
                state.rankingOrder = currentOrder;
                this.refreshRankingList(card, prob, state);
              }
            };
          });
        };

        bindButtons();

        const submitBtn = card.querySelector('.btn-submit-ranking');
        if (submitBtn) {
          submitBtn.addEventListener('click', () => {
            this.handleAnswerCheck(prob, currentOrder);
          });
        }
      }
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

      this.bindCardEvents(card, prob, state);
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
          state.feedback = 'Correct! Outstanding conceptual gas dynamics reasoning.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect choice. ${hint}`;
        }
      } else if (prob.type === 'ranking') {
        const submitted = Array.isArray(rawInput) ? rawInput : state.rankingOrder;
        state.userEntry = submitted.join(', ');
        const isMatch = submitted.every((id, idx) => id === prob.correctOrder[idx]);

        if (isMatch) {
          state.solved = true;
          state.score = 1;
          state.feedback = "Correct! Molar mass ordering accurately predicts relative molecular velocities.";
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
        state.feedback += ' Attempts exhausted. Study the step-by-step worked solution below.';
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
          <div>1st Ionization: <b>${elem.ie} kJ/mol</b></div>
          <div>Electronegativity: <b>${elem.en !== null ? elem.en.toFixed(2) : 'N/A'}</b></div>
        </div>
      `;
    }

    initCalculator() {
      const calcGrid = document.getElementById('calcGrid');
      if (!calcGrid) return;

      const keys = calcGrid.querySelectorAll('.calc-btn');
      keys.forEach((key) => {
        key.addEventListener('click', () => {
          const action = key.dataset.key;
          this.handleCalcKey(action);
        });
      });

      const handle = document.getElementById('calcDragHandle');
      if (handle && this.elCalcWidget) {
        let isDragging = false;
        let startY = 0;
        let startTop = 0;

        handle.addEventListener('mousedown', (e) => {
          isDragging = true;
          startY = e.clientY;
          startTop = this.elCalcWidget.offsetTop;
          document.body.style.userSelect = 'none';
        });

        window.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          const dy = e.clientY - startY;
          this.elCalcWidget.style.top = `${Math.max(60, startTop + dy)}px`;
        });

        window.addEventListener('mouseup', () => {
          isDragging = false;
          document.body.style.userSelect = '';
        });
      }
    }

    handleCalcKey(action) {
      if (action === 'clear') {
        this.calcBuffer = '';
      } else if (action === 'del') {
        this.calcBuffer = this.calcBuffer.slice(0, -1);
      } else if (action === '=') {
        try {
          let expr = this.calcBuffer
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/ee/gi, '*10**');
          if (!/^[0-9+\-*/().eMath* ]+$/.test(expr)) {
            throw new Error('Invalid');
          }
          const res = Function(`'use strict'; return (${expr})`)();
          this.calcBuffer = String(Number(res.toFixed(6)));
        } catch {
          this.calcBuffer = 'Error';
        }
      } else if (action === 'sqrt') {
        this.calcBuffer += 'sqrt(';
      } else if (action === 'pm') {
        if (this.calcBuffer.startsWith('-')) {
          this.calcBuffer = this.calcBuffer.slice(1);
        } else {
          this.calcBuffer = '-' + this.calcBuffer;
        }
      } else {
        this.calcBuffer += action;
      }

      if (this.elCalcExpr) this.elCalcExpr.textContent = this.calcBuffer;
      if (this.elCalcVal) this.elCalcVal.textContent = this.calcBuffer || '0';
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
        { name: 'Pressure Units & Barometry', ids: ['p1_pressure_units_calc', 'p2_barometer_manometer_mcq'] },
        { name: 'KMT & Molecular Velocity', ids: ['p3_kmt_postulates_mcq', 'p4_molecular_speed_calc'] },
        { name: 'Boyle, Charles & Gay-Lussac', ids: ['p5_boyles_law_calc', 'p6_charles_gaylussac_calc'] },
        { name: 'Combined Gas Law', ids: ['p7_combined_gas_calc', 'p8_collision_frequency_mcq'] },
        { name: 'Ideal Gas Law & Vapor Density', ids: ['p9_ideal_gas_calc', 'p10_gas_density_molar_mass_calc'] },
        { name: "Dalton's Law & Water Vapor", ids: ['p11_daltons_law_calc', 'p12_water_vapor_eudiometer_calc'] },
        { name: 'Gas Stoichiometry (STP & Non-STP)', ids: ['p13_gas_stoich_stp_calc', 'p14_gas_stoich_non_stp_calc'] },
        { name: 'Real Gases & Effusion Rates', ids: ['p15_real_vs_ideal_mcq', 'p16_grahams_law_ranking'] }
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
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 8:</b> Gases &amp; Pressure &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
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
          <b>Unit 8 Quick Reference Key:</b> 1.000 atm = 760 mmHg = 101.325 kPa = 14.7 psi &middot; T(K) = T(&deg;C) + 273.15 &middot; P₁V₁ = P₂V₂ &middot; V₁/T₁ = V₂/T₂ &middot; P₁V₁/T₁ = P₂V₂/T₂ &middot; PV = nRT (R = 0.08206 L&middot;atm/(mol&middot;K)) &middot; P_total = P_A + P_B + ... &middot; r₁/r₂ = &radic;(M₂/M₁)
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_pressure_units_calc') return 'Pressure unit conversion dimensional analysis';
      if (p.id === 'p2_barometer_manometer_mcq') return 'Torricellian barometer atmospheric equilibrium';
      if (p.id === 'p3_kmt_postulates_mcq') return 'Kinetic Molecular Theory ideal gas postulates';
      if (p.id === 'p4_molecular_speed_calc') return 'Root-mean-square molecular velocity';
      if (p.id === 'p5_boyles_law_calc') return "Boyle's law isothermal compression";
      if (p.id === 'p6_charles_gaylussac_calc') return 'Thermal expansion Charles or Gay-Lussac';
      if (p.id === 'p7_combined_gas_calc') return 'Combined gas law stratospheric balloon shift';
      if (p.id === 'p8_collision_frequency_mcq') return 'Microscopic collision frequency and momentum';
      if (p.id === 'p9_ideal_gas_calc') return 'Ideal gas equation PV = nRT canister pressure';
      if (p.id === 'p10_gas_density_molar_mass_calc') return 'Dumas bulb volatile liquid vapor molar mass';
      if (p.id === 'p11_daltons_law_calc') return "Dalton's law of partial pressures in Trimix";
      if (p.id === 'p12_water_vapor_eudiometer_calc') return 'Eudiometer gas collection over water';
      if (p.id === 'p13_gas_stoich_stp_calc') return 'Gas reaction stoichiometry at STP';
      if (p.id === 'p14_gas_stoich_non_stp_calc') return 'Calcium hydride non-STP gas generation';
      if (p.id === 'p15_real_vs_ideal_mcq') return 'Real gas deviations at low T and high P';
      if (p.id === 'p16_grahams_law_ranking') return "Graham's law effusion rate molecular speed ranking";
      return 'Unit 8 practice item';
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
