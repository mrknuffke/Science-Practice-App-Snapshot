import { RegulatoryNode, RegulatoryConnection, NodeTypeDefinition } from '../../../types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const SIMULATION_TICK_MS = 200; // 5 FPS
export const GRAPH_HISTORY_LENGTH = 100;

export const NODE_COLORS: Record<string, string> = {
  signal: '#f59e0b',
  gene: '#6366f1',
  protein: '#10b981',
  environment: '#64748b',
  hormone: '#ec4899',
  receptor: '#8b5cf6',
  organism: '#f97316',
  molecule: '#06b6d4',
  population: '#84cc16',
  custom: '#a78bfa',
};

export const CONNECTION_COLORS = {
  activation: '#10b981',
  repression: '#ef4444',
};

export const DECAY_RATE = 0.15;
export const ACTIVATION_RATE = 20;
export const REPRESSION_RATE = 30;

// Preset node type palettes per domain
export const PRESET_NODE_TYPE_SETS: Record<string, { label: string; types: NodeTypeDefinition[] }> = {
  gene_regulation: {
    label: 'Gene Regulation',
    types: [
      { id: 'signal', label: 'Signal Molecule', color: '#f59e0b', description: 'Extracellular or intracellular trigger' },
      { id: 'gene', label: 'Gene / Operon', color: '#6366f1', description: 'DNA-level regulatory element' },
      { id: 'protein', label: 'Protein / Enzyme', color: '#10b981', description: 'Gene product: transcription factor, enzyme, etc.' },
      { id: 'environment', label: 'Environment', color: '#64748b', description: 'External condition (e.g. temperature, nutrients)' },
    ],
  },
  hormonal: {
    label: 'Hormonal Feedback',
    types: [
      { id: 'signal', label: 'Stimulus', color: '#f59e0b', description: 'Initial trigger (blood glucose, temperature, etc.)' },
      { id: 'hormone', label: 'Hormone', color: '#ec4899', description: 'Chemical messenger carried in blood' },
      { id: 'receptor', label: 'Target Cell / Receptor', color: '#8b5cf6', description: 'Cell with receptors for the hormone' },
      { id: 'molecule', label: 'Second Messenger', color: '#06b6d4', description: 'Intracellular signal amplifier' },
      { id: 'environment', label: 'Environment', color: '#64748b', description: 'Monitored variable (blood glucose, temp)' },
    ],
  },
  signal_transduction: {
    label: 'Signal Transduction',
    types: [
      { id: 'signal', label: 'Ligand / Signal', color: '#f59e0b', description: 'Extracellular signal molecule' },
      { id: 'receptor', label: 'Membrane Receptor', color: '#8b5cf6', description: 'Cell surface receptor (GPCR, RTK, etc.)' },
      { id: 'molecule', label: 'Signaling Molecule', color: '#06b6d4', description: 'Intracellular relay (G-protein, cAMP, etc.)' },
      { id: 'protein', label: 'Effector Protein', color: '#10b981', description: 'Final effector (kinase, ion channel, etc.)' },
      { id: 'gene', label: 'Target Gene', color: '#6366f1', description: 'Transcriptional response' },
    ],
  },
  ecological: {
    label: 'Ecological Feedback',
    types: [
      { id: 'population', label: 'Population', color: '#84cc16', description: 'A group of organisms of the same species' },
      { id: 'organism', label: 'Resource', color: '#f97316', description: 'Food source, water, space, etc.' },
      { id: 'environment', label: 'Abiotic Factor', color: '#64748b', description: 'Temperature, rainfall, etc.' },
      { id: 'signal', label: 'Disturbance', color: '#f59e0b', description: 'External event (fire, drought, predation surge)' },
    ],
  },
};

// Starter Circuits
export interface StarterCircuit {
  id: string;
  name: string;
  description: string;
  category: 'gene' | 'hormonal' | 'signal' | 'ecology';
  nodes: RegulatoryNode[];
  connections: RegulatoryConnection[];
  nodeTypeSetId?: string; // which preset type set to load
}

export const STARTER_CIRCUITS: StarterCircuit[] = [
  // ── Gene regulation ───────────────────────────────────────────────────────
  {
    id: 'simple_activation',
    name: 'Simple Activation',
    description: 'An upstream signal turns on a gene, which produces a protein.',
    category: 'gene',
    nodeTypeSetId: 'gene_regulation',
    nodes: [
      { id: 'n1', type: 'signal', label: 'Signal Molecule', position: { x: 100, y: 300 }, activationLevel: 0, isManualToggle: true },
      { id: 'n2', type: 'gene', label: 'Target Gene', position: { x: 350, y: 300 }, activationLevel: 0 },
      { id: 'n3', type: 'protein', label: 'Protein Product', position: { x: 600, y: 300 }, activationLevel: 0 },
    ],
    connections: [
      { id: 'c1', sourceId: 'n1', targetId: 'n2', type: 'activation', strength: 1.0 },
      { id: 'c2', sourceId: 'n2', targetId: 'n3', type: 'activation', strength: 1.0 },
    ],
  },
  {
    id: 'negative_feedback',
    name: 'Negative Feedback Loop',
    description: 'A gene product represses its own production: creates stability or oscillation.',
    category: 'gene',
    nodeTypeSetId: 'gene_regulation',
    nodes: [
      { id: 'n1', type: 'signal', label: 'Start Signal', position: { x: 100, y: 300 }, activationLevel: 0, isManualToggle: true },
      { id: 'n2', type: 'gene', label: 'Operon', position: { x: 350, y: 300 }, activationLevel: 0 },
      { id: 'n3', type: 'protein', label: 'Repressor', position: { x: 600, y: 300 }, activationLevel: 0 },
    ],
    connections: [
      { id: 'c1', sourceId: 'n1', targetId: 'n2', type: 'activation', strength: 1.0 },
      { id: 'c2', sourceId: 'n2', targetId: 'n3', type: 'activation', strength: 1.0 },
      { id: 'c3', sourceId: 'n3', targetId: 'n2', type: 'repression', strength: 1.5 },
    ],
  },
  {
    id: 'double_negative',
    name: 'Double Negative (Toggle)',
    description: 'Repressing a repressor leads to net activation: a common bistable switch.',
    category: 'gene',
    nodeTypeSetId: 'gene_regulation',
    nodes: [
      { id: 'n1', type: 'signal', label: 'Signal', position: { x: 100, y: 300 }, activationLevel: 0, isManualToggle: true },
      { id: 'n2', type: 'protein', label: 'Repressor A', position: { x: 300, y: 300 }, activationLevel: 80 },
      { id: 'n3', type: 'gene', label: 'Target Gene', position: { x: 500, y: 300 }, activationLevel: 0 },
    ],
    connections: [
      { id: 'c1', sourceId: 'n1', targetId: 'n2', type: 'repression', strength: 1.0 },
      { id: 'c2', sourceId: 'n2', targetId: 'n3', type: 'repression', strength: 1.0 },
    ],
  },

  // ── Hormonal ──────────────────────────────────────────────────────────────
  {
    id: 'insulin_glucagon',
    name: 'Blood Glucose Homeostasis',
    description: 'Insulin and glucagon maintain blood glucose within a narrow range via opposing hormone loops.',
    category: 'hormonal',
    nodeTypeSetId: 'hormonal',
    nodes: [
      { id: 'n1', type: 'environment', label: 'Blood Glucose', position: { x: 400, y: 150 }, activationLevel: 50 },
      { id: 'n2', type: 'hormone', label: 'Insulin (β cells)', position: { x: 200, y: 350 }, activationLevel: 0 },
      { id: 'n3', type: 'receptor', label: 'Body Cells', position: { x: 400, y: 450 }, activationLevel: 0 },
      { id: 'n4', type: 'hormone', label: 'Glucagon (α cells)', position: { x: 600, y: 350 }, activationLevel: 0 },
    ],
    connections: [
      { id: 'c1', sourceId: 'n1', targetId: 'n2', type: 'activation', strength: 1.2 },  // high glucose → insulin
      { id: 'c2', sourceId: 'n2', targetId: 'n3', type: 'activation', strength: 1.0 },  // insulin → uptake
      { id: 'c3', sourceId: 'n3', targetId: 'n1', type: 'repression', strength: 1.0 },  // uptake lowers glucose
      { id: 'c4', sourceId: 'n1', targetId: 'n4', type: 'repression', strength: 1.0 },  // high glucose suppresses glucagon
      { id: 'c5', sourceId: 'n4', targetId: 'n1', type: 'activation', strength: 0.8 },  // glucagon raises glucose
    ],
  },

  // ── Signal Transduction ───────────────────────────────────────────────────
  {
    id: 'gpcr_cascade',
    name: 'G-Protein Receptor Cascade',
    description: 'A ligand activates a GPCR, releasing G-protein that amplifies a second messenger signal.',
    category: 'signal',
    nodeTypeSetId: 'signal_transduction',
    nodes: [
      { id: 'n1', type: 'signal', label: 'Ligand', position: { x: 100, y: 300 }, activationLevel: 0, isManualToggle: true },
      { id: 'n2', type: 'receptor', label: 'GPCR (inactive)', position: { x: 280, y: 300 }, activationLevel: 0 },
      { id: 'n3', type: 'molecule', label: 'G-protein (Gα)', position: { x: 460, y: 200 }, activationLevel: 0 },
      { id: 'n4', type: 'molecule', label: 'cAMP (2nd messenger)', position: { x: 460, y: 400 }, activationLevel: 0 },
      { id: 'n5', type: 'protein', label: 'PKA (effector kinase)', position: { x: 640, y: 300 }, activationLevel: 0 },
    ],
    connections: [
      { id: 'c1', sourceId: 'n1', targetId: 'n2', type: 'activation', strength: 1.0 },
      { id: 'c2', sourceId: 'n2', targetId: 'n3', type: 'activation', strength: 1.2 },
      { id: 'c3', sourceId: 'n3', targetId: 'n4', type: 'activation', strength: 1.5 },
      { id: 'c4', sourceId: 'n4', targetId: 'n5', type: 'activation', strength: 1.0 },
      { id: 'c5', sourceId: 'n5', targetId: 'n2', type: 'repression', strength: 0.5 }, // downstream desensitization
    ],
  },

  // ── Ecological ────────────────────────────────────────────────────────────
  {
    id: 'predator_prey',
    name: 'Predator-Prey Negative Feedback',
    description: 'Classic Lotka-Volterra: prey growth is limited by predators; predator survival depends on prey.',
    category: 'ecology',
    nodeTypeSetId: 'ecological',
    nodes: [
      { id: 'n1', type: 'organism', label: 'Plant / Resource', position: { x: 150, y: 300 }, activationLevel: 70, isManualToggle: true },
      { id: 'n2', type: 'population', label: 'Prey Population', position: { x: 400, y: 300 }, activationLevel: 40 },
      { id: 'n3', type: 'population', label: 'Predator Population', position: { x: 640, y: 300 }, activationLevel: 20 },
    ],
    connections: [
      { id: 'c1', sourceId: 'n1', targetId: 'n2', type: 'activation', strength: 1.0 },  // resources feed prey
      { id: 'c2', sourceId: 'n2', targetId: 'n3', type: 'activation', strength: 0.8 },  // prey feeds predators
      { id: 'c3', sourceId: 'n3', targetId: 'n2', type: 'repression', strength: 1.0 },  // predators eat prey
      { id: 'c4', sourceId: 'n2', targetId: 'n1', type: 'repression', strength: 0.6 },  // prey consumes resources
    ],
  },
];
