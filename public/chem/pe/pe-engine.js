/**
 * pe-engine.js - Chemistry Performance Expectation Adaptive Engine
 * Drives the Level 2 / 3 / 1 item ladder, the results page, and printed receipts with a check code.
 * The check code catches a receipt edited by hand. Its key ships in this file, so it is not proof.
 * Scoring rules live in pe-scoring.js (loaded first), not here.
 * Strict Zero Em-Dashes Invariant observed.
 */

(function (global) {
  'use strict';

  // Seeded PRNG: Mulberry32
  function createMulberry32(seedStr) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 15), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return ((h = Math.imul(h ^ (h >>> 16), 374761393)) >>> 0) / 4294967296;
    };
  }

  // Secret salt for digital seal
  const SEAL_SALT = 'PE-CHEM-2026-NIST-VERIFY';

  // Seal v2 (2026-11) adds the per-skill level string, e.g. "4332". Receipts saved before
  // that carry no levels and use the v1 message; verify.html checks both.
  async function computeDigitalSeal(studentName, seed, score, total, dateStr, levels) {
    const base = `${studentName.trim().toLowerCase()}:${seed}:${score}:${total}:${dateStr}`;
    const message = levels ? `${base}:${levels}:${SEAL_SALT}` : `${base}:${SEAL_SALT}`;
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 4).toUpperCase()}-${hex.slice(4, 8).toUpperCase()}`;
  }

  const SKILL_LESSON_MAP = {
    // HS-PS1-1
    'PS1-1.1': { lesson: 'Lesson 1-1b (Periodic Trends)', url: '../lessons/1-1b_periodic-trends-reactivity.html' },
    'PS1-1.2': { lesson: 'Lesson 1-1a (Atomic Structure)', url: '../lessons/1-1a_atomic-structure-electron-config.html' },
    'PS1-1.3': { lesson: 'Lesson 1-2a (Bonding & Electronegativity)', url: '../lessons/1-2a_bonding-electronegativity.html' },
    'PS1-1.4': { lesson: 'Lesson 1-1b (Reactivity of Metals)', url: '../lessons/1-1b_periodic-trends-reactivity.html' },
    'PS1-1.5': { lesson: 'Lesson 1-3a (Lewis Structures & Valence)', url: '../lessons/1-3a_lewis-structures.html' },
    'PS1-1.6': { lesson: 'Lesson 1-1b (Alkali Metal Hazards)', url: '../lessons/1-1b_periodic-trends-reactivity.html' },

    // HS-PS1-2
    'PS1-2.1': { lesson: 'Lesson 1-2a (Bonding & Electronegativity)', url: '../lessons/1-2a_bonding-electronegativity.html' },
    'PS1-2.2': { lesson: 'Lesson 1-2b (Molecular Polarity)', url: '../lessons/1-2b_molecular-polarity.html' },
    'PS1-2.3': { lesson: 'Lesson 1-2c (Chemical Nomenclature)', url: '../lessons/1-2c_chemical-nomenclature.html' },
    'PS1-2.4': { lesson: 'Lesson 2-2a (Physical vs. Chemical Change)', url: '../lessons/2-2a_physical-chemical-change.html' },
    'PS1-2.5': { lesson: 'Lesson 1-2e (Reaction Types & Balancing)', url: '../lessons/1-2e_reaction-types-balancing.html' },
    'PS1-2.6': { lesson: 'Lesson 1-2e (Reaction Balancing & Conservation)', url: '../lessons/1-2e_reaction-types-balancing.html' },

    // HS-PS1-3
    'PS1-3.7': { lesson: 'Lesson 1-2b (Molecular Polarity)', url: '../lessons/1-2b_molecular-polarity.html' },
    'PS1-3.1': { lesson: 'Lesson 1-3b (IMFs & Properties)', url: '../lessons/1-3b_imfs-properties.html' },
    'PS1-3.8': { lesson: 'Lesson 1-2a (Bonding & Electronegativity)', url: '../lessons/1-2a_bonding-electronegativity.html' },
    'PS1-3.2': { lesson: 'Lesson 1-3b (IMFs & Bulk Properties)', url: '../lessons/1-3b_imfs-properties.html' },
    'PS1-3.3': { lesson: 'Lesson 1-3b (Heating Curves & Energy)', url: '../lessons/1-3b_imfs-properties.html' },
    'PS1-3.4': { lesson: 'Lesson 1-3b (Experimental Controls)', url: '../lessons/1-3b_imfs-properties.html' },
    'PS1-3.5': { lesson: 'Lesson 1-3b (Evaporation Data Trends)', url: '../lessons/1-3b_imfs-properties.html' },
    'PS1-3.6': { lesson: 'Lesson 1-3b (Apparatus Limitations)', url: '../lessons/1-3b_imfs-properties.html' },

    // HS-PS1-4
    'PS1-4.1': { lesson: 'Lesson 3-14a (Bond Energy Principle)', url: '../lessons/3-14a_bond-energy-reaction-profiles.html' },
    'PS1-4.2': { lesson: 'Lesson 3-14a (Reaction Coordinate Profiles)', url: '../lessons/3-14a_bond-energy-reaction-profiles.html' },
    'PS1-4.3': { lesson: 'Lesson 3-14a (Enthalpy from Bond Energies)', url: '../lessons/3-14a_bond-energy-reaction-profiles.html' },
    'PS1-4.4': { lesson: 'Lesson 3-1c (System vs. Surroundings & Calorimetry)', url: '../lessons/3-1c_calorimetry-energy-systems.html' },
    'PS1-4.5': { lesson: 'Lesson 3-14a (Bond Strength & Stability)', url: '../lessons/3-14a_bond-energy-reaction-profiles.html' },
    'PS1-4.6': { lesson: 'Lesson 3-14a (The Transition State & Activation Barrier)', url: '../lessons/3-14a_bond-energy-reaction-profiles.html' },

    // HS-PS1-5
    'PS1-5.1': { lesson: 'Lesson 4-1a (Collision Theory Foundations)', url: '../lessons/4-1a_reaction-rates-collision-theory.html' },
    'PS1-5.2': { lesson: 'Lesson 4-1a (Temperature & Collision Energy)', url: '../lessons/4-1a_reaction-rates-collision-theory.html' },
    'PS1-5.3': { lesson: 'Lesson 4-1a (Concentration & Pressure Effects)', url: '../lessons/4-1a_reaction-rates-collision-theory.html' },
    'PS1-5.4': { lesson: 'Lesson 4-1a (Surface Area & Reaction Rate)', url: '../lessons/4-1a_reaction-rates-collision-theory.html' },
    'PS1-5.5': { lesson: 'Lesson 4-1b (Catalysts & Alternative Pathways)', url: '../lessons/4-1b_catalysis-and-enzymes.html' },
    'PS1-5.6': { lesson: 'Lesson 4-1a (Experimental Rate Investigations)', url: '../lessons/4-1a_reaction-rates-collision-theory.html' },

    // HS-PS1-6
    'PS1-6.1': { lesson: 'Lesson 4-6a (Dynamic Equilibrium & Rates)', url: '../lessons/4-6a_dynamic-equilibrium-le-chatelier.html' },
    'PS1-6.2': { lesson: 'Lesson 4-6a (Concentration Levers & Shifts)', url: '../lessons/4-6a_dynamic-equilibrium-le-chatelier.html' },
    'PS1-6.3': { lesson: 'Lesson 4-6a (Temperature Stress & Directionality)', url: '../lessons/4-6a_dynamic-equilibrium-le-chatelier.html' },
    'PS1-6.4': { lesson: 'Lesson 4-6a (Pressure, Volume & Gas Moles)', url: '../lessons/4-6a_dynamic-equilibrium-le-chatelier.html' },
    'PS1-6.5': { lesson: 'Lesson 4-6a (Haber-Bosch & Yield Optimization)', url: '../lessons/4-6a_dynamic-equilibrium-le-chatelier.html' },
    'PS1-6.6': { lesson: 'Lesson 4-6b (Coupled Blood Buffer Equilibria)', url: '../lessons/4-6b_human-equilibrium-blood-buffers.html' },

    // HS-PS1-7
    'PS1-7.1': { lesson: 'Lesson 2-7a (The Mole & Molar Mass)', url: '../lessons/2-7a_the-mole-molar-mass.html' },
    'PS1-7.2': { lesson: 'Lesson 2-7a (Molar Mass Determination)', url: '../lessons/2-7a_the-mole-molar-mass.html' },
    'PS1-7.3': { lesson: 'Lesson 2-7b (Mole Conversions)', url: '../lessons/2-7b_mole-conversions.html' },
    'PS1-7.4': { lesson: 'Lesson 2-7c (Stoichiometry & Mole Ratios)', url: '../lessons/2-7c_stoichiometry.html' },
    'PS1-7.5': { lesson: 'Lesson 2-7c (Limiting Reactants & BCA Tables)', url: '../lessons/2-7c_stoichiometry.html' },
    'PS1-7.6': { lesson: 'Lesson 2-7c (Theoretical Yield & Conservation)', url: '../lessons/2-7c_stoichiometry.html' },

    // HS-PS1-8
    'PS1-8.1': { lesson: 'Lesson 5-8a (Nuclear Composition & Stability)', url: '../lessons/5-8a_nuclear-reactions-radioactive-decay.html' },
    'PS1-8.2': { lesson: 'Lesson 5-8a (Alpha & Beta Radioactive Decay)', url: '../lessons/5-8a_nuclear-reactions-radioactive-decay.html' },
    'PS1-8.3': { lesson: 'Lesson 5-8a (Gamma Radiation & Shielding)', url: '../lessons/5-8a_nuclear-reactions-radioactive-decay.html' },
    'PS1-8.4': { lesson: 'Lesson 5-8a (Radiometric Half-Life Kinetics)', url: '../lessons/5-8a_nuclear-reactions-radioactive-decay.html' },
    'PS1-8.5': { lesson: 'Lesson 5-8a (Nuclear Fission & Chain Reactions)', url: '../lessons/5-8a_nuclear-reactions-radioactive-decay.html' },
    'PS1-8.6': { lesson: 'Lesson 5-1a (Solar Fusion & Mass Defect)', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },

    // HS-PS2-6
    'PS2-6.1': { lesson: 'Lesson 2-6a (Fatty Acid Geometry & Packing)', url: '../lessons/2-6a_structure-property-argument.html' },
    'PS2-6.2': { lesson: 'Lesson 2-6a (LDFs in Bulk Lipids)', url: '../lessons/2-6a_structure-property-argument.html' },
    'PS2-6.3': { lesson: 'Lesson 2-6a (Melting Points & Physical States)', url: '../lessons/2-6a_structure-property-argument.html' },
    'PS2-6.4': { lesson: 'Lesson 2-6a (5-Step Material Argumentation)', url: '../lessons/2-6a_structure-property-argument.html' },
    'PS2-6.5': { lesson: 'Lesson 2-6a (Structure-to-Hazard & GHS)', url: '../lessons/2-6a_structure-property-argument.html' },

    // HS-PS3-1
    'PS3-1.1': { lesson: 'Lesson 3-1a (Temperature & Thermal Energy)', url: '../lessons/3-1a_temperature-heat-specific-heat.html' },
    'PS3-1.2': { lesson: 'Lesson 3-1a (Specific Heat Modeling)', url: '../lessons/3-1a_temperature-heat-specific-heat.html' },
    'PS3-1.3': { lesson: 'Lesson 3-1b (Phase Transitions & Latent Heat)', url: '../lessons/3-1b_phase-changes-heating-curves.html' },
    'PS3-1.4': { lesson: 'Lesson 3-1b (Multi-Stage Heating Curves)', url: '../lessons/3-1b_phase-changes-heating-curves.html' },
    'PS3-1.5': { lesson: 'Lesson 3-1c (Calorimetry & Energy Balances)', url: '../lessons/3-1c_calorimetry-energy-systems.html' },
    'PS3-1.6': { lesson: 'Lesson 3-1c (LOL Diagrams & Limitations)', url: '../lessons/3-1c_calorimetry-energy-systems.html' },

    // HS-PS3-4
    'PS3-4.1': { lesson: 'Lesson 3-4a (Second Law & Direction of Heat Flow)', url: '../lessons/3-4a_thermal-equilibrium-heat-transfer.html' },
    'PS3-4.2': { lesson: 'Lesson 3-4a (Collisions at the Boundary)', url: '../lessons/3-4a_thermal-equilibrium-heat-transfer.html' },
    'PS3-4.3': { lesson: 'Lesson 3-4a (Thermal Equilibrium & Dynamic Balance)', url: '../lessons/3-4a_thermal-equilibrium-heat-transfer.html' },
    'PS3-4.4': { lesson: 'Lesson 3-4a (Why Heat Flow Is One-Way)', url: '../lessons/3-4a_thermal-equilibrium-heat-transfer.html' },
    'PS3-4.5': { lesson: 'Lesson 3-4a (Closed-System Investigations)', url: '../lessons/3-4a_thermal-equilibrium-heat-transfer.html' },
    'PS3-4.6': { lesson: 'Lesson 3-4a (Calculating Equilibrium Temperature)', url: '../lessons/3-4a_thermal-equilibrium-heat-transfer.html' },

    // HS-PS4-4
    'PS4-4.1': { lesson: 'Lesson 5-4a (Planck-Einstein Quantum Relation)', url: '../lessons/5-4a_electromagnetic-radiation-matter.html' },
    'PS4-4.2': { lesson: 'Lesson 5-4a (Matter Absorption Mechanisms)', url: '../lessons/5-4a_electromagnetic-radiation-matter.html' },
    'PS4-4.3': { lesson: 'Lesson 5-4a (Ionization Threshold & DNA Damage)', url: '../lessons/5-4a_electromagnetic-radiation-matter.html' },
    'PS4-4.4': { lesson: 'Lesson 5-4a (Evaluating Claims: Frequency vs Intensity)', url: '../lessons/5-4a_electromagnetic-radiation-matter.html' },
    'PS4-4.5': { lesson: 'Lesson 5-4a (Protective Shielding & Sunscreen Physics)', url: '../lessons/5-4a_electromagnetic-radiation-matter.html' },
    'PS4-4.6': { lesson: 'Lesson 5-4a (Source Reliability & Epidemiology)', url: '../lessons/5-4a_electromagnetic-radiation-matter.html' },

    // HS-ESS1-1
    'ESS1-1.1': { lesson: 'Lesson 5-1a (Gravity Against Outward Pressure)', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },
    'ESS1-1.2': { lesson: 'Lesson 5-1a (Hydrogen Fusion in the Core)', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },
    'ESS1-1.3': { lesson: 'Lesson 5-1a (Nuclear vs. Chemical Energy Scale)', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },
    'ESS1-1.4': { lesson: 'Lesson 5-1a (How Energy Reaches Earth)', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },
    'ESS1-1.5': { lesson: 'Lesson 5-1a (Star Mass, Brightness & Lifespan)', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },
    'ESS1-1.6': { lesson: 'Lesson 5-1a (When the Sun\'s Hydrogen Runs Out)', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },

    // HS-ESS1-2
    'ESS1-2.1': { lesson: 'Lesson 5-2a (Redshift & Galaxy Spectra)', url: '../lessons/5-2a_big-bang-cosmic-evidence.html' },
    'ESS1-2.2': { lesson: 'Lesson 5-2a (Expanding Space & Galaxy Motion)', url: '../lessons/5-2a_big-bang-cosmic-evidence.html' },
    'ESS1-2.3': { lesson: 'Lesson 5-2a (Primordial Hydrogen & Helium)', url: '../lessons/5-2a_big-bang-cosmic-evidence.html' },
    'ESS1-2.4': { lesson: 'Lesson 5-2a (The Cosmic Microwave Background)', url: '../lessons/5-2a_big-bang-cosmic-evidence.html' },
    'ESS1-2.5': { lesson: 'Lesson 5-2a (Looking Far Away Means Looking Back in Time)', url: '../lessons/5-2a_big-bang-cosmic-evidence.html' },
    'ESS1-2.6': { lesson: 'Lesson 5-2a (Three Lines of Big Bang Evidence)', url: '../lessons/5-2a_big-bang-cosmic-evidence.html' },

    // HS-ESS1-3
    'ESS1-3.1': { lesson: 'Lesson 5-3a (How Star Mass Decides What It Makes)', url: '../lessons/5-3a_stellar-nucleosynthesis-element-origins.html' },
    'ESS1-3.2': { lesson: 'Lesson 5-3a (Fusion Stages Across a Star\'s Life)', url: '../lessons/5-3a_stellar-nucleosynthesis-element-origins.html' },
    'ESS1-3.3': { lesson: 'Lesson 5-3a (Why Core Fusion Stops at Iron)', url: '../lessons/5-3a_stellar-nucleosynthesis-element-origins.html' },
    'ESS1-3.4': { lesson: 'Lesson 5-3a (Supernovae & Neutron-Star Collisions)', url: '../lessons/5-3a_stellar-nucleosynthesis-element-origins.html' },
    'ESS1-3.5': { lesson: 'Lesson 5-3a (Where Every Element Came From)', url: '../lessons/5-3a_stellar-nucleosynthesis-element-origins.html' },
    'ESS1-3.6': { lesson: 'Lesson 5-3a (Cosmic Recycling & Stardust)', url: '../lessons/5-3a_stellar-nucleosynthesis-element-origins.html' }
  };

  const PE_RESOURCE_MAP = {
    'HS-PS1-1': {
      lesson: { title: 'Lesson 1-1b: Periodic Trends', url: '../lessons/1-1b_periodic-trends-reactivity.html' },
      sim: { title: 'Periodic Table Explorer', simSlug: 'periodic_table', icon: '📋' }
    },
    'HS-PS1-2': {
      lesson: { title: 'Lesson 1-2a: Chemical Bonding', url: '../lessons/1-2a_bonding-electronegativity.html' },
      sim: { title: 'Covalent & Ionic Bonding', simSlug: 'covalent_bonding', icon: '🔗' }
    },
    'HS-PS1-3': {
      lesson: { title: 'Lesson 1-3b: IMFs & Properties', url: '../lessons/1-3b_imfs-properties.html' },
      sim: { title: 'Phase Changes & IMFs', simSlug: 'phase_change', icon: '🌡️' }
    },
    'HS-PS1-4': {
      lesson: { title: 'Lesson 3-14a: Bond Energy Profiles', url: '../lessons/3-14a_bond-energy-reaction-profiles.html' },
      sim: { title: 'Reaction Potential Energy', simSlug: 'reaction_kinetics', icon: '💥' }
    },
    'HS-PS1-5': {
      lesson: { title: 'Lesson 4-1a: Collision Theory & Rates', url: '../lessons/4-1a_reaction-rates-collision-theory.html' },
      sim: { title: 'Collision Theory & Kinetics', simSlug: 'reaction_kinetics', icon: '💥' }
    },
    'HS-PS1-6': {
      lesson: { title: 'Lesson 4-6a: Dynamic Equilibrium', url: '../lessons/4-6a_dynamic-equilibrium-le-chatelier.html' },
      sim: { title: 'Arterial Blood Buffers', simSlug: 'blood_buffer', icon: '🫁' }
    },
    'HS-PS1-7': {
      lesson: { title: 'Lesson 2-7c: Stoichiometry', url: '../lessons/2-7c_stoichiometry.html' },
      sim: { title: 'Build an Atom & Mass', simSlug: 'build_an_atom', icon: '⚛️' }
    },
    'HS-PS1-8': {
      lesson: { title: 'Lesson 5-8a: Nuclear Reactions', url: '../lessons/5-8a_nuclear-reactions-radioactive-decay.html' },
      sim: { title: 'Nuclear Decay Kinetics', simSlug: 'nuclear_decay', icon: '⏳' }
    },
    'HS-PS2-6': {
      lesson: { title: 'Lesson 2-6a: Structure & Properties', url: '../lessons/2-6a_structure-property-argument.html' },
      sim: { title: 'Molecular Packing & Phase', simSlug: 'phase_change', icon: '🌡️' }
    },
    'HS-PS3-1': {
      lesson: { title: 'Lesson 3-1c: Calorimetry Balances', url: '../lessons/3-1c_calorimetry-energy-systems.html' },
      sim: { title: 'Thermal & Thermochemistry Studio (Calorimetry)', simSlug: 'calorimetry', icon: '☕' }
    },
    'HS-PS3-4': {
      lesson: { title: 'Lesson 3-4a: Thermal Equilibrium', url: '../lessons/3-4a_thermal-equilibrium-heat-transfer.html' },
      sim: { title: 'Thermal Equilibrium Model', simSlug: 'phase_change', icon: '🌡️' }
    },
    'HS-PS4-4': {
      lesson: { title: 'Lesson 5-4a: Electromagnetic Radiation', url: '../lessons/5-4a_electromagnetic-radiation-matter.html' },
      sim: { title: 'Atomic Emission Spectra', simSlug: 'periodic_table', icon: '🌈' }
    },
    'HS-ESS1-1': {
      lesson: { title: 'Lesson 5-1a: Stellar Solar Fusion', url: '../lessons/5-1a_stellar-fusion-solar-energy.html' },
      sim: { title: 'Fusion Chains & Nuclei', simSlug: 'build_an_atom', icon: '⚛️' }
    },
    'HS-ESS1-2': {
      lesson: { title: 'Lesson 5-2a: Big Bang Evidence', url: '../lessons/5-2a_big-bang-cosmic-evidence.html' },
      sim: { title: 'Cosmic Abundance & Spectra', simSlug: 'periodic_table', icon: '🌌' }
    },
    'HS-ESS1-3': {
      lesson: { title: 'Lesson 5-3a: Stellar Nucleosynthesis', url: '../lessons/5-3a_stellar-nucleosynthesis-element-origins.html' },
      sim: { title: 'Stellar Nucleosynthesis', simSlug: 'build_an_atom', icon: '⚛️' }
    }
  };

  function getPeBank(peId) {
    const key = 'PE_DATA_' + String(peId || '').toUpperCase().replace(/-/g, '_');
    return global[key] || null;
  }

  const Scoring = global.PEScoring;

  // The student's name and saved receipts come from the URL and from browser storage, so they are
  // escaped before they go into any HTML. These pages share an origin with the signed-in app.
  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function newRunNonce() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  // When a skill has two Level 2 items, the run picks which one places the student; the
  // other is kept for the check or the retry, so no item repeats inside a skill.
  function newSkillProgress(skill, rng) {
    const alt = Scoring.hasAlt(skill);
    const altFirst = alt && rng() < 0.5;
    return {
      stage: 'L2',
      score: 0,
      done: false,
      path: [],
      l2Primary: altFirst ? 'diagnosticAlt' : 'diagnostic',
      l2Other: alt ? (altFirst ? 'diagnostic' : 'diagnosticAlt') : null
    };
  }

  const LEVEL_TAGS = {
    4: { cls: 'tag-mastered', chip: 'mastered', icon: '&#9733;' },
    3: { cls: 'tag-proficient', chip: 'proficient', icon: '&#10003;' },
    2: { cls: 'tag-developing', chip: 'developing', icon: '&#9651;' },
    1: { cls: 'tag-needs-work', chip: 'needs-work', icon: '&#9888;' }
  };

  function levelLabel(score) {
    return score ? `${Scoring.LEVEL_NAMES[score]} (${score})` : 'Not finished';
  }

  function formatMedian(m) {
    return Number.isInteger(m) ? String(m) : m.toFixed(1);
  }

  const HUB_CARDS = [
    {
      peId: 'HS-PS1-1',
      unitLabel: 'Unit 1',
      title: 'Periodic Trends & Atomic Structure',
      blurb: 'Read the periodic table to predict how atoms behave. Compare atomic radius, ionization energy, and electronegativity from shell count and nuclear pull.'
    },
    {
      peId: 'HS-PS1-2',
      unitLabel: 'Units 1 & 2',
      title: 'Chemical Reactions, Bonding & Conservation',
      blurb: 'Use outer electrons and electronegativity to tell ionic, polar, and nonpolar bonds apart. Name compounds, spot chemical changes, and balance equations.'
    },
    {
      peId: 'HS-PS1-3',
      unitLabel: 'Unit 1',
      title: 'Electrical Forces & Intermolecular Forces',
      blurb: 'Connect boiling point, vapor pressure, and surface tension to the attractions between molecules. Compare London dispersion, dipole-dipole, and hydrogen bonds.'
    },
    {
      peId: 'HS-PS1-7',
      unitLabel: 'Unit 2',
      title: 'The Mole, Stoichiometry & Mass Conservation',
      blurb: 'Count atoms by weighing them. Convert between grams and moles, use balanced equations as mole recipes, and find the limiting reactant with a BCA table.'
    },
    {
      peId: 'HS-PS2-6',
      unitLabel: 'Unit 2',
      title: 'Structure-Property Relationships & Argumentation',
      blurb: 'Explain why straight chains pack tightly as solids while bent chains stay liquid. Build a clear argument from molecular shape to IMF strength to melting point.'
    },
    {
      peId: 'HS-PS1-4',
      unitLabel: 'Unit 3',
      title: 'Bond Energy & Reaction Energetics',
      blurb: 'Compare the energy it takes to break reactant bonds with the energy released when product bonds form. Read activation barriers and enthalpy changes on energy profiles.'
    },
    {
      peId: 'HS-PS1-5',
      unitLabel: 'Unit 4',
      title: 'Reaction Rates, Collision Theory & Catalysis',
      blurb: 'Predict how temperature, concentration, surface area, and catalysts change reaction speed. Track how often particles collide and how many clear the activation barrier.'
    },
    {
      peId: 'HS-PS1-6',
      unitLabel: 'Unit 4',
      title: 'Dynamic Equilibrium & Le Chatelier\'s Principle',
      blurb: 'Predict which way a reversible reaction shifts when you change concentration, temperature, or pressure. Apply equilibrium shifts to ammonia synthesis and blood buffers.'
    },
    {
      peId: 'HS-PS1-8',
      unitLabel: 'Unit 5',
      title: 'Nuclear Processes, Decay & Transmutation',
      blurb: 'Balance nuclear equations for alpha, beta, and gamma decay. Track how much of a sample remains after each half-life, and compare fission and fusion with chemical reactions.'
    },
    {
      peId: 'HS-PS3-1',
      unitLabel: 'Unit 3',
      title: 'Computational Thermal Energy & Calorimetry',
      blurb: 'Calculate heat transfer with q = mcΔT and phase changes on heating curves. Track energy flow between a system and its surroundings using calorimetry and LOL diagrams.'
    },
    {
      peId: 'HS-PS3-4',
      unitLabel: 'Unit 3',
      title: 'Thermal Equilibrium in Closed Systems',
      blurb: 'Follow energy transfer when a hot object and a cold object mix in a closed container. Explain why heat flows from hot to cold until both reach the same temperature.'
    },
    {
      peId: 'HS-PS4-4',
      unitLabel: 'Unit 5',
      title: 'Electromagnetic Radiation & Matter',
      blurb: 'Relate photon energy to frequency and wavelength. Separate harmless low-frequency waves from ionizing UV, X-rays, and gamma rays that can break DNA bonds.'
    },
    {
      peId: 'HS-ESS1-1',
      unitLabel: 'Unit 5',
      title: 'Solar Fusion & Lifespan of the Sun',
      blurb: 'Model how gravity and fusion pressure keep the Sun stable for billions of years. Trace how hydrogen fuses into helium in the core and how that energy reaches Earth.'
    },
    {
      peId: 'HS-ESS1-2',
      unitLabel: 'Unit 5',
      title: 'The Big Bang & Astronomical Evidence',
      blurb: 'Weigh the three main lines of evidence for the Big Bang: the redshift of distant galaxies, the 3:1 ratio of hydrogen to helium, and cosmic microwave background radiation.'
    },
    {
      peId: 'HS-ESS1-3',
      unitLabel: 'Unit 5',
      title: 'Stellar Nucleosynthesis of Elements',
      blurb: 'Trace where the elements on the periodic table were forged. Follow fusion shells up to iron inside stars, and see how supernovae and neutron-star collisions build heavier atoms.'
    }
  ];

  function renderCardResourceLinks(peId) {
    const res = PE_RESOURCE_MAP[peId];
    if (!res) return '';
    return `
      <div class="pe-card-links">
        <a class="pe-card-link" href="${res.lesson.url}" title="Open textbook chapter: ${res.lesson.title}">
          <span class="pe-card-link-icon" aria-hidden="true">&#128214;</span>
          <span class="pe-card-link-text">
            <span class="pe-card-link-sub">Textbook Chapter</span>
            <strong>${res.lesson.title}</strong>
          </span>
        </a>
        <a class="pe-card-link" href="/?page=${res.sim.simSlug}" target="_blank" rel="noopener noreferrer" title="Launch simulation: ${res.sim.title}">
          <span class="pe-card-link-icon" aria-hidden="true">${res.sim.icon}</span>
          <span class="pe-card-link-text">
            <span class="pe-card-link-sub">Simulation Hub</span>
            <strong>${res.sim.title}</strong>
          </span>
        </a>
      </div>
    `;
  }

  function renderStationResourceBar(peId) {
    const res = PE_RESOURCE_MAP[peId];
    if (!res) return '';
    return `
      <div class="station-resource-bar">
        <span class="station-resource-label">Learning Resources</span>
        <div class="station-resource-links">
          <a class="station-resource-btn" href="${res.lesson.url}" target="_blank" rel="noopener noreferrer" title="Open chapter in new tab">
            <span class="station-resource-icon" aria-hidden="true">&#128214;</span>
            <span>${res.lesson.title}</span>
            <span class="station-resource-arr">&rarr;</span>
          </a>
          <a class="station-resource-btn" href="/?page=${res.sim.simSlug}" target="_blank" rel="noopener noreferrer" title="Open simulation in new tab">
            <span class="station-resource-icon" aria-hidden="true">${res.sim.icon}</span>
            <span>${res.sim.title}</span>
            <span class="station-resource-arr">&rarr;</span>
          </a>
        </div>
      </div>
    `;
  }

  // Lowest results first: Needs Practice and Developing are priorities, Proficient gets a
  // reinforcement tip while there is room. Mastered skills get none.
  function generateStudyTips(skills, skillProgress) {
    const tips = [];
    const scored = skills
      .map(s => ({ s, score: Scoring.skillScore(skillProgress[s.id]) }))
      .filter(x => x.score > 0);
    const needsWork = scored.filter(x => x.score <= 2).sort((a, b) => a.score - b.score).map(x => x.s);
    const reinforce = scored.filter(x => x.score === 3).map(x => x.s);

    needsWork.forEach(s => {
      const mapping = SKILL_LESSON_MAP[s.id] || { lesson: 'Textbook Lesson', url: '../index.html' };
      tips.push({
        type: 'priority',
        tag: 'Priority Review',
        skillId: s.id,
        title: s.title,
        tip: s.watchOut,
        lesson: mapping.lesson,
        url: mapping.url
      });
    });

    reinforce.forEach(s => {
      if (tips.length >= 3) return;
      const mapping = SKILL_LESSON_MAP[s.id] || { lesson: 'Textbook Lesson', url: '../index.html' };
      tips.push({
        type: 'reinforce',
        tag: 'Reinforcement',
        skillId: s.id,
        title: s.title,
        tip: s.watchOut,
        lesson: mapping.lesson,
        url: mapping.url
      });
    });

    if (tips.length === 0) {
      tips.push({
        type: 'mastery',
        tag: 'Coulombic Reasoning',
        skillId: 'Exam Move',
        title: 'Causal Explanations on FRQs',
        tip: 'On free-response questions, never state periodic trends or IMF strengths alone. Always explain the underlying electrostatic attraction: nuclear pull (protons) versus electron distance and inner-shell shielding.',
        lesson: 'Lesson Exam Sections',
        url: '../index.html'
      });
      tips.push({
        type: 'mastery',
        tag: 'Spaced Retrieval',
        skillId: 'Retention',
        title: 'Active Recall Schedule',
        tip: 'To cement full mastery into permanent memory, re-test this PE in Cram Mode or Spaced Repetition in 3 to 5 days.',
        lesson: 'Chemistry Practice Center',
        url: '../index.html'
      });
    }

    return tips;
  }

  function prepareItem(rawItem, rng) {
    if (!rawItem) return null;
    const item = JSON.parse(JSON.stringify(rawItem));

    // Handle MCQ options shuffling: randomize order so correct answer is not always A
    if ((item.type === 'mcq' || !item.type) && Array.isArray(item.options)) {
      const correctIdx = item.correctIndex !== undefined ? item.correctIndex : item.correct;
      const paired = item.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === correctIdx
      }));
      for (let i = paired.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const temp = paired[i]; paired[i] = paired[j]; paired[j] = temp;
      }
      item.options = paired.map(p => p.text);
      item.correctIndex = paired.findIndex(p => p.isCorrect);
    }

    // Handle Two-Tier shuffling
    if (item.type === 'two_tier') {
      if (Array.isArray(item.tier1Options)) {
        const paired1 = item.tier1Options.map((opt, idx) => ({ text: opt, isCorrect: idx === item.correctTier1 }));
        for (let i = paired1.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          const temp = paired1[i]; paired1[i] = paired1[j]; paired1[j] = temp;
        }
        item.tier1Options = paired1.map(p => p.text);
        item.correctTier1 = paired1.findIndex(p => p.isCorrect);
      }
      if (Array.isArray(item.tier2Options)) {
        const paired2 = item.tier2Options.map((opt, idx) => ({ text: opt, isCorrect: idx === item.correctTier2 }));
        for (let i = paired2.length - 1; i > 0; i--) {
          const j = Math.floor(rng() * (i + 1));
          const temp = paired2[i]; paired2[i] = paired2[j]; paired2[j] = temp;
        }
        item.tier2Options = paired2.map(p => p.text);
        item.correctTier2 = paired2.findIndex(p => p.isCorrect);
      }
    }

    // Handle Multi-Select shuffling
    if (item.type === 'multi_select' && Array.isArray(item.options)) {
      const paired = item.options.map((opt, idx) => ({
        text: opt,
        isCorrect: (item.correctIndices || []).includes(idx)
      }));
      for (let i = paired.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const temp = paired[i]; paired[i] = paired[j]; paired[j] = temp;
      }
      item.options = paired.map(p => p.text);
      item.correctIndices = paired.map((p, idx) => p.isCorrect ? idx : -1).filter(idx => idx !== -1);
    }

    // Handle Ranking initial scrambling
    if (item.type === 'ranking' && Array.isArray(item.items)) {
      const items = item.items.slice();
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        const temp = items[i]; items[i] = items[j]; items[j] = temp;
      }
      if (item.correctOrder && items.join('||') === item.correctOrder.join('||') && items.length > 1) {
        const temp = items[0]; items[0] = items[1]; items[1] = temp;
      }
      item.initialOrder = items;
    }

    return item;
  }

  // Chemical formula & notation formatter
  const COMMON_FORMULAS = [
    [/\bCH3-O-CH3\b/g, 'CH₃-O-CH₃'],
    [/\bCH2Cl2\b/g, 'CH₂Cl₂'],
    [/\bCH3Cl\b/g, 'CH₃Cl'],
    [/\bCH3OH\b/g, 'CH₃OH'],
    [/\bC3H8O3\b/g, 'C₃H₈O₃'],
    [/\bC3H8O\b/g, 'C₃H₈O'],
    [/\bC3H6O\b/g, 'C₃H₆O'],
    [/\bCCl4\b/g, 'CCl₄'],
    [/\bC3H8\b/g, 'C₃H₈'],
    [/\bC2H6\b/g, 'C₂H₆'],
    [/\bC6H12O6\b/g, 'C₆H₁₂O₆'],
    [/\bC18H36O2\b/g, 'C₁₈H₃₆O₂'],
    [/\bC18H34O2\b/g, 'C₁₈H₃₄O₂'],
    [/\bNH3\b/g, 'NH₃'],
    [/\bBF3\b/g, 'BF₃'],
    [/\bCH4\b/g, 'CH₄'],
    [/\bCO2\b/g, 'CO₂'],
    [/\bH2O\b/g, 'H₂O'],
    [/\bO2\b/g, 'O₂'],
    [/\bN2\b/g, 'N₂'],
    [/\bCl2\b/g, 'Cl₂'],
    [/\bH2\b/g, 'H₂'],
    [/\bF2\b/g, 'F₂'],
    [/\bBr2\b/g, 'Br₂'],
    [/\bI2\b/g, 'I₂'],
    [/\bFe2O3\b/g, 'Fe₂O₃'],
    [/\bKClO3\b/g, 'KClO₃'],
    [/\bZnCl2\b/g, 'ZnCl₂'],
    [/\bAlCl3\b/g, 'AlCl₃'],
    [/\bCaCl2\b/g, 'CaCl₂'],
    [/\bMgCl2\b/g, 'MgCl₂'],
    [/\bFeCl3\b/g, 'FeCl₃'],
    [/\bCuCl2\b/g, 'CuCl₂'],
    [/\bAgNO3\b/g, 'AgNO₃'],
    [/\bCu\(NO3\)2\b/g, 'Cu(NO₃)₂'],
    [/\bPb\(NO3\)2\b/g, 'Pb(NO₃)₂'],
    [/\bPbI2\b/g, 'PbI₂'],
    [/\bKNO3\b/g, 'KNO₃'],
    [/\bNa2SO4\b/g, 'Na₂SO₄'],
    [/\bNH4NO3\b/g, 'NH₄NO₃'],
    [/\bCa3\(PO4\)2\b/g, 'Ca₃(PO₄)₂'],
    [/\bAl2\(SO4\)3\b/g, 'Al₂(SO₄)₃'],
    [/\bCaCO3\b/g, 'CaCO₃'],
    [/\bCS2\b/g, 'CS₂'],
    [/\bSO2\b/g, 'SO₂'],
    [/\bSO3\b/g, 'SO₃'],
    [/\bNO2\b/g, 'NO₂'],
    [/\bPCl3\b/g, 'PCl₃'],
    [/\bPCl5\b/g, 'PCl₅'],
    [/\bSF6\b/g, 'SF₆'],
    [/\bPO4\(3-\)/g, 'PO₄³⁻'],
    [/\bSO4\(2-\)/g, 'SO₄²⁻'],
    [/\bNO3-\b/g, 'NO₃⁻'],
    [/\bNH4\+\b/g, 'NH₄⁺'],
    [/\bFe3\+\b/g, 'Fe³⁺'],
    [/\bCu2\+\b/g, 'Cu²⁺'],
    [/\bCa2\+\b/g, 'Ca²⁺'],
    [/\bMg2\+\b/g, 'Mg²⁺'],
    [/\bAl\^?3\+\b/g, 'Al³⁺'],
    [/\bNa\+\b/g, 'Na⁺'],
    [/\bK\+\b/g, 'K⁺'],
    [/\bCl-\b/g, 'Cl⁻'],
    [/\bF-\b/g, 'F⁻'],
    [/\bO2-\b/g, 'O²⁻'],
    [/\bI-\b/g, 'I⁻'],
    [/\bH\+\b/g, 'H⁺'],
    [/\bAg\+\b/g, 'Ag⁺'],
    [/\bPb2\+\b/g, 'Pb²⁺']
  ];

  let cachedGlossaryPatterns = null;

  function getGlossaryTermPatterns() {
    if (cachedGlossaryPatterns) return cachedGlossaryPatterns;
    const glossary = window.GC_GLOSSARY;
    if (!glossary) return [];

    const list = [];
    const seenPhrases = new Set();
    const broadWords = new Set([
      'mass', 'heat', 'energy', 'force', 'salt', 'shell', 'acid', 'base',
      'work', 'time', 'data', 'bond', 'bonds', 'table', 'model', 'models',
      'matter', 'liquid', 'solid', 'gas', 'atom', 'atoms', 'drop', 'rate'
    ]);

    Object.keys(glossary).forEach(slug => {
      const entry = glossary[slug];
      if (!entry || typeof entry !== 'object' || !entry.term) return;

      const cleanTerm = entry.term.replace(/\s*\(.*?\)/g, '').trim();
      const slugPhrase = slug.replace(/-/g, ' ').trim();

      [cleanTerm, slugPhrase].forEach(phrase => {
        const normalized = phrase.toLowerCase();
        if (normalized.length < 4 || broadWords.has(normalized) || seenPhrases.has(normalized)) return;

        seenPhrases.add(normalized);
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        list.push({
          phrase: phrase,
          slug: slug,
          regex: new RegExp(`\\b(${escaped})\\b`, 'gi')
        });
      });
    });

    list.sort((a, b) => b.phrase.length - a.phrase.length);
    cachedGlossaryPatterns = list;
    return cachedGlossaryPatterns;
  }

  function formatStudentContent(text) {
    if (!text || typeof text !== 'string') return text || '';

    // 1. Normalize scientific symbols and units
    let s = text
      .replace(/(\d+)\s*(?:deg\s*C|degC)\b/gi, '$1 °C')
      .replace(/-(\d+)\s*(?:deg\s*C|degC)\b/gi, '-$1 °C')
      .replace(/\b(\d+)\s*uL\b/g, '$1 μL')
      .replace(/\bdelta\s*EN\b/gi, 'ΔEN')
      .replace(/\b120\s*deg\b/gi, '120°')
      .replace(/\b180\s*deg\b/gi, '180°')
      .replace(/\b109\.5\s*deg\b/gi, '109.5°')
      .replace(/\b107\s*deg\b/gi, '107°')
      .replace(/\b104\.5\s*deg\b/gi, '104.5°');

    // 2. Normalize chemical formulas
    for (let i = 0; i < COMMON_FORMULAS.length; i++) {
      s = s.replace(COMMON_FORMULAS[i][0], COMMON_FORMULAS[i][1]);
    }

    // 3. Scan for vocabulary terms from window.GC_GLOSSARY
    if (!window.GC_GLOSSARY) return s;

    const termPatterns = getGlossaryTermPatterns();
    if (termPatterns.length === 0) return s;

    const tokens = s.split(/(<[^>]+>)/g);

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].startsWith('<')) continue;

      let str = tokens[i];
      const placeholders = [];

      for (let t = 0; t < termPatterns.length; t++) {
        const item = termPatterns[t];
        str = str.replace(item.regex, (match) => {
          const idx = placeholders.length;
          placeholders.push({ slug: item.slug, text: match });
          return `\x01PE_TERM_${idx}\x02`;
        });
      }

      for (let p = 0; p < placeholders.length; p++) {
        str = str.replace(
          `\x01PE_TERM_${p}\x02`,
          `<span class="pe-term" data-term="${placeholders[p].slug}" tabindex="0" role="button" aria-haspopup="dialog">${placeholders[p].text}</span>`
        );
      }
      tokens[i] = str;
    }

    return tokens.join('');
  }

  let tooltipInitialized = false;
  function initGlossaryTooltip() {
    if (tooltipInitialized) return;
    tooltipInitialized = true;

    let tooltipEl = document.getElementById('peGlossaryTooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'peGlossaryTooltip';
      tooltipEl.className = 'pe-glossary-tooltip';
      tooltipEl.setAttribute('role', 'dialog');
      tooltipEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(tooltipEl);
    }

    function showTooltip(termEl) {
      const slug = termEl.dataset.term;
      const glossary = window.GC_GLOSSARY || {};
      const entry = glossary[slug];
      if (!entry) return;

      tooltipEl.innerHTML = `
        <div class="pe-glossary-header">
          <span class="pe-glossary-term">${entry.term}</span>
          <span class="pe-glossary-badge">Glossary</span>
        </div>
        <p class="pe-glossary-def">${entry.definition}</p>
        ${entry.example ? `<div class="pe-glossary-ex">Example: ${entry.example}</div>` : ''}
      `;

      const rect = termEl.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollLeft = window.scrollX || document.documentElement.scrollLeft;

      tooltipEl.style.left = '-9999px';
      tooltipEl.style.top = '-9999px';
      tooltipEl.classList.add('visible');
      tooltipEl.setAttribute('aria-hidden', 'false');

      const tipWidth = tooltipEl.offsetWidth;
      const tipHeight = tooltipEl.offsetHeight;
      const viewportWidth = document.documentElement.clientWidth;
      const padding = 12;

      let left = rect.left + rect.width / 2 - tipWidth / 2;
      if (left < padding) left = padding;
      if (left + tipWidth > viewportWidth - padding) left = viewportWidth - padding - tipWidth;

      let top = rect.top - tipHeight - 8;
      if (top < padding) {
        top = rect.bottom + 8;
      }

      tooltipEl.style.left = `${left + scrollLeft}px`;
      tooltipEl.style.top = `${top + scrollTop}px`;
    }

    function hideTooltip() {
      if (tooltipEl) {
        tooltipEl.classList.remove('visible');
        tooltipEl.setAttribute('aria-hidden', 'true');
      }
    }

    document.addEventListener('click', function(e) {
      const termEl = e.target.closest('.pe-term');
      if (termEl) {
        e.preventDefault();
        e.stopPropagation();
        showTooltip(termEl);
        return;
      }
      if (!e.target.closest('#peGlossaryTooltip')) {
        hideTooltip();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        hideTooltip();
      } else if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('pe-term')) {
        e.preventDefault();
        showTooltip(e.target);
      }
    });
  }

  function evaluateItem(item, state) {
    if (!item) return { isCorrect: false };

    if (item.type === 'two_tier') {
      const t1 = state.twoTierSelection.tier1 === item.correctTier1;
      const t2 = state.twoTierSelection.tier2 === item.correctTier2;
      // Say which part missed, then keep the item's own hint: it is the one that teaches.
      const itemHint = item.hint ? ' ' + item.hint : '';
      let hintText = item.hint || '';
      if (!t1 && t2) {
        hintText = 'Your reason in Part 2 is right, but your answer in Part 1 is not.' + itemHint;
      } else if (t1 && !t2) {
        hintText = 'Your answer in Part 1 is right. The reason you picked in Part 2 does not support it.' + itemHint;
      }
      return {
        isCorrect: t1 && t2,
        hint: hintText
      };
    }

    if (item.type === 'multi_select') {
      const selected = (state.multiSelection || []).slice().sort((a, b) => a - b);
      const correct = (item.correctIndices || []).slice().sort((a, b) => a - b);
      const isCorrect = selected.length === correct.length && selected.every((val, i) => val === correct[i]);
      return {
        isCorrect: isCorrect,
        hint: item.hint || 'More than one choice can be right. Check each choice on its own.'
      };
    }

    if (item.type === 'ranking') {
      const current = state.rankingOrder || [];
      const target = item.correctOrder || [];
      const isCorrect = current.length === target.length && current.every((val, i) => val === target[i]);
      return {
        isCorrect: isCorrect,
        hint: item.hint || 'Check which end of the order is smallest, then compare the items one pair at a time.'
      };
    }

    if (item.type === 'categorize') {
      const assigns = state.categorizeSelection || {};
      const items = item.items || [];
      const isCorrect = items.every((it, idx) => assigns[idx] === it.correctCategoryIndex);
      return {
        isCorrect: isCorrect,
        hint: item.hint || 'At least one row is in the wrong group. Check each row on its own.'
      };
    }

    if (item.type === 'numeric') {
      const val = parseFloat(state.numericInput);
      if (isNaN(val)) return { isCorrect: false, hint: 'Type a number, without units.' };
      const tol = item.tolerance !== undefined ? item.tolerance : 0.05;
      const isCorrect = Math.abs(val - item.correctValue) <= tol;
      return {
        isCorrect: isCorrect,
        hint: item.hint || 'Check your setup and your units, then calculate again.'
      };
    }

    // Default: MCQ
    const isCorrect = state.selectedOption === item.correctIndex;
    return {
      isCorrect: isCorrect,
      hint: item.hint || 'Rule out the choices you know are wrong, then compare the rest.'
    };
  }

  function canSubmit(item, state) {
    if (!item) return false;
    if (item.type === 'two_tier') {
      return state.twoTierSelection && state.twoTierSelection.tier1 !== null && state.twoTierSelection.tier2 !== null;
    }
    if (item.type === 'multi_select') {
      return Array.isArray(state.multiSelection) && state.multiSelection.length > 0;
    }
    if (item.type === 'ranking') {
      return Array.isArray(state.rankingOrder) && state.rankingOrder.length > 0;
    }
    if (item.type === 'categorize') {
      const assigns = state.categorizeSelection || {};
      return (item.items || []).every((_, idx) => assigns[idx] !== undefined);
    }
    if (item.type === 'numeric') {
      return state.numericInput !== undefined && String(state.numericInput).trim() !== '';
    }
    return state.selectedOption !== null && state.selectedOption !== undefined;
  }

  const Engine = {
    state: {
      peId: null,
      peData: null,
      studentName: '',
      seed: '',
      rng: null,
      phase: 'PRACTICE', // 'PRACTICE' | 'COMPLETE'
      skills: [],
      skillIndex: 0,
      skillProgress: {},
      activeSkillId: null,
      currentItem: null,
      currentAttempts: 0,
      selectedOption: null,
      twoTierSelection: { tier1: null, tier2: null },
      multiSelection: [],
      rankingOrder: [],
      categorizeSelection: {},
      numericInput: '',
      isCurrentSubmitted: false,
      isCurrentLocked: false,
      digitalSeal: null,
      auditTrail: []
    },

    _unloadGuardAttached: false,

    setupUnloadGuard() {
      if (this._unloadGuardAttached) return;
      this._unloadGuardAttached = true;
      window.addEventListener('beforeunload', (e) => {
        if (this.state.phase === 'COMPLETE') {
          const msg = 'Print or save your practice receipt before you leave this page.';
          e.preventDefault();
          e.returnValue = msg;
          return msg;
        } else if (this.state.phase === 'PRACTICE' && this.state.skillIndex > 0) {
          const msg = 'Your practice is not saved yet. If you leave now, you lose your progress.';
          e.preventDefault();
          e.returnValue = msg;
          return msg;
        }
      });
    },

    initTheme() {
      let saved = null;
      try {
        saved = localStorage.getItem('gc-theme') || (localStorage.getItem('sp_dark_mode') === 'true' ? 'dark' : (localStorage.getItem('sp_dark_mode') === 'false' ? 'light' : null));
      } catch (e) {}
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = saved === 'dark' || (!saved && prefersDark);
      this.applyTheme(isDark);
    },

    applyTheme(isDark) {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark', 'theme-dark');
        root.classList.remove('light', 'theme-light');
      } else {
        root.classList.add('light', 'theme-light');
        root.classList.remove('dark', 'theme-dark');
      }
    },

    toggleTheme() {
      const root = document.documentElement;
      const willBeDark = !root.classList.contains('dark');
      this.applyTheme(willBeDark);
      try {
        localStorage.setItem('gc-theme', willBeDark ? 'dark' : 'light');
        localStorage.setItem('sp_dark_mode', String(willBeDark));
      } catch (e) {}
    },

    renderThemeToggleBtnHTML() {
      return `
        <button type="button" class="theme-toggle" id="themeToggle" aria-label="Toggle dark mode" title="Toggle dark mode" onclick="window.PEEngine.toggleTheme()">
          <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
        </button>
      `;
    },

    init() {
      this.initTheme();
      initGlossaryTooltip();
      this.setupUnloadGuard();

      const urlParams = new URLSearchParams(window.location.search);
      const peParam = (urlParams.get('pe') || '').toUpperCase().trim();

      // Check student name
      let savedName = localStorage.getItem('pe_chem_student_name') || '';
      if (urlParams.has('name')) {
        savedName = urlParams.get('name').trim();
        localStorage.setItem('pe_chem_student_name', savedName);
      }
      this.state.studentName = savedName; // If empty or placeholder, renderNameGate will prompt

      // Load PE Data
      const loadedBank = getPeBank(peParam);
      if (loadedBank) {
        this.state.peId = peParam;
        this.state.peData = loadedBank;
      } else {
        // Render Hub Selector if no valid PE param
        this.renderHub();
        return;
      }

      // The seed names the student and PE (it is shown, and the seal is built on it). Items draw
      // from a per-run stream, so a retake reshuffles options and can pick the other Level 2 item.
      const cleanName = (this.state.studentName || 'student').toLowerCase().replace(/[^a-z0-9]/g, '');
      this.state.seed = `${cleanName || 'student'}-${this.state.peId.toLowerCase()}`;
      this.state.rng = createMulberry32(this.state.seed + ':' + newRunNonce());

      this.state.skills = this.state.peData.skills;
      this.state.skillIndex = 0;
      this.state.skills.forEach(skill => {
        this.state.skillProgress[skill.id] = newSkillProgress(skill, this.state.rng);
      });

      this.state.phase = 'PRACTICE';
      if (this.state.studentName && this.state.studentName !== 'Student Chemist') {
        const firstSkill = this.state.skills[0];
        if (firstSkill) {
          this.loadStageItem(firstSkill.id);
        }
      }
      this.render();
    },

    resetItemInteractionState() {
      this.state.currentAttempts = 0;
      this.state.selectedOption = null;
      this.state.twoTierSelection = { tier1: null, tier2: null };
      this.state.multiSelection = [];
      this.state.categorizeSelection = {};
      this.state.numericInput = '';
      this.state.isCurrentSubmitted = false;
      this.state.isCurrentLocked = false;
      const item = this.state.currentItem;
      if (item && item.type === 'ranking') {
        this.state.rankingOrder = (item.initialOrder || item.items || []).slice();
      } else {
        this.state.rankingOrder = [];
      }
    },

    // Serve the item for the skill's current stage.
    loadStageItem(skillId) {
      const skill = this.state.skills.find(s => s.id === skillId);
      const prog = this.state.skillProgress[skillId];
      if (!skill || !prog) return null;
      switch (prog.stage) {
        case 'L3': return this.loadSkillItem(skillId, 3);
        case 'L1': return this.loadSkillItem(skillId, 1);
        case 'L2B': return this.loadSkillItem(skillId, 2, prog.l2Other);
        case 'CONFIRM':
          return prog.l2Other ? this.loadSkillItem(skillId, 2, prog.l2Other) : this.loadSkillItem(skillId, 3);
        default: return this.loadSkillItem(skillId, 2, prog.l2Primary);
      }
    },

    loadSkillItem(skillId, levelNumber, l2Source) {
      const skill = this.state.skills.find(s => s.id === skillId);
      if (!skill) return null;
      const rng = this.state.rng;
      let rawItem = null;
      if (levelNumber === 2) {
        const fn = skill[l2Source || 'diagnostic'] || skill.diagnostic;
        if (typeof fn === 'function') rawItem = fn(rng);
      } else if (levelNumber === 1 && skill.practiceLevels && skill.practiceLevels[0]) {
        rawItem = skill.practiceLevels[0](rng);
      } else if (levelNumber === 3 && skill.practiceLevels && skill.practiceLevels[1]) {
        rawItem = skill.practiceLevels[1](rng);
      }
      if (!rawItem) return null;
      rawItem.levelNumber = levelNumber;
      if (!rawItem.level || rawItem.level === 'Diagnostic') {
        rawItem.level = levelNumber === 1 ? 'Level 1 (Foundational)' : (levelNumber === 2 ? 'Level 2 (Intermediate)' : 'Level 3 (Mastery Challenge)');
      }
      const item = prepareItem(rawItem, rng);
      this.state.currentItem = item;
      this.state.activeSkillId = skillId;
      this.resetItemInteractionState();
      return item;
    },

    selectOption(index) {
      if (this.state.isCurrentLocked) return;
      this.state.selectedOption = index;
      this.updateSubmitButtonState();
      document.querySelectorAll('.option-card').forEach((card, idx) => {
        card.classList.toggle('selected', idx === index);
      });
    },

    selectTier1(index) {
      if (this.state.isCurrentLocked) return;
      const wasLocked = this.state.twoTierSelection.tier1 === null;
      this.state.twoTierSelection.tier1 = index;
      this.updateSubmitButtonState();
      if (wasLocked) {
        // Unlock Part 2 with progressive disclosure
        const dynamicArea = document.getElementById('itemDynamicArea');
        if (dynamicArea && this.state.currentItem) {
          dynamicArea.innerHTML = this.renderItemInputHTML(this.state.currentItem);
          return;
        }
      }
      const parent = document.querySelectorAll('.two-tier-container .tier-block')[0];
      if (parent) {
        parent.querySelectorAll('.tier-option-card').forEach((card, idx) => {
          card.classList.toggle('selected', idx === index);
        });
      }
    },

    selectTier2(index) {
      if (this.state.isCurrentLocked) return;
      this.state.twoTierSelection.tier2 = index;
      this.updateSubmitButtonState();
      const parent = document.querySelectorAll('.two-tier-container .tier-block')[1];
      if (parent) {
        parent.querySelectorAll('.tier-option-card').forEach((card, idx) => {
          card.classList.toggle('selected', idx === index);
        });
      }
    },

    toggleMultiSelect(index) {
      if (this.state.isCurrentLocked) return;
      if (!Array.isArray(this.state.multiSelection)) this.state.multiSelection = [];
      const pos = this.state.multiSelection.indexOf(index);
      if (pos >= 0) {
        this.state.multiSelection.splice(pos, 1);
      } else {
        this.state.multiSelection.push(index);
      }
      this.updateSubmitButtonState();
      document.querySelectorAll('.option-card').forEach((card, idx) => {
        const isChecked = this.state.multiSelection.includes(idx);
        card.classList.toggle('selected', isChecked);
        const cb = card.querySelector('.option-checkbox');
        if (cb) cb.innerHTML = isChecked ? '&#10003;' : '';
      });
    },

    moveRankItem(index, delta) {
      if (this.state.isCurrentLocked) return;
      const order = this.state.rankingOrder;
      const targetIndex = index + delta;
      if (targetIndex < 0 || targetIndex >= order.length) return;
      const temp = order[index];
      order[index] = order[targetIndex];
      order[targetIndex] = temp;
      this.updateSubmitButtonState();
      const dynamicArea = document.getElementById('itemDynamicArea');
      if (dynamicArea) {
        dynamicArea.innerHTML = this.renderItemInputHTML(this.state.currentItem);
      }
    },

    setCategorize(itemIndex, catIndex) {
      if (this.state.isCurrentLocked) return;
      if (!this.state.categorizeSelection) this.state.categorizeSelection = {};
      this.state.categorizeSelection[itemIndex] = catIndex;
      this.updateSubmitButtonState();
      const row = document.querySelectorAll('.categorize-table tbody tr')[itemIndex];
      if (row) {
        row.querySelectorAll('.cat-pill').forEach((pill, cIdx) => {
          pill.classList.toggle('selected', cIdx === catIndex);
        });
      }
    },

    setNumericInput(val) {
      if (this.state.isCurrentLocked) return;
      this.state.numericInput = val;
      this.updateSubmitButtonState();
    },

    updateSubmitButtonState() {
      const submitBtn = document.getElementById('btnSubmit');
      if (submitBtn) {
        submitBtn.disabled = !canSubmit(this.state.currentItem, this.state);
      }
    },

    submitAnswer() {
      if (!canSubmit(this.state.currentItem, this.state) || this.state.isCurrentLocked) return;

      const item = this.state.currentItem;
      const evalResult = evaluateItem(item, this.state);
      const isCorrect = evalResult.isCorrect;
      this.state.currentAttempts++;
      const currentAttempt = this.state.currentAttempts;
      const submitBtn = document.getElementById('btnSubmit');
      const feedbackContainer = document.getElementById('questionFeedback');

      if (isCorrect || currentAttempt >= 2) {
        // The item is finished: right on attempt 1 or 2, or missed twice.
        this.state.isCurrentLocked = true;
        this.state.isCurrentSubmitted = true;

        const dynamicArea = document.getElementById('itemDynamicArea');
        if (dynamicArea) {
          dynamicArea.innerHTML = this.renderItemInputHTML(item);
        }

        const outcome = isCorrect ? (currentAttempt === 1 ? 'first' : 'second') : 'miss';
        const result = this.applyOutcome(item.skillId, outcome);

        feedbackContainer.innerHTML = `
          <div class="feedback-box feedback-solution">
            <div class="feedback-solution-header"${isCorrect ? '' : ' style="color:var(--pe-error);"'}>
              <span>${result.header}</span>
            </div>
            <div class="feedback-solution-body">
              ${formatStudentContent(item.workedSolution)}
            </div>
          </div>
        `;

        if (!isCorrect) {
          const dots = document.querySelectorAll('.attempt-dot');
          if (dots[1]) dots[1].className = 'attempt-dot failed';
        }

        submitBtn.innerHTML = result.button;
        submitBtn.disabled = false;
        submitBtn.onclick = () => this.advance();

        this.recordAudit(item, isCorrect, currentAttempt);
      } else {
        // First miss: show the hint and allow one more try.
        const hintText = evalResult.hint || item.hint || 'Rule out the choices you know are wrong, then compare the rest.';
        feedbackContainer.innerHTML = `
          <div class="feedback-box feedback-hint">
            <div class="feedback-hint-header">
              <span>&#9888; Hint (try 1 of 2)</span>
            </div>
            <div class="feedback-hint-body">
              ${formatStudentContent(hintText)}
            </div>
          </div>
        `;

        if (!item.type || item.type === 'mcq') {
          document.querySelectorAll('.option-card').forEach((card, idx) => {
            if (idx === this.state.selectedOption) {
              card.classList.add('incorrect-selected');
            }
          });
        }

        submitBtn.textContent = 'Check my second try';
        const dots = document.querySelectorAll('.attempt-dot');
        if (dots[0]) dots[0].className = 'attempt-dot used';
      }

      this.updateProgressChips();
    },

    // Move a skill on by one finished item (rules in pe-scoring.js) and say what happens next.
    applyOutcome(skillId, outcome) {
      const prog = this.state.skillProgress[skillId];
      const skill = this.state.skills.find(s => s.id === skillId);
      const from = prog.stage;
      const next = Scoring.step(from, outcome, skill);
      prog.path.push({ stage: from, outcome });
      prog.stage = next.stage;
      prog.score = next.score;
      prog.done = next.done;

      const tryWord = outcome === 'first' ? 'Right on the first try' : (outcome === 'second' ? 'Right on the second try' : 'Missed twice');
      const nextSkill = this.state.skillIndex + 1 < this.state.skills.length ? 'Next skill &rarr;' : 'See my results &rarr;';

      if (next.done) {
        let why = '';
        if (from === 'L3' && outcome !== 'first') why = ' Your first-try Level 2 answer holds.';
        else if ((from === 'CONFIRM' || from === 'L2B') && outcome !== 'first') why = ' Proficient needs a first-try answer at Level 2 or above.';
        else if (from === 'L1' && next.score === 2) why = ' Reread the lesson, then retake this PE to try Level 2 again.';
        else if (from === 'L1') why = ' Read the worked solution and the lesson before you retake this PE.';
        return {
          header: `${outcome === 'miss' ? '&#10007;' : '&#10003;'} ${tryWord}. This skill: ${levelLabel(next.score)}.${why}`,
          button: nextSkill
        };
      }

      // Not done: name the next item.
      if (next.stage === 'L3') {
        return { header: `&#10003; ${tryWord}. Next is a Level 3 challenge item.`, button: 'Try the Level 3 item &rarr;' };
      }
      if (next.stage === 'CONFIRM') {
        return { header: `&#10003; ${tryWord}. One more item checks that the idea holds without a hint.`, button: 'Try the check item &rarr;' };
      }
      if (next.stage === 'L1') {
        return { header: '&#10007; Missed twice. Next is a Level 1 item on the core idea.', button: 'Try the Level 1 item &rarr;' };
      }
      // L2B
      return { header: `&#10003; ${tryWord}. Now try a different Level 2 item on the same skill.`, button: 'Try the new Level 2 item &rarr;' };
    },

    advance() {
      const skill = this.state.skills[this.state.skillIndex];
      const prog = this.state.skillProgress[skill.id];
      if (prog.done) {
        this.advanceToNextSkill();
      } else {
        this.loadStageItem(skill.id);
        this.render();
      }
    },

    advanceToNextSkill() {
      this.state.skillIndex++;
      if (this.state.skillIndex < this.state.skills.length) {
        const nextSkill = this.state.skills[this.state.skillIndex];
        this.loadStageItem(nextSkill.id);
        this.render();
      } else {
        this.state.phase = 'COMPLETE';
        this.render();
      }
    },

    recordAudit(item, passed, attempts) {
      this.state.auditTrail.push({
        id: item.id,
        skillId: item.skillId,
        level: item.level,
        passed: passed,
        attempts: attempts,
        stem: item.stem,
        summary: item.givenSummary || item.stem.slice(0, 60),
        solution: item.workedSolution,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    },

    render() {
      const container = document.getElementById('workstationApp');
      if (!container) return;

      if (!this.state.studentName || this.state.studentName === 'Student Chemist') {
        this.renderNameGate(container);
        return;
      }

      if (this.state.phase === 'COMPLETE') {
        this.renderCompletion(container);
      } else {
        this.renderWorkstation(container);
      }
    },

    renderNameGate(container) {
      container.innerHTML = `
        <header class="station-header">
          <div class="station-title-group">
            <a href="index.html" class="station-badge" style="text-decoration:none;">&larr; PE Hub</a>
            <span class="station-badge">${this.state.peId}</span>
            <div class="station-title">${this.state.peData ? this.state.peData.info.title : 'Chemistry Practice'}</div>
          </div>
          <div class="station-actions">
            ${this.renderThemeToggleBtnHTML()}
          </div>
        </header>

        <div class="workstation-container">
          <div class="name-gate-card">
            <span class="station-badge" style="margin-bottom:0.5rem; display:inline-block;">Enter Your Name</span>
            <h2>Welcome to ${this.state.peId} Practice</h2>
            <p>
              Type your first and last name before you start. Your name goes on your printed receipt and into its check code.
            </p>
            <div class="name-gate-form">
              <label for="gateStudentName">Enter your name:</label>
              <div style="display:flex; gap:0.5rem; margin-top:0.35rem;">
                <input type="text" id="gateStudentName" class="hub-student-input" placeholder="e.g. Marie Curie" autofocus>
                <button type="button" class="btn btn-primary" id="btnGateStart">Start practice &rarr;</button>
              </div>
              <div id="gateNameError" style="color:var(--pe-error); font-size:var(--text-xs); margin-top:0.4rem; display:none;">
                Type your name to start.
              </div>
            </div>
          </div>
        </div>
      `;

      const input = document.getElementById('gateStudentName');
      const btn = document.getElementById('btnGateStart');
      const err = document.getElementById('gateNameError');

      const handleProceed = () => {
        const val = input.value.trim();
        if (!val) {
          err.style.display = 'block';
          input.focus();
          return;
        }
        localStorage.setItem('pe_chem_student_name', val);
        this.state.studentName = val;
        const cleanName = val.toLowerCase().replace(/[^a-z0-9]/g, '');
        this.state.seed = `${cleanName || 'student'}-${this.state.peId.toLowerCase()}`;
        this.state.rng = createMulberry32(this.state.seed + ':' + newRunNonce());
        this.state.phase = 'PRACTICE';
        if (this.state.skills && this.state.skills[0]) {
          this.loadStageItem(this.state.skills[0].id);
        }
        this.render();
      };

      btn.onclick = handleProceed;
      input.onkeypress = (e) => {
        if (e.key === 'Enter') handleProceed();
      };
    },

    renderWorkstation(container) {
      if (!this.state.currentItem && this.state.skills && this.state.skills[0]) {
        this.loadStageItem(this.state.skills[0].id);
      }
      const item = this.state.currentItem;
      if (!item) return;
      const skill = this.state.skills.find(s => s.id === item.skillId) || this.state.skills[0];
      const prog = this.state.skillProgress[item.skillId];
      const totalSteps = this.state.skills.length;
      const currentStep = this.state.skillIndex + 1;

      const PHASE_LABELS = {
        L2: 'Level 2 Placement (Intermediate)',
        L3: 'Level 3 Challenge (Mastery)',
        CONFIRM: 'Level 2 Check (one more item)',
        L1: 'Level 1 Step-Down (Foundational)',
        L2B: 'Level 2 Retry (new item)'
      };
      const phaseLabel = (prog && PHASE_LABELS[prog.stage]) || PHASE_LABELS.L2;

      container.innerHTML = `
        <!-- Top Navigation -->
        <header class="station-header">
          <div class="station-title-group">
            <a href="index.html" class="station-badge" style="text-decoration:none;">&larr; PE Hub</a>
            <span class="station-badge">${this.state.peId}</span>
            <div class="station-title">${this.state.peData.info.title}</div>
          </div>
          <div class="station-actions">
            <div class="seed-chip">
              <span>Seed:</span> <strong>${this.state.seed}</strong>
            </div>
            <button type="button" class="btn btn-ghost" id="btnChangeName" title="Change student name">
              ${escapeHtml(this.state.studentName)}
            </button>
            ${this.renderThemeToggleBtnHTML()}
          </div>
        </header>

        <div class="workstation-container">
          <!-- Progress Panel -->
          <div class="progress-panel">
            <div class="phase-meta">
              <span class="phase-tag">
                ${phaseLabel}
              </span>
              <span class="progress-stats">
                Skill ${currentStep} of ${totalSteps}
              </span>
            </div>
            <div class="skill-chips-row" id="skillChipsRow">
              ${this.renderSkillChipsHTML()}
            </div>
          </div>

          ${renderStationResourceBar(this.state.peId)}

          <!-- Focus Question Card -->
          <div class="question-card">
            <div class="question-meta-bar">
              <div class="question-skill-title">
                <span class="skill-code-badge">${skill.id}</span>
                <span class="skill-heading">${skill.title}</span>
              </div>
              <span class="level-badge">${item.level}</span>
            </div>

            <div class="stem-container" id="stemContent">
              <p>${formatStudentContent(item.stem)}</p>
              ${item.figure ? `<div class="stem-figure">${item.figure}</div>` : ''}
            </div>

            <div id="itemDynamicArea">
              ${this.renderItemInputHTML(item)}
            </div>

            <div class="question-action-bar">
              <div class="attempt-meter">
                <div class="attempt-dots">
                  <div class="attempt-dot ${this.state.currentAttempts >= 1 ? 'used' : ''}"></div>
                  <div class="attempt-dot ${this.state.currentAttempts >= 2 ? 'failed' : ''}"></div>
                </div>
                <span class="attempt-label">
                  ${this.state.currentAttempts === 0 ? 'Attempt 1 of 2' : (this.state.currentAttempts === 1 ? 'Attempt 2 of 2' : 'Complete')}
                </span>
              </div>

              <div>
                <button type="button" class="btn btn-primary" id="btnSubmit" disabled onclick="window.PEEngine.submitAnswer()">
                  Check Answer
                </button>
              </div>
            </div>

            <div id="questionFeedback"></div>
          </div>
        </div>
      `;

      // Setup name change handler
      document.getElementById('btnChangeName').onclick = () => this.promptChangeName();
    },

    renderItemInputHTML(item) {
      if (!item) return '';

      if (item.type === 'two_tier') {
        const t1 = this.state.twoTierSelection.tier1;
        const t2 = this.state.twoTierSelection.tier2;
        const locked = this.state.isCurrentLocked;
        return `
          <div class="two-tier-container">
            <div class="tier-block">
              <div class="tier-label">Part 1: Your answer</div>
              <p class="tier-prompt">${formatStudentContent(item.tier1Prompt || 'Choose your answer:')}</p>
              <div class="tier-options-list">
                ${(item.tier1Options || []).map((opt, idx) => {
                  let cls = 'tier-option-card';
                  if (t1 === idx) cls += ' selected';
                  if (locked) {
                    cls += ' locked';
                    if (idx === item.correctTier1) cls += ' correct';
                    else if (t1 === idx) cls += ' incorrect-selected';
                  }
                  return `
                    <div class="${cls}" onclick="window.PEEngine.selectTier1(${idx})">
                      <span class="option-key">${String.fromCharCode(65 + idx)}</span>
                      <span class="tier-opt-text">${formatStudentContent(opt)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>

            <div class="tier-block ${t1 === null && !locked ? 'locked-tier' : ''}">
              <div class="tier-label">Part 2: Your reason</div>
              ${t1 === null && !locked
                ? `<div class="tier-locked-notice">
                     <span>&#128274; Choose your answer in Part 1 to open Part 2.</span>
                   </div>`
                : `
                  <p class="tier-prompt">${formatStudentContent(item.tier2Prompt || 'Which reason supports your answer?')}</p>
                  <div class="tier-options-list">
                    ${(item.tier2Options || []).map((opt, idx) => {
                      let cls = 'tier-option-card';
                      if (t2 === idx) cls += ' selected';
                      if (locked) {
                        cls += ' locked';
                        if (idx === item.correctTier2) cls += ' correct';
                        else if (t2 === idx) cls += ' incorrect-selected';
                      }
                      return `
                        <div class="${cls}" onclick="window.PEEngine.selectTier2(${idx})">
                          <span class="option-key">${idx + 1}</span>
                          <span class="tier-opt-text">${formatStudentContent(opt)}</span>
                        </div>
                      `;
                    }).join('')}
                  </div>
                `
              }
            </div>
          </div>
        `;
      }

      if (item.type === 'multi_select') {
        const selections = this.state.multiSelection || [];
        const locked = this.state.isCurrentLocked;
        return `
          <div class="multi-select-note">&#9745; Choose every answer that is true:</div>
          <div class="options-grid" id="optionsGrid">
            ${(item.options || []).map((opt, idx) => {
              const isSelected = selections.includes(idx);
              let cls = 'option-card';
              if (isSelected) cls += ' selected';
              if (locked) {
                cls += ' locked';
                if ((item.correctIndices || []).includes(idx)) cls += ' correct';
                else if (isSelected) cls += ' incorrect-selected';
              }
              return `
                <div class="${cls}" data-idx="${idx}" onclick="window.PEEngine.toggleMultiSelect(${idx})">
                  <div class="option-checkbox">${isSelected ? '&#10003;' : ''}</div>
                  <div class="option-content">${formatStudentContent(opt)}</div>
                </div>
              `;
            }).join('')}
          </div>
        `;
      }

      if (item.type === 'ranking') {
        const order = this.state.rankingOrder || [];
        const locked = this.state.isCurrentLocked;
        return `
          <div class="ranking-container">
            <div class="ranking-prompt-note">${formatStudentContent(item.rankingPrompt || 'Put the items in order with the &uarr; and &darr; buttons:')}</div>
            <div class="ranking-list">
              ${order.map((it, idx) => `
                <div class="ranking-card ${locked ? 'locked' : ''}">
                  <div class="ranking-pos-badge">${idx + 1}</div>
                  <div class="ranking-card-label">${formatStudentContent(it)}</div>
                  <div class="ranking-card-actions">
                    <button type="button" class="btn btn-ghost rank-btn" ${locked || idx === 0 ? 'disabled' : ''} onclick="window.PEEngine.moveRankItem(${idx}, -1)" title="Move Up">&uarr;</button>
                    <button type="button" class="btn btn-ghost rank-btn" ${locked || idx === order.length - 1 ? 'disabled' : ''} onclick="window.PEEngine.moveRankItem(${idx}, 1)" title="Move Down">&darr;</button>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      }

      if (item.type === 'categorize') {
        const assigns = this.state.categorizeSelection || {};
        const categories = item.categories || [];
        const locked = this.state.isCurrentLocked;
        return `
          <div class="categorize-container">
            <div class="categorize-note">Put each item in the right group:</div>
            <table class="categorize-table">
              <thead>
                <tr>
                  <th style="width:38%;">Item</th>
                  <th style="width:62%;">Group</th>
                </tr>
              </thead>
              <tbody>
                ${(item.items || []).map((rowItem, rIdx) => {
                  const currentCat = assigns[rIdx];
                  return `
                    <tr>
                      <td class="cat-item-label">${formatStudentContent(rowItem.label)}</td>
                      <td>
                        <div class="cat-pills-group">
                          ${categories.map((catName, cIdx) => {
                            let cls = 'cat-pill';
                            if (currentCat === cIdx) cls += ' selected';
                            if (locked) {
                              cls += ' locked';
                              if (cIdx === rowItem.correctCategoryIndex) cls += ' correct';
                              else if (currentCat === cIdx) cls += ' incorrect-selected';
                            }
                            return `
                              <button type="button" class="${cls}" ${locked ? 'disabled' : ''} onclick="window.PEEngine.setCategorize(${rIdx}, ${cIdx})">
                                ${formatStudentContent(catName)}
                              </button>
                            `;
                          }).join('')}
                        </div>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `;
      }

      if (item.type === 'numeric') {
        const val = this.state.numericInput || '';
        const locked = this.state.isCurrentLocked;
        return `
          <div class="numeric-input-wrap">
            <label for="numericInputVal" class="numeric-label">${formatStudentContent(item.inputPrompt || 'Type your answer as a number:')}</label>
            <div class="numeric-control-row">
              <input type="number" step="any" id="numericInputVal" class="numeric-input-field ${locked ? 'locked' : ''}" value="${val}" ${locked ? 'disabled' : ''} oninput="window.PEEngine.setNumericInput(this.value)" placeholder="Enter number...">
              ${item.unit ? `<span class="numeric-unit-badge">${formatStudentContent(item.unit)}</span>` : ''}
            </div>
          </div>
        `;
      }

      // Default: MCQ
      return `
        <div class="options-grid" id="optionsGrid">
          ${(item.options || []).map((opt, idx) => {
            let cls = 'option-card';
            if (this.state.selectedOption === idx) cls += ' selected';
            if (this.state.isCurrentLocked) {
              cls += ' locked';
              if (idx === item.correctIndex) cls += ' correct';
              else if (this.state.selectedOption === idx) cls += ' incorrect-selected';
            }
            return `
              <div class="${cls}" data-idx="${idx}" onclick="window.PEEngine.selectOption(${idx})">
                <div class="option-key">${String.fromCharCode(65 + idx)}</div>
                <div class="option-content">${formatStudentContent(opt)}</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    },

    renderSkillChipsHTML() {
      const STAGE_CHIP = { L2: 'L2', L3: 'L3', CONFIRM: 'Check', L1: 'L1', L2B: 'L2 retry' };
      return this.state.skills.map(s => {
        const prog = this.state.skillProgress[s.id];
        const score = Scoring.skillScore(prog);
        const tag = LEVEL_TAGS[score];
        let statusClass = '';
        let icon = '&bull;';
        let label = s.id;
        if (tag) {
          statusClass = tag.chip;
          icon = tag.icon;
          label = `${s.id} (${score})`;
        } else if (this.state.activeSkillId === s.id) {
          label = `${s.id} [${STAGE_CHIP[prog.stage] || 'L2'}]`;
        }
        const isActive = this.state.activeSkillId === s.id ? 'active' : '';

        return `
          <div class="skill-chip ${statusClass} ${isActive}" title="${s.title}: ${score ? levelLabel(score) : s.subtitle}">
            <span>${icon}</span>
            <span>${label}</span>
          </div>
        `;
      }).join('');
    },

    updateProgressChips() {
      const row = document.getElementById('skillChipsRow');
      if (row) {
        row.innerHTML = this.renderSkillChipsHTML();
      }
    },

    generateStudyTips(skills, skillProgress) {
      return generateStudyTips(skills, skillProgress);
    },

    async renderCompletion(container) {
      this.setupUnloadGuard();
      const sum = Scoring.summarize(this.state.skills, this.state.skillProgress);
      const totalCount = sum.total;
      // The sealed score stays "skills at Proficient or above" so verify.html reads old and new
      // receipts the same way; v2 seals add the per-skill levels.
      const passingCount = sum.proficientOrAbove;
      const sealV2 = this.state.sealVersion !== 1;
      const sealLevels = sealV2 ? sum.levelString : '';
      const todayStr = this.state.archivedDateStr || new Date().toISOString().split('T')[0];
      const levelSummary = `${sum.counts[4]} Mastered &middot; ${sum.counts[3]} Proficient &middot; ${sum.counts[2]} Developing &middot; ${sum.counts[1]} Needs Practice`;

      const digitalSeal = this.state.digitalSeal || await computeDigitalSeal(
        this.state.studentName,
        this.state.seed,
        passingCount,
        totalCount,
        todayStr,
        sealLevels
      );
      this.state.digitalSeal = digitalSeal;

      // Automatically archive receipt to local history if this is an active practice completion
      if (!this.state.isArchivedView) {
        this.saveCurrentReceiptToArchive();
      }

      // Verification QR link
      const verifyUrl = `${window.location.origin}${window.location.pathname.replace('index.html', '')}verify.html?name=${encodeURIComponent(this.state.studentName)}&pe=${this.state.peId}&score=${passingCount}&total=${totalCount}${sealLevels ? `&levels=${sealLevels}` : ''}&seal=${digitalSeal}&date=${todayStr}`;
      const qrSvg = global.generateQRCodeSVG ? global.generateQRCodeSVG(verifyUrl, 44) : '';

      const studyTips = generateStudyTips(this.state.skills, this.state.skillProgress);

      container.innerHTML = `
        <header class="station-header">
          <div class="station-title-group">
            <a href="index.html" class="station-badge" style="text-decoration:none;">&larr; PE Hub</a>
            <span class="station-badge">${this.state.peId}</span>
            <div class="station-title">${this.state.isArchivedView ? 'Saved receipt' : 'Practice complete'}</div>
          </div>
          <div class="station-actions">
            <button type="button" class="btn btn-primary" onclick="window.print()">
              Print / Save PDF Receipt
            </button>
            ${this.renderThemeToggleBtnHTML()}
          </div>
        </header>

        <div class="workstation-container">
          <!-- Exit Warning Alert / Archive Notice -->
          <div class="receipt-exit-alert" style="${this.state.isArchivedView ? 'background:var(--pe-surface); border-color:var(--pe-border);' : ''}">
            <div class="receipt-exit-alert-text">
              ${this.state.isArchivedView
                ? '<strong>Saved receipt:</strong> this record is stored in this browser. You can print it again or save it as a PDF at any time.'
                : '<strong>Save your work:</strong> print this receipt or save it as a PDF before you close this page. Its check code matches these results.'
              }
            </div>
            <button type="button" class="btn ${this.state.isArchivedView ? 'btn-secondary' : 'btn-primary'}" onclick="window.print()">
              Print / Save PDF
            </button>
          </div>

          <!-- Screen Report -->
          <div class="report-screen">
            <div class="report-header-screen">
              <div class="report-title-screen">
                <span class="station-badge" style="margin-bottom:0.4rem; display:inline-block;">Practice Receipt</span>
                <h1>${escapeHtml(this.state.peId)}: ${escapeHtml(this.state.peData.info.title)}</h1>
                <p>Student: <strong>${escapeHtml(this.state.studentName)}</strong> <button type="button" class="btn btn-ghost" style="padding:2px 8px; font-size:var(--text-xs); margin-left:6px;" onclick="window.PEEngine.promptEditCandidateName()">Edit Name</button> &middot; Completed: <strong>${todayStr}</strong></p>
              </div>
              <div style="text-align:right;">
                <div style="font-size:var(--text-2xl); font-weight:900; color:var(--pe-primary);">
                  PE level ${formatMedian(sum.median)} / 4
                </div>
                <div style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--pe-ink-mute);">
                  Median of ${totalCount} skills &middot; ${passingCount} / ${totalCount} at Proficient or above
                </div>
                <div style="font-size:var(--text-2xs); color:var(--pe-ink-soft); margin-top:0.2rem;">
                  ${levelSummary}
                </div>
              </div>
            </div>

            <!-- Scorecard Table -->
            <table class="print-table" style="font-size:var(--text-sm);">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Skill</th>
                  <th>Items &amp; Tries</th>
                  <th>Result (1 to 4)</th>
                </tr>
              </thead>
              <tbody>
                ${this.state.skills.map(s => {
                  const prog = this.state.skillProgress[s.id];
                  const score = Scoring.skillScore(prog);
                  const badgeClass = (LEVEL_TAGS[score] || LEVEL_TAGS[1]).cls;
                  const badgeLabel = (score === 4 ? '&#9733; ' : '') + levelLabel(score);
                  const pathway = Scoring.pathwayText(prog);

                  return `
                    <tr>
                      <td style="font-family:var(--font-mono); font-weight:700;">${s.id}</td>
                      <td>${s.title}</td>
                      <td style="font-size:var(--text-xs); color:var(--pe-ink-soft);">${pathway}</td>
                      <td>
                        <span class="${badgeClass}">
                          ${badgeLabel}
                        </span>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <!-- Screen Study Tips Section -->
            <div class="report-study-tips">
              <div class="study-tips-header">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <span class="station-badge">What to study next</span>
                  <h3 style="font-size:var(--text-base); font-weight:800; margin:0;">Study tips and watch-outs</h3>
                </div>
                <span style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--pe-ink-mute);">Based on your results</span>
              </div>
              <div class="study-tips-grid">
                ${studyTips.map(t => `
                  <div class="study-tip-card ${t.type}">
                    <div class="study-tip-card-top">
                      <span class="study-tip-badge ${t.type}">${t.tag} &middot; ${t.skillId}</span>
                      <span class="study-tip-title">${formatStudentContent(t.title)}</span>
                    </div>
                    <p class="study-tip-text">${formatStudentContent(t.tip)}</p>
                    <div class="study-tip-link-row">
                      <span>Review:</span>
                      <a href="${t.url}" class="study-tip-link" target="_blank">${t.lesson} &rarr;</a>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Seal and QR -->
            <div style="display:flex; justify-content:space-between; align-items:center; background:var(--pe-card); border:1px solid var(--pe-border); border-radius:var(--radius-md); padding:1rem 1.25rem;">
              <div>
                <div style="font-family:var(--font-mono); font-size:var(--text-xs); color:var(--pe-ink-mute); text-transform:uppercase;">
                  Check code
                </div>
                <div style="font-family:var(--font-mono); font-size:var(--text-xl); font-weight:900; color:var(--pe-primary); letter-spacing:0.06em; margin-top:0.25rem;">
                  ${digitalSeal}
                </div>
              </div>
              <div style="display:flex; align-items:center; gap:1rem;">
                <div style="text-align:right; font-family:var(--font-mono); font-size:var(--text-2xs); color:var(--pe-ink-mute);">
                  Your teacher can scan this<br>to check the code
                </div>
                <div style="background:#fff; padding:4px; border-radius:4px; line-height:0;">
                  ${qrSvg}
                </div>
              </div>
            </div>

            <div class="report-actions" style="margin-top:0.5rem; justify-content:flex-end;">
              <a href="index.html" class="btn btn-secondary">Return to Hub</a>
              <button type="button" class="btn btn-primary" onclick="window.print()">
                Print / Save PDF Receipt
              </button>
            </div>
          </div>
        </div>

        <!-- PRINT RECEIPT SHEET (Guaranteed Single A4 Page) -->
        <div id="studyReportSheet">
          <div class="print-receipt-header">
            <div class="print-title-area">
              <h2>Chemistry PE Practice Receipt</h2>
              <p>Student: <strong>${escapeHtml(this.state.studentName)}</strong> &middot; PE: <strong>${escapeHtml(this.state.peId)}</strong> &middot; Completed: <strong>${todayStr}</strong></p>
            </div>
            <div class="print-header-center">
              <div class="print-big-score">${formatMedian(sum.median)} / 4</div>
              <div class="print-attempt-pill">${passingCount} / ${totalCount} Proficient+ &middot; ${sum.levelString}</div>
            </div>
            <div class="print-seal-container">
              <div class="print-qr-code">${qrSvg}</div>
              <div class="print-seal-meta">
                <div>Check code</div>
                <div class="print-seal-code">${digitalSeal}</div>
                <div>Seed: ${this.state.seed}</div>
                <div class="print-verify-link">Check: <a href="${verifyUrl}" target="_blank">${verifyUrl}</a></div>
              </div>
            </div>
          </div>

          <div class="print-section-title">Results by skill</div>
          <table class="print-table">
            <thead>
              <tr>
                <th style="width:14%;">Code</th>
                <th style="width:38%;">Skill</th>
                <th style="width:26%;">Items &amp; Tries</th>
                <th style="width:22%;">Result (1 to 4)</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.skills.map(s => {
                const prog = this.state.skillProgress[s.id];
                const score = Scoring.skillScore(prog);
                const tagClass = (LEVEL_TAGS[score] || LEVEL_TAGS[1]).cls;
                const tagText = (score === 4 ? '★ ' : '') + levelLabel(score).toUpperCase();
                const pathway = Scoring.pathwayText(prog);
                return `
                  <tr>
                    <td style="font-family:var(--font-mono); font-weight:700;">${s.id}</td>
                    <td>${s.title}</td>
                    <td style="font-size:6.5pt; color:#475569;">${pathway}</td>
                    <td>
                      <span class="${tagClass}">
                        ${tagText}
                      </span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="print-section-title">Study tips and watch-outs</div>
          <div class="print-study-tips-box">
            ${studyTips.slice(0, 3).map(t => `
              <div class="print-study-tip-row">
                <span class="print-tip-code">[${t.skillId}]</span>
                <span class="print-tip-body"><strong>${formatStudentContent(t.title)}</strong>: ${formatStudentContent(t.tip)} <em>(Review: ${t.lesson})</em></span>
              </div>
            `).join('')}
          </div>

          <div class="print-section-title">Every item you answered</div>
          <table class="print-table print-audit-table">
            <thead>
              <tr>
                <th style="width:8%;">#</th>
                <th style="width:22%;">Skill &amp; Level</th>
                <th style="width:14%;">Tries</th>
                <th style="width:16%;">Result</th>
                <th style="width:40%;">What it tested</th>
              </tr>
            </thead>
            <tbody>
              ${this.state.auditTrail.slice(0, 10).map((audit, idx) => `
                <tr>
                  <td style="font-family:var(--font-mono); font-weight:700;">#${idx + 1}</td>
                  <td>${audit.skillId} (${audit.level.replace(/ \(Routine\)|\(Application\)|\(Foundational\)|\(Intermediate\)|\(Mastery Challenge\)/, '')})</td>
                  <td>${audit.attempts} ${audit.attempts === 1 ? 'try' : 'tries'}</td>
                  <td>
                    <span class="${audit.passed ? 'tag-mastered' : 'tag-needs-work'}">
                      ${audit.passed ? 'SOLVED' : 'MISSED'}
                    </span>
                  </td>
                  <td>${audit.summary}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="print-footer-notice">
            <span>Chemistry PE practice receipt. The check code catches hand edits; it does not prove who did the work.</span>
            <span class="print-footer-url">Check: <a href="${verifyUrl}" target="_blank">${verifyUrl}</a></span>
          </div>
        </div>
      `;
    },

    renderHub() {
      const container = document.getElementById('workstationApp');
      if (!container) return;

      const originFrom = new URLSearchParams(window.location.search).get('from');
      const backUrl = originFrom === 'resources'
        ? '/?page=resources'
        : (originFrom === 'teachers' ? '/?page=teachers' : '../index.html');
      const backLabel = originFrom === 'resources'
        ? '&larr; Open Resources'
        : (originFrom === 'teachers' ? '&larr; Teacher Workspace' : '&larr; Chemistry Textbook');
      const verifyUrl = originFrom ? `verify.html?from=${originFrom}` : 'verify.html';

      container.innerHTML = `
        <header class="station-header">
          <div class="station-title-group">
            <a href="${backUrl}" class="station-badge" style="text-decoration:none;">${backLabel}</a>
            <div class="station-title">Chemistry Performance Expectation Adaptive Practice</div>
          </div>
          <div class="station-actions">
            <a href="${verifyUrl}" class="btn btn-ghost" style="font-size:var(--text-xs);">
              Teacher Verification Tool &rarr;
            </a>
            ${this.renderThemeToggleBtnHTML()}
          </div>
        </header>

        <div class="workstation-container">
          <div class="hub-hero">
            <span class="station-badge">Next Generation Science Standards</span>
            <h1>Adaptive Practice by Performance Expectation</h1>
            <p>
              Pick a standard below to check what you know, one skill at a time. Each question adjusts to your answers, points you to the exact lesson if you get stuck, and prints a receipt with your results when you finish.
            </p>
          </div>

          <div class="hub-student-bar">
            <label for="hubStudentName">Student Name:</label>
            <input type="text" id="hubStudentName" class="hub-student-input" placeholder="Enter your full name" value="${this.state.studentName === 'Student Chemist' ? '' : escapeHtml(this.state.studentName)}">
            <button type="button" class="btn btn-secondary" id="btnSaveName">Set Name</button>
          </div>

          <div class="pe-grid">
            ${(() => {
              let totalSkills = 0;
              let liveCount = 0;
              const cardsHtml = HUB_CARDS.map(card => {
                const bank = getPeBank(card.peId);
                const skillCount = bank && Array.isArray(bank.skills)
                  ? bank.skills.length
                  : Object.keys(SKILL_LESSON_MAP).filter(k => card.peId.endsWith(k.split('.')[0])).length;
                if (bank) liveCount++;
                totalSkills += skillCount;
                return `
                  <div class="pe-card">
                    <div class="pe-card-top">
                      <span class="pe-card-badge">${card.peId}</span>
                      <span class="pe-card-unit">${card.unitLabel} &middot; ${skillCount} Skills</span>
                    </div>
                    <h2>${card.title}</h2>
                    <p>${card.blurb}</p>
                    ${renderCardResourceLinks(card.peId)}
                    <div class="pe-card-meta">
                      <span>Diagnostic + Adaptive</span>
                      <button type="button" class="btn btn-primary" onclick="window.PEEngine.launchPE('${card.peId}')">
                        Launch Practice &rarr;
                      </button>
                    </div>
                  </div>
                `;
              }).join('');

              const totalModules = HUB_CARDS.length;
              const summaryCardHtml = `
                <div class="pe-card pe-card-complete">
                  <div class="pe-card-top">
                    <span class="pe-card-badge pe-card-badge-complete">${liveCount} / ${totalModules} Complete</span>
                    <span class="pe-card-unit pe-card-unit-complete">Every unit</span>
                  </div>
                  <h2>All Chemistry Standards Ready</h2>
                  <p>
                    All ${totalModules} Chemistry and Astrophysics standards across Units 1 through 5 are ready to practice. Each module gives you a quick diagnostic check, step-by-step practice if you miss a skill, and a printable receipt at the end.
                  </p>
                  <div class="pe-card-meta">
                    <span class="pe-card-meta-complete">Units 1 to 5 Covered</span>
                    <span class="pe-card-meta-count">${totalSkills} Assessed Skills</span>
                  </div>
                </div>
              `;
              return cardsHtml + summaryCardHtml;
            })()}
          </div>

          ${(() => {
            let history = [];
            try {
              const historyJson = localStorage.getItem('pe_chem_receipt_history');
              if (historyJson) history = JSON.parse(historyJson);
            } catch (e) {
              history = [];
            }
            if (!history.length) return '';
            return `
              <div class="receipts-history-section">
                <div class="receipts-history-header">
                  <h3 class="receipts-history-title">
                    <span>&#128220;</span> Saved Practice Receipts (${history.length})
                  </h3>
                  <span style="font-size:var(--text-xs); color:var(--pe-ink-mute); font-family:var(--font-mono);">
                    Stored locally in this browser
                  </span>
                </div>
                <div class="receipts-history-list">
                  ${history.map(item => `
                    <div class="receipt-history-card">
                      <div class="receipt-history-meta">
                        <span class="receipt-history-pe">${escapeHtml(item.peId)}</span>
                        <span>${escapeHtml(item.dateStr || '')}</span>
                      </div>
                      <div class="receipt-history-name" title="${escapeHtml(item.studentName)}">${escapeHtml(item.studentName)}</div>
                      <div style="font-size:var(--text-xs); color:var(--pe-ink-soft);">
                        ${typeof item.median === 'number' ? `PE level: <strong>${formatMedian(item.median)} / 4</strong> &middot; ` : ''}Proficient+: <strong>${item.passingCount} / ${item.totalCount}</strong>
                        ${item.levels ? `<span style="color:var(--pe-primary); font-size:var(--text-2xs); margin-left:4px; font-family:var(--font-mono);">(${escapeHtml(item.levels)})</span>` : ''}
                      </div>
                      <div class="receipt-history-seal">
                        Check code: ${item.digitalSeal ? escapeHtml(item.digitalSeal) : 'none'}
                      </div>
                      <div class="receipt-history-actions">
                        <button type="button" class="btn btn-secondary" style="font-size:var(--text-xs); padding:4px 10px;" onclick="window.PEEngine.viewSavedReceipt('${item.id}')">
                          View / Print &rarr;
                        </button>
                        <button type="button" class="btn btn-ghost" style="font-size:var(--text-2xs); color:var(--pe-warn); padding:4px 6px;" title="Delete receipt" onclick="window.PEEngine.deleteSavedReceipt('${item.id}', event)">
                          Delete
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            `;
          })()}
        </div>
      `;

      const input = document.getElementById('hubStudentName');
      const btnSave = document.getElementById('btnSaveName');
      const saveAction = () => {
        const val = input.value.trim();
        if (val) {
          localStorage.setItem('pe_chem_student_name', val);
          this.state.studentName = val;
          btnSave.textContent = 'Saved';
          setTimeout(() => { btnSave.textContent = 'Set Name'; }, 1500);
        }
      };
      btnSave.onclick = saveAction;
      input.onkeypress = (e) => { if (e.key === 'Enter') saveAction(); };
    },

    saveCurrentReceiptToArchive() {
      try {
        const historyJson = localStorage.getItem('pe_chem_receipt_history');
        const history = historyJson ? JSON.parse(historyJson) : [];

        // Avoid duplicate entry if this seal is already stored
        if (this.state.digitalSeal && history.some(r => r.digitalSeal === this.state.digitalSeal)) {
          return;
        }

        const todayStr = this.state.archivedDateStr || new Date().toISOString().split('T')[0];
        const sum = Scoring.summarize(this.state.skills || [], this.state.skillProgress || {});

        const newReceipt = {
          id: 'rcpt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
          timestamp: Date.now(),
          dateStr: todayStr,
          studentName: this.state.studentName,
          peId: this.state.peId,
          peTitle: this.state.peData && this.state.peData.info ? this.state.peData.info.title : this.state.peId,
          seed: this.state.seed,
          passingCount: sum.proficientOrAbove,
          totalCount: sum.total,
          masteredCount: sum.counts[4],
          proficientCount: sum.counts[3],
          developingCount: sum.counts[2],
          needsWorkCount: sum.counts[1],
          median: sum.median,
          levels: sum.levelString,
          sealVersion: 2,
          digitalSeal: this.state.digitalSeal,
          skills: this.state.skills,
          skillProgress: this.state.skillProgress,
          auditTrail: this.state.auditTrail
        };

        history.unshift(newReceipt);
        if (history.length > 25) {
          history.length = 25;
        }
        localStorage.setItem('pe_chem_receipt_history', JSON.stringify(history));
      } catch (err) {
        console.warn('Failed to archive receipt:', err);
      }
    },

    viewSavedReceipt(receiptId) {
      try {
        const historyJson = localStorage.getItem('pe_chem_receipt_history');
        if (!historyJson) return;
        const history = JSON.parse(historyJson);
        const receipt = history.find(r => r.id === receiptId);
        if (!receipt) return;

        this.state.studentName = receipt.studentName;
        this.state.peId = receipt.peId;
        this.state.peData = { info: { title: receipt.peTitle } };
        this.state.seed = receipt.seed;
        this.state.skills = receipt.skills;
        this.state.skillProgress = receipt.skillProgress;
        this.state.auditTrail = receipt.auditTrail || [];
        this.state.digitalSeal = receipt.digitalSeal;
        this.state.sealVersion = receipt.sealVersion || 1;
        this.state.isArchivedView = true;
        this.state.archivedDateStr = receipt.dateStr;

        const container = document.getElementById('workstationApp');
        if (container) {
          this.renderCompletion(container);
        }
      } catch (err) {
        console.error('Failed to load saved receipt:', err);
      }
    },

    deleteSavedReceipt(receiptId, event) {
      if (event) event.stopPropagation();
      if (!confirm('Remove this saved receipt from local history?')) return;
      try {
        const historyJson = localStorage.getItem('pe_chem_receipt_history');
        if (!historyJson) return;
        let history = JSON.parse(historyJson);
        history = history.filter(r => r.id !== receiptId);
        localStorage.setItem('pe_chem_receipt_history', JSON.stringify(history));
        this.renderHub();
      } catch (err) {
        console.error('Failed to delete saved receipt:', err);
      }
    },

    launchPE(peId) {
      const input = document.getElementById('hubStudentName');
      if (input && input.value.trim()) {
        localStorage.setItem('pe_chem_student_name', input.value.trim());
      }
      window.location.href = `index.html?pe=${peId}`;
    },

    promptChangeName() {
      const newName = prompt('Type your name as it should appear on your receipt:', this.state.studentName);
      if (newName && newName.trim()) {
        localStorage.setItem('pe_chem_student_name', newName.trim());
        this.state.studentName = newName.trim();
        const cleanName = this.state.studentName.toLowerCase().replace(/[^a-z0-9]/g, '');
        this.state.seed = `${cleanName || 'student'}-${this.state.peId.toLowerCase()}`;
        this.state.rng = createMulberry32(this.state.seed + ':' + newRunNonce());
        this.render();
      }
    },

    promptEditCandidateName() {
      const current = this.state.studentName === 'Student Chemist' ? '' : this.state.studentName;
      const newName = prompt('Type your full name as it should appear on your receipt:', current);
      if (newName && newName.trim()) {
        const trimmed = newName.trim();
        localStorage.setItem('pe_chem_student_name', trimmed);
        this.state.studentName = trimmed;
        const container = document.getElementById('workstationApp');
        if (container) {
          this.renderCompletion(container);
        }
      }
    }
  };

  global.PEEngine = Engine;

  document.addEventListener('DOMContentLoaded', () => {
    Engine.init();
  });
})(typeof window !== 'undefined' ? window : this);
