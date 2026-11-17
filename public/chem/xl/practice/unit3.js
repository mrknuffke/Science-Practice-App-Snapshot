/**
 * unit3.js - XL Chemistry Practice Suite: Unit 3 (Chemical Bonding & IMFs)
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
  const UNIT3_SKILLS = [
    { num: 1, title: 'Bond Classification & Physical Properties', problems: [1, 2], lesson: 'Lesson 1-2a' },
    { num: 2, title: 'Electronegativity & Bond Character', problems: [3, 4], lesson: 'Lesson 1-2a' },
    { num: 3, title: 'Lewis Structures & Electron Counting', problems: [5, 6], lesson: 'Lesson 1-3a' },
    { num: 4, title: 'VSEPR Theory & Molecular Geometry', problems: [7, 8], lesson: 'Lesson 1-3a' },
    { num: 5, title: 'Bond Dipoles & Molecular Polarity', problems: [9, 10], lesson: 'Lesson 1-2b' },
    { num: 6, title: 'Intermolecular Forces Identification', problems: [11, 12], lesson: 'Lesson 1-3b' },
    { num: 7, title: 'IMF Strength & Physical Property Trends', problems: [13, 14], lesson: 'Lesson 1-3b' },
    { num: 8, title: 'Biochemical Drug Design & Body Materials', problems: [15, 16], lesson: 'Lesson 1-3b' }
  ];

  // Pool 1: Experimental Substance Property Classification (MCQ)
  const BOND_CLASSIFICATION_SCENARIOS = [
    {
      substance: 'Substance Alpha',
      realName: 'copper(II) sulfide (CuS)',
      props: 'Melting point: 507 °C; brittle crystalline solid; does not conduct electricity as a solid; conducts electricity when dissolved in water or melted.',
      correct: 'Ionic compound (rigid crystal lattice of cations and anions held by coulombic electrostatic forces).',
      distractors: [
        'Covalent molecular compound (discrete molecules held together primarily by weak intermolecular attractions).',
        'Metallic solid (positive atomic cores submerged in a freely mobile and delocalized sea of valence electrons).',
        'Covalent network solid (continuous three-dimensional lattice of atoms covalently bonded throughout).'
      ],
      hint1: 'Electrical conductivity that appears only in aqueous solution or molten state is the classic signature of mobile ions.',
      hint2: 'Covalent molecules remain non-conductive when dissolved, and metals conduct in the solid state.',
      explanation: 'CuS is an ionic compound. In solid form, ions are locked in a lattice; when dissolved or melted, ions become freely mobile charge carriers.'
    },
    {
      substance: 'Substance Beta',
      realName: 'nitrogen triiodide (NI₃)',
      props: 'Melting point: decomposes at 20 °C; soft solid; non-conductive as a solid, liquid, and in solution; insoluble in water.',
      correct: 'Covalent molecular compound (discrete molecules held together primarily by weak intermolecular attractions).',
      distractors: [
        'Ionic compound (rigid crystal lattice of cations and anions held by coulombic electrostatic forces).',
        'Metallic solid (positive atomic cores submerged in a freely mobile and delocalized sea of valence electrons).',
        'Covalent network solid (continuous three-dimensional lattice of atoms covalently bonded throughout).'
      ],
      hint1: 'Non-metals bonded together produce discrete molecules with low thermal stability and zero conductivity.',
      hint2: 'Both N and I are electronegative non-metals sharing electron pairs.',
      explanation: 'NI₃ is a covalent molecular compound composed of non-metals. It has low melting stability and does not conduct electricity in any state.'
    },
    {
      substance: 'Substance Gamma',
      realName: 'monel alloy (Cu₃Ni)',
      props: 'Melting point: 1300 °C; malleable and ductile lustrous solid; excellent electrical and thermal conductivity as a solid; insoluble in water.',
      correct: 'Metallic solid (positive atomic cores submerged in a freely mobile and delocalized sea of valence electrons).',
      distractors: [
        'Ionic compound (rigid crystal lattice of cations and anions held by coulombic electrostatic forces).',
        'Covalent molecular compound (discrete molecules held together primarily by weak intermolecular attractions).',
        'Covalent network solid (continuous three-dimensional lattice of atoms covalently bonded throughout).'
      ],
      hint1: 'Solid-state electrical conductivity combined with malleability is unique to metallic bonding.',
      hint2: 'Copper and nickel are transition metals with low electronegativities that pool their valence electrons.',
      explanation: 'Cu₃Ni is a metallic alloy. Delocalized valence electrons move freely across the lattice, conducting electric currents in the solid state.'
    },
    {
      substance: 'Substance Delta',
      realName: 'xenon tetrafluoride (XeF₄)',
      props: 'Sublimes at 117 °C; soft white crystalline solid; completely non-conductive as a solid and in non-aqueous solution.',
      correct: 'Covalent molecular compound (discrete molecules held together primarily by weak intermolecular attractions).',
      distractors: [
        'Ionic compound (rigid crystal lattice of cations and anions held by coulombic electrostatic forces).',
        'Metallic solid (positive atomic cores submerged in a freely mobile and delocalized sea of valence electrons).',
        'Covalent network solid (continuous three-dimensional lattice of atoms covalently bonded throughout).'
      ],
      hint1: 'Low sublimation temperature indicates that only weak intermolecular forces must be overcome to separate molecules.',
      hint2: 'Electrons are localized in covalent bonds and lone pairs, so no mobile charge carriers exist.',
      explanation: 'XeF₄ forms discrete molecular units. Overcoming weak London dispersion forces allows sublimation at low temperatures without electrical conductivity.'
    }
  ];

  // Pool 2: Conductivity & Phase Behavior (MCQ)
  const CONDUCTIVITY_PHASE_SCENARIOS = [
    {
      set: 'KCl, CO₂, and Ag',
      stem: 'Consider three representative substances: potassium chloride (KCl), carbon dioxide (CO₂), and metallic silver (Ag). Which substance conducts electricity in the solid state, and what structural feature accounts for this behavior?',
      correct: 'Ag conducts in the solid state because valence electrons are delocalized in a mobile electron sea.',
      distractors: [
        'KCl conducts in the solid state because potassium and chlorine ions transfer electrons continuously.',
        'CO₂ conducts in the solid state because carbon and oxygen form mobile shared covalent double bonds.',
        'Both KCl and Ag conduct as solids because both substances contain positively charged metal nuclei.'
      ],
      hint1: 'In solid KCl, ions are locked tightly into place and cannot migrate.',
      hint2: 'Metals possess delocalized valence electrons that flow through the lattice when a voltage is applied.',
      explanation: 'Silver (Ag) is a metal with delocalized valence electrons that flow under an applied electric field. Solid KCl ions are immobilized, and CO₂ has localized molecular orbitals.'
    },
    {
      set: 'KCl, CO₂, and Ag',
      stem: 'Among potassium chloride (KCl), carbon dioxide (CO₂), and silver (Ag), which substance will conduct electricity when dissolved in water, and why?',
      correct: 'KCl, because dissolving dissociates the ionic lattice into freely mobile hydrated cations and anions.',
      distractors: [
        'Ag, because metallic cations break free from the crystal and carry electrons across the water.',
        'CO₂, because covalent molecules readily dissociate into mobile carbon and oxygen ions in solution.',
        'None of these substances conduct in water because pure water is an absolute electrical insulator.'
      ],
      hint1: 'Dissolving a soluble ionic compound frees charged ions to migrate toward electrodes.',
      hint2: 'Soluble salts like KCl dissociate into K⁺ and Cl⁻ ions in aqueous solution.',
      explanation: 'KCl dissolves in water to release mobile K⁺ and Cl⁻ ions, forming an electrolytic solution. Ag is insoluble, and dissolved CO₂ remains predominantly molecular.'
    },
    {
      set: 'MgO, Cu, and CH₄',
      stem: 'Comparing magnesium oxide (MgO), copper (Cu), and methane (CH₄), which substance exhibits the lowest boiling point, and what explains this property?',
      correct: 'CH₄, because boiling requires overcoming only weak London dispersion intermolecular forces.',
      distractors: [
        'MgO, because ionic bonds are readily ruptured by modest thermal kinetic energy additions.',
        'Cu, because the delocalized electron sea offers zero resistance to thermal vapor expansion.',
        'CH₄, because the strong intramolecular C-H covalent bonds are severed at room temperature.'
      ],
      hint1: 'Phase changes in molecular substances do not break covalent bonds; they only overcome IMFs.',
      hint2: 'MgO has a high lattice energy (>2800 °C melting point) and Cu is a metallic solid.',
      explanation: 'Methane (CH₄) is a nonpolar molecular gas. Boiling merely overcomes weak London dispersion forces between molecules, requiring little energy (-161 °C).'
    }
  ];

  // Pool 4: Electron Behavior Models (MCQ)
  const ELECTRON_BEHAVIOR_MODELS = [
    {
      stem: 'How do valence electrons behave in a metallic solid compared to an ionic compound, and how does electronegativity explain this difference?',
      correct: 'Metal atoms have low electronegativities and pool electrons into a delocalized sea; ionic pairs have large ΔEN and transfer electrons.',
      distractors: [
        'Metal atoms have high electronegativities and lock electrons into tight bonds; ionic pairs have low ΔEN and share electrons.',
        'Both metallic and ionic compounds share valence electrons equally between adjacent atomic nuclei in localized pairs.',
        'Metals transfer electrons permanently to form discrete cations and anions; ionic salts share electrons in a delocalized cloud.'
      ],
      hint1: 'Low electronegativity means an atom does not hold its valence electrons tightly.',
      hint2: 'When ΔEN is large, the more electronegative atom captures valence electrons completely.',
      explanation: 'Metal atoms have low electronegativity, allowing valence electrons to delocalize into a shared sea. In ionic compounds, large ΔEN drives complete valence electron transfer.'
    },
    {
      stem: 'In a covalent bond between two non-metal atoms with similar high electronegativities, how do valence electrons behave?',
      correct: 'Both atoms attract valence electrons strongly, resulting in shared electron density in overlapping atomic orbitals.',
      distractors: [
        'The atom with slightly higher atomic mass pulls all electrons away, creating an electrostatic lattice.',
        'Electrons leave the atomic orbitals entirely and circulate freely as a conduction sea around the nuclei.',
        'The atoms repel each other electrostatically until all valence electrons are ejected into the surrounding medium.'
      ],
      hint1: 'Covalent bonding occurs when both atoms fight for electrons with comparable high electronegativity.',
      hint2: 'Neither atom can pull electrons away entirely, leading to shared orbital overlap.',
      explanation: 'High, similar electronegativities cause both non-metal atoms to attract valence electrons without complete transfer, resulting in shared electron pairs.'
    }
  ];

  // Pool 6: Lewis Structure Features & Electron Transfer (MCQ)
  const LEWIS_STRUCTURE_SCENARIOS = [
    {
      compound: 'MgO',
      stem: 'An ionic compound forms between magnesium (Mg) and oxygen (O). How do valence electrons behave during bond formation, and how is this represented in a Lewis formulation?',
      correct: 'Mg transfers 2 valence electrons to O, forming Mg²⁺ and [ :O: ]²⁻ with a complete valence octet.',
      distractors: [
        'Mg and O share two pairs of valence electrons in a localized double covalent bond with zero formal charge.',
        'Oxygen transfers 2 valence electrons to magnesium, forming an O²⁺ cation and an [ :Mg: ]²⁻ anion.',
        'Mg and O pool their combined 8 valence electrons into a delocalized conduction sea between two neutral atoms.'
      ],
      hint1: 'Magnesium is an alkaline earth metal (Group 2) and oxygen is a chalcogen (Group 16).',
      hint2: 'Mg loses 2 electrons to achieve neon core stability; O gains 2 electrons to complete its octet.',
      explanation: 'Magnesium transfers its two 3s valence electrons to oxygen. This produces an Mg²⁺ cation and an [ :O: ]²⁻ anion with eight valence dots in brackets.'
    },
    {
      compound: 'NCl₃',
      stem: 'In the correct Lewis dot structure for nitrogen trichloride (NCl₃), what is the arrangement of valence electron pairs around the central nitrogen atom?',
      correct: '3 single covalent bonds to chlorine atoms and 1 non-bonding lone pair on the central nitrogen atom.',
      distractors: [
        '3 single covalent bonds to chlorine atoms and 0 non-bonding lone pairs on the central nitrogen atom.',
        '1 triple covalent bond to one chlorine atom and 2 non-bonding lone pairs on the central nitrogen atom.',
        '3 double covalent bonds to chlorine atoms, expanding the central nitrogen valence shell to 12 electrons.'
      ],
      hint1: 'Total valence electrons = 5 (N) + 3×7 (Cl) = 26 electrons.',
      hint2: 'Single bonds to three Cl atoms use 6 electrons. Completing chlorine octets uses 18 electrons, leaving 2 for N.',
      explanation: 'NCl₃ has 26 valence electrons. Nitrogen forms three single bonds to Cl (6 e⁻), three lone pairs on each Cl (18 e⁻), leaving 1 lone pair (2 e⁻) on nitrogen.'
    },
    {
      compound: 'CO₂',
      stem: 'In the valid Lewis structure of carbon dioxide (CO₂), how are valence electrons distributed between the carbon and oxygen atoms to satisfy the octet rule?',
      correct: 'Carbon forms two double bonds with oxygen; each oxygen possesses two non-bonding lone pairs.',
      distractors: [
        'Carbon forms two single bonds with oxygen; carbon retains two non-bonding lone pairs on its central atom.',
        'Carbon forms one single bond and one triple bond with oxygen; neither oxygen atom retains lone pairs.',
        'Carbon transfers all 4 valence electrons to oxygen, producing a C⁴⁺ cation surrounded by two O²⁻ anions.'
      ],
      hint1: 'Total valence electrons = 4 (C) + 2×6 (O) = 16 electrons.',
      hint2: 'To give carbon an octet without formal charges, each C-O interaction must be a double bond.',
      explanation: 'CO₂ has 16 valence electrons. Two C=O double bonds (8 e⁻) and two lone pairs on each oxygen (8 e⁻) satisfy the octet rule on all atoms with zero formal charges.'
    }
  ];

  // Pool 7: VSEPR Molecular Geometry (MCQ)
  const VSEPR_GEOMETRY_SCENARIOS = [
    {
      molecule: 'CCl₄',
      stem: 'According to VSEPR theory, what is the three-dimensional molecular geometry of carbon tetrachloride (CCl₄)?',
      correct: 'Tetrahedral (4 bonding domains and 0 non-bonding lone pairs on the central carbon atom).',
      distractors: [
        'Square planar (4 bonding domains arranged symmetrically in a single two-dimensional plane).',
        'Trigonal pyramidal (3 bonding domains pushed downward by 1 non-bonding lone pair on carbon).',
        'Trigonal planar (3 bonding domains spaced at 120-degree angles around the central carbon atom).'
      ],
      hint1: 'Count electron domains around carbon: 4 single bonds, zero lone pairs.',
      hint2: 'Four equivalent domains minimize electrostatic repulsion at 109.5-degree angles in three dimensions.',
      explanation: 'Carbon has 4 bonding electron domains and 0 lone pairs. VSEPR theory dictates a tetrahedral geometry with bond angles of 109.5°.'
    },
    {
      molecule: 'PCl₃',
      stem: 'According to VSEPR theory, what is the three-dimensional molecular geometry of phosphorus trichloride (PCl₃)?',
      correct: 'Trigonal pyramidal (3 bonding domains and 1 non-bonding lone pair on the central phosphorus atom).',
      distractors: [
        'Trigonal planar (3 bonding domains spaced symmetrically at 120-degree angles in a flat plane).',
        'Tetrahedral (4 bonding domains distributed symmetrically around the central phosphorus atom).',
        'T-shaped (3 bonding domains arranged perpendicularly with 2 non-bonding lone pairs).'
      ],
      hint1: 'Phosphorus (Group 15) has 5 valence electrons: 3 are shared in bonds, leaving 1 non-bonding lone pair.',
      hint2: 'Steric number 4 with 1 lone pair produces a trigonal pyramid.',
      explanation: 'PCl₃ has 4 electron domains (3 single bonds + 1 lone pair on P). The lone pair repels bonding pairs, producing a trigonal pyramidal shape with ~107° angles.'
    },
    {
      molecule: 'SCl₂',
      stem: 'According to VSEPR theory, what is the molecular geometry of sulfur dichloride (SCl₂)?',
      correct: 'Bent (2 bonding domains and 2 non-bonding lone pairs on the central sulfur atom).',
      distractors: [
        'Linear (2 bonding domains arranged directly opposite each other at an angle of 180 degrees).',
        'Trigonal planar (3 electron domains oriented symmetrically in a two-dimensional flat plane).',
        'Tetrahedral (4 equivalent bonding domains distributed symmetrically around the sulfur nucleus).'
      ],
      hint1: 'Sulfur has 6 valence electrons: 2 bonded to chlorine, leaving 4 non-bonding electrons (2 lone pairs).',
      hint2: 'Steric number 4 with 2 lone pairs produces a bent shape analogous to water.',
      explanation: 'SCl₂ has 4 electron domains on sulfur: 2 single bonds and 2 lone pairs. The two lone pairs repel the bonding pairs, creating a bent molecular geometry (~104.5°).'
    },
    {
      molecule: 'CS₂',
      stem: 'According to VSEPR theory, what is the molecular geometry of carbon disulfide (CS₂)?',
      correct: 'Linear (2 double-bond domains and 0 non-bonding lone pairs on the central carbon atom).',
      distractors: [
        'Bent (2 bonding domains repelled by non-bonding lone pairs on the central carbon atom).',
        'Trigonal planar (3 electron domains arranged symmetrically at 120-degree bond angles).',
        'Tetrahedral (4 electron domains distributed three-dimensionally around the carbon atom).'
      ],
      hint1: 'Carbon forms two double bonds (S=C=S) and has no lone pairs.',
      hint2: 'Two electron domains maximize distance at 180 degrees.',
      explanation: 'CS₂ has 2 electron domains on central carbon (two double bonds) and 0 lone pairs. Minimal repulsion occurs at 180°, yielding a linear geometry.'
    },
    {
      molecule: 'BF₃',
      stem: 'According to VSEPR theory, what is the molecular geometry of boron trifluoride (BF₃)?',
      correct: 'Trigonal planar (3 bonding domains and 0 non-bonding lone pairs on the central boron atom).',
      distractors: [
        'Trigonal pyramidal (3 bonding domains repelled downward by a lone pair on the boron atom).',
        'T-shaped (3 bonding domains oriented perpendicularly with 2 non-bonding lone pairs).',
        'Tetrahedral (4 electron domains distributed three-dimensionally around the central atom).'
      ],
      hint1: 'Boron (Group 13) has 3 valence electrons, all used in three B-F single bonds.',
      hint2: 'Three domains with zero lone pairs form a flat 120-degree triangle.',
      explanation: 'BF₃ has 3 electron domains and 0 lone pairs on central boron. Electron repulsion is minimized in a flat triangle with 120° bond angles (trigonal planar).'
    }
  ];

  // Pool 9: Molecular Polarity & Dipole Symmetry (MCQ)
  const POLARITY_SYMMETRY_SCENARIOS = [
    {
      molecule: 'CCl₄',
      stem: 'Individual C-Cl bonds in carbon tetrachloride (CCl₄) have an electronegativity difference of 0.61 and are distinctly polar. Why is a CCl₄ molecule as a whole completely nonpolar?',
      correct: 'The tetrahedral geometry is completely symmetric, so the four bond dipole vectors cancel out.',
      distractors: [
        'Chlorine atoms transfer their excess valence electrons back to carbon, neutralizing all dipoles.',
        'Carbon and chlorine have identical electronegativities in a multi-atomic molecule, preventing dipoles.',
        'Non-bonding lone pairs on the chlorine atoms pull outward with equal force, destroying all covalent bonds.'
      ],
      hint1: 'Polarity depends on both bond dipoles and three-dimensional geometric symmetry.',
      hint2: 'Four identical dipoles pointing to the vertices of a regular tetrahedron sum vectorially to zero.',
      explanation: 'In CCl₄, the four polar C-Cl bonds point toward the corners of a regular tetrahedron. Due to high symmetry, the dipole vectors cancel completely, yielding a nonpolar molecule.'
    },
    {
      molecule: 'PCl₃ vs CCl₄',
      stem: 'Both CCl₄ and PCl₃ contain polar bonds to chlorine atoms. Why is PCl₃ a polar molecule with a net dipole moment, whereas CCl₄ is nonpolar?',
      correct: 'PCl₃ has an asymmetric trigonal pyramidal shape with a lone pair, preventing dipole cancellation.',
      distractors: [
        'Phosphorus has a much higher electronegativity than chlorine, completely reversing the bond dipole.',
        'CCl₄ possesses polar bonds that are significantly weaker than the polar bonds in PCl₃.',
        'PCl₃ contains ionic bonds between phosphorus and chlorine, whereas CCl₄ has nonpolar covalent bonds.'
      ],
      hint1: 'A lone pair on the central atom disrupts geometric symmetry.',
      hint2: 'In PCl₃, bond dipoles point toward the chlorines and do not cancel because of the pyramidal geometry.',
      explanation: 'PCl₃ has a non-bonding lone pair on phosphorus, giving it a trigonal pyramidal geometry. Because the dipoles do not cancel in 3D space, PCl₃ has a permanent net molecular dipole.'
    },
    {
      molecule: 'CO₂ vs SO₂',
      stem: 'Carbon dioxide (CO₂) and sulfur dioxide (SO₂) both contain polar bonds to oxygen. Why is CO₂ nonpolar while SO₂ is polar?',
      correct: 'CO₂ is linear and its dipoles cancel; SO₂ is bent due to a central lone pair, so dipoles do not cancel.',
      distractors: [
        'CO₂ contains nonpolar bonds, whereas SO₂ contains ionic bonds between sulfur and oxygen.',
        'Sulfur has a higher electronegativity than carbon, pulling electrons away from oxygen atoms.',
        'Oxygen atoms in CO₂ do not possess lone pairs, preventing the formation of temporary dipoles.'
      ],
      hint1: 'Look at the shape: linear vs bent.',
      hint2: 'In linear CO₂, two equal C=O dipoles point 180° apart and cancel. In bent SO₂, dipoles reinforce.',
      explanation: 'CO₂ is linear (180°), so the two equal C=O dipoles cancel completely. SO₂ has a lone pair on sulfur, creating a bent shape where the S-O dipoles reinforce to give a net dipole.'
    }
  ];

  // Pool 11: Intermolecular Forces Identification (MCQ)
  const IMF_IDENTIFICATION_SCENARIOS = [
    {
      substance: 'hydrogen sulfide (H₂S)',
      stem: 'What intermolecular forces of attraction are present between molecules in a sample of pure hydrogen sulfide (H₂S)?',
      correct: 'London dispersion forces and dipole-dipole attractions.',
      distractors: [
        'London dispersion forces, dipole-dipole attractions, and hydrogen bonding.',
        'London dispersion forces only (H₂S is a completely nonpolar symmetric molecule).',
        'Intramolecular ionic lattice attractions and hydrogen bonding.'
      ],
      hint1: 'H₂S is bent and polar, so dipole-dipole forces exist.',
      hint2: 'Hydrogen bonding only occurs when H is bonded directly to N, O, or F. Sulfur does not qualify.',
      explanation: 'H₂S has a bent geometry and is polar, so it exhibits permanent dipole-dipole attractions as well as universal London dispersion forces. It cannot hydrogen bond because H is bonded to S.'
    },
    {
      substance: 'water (H₂O)',
      stem: 'What intermolecular forces of attraction exist between molecules in a sample of pure liquid water (H₂O)?',
      correct: 'London dispersion forces, dipole-dipole attractions, and hydrogen bonding.',
      distractors: [
        'Hydrogen bonding only (water molecules do not exhibit London dispersion attractions).',
        'London dispersion forces and dipole-dipole attractions only (H₂O cannot hydrogen bond).',
        'Intramolecular covalent bonds and metallic lattice conduction forces.'
      ],
      hint1: 'All molecules have London dispersion forces.',
      hint2: 'Water is polar (dipole-dipole) and has H directly bonded to highly electronegative O (hydrogen bonding).',
      explanation: 'Water exhibits London dispersion forces (all molecules), dipole-dipole forces (polar molecule), and hydrogen bonding (H directly bonded to O).'
    },
    {
      substance: 'benzene (C₆H₆)',
      stem: 'What intermolecular forces of attraction are present between molecules in a sample of pure liquid benzene (C₆H₆)?',
      correct: 'London dispersion forces only (benzene is nonpolar and symmetrical).',
      distractors: [
        'London dispersion forces and permanent dipole-dipole attractions.',
        'London dispersion forces, dipole-dipole attractions, and hydrogen bonding.',
        'Intramolecular ionic lattice attractions and electrostatic ion-dipole forces.'
      ],
      hint1: 'Hydrocarbons consisting only of C and H with symmetric planar rings are nonpolar.',
      hint2: 'Nonpolar molecules experience only London dispersion forces.',
      explanation: 'Benzene is a nonpolar hydrocarbon. The only intermolecular forces operating between benzene molecules are London dispersion forces caused by temporary electron cloud polarizability.'
    },
    {
      substance: 'ammonia (NH₃)',
      stem: 'What intermolecular forces of attraction operate between molecules in a sample of pure liquid ammonia (NH₃)?',
      correct: 'London dispersion forces, dipole-dipole attractions, and hydrogen bonding.',
      distractors: [
        'London dispersion forces and dipole-dipole attractions only (NH₃ cannot hydrogen bond).',
        'London dispersion forces only (ammonia has symmetrical nonpolar covalent bonds).',
        'Intramolecular ionic attractions and delocalized metallic bonding.'
      ],
      hint1: 'Ammonia has H directly bonded to N, one of the three elements that enable hydrogen bonding (N, O, F).',
      hint2: 'All molecules also possess London dispersion forces, and polar molecules possess dipole-dipole attractions.',
      explanation: 'NH₃ is polar and has H bonded directly to N. Therefore, it exhibits London dispersion forces, dipole-dipole attractions, and strong hydrogen bonding.'
    },
    {
      substance: 'phosphine (PH₃)',
      stem: 'What intermolecular forces of attraction operate between molecules in a sample of pure liquid phosphine (PH₃)?',
      correct: 'London dispersion forces and dipole-dipole attractions.',
      distractors: [
        'London dispersion forces, dipole-dipole attractions, and hydrogen bonding.',
        'London dispersion forces only (PH₃ has a completely nonpolar planar geometry).',
        'Hydrogen bonding only (hydrogen is bonded to a Group 15 pnictogen atom).'
      ],
      hint1: 'Phosphorus is in Group 15 below nitrogen, but hydrogen bonding is restricted to N, O, and F.',
      hint2: 'PH₃ is polar with a trigonal pyramidal geometry.',
      explanation: 'PH₃ is polar (trigonal pyramidal) and exhibits dipole-dipole attractions and London dispersion forces. It does not form hydrogen bonds because P is not sufficiently electronegative.'
    }
  ];

  // Pool 12: Intramolecular Bonds vs Intermolecular Attractions (MCQ)
  const INTRA_VS_INTER_SCENARIOS = [
    {
      stem: 'When a beaker of liquid water is heated to 100 °C and boils into steam, what changes occur at the subatomic and molecular scales?',
      correct: 'Intermolecular hydrogen bonds and dipole forces are overcome; intramolecular covalent O-H bonds remain intact.',
      distractors: [
        'Intramolecular covalent O-H bonds break, separating water into discrete hydrogen and oxygen atoms.',
        'Both intermolecular hydrogen bonds and intramolecular covalent O-H bonds are completely severed.',
        'Water molecules break into H⁺ and OH⁻ ions which evaporate as free ionic charges in the gas phase.'
      ],
      hint1: 'Boiling is a physical phase change, not a chemical decomposition.',
      hint2: 'Steam consists of intact H₂O molecules separated by large distances.',
      explanation: 'During boiling, thermal energy overcomes intermolecular attractions (hydrogen bonds) between water molecules. The strong covalent O-H bonds within each molecule remain intact.'
    },
    {
      stem: 'How do intramolecular chemical bonds compare to intermolecular forces of attraction in terms of strength and function?',
      correct: 'Intramolecular bonds are much stronger and hold atoms together within molecules; IMFs are weaker attractions between molecules.',
      distractors: [
        'Intermolecular forces are much stronger than intramolecular bonds and require thousands of kJ/mol to break.',
        'Intramolecular bonds and intermolecular attractions have identical energies and both break during phase changes.',
        'Intramolecular bonds operate only between separate molecules, while intermolecular forces hold nuclei together.'
      ],
      hint1: 'Intramolecular bonds (covalent, ionic) require hundreds of kJ/mol; IMFs require only tens of kJ/mol.',
      hint2: 'Intramolecular bonds determine chemical identity; IMFs determine boiling point and state of matter.',
      explanation: 'Intramolecular bonds (covalent, ionic) are strong chemical bonds (~150 to 800 kJ/mol) within compounds. IMFs (LDFs, dipole-dipole, H-bonds) are weaker attractions (~1 to 40 kJ/mol) between molecules.'
    }
  ];

  // Pool 13: IMF Strength & Physical Property Comparisons (MCQ)
  const IMF_BULK_PROPERTY_SCENARIOS = [
    {
      pair: 'Cl₂ vs Br₂',
      stem: 'Diatomic chlorine (Cl₂) is a gas at room temperature, while diatomic bromine (Br₂) is a liquid with a significantly higher boiling point. What explains this difference?',
      correct: 'Br₂ has a larger electron cloud with greater polarizability, resulting in much stronger London dispersion forces.',
      distractors: [
        'Br₂ possesses permanent dipole-dipole attractions and hydrogen bonding that are completely absent in Cl₂.',
        'The covalent Br-Br bond is much stronger than the Cl-Cl bond, requiring more thermal energy to rupture.',
        'Bromine atoms have a higher electronegativity than chlorine atoms, creating stronger ionic attractions.'
      ],
      hint1: 'Both Cl₂ and Br₂ are nonpolar diatomic molecules, so both experience only London dispersion forces.',
      hint2: 'Br₂ has 70 electrons compared to 34 in Cl₂. More electrons mean greater polarizability.',
      explanation: 'Both are nonpolar halogens. Br₂ has 70 electrons versus 34 in Cl₂, making its electron cloud more polarizable. This produces stronger temporary dipoles and higher boiling points.'
    },
    {
      pair: 'NH₃ vs PH₃',
      stem: 'Ammonia (NH₃) has a normal boiling point of -33 °C, whereas phosphine (PH₃) boils at -88 °C, despite PH₃ having a larger molar mass. What accounts for this difference?',
      correct: 'NH₃ molecules form strong intermolecular hydrogen bonds, which require substantial energy to overcome.',
      distractors: [
        'PH₃ is nonpolar and has zero dipole-dipole attractions, whereas NH₃ is an ionic salt.',
        'The covalent P-H bonds in phosphine are significantly weaker and decompose before boiling.',
        'Ammonia exhibits vastly stronger London dispersion forces because nitrogen has more total electrons than phosphorus.'
      ],
      hint1: 'Nitrogen is small and highly electronegative; phosphorus is larger and less electronegative.',
      hint2: 'Hydrogen bonding occurs in NH₃ because H is bonded directly to N.',
      explanation: 'NH₃ forms strong intermolecular hydrogen bonds (H bonded to N). PH₃ cannot hydrogen bond because P is less electronegative and larger, so PH₃ boils at a much lower temperature.'
    },
    {
      pair: 'ICl vs Br₂',
      stem: 'Iodine monochloride (ICl) and bromine (Br₂) have nearly identical molar masses (~160-162 g/mol), yet ICl boils at 97 °C while Br₂ boils at 59 °C. What explains the higher boiling point of ICl?',
      correct: 'ICl is polar and has permanent dipole-dipole attractions, whereas Br₂ is nonpolar with only LDFs.',
      distractors: [
        'ICl forms extensive intermolecular hydrogen bonding networks between iodine and chlorine atoms.',
        'The covalent bond inside ICl is broken during vaporization, whereas Br₂ molecules remain intact.',
        'Bromine is an ionic solid at room temperature that rapidly sublimes without liquid phase stability.'
      ],
      hint1: 'Compare electronegativities: I is 2.66, Cl is 3.16. Br-Br has ΔEN = 0.',
      hint2: 'ICl has a permanent dipole moment; Br₂ is nonpolar.',
      explanation: 'Because ICl contains different halogens with ΔEN = 0.50, it is polar and exhibits permanent dipole-dipole attractions in addition to LDFs. Nonpolar Br₂ has only LDFs.'
    },
    {
      pair: 'H₂O vs H₂S vs C₂H₆',
      stem: 'Among water (H₂O), hydrogen sulfide (H₂S), and ethane (C₂H₆), which substance has the highest boiling point and surface tension, and why?',
      correct: 'H₂O, because an extensive three-dimensional network of intermolecular hydrogen bonds holds molecules together.',
      distractors: [
        'H₂S, because sulfur is larger than oxygen and generates overwhelming London dispersion forces.',
        'C₂H₆, because nonpolar hydrocarbon molecules interlock mechanically to resist thermal vapor transition.',
        'All three substances have identical boiling points because they all contain two hydrogen atoms per molecule.'
      ],
      hint1: 'Look at the IMFs: H₂O has hydrogen bonding; H₂S has dipole-dipole; C₂H₆ has only weak LDFs.',
      hint2: 'Hydrogen bonds in water create strong intermolecular cohesion and high surface tension.',
      explanation: 'Water molecules form up to 4 hydrogen bonds per molecule in an extensive network. This gives water exceptionally high boiling point, surface tension, and heat of vaporization.'
    }
  ];

  // ============================================================
  // 5. PROBLEM GENERATION ENGINE
  // ============================================================
  class Unit3DeckGenerator {
    constructor(rng) {
      this.rng = rng;
    }

    generateDeck() {
      return [
        this.genProblem1_BondClassLabMCQ(this.rng),
        this.genProblem2_ConductivityPhaseMCQ(this.rng),
        this.genProblem3_DeltaENCalc(this.rng),
        this.genProblem4_ElectronBehaviorModelsMCQ(this.rng),
        this.genProblem5_ValenceElectronCountCalc(this.rng),
        this.genProblem6_LewisDotFeaturesMCQ(this.rng),
        this.genProblem7_VSEPRGeometryMCQ(this.rng),
        this.genProblem8_BondAngleCompressionCalc(this.rng),
        this.genProblem9_PolaritySymmetryMCQ(this.rng),
        this.genProblem10_BondPolarityRanking(this.rng),
        this.genProblem11_IMFIdentificationMCQ(this.rng),
        this.genProblem12_IntraVsInterForcesMCQ(this.rng),
        this.genProblem13_BulkPropertyIMFMCQ(this.rng),
        this.genProblem14_IMFEnergyRatioCalc(this.rng),
        this.genProblem15_IVSolubilityCalc(this.rng),
        this.genProblem16_SilaIbuprofenMechanismMCQ(this.rng)
      ];
    }

    // --- Problem 1: Bond Classification from Experimental Observations (MCQ - 3 attempts) ---
    genProblem1_BondClassLabMCQ(rng) {
      const scenario = rng.pick(BOND_CLASSIFICATION_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p1_bond_class_lab_mcq',
        num: 1,
        topic: 'Bond Classification: Macroscopic Evidence',
        stem: `In an analytical chemistry laboratory, a student tests an unlabelled solid sample, <strong>${scenario.substance}</strong>, and records the following physical properties:<br><br>
        <div style="padding:0.6rem 0.8rem; background:rgba(0,0,0,0.03); border-left:3px solid var(--xl-primary); border-radius:4px; font-family:var(--font-mono); font-size:0.85rem; margin-bottom:0.75rem;">
          ${scenario.props}
        </div>
        Based on these experimental observations, which bonding category best classifies this substance?`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 2: Substance Conductivity & Phase Behavior (MCQ - 3 attempts) ---
    genProblem2_ConductivityPhaseMCQ(rng) {
      const scenario = rng.pick(CONDUCTIVITY_PHASE_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p2_conductivity_phase_mcq',
        num: 2,
        topic: 'Physical Properties: Electrical Conductivity & Phase Change',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 3: Electronegativity Difference (ΔEN) Calculation (Calculation - 5 attempts) ---
    genProblem3_DeltaENCalc(rng) {
      const bondPairs = [
        { elemA: 'Sodium (Na)', enA: 0.93, elemB: 'Chlorine (Cl)', enB: 3.16, bondName: 'Na-Cl', bondType: 'ionic' },
        { elemA: 'Lithium (Li)', enA: 0.98, elemB: 'Bromine (Br)', enB: 2.96, bondName: 'Li-Br', bondType: 'ionic' },
        { elemA: 'Magnesium (Mg)', enA: 1.31, elemB: 'Oxygen (O)', enB: 3.44, bondName: 'Mg-O', bondType: 'ionic' },
        { elemA: 'Carbon (C)', enA: 2.55, elemB: 'Hydrogen (H)', enB: 2.20, bondName: 'C-H', bondType: 'nonpolar covalent' },
        { elemA: 'Silicon (Si)', enA: 1.90, elemB: 'Hydrogen (H)', enB: 2.20, bondName: 'Si-H', bondType: 'nonpolar covalent' },
        { elemA: 'Silicon (Si)', enA: 1.90, elemB: 'Carbon (C)', enB: 2.55, bondName: 'Si-C', bondType: 'polar covalent' },
        { elemA: 'Nitrogen (N)', enA: 3.04, elemB: 'Oxygen (O)', enB: 3.44, bondName: 'N-O', bondType: 'polar covalent' },
        { elemA: 'Nitrogen (N)', enA: 3.04, elemB: 'Hydrogen (H)', enB: 2.20, bondName: 'N-H', bondType: 'polar covalent' },
        { elemA: 'Carbon (C)', enA: 2.55, elemB: 'Oxygen (O)', enB: 3.44, bondName: 'C-O', bondType: 'polar covalent' }
      ];

      const item = rng.pick(bondPairs);
      const deltaEN = parseFloat(Math.abs(item.enA - item.enB).toFixed(2));

      return {
        id: 'p3_delta_en_calc',
        num: 3,
        topic: 'Electronegativity Difference & Bond Character',
        stem: `Using Pauling electronegativity values from the Reference Center (${item.elemA}: <strong>${item.enA}</strong>; ${item.elemB}: <strong>${item.enB}</strong>), calculate the absolute electronegativity difference (<strong>ΔEN = |EN_A - EN_B|</strong>) for a <strong>${item.bondName}</strong> bond. Enter your numeric answer as a decimal value (e.g. <code>1.24</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: deltaEN,
          tolerance: 0.02
        },
        placeholder: 'e.g. 1.24',
        hint1: 'Subtract the smaller electronegativity from the larger electronegativity: |EN_A - EN_B|.',
        hint2: `Compute |${item.enA} - ${item.enB}| = ${deltaEN}.`,
        workedSolution: `1. Pauling values: EN(${item.elemA}) = ${item.enA}, EN(${item.elemB}) = ${item.enB}.\n2. ΔEN = |${item.enA} - ${item.enB}| = ${deltaEN}.\n3. Bond character: A ΔEN of ${deltaEN} classifies this bond as ${item.bondType}.`
      };
    }

    // --- Problem 4: Subatomic Electron Behavior Models (MCQ - 3 attempts) ---
    genProblem4_ElectronBehaviorModelsMCQ(rng) {
      const scenario = rng.pick(ELECTRON_BEHAVIOR_MODELS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p4_electron_behavior_mcq',
        num: 4,
        topic: 'Electron Distribution Models: Sea vs Transfer vs Sharing',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 5: Valence Electron Bookkeeping (Calculation - 5 attempts) ---
    genProblem5_ValenceElectronCountCalc(rng) {
      const molecules = [
        { name: 'nitrogen trichloride (NCl₃)', formula: 'NCl₃', calc: '5 + 3(7)', count: 26 },
        { name: 'carbon dioxide (CO₂)', formula: 'CO₂', calc: '4 + 2(6)', count: 16 },
        { name: 'chlorite ion (ClO₂⁻)', formula: 'ClO₂⁻', calc: '7 + 2(6) + 1', count: 20 },
        { name: 'sulfur difluoride (SF₂)', formula: 'SF₂', calc: '6 + 2(7)', count: 20 },
        { name: 'acetylene (C₂H₂)', formula: 'C₂H₂', calc: '2(4) + 2(1)', count: 10 },
        { name: 'sulfate ion (SO₄²⁻)', formula: 'SO₄²⁻', calc: '6 + 4(6) + 2', count: 32 },
        { name: 'nitrate ion (NO₃⁻)', formula: 'NO₃⁻', calc: '5 + 3(6) + 1', count: 24 },
        { name: 'phosphate ion (PO₄³⁻)', formula: 'PO₄³⁻', calc: '5 + 4(6) + 3', count: 32 },
        { name: 'ammonium ion (NH₄⁺)', formula: 'NH₄⁺', calc: '5 + 4(1) - 1', count: 8 }
      ];

      const item = rng.pick(molecules);

      return {
        id: 'p5_valence_count_calc',
        num: 5,
        topic: 'Valence Electron Bookkeeping: Lewis Formulations',
        stem: `Determine the total number of valence electrons available to build the Lewis dot structure for <strong>${item.name}</strong> (${item.formula}). Be sure to account for all constituent atoms and any ionic net charge. Enter your answer as a whole number (e.g. <code>8</code> or <code>8 electrons</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: item.count,
          tolerance: 0.001
        },
        placeholder: 'e.g. 8 or 8 electrons',
        hint1: 'Sum the valence electrons contributed by each atom based on its periodic group number.',
        hint2: 'Remember: add 1 electron for each negative charge; subtract 1 electron for each positive charge.',
        workedSolution: `Bookkeeping: ${item.calc} = ${item.count} total valence electrons.`
      };
    }

    // --- Problem 6: Lewis Structure Features & Electron Transfer (MCQ - 3 attempts) ---
    genProblem6_LewisDotFeaturesMCQ(rng) {
      const scenario = rng.pick(LEWIS_STRUCTURE_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p6_lewis_dot_features_mcq',
        num: 6,
        topic: 'Lewis Dot Diagrams: Bonding & Octet Fulfillment',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 7: VSEPR Molecular Geometry Determination (MCQ - 3 attempts) ---
    genProblem7_VSEPRGeometryMCQ(rng) {
      const scenario = rng.pick(VSEPR_GEOMETRY_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p7_vsepr_geometry_mcq',
        num: 7,
        topic: 'VSEPR Theory: 3D Molecular Geometry Prediction',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 8: Bond Angle Compression Quantification (Calculation - 5 attempts) ---
    genProblem8_BondAngleCompressionCalc(rng) {
      const modes = [
        {
          name: 'water (H₂O)',
          formula: 'H₂O',
          lonePairs: 2,
          ideal: 109.5,
          compression: 5.0,
          actual: 104.5,
          stem: 'In a water molecule (H₂O), the central oxygen atom is surrounded by 4 electron domains (2 bonding pairs and 2 non-bonding lone pairs). While the ideal tetrahedral bond angle is <strong>109.5°</strong>, each non-bonding lone pair exerts greater electrostatic repulsion, compressing the H-O-H bond angle by approximately <strong>2.5° per lone pair</strong>. Calculate the resulting H-O-H bond angle in degrees.'
        },
        {
          name: 'ammonia (NH₃)',
          formula: 'NH₃',
          lonePairs: 1,
          ideal: 109.5,
          compression: 2.5,
          actual: 107.0,
          stem: 'In an ammonia molecule (NH₃), the central nitrogen atom has 4 electron domains: 3 bonding pairs and 1 non-bonding lone pair. The ideal tetrahedral angle is <strong>109.5°</strong>. Because the unshared lone pair occupies more spatial volume and repels adjacent bonding pairs, the bond angle is compressed by approximately <strong>2.5°</strong>. Calculate the resulting H-N-H bond angle in degrees.'
        },
        {
          name: 'methane vs water comparison',
          formula: 'CH₄ vs H₂O',
          lonePairs: 2,
          ideal: 109.5,
          compression: 5.0,
          actual: 5.0,
          stem: 'Methane (CH₄, 0 lone pairs) has an ideal tetrahedral bond angle of <strong>109.5°</strong>. Water (H₂O, 2 lone pairs) has an observed bond angle of <strong>104.5°</strong>. Calculate the total angular compression (difference in degrees) caused by the two non-bonding lone pairs on oxygen.'
        }
      ];

      const item = rng.pick(modes);

      return {
        id: 'p8_bond_angle_compression_calc',
        num: 8,
        topic: 'VSEPR Bond Angles: Lone Pair Repulsion Compression',
        stem: `${item.stem} Enter your answer as a numeric value in degrees (e.g. <code>109.5 deg</code> or <code>109.5</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: item.actual,
          unit: 'deg',
          tolerance: 0.02
        },
        placeholder: 'e.g. 109.5 deg',
        hint1: 'Lone pairs repel more strongly than bonding pairs because they are held closer to a single nucleus.',
        hint2: `Ideal tetrahedral = 109.5°. Subtract (${item.lonePairs} lone pairs × 2.5°/pair) = ${item.actual}°.`,
        workedSolution: `1. Ideal tetrahedral angle: 109.5°.\n2. Compression per lone pair: ~2.5°.\n3. Result: 109.5° - (${item.lonePairs} × 2.5°) = ${item.actual}°.`
      };
    }

    // --- Problem 9: Dipole Vector Symmetry & Molecular Polarity (MCQ - 3 attempts) ---
    genProblem9_PolaritySymmetryMCQ(rng) {
      const scenario = rng.pick(POLARITY_SYMMETRY_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p9_polarity_symmetry_mcq',
        num: 9,
        topic: 'Molecular Polarity: Dipole Symmetry vs Net Polarity',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 10: Relative Bond Polarity Ranking (Ranking - 3 attempts) ---
    genProblem10_BondPolarityRanking(rng) {
      const cards = [
        { id: 'c_c', title: 'C-C Bond', note: 'ΔEN = |2.55 - 2.55| = 0.00 (Pure Nonpolar)' },
        { id: 'si_h', title: 'Si-H Bond', note: 'ΔEN = |1.90 - 2.20| = 0.30 (Weakly Polar)' },
        { id: 'c_h', title: 'C-H Bond', note: 'ΔEN = |2.55 - 2.20| = 0.35 (Nonpolar Covalent)' },
        { id: 'si_c', title: 'Si-C Bond', note: 'ΔEN = |1.90 - 2.55| = 0.65 (Polar Covalent)' }
      ];

      const correctOrder = ['c_c', 'si_h', 'c_h', 'si_c'];
      const shuffledCards = rng.shuffle(cards);

      return {
        id: 'p10_bond_polarity_ranking',
        num: 10,
        topic: 'Bond Dipole Ranking: Electronegativity Difference',
        stem: 'In the medicinal chemistry investigation of ibuprofen versus sila-ibuprofen, biochemists analyze the four distinct chemical bonds found around the central quaternary core. Using the Pauling electronegativities from your Reference Center (C = 2.55, H = 2.20, Si = 1.90), arrange these chemical bonds in order of <strong>increasing relative polarity</strong> (from lowest ΔEN at #1 to highest ΔEN at #4).',
        type: 'ranking',
        maxAttempts: 3,
        cards: shuffledCards,
        correctOrder: correctOrder,
        hint1: 'Calculate ΔEN = |EN_A - EN_B| for each bond pair.',
        hint2: 'C-C is 0.00; Si-H is 0.30; C-H is 0.35; Si-C is 0.65.',
        workedSolution: '1. C-C: ΔEN = 0.00\n2. Si-H: ΔEN = |1.90 - 2.20| = 0.30\n3. C-H: ΔEN = |2.55 - 2.20| = 0.35\n4. Si-C: ΔEN = |1.90 - 2.55| = 0.65.\nCorrect order: C-C < Si-H < C-H < Si-C.'
      };
    }

    // --- Problem 11: Intermolecular Forces Identification (MCQ - 3 attempts) ---
    genProblem11_IMFIdentificationMCQ(rng) {
      const scenario = rng.pick(IMF_IDENTIFICATION_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p11_imf_identification_mcq',
        num: 11,
        topic: 'Intermolecular Forces: Complete IMF Identification',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 12: Intramolecular Bonds vs Intermolecular Attractions (MCQ - 3 attempts) ---
    genProblem12_IntraVsInterForcesMCQ(rng) {
      const scenario = rng.pick(INTRA_VS_INTER_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p12_intra_vs_inter_mcq',
        num: 12,
        topic: 'Intramolecular vs Intermolecular Forces: Scale & Behavior',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 13: IMF Strength & Physical Property Comparisons (MCQ - 3 attempts) ---
    genProblem13_BulkPropertyIMFMCQ(rng) {
      const scenario = rng.pick(IMF_BULK_PROPERTY_SCENARIOS);
      const options = rng.shuffle([scenario.correct, ...scenario.distractors]);

      return {
        id: 'p13_bulk_property_imf_mcq',
        num: 13,
        topic: 'Bulk Properties: Boiling Points, Vapor Pressure & Polarizability',
        stem: scenario.stem,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: scenario.correct,
        hint1: scenario.hint1,
        hint2: scenario.hint2,
        workedSolution: scenario.explanation
      };
    }

    // --- Problem 14: IMF Energy vs Intramolecular Covalent Bond Energy (Calculation - 5 attempts) ---
    genProblem14_IMFEnergyRatioCalc(rng) {
      const covalentBondEnergy = 463; // kJ/mol for O-H
      const hBondEnthalpyVap = 40.7; // kJ/mol for water vaporization
      const ratio = parseFloat((covalentBondEnergy / hBondEnthalpyVap).toFixed(1));

      return {
        id: 'p14_imf_energy_ratio_calc',
        num: 14,
        topic: 'Quantitative Energy Comparison: Intramolecular vs Intermolecular',
        stem: `In thermochemical investigations, completely breaking 1 mole of intramolecular covalent <strong>O-H bonds</strong> in gaseous water requires <strong>${covalentBondEnergy} kJ/mol</strong>. In contrast, overcoming the intermolecular hydrogen bonding network to vaporize 1 mole of liquid water into steam (ΔH_vap) requires only <strong>${hBondEnthalpyVap} kJ/mol</strong>. Calculate the factor (ratio) by which the intramolecular covalent bond is stronger than the intermolecular vaporization enthalpy. Enter your answer as a decimal ratio (e.g. <code>11.5</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: ratio,
          tolerance: 0.03
        },
        placeholder: 'e.g. 11.5',
        hint1: 'Divide the intramolecular bond energy (463 kJ/mol) by the vaporization enthalpy (40.7 kJ/mol).',
        hint2: `${covalentBondEnergy} / ${hBondEnthalpyVap} = ${ratio}.`,
        workedSolution: `Ratio = (${covalentBondEnergy} kJ/mol) / (${hBondEnthalpyVap} kJ/mol) = ${ratio} times stronger.\nThis demonstrates quantitatively why boiling water into steam overcomes only intermolecular forces without cleaving covalent O-H bonds.`
      };
    }

    // --- Problem 15: Biochemical Drug Design: IV Saline Solubility (Calculation - 5 attempts) ---
    genProblem15_IVSolubilityCalc(rng) {
      const dosages = [250, 300, 350, 400, 500];
      const doseMg = rng.pick(dosages);
      const silaSolubility = 83; // mg/L
      const regularSolubility = 21; // mg/L

      const minVolumeL = parseFloat((doseMg / silaSolubility).toFixed(2));
      const regularVolumeL = parseFloat((doseMg / regularSolubility).toFixed(1));

      return {
        id: 'p15_iv_solubility_calc',
        num: 15,
        topic: 'Body Materials: Quantitative IV Drug Solubility & Saline Volume',
        stem: `In biomedical research on postoperative analgesics, biochemists synthesized <strong>sila-ibuprofen</strong> to bypass the severe gastric ulcers and kidney strain caused by chronic oral ibuprofen. Sila-ibuprofen has an aqueous solubility of <strong>${silaSolubility} mg/L</strong>, compared to only <strong>${regularSolubility} mg/L</strong> for conventional ibuprofen.<br><br>
        A patient recovering from anesthesia requires an intravenous (IV) prescription dose of <strong>${doseMg} mg</strong> of sila-ibuprofen. Calculate the minimum volume of sterile aqueous saline in <strong>liters (L)</strong> required to completely dissolve this dose. Include units in your answer (e.g. <code>12.5 L</code>).`,
        type: 'calculation',
        maxAttempts: 5,
        expected: {
          value: minVolumeL,
          unit: 'l',
          tolerance: 0.03
        },
        placeholder: 'e.g. 12.5 L',
        hint1: 'Volume (L) = Prescribed Dose (mg) / Aqueous Solubility (mg/L).',
        hint2: `Divide ${doseMg} mg by ${silaSolubility} mg/L = ${minVolumeL} L.`,
        workedSolution: `1. Volume for Sila-ibuprofen: ${doseMg} mg / ${silaSolubility} mg/L = ${minVolumeL} L.\n2. Comparison: Conventional ibuprofen would require ${doseMg} mg / ${regularSolubility} mg/L = ${regularVolumeL} L of fluid, which would cause life-threatening fluid overload. Sila-ibuprofen's enhanced polarity makes IV administration clinically viable.`
      };
    }

    // --- Problem 16: Structure-Function Mechanism of Sila-Ibuprofen (MCQ - 3 attempts) ---
    genProblem16_SilaIbuprofenMechanismMCQ(rng) {
      const correct = 'Silicon has a lower electronegativity (1.90) than carbon (2.55), creating polar Si-C bonds that introduce an asymmetric dipole and enhance polar water hydration.';
      const distractors = [
        'Silicon has a higher electronegativity than carbon, allowing it to pull electrons completely away and form an insoluble ionic lattice.',
        'Silicon donates four valence electrons to nearby water molecules, undergoing rapid oxidation that destroys the drug structure.',
        'Silicon increases the overall molecular mass, allowing London dispersion forces to mechanically fuse the drug into blood plasma.'
      ];

      const options = rng.shuffle([correct, ...distractors]);

      return {
        id: 'p16_sila_ibuprofen_mechanism_mcq',
        num: 16,
        topic: 'Medicinal Chemistry: Atomic Polarity & Drug Hydration',
        stem: `In the Journal of Medicinal Chemistry (Kleemiss et al.), researchers demonstrated that replacing a single carbon atom (C) with a silicon atom (Si) in ibuprofen increases aqueous solubility by nearly 400% (from 21 mg/L to 83 mg/L). At the atomic and subatomic scales, what structural mechanism accounts for this dramatic increase in solubility?`,
        type: 'mcq',
        maxAttempts: 3,
        options: options,
        expectedOption: correct,
        hint1: 'Compare electronegativities: C is 2.55, Si is 1.90. The Si-C bond has ΔEN = 0.65.',
        hint2: 'A localized dipole creates polar regions that interact strongly with polar water molecules through dipole-dipole attractions.',
        explanation: 'Silicon has a lower electronegativity (1.90) than carbon (2.55), making the four bonds around silicon polar. This breaks molecular symmetry and creates a localized dipole, allowing water molecules to form favorable hydration shells around the drug.'
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
      this.generator = new Unit3DeckGenerator(this.rng);
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
      const seedBase = `${cleanName}-u3`;
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
            this.generator = new Unit3DeckGenerator(this.rng);
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
      state.userEntry = current.join(' < ');

      if (isCorrect) {
        state.solved = true;
        state.score = 1;
        state.feedback = 'Correct! All four chemical bonds are arranged in the precise order of increasing polarity.';
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
          <div class="ptable-mass">${elem.en ? elem.en.toFixed(2) : 'N/A'}</div>
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
          <div>Pauling EN: <b>${elem.en !== null ? elem.en.toFixed(2) : 'N/A'}</b></div>
          <div>Period: <b>${elem.period}</b> | Group: <b>${elem.group}</b></div>
          <div>Valence: <b>${elem.valence || 'Var'}</b></div>
          <div>Atomic Radius: <b>${elem.radius} pm</b></div>
          <div>1st Ionization: <b>${elem.ie} kJ/mol</b></div>
          <div>Molar Mass: <b>${elem.mass.toFixed(3)} g/mol</b></div>
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

      // Build QR Code pointing to verify.html with unit=3
      const baseUrl =
        window.location.protocol === 'file:'
          ? 'verify.html'
          : window.location.origin + window.location.pathname.replace('unit3.html', 'verify.html');
      const verifyUrl = `${baseUrl}?unit=3&name=${encodeURIComponent(this.studentName)}&score=${totalScore}&total=${total}&seal=${sealCode}&att1=${firstTry}&att2=${secondTry}&att3=${thirdTry}&m=${exhaustedCount}&run=${this.run}`;
      const qrSVG = window.generateQRCodeSVG ? window.generateQRCodeSVG(verifyUrl, 54) : '';

      // Format 8-Skill Mastery Scorecard
      const skillCardsHTML = UNIT3_SKILLS.map((skill) => {
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
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 3:</b> Chemical Bonding &amp; IMFs &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
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
          <b>Unit 3 Quick Reference Key:</b> Nonpolar Covalent (ΔEN ≤ 0.4) &middot; Polar Covalent (0.5 ≤ ΔEN ≤ 1.7) &middot; Ionic (ΔEN &gt; 1.7) &middot; Tetrahedral (109.5°) &middot; Pyramidal (~107°) &middot; Bent (~104.5°) &middot; IMFs: LDF &lt; Dipole-Dipole &lt; H-Bonding (N, O, F)
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_bond_class_lab_mcq') return 'Laboratory physical property observations';
      if (p.id === 'p2_conductivity_phase_mcq') return 'Solid/liquid electrical conductivity test';
      if (p.id === 'p3_delta_en_calc') return 'Pauling electronegativity ΔEN calculation';
      if (p.id === 'p4_electron_behavior_mcq') return 'Delocalized sea vs transfer vs sharing';
      if (p.id === 'p5_valence_count_calc') return 'Valence electron count summation';
      if (p.id === 'p6_lewis_dot_features_mcq') return 'Octet rule & Lewis dot diagram features';
      if (p.id === 'p7_vsepr_geometry_mcq') return 'VSEPR 3D molecular shape determination';
      if (p.id === 'p8_bond_angle_compression_calc') return 'Lone pair repulsion angle compression';
      if (p.id === 'p9_polarity_symmetry_mcq') return 'Dipole symmetry cancellation analysis';
      if (p.id === 'p10_bond_polarity_ranking') return 'Relative bond polarity ΔEN ranking';
      if (p.id === 'p11_imf_identification_mcq') return 'Identification of all present IMFs';
      if (p.id === 'p12_intra_vs_inter_mcq') return 'Intramolecular bonds vs intermolecular forces';
      if (p.id === 'p13_bulk_property_imf_mcq') return 'Boiling point & vapor pressure trends';
      if (p.id === 'p14_imf_energy_ratio_calc') return 'Covalent bond vs IMF vaporization energy';
      if (p.id === 'p15_iv_solubility_calc') return 'Sila-ibuprofen IV saline volume calculation';
      if (p.id === 'p16_sila_ibuprofen_mechanism_mcq') return 'Silicon substitution polarity mechanism';
      return 'Unit 3 practice item';
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
