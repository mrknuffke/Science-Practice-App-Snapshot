import { PersonaPreset } from './personaeTypes';

export const TUTOR_PRESETS: PersonaPreset[] = [
  {
    id: 'tutor_chem_stoichiometry',
    persona: 'tutor',
    title: 'Stoichiometry & Limiting Reactants',
    course: 'General Chemistry',
    topic: 'Stoichiometry and Mole Ratios',
    starterPrompt:
      'Can you guide me step-by-step through finding the limiting reactant and theoretical yield of water when 8.00 g of H₂ reacts with 32.0 g of O₂?',
    mathExpression: '2 H₂ + O₂ → 2 H₂O',
    initialScratchpad:
      'Given:\nMass H₂ = 8.00 g (Molar Mass = 2.02 g/mol)\nMass O₂ = 32.0 g (Molar Mass = 32.00 g/mol)\nTarget: Limiting reactant & Theoretical yield of H₂O in grams.',
  },
  {
    id: 'tutor_physics_kinematics',
    persona: 'tutor',
    title: 'Incline Kinematics & Acceleration',
    course: 'AP Physics 1',
    topic: '1D Kinematics and Acceleration',
    starterPrompt:
      'A cart starts from rest at the top of a 3.0 m ramp and accelerates uniformly down the ramp at 2.5 m/s². What is its velocity at the bottom and how long does it take?',
    mathExpression: 'v² = v₀² + 2aΔx | Δx = v₀t + ½at²',
    initialScratchpad:
      'Given:\nv₀ = 0 m/s\na = 2.5 m/s²\nΔx = 3.0 m\nFind: v_final, t_elapsed',
  },
  {
    id: 'tutor_bio_hardy_weinberg',
    persona: 'tutor',
    title: 'Hardy-Weinberg Frequency Calculations',
    course: 'AP Biology',
    topic: 'Population Genetics and Evolution',
    starterPrompt:
      'In a population of 500 fruit flies in genetic equilibrium, 80 flies express a recessive black body phenotype (bb). Walk me through calculating the allele frequencies p and q and the expected count of heterozygous flies.',
    mathExpression: 'p² + 2pq + q² = 1 | p + q = 1',
    initialScratchpad:
      'Given:\nTotal N = 500\nRecessive homozygous (q²) = 80/500 = 0.16\nFind: q, p, 2pq, and expected carriers (2pq × N)',
  },
  {
    id: 'tutor_enviro_trophic_efficiency',
    persona: 'tutor',
    title: 'Trophic Energy Pyramids & 10% Rule',
    course: 'AP Environmental Science',
    topic: 'Ecosystem Ecology and Energy Flow',
    starterPrompt:
      'A grassland ecosystem has a primary producer net primary productivity (NPP) of 20,000 kcal/m²/yr. Using the 10% ecological efficiency rule, walk me through calculating the energy available to tertiary consumers.',
    mathExpression: 'E_n+1 = E_n × 0.10',
    initialScratchpad:
      'Given:\nProducers = 20,000 kcal/m²/yr\nPrimary consumers (Herbivores) = ?\nSecondary consumers = ?\nTertiary consumers (Apex) = ?',
  },
];

export const SOCRATIC_PRESETS: PersonaPreset[] = [
  {
    id: 'socratic_bio_cellular_respiration',
    persona: 'socratic',
    title: 'The Metabolic Fork: Oxygen & Fermentation',
    course: 'AP Biology',
    topic: 'Cellular Energetics and Glycolysis',
    starterPrompt:
      'Why must yeast cells ferment pyruvate into ethanol and carbon dioxide when oxygen is absent, even though fermentation produces zero additional ATP?',
  },
  {
    id: 'socratic_chem_intermolecular_forces',
    persona: 'socratic',
    title: 'Hydrogen Bonding & Vapor Pressure',
    course: 'General Chemistry',
    topic: 'Intermolecular Forces and Phase Changes',
    starterPrompt:
      'If thermal energy at room temperature is sufficient to continuously break and reform hydrogen bonds in liquid water, why does water not spontaneously boil into steam at 25 °C?',
  },
  {
    id: 'socratic_physics_velocity_acceleration',
    persona: 'socratic',
    title: 'Zero Velocity with Non-Zero Acceleration',
    course: 'AP Physics 1',
    topic: 'Kinematics and Gravitational Acceleration',
    starterPrompt:
      'When you toss a tennis ball straight upward, at the exact peak of its trajectory its instantaneous velocity is zero. Does its acceleration equal zero at that same instant? Why or why not?',
  },
  {
    id: 'socratic_enviro_carrying_capacity',
    persona: 'socratic',
    title: 'Logistic Growth & Carrying Capacity',
    course: 'AP Environmental Science',
    topic: 'Population Dynamics and Carrying Capacity',
    starterPrompt:
      'Why does the growth rate (dN/dt) of a population following logistic growth peak at intermediate population sizes (K/2) rather than at high densities near carrying capacity K?',
  },
];

export const GROWTH_COACH_PRESETS: PersonaPreset[] = [
  {
    id: 'growth_error_misconception',
    persona: 'growth_coach',
    title: 'Conceptual Confusion vs Flawed Premise',
    course: 'AP Biology',
    topic: 'Photosynthesis & Light Reactions',
    starterPrompt:
      'I got an exam question wrong because I wrote that plants do photosynthesis during the day and cellular respiration only at night. I feel frustrated because I thought plants rested during the day.',
    sampleErrorText:
      'My answer: Plants do photosynthesis during daylight and cellular respiration exclusively at night. Teacher correction: Plants respire 24/7; daytime respiration is masked by higher photosynthetic O₂ output.',
  },
  {
    id: 'growth_error_calculation',
    persona: 'growth_coach',
    title: 'Multi-Step Math Slip & Unit Confusion',
    course: 'AP Physics 1',
    topic: 'Work, Energy, and Power',
    starterPrompt:
      'I knew the physics concepts on my quiz, but I missed half the points because I forgot to convert kilometers per hour into meters per second before calculating kinetic energy ½mv².',
    sampleErrorText:
      'Used v = 72 km/h directly into KE = 0.5 × 1200 kg × (72)² = 3.11 × 10⁶ J instead of converting 72 km/h ÷ 3.6 = 20 m/s → KE = 2.4 × 10⁵ J (off by factor of 13!).',
  },
  {
    id: 'growth_error_misread',
    persona: 'growth_coach',
    title: 'Overlooked Constraint / Double Negative',
    course: 'General Chemistry',
    topic: 'Equilibrium and Le Chatelier’s Principle',
    starterPrompt:
      'I missed a multiple-choice question that asked "Which of the following will NOT shift equilibrium toward products?" I read right past the word "NOT" and picked the first correct shift.',
    sampleErrorText:
      'Question: Which of the following stresses will NOT shift N₂ + 3H₂ ⇌ 2NH₃ (exothermic) to the right? Picked adding N₂ because it does shift right, overlooking NOT.',
  },
  {
    id: 'growth_error_recall_gap',
    persona: 'growth_coach',
    title: 'Recall Blank & Retrieval Practice',
    course: 'Anatomy and Physiology',
    topic: 'Cardiovascular and Renal Regulation',
    starterPrompt:
      'During my timed test, my mind completely blanked on the difference between Aldosterone and ADH. I knew they both retain water, but I mixed up which one regulates sodium vs aquaporin water channels.',
    sampleErrorText:
      'Confused Aldosterone (adrenal cortex: stimulates Na⁺ reabsorption in distal tubule) with ADH / Vasopressin (posterior pituitary: inserts aquaporin-2 channels into collecting duct).',
  },
];
