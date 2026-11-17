/**
 * unit1.js - XL Chemistry Practice Suite: Unit 1 (Atomic Structure & Trends)
 * Deterministic problem generator, seeded PRNG, attempt tracker,
 * live answer evaluation, and dual-purpose study report generator.
 *
 * Strict Zero Em-Dashes Invariant observed.
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
  // 2b. CANONICAL PERIODIC TABLE DATASET (Z = 1..36)
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
  // 3. CURATED DATA POOLS (8 SKILLS × 2 MODES = 16 ITEMS)
  // ============================================================

  const UNIT1_SKILLS = [
    { num: 1, title: 'Matter Classification & Particle Models', problems: [1, 2], lesson: 'Lesson 1-1' },
    { num: 2, title: 'Historical Atomic Models & Evidence', problems: [3, 4], lesson: 'Lesson 1-2a' },
    { num: 3, title: 'Subatomic Particles & Isotopic Notation', problems: [5, 6], lesson: 'Lesson 1-2b' },
    { num: 4, title: 'Average Atomic Mass & Mass Spectrometry', problems: [7, 8], lesson: 'Lesson 1-2c' },
    { num: 5, title: 'Light Equations & Photon Energy', problems: [9, 10], lesson: 'Lesson 1-2d' },
    { num: 6, title: 'Electron Configurations & Valence Shells', problems: [11, 12], lesson: 'Lesson 1-2e' },
    { num: 7, title: 'Periodic Trends & Coulombic Attraction', problems: [13, 14], lesson: 'Lesson 1-2f' },
    { num: 8, title: 'Periodic Families & Chemical Reactivity', problems: [15, 16], lesson: 'Lesson 1-2g' }
  ];

  // Skill 1, Item 1: Macroscopic Separation Scenarios (MCQ)
  const SEPARATION_SCENARIOS = [
    {
      context: 'Crude Oil Refining',
      stem: 'A petroleum refinery separates crude oil into gasoline, diesel, and kerosene by heating the mixture in a fractionating column. Which statement correctly identifies the type of mixture and the physical property exploited in this separation?',
      correct: 'Homogeneous mixture; separated by differences in boiling points.',
      distractors: [
        'Heterogeneous mixture; separated by differences in particle densities.',
        'Pure chemical compound; decomposed by breaking covalent bonds thermally.',
        'Homogeneous mixture; separated by differences in aqueous solubility.'
      ],
      hint1: 'Crude oil is a uniform liquid solution of hydrocarbons. Heating vaporizes compounds with weaker intermolecular forces at lower temperatures.',
      hint2: 'Fractional distillation separates components of a homogeneous mixture based on differences in their boiling points.',
      explanation: 'Crude oil is a homogeneous liquid mixture of hydrocarbons. Fractional distillation vaporizes and condenses components based on differences in their boiling points.'
    },
    {
      context: 'Paper Chromatography of Ink',
      stem: 'A forensic chemist spots a drop of black fountain pen ink on chromatography paper and places it in an ethanol solvent. Over time, three distinct colored bands (cyan, magenta, yellow) appear at different heights. What type of mixture is the ink, and what governs this separation?',
      correct: 'Homogeneous mixture; separated by differential affinity for mobile vs. stationary phase.',
      distractors: [
        'Heterogeneous suspension; separated by mechanical retention across cellulose fibers.',
        'Pure chemical compound; chemically split into three individual elements.',
        'Colloidal mixture; separated by differences in boiling point.'
      ],
      hint1: 'The ink is an evenly distributed solution of dyes. The liquid solvent moves up the paper by capillary action.',
      hint2: 'Solutes with stronger attraction to the mobile phase travel further than solutes with higher affinity for paper fibers.',
      explanation: 'Ink is a homogeneous mixture of soluble dyes. Separation occurs because each dye differs in its relative solubility in ethanol (mobile phase) versus adsorption to paper (stationary phase).'
    },
    {
      context: 'Gravimetric Precipitation Filtration',
      stem: 'A student mixes aqueous sodium chloride and silver nitrate, forming an insoluble white silver chloride precipitate suspended in aqueous sodium nitrate. The suspension is poured through porous filter paper. Which classification best describes this mixture and separation mechanism?',
      correct: 'Heterogeneous mixture; separated by mechanical retention based on particle size.',
      distractors: [
        'Homogeneous solution; separated by differences in vapor pressure.',
        'Homogeneous mixture; separated by differences in electrical conductivity.',
        'Pure chemical compound; decomposed into constituent ions by physical filtration.'
      ],
      hint1: 'The solid precipitate consists of undissolved particulate matter suspended in liquid water.',
      hint2: 'Filtration is a physical separation method where the pores in the filter paper retain solid particles while liquid passes through.',
      explanation: 'The suspension containing undissolved solid AgCl particles is a heterogeneous mixture. Filter paper allows the liquid filtrate to pass while trapping solid particles based on size.'
    },
    {
      context: 'Centrifugation of Blood',
      stem: 'A clinical laboratory spins a whole blood sample at 4000 rpm in a centrifuge, resulting in packed red blood cells at the bottom and clear yellowish plasma on top. How is whole blood classified, and what is the basis for this separation?',
      correct: 'Heterogeneous mixture; separated by differences in particle density under centrifugal acceleration.',
      distractors: [
        'Homogeneous solution; separated by differences in boiling points and vapor pressure under rapid rotation.',
        'Pure biochemical compound; cleaved into cellular and liquid components by mechanical shear forces.',
        'Homogeneous colloidal mixture; separated by differential capillary migration across the liquid column.'
      ],
      hint1: 'Whole blood contains cellular components suspended in liquid plasma that can be separated mechanically.',
      hint2: 'Centrifugation accelerates sedimentation based on differences in density.',
      explanation: 'Whole blood is a heterogeneous suspension of cellular matter in liquid plasma. Centrifugation rapidly separates components according to their distinct physical densities.'
    }
  ];

  // Skill 1, Item 2: Particle Model Classification
  const PARTICLE_SYSTEMS = [
    {
      type: 'element_diatomic',
      category: 'Pure Element',
      description: 'Diatomic element molecules (A₂)',
      particleCount: 6,
      atomsPerParticle: 2,
      hint: 'Notice that each molecule consists of two identical bonded atoms. All particles in the container are identical.',
      explanation: 'The container holds 6 diatomic molecules of a single pure element (such as O₂ or N₂). There is only one type of atom present.'
    },
    {
      type: 'compound_triatomic',
      category: 'Pure Compound',
      description: 'Triatomic compound molecules (AB₂)',
      particleCount: 5,
      atomsPerParticle: 3,
      hint: 'Every molecule consists of two different types of atoms bonded together in a fixed 1:2 ratio. All particles are identical.',
      explanation: 'The container holds 5 identical molecules of a pure compound (such as CO₂ or H₂O), each composed of two different elements in a fixed ratio.'
    },
    {
      type: 'mixture_elements',
      category: 'Mixture of Elements',
      description: 'Monatomic element atoms + diatomic element molecules',
      particleCount: 8,
      monoCount: 4,
      diaCount: 4,
      hint: 'Look closely at the particles: some are single atoms of one type, while others are bonded pairs of another type.',
      explanation: 'The container holds a mixture of two distinct elements: 4 single monatomic atoms (e.g. Ar) and 4 diatomic molecules (e.g. N₂), for a total of 8 independent particles.'
    },
    {
      type: 'mixture_element_compound',
      category: 'Mixture of Element and Compound',
      description: 'Diatomic element molecules + triatomic compound molecules',
      particleCount: 7,
      elementCount: 3,
      compoundCount: 4,
      hint: 'There are two different types of particles present: one is an elemental molecule (identical atoms) and the other is a compound (different atoms bonded together).',
      explanation: 'The container holds a mixture containing 3 diatomic element molecules and 4 triatomic compound molecules, totaling 7 independent particles.'
    }
  ];

  // Skill 2, Item 3: Historical Atomic Models (MCQ)
  const EXPERIMENT_SCENARIOS = [
    {
      title: "Rutherford's Alpha Scattering",
      stem: 'In the gold foil experiment, alpha particles (He²⁺ nuclei) were directed at a thin gold foil. While over 99% passed straight through undeflected, approximately 1 in 8,000 was deflected backward by angles greater than 90°. What fundamental conclusion did this observation require?',
      correct: 'The positive charge and nearly all mass are concentrated in an extremely small, dense central nucleus.',
      distractors: [
        'Electrons occupy quantized, circular energy levels at fixed orbital radii governed by discrete angular momentum.',
        'Positive charge and mass are uniformly dispersed throughout the entire atomic volume as a diffuse continuous matrix.',
        'Atoms of the same element contain variable numbers of uncharged nuclear neutrons that modify deflection trajectories.'
      ],
      hint1: 'If the atom had a diffuse positive charge like Thomson proposed, the alpha particles would have experienced minimal deflection.',
      hint2: 'Only a concentrated positive core containing virtually all the atomic mass could exert sufficient Coulombic repulsion to deflect a fast-moving alpha particle backward.',
      explanation: 'Large angle backward deflections demonstrated that the positive charge and virtually all mass are concentrated in an extremely dense, compact core: the atomic nucleus.'
    },
    {
      title: "Thomson's Cathode Ray Tube",
      stem: 'In 1897, J.J. Thomson observed that rays emitted from the cathode in an evacuated tube deflected toward a positively charged plate, regardless of which metal was used as the cathode. What crucial insight did this observation provide?',
      correct: 'Electrons are universal, negatively charged subatomic particles present in all atoms.',
      distractors: [
        'The atom consists of a dense, positively charged nucleus surrounded by an expansive volume of empty space.',
        'Electrons can only absorb or radiate electromagnetic energy when transitioning between discrete quantum orbitals.',
        'Atomic mass is primarily determined by the combined sum of positively charged nuclear protons and neutral neutrons.'
      ],
      hint1: 'Deflection toward a positive electrode indicates negative electrical charge.',
      hint2: 'Because identical rays were produced regardless of the metal electrode chosen, these particles must be a universal constituent of all matter.',
      explanation: 'Deflection toward the positive plate proved the negative charge of cathode rays, and their presence in all tested metals proved that electrons are fundamental subatomic particles in all matter.'
    },
    {
      title: "Millikan's Oil Drop Experiment",
      stem: 'Robert Millikan sprayed microscopic oil droplets into an electric field and adjusted the voltage until individual droplets were suspended motionless against gravity. What fundamental constant did this experiment determine?',
      correct: 'The fundamental unit of electric charge on a single electron.',
      distractors: [
        'The precise mass-to-charge ratio (e/m) of cathode ray particles.',
        'The speed and propagation wavelength of electromagnetic waves in a vacuum.',
        'The exact physical radius and spatial boundaries of the atomic nucleus.'
      ],
      hint1: 'At suspension, the downward gravitational force (mg) precisely equals the upward electrostatic force (qE).',
      hint2: 'Every suspended drop had a charge that was an integer multiple of 1.602 × 10⁻¹⁹ Coulombs.',
      explanation: 'Millikan discovered that all droplet charges were integer multiples of a single fundamental value: 1.602 × 10⁻¹⁹ C, determining the charge of a single electron.'
    }
  ];

  // Skill 2, Item 4: Historical Postulates & Scientists (Fill-in / Select)
  const SCIENTIST_POSTULATES = [
    {
      postulate: 'Proposed that electrons occupy quantized, concentric circular orbits around the nucleus and can only transition between orbits by absorbing or emitting photons of discrete energy.',
      scientist: 'Niels Bohr',
      aliases: ['bohr', 'niels bohr'],
      hint: 'This Danish physicist explained the discrete line emission spectrum of atomic hydrogen.',
      explanation: 'Niels Bohr introduced the quantized planetary model in 1913, explaining the hydrogen spectral lines.'
    },
    {
      postulate: 'Proposed the first modern atomic theory stating that elements consist of indivisible, indestructible spherical atoms that combine in fixed whole-number ratios to form compounds.',
      scientist: 'John Dalton',
      aliases: ['dalton', 'john dalton'],
      hint: 'This English chemist formulated the law of multiple proportions in the early 19th century.',
      explanation: 'John Dalton formulated the atomic theory of matter based on conservation of mass and constant composition.'
    },
    {
      postulate: 'Proposed the "plum pudding" model of the atom following the discovery of the electron, picturing negative corpuscles embedded in a uniform sphere of positive charge.',
      scientist: 'J.J. Thomson',
      aliases: ['thomson', 'j.j. thomson', 'jj thomson'],
      hint: 'This British physicist measured the charge-to-mass ratio (e/m) of the electron using cathode ray tubes.',
      explanation: 'J.J. Thomson discovered the electron in 1897 and proposed the plum pudding model of the atom.'
    },
    {
      postulate: 'Concluded from alpha-scattering experiments that the atom is overwhelmingly empty space with a tiny, dense, positively charged nucleus.',
      scientist: 'Ernest Rutherford',
      aliases: ['rutherford', 'ernest rutherford'],
      hint: 'This New Zealand-born physicist directed the famous gold foil experiment.',
      explanation: 'Ernest Rutherford overturned the plum pudding model by discovering the atomic nucleus in 1911.'
    },
    {
      postulate: 'Formulated the uncertainty principle stating that it is impossible to determine simultaneously both the exact position and momentum of an electron.',
      scientist: 'Werner Heisenberg',
      aliases: ['heisenberg', 'werner heisenberg'],
      hint: 'This German physicist contributed to quantum mechanics and wave-particle duality.',
      explanation: 'Werner Heisenberg established the uncertainty principle (Δx · Δp ≥ h/4π) in 1927.'
    }
  ];

  // Skill 3, Item 5: Subatomic Pool
  const SUBATOMIC_POOL = [
    { name: 'sodium-22 ion', symbol: '²²Na⁺', element: 'Na', mass: 22, atomicNum: 11, charge: 1 },
    { name: 'fluoride-19 ion', symbol: '¹⁹F⁻', element: 'F', mass: 19, atomicNum: 9, charge: -1 },
    { name: 'magnesium-24 ion', symbol: '²⁴Mg²⁺', element: 'Mg', mass: 24, atomicNum: 12, charge: 2 },
    { name: 'sulfide-32 ion', symbol: '³²S²⁻', element: 'S', mass: 32, atomicNum: 16, charge: -2 },
    { name: 'chloride-35 ion', symbol: '³⁵Cl⁻', element: 'Cl', mass: 35, atomicNum: 17, charge: -1 },
    { name: 'potassium-39 ion', symbol: '³⁹K⁺', element: 'K', mass: 39, atomicNum: 19, charge: 1 },
    { name: 'phosphide-31 ion', symbol: '³¹P³⁻', element: 'P', mass: 31, atomicNum: 15, charge: -3 },
    { name: 'calcium-40 ion', symbol: '⁴⁰Ca²⁺', element: 'Ca', mass: 40, atomicNum: 20, charge: 2 },
    { name: 'aluminum-27 ion', symbol: '²⁷Al³⁺', element: 'Al', mass: 27, atomicNum: 13, charge: 3 }
  ];

  // Skill 3, Item 6: Reverse Subatomic Identification
  const REVERSE_SUBATOMIC_POOL = [
    { protons: 15, neutrons: 16, electrons: 18, symbol: 'P', name: 'Phosphorus', mass: 31, charge: -3, notation: '³¹P³⁻' },
    { protons: 20, neutrons: 22, electrons: 18, symbol: 'Ca', name: 'Calcium', mass: 42, charge: 2, notation: '⁴²Ca²⁺' },
    { protons: 35, neutrons: 46, electrons: 36, symbol: 'Br', name: 'Bromine', mass: 81, charge: -1, notation: '⁸¹Br⁻' },
    { protons: 13, neutrons: 14, electrons: 10, symbol: 'Al', name: 'Aluminum', mass: 27, charge: 3, notation: '²⁷Al³⁺' },
    { protons: 8, neutrons: 10, electrons: 10, symbol: 'O', name: 'Oxygen', mass: 18, charge: -2, notation: '¹⁸O²⁻' },
    { protons: 19, neutrons: 21, electrons: 18, symbol: 'K', name: 'Potassium', mass: 40, charge: 1, notation: '⁴⁰K⁺' },
    { protons: 16, neutrons: 18, electrons: 18, symbol: 'S', name: 'Sulfur', mass: 34, charge: -2, notation: '³⁴S²⁻' }
  ];

  // Skill 4, Item 7: Accurate NIST Isotopic Systems
  const ISOTOPE_SYSTEMS = [
    {
      element: 'Gallium',
      isotopes: [
        { massNum: 69, exactMass: 68.9256, baseAbund: 60.11 },
        { massNum: 71, exactMass: 70.9247, baseAbund: 39.89 }
      ]
    },
    {
      element: 'Copper',
      isotopes: [
        { massNum: 63, exactMass: 62.9296, baseAbund: 69.17 },
        { massNum: 65, exactMass: 64.9278, baseAbund: 30.83 }
      ]
    },
    {
      element: 'Chlorine',
      isotopes: [
        { massNum: 35, exactMass: 34.9689, baseAbund: 75.77 },
        { massNum: 37, exactMass: 36.9659, baseAbund: 24.23 }
      ]
    },
    {
      element: 'Boron',
      isotopes: [
        { massNum: 10, exactMass: 10.0129, baseAbund: 19.9 },
        { massNum: 11, exactMass: 11.0093, baseAbund: 80.1 }
      ]
    },
    {
      element: 'Silicon',
      isotopes: [
        { massNum: 28, exactMass: 27.9769, baseAbund: 92.23 },
        { massNum: 29, exactMass: 28.9765, baseAbund: 4.67 },
        { massNum: 30, exactMass: 29.9738, baseAbund: 3.1 }
      ]
    }
  ];

  // Skill 4, Item 8: Mass Spec Peak Reasoning (MCQ)
  const MASS_SPEC_SCENARIOS = [
    {
      element: 'Copper (Cu)',
      peaks: [
        { mz: 63, intensity: 69.2, label: '⁶³Cu' },
        { mz: 65, intensity: 30.8, label: '⁶⁵Cu' }
      ],
      stem: 'The mass spectrum of pure element X displays two prominent isotopic peaks at m/z = 63 (69.2% relative abundance) and m/z = 65 (30.8% relative abundance). Which statement best estimates the average atomic mass of element X and provides the correct scientific rationale?',
      correct: 'Between 63 and 64 amu; because the isotope at 63 amu is more than twice as abundant as the isotope at 65 amu.',
      distractors: [
        'Exactly 64.0 amu; because standard atomic weight is defined as the unweighted arithmetic midpoint between 63 and 65 amu.',
        'Between 64 and 65 amu; because heavier isotopes possess higher nuclear inertia and exert stronger magnetic deflection in the analyzer.',
        'Greater than 65.0 amu; because positive ionization by high-energy electron bombardment imparts additional effective mass to gaseous ions.'
      ],
      hint1: 'Average atomic mass is a weighted average. The isotope with the higher peak intensity pulls the average closer to its own mass.',
      hint2: 'Since 63 amu has 69.2% abundance (more than half), the average must lie on the lower half of the 63 to 65 interval.',
      explanation: 'Average atomic mass = (0.692 × 63) + (0.308 × 65) ≈ 63.55 amu. Because ⁶³Cu is much more abundant than ⁶⁵Cu, the weighted average is pulled closer to 63 amu (between 63 and 64 amu).'
    },
    {
      element: 'Bromine (Br)',
      peaks: [
        { mz: 79, intensity: 50.7, label: '⁷⁹Br' },
        { mz: 81, intensity: 49.3, label: '⁸¹Br' }
      ],
      stem: 'The mass spectrum of pure element Y shows two isotopic peaks of nearly equal intensity at m/z = 79 (50.7%) and m/z = 81 (49.3%). What is the approximate average atomic mass of element Y?',
      correct: 'Approximately 80.0 amu; because the two isotopes exist in a nearly 1:1 ratio, placing the weighted average almost exactly halfway between them.',
      distractors: [
        'Approximately 79.0 amu; because lighter isotopes encounter less inertia and therefore dominate chemical reactivity and isotopic abundance.',
        'Approximately 81.0 amu; because the heavier isotope possesses greater nuclear stability, systematically skewing the mass readout upward.',
        'Approximately 160.0 amu; because elemental halogens vaporize exclusively as diatomic molecular ions that double the recorded mass spectrum.'
      ],
      hint1: 'When two isotopes have nearly identical percent abundances, the weighted average is approximately their simple arithmetic mean.',
      hint2: '(79 + 81) / 2 = 80.',
      explanation: 'Because ⁷⁹Br and ⁸¹Br are present in almost equal proportions (50.7% vs 49.3%), the weighted average is (0.507 × 79) + (0.493 × 81) ≈ 79.9 amu, very close to 80.0 amu.'
    },
    {
      element: 'Magnesium (Mg)',
      peaks: [
        { mz: 24, intensity: 79.0, label: '²⁴Mg' },
        { mz: 25, intensity: 10.0, label: '²⁵Mg' },
        { mz: 26, intensity: 11.0, label: '²⁶Mg' }
      ],
      stem: 'The mass spectrum of pure element Z displays three peaks: m/z = 24 (~79%), m/z = 25 (~10%), and m/z = 26 (~11%). Which is the most accurate estimate of the average atomic mass of element Z?',
      correct: 'Slightly greater than 24 amu (~24.3 amu); because ²⁴Mg accounts for nearly four-fifths of all atoms.',
      distractors: [
        'Exactly 25.0 amu; representing the arithmetic median value of the three discrete mass numbers.',
        'Between 25 and 26 amu; because the combined contributions of ²⁵Mg and ²⁶Mg outweigh ²⁴Mg in total isotopic mass.',
        'Less than 24.0 amu; because strong nuclear binding forces convert a measurable fraction of mass into binding energy.'
      ],
      hint1: 'Consider which isotope has the vast majority of the abundance: 79% is nearly 4 out of every 5 atoms.',
      hint2: 'The average will be weighted very heavily toward 24 amu, shifted only slightly upward by the minor isotopes at 25 and 26 amu.',
      explanation: 'With 79% at 24 amu, 10% at 25 amu, and 11% at 26 amu, the weighted average is (0.79 × 24) + (0.10 × 25) + (0.11 × 26) ≈ 24.3 amu, slightly above 24 amu.'
    }
  ];

  // Skill 6, Item 11: Electron Configuration Pool
  const CONFIG_POOL = [
    { target: 'Sulfur (S)', atomicNum: 16, standard: '1s2 2s2 2p6 3s2 3p4', noble: '[Ne] 3s2 3p4', valence: 6 },
    { target: 'Phosphide ion (P³⁻)', atomicNum: 15, standard: '1s2 2s2 2p6 3s2 3p6', noble: '[Ar]', valence: 8 },
    { target: 'Aluminum (Al)', atomicNum: 13, standard: '1s2 2s2 2p6 3s2 3p1', noble: '[Ne] 3s2 3p1', valence: 3 },
    { target: 'Magnesium ion (Mg²⁺)', atomicNum: 12, standard: '1s2 2s2 2p6', noble: '[Ne]', valence: 8 },
    { target: 'Calcium (Ca)', atomicNum: 20, standard: '1s2 2s2 2p6 3s2 3p6 4s2', noble: '[Ar] 4s2', valence: 2 },
    { target: 'Chloride ion (Cl⁻)', atomicNum: 17, standard: '1s2 2s2 2p6 3s2 3p6', noble: '[Ar]', valence: 8 }
  ];

  // Skill 6, Item 12: Valence and Unpaired Electrons Pool
  const VALENCE_UNPAIRED_POOL = [
    {
      element: 'Phosphorus',
      symbol: 'P',
      z: 15,
      config: '[Ne] 3s² 3p³',
      valence: 5,
      highestN: 3,
      unpaired: 3,
      rationale: 'In the 3p subshell, 3 electrons occupy three degenerate orbitals with parallel spins according to Hund rule, giving 3 unpaired electrons.'
    },
    {
      element: 'Silicon',
      symbol: 'Si',
      z: 14,
      config: '[Ne] 3s² 3p²',
      valence: 4,
      highestN: 3,
      unpaired: 2,
      rationale: 'In the 3p subshell, 2 electrons occupy separate 3p orbitals with parallel spins, giving 2 unpaired electrons.'
    },
    {
      element: 'Chlorine',
      symbol: 'Cl',
      z: 17,
      config: '[Ne] 3s² 3p⁵',
      valence: 7,
      highestN: 3,
      unpaired: 1,
      rationale: 'The 3p subshell holds 5 electrons: two orbitals are completely filled and one has a single electron, leaving 1 unpaired electron.'
    },
    {
      element: 'Oxygen',
      symbol: 'O',
      z: 8,
      config: '1s² 2s² 2p⁴',
      valence: 6,
      highestN: 2,
      unpaired: 2,
      rationale: 'The 2p subshell holds 4 electrons: one orbital has paired electrons, and two orbitals contain single unpaired electrons.'
    },
    {
      element: 'Nitrogen',
      symbol: 'N',
      z: 7,
      config: '1s² 2s² 2p³',
      valence: 5,
      highestN: 2,
      unpaired: 3,
      rationale: 'The three 2p electrons occupy separate orbitals with parallel spins according to Hund rule, resulting in 3 unpaired electrons.'
    },
    {
      element: 'Sulfur',
      symbol: 'S',
      z: 16,
      config: '[Ne] 3s² 3p⁴',
      valence: 6,
      highestN: 3,
      unpaired: 2,
      rationale: 'The 3p subshell holds 4 electrons: one paired orbital and two singly occupied orbitals, giving 2 unpaired electrons.'
    }
  ];

  // Skill 7, Item 13: Periodic Trend Ranking Sets
  const TREND_SETS = [
    {
      property: 'Atomic Radius',
      instruction: 'Rank the following elements from smallest to largest atomic radius:',
      elements: [
        { symbol: 'Al', z: 13, radius: 143 },
        { symbol: 'Si', z: 14, radius: 118 },
        { symbol: 'P', z: 15, radius: 110 },
        { symbol: 'Cl', z: 17, radius: 99 }
      ],
      correctOrder: ['Cl', 'P', 'Si', 'Al'],
      reasoning: 'Across Period 3, effective nuclear charge (Zeff) increases while shielding remains constant, pulling valence electrons closer to the nucleus.'
    },
    {
      property: 'First Ionization Energy',
      instruction: 'Rank the following elements from lowest to highest first ionization energy:',
      elements: [
        { symbol: 'K', z: 19, ie: 419 },
        { symbol: 'Na', z: 11, ie: 496 },
        { symbol: 'Mg', z: 12, ie: 738 },
        { symbol: 'Cl', z: 17, ie: 1251 }
      ],
      correctOrder: ['K', 'Na', 'Mg', 'Cl'],
      reasoning: 'Ionization energy increases across a period due to higher Zeff, and decreases down a group due to increased electron shielding and distance.'
    },
    {
      property: 'Electronegativity',
      instruction: 'Rank the following elements from lowest to highest electronegativity:',
      elements: [
        { symbol: 'Li', z: 3, en: 1.0 },
        { symbol: 'C', z: 6, en: 2.5 },
        { symbol: 'O', z: 8, en: 3.5 },
        { symbol: 'F', z: 9, en: 4.0 }
      ],
      correctOrder: ['Li', 'C', 'O', 'F'],
      reasoning: 'Electronegativity increases across Period 2 as the smaller atomic radius and higher effective nuclear charge attract shared bonding electrons more strongly.'
    }
  ];

  // Skill 7, Item 14: Coulombic Reasoning (MCQ)
  const COULOMBIC_SCENARIOS = [
    {
      title: 'Period Trend: Effective Nuclear Charge',
      stem: 'Across Period 3 from sodium (Na) to chlorine (Cl), atomic radius decreases systematically while first ionization energy increases. Which explanation correctly identifies the primary Coulombic factor responsible for this trend?',
      correct: 'Effective nuclear charge (Zeff) increases across the period while inner-shell shielding remains constant, pulling valence electrons closer.',
      distractors: [
        'The number of occupied principal energy levels increases across the period, compressing outer electron orbital volume into smaller shells.',
        'Electron-electron repulsion in the valence shell decreases dramatically as additional protons neutralize mutual subshell charges.',
        'Outer valence electrons experience significantly weaker centrifugal force as nuclear mass increases, allowing nuclear gravity to dominate.'
      ],
      hint1: 'Notice that all Period 3 elements add electrons to the same n = 3 principal energy level.',
      hint2: 'Core electrons remain 10 for all Period 3 elements, but nuclear charge increases from +11 to +17.',
      explanation: 'Because electrons enter the same principal shell (n = 3), core shielding is constant while nuclear charge increases from +11 to +17. The higher Zeff exerts a stronger Coulombic attraction (F ∝ q₁q₂ / r²), shrinking the atomic radius and binding electrons more tightly.'
    },
    {
      title: 'Group Trend: Shielding and Distance',
      stem: 'Down Group 1 from lithium (Li) to cesium (Cs), first ionization energy decreases substantially. Which statement best justifies this trend using Coulomb law?',
      correct: 'Valence electrons occupy increasingly higher principal energy levels (higher n), increasing distance from the nucleus and inner-shell shielding.',
      distractors: [
        'Total nuclear charge decreases down the column as radioactive decay reduces the net electrostatic potential of heavier alkali nuclei.',
        'The thermodynamic stability of the octet rule prevents heavier alkali atoms from readily ionizing in gas-phase vacuum environments.',
        'Effective nuclear charge drops to zero for outer electrons due to complete electrostatic screening by successive closed noble gas cores.'
      ],
      hint1: 'Coulomb force is inversely proportional to the square of distance (F ∝ 1 / r²).',
      hint2: 'Each step down a group adds a complete inner shell of electrons, placing the valence electron farther away.',
      explanation: 'Although nuclear charge increases down a group, each new period adds an entire shell of core electrons. The valence electron is located much farther from the nucleus (higher n), so electrostatic attraction drops sharply due to increased distance and core shielding.'
    },
    {
      title: 'Ionization Anomaly: Nitrogen vs Oxygen',
      stem: 'Nitrogen has a first ionization energy of 1402 kJ/mol, whereas oxygen has a slightly lower first ionization energy of 1314 kJ/mol, despite oxygen having a higher nuclear charge (Z = 8 vs Z = 7). What explains this exception?',
      correct: 'Oxygen has two electrons paired in one 2p orbital; electron-electron repulsion between paired electrons in the same orbital makes that electron easier to remove.',
      distractors: [
        'Nitrogen possesses a completely filled, spherical 2p subshell whose high symmetry confers exceptional thermodynamic resistance to ionization.',
        'Oxygen valence electrons experience substantially greater core shielding from its 1s inner electrons than nitrogen valence electrons experience.',
        'Nitrogen atoms form diatomic triple covalent bonds in the gas phase that artificially elevate the energy required to extract an electron.'
      ],
      hint1: 'Draw orbital diagrams for nitrogen ([He] 2s² 2p³) and oxygen ([He] 2s² 2p⁴).',
      hint2: 'In oxygen, the fourth 2p electron must pair up with an electron already occupying a 2p orbital.',
      explanation: 'In nitrogen, each 2p orbital contains a single electron with parallel spin (half-filled stability). In oxygen, two electrons must share the same 2p orbital. Electrostatic repulsion between these paired electrons raises the orbital energy, lowering the energy needed to remove one.'
    }
  ];

  // Skill 8, Item 15: Chemical Families & Properties (MCQ)
  const FAMILY_SCENARIOS = [
    {
      stem: 'An element is a silvery, soft, highly reactive metal that reacts violently and exothermically with water to produce hydrogen gas and a basic solution. It forms stable ions with a +1 charge. To which periodic family does it belong?',
      correct: 'Alkali Metals (Group 1)',
      distractors: [
        'Alkaline Earth Metals (Group 2)',
        'Halogens (Group 17)',
        'Transition Metals (Groups 3-12)'
      ],
      hint1: 'Group 1 elements have a single valence electron that is easily lost.',
      hint2: 'Alkali metals (Li, Na, K, Rb, Cs) react with water: 2 M(s) + 2 H₂O(l) → 2 MOH(aq) + H₂(g).',
      explanation: 'Alkali metals (Group 1) have low first ionization energies, form +1 ions, and react vigorously with water to generate hydrogen gas and metal hydroxides.'
    },
    {
      stem: 'An element is a reactive nonmetal that exists as diatomic molecules at room temperature. It readily gains one electron to achieve a noble gas configuration, forming anions with a -1 charge. To which chemical family does it belong?',
      correct: 'Halogens (Group 17)',
      distractors: [
        'Noble Gases (Group 18)',
        'Alkali Metals (Group 1)',
        'Pnictogens (Group 15)'
      ],
      hint1: 'Elements with 7 valence electrons need one electron to complete an octet.',
      hint2: 'Halogens (F, Cl, Br, I) form halides with a -1 charge.',
      explanation: 'Halogens (Group 17) have 7 valence electrons (ns² np⁵) and high electron affinities, readily forming -1 anions (halides).'
    },
    {
      stem: 'A colorless, odorless elemental gas has an exceptionally high first ionization energy, a complete valence shell octet, and near-zero chemical reactivity under standard laboratory conditions. Which family does it represent?',
      correct: 'Noble Gases (Group 18)',
      distractors: [
        'Halogens (Group 17)',
        'Alkaline Earth Metals (Group 2)',
        'Metalloids'
      ],
      hint1: 'A completely full valence shell provides extraordinary thermodynamic stability.',
      hint2: 'Group 18 elements include Helium, Neon, Argon, Krypton, and Xenon.',
      explanation: 'Noble gases (Group 18) possess filled valence shells (s²p⁶, or 1s² for He), conferring exceptional stability and very low chemical reactivity.'
    },
    {
      stem: 'An element is a lustrous, malleable solid that conducts electricity, forms salts with the general formula MX₂, and forms stable dipositive (+2) cations in aqueous solution. To which periodic family does it belong?',
      correct: 'Alkaline Earth Metals (Group 2)',
      distractors: [
        'Alkali Metals (Group 1)',
        'Halogens (Group 17)',
        'Chalcogens (Group 16)'
      ],
      hint1: 'Losing two valence electrons leaves a stable noble gas core.',
      hint2: 'Group 2 elements include Beryllium, Magnesium, Calcium, Strontium, and Barium.',
      explanation: 'Alkaline earth metals (Group 2) have two valence electrons (ns²), lose both to form +2 cations, and combine with halogens in a 1:2 ratio (MX₂).'
    }
  ];

  // Skill 8, Item 16: Comparative Reactivity Trends (MCQ)
  const REACTIVITY_SCENARIOS = [
    {
      title: 'Alkali Metal Reactivity in Water',
      stem: 'Consider the reaction of alkali metals with liquid water: 2 M(s) + 2 H₂O(l) → 2 MOH(aq) + H₂(g). Which metal reacts more vigorously with water, and what atomic property accounts for this difference?',
      correct: 'Potassium (K); because its valence electron is in the n = 4 shell, farther from the nucleus with more shielding, resulting in a lower ionization energy.',
      distractors: [
        'Sodium (Na); because its higher electronegativity enables it to polarize and tear apart polar water molecules much more rapidly during collisions.',
        'Sodium (Na); because its smaller atomic radius permits adjacent water molecules to pack tightly around the metal surface, accelerating hydrolysis.',
        'Potassium (K); because potassium atoms contain more total neutrons in the nucleus, transferring greater thermal kinetic energy during aqueous collisions.'
      ],
      hint1: 'Metal reactivity involves losing a valence electron to form a positive ion.',
      hint2: 'A metal with a lower ionization energy loses its valence electron more readily, reacting more violently.',
      explanation: 'For metals, chemical reactivity increases as ionization energy decreases. Potassium has its valence electron in the n = 4 shell compared to n = 3 for sodium. The greater distance and shielding make potassium valence electron easier to remove, producing a faster and more exothermic reaction.'
    },
    {
      title: 'Halogen Oxidizing Ability',
      stem: 'In single replacement reactions, elemental halogens act as oxidizing agents: X₂ + 2 Y⁻ → 2 X⁻ + Y₂. Which halogen is a stronger oxidizing agent (more reactive nonmetal), and why?',
      correct: 'Chlorine (Cl₂); because its smaller atomic radius and lower shielding allow its nucleus to exert a stronger Coulombic attraction for incoming electrons.',
      distractors: [
        'Iodine (I₂); because its larger electron cloud is substantially more polarizable, enabling it to induce stronger instantaneous dipole attractions.',
        'Iodine (I₂); because heavier nonmetals possess lower first ionization energies, permitting them to exchange electrons with aqueous ions more rapidly.',
        'Chlorine (Cl₂); because chlorine exists in the gaseous phase at room temperature, providing significantly higher surface area than solid crystalline iodine.'
      ],
      hint1: 'Nonmetal reactivity involves attracting and gaining an electron to form a negative ion.',
      hint2: 'A smaller halogen atom has its valence shell closer to the nucleus, exerting a stronger Coulombic pull on incoming electrons.',
      explanation: 'Nonmetal reactivity depends on electron attraction. Chlorine has a smaller atomic radius (n = 3) than iodine (n = 5), so its nucleus exerts a much stronger Coulombic attraction on external electrons, making Cl₂ a stronger oxidizing agent than I₂.'
    },
    {
      title: 'Alkaline Earth Water Reactivity',
      stem: 'Calcium reacts readily with room-temperature water to produce bubbles of hydrogen gas, whereas magnesium reacts only very slowly with room-temperature water. Which factor best accounts for calcium greater reactivity?',
      correct: 'Calcium has lower first and second ionization energies because its valence electrons are located in the n = 4 shell rather than n = 3.',
      distractors: [
        'Calcium has a higher electronegativity than magnesium, exerting a stronger electrostatic pull on water oxygen lone pairs to initiate reduction.',
        'Magnesium contains more total nuclear charge per unit volume than calcium, generating a stronger overall electrostatic force that repels water.',
        'Calcium possesses a completely filled 3d subshell whose electron-electron repulsion destabilizes the metallic lattice and drives aqueous dissolution.'
      ],
      hint1: 'Both metals must lose two valence electrons to form M²⁺ cations in water.',
      hint2: 'Ionization energy decreases down Group 2 from Mg to Ca as atomic radius increases.',
      explanation: 'Because calcium valence electrons are in the n = 4 shell with additional core shielding, its ionization energies (590 and 1145 kJ/mol) are substantially lower than magnesium (738 and 1451 kJ/mol), allowing calcium to react rapidly at room temperature.'
    }
  ];

  // ============================================================
  // 4. MAIN APPLICATION CONTROLLER
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
      document.querySelectorAll('#calcGrid .calc-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.getAttribute('data-key');
          this.handleCalcKey(key);
        });
      });
      this.initCalcDrag();

      // Bind actions
      this.elStudentPill.addEventListener('click', () => this.showProfileModal());
      this.elProfileStartBtn.addEventListener('click', () => this.handleProfileSubmit());
      this.elProfileInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleProfileSubmit();
      });
      this.elExportBtn.addEventListener('click', () => this.handleExportReport());
    }

    applyTheme(theme) {
      document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      document.body.classList.remove('theme-light', 'theme-dark', 'theme-auto');
      if (theme === 'light') {
        document.documentElement.classList.add('theme-light');
        document.body.classList.add('theme-light');
        if (this.elThemeIcon) this.elThemeIcon.textContent = '🌙';
      } else {
        document.documentElement.classList.add('theme-dark');
        document.body.classList.add('theme-dark');
        if (this.elThemeIcon) this.elThemeIcon.textContent = '☀️';
      }
      localStorage.setItem('xl_chem_theme', theme);
    }

    toggleTheme() {
      const isLight = document.documentElement.classList.contains('theme-light') || document.body.classList.contains('theme-light');
      this.applyTheme(isLight ? 'dark' : 'light');
    }

    initReferenceCenter() {
      // Drawer tabs: Periodic Table vs Formulas
      const tabBtnPtable = document.getElementById('tabBtnPtable');
      const tabBtnFormulas = document.getElementById('tabBtnFormulas');
      const drawerPtable = document.getElementById('drawerPtable');
      const drawerFormulas = document.getElementById('drawerFormulas');

      if (tabBtnPtable && tabBtnFormulas && drawerPtable && drawerFormulas) {
        tabBtnPtable.addEventListener('click', () => {
          tabBtnPtable.classList.add('active');
          tabBtnFormulas.classList.remove('active');
          drawerPtable.style.display = 'block';
          drawerFormulas.style.display = 'none';
        });

        tabBtnFormulas.addEventListener('click', () => {
          tabBtnFormulas.classList.add('active');
          tabBtnPtable.classList.remove('active');
          drawerPtable.style.display = 'none';
          drawerFormulas.style.display = 'block';
        });
      }

      // Heatmap modes
      const modeButtons = document.querySelectorAll('#ptableModes .ptable-mode-btn');
      modeButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          modeButtons.forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          const mode = btn.getAttribute('data-mode') || 'default';
          this.renderPeriodicTable(mode);
        });
      });

      // Transition metals toggle
      const transToggle = document.getElementById('ptableTransitionToggle');
      if (transToggle) {
        transToggle.addEventListener('change', () => {
          const showTrans = transToggle.checked;
          const cells = document.querySelectorAll('#refPtableGrid .ptable-cell');
          cells.forEach((cell) => {
            const grp = parseInt(cell.getAttribute('data-group'), 10);
            if (grp >= 3 && grp <= 12) {
              cell.style.display = showTrans ? 'flex' : 'none';
            }
          });
        });
      }

      // Initial build of table and legend
      this.renderPeriodicTable('default');
    }

    renderPeriodicTable(mode = 'default') {
      const grid = document.getElementById('refPtableGrid');
      const legend = document.getElementById('refPtableLegend');
      if (!grid || !legend) return;

      // Build cells on first load
      if (grid.children.length === 0) {
        PERIODIC_ELEMENTS.forEach((el) => {
          const cell = document.createElement('div');
          cell.className = `ptable-cell kind-${el.kind}`;
          cell.style.gridRow = String(el.period);
          cell.style.gridColumn = String(el.group);
          cell.setAttribute('data-sym', el.sym);
          cell.setAttribute('data-group', String(el.group));
          cell.setAttribute('title', `${el.name} (Z = ${el.z})`);

          cell.innerHTML = `
            <span class="cell-z">${el.z}</span>
            <span class="cell-sym">${el.sym}</span>
            <span class="cell-val"></span>
          `;

          cell.addEventListener('click', () => this.selectElement(el.sym));
          grid.appendChild(cell);
        });
      }

      // Color interpolation helpers
      const COOL = [56, 189, 248], PALE = [241, 245, 249], HOT = [244, 63, 94];
      const mix = (a, b, t) => [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t)
      ];
      const lum = (c) => (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
      const rgbStr = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
      const seqColor = (t) => (t < 0.5 ? mix(COOL, PALE, t * 2) : mix(PALE, HOT, (t - 0.5) * 2));

      const cells = grid.querySelectorAll('.ptable-cell');

      if (mode === 'default') {
        legend.innerHTML = `
          <div class="ptable-legend-swatches">
            <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: var(--xl-primary);"></span>metal</span>
            <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: #f59e0b;"></span>metalloid</span>
            <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: #10b981;"></span>nonmetal</span>
            <span class="ptable-legend-swatch"><span class="ptable-legend-chip" style="background-color: #a855f7;"></span>noble gas</span>
          </div>
        `;

        cells.forEach((cell) => {
          const sym = cell.getAttribute('data-sym');
          const el = PERIODIC_ELEMENTS.find((item) => item.sym === sym);
          cell.classList.remove('no-data');
          cell.style.backgroundColor = '';
          cell.style.color = '';
          const valSpan = cell.querySelector('.cell-val');
          if (valSpan && el) {
            valSpan.textContent = el.mass ? el.mass.toFixed(el.mass < 10 ? 2 : 1) : '';
          }
        });
      } else {
        const propMap = { radius: 'radius', ie: 'ie', en: 'en' };
        const propKey = propMap[mode];
        const unitMap = { radius: ' pm', ie: ' kJ/mol', en: '' };

        const validVals = PERIODIC_ELEMENTS.map((el) => el[propKey]).filter((v) => v !== null && v !== undefined);
        const min = Math.min(...validVals);
        const max = Math.max(...validVals);

        legend.innerHTML = `
          <span>low (${min}${unitMap[mode]})</span>
          <div style="background: linear-gradient(90deg, ${rgbStr(COOL)}, ${rgbStr(PALE)}, ${rgbStr(HOT)}); height: 8px; flex: 1; max-width: 140px; border-radius: 4px; border: 1px solid var(--xl-border);"></div>
          <span>high (${max}${unitMap[mode]})</span>
        `;

        cells.forEach((cell) => {
          const sym = cell.getAttribute('data-sym');
          const el = PERIODIC_ELEMENTS.find((item) => item.sym === sym);
          const valSpan = cell.querySelector('.cell-val');
          if (!el) return;

          const val = el[propKey];
          if (val === null || val === undefined) {
            cell.classList.add('no-data');
            cell.style.backgroundColor = '';
            cell.style.color = '';
            if (valSpan) valSpan.textContent = 'n/a';
          } else {
            cell.classList.remove('no-data');
            const t = max === min ? 0.5 : (val - min) / (max - min);
            const color = seqColor(t);
            cell.style.backgroundColor = rgbStr(color);
            cell.style.color = lum(color) > 0.55 ? '#0f172a' : '#f8fafc';
            if (valSpan) {
              valSpan.textContent = mode === 'en' ? val.toFixed(1) : String(val);
            }
          }
        });
      }
    }

    selectElement(sym) {
      const el = PERIODIC_ELEMENTS.find((item) => item.sym === sym);
      if (!el) return;

      const cells = document.querySelectorAll('#refPtableGrid .ptable-cell');
      cells.forEach((c) => c.classList.remove('selected'));
      const activeCell = document.querySelector(`#refPtableGrid .ptable-cell[data-sym="${sym}"]`);
      if (activeCell) activeCell.classList.add('selected');

      const inspectorEmpty = document.getElementById('inspectorEmpty');
      const inspectorDetails = document.getElementById('inspectorDetails');
      if (inspectorEmpty) inspectorEmpty.style.display = 'none';
      if (!inspectorDetails) return;

      inspectorDetails.style.display = 'block';
      inspectorDetails.innerHTML = `
        <div class="inspector-layout">
          <div class="inspector-main">
            <div class="inspector-header-row">
              <span class="inspector-sym">${el.sym}</span>
              <span class="inspector-z">Z = ${el.z}</span>
              <span class="inspector-mass">${el.mass} amu</span>
            </div>
            <div class="inspector-name">${el.name}</div>
            <span class="inspector-kind-badge">${el.kind}</span>
            <div class="inspector-stats-grid">
              <div class="inspector-stat-item">
                <span class="stat-label">Group / Period</span>
                <span class="stat-value">Grp ${el.group}, Per ${el.period}</span>
              </div>
              <div class="inspector-stat-item">
                <span class="stat-label">Shell Config</span>
                <span class="stat-value">${el.shells.join(', ')}</span>
              </div>
              <div class="inspector-stat-item">
                <span class="stat-label">Valence e⁻</span>
                <span class="stat-value">${el.valence !== null ? el.valence : 'Variable (3d)'}</span>
              </div>
              <div class="inspector-stat-item">
                <span class="stat-label">Typical Charge</span>
                <span class="stat-value">${el.charge}</span>
              </div>
              <div class="inspector-stat-item">
                <span class="stat-label">Atomic Radius</span>
                <span class="stat-value">${el.radius !== null ? el.radius + ' pm' : 'N/A'}</span>
              </div>
              <div class="inspector-stat-item">
                <span class="stat-label">1st Ionization</span>
                <span class="stat-value">${el.ie !== null ? el.ie + ' kJ/mol' : 'N/A'}</span>
              </div>
              <div class="inspector-stat-item">
                <span class="stat-label">Electronegativity</span>
                <span class="stat-value">${el.en !== null ? el.en.toFixed(2) : 'N/A'}</span>
              </div>
              <div class="inspector-stat-item">
                <span class="stat-label">Total Shells</span>
                <span class="stat-value">${el.shells.length}</span>
              </div>
            </div>
          </div>
          <div class="inspector-visual" id="inspectorVisual">
            ${this.generateBohrSVG(el.shells, el.z, el.name)}
          </div>
        </div>
      `;
    }

    generateBohrSVG(shells, z, name) {
      const cx = 65, cy = 65;
      let rings = '';
      shells.forEach((cnt, idx) => {
        const r = 18 + idx * 11;
        rings += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="currentColor" stroke-width="0.8" opacity="0.35"/>`;
        for (let e = 0; e < cnt; e++) {
          const angle = (2 * Math.PI / cnt) * e - Math.PI / 2;
          const ex = (cx + r * Math.cos(angle)).toFixed(1);
          const ey = (cy + r * Math.sin(angle)).toFixed(1);
          rings += `<circle cx="${ex}" cy="${ey}" r="2.2" fill="#38bdf8" stroke="#0f172a" stroke-width="0.6"/>`;
        }
      });

      return `<svg viewBox="0 0 130 130" width="120" height="120" role="img" aria-label="Bohr model for ${name}" style="overflow:visible;">
        ${rings}
        <circle cx="${cx}" cy="${cy}" r="12" fill="#f59e0b"/>
        <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" style="font-family:var(--font-mono);font-weight:700;font-size:9px;">${z}⁺</text>
      </svg>`;
    }

    initCalcDrag() {
      const handle = document.getElementById('calcDragHandle');
      const widget = document.getElementById('calcWidget');
      if (!handle || !widget) return;

      let isDragging = false;
      let startY = 0;
      let startTop = 0;

      handle.addEventListener('pointerdown', (e) => {
        if (e.target.closest('#closeCalcBtn')) return;
        isDragging = true;
        handle.setPointerCapture(e.pointerId);
        handle.style.cursor = 'grabbing';

        const rect = widget.getBoundingClientRect();
        widget.style.bottom = 'auto';
        widget.style.top = `${rect.top}px`;

        startY = e.clientY;
        startTop = rect.top;
      });

      handle.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        const deltaY = e.clientY - startY;
        const rawTop = startTop + deltaY;
        const minTop = 60;
        const maxTop = window.innerHeight - widget.offsetHeight - 15;
        const clampedTop = Math.max(minTop, Math.min(maxTop, rawTop));
        widget.style.top = `${clampedTop}px`;
      });

      const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        try {
          handle.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        handle.style.cursor = 'grab';
      };

      handle.addEventListener('pointerup', stopDrag);
      handle.addEventListener('pointercancel', stopDrag);
    }

    handleCalcKey(key) {
      if (key === 'clear') {
        this.calcBuffer = '';
        if (this.elCalcExpr) this.elCalcExpr.textContent = '';
        if (this.elCalcVal) this.elCalcVal.textContent = '0';
        return;
      }
      if (key === 'del') {
        this.calcBuffer = this.calcBuffer.slice(0, -1);
        if (this.elCalcExpr) this.elCalcExpr.textContent = this.calcBuffer;
        return;
      }
      if (key === '=') {
        try {
          let expr = this.calcBuffer
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/sqrt\(([^)]+)\)/g, 'Math.sqrt($1)')
            .replace(/ee/gi, 'e');

          if (!/^[\d\s+\-*/().eMath,]+$/.test(expr)) {
            throw new Error('Invalid');
          }
          const res = Function(`"use strict"; return (${expr})`)();
          if (this.elCalcVal) {
            this.elCalcVal.textContent = Number.isFinite(res)
              ? Math.abs(res) > 1e6 || Math.abs(res) < 1e-3
                ? res.toExponential(4)
                : parseFloat(res.toFixed(6))
              : 'Error';
          }
        } catch {
          if (this.elCalcVal) this.elCalcVal.textContent = 'Error';
        }
        return;
      }
      if (key === 'sqrt') {
        this.calcBuffer += 'Math.sqrt(';
      } else if (key === 'ee') {
        this.calcBuffer += 'e';
      } else if (key === 'pm') {
        if (this.calcBuffer.startsWith('-')) {
          this.calcBuffer = this.calcBuffer.slice(1);
        } else {
          this.calcBuffer = '-' + this.calcBuffer;
        }
      } else {
        this.calcBuffer += key;
      }
      if (this.elCalcExpr) this.elCalcExpr.textContent = this.calcBuffer;
    }

    checkStoredProfile() {
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = (urlParams.get('student') || urlParams.get('name'));
      const urlRun = parseInt(urlParams.get('run'), 10);

      if (urlName) {
        const name = urlName.trim();
        const run = urlRun && urlRun >= 1 ? urlRun : 1;
        const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-u1' + (run > 1 ? `-r${run}` : '');
        localStorage.setItem('xl_chem_student_name', name);
        localStorage.setItem('xl_chem_seed', seed);
        localStorage.setItem('xl_chem_run', String(run));
        this.startSession(name, seed, run);
        return;
      }

      const storedName = localStorage.getItem('xl_chem_student_name');
      const storedSeed = localStorage.getItem('xl_chem_seed');
      const storedRun = parseInt(localStorage.getItem('xl_chem_run'), 10) || 1;

      if (storedName && storedSeed) {
        this.startSession(storedName, storedSeed, storedRun);
      } else {
        this.showProfileModal();
      }
    }

    showProfileModal() {
      this.elProfileInput.value = this.studentName || '';
      this.elProfileModal.style.display = 'flex';
      setTimeout(() => this.elProfileInput.focus(), 100);
    }

    handleProfileSubmit() {
      const name = this.elProfileInput.value.trim();
      if (!name) return;

      const run = 1;
      const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '') + '-u1';
      localStorage.setItem('xl_chem_student_name', name);
      localStorage.setItem('xl_chem_seed', seed);
      localStorage.setItem('xl_chem_run', '1');

      this.elProfileModal.style.display = 'none';
      this.startSession(name, seed, run);
    }

    startSession(name, seed, run = 1) {
      this.studentName = name;
      this.seed = seed;
      this.run = run;
      this.elStudentNameDisplay.textContent = name;
      this.elSeedChip.textContent = `Seed: #${seed}${run > 1 ? ` (Run ${run})` : ''}`;

      const rng = new SeededRNG(seed);
      this.generateProblems(rng);
      this.loadSavedState();
      this.renderDeck();
      this.updateProgress();
    }

    // ============================================================
    // 5. PROBLEM GENERATION (16 PROBLEMS)
    // ============================================================
    generateProblems(rng) {
      this.problems = [
        // Skill 1: Matter Classification & Particle Models
        this.genProblem1_SeparationMCQ(rng),
        this.genProblem2_ParticleModel(rng),

        // Skill 2: Historical Atomic Models & Evidence
        this.genProblem3_RutherfordMCQ(rng),
        this.genProblem4_ModelEvolution(rng),

        // Skill 3: Subatomic Particles & Isotopic Notation
        this.genProblem5_SubatomicGrid(rng),
        this.genProblem6_ReverseSubatomic(rng),

        // Skill 4: Average Atomic Mass & Mass Spectrometry
        this.genProblem7_AverageAtomicMass(rng),
        this.genProblem8_MassSpecMCQ(rng),

        // Skill 5: Electromagnetic Radiation & Photons
        this.genProblem9_WaveEquations(rng),
        this.genProblem10_PhotonEnergy(rng),

        // Skill 6: Electron Configurations & Orbital Diagrams
        this.genProblem11_ElectronConfig(rng),
        this.genProblem12_ValenceUnpaired(rng),

        // Skill 7: Periodic Trends
        this.genProblem13_PeriodicTrends(rng),
        this.genProblem14_CoulombicMCQ(rng),

        // Skill 8: Periodic Families & Chemical Reactivity
        this.genProblem15_FamilyClassificationMCQ(rng),
        this.genProblem16_ReactivityTrend(rng)
      ];
    }

    // --- Problem 1: Macroscopic Separation (MCQ) ---
    genProblem1_SeparationMCQ(rng) {
      const item = rng.pick(SEPARATION_SCENARIOS);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p1_separation_mcq',
        num: 1,
        topic: 'Matter: Separation Methods',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 2: Particle Model Classification ---
    genProblem2_ParticleModel(rng) {
      const item = rng.pick(PARTICLE_SYSTEMS);
      const svgGraphic = this.generateParticleSVG(item.type);
      return {
        id: 'p2_particle_model',
        num: 2,
        topic: 'Matter: Particle Level Models',
        stem: `Examine the sealed 2D particle representation shown below. Classify the sample and enter the total number of discrete molecules (or independent particle units) present.`,
        type: 'particle_model',
        svgGraphic,
        categoryOptions: [
          'Pure Element',
          'Pure Compound',
          'Mixture of Elements',
          'Mixture of Compounds',
          'Mixture of Element and Compound'
        ],
        expectedCategory: item.category,
        expectedCount: item.particleCount,
        hint1: item.hint,
        hint2: `Count the individual units: each discrete cluster of bonded atoms or solitary atom counts as 1 particle unit. Total is ${item.particleCount}.`,
        workedSolution: `Classification: ${item.category}\nTotal Discrete Particle Units: ${item.particleCount}\n\n${item.explanation}`
      };
    }

    // --- Problem 3: Rutherford Scattering Evidence (MCQ) ---
    genProblem3_RutherfordMCQ(rng) {
      const item = rng.pick(EXPERIMENT_SCENARIOS);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p3_rutherford_mcq',
        num: 3,
        topic: 'Atomic Theory: Experimental Evidence',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 4: Model Evolution & Scientists (Fill-in / Select) ---
    genProblem4_ModelEvolution(rng) {
      const item = rng.pick(SCIENTIST_POSTULATES);
      const scientistChoices = [
        'John Dalton',
        'J.J. Thomson',
        'Ernest Rutherford',
        'Niels Bohr',
        'Werner Heisenberg'
      ];
      return {
        id: 'p4_history_fill',
        num: 4,
        topic: 'Atomic Theory: Model Postulates',
        stem: `Identify the historic scientist associated with the following foundational postulate: <div style="margin-top:0.5rem; padding:0.6rem 0.75rem; background:var(--xl-surface); border-left:3px solid var(--xl-primary); border-radius:var(--radius-sm); font-style:italic;">"${item.postulate}"</div>`,
        type: 'select_scientist',
        choices: scientistChoices,
        expectedScientist: item.scientist,
        hint1: item.hint,
        hint2: `Review the timeline: Dalton (indivisible spheres) -> Thomson (plum pudding) -> Rutherford (nuclear atom) -> Bohr (quantized orbits) -> Heisenberg (uncertainty).`,
        workedSolution: `Scientist: ${item.scientist}\n\n${item.explanation}`
      };
    }

    // --- Problem 5: Subatomic Grid ---
    genProblem5_SubatomicGrid(rng) {
      const item = rng.pick(SUBATOMIC_POOL);
      const protons = item.atomicNum;
      const neutrons = item.mass - item.atomicNum;
      const electrons = item.atomicNum - item.charge;

      return {
        id: 'p5_subatomic_grid',
        num: 5,
        topic: 'Subatomic Structure: Isotopic Breakdown',
        stem: `Analyze the chemical species <span class="given-highlight">${item.symbol}</span> (${item.name}). Complete the subatomic breakdown for this atom or ion:`,
        type: 'subatomic_grid',
        data: item,
        expected: {
          protons,
          neutrons,
          electrons,
          atomicNum: item.atomicNum,
          massNum: item.mass,
          charge: item.charge
        },
        hint1: 'Atomic Number (Z) equals Protons. Mass Number (A) equals Protons + Neutrons. Net Charge equals Protons minus Electrons.',
        hint2: `For ${item.element}: Protons = ${protons}. Since net charge is ${item.charge > 0 ? '+' + item.charge : item.charge}, adjust electrons accordingly (${protons} - (${item.charge})).`,
        workedSolution: `1. Atomic Number (Z) = ${protons} (defines element ${item.element}).\n2. Protons = ${protons}.\n3. Neutrons = Mass Number (${item.mass}) - Protons (${protons}) = ${neutrons}.\n4. Electrons = Protons (${protons}) - Charge (${item.charge}) = ${electrons}.\n5. Net Charge = ${item.charge > 0 ? '+' + item.charge : item.charge}.`
      };
    }

    // --- Problem 6: Reverse Subatomic Identification ---
    genProblem6_ReverseSubatomic(rng) {
      const item = rng.pick(REVERSE_SUBATOMIC_POOL);
      return {
        id: 'p6_reverse_subatomic',
        num: 6,
        topic: 'Subatomic Structure: Species Identification',
        stem: `An ion contains exactly <span class="given-highlight">${item.protons} protons</span>, <span class="given-highlight">${item.neutrons} neutrons</span>, and <span class="given-highlight">${item.electrons} electrons</span>. Determine the element chemical symbol, mass number, and net charge.`,
        type: 'reverse_subatomic',
        expected: {
          symbol: item.symbol,
          mass: item.mass,
          charge: item.charge
        },
        hint1: 'The number of protons uniquely defines the element symbol on the periodic table. Mass Number = Protons + Neutrons. Net Charge = Protons - Electrons.',
        hint2: `Atomic Number Z = ${item.protons} corresponds to ${item.name} (${item.symbol}). Mass = ${item.protons} + ${item.neutrons} = ${item.mass}. Charge = ${item.protons} - ${item.electrons}.`,
        workedSolution: `1. Element Symbol: Z = ${item.protons} is ${item.symbol} (${item.name}).\n2. Mass Number: ${item.protons} + ${item.neutrons} = ${item.mass}.\n3. Net Charge: ${item.protons} - ${item.electrons} = ${item.charge > 0 ? '+' + item.charge : item.charge}.\nComplete Notation: ${item.notation}`
      };
    }

    // --- Problem 7: Average Atomic Mass Calculation ---
    genProblem7_AverageAtomicMass(rng) {
      const system = rng.pick(ISOTOPE_SYSTEMS);
      const shift = rng.float(-0.4, 0.4, 2);

      let isoData = [];
      let totalWeighted = 0;

      if (system.isotopes.length === 2) {
        const a1 = parseFloat((system.isotopes[0].baseAbund + shift).toFixed(2));
        const a2 = parseFloat((100 - a1).toFixed(2));
        isoData = [
          { ...system.isotopes[0], abund: a1 },
          { ...system.isotopes[1], abund: a2 }
        ];
        totalWeighted = (a1 / 100) * system.isotopes[0].exactMass + (a2 / 100) * system.isotopes[1].exactMass;
      } else {
        const a1 = parseFloat((system.isotopes[0].baseAbund + shift).toFixed(2));
        const rem = 100 - a1;
        const a2 = parseFloat((rem * 0.6).toFixed(2));
        const a3 = parseFloat((rem - a2).toFixed(2));
        isoData = [
          { ...system.isotopes[0], abund: a1 },
          { ...system.isotopes[1], abund: a2 },
          { ...system.isotopes[2], abund: a3 }
        ];
        totalWeighted =
          (a1 / 100) * system.isotopes[0].exactMass +
          (a2 / 100) * system.isotopes[1].exactMass +
          (a3 / 100) * system.isotopes[2].exactMass;
      }

      const expectedVal = parseFloat(totalWeighted.toFixed(4));

      return {
        id: 'p7_atomic_mass',
        num: 7,
        topic: 'Isotopes: Average Atomic Mass',
        stem: `A sample of <strong>${system.element}</strong> has the following naturally occurring isotopic abundances and precise masses:`,
        type: 'atomic_mass_calc',
        maxAttempts: 5,
        isoTable: isoData,
        elementName: system.element,
        expected: {
          value: expectedVal,
          unit: 'amu',
          tolerance: 0.005,
          sigFigs: 4
        },
        hint1: 'Average Atomic Mass = Σ (fractional abundance × exact mass). Convert percent abundances to decimals before multiplying.',
        hint2: `Multiply each isotope: ${isoData.map((iso) => `(${iso.abund / 100} × ${iso.exactMass})`).join(' + ')}. Then sum the terms.`,
        workedSolution: `Average Atomic Mass = ${isoData.map((iso) => `(${iso.abund / 100} × ${iso.exactMass})`).join(' + ')}\n= ${expectedVal} amu`
      };
    }

    // --- Problem 8: Mass Spec Peak Reasoning (MCQ) ---
    genProblem8_MassSpecMCQ(rng) {
      const item = rng.pick(MASS_SPEC_SCENARIOS);
      const svgGraphic = this.generateMassSpecSVG(item.peaks);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p8_mass_spec_mcq',
        num: 8,
        topic: 'Mass Spectrometry: Peak Reasoning',
        stem: item.stem,
        type: 'mcq_with_diagram',
        svgGraphic,
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 9: Wavelength & Frequency Calculation ---
    genProblem9_WaveEquations(rng) {
      const wavelengthNm = rng.int(420, 680);
      const wavelengthM = wavelengthNm * 1e-9;
      const c = 3.0e8;
      const frequencyHz = c / wavelengthM;

      return {
        id: 'p9_wave_eq',
        num: 9,
        topic: 'Light Equations: Wavelength & Frequency',
        stem: `A laser in an atomic emission experiment emits a spectral beam with a wavelength of <span class="given-highlight">${wavelengthNm} nm</span>. Using the speed of light constant (c = 3.00 × 10⁸ m/s), calculate the frequency of this radiation.`,
        type: 'quantitative_calc',
        maxAttempts: 5,
        wavelengthNm,
        expected: {
          value: frequencyHz,
          unit: 'Hz',
          tolerance: 0.02,
          sigFigs: 3
        },
        hint1: 'First convert wavelength from nanometers to meters: 1 m = 10⁹ nm (multiply nm by 10⁻⁹). Then use c = λ × ν.',
        hint2: `λ in meters = ${wavelengthNm} × 10⁻⁹ m = ${(wavelengthM).toExponential(2)} m. Rearrange formula: ν = c / λ.`,
        workedSolution: `1. Convert λ to meters: ${wavelengthNm} nm × (1 m / 10⁹ nm) = ${(wavelengthM).toExponential(3)} m.\n2. Rearrange c = λ × ν to solve for ν:\n   ν = c / λ = (3.00 × 10⁸ m/s) / (${(wavelengthM).toExponential(3)} m)\n   ν = ${frequencyHz.toExponential(2)} Hz (or s⁻¹).`
      };
    }

    // --- Problem 10: Photon Energy & Spectral Color ---
    genProblem10_PhotonEnergy(rng) {
      const colors = [
        { name: 'Red', min: 625, max: 700 },
        { name: 'Orange', min: 590, max: 624 },
        { name: 'Yellow', min: 565, max: 589 },
        { name: 'Green', min: 500, max: 564 },
        { name: 'Blue', min: 450, max: 499 },
        { name: 'Violet', min: 400, max: 449 }
      ];

      const band = rng.pick(colors);
      const nm = rng.int(band.min, band.max);
      const lambdaM = nm * 1e-9;
      const c = 3.0e8;
      const h = 6.626e-34;
      const nu = c / lambdaM;
      const energyJ = h * nu;

      return {
        id: 'p10_photon_energy',
        num: 10,
        topic: 'Light Equations: Photon Energy',
        stem: `An electronic transition in a gas discharge tube emits a photon with wavelength <span class="given-highlight">${nm} nm</span>. Using Planck constant (h = 6.626 × 10⁻³⁴ J·s), calculate the energy of a single photon and identify its visible color.`,
        type: 'photon_energy_calc',
        maxAttempts: 5,
        expected: {
          value: energyJ,
          unit: 'J',
          tolerance: 0.02,
          sigFigs: 3
        },
        colorOptions: ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Violet'],
        expectedColor: band.name,
        hint1: 'Energy of a single photon: E = h × ν = (h × c) / λ. Convert λ from nm to m before multiplying.',
        hint2: `E = (6.626 × 10⁻³⁴ J·s × 3.00 × 10⁸ m/s) / (${nm} × 10⁻⁹ m). Violet is ~400-450 nm, Green is ~500-565 nm, Red is ~625-700 nm.`,
        workedSolution: `1. Calculate Photon Energy:\n   E = (h × c) / λ\n   E = (6.626 × 10⁻³⁴ J·s × 3.00 × 10⁸ m/s) / (${nm} × 10⁻⁹ m)\n   E = ${energyJ.toExponential(2)} J.\n2. Visible Color: At ${nm} nm, the spectral color is ${band.name}.`
      };
    }

    // --- Problem 11: Electron Configuration ---
    genProblem11_ElectronConfig(rng) {
      const item = rng.pick(CONFIG_POOL);
      return {
        id: 'p11_electron_config',
        num: 11,
        topic: 'Electrons: Ground-State Configuration',
        stem: `Write the ground-state electron configuration for <span class="given-highlight">${item.target}</span>. You may use standard subshell notation (e.g. 1s2 2s2 2p6...) or noble gas shorthand (e.g. [Ne] 3s2...).`,
        type: 'electron_config',
        expectedStandard: item.standard,
        expectedNoble: item.noble,
        chips: ['1s', '2s', '2p', '3s', '3p', '4s', '3d', '[He]', '[Ne]', '[Ar]'],
        hint1: 'Fill subshells in order of increasing energy: 1s, 2s, 2p, 3s, 3p, 4s, 3d. Check whether this species is a cation (lost electrons) or anion (gained electrons).',
        hint2: `Total electrons for ${item.target} is ${item.standard.split(' ').reduce((acc, sub) => {
          const m = sub.match(/\d+$/);
          return acc + (m ? parseInt(m[0], 10) : 0);
        }, 0)}. Standard configuration: ${item.standard}.`,
        workedSolution: `Standard notation: ${item.standard}\nNoble gas shorthand: ${item.noble}`
      };
    }

    // --- Problem 12: Valence & Unpaired Electrons ---
    genProblem12_ValenceUnpaired(rng) {
      const item = rng.pick(VALENCE_UNPAIRED_POOL);
      return {
        id: 'p12_valence_unpaired',
        num: 12,
        topic: 'Electrons: Valence Shell & Spin',
        stem: `Consider a neutral ground-state atom of <span class="given-highlight">${item.element} (${item.symbol}, Z = ${item.z})</span>. Determine the number of valence electrons, highest occupied principal energy level (n), and number of unpaired electrons in the ground state.`,
        type: 'valence_unpaired',
        expected: {
          valence: item.valence,
          highestN: item.highestN,
          unpaired: item.unpaired
        },
        hint1: 'Valence electrons are electrons in the outermost s and p subshells. Apply Hund rule (orbitals of equal energy are each occupied by one electron before any orbital is doubly occupied).',
        hint2: `Electron configuration: ${item.config}. Valence electrons = ${item.valence}. Highest shell n = ${item.highestN}. Count unpaired p electrons.`,
        workedSolution: `Configuration: ${item.config}\n1. Valence Electrons: ${item.valence}\n2. Highest Principal Level (n): ${item.highestN}\n3. Unpaired Electrons: ${item.unpaired}\n\nRationale: ${item.rationale}`
      };
    }

    // --- Problem 13: Periodic Trends Reorderable Ranking ---
    genProblem13_PeriodicTrends(rng) {
      const trend = rng.pick(TREND_SETS);
      const shuffled = rng.shuffle(trend.elements);

      return {
        id: 'p13_trends_ranking',
        num: 13,
        topic: `Periodic Trends: ${trend.property}`,
        stem: `${trend.instruction}`,
        type: 'ranking',
        property: trend.property,
        elements: shuffled,
        expectedOrder: trend.correctOrder,
        reasoning: trend.reasoning,
        hint1: 'Consider Effective Nuclear Charge (Zeff) across rows and electron shielding/distance (n) down columns.',
        hint2: 'Atomic radius decreases across and increases down. Ionization energy and electronegativity increase across and decrease down.',
        workedSolution: `Correct order (lowest to highest): ${trend.correctOrder.join(' < ')}.\n\nReasoning: ${trend.reasoning}`
      };
    }

    // --- Problem 14: Coulombic Reasoning (MCQ) ---
    genProblem14_CoulombicMCQ(rng) {
      const item = rng.pick(COULOMBIC_SCENARIOS);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p14_coulombic_mcq',
        num: 14,
        topic: 'Periodic Trends: Coulombic Law',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 15: Chemical Families & Properties (MCQ) ---
    genProblem15_FamilyClassificationMCQ(rng) {
      const item = rng.pick(FAMILY_SCENARIOS);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p15_family_mcq',
        num: 15,
        topic: 'Periodic Table: Chemical Families',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // --- Problem 16: Comparative Reactivity Trends (MCQ) ---
    genProblem16_ReactivityTrend(rng) {
      const item = rng.pick(REACTIVITY_SCENARIOS);
      const options = rng.shuffle([item.correct, ...item.distractors]);
      return {
        id: 'p16_reactivity_trend',
        num: 16,
        topic: 'Reactivity: Comparative Periodic Trends',
        stem: item.stem,
        type: 'mcq',
        options,
        expectedOption: item.correct,
        hint1: item.hint1,
        hint2: item.hint2,
        workedSolution: item.explanation
      };
    }

    // ============================================================
    // VECTOR ARTWORK GENERATORS (SVG)
    // ============================================================
    generateParticleSVG(type) {
      let particlesHTML = '';
      if (type === 'element_diatomic') {
        const positions = [
          [45, 45], [140, 35], [230, 50],
          [60, 115], [155, 120], [225, 110]
        ];
        particlesHTML = positions.map(([x, y]) => `
          <g transform="translate(${x},${y})">
            <circle cx="-7" cy="0" r="8" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
            <circle cx="7" cy="0" r="8" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5" />
          </g>
        `).join('');
      } else if (type === 'compound_triatomic') {
        const positions = [
          [50, 45], [140, 40], [230, 45],
          [80, 115], [190, 115]
        ];
        particlesHTML = positions.map(([x, y]) => `
          <g transform="translate(${x},${y})">
            <circle cx="0" cy="0" r="9" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
            <circle cx="-10" cy="8" r="6" fill="#f59e0b" stroke="#d97706" stroke-width="1.2" />
            <circle cx="10" cy="8" r="6" fill="#f59e0b" stroke="#d97706" stroke-width="1.2" />
          </g>
        `).join('');
      } else if (type === 'mixture_elements') {
        const monoPos = [[35, 40], [110, 120], [180, 35], [245, 125]];
        const diaPos = [[75, 80], [145, 70], [215, 75], [250, 35]];
        const monoHTML = monoPos.map(([x, y]) => `
          <circle cx="${x}" cy="${y}" r="8" fill="#a855f7" stroke="#7e22ce" stroke-width="1.5" />
        `).join('');
        const diaHTML = diaPos.map(([x, y]) => `
          <g transform="translate(${x},${y})">
            <circle cx="-6" cy="0" r="7" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2" />
            <circle cx="6" cy="0" r="7" fill="#38bdf8" stroke="#0284c7" stroke-width="1.2" />
          </g>
        `).join('');
        particlesHTML = monoHTML + diaHTML;
      } else {
        const diaPos = [[40, 45], [140, 120], [235, 40]];
        const triPos = [[85, 110], [140, 45], [210, 115], [250, 95]];
        const diaHTML = diaPos.map(([x, y]) => `
          <g transform="translate(${x},${y})">
            <circle cx="-6" cy="0" r="7" fill="#f97316" stroke="#ea580c" stroke-width="1.2" />
            <circle cx="6" cy="0" r="7" fill="#f97316" stroke="#ea580c" stroke-width="1.2" />
          </g>
        `).join('');
        const triHTML = triPos.map(([x, y]) => `
          <g transform="translate(${x},${y})">
            <circle cx="0" cy="0" r="8" fill="#f8fafc" stroke="#64748b" stroke-width="1.5" />
            <circle cx="-8" cy="7" r="5" fill="#10b981" stroke="#059669" stroke-width="1.2" />
            <circle cx="8" cy="7" r="5" fill="#10b981" stroke="#059669" stroke-width="1.2" />
          </g>
        `).join('');
        particlesHTML = diaHTML + triHTML;
      }

      return `
        <svg viewBox="0 0 280 160" width="100%" height="160" style="background:#0f172a; border-radius:6px; border:1px solid #334155; display:block;">
          <rect x="4" y="4" width="272" height="152" rx="4" fill="none" stroke="#1e293b" stroke-width="2" />
          ${particlesHTML}
        </svg>
      `;
    }

    generateMassSpecSVG(peaks) {
      const maxInt = Math.max(...peaks.map((p) => p.intensity));
      const minMz = Math.min(...peaks.map((p) => p.mz)) - 2;
      const maxMz = Math.max(...peaks.map((p) => p.mz)) + 2;
      const spanMz = maxMz - minMz;

      const barsHTML = peaks.map((p) => {
        const xPercent = ((p.mz - minMz) / spanMz) * 200 + 45;
        const barH = (p.intensity / maxInt) * 75;
        const yTop = 105 - barH;
        return `
          <line x1="${xPercent}" y1="105" x2="${xPercent}" y2="${yTop}" stroke="#38bdf8" stroke-width="6" stroke-linecap="round" />
          <circle cx="${xPercent}" cy="${yTop}" r="3" fill="#38bdf8" />
          <text x="${xPercent}" y="${yTop - 6}" text-anchor="middle" fill="#f8fafc" font-size="10" font-family="monospace">${p.intensity.toFixed(1)}%</text>
          <text x="${xPercent}" y="120" text-anchor="middle" fill="#94a3b8" font-size="11" font-family="monospace" font-weight="bold">${p.mz}</text>
        `;
      }).join('');

      return `
        <svg viewBox="0 0 290 140" width="100%" height="140" style="background:#0f172a; border-radius:6px; border:1px solid #334155; display:block;">
          <!-- Grid Lines -->
          <line x1="35" y1="30" x2="275" y2="30" stroke="#1e293b" stroke-dasharray="2 2" />
          <line x1="35" y1="67" x2="275" y2="67" stroke="#1e293b" stroke-dasharray="2 2" />
          <line x1="35" y1="105" x2="275" y2="105" stroke="#475569" stroke-width="1.5" />
          <line x1="35" y1="15" x2="35" y2="105" stroke="#475569" stroke-width="1.5" />
          
          <!-- Axis Labels -->
          <text x="15" y="65" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="sans-serif" transform="rotate(-90 15,65)">Relative Abundance (%)</text>
          <text x="155" y="135" text-anchor="middle" fill="#94a3b8" font-size="10" font-family="sans-serif">Mass-to-Charge Ratio (m/z)</text>
          <text x="28" y="34" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">100</text>
          <text x="28" y="71" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">50</text>
          <text x="28" y="108" text-anchor="end" fill="#64748b" font-size="8" font-family="monospace">0</text>
          
          ${barsHTML}
        </svg>
      `;
    }

    // ============================================================
    // 6. STATE PERSISTENCE & GRADING
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
            userEntry: '',
            feedback: ''
          };
        }
      });
    }

    saveState() {
      const key = `xl_chem_state_${this.seed}`;
      localStorage.setItem(key, JSON.stringify(this.currentStatus));
      this.updateProgress();
    }

    updateProgress() {
      const total = this.problems.length;
      let solvedCount = 0;
      let scoreSum = 0;
      let firstTry = 0;
      let secondTry = 0;
      let thirdTry = 0;
      let exhaustedCount = 0;

      this.problems.forEach((p) => {
        const s = this.currentStatus[p.id];
        if (s && s.solved) {
          solvedCount++;
          scoreSum += s.score || 1;
          if (s.attempts === 1) firstTry++;
          else if (s.attempts === 2) secondTry++;
          else if (s.attempts >= 3) thirdTry++;
        } else if (s && s.exhausted) {
          exhaustedCount++;
        }
      });

      const pct = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
      this.elProgressFill.style.width = `${pct}%`;
      this.elMetricsLabel.textContent = `${solvedCount} of ${total} Solved (${scoreSum}/${total} pts)`;

      const bannerStats = document.getElementById('bannerAttemptStats');
      if (bannerStats) {
        bannerStats.innerHTML = `
          <div class="attempt-breakdown-bar">
            <span class="attempt-stat-item"><span class="attempt-stat-dot dot-try-1"></span>1st Try: ${firstTry}</span>
            <span class="attempt-stat-item"><span class="attempt-stat-dot dot-try-2"></span>2nd Try: ${secondTry}</span>
            <span class="attempt-stat-item"><span class="attempt-stat-dot dot-try-3"></span>3rd Try: ${thirdTry}</span>
            ${exhaustedCount > 0 ? `<span class="attempt-stat-item"><span class="attempt-stat-dot dot-missed"></span>Missed: ${exhaustedCount}</span>` : ''}
          </div>
        `;
      }

      const anyAttempted = Object.values(this.currentStatus).some((s) => s.attempts > 0);
      this.elExportBtn.disabled = !anyAttempted;
    }

    // ============================================================
    // 7. RENDERING PROBLEM DECK
    // ============================================================
    renderDeck() {
      this.elProblemDeck.innerHTML = '';
      this.problems.forEach((prob) => {
        const card = document.createElement('div');
        card.className = 'problem-card';
        card.id = `card_${prob.id}`;

        const state = this.currentStatus[prob.id];
        if (state.solved) card.classList.add('status-solved');
        if (state.exhausted && !state.solved) card.classList.add('status-exhausted');

        card.innerHTML = `
          <div class="card-header">
            <div class="card-title-group">
              <span class="problem-number">#${prob.num}</span>
              <span class="problem-topic">${prob.topic}</span>
            </div>
            <div class="card-meta-group">
              <div class="attempt-track" id="track_${prob.id}">
                ${this.renderAttemptDots(state, prob)}
              </div>
            </div>
          </div>
          <div class="problem-stem">${prob.stem}</div>
          ${this.renderProblemWidget(prob, state)}
          <div id="feedback_${prob.id}" class="feedback-container">
            ${state.feedback ? `<div class="feedback-box ${state.solved ? 'feedback-success' : 'feedback-error'}">${state.feedback}</div>` : ''}
          </div>
          <div id="solution_${prob.id}" class="solution-container">
            ${state.solved || state.exhausted ? this.renderWorkedSolutionHTML(prob) : ''}
          </div>
        `;

        this.elProblemDeck.appendChild(card);
        this.bindWidgetEvents(prob, card);
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
      const max = (prob && prob.maxAttempts) ? prob.maxAttempts : this.maxAttempts;
      let dots = '';
      for (let i = 0; i < max; i++) {
        let cls = 'attempt-dot';
        if (state.solved && i === state.attempts - 1) {
          cls += ' dot-success';
        } else if (i < state.attempts) {
          cls += ' dot-used';
        }
        dots += `<span class="${cls}"></span>`;
      }
      dots += `<span class="attempt-label">${state.attempts}/${max} tries</span>`;
      return dots;
    }

    renderWorkedSolutionHTML(prob) {
      return `
        <div class="worked-solution-drawer">
          <div class="solution-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Step-by-Step Worked Solution
          </div>
          <pre class="solution-steps">${prob.workedSolution}</pre>
        </div>
      `;
    }

    renderProblemWidget(prob, state) {
      const isLocked = state.solved || state.exhausted;

      // 1. MCQ Problem Types (Items 1, 3, 14, 15, 16)
      if (prob.type === 'mcq') {
        const optionsHTML = prob.options.map((opt) => `
          <div class="mcq-option ${state.selectedOption === opt ? 'selected' : ''}" data-option="${encodeURIComponent(opt)}">
            <span class="mcq-indicator"></span>
            <span class="mcq-text">${opt}</span>
          </div>
        `).join('');

        return `
          <div class="input-zone">
            <div class="mcq-group" id="mcqGroup_${prob.id}">
              ${optionsHTML}
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Submit Answer</button>
            </div>
          </div>
        `;
      }

      // 2. MCQ with Diagram (Item 8: Mass Spec)
      if (prob.type === 'mcq_with_diagram') {
        const optionsHTML = prob.options.map((opt) => `
          <div class="mcq-option ${state.selectedOption === opt ? 'selected' : ''}" data-option="${encodeURIComponent(opt)}">
            <span class="mcq-indicator"></span>
            <span class="mcq-text">${opt}</span>
          </div>
        `).join('');

        return `
          <div class="input-zone">
            <div class="diagram-stage">
              <span class="diagram-caption">Mass Spectrum of Element Sample</span>
              ${prob.svgGraphic}
            </div>
            <div class="mcq-group" id="mcqGroup_${prob.id}">
              ${optionsHTML}
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Submit Answer</button>
            </div>
          </div>
        `;
      }

      // 3. Particle Model Classification & Count (Item 2)
      if (prob.type === 'particle_model') {
        const catOptions = prob.categoryOptions.map((cat) => `
          <option value="${cat}" ${state.selectedCategory === cat ? 'selected' : ''}>${cat}</option>
        `).join('');

        return `
          <div class="input-zone">
            <div class="diagram-stage">
              <span class="diagram-caption">Particulate Matter Chamber</span>
              ${prob.svgGraphic}
            </div>
            <div class="fill-row">
              <span class="fill-label">Classification:</span>
              <select class="fill-select" id="sel_cat_${prob.id}" ${isLocked ? 'disabled' : ''}>
                <option value="">Select sample classification...</option>
                ${catOptions}
              </select>
            </div>
            <div class="fill-row">
              <span class="fill-label">Total Discrete Particles:</span>
              <input type="number" class="fill-input" id="in_count_${prob.id}" style="width:110px;" placeholder="e.g. 6" value="${state.particleCount !== undefined ? state.particleCount : ''}" ${isLocked ? 'disabled' : ''}>
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Check Particle Model</button>
            </div>
          </div>
        `;
      }

      // 4. Scientist Postulate Select (Item 4)
      if (prob.type === 'select_scientist') {
        const choices = prob.choices.map((c) => `
          <option value="${c}" ${state.selectedScientist === c ? 'selected' : ''}>${c}</option>
        `).join('');

        return `
          <div class="input-zone">
            <div class="fill-row">
              <span class="fill-label">Scientist:</span>
              <select class="fill-select" id="sel_sci_${prob.id}" style="min-width:240px;" ${isLocked ? 'disabled' : ''}>
                <option value="">Select associated scientist...</option>
                ${choices}
              </select>
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Submit Scientist</button>
            </div>
          </div>
        `;
      }

      // 5. Subatomic Grid (Item 5)
      if (prob.type === 'subatomic_grid') {
        const saved = state.gridData || {};
        return `
          <div class="input-zone">
            <div class="subatomic-grid">
              <div class="subatomic-cell">
                <span class="subatomic-cell-label">Protons (p⁺)</span>
                <input type="number" class="subatomic-input" id="in_p5_protons" value="${saved.protons || ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div class="subatomic-cell">
                <span class="subatomic-cell-label">Neutrons (n⁰)</span>
                <input type="number" class="subatomic-input" id="in_p5_neutrons" value="${saved.neutrons || ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div class="subatomic-cell">
                <span class="subatomic-cell-label">Electrons (e⁻)</span>
                <input type="number" class="subatomic-input" id="in_p5_electrons" value="${saved.electrons || ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div class="subatomic-cell">
                <span class="subatomic-cell-label">Atomic Number (Z)</span>
                <input type="number" class="subatomic-input" id="in_p5_atomicNum" value="${saved.atomicNum || ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div class="subatomic-cell">
                <span class="subatomic-cell-label">Mass Number (A)</span>
                <input type="number" class="subatomic-input" id="in_p5_massNum" value="${saved.massNum || ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div class="subatomic-cell">
                <span class="subatomic-cell-label">Net Charge</span>
                <input type="number" class="subatomic-input" id="in_p5_charge" value="${saved.charge !== undefined ? saved.charge : ''}" ${isLocked ? 'disabled' : ''}>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Check Subatomic Breakdown</button>
            </div>
          </div>
        `;
      }

      // 6. Reverse Subatomic Identification (Item 6)
      if (prob.type === 'reverse_subatomic') {
        const saved = state.reverseData || {};
        return `
          <div class="input-zone">
            <div class="fill-row">
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <span class="fill-label">Chemical Symbol</span>
                <input type="text" class="fill-input" id="in_rev_sym_${prob.id}" placeholder="e.g. P" style="width:90px;" value="${saved.symbol || ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <span class="fill-label">Mass Number (A)</span>
                <input type="number" class="fill-input" id="in_rev_mass_${prob.id}" placeholder="e.g. 31" style="width:110px;" value="${saved.mass || ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <span class="fill-label">Net Charge</span>
                <input type="number" class="fill-input" id="in_rev_chg_${prob.id}" placeholder="e.g. -3" style="width:90px;" value="${saved.charge !== undefined ? saved.charge : ''}" ${isLocked ? 'disabled' : ''}>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Submit Chemical Species</button>
            </div>
          </div>
        `;
      }

      // 7. Average Atomic Mass Calculation (Item 7)
      if (prob.type === 'atomic_mass_calc') {
        const tableRows = prob.isoTable
          .map(
            (iso) => `
            <tr>
              <td style="padding:0.4rem 0.75rem; border-bottom:1px solid var(--xl-border); font-family:var(--font-mono); font-weight:700;">${iso.massNum}${prob.elementName.slice(0, 2)}</td>
              <td style="padding:0.4rem 0.75rem; border-bottom:1px solid var(--xl-border); font-family:var(--font-mono);">${iso.exactMass.toFixed(4)} amu</td>
              <td style="padding:0.4rem 0.75rem; border-bottom:1px solid var(--xl-border); font-family:var(--font-mono);">${iso.abund.toFixed(2)}%</td>
            </tr>`
          )
          .join('');

        return `
          <div style="overflow-x:auto; margin-bottom:0.5rem;">
            <table style="width:100%; border-collapse:collapse; background-color:var(--xl-surface); border:1px solid var(--xl-border); border-radius:var(--radius-sm); font-size:var(--text-sm);">
              <thead>
                <tr style="background-color:var(--xl-card); text-align:left; color:var(--xl-ink-mute); font-size:var(--text-2xs); text-transform:uppercase;">
                  <th style="padding:0.5rem 0.75rem;">Isotope</th>
                  <th style="padding:0.5rem 0.75rem;">Exact Mass</th>
                  <th style="padding:0.5rem 0.75rem;">Percent Abundance</th>
                </tr>
              </thead>
              <tbody>${tableRows}</tbody>
            </table>
          </div>
          ${this.renderStandardInputZone(prob, state, isLocked, 'e.g. 12.01 amu')}
        `;
      }

      // 8. Photon Energy with Spectral Color (Item 10)
      if (prob.type === 'photon_energy_calc') {
        const pills = prob.colorOptions
          .map(
            (c) =>
              `<button type="button" class="spectrum-pill ${state.selectedColor === c ? 'selected' : ''}" data-color="${c}" ${isLocked ? 'disabled' : ''}>${c}</button>`
          )
          .join('');

        return `
          ${this.renderStandardInputZone(prob, state, isLocked, 'e.g. 3.86 x 10^-19 J')}
          <div style="margin-top:0.75rem;">
            <div class="spectrum-chart-wrapper">
              <div class="spectrum-chart-title">Visible Light Spectrum Reference Chart</div>
              <div class="spectrum-gradient-bar"></div>
              <div class="spectrum-bands-grid">
                <div class="spectrum-band-item band-violet"><span class="band-name">Violet</span><span class="band-range">400-449 nm</span></div>
                <div class="spectrum-band-item band-blue"><span class="band-name">Blue</span><span class="band-range">450-499 nm</span></div>
                <div class="spectrum-band-item band-green"><span class="band-name">Green</span><span class="band-range">500-564 nm</span></div>
                <div class="spectrum-band-item band-yellow"><span class="band-name">Yellow</span><span class="band-range">565-589 nm</span></div>
                <div class="spectrum-band-item band-orange"><span class="band-name">Orange</span><span class="band-range">590-624 nm</span></div>
                <div class="spectrum-band-item band-red"><span class="band-name">Red</span><span class="band-range">625-700 nm</span></div>
              </div>
            </div>
            <div class="input-label" style="margin-top:0.6rem; margin-bottom:0.35rem;">Select Observed Spectral Color:</div>
            <div class="spectrum-picker" id="spectrumPicker_${prob.id}">
              ${pills}
            </div>
          </div>
        `;
      }

      // 9. Electron Configuration with Chips (Item 11)
      if (prob.type === 'electron_config') {
        const chipsHTML = prob.chips
          .map(
            (chip) =>
              `<button type="button" class="btn btn-secondary btn-sm chip-btn" data-chip="${chip}" ${isLocked ? 'disabled' : ''}>${chip}</button>`
          )
          .join('');

        return `
          <div class="input-zone">
            <div class="input-label">Enter Electron Configuration:</div>
            <div class="smart-input-row">
              <input type="text" class="smart-input-box" id="in_${prob.id}" placeholder="e.g. 1s2 2s2 2p6... or [Ne] 3s2..." value="${state.userEntry || ''}" ${isLocked ? 'disabled' : ''}>
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Submit</button>
            </div>
            <div style="display:flex; gap:0.4rem; flex-wrap:wrap; margin-top:0.25rem;">
              <span class="preview-prefix" style="align-self:center;">Subshell Shortcuts:</span>
              ${chipsHTML}
            </div>
          </div>
        `;
      }

      // 10. Valence and Unpaired Electrons (Item 12)
      if (prob.type === 'valence_unpaired') {
        const saved = state.valUnpairedData || {};
        return `
          <div class="input-zone">
            <div class="fill-row">
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <span class="fill-label">Valence Electrons</span>
                <input type="number" class="fill-input" id="in_val_${prob.id}" placeholder="e.g. 5" style="width:110px;" value="${saved.valence !== undefined ? saved.valence : ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <span class="fill-label">Highest Principal Shell (n)</span>
                <input type="number" class="fill-input" id="in_n_${prob.id}" placeholder="e.g. 3" style="width:130px;" value="${saved.highestN !== undefined ? saved.highestN : ''}" ${isLocked ? 'disabled' : ''}>
              </div>
              <div style="display:flex; flex-direction:column; gap:0.25rem;">
                <span class="fill-label">Unpaired Electrons</span>
                <input type="number" class="fill-input" id="in_unpaired_${prob.id}" placeholder="e.g. 3" style="width:110px;" value="${saved.unpaired !== undefined ? saved.unpaired : ''}" ${isLocked ? 'disabled' : ''}>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Check Quantum Properties</button>
            </div>
          </div>
        `;
      }

      // 11. Periodic Trends Reorderable Ranking (Item 13)
      if (prob.type === 'ranking') {
        const currentOrder = state.orderedElements || prob.elements;
        const cardsHTML = currentOrder
          .map(
            (el, idx) => `
            <div class="ranking-card" data-idx="${idx}" data-symbol="${el.symbol}">
              <span class="ranking-index">${idx + 1}</span>
              <span class="ranking-symbol">${el.symbol}</span>
              <div style="display:flex; gap:0.25rem; margin-left:auto;">
                <button type="button" class="btn btn-secondary btn-sm btn-rank-up" data-idx="${idx}" ${isLocked || idx === 0 ? 'disabled' : ''}>▲</button>
                <button type="button" class="btn btn-secondary btn-sm btn-rank-down" data-idx="${idx}" ${isLocked || idx === currentOrder.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
            </div>
          `
          )
          .join('');

        return `
          <div class="input-zone">
            <div class="input-label">Drag cards or use arrows to arrange elements in increasing order:</div>
            <div class="ranking-track" id="rankTrack_${prob.id}">
              ${cardsHTML}
            </div>
            <div style="display:flex; justify-content:flex-end; margin-top:0.5rem;">
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Check Trend Ranking</button>
            </div>
          </div>
        `;
      }

      // Default: Quantitative Calculation (Item 9: Wave equation)
      return this.renderStandardInputZone(prob, state, isLocked, 'e.g. 5.79 x 10^14 Hz');
    }

    renderStandardInputZone(prob, state, isLocked, placeholder) {
      return `
        <div class="input-zone">
          <div class="input-zone-header">
            <span class="input-label">Your Calculated Answer:</span>
            <button type="button" class="input-mode-toggle" id="toggleMode_${prob.id}">
              ${state.splitMode ? 'Switch to Smart Text' : 'Switch to Split Boxes'}
            </button>
          </div>

          <div id="smartMode_${prob.id}" style="${state.splitMode ? 'display:none;' : ''}">
            <div class="smart-input-row">
              <input type="text" class="smart-input-box" id="in_${prob.id}" placeholder="${placeholder}" value="${state.userEntry || ''}" ${isLocked ? 'disabled' : ''}>
              <button class="btn btn-primary" id="btn_submit_${prob.id}" ${isLocked ? 'disabled' : ''}>Submit</button>
            </div>
            <div class="live-preview-box" id="preview_${prob.id}">
              <span class="preview-prefix">Preview:</span>
              <span class="preview-content" id="previewText_${prob.id}">Type answer with units above</span>
            </div>
          </div>

          <div id="splitMode_${prob.id}" style="${!state.splitMode ? 'display:none;' : ''}">
            <div class="split-boxes-row">
              <div class="split-col">
                <span class="split-label">Value / Mantissa</span>
                <input type="number" step="any" class="split-input" id="split_val_${prob.id}" placeholder="e.g. 5.79" ${isLocked ? 'disabled' : ''}>
              </div>
              <div class="split-multiply-symbol">× 10 ^</div>
              <div class="split-col">
                <span class="split-label">Exponent</span>
                <input type="number" class="split-input" id="split_exp_${prob.id}" placeholder="e.g. 14" ${isLocked ? 'disabled' : ''}>
              </div>
            </div>
            <div style="margin-top:0.5rem; display:flex; gap:0.75rem; align-items:flex-end;">
              <div class="split-col" style="flex:1;">
                <span class="split-label">Unit</span>
                <input type="text" class="split-input" id="split_unit_${prob.id}" placeholder="e.g. Hz or amu" ${isLocked ? 'disabled' : ''}>
              </div>
              <button class="btn btn-primary" id="btn_submit_split_${prob.id}" ${isLocked ? 'disabled' : ''}>Submit</button>
            </div>
          </div>
        </div>
      `;
    }

    // ============================================================
    // 8. EVENT BINDINGS
    // ============================================================
    bindWidgetEvents(prob, card) {
      const state = this.currentStatus[prob.id];
      if (state.solved || state.exhausted) return;

      // Mode toggle
      const toggleBtn = card.querySelector(`#toggleMode_${prob.id}`);
      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          state.splitMode = !state.splitMode;
          this.renderDeck();
        });
      }

      // Smart Input live preview
      const inputEl = card.querySelector(`#in_${prob.id}`);
      const previewText = card.querySelector(`#previewText_${prob.id}`);
      if (inputEl && previewText) {
        inputEl.addEventListener('input', () => {
          const parsed = window.SmartParser.parse(inputEl.value);
          if (!parsed.isValid) {
            previewText.textContent = parsed.message || 'Formatting...';
            previewText.className = 'preview-content preview-warning';
          } else {
            previewText.className = 'preview-content';
            if (window.katex) {
              try {
                window.katex.render(parsed.latex, previewText, { throwOnError: false });
              } catch {
                previewText.textContent = `${parsed.mantissa} ${parsed.exponent !== 0 ? 'x 10^' + parsed.exponent : ''} ${parsed.unit}`;
              }
            } else {
              previewText.textContent = `${parsed.mantissa} ${parsed.exponent !== 0 ? 'x 10^' + parsed.exponent : ''} ${parsed.unit}`;
            }
          }
        });

        inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.evaluateSubmission(prob);
        });
      }

      // Submit buttons
      const submitBtn = card.querySelector(`#btn_submit_${prob.id}`);
      if (submitBtn) {
        submitBtn.addEventListener('click', () => this.evaluateSubmission(prob));
      }

      const splitSubmitBtn = card.querySelector(`#btn_submit_split_${prob.id}`);
      if (splitSubmitBtn) {
        splitSubmitBtn.addEventListener('click', () => {
          const val = card.querySelector(`#split_val_${prob.id}`).value;
          const exp = card.querySelector(`#split_exp_${prob.id}`).value || '0';
          const unit = card.querySelector(`#split_unit_${prob.id}`).value;
          const combined = `${val} x 10^${exp} ${unit}`.trim();
          this.evaluateSubmission(prob, combined);
        });
      }

      // MCQ Selection
      card.querySelectorAll('.mcq-option').forEach((optEl) => {
        optEl.addEventListener('click', () => {
          card.querySelectorAll('.mcq-option').forEach((o) => o.classList.remove('selected'));
          optEl.classList.add('selected');
          state.selectedOption = decodeURIComponent(optEl.getAttribute('data-option'));
        });
      });

      // Subshell Chips for Problem 11
      card.querySelectorAll('.chip-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
          const chip = btn.getAttribute('data-chip');
          const box = card.querySelector(`#in_${prob.id}`);
          if (box) {
            box.value = box.value ? `${box.value.trim()} ${chip}` : chip;
            box.focus();
          }
        });
      });

      // Color Spectrum for Problem 10
      card.querySelectorAll('.spectrum-pill').forEach((pill) => {
        pill.addEventListener('click', () => {
          card.querySelectorAll('.spectrum-pill').forEach((p) => p.classList.remove('selected'));
          pill.classList.add('selected');
          state.selectedColor = pill.getAttribute('data-color');
        });
      });

      // Drag and Drop + Reorder buttons for Problem 13 (Ranking)
      if (prob.type === 'ranking') {
        const track = card.querySelector(`#rankTrack_${prob.id}`);
        if (track) {
          let draggedIdx = null;

          track.querySelectorAll('.ranking-card').forEach((rankCard) => {
            rankCard.setAttribute('draggable', 'true');

            rankCard.addEventListener('dragstart', (e) => {
              draggedIdx = parseInt(rankCard.getAttribute('data-idx'), 10);
              rankCard.classList.add('dragging');
              if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(draggedIdx));
              }
            });

            rankCard.addEventListener('dragend', () => {
              rankCard.classList.remove('dragging');
              track.querySelectorAll('.ranking-card').forEach((c) => c.classList.remove('drag-over'));
              draggedIdx = null;
            });

            rankCard.addEventListener('dragover', (e) => {
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
              rankCard.classList.add('drag-over');
            });

            rankCard.addEventListener('dragleave', () => {
              rankCard.classList.remove('drag-over');
            });

            rankCard.addEventListener('drop', (e) => {
              e.preventDefault();
              rankCard.classList.remove('drag-over');
              const targetIdx = parseInt(rankCard.getAttribute('data-idx'), 10);
              if (draggedIdx !== null && draggedIdx !== targetIdx) {
                const list = [...(state.orderedElements || prob.elements)];
                const item = list.splice(draggedIdx, 1)[0];
                list.splice(targetIdx, 0, item);
                state.orderedElements = list;
                this.renderDeck();
              }
            });
          });
        }

        // Up / Down arrow buttons
        card.querySelectorAll('.btn-rank-up').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            if (idx > 0) {
              const list = [...(state.orderedElements || prob.elements)];
              const temp = list[idx];
              list[idx] = list[idx - 1];
              list[idx - 1] = temp;
              state.orderedElements = list;
              this.renderDeck();
            }
          });
        });

        card.querySelectorAll('.btn-rank-down').forEach((btn) => {
          btn.addEventListener('click', () => {
            const idx = parseInt(btn.getAttribute('data-idx'), 10);
            const list = [...(state.orderedElements || prob.elements)];
            if (idx < list.length - 1) {
              const temp = list[idx];
              list[idx] = list[idx + 1];
              list[idx + 1] = temp;
              state.orderedElements = list;
              this.renderDeck();
            }
          });
        });
      }
    }

    // ============================================================
    // 9. EVALUATION ENGINE
    // ============================================================
    evaluateSubmission(prob, overrideValue) {
      const state = this.currentStatus[prob.id];
      if (state.solved || state.exhausted) return;

      state.attempts++;

      // 1. MCQ Problems (Items 1, 3, 8, 14, 15, 16)
      if (prob.type === 'mcq' || prob.type === 'mcq_with_diagram') {
        const selected = state.selectedOption;
        state.userEntry = selected || 'No option selected';

        if (!selected) {
          state.score = 0;
          state.feedback = 'Please select an option before submitting.';
          this.renderDeck();
          return;
        }

        if (selected === prob.expectedOption) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Conceptual understanding verified.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect selection. ${hint}`;
        }
      }

      // 2. Particle Model Classification & Count (Item 2)
      else if (prob.type === 'particle_model') {
        const cat = document.getElementById(`sel_cat_${prob.id}`).value;
        const countVal = parseInt(document.getElementById(`in_count_${prob.id}`).value, 10);
        state.selectedCategory = cat;
        state.particleCount = countVal;
        state.userEntry = `${cat || 'None'}, Count: ${isNaN(countVal) ? 'None' : countVal}`;

        const catCorrect = cat === prob.expectedCategory;
        const countCorrect = countVal === prob.expectedCount;

        if (catCorrect && countCorrect) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Both sample classification and discrete particle count are accurate.';
        } else {
          state.score = 0;
          let issue = '';
          if (!catCorrect && !countCorrect) issue = 'Both classification and particle count are incorrect.';
          else if (!catCorrect) issue = 'Classification is incorrect.';
          else issue = 'Particle count is incorrect.';
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `${issue} ${hint}`;
        }
      }

      // 3. Scientist Postulate Select (Item 4)
      else if (prob.type === 'select_scientist') {
        const sel = document.getElementById(`sel_sci_${prob.id}`).value;
        state.selectedScientist = sel;
        state.userEntry = sel || 'None';

        if (sel === prob.expectedScientist) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Atomic postulate accurately mapped to scientist.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect scientist. ${hint}`;
        }
      }

      // 4. Subatomic Grid (Item 5)
      else if (prob.type === 'subatomic_grid') {
        const p = parseInt(document.getElementById('in_p5_protons').value, 10);
        const n = parseInt(document.getElementById('in_p5_neutrons').value, 10);
        const e = parseInt(document.getElementById('in_p5_electrons').value, 10);
        const z = parseInt(document.getElementById('in_p5_atomicNum').value, 10);
        const a = parseInt(document.getElementById('in_p5_massNum').value, 10);
        const c = parseInt(document.getElementById('in_p5_charge').value, 10);

        state.gridData = { protons: p, neutrons: n, electrons: e, atomicNum: z, massNum: a, charge: c };
        state.userEntry = `p⁺:${p}, n⁰:${n}, e⁻:${e}, Z:${z}, A:${a}, Chg:${c}`;

        const isCorrect =
          p === prob.expected.protons &&
          n === prob.expected.neutrons &&
          e === prob.expected.electrons &&
          z === prob.expected.atomicNum &&
          a === prob.expected.massNum &&
          c === prob.expected.charge;

        if (isCorrect) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! All subatomic values match precisely.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect. Check your subatomic counts. ${hint}`;
        }
      }

      // 5. Reverse Subatomic Identification (Item 6)
      else if (prob.type === 'reverse_subatomic') {
        const sym = document.getElementById(`in_rev_sym_${prob.id}`).value.trim();
        const mass = parseInt(document.getElementById(`in_rev_mass_${prob.id}`).value, 10);
        const chg = parseInt(document.getElementById(`in_rev_chg_${prob.id}`).value, 10);

        state.reverseData = { symbol: sym, mass, charge: chg };
        state.userEntry = `${sym}-${mass}, Charge: ${chg}`;

        const symCorrect = sym.toUpperCase() === prob.expected.symbol.toUpperCase();
        const massCorrect = mass === prob.expected.mass;
        const chgCorrect = chg === prob.expected.charge;

        if (symCorrect && massCorrect && chgCorrect) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Element symbol, mass number, and ionic charge verified.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Values do not match subatomic counts. ${hint}`;
        }
      }

      // 6. Electron Configuration (Item 11)
      else if (prob.type === 'electron_config') {
        const raw = document.getElementById(`in_${prob.id}`).value.trim();
        state.userEntry = raw;
        const norm = raw.replace(/\s+/g, ' ').toLowerCase();
        const normStd = prob.expectedStandard.replace(/\s+/g, ' ').toLowerCase();
        const normNbl = prob.expectedNoble.replace(/\s+/g, ' ').toLowerCase();

        if (norm === normStd || norm === normNbl) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Ground-state electron configuration verified.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Configuration does not match ground state. ${hint}`;
        }
      }

      // 7. Valence and Unpaired Electrons (Item 12)
      else if (prob.type === 'valence_unpaired') {
        const val = parseInt(document.getElementById(`in_val_${prob.id}`).value, 10);
        const nVal = parseInt(document.getElementById(`in_n_${prob.id}`).value, 10);
        const unpaired = parseInt(document.getElementById(`in_unpaired_${prob.id}`).value, 10);

        state.valUnpairedData = { valence: val, highestN: nVal, unpaired };
        state.userEntry = `Valence:${val}, n:${nVal}, Unpaired:${unpaired}`;

        const isCorrect =
          val === prob.expected.valence &&
          nVal === prob.expected.highestN &&
          unpaired === prob.expected.unpaired;

        if (isCorrect) {
          state.solved = true;
          state.score = 1;
          state.feedback = 'Correct! Valence electrons, principal shell, and unpaired spins verified.';
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Incorrect quantum parameters. ${hint}`;
        }
      }

      // 8. Periodic Trends Ranking (Item 13)
      else if (prob.type === 'ranking') {
        const currentList = state.orderedElements || prob.elements;
        const currentSymbols = currentList.map((el) => el.symbol);
        state.userEntry = currentSymbols.join(' < ');
        const isCorrect = currentSymbols.join(',') === prob.expectedOrder.join(',');

        if (isCorrect) {
          state.solved = true;
          state.score = 1;
          state.feedback = `Correct! Periodic trend order verified: ${prob.expectedOrder.join(' < ')}.`;
        } else {
          state.score = 0;
          const hint = state.attempts === 1 ? prob.hint1 : prob.hint2;
          state.feedback = `Order is incorrect. ${hint}`;
        }
      }

      // 9. Quantitative Calculations (Items 7, 9, 10)
      else {
        const raw = overrideValue || document.getElementById(`in_${prob.id}`).value;
        state.userEntry = raw;

        const parsed = window.SmartParser.parse(raw);
        const res = window.SmartParser.evaluate(parsed, prob.expected);

        // Problem 10: Check color too
        if (prob.type === 'photon_energy_calc' && res.status === 'correct') {
          if (state.selectedColor !== prob.expectedColor) {
            res.status = 'color_mismatch';
            res.score = 0;
            res.feedback = `Energy calculation is correct, but selected color does not match the emission wavelength.`;
          }
        }

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

      // Check for attempt exhaustion
      const max = prob.maxAttempts || this.maxAttempts;
      if (!state.solved && state.attempts >= max) {
        state.exhausted = true;
        state.feedback += ' Attempts exhausted. Study the worked solution below.';
      }

      this.saveState();
      this.renderDeck();
    }

    // ============================================================
    // 10. REPORT GENERATOR & DIGITAL SEAL (PRINT / EXPORT)
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

      // Build QR Code pointing to verify.html with verification params
      const baseUrl =
        window.location.protocol === 'file:'
          ? 'verify.html'
          : window.location.origin + window.location.pathname.replace('unit1.html', 'verify.html');
      const verifyUrl = `${baseUrl}?name=${encodeURIComponent(this.studentName)}&score=${totalScore}&total=${total}&seal=${sealCode}&att1=${firstTry}&att2=${secondTry}&att3=${thirdTry}&m=${exhaustedCount}&run=${this.run}`;
      const qrSVG = window.generateQRCodeSVG ? window.generateQRCodeSVG(verifyUrl, 54) : '';

      // Format 8-Skill Mastery Scorecard
      const skillCardsHTML = UNIT1_SKILLS.map((skill) => {
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

      // Format clean summary parameters and student responses for 16-row matrix
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

      // Build Single A4 Page Report with Scorecard and 16-Row Matrix Table
      const printContainer = document.getElementById('studyReportSheet');
      printContainer.innerHTML = `
        <div class="print-receipt-header">
          <div class="print-title-area">
            <h2>XL Chem Practice Receipt</h2>
            <p><b>Student:</b> ${escapeHtml(this.studentName)} &nbsp;|&nbsp; <b>Unit 1:</b> Atomic Structure &amp; Trends &nbsp;|&nbsp; <b>Attempt:</b> Run #${this.run}</p>
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
          <b>Unit 1 Quick Reference Key:</b> c = λν (3.00 × 10⁸ m/s) &middot; E = hν = hc/λ (h = 6.626 × 10⁻³⁴ J·s) &middot; Zeff = Z - S &middot; F ∝ (q₁q₂)/r² &middot; Avg Mass = Σ(fractional abund × mass)
        </div>

        <div class="print-receipt-footer" style="margin-top:4pt;">
          <span>SciencePractice.app &middot; Accelerated Chemistry Practice Suite (#xlchem)</span>
          <span>Practice receipt &middot; Check code: ${sealCode} (catches hand edits; does not prove who did the work)</span>
        </div>
      `;

      // Trigger standard browser print
      window.print();
    }

    getProblemGivenSummary(p) {
      if (p.id === 'p1_separation_mcq') return 'Macroscopic separation scenario';
      if (p.id === 'p2_particle_model') return 'Particulate matter chamber';
      if (p.id === 'p3_rutherford_mcq') return 'Alpha scattering evidence';
      if (p.id === 'p4_history_fill') return 'Historic model postulate';
      if (p.id === 'p5_subatomic_grid') return `${p.data.symbol} (${p.data.name})`;
      if (p.id === 'p6_reverse_subatomic') return `p⁺:${p.expected.mass - p.expected.charge}, n⁰, e⁻`;
      if (p.id === 'p7_atomic_mass') return `${p.elementName} isotope system`;
      if (p.id === 'p8_mass_spec_mcq') return 'Mass spectrum isotopic peaks';
      if (p.id === 'p9_wave_eq') return `λ = ${p.wavelengthNm} nm`;
      if (p.id === 'p10_photon_energy') return `λ = ${p.stem.match(/\d+ nm/)[0]}`;
      if (p.id === 'p11_electron_config') return `${p.stem.match(/<span class="given-highlight">(.*?)<\/span>/)[1]}`;
      if (p.id === 'p12_valence_unpaired') return `${p.expected.valence} val, highest n=${p.expected.highestN}`;
      if (p.id === 'p13_trends_ranking') return `${p.property} ranking`;
      if (p.id === 'p14_coulombic_mcq') return 'Coulombic force justification';
      if (p.id === 'p15_family_mcq') return 'Periodic family characteristics';
      if (p.id === 'p16_reactivity_trend') return 'Comparative reactivity trend';
      return 'Unit 1 practice item';
    }
  }

  // Initialize on DOM load
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
