// ADDING A NEW SIMULATION? Add it here first — the Simulations Hub and the homepage AI advisor both derive their lists from this registry.
import { ViewType } from '../types';

export interface SimulationInfo {
  id: string;        // stable slug, used in advisor tags as [sim:<id>]
  view: ViewType;    // App.tsx view to navigate to
  title: string;
  blurb: string;     // one line, used in the AI prompt and hub card
  topics: string[];  // used for AI matching ("student asks about gas laws")
  emoji: string;     // used on the advisor shortcut button
}

export const SIMULATIONS_REGISTRY: SimulationInfo[] = [
  {
    id: 'ecosystem_balance',
    view: 'ecosystem_simulation',
    title: 'Ecosystem Balance',
    blurb: 'Model real-time interactions between plants, herbivores, and carnivores.',
    topics: ['Ecology', 'Food Webs', 'Predation', 'Population Dynamics'],
    emoji: '🌿',
  },
  {
    id: 'population_genetics',
    view: 'population_genetics',
    title: 'Population Genetics',
    blurb: 'Explore Hardy-Weinberg equilibrium and the five evolutionary forces.',
    topics: ['Hardy-Weinberg', 'Genetic Drift', 'Natural Selection', 'Gene Flow', 'Mutation'],
    emoji: '🧬',
  },
  {
    id: 'covalent_bonding',
    view: 'covalent_bonding',
    title: 'Covalent Bonding',
    blurb: 'Build molecules atom-by-atom using an overlapping circles model.',
    topics: ['Covalent Bonds', 'Lewis Structures', 'Molecular Geometry', 'VSEPR Theory'],
    emoji: '🧪',
  },
  {
    id: 'ionic_bonding',
    view: 'ionic_bonding',
    title: 'Ionic Bonding',
    blurb: 'Build ionic compounds atom-by-atom and balance charges.',
    topics: ['Ionic Bonds', 'Electron Transfer', 'Charge Balance', 'Polyatomic Ions'],
    emoji: '⚡',
  },
  {
    id: 'periodic_table',
    view: 'periodic_table',
    title: 'Periodic Table',
    blurb: 'Explore element properties, trends, electron configurations, and spectra.',
    topics: ['Periodic Trends', 'Electron Configuration', 'Element Properties'],
    emoji: '⚛️',
  },
  {
    id: 'build_an_atom',
    view: 'build_an_atom',
    title: 'Build an Atom',
    blurb: 'Build Bohr atoms nucleon-by-nucleon and explore stability and ions.',
    topics: ['Bohr Model', 'Atomic Structure', 'Isotopes & Stability', 'Ions & Valence'],
    emoji: '🔬',
  },
  {
    id: 'phase_change',
    view: 'phase_change',
    title: 'Particle Phase Change',
    blurb: 'Explore heat transfers and state changes via kinetic molecular theory.',
    topics: ['Thermodynamics', 'Phase Changes', 'Kinetic Molecular Theory', 'Intermolecular Forces'],
    emoji: '🔥',
  },
  {
    id: 'regulatory_modeler',
    view: 'regulatory_modeler',
    title: 'Biological Systems Modeler',
    blurb: 'Build and simulate biological regulatory networks and feedback loops.',
    topics: ['Hormonal Feedback', 'Signal Transduction', 'Gene Expression', 'Ecological Loops'],
    emoji: '🎛️',
  },
  {
    id: 'diffusion_simulation',
    view: 'diffusion_simulation',
    title: 'Cell Membrane Transport',
    blurb: 'Explore simple diffusion, facilitated diffusion, and active transport.',
    topics: ['Diffusion', 'Active Transport', 'Cell Membrane', 'Homeostasis'],
    emoji: '💧',
  },
  {
    id: 'reaction_kinetics_simulation',
    view: 'reaction_kinetics_simulation',
    title: 'Reaction Kinetics',
    blurb: 'Observe how temperature, concentration, and catalysts impact reaction rates.',
    topics: ['Collision Theory', 'Reaction Rates', 'Activation Energy', 'Catalysts'],
    emoji: '💥',
  },
  {
    id: 'gas_laws',
    view: 'gas_laws',
    title: 'Ideal Gas Laws',
    blurb: 'Vary pressure, volume, temperature, and moles to discover gas laws.',
    topics: ["Boyle's Law", "Charles's Law", "Avogadro's Law", "Dalton's Law", 'Kinetic Molecular Theory'],
    emoji: '🎈',
  },
  {
    id: 'free_body_diagram',
    view: 'free_body_diagram',
    title: 'Free Body Diagrams',
    blurb: 'Decompose forces into components and calculate net force vectors.',
    topics: ["Newton's Laws", 'Force Vectors', 'Equilibrium', 'Vector Decomposition'],
    emoji: '📐',
  },
  {
    id: 'motion_tracker',
    view: 'motion_tracker',
    title: 'Motion Tracker',
    blurb: 'Analyze kinematics, position-time graphs, and velocity vectors.',
    topics: ['Kinematics', 'Position-Time Graphs', 'Velocity', 'Acceleration'],
    emoji: '⏱️',
  },
  {
    id: 'calorimetry',
    view: 'calorimetry',
    title: 'Thermal & Thermochemistry Studio',
    blurb: 'Unified laboratory: specific heat sweeps, heating curve plateaus, and LOL energy balancer.',
    topics: ['Calorimetry', 'Specific Heat Capacity', 'Thermal Equilibrium', 'Heating Curves', 'Phase Changes', 'First Law of Thermodynamics', 'Enthalpy of Solution', 'LOL Energy Bar Diagrams'],
    emoji: '🔥',
  },
  {
    id: 'blood_buffer',
    view: 'blood_buffer',
    title: 'Arterial Blood Buffers',
    blurb: 'Explore human homeostatic corridor, respiratory and metabolic acid-base Le Chatelier shifts.',
    topics: ['Buffers', 'Le Chatelier Principle', 'Homeostasis', 'Blood pH Regulation', 'Carbonic Acid-Bicarbonate'],
    emoji: '🩸',
  },
  {
    id: 'nuclear_decay',
    view: 'nuclear_decay',
    title: 'Nuclear Decay & Dating',
    blurb: 'Simulate particulate nucleon decay kinetics, half-life curves, and radiometric dating.',
    topics: ['Radioactive Decay', 'Half-Life', 'Alpha and Beta Decay', 'Nuclear Transmutation', 'Radiometric Dating'],
    emoji: '☢️',
  },
  {
    id: 'osmosis_lab',
    view: 'osmosis_lab',
    title: 'Osmosis Lab',
    blurb: 'Watch water rise up a tube from a sugar-filled dialysis bag, then find out why it stops.',
    topics: ['Osmosis', 'Diffusion', 'Tonicity', 'Selectively Permeable Membranes', 'Water Potential', 'Turgor Pressure'],
    emoji: '🫧',
  },
  {
    id: 'carbon_journey',
    view: 'carbon_journey',
    title: 'Tracking a Carbon Atom',
    blurb: 'Follow one carbon atom from seawater through kelp and a sea urchin, tracking matter and energy.',
    topics: ['Carbon Cycle', 'Photosynthesis', 'Cellular Respiration', 'Conservation of Matter', 'Energy Flow', 'Food Webs'],
    emoji: '♻️',
  },
  {
    id: 'island_biogeography',
    view: 'island_biogeography',
    title: 'Island Biogeography',
    blurb: 'Change an island\'s size and distance from the mainland, and watch how many bird species it holds.',
    topics: ['Biodiversity', 'Species Richness', 'Island Biogeography', 'Habitat Fragmentation', 'Equilibrium', 'Extinction'],
    emoji: '🏝️',
  },
];

