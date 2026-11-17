import { ChallengeDef } from '../shared/ChallengeDeck';
import {
  RegulatoryNode,
  RegulatoryConnection,
  NodeTypeDefinition,
} from '../../../types';
import {
  DECAY_RATE,
  PRESET_NODE_TYPE_SETS,
} from './modelerConstants';
import { calculateNextStep } from './regulatoryEngine';

export interface RegulatorySetup {
  nodes: RegulatoryNode[];
  connections: RegulatoryConnection[];
  nodeTypeSetId?: string;
}

export interface RegulatoryChallenge extends ChallengeDef {
  id: string;
  title: string;
  description: string;
  hints: [string, string, string];
  solution: string;
  start: RegulatorySetup;
  solutionSetup: RegulatorySetup;
}

export function simulateCircuitSteps(
  nodes: RegulatoryNode[],
  connections: RegulatoryConnection[],
  steps = 30,
  decayRate: number = DECAY_RATE
): RegulatoryNode[] {
  let current = nodes;
  for (let i = 0; i < steps; i++) {
    current = calculateNextStep(current, connections, decayRate);
  }
  return current;
}

export const REGULATORY_CHALLENGES: RegulatoryChallenge[] = [
  {
    id: 'reg_lac_operon',
    title: '1. Lac Operon Induction & Derepression',
    description:
      'Configure a double-negative bacterial operon circuit where constitutively expressed LacI repressor protein silences the operon unless an extracellular inducer (Lactose) is present. When Lactose is added, it must inactivate LacI, releasing transcription of Beta-Galactosidase protein above 70%.',
    hints: [
      'How does an inducer molecule allow gene expression without directly contacting RNA polymerase or the promoter DNA?',
      'In an inducible operon, the regulatory protein acts as a repressor. Adding inducer binds allosterically to the repressor, inactivating it. Repressing a repressor produces net activation (derepression).',
      'Connect RNA Polymerase to Lac Operon (activation), lacI Expression to LacI Repressor (activation), Lactose to LacI Repressor (repression), LacI Repressor to Lac Operon (repression), and Lac Operon to Beta-Galactosidase (activation). Toggle Lactose ON and run the simulation.',
    ],
    solution:
      'Wired double-negative derepression circuit: RNA Polymerase activates Lac Operon, lacI Expression activates LacI Repressor, Lactose represses LacI, LacI represses Lac Operon, and Lac Operon activates Beta-Galactosidase. Lactose presence inactivates LacI, elevating Beta-Galactosidase to 100%.',
    start: {
      nodeTypeSetId: 'gene_regulation',
      nodes: [
        { id: 'promoter', type: 'signal', label: 'RNA Polymerase', position: { x: 100, y: 150 }, activationLevel: 100, isManualToggle: true },
        { id: 'laci_gene', type: 'signal', label: 'lacI Expression', position: { x: 100, y: 400 }, activationLevel: 100, isManualToggle: true },
        { id: 'lactose', type: 'signal', label: 'Lactose (Inducer)', position: { x: 250, y: 550 }, activationLevel: 0, isManualToggle: true },
        { id: 'laci', type: 'protein', label: 'LacI Repressor', position: { x: 350, y: 400 }, activationLevel: 0 },
        { id: 'operon', type: 'gene', label: 'Lac Operon', position: { x: 350, y: 150 }, activationLevel: 0 },
        { id: 'betagal', type: 'protein', label: 'Beta-Galactosidase', position: { x: 600, y: 150 }, activationLevel: 0 },
      ],
      connections: [],
    },
    solutionSetup: {
      nodeTypeSetId: 'gene_regulation',
      nodes: [
        { id: 'promoter', type: 'signal', label: 'RNA Polymerase', position: { x: 100, y: 150 }, activationLevel: 100, isManualToggle: true },
        { id: 'laci_gene', type: 'signal', label: 'lacI Expression', position: { x: 100, y: 400 }, activationLevel: 100, isManualToggle: true },
        { id: 'lactose', type: 'signal', label: 'Lactose (Inducer)', position: { x: 250, y: 550 }, activationLevel: 100, isManualToggle: true },
        { id: 'laci', type: 'protein', label: 'LacI Repressor', position: { x: 350, y: 400 }, activationLevel: 50 },
        { id: 'operon', type: 'gene', label: 'Lac Operon', position: { x: 350, y: 150 }, activationLevel: 0 },
        { id: 'betagal', type: 'protein', label: 'Beta-Galactosidase', position: { x: 600, y: 150 }, activationLevel: 0 },
      ],
      connections: [
        { id: 'c1', sourceId: 'promoter', targetId: 'operon', type: 'activation', strength: 1.0 },
        { id: 'c2', sourceId: 'laci_gene', targetId: 'laci', type: 'activation', strength: 1.0 },
        { id: 'c3', sourceId: 'lactose', targetId: 'laci', type: 'repression', strength: 1.5 },
        { id: 'c4', sourceId: 'laci', targetId: 'operon', type: 'repression', strength: 1.5 },
        { id: 'c5', sourceId: 'operon', targetId: 'betagal', type: 'activation', strength: 1.0 },
      ],
    },
  },
  {
    id: 'reg_trp_operon',
    title: '2. Tryptophan Operon Co-Repression',
    description:
      'Construct a repressible biosynthesis circuit where RNA polymerase continually transcribes the Trp Operon to produce Trp Synthase under starvation conditions. When extracellular Tryptophan accumulates, it must activate the Trp Repressor, shutting down operon expression below 15% to conserve anabolic resources.',
    hints: [
      'Why is it energetically advantageous for a bacterial cell to cease synthesizing an amino acid once high concentrations are already present in its surroundings?',
      'In repressible operons, the repressor is synthesized in an inactive aporepressor form. Excess end-product acts as a corepressor, binding the repressor to form an active holorepressor that halts transcription.',
      'Connect RNA Polymerase to Trp Operon (activation), Tryptophan to Active Trp Repressor (activation), Active Trp Repressor to Trp Operon (repression), and Trp Operon to Trp Synthase (activation). Toggle Tryptophan ON.',
    ],
    solution:
      'Configured repressible negative-regulation circuit: RNA Polymerase activates Trp Operon, Tryptophan activates Trp Repressor (as corepressor), Trp Repressor represses Trp Operon, and Trp Operon activates Trp Synthase. High tryptophan collapses enzyme synthesis to < 1%.',
    start: {
      nodeTypeSetId: 'gene_regulation',
      nodes: [
        { id: 'promoter', type: 'signal', label: 'RNA Polymerase', position: { x: 100, y: 150 }, activationLevel: 100, isManualToggle: true },
        { id: 'tryptophan', type: 'signal', label: 'Tryptophan (Corepressor)', position: { x: 100, y: 400 }, activationLevel: 0, isManualToggle: true },
        { id: 'repressor', type: 'protein', label: 'Active Trp Repressor', position: { x: 350, y: 400 }, activationLevel: 0 },
        { id: 'operon', type: 'gene', label: 'Trp Operon', position: { x: 350, y: 150 }, activationLevel: 0 },
        { id: 'synthase', type: 'protein', label: 'Trp Synthase', position: { x: 600, y: 150 }, activationLevel: 0 },
      ],
      connections: [],
    },
    solutionSetup: {
      nodeTypeSetId: 'gene_regulation',
      nodes: [
        { id: 'promoter', type: 'signal', label: 'RNA Polymerase', position: { x: 100, y: 150 }, activationLevel: 100, isManualToggle: true },
        { id: 'tryptophan', type: 'signal', label: 'Tryptophan (Corepressor)', position: { x: 100, y: 400 }, activationLevel: 100, isManualToggle: true },
        { id: 'repressor', type: 'protein', label: 'Active Trp Repressor', position: { x: 350, y: 400 }, activationLevel: 0 },
        { id: 'operon', type: 'gene', label: 'Trp Operon', position: { x: 350, y: 150 }, activationLevel: 0 },
        { id: 'synthase', type: 'protein', label: 'Trp Synthase', position: { x: 600, y: 150 }, activationLevel: 0 },
      ],
      connections: [
        { id: 'c1', sourceId: 'promoter', targetId: 'operon', type: 'activation', strength: 1.0 },
        { id: 'c2', sourceId: 'tryptophan', targetId: 'repressor', type: 'activation', strength: 1.2 },
        { id: 'c3', sourceId: 'repressor', targetId: 'operon', type: 'repression', strength: 1.5 },
        { id: 'c4', sourceId: 'operon', targetId: 'synthase', type: 'activation', strength: 1.0 },
      ],
    },
  },
  {
    id: 'reg_negative_feedback',
    title: '3. Endocrine Negative Feedback & Setpoint Control',
    description:
      'Establish a self-limiting negative feedback circuit where a persistent external stimulus triggers hormone secretion, but the resulting target tissue response feeds back to inhibit further hormone release, stabilizing the response within a homeostatic setpoint window (30% to 55%).',
    hints: [
      'How do endocrine systems prevent uncontrolled amplification when a physiological stimulus remains continuously present?',
      'Negative feedback occurs when the downstream output of a pathway directly or indirectly inhibits an upstream component, generating dynamic stability around a setpoint.',
      'Connect Stimulus to Endocrine Hormone (activation), Hormone to Target Response (activation), and Target Response back to Hormone (repression). Turn on Stimulus and run the simulation.',
    ],
    solution:
      'Built homeostatic negative feedback loop: Stimulus activates Hormone, Hormone activates Target Response, and Target Response feeds back to repress Hormone. Feedback dampens the continuous stimulus to stabilize response at 37%.',
    start: {
      nodeTypeSetId: 'hormonal',
      nodes: [
        { id: 'stimulus', type: 'signal', label: 'Stimulus', position: { x: 100, y: 300 }, activationLevel: 0, isManualToggle: true },
        { id: 'hormone', type: 'hormone', label: 'Endocrine Hormone', position: { x: 350, y: 300 }, activationLevel: 0 },
        { id: 'response', type: 'receptor', label: 'Target Cell Response', position: { x: 600, y: 300 }, activationLevel: 0 },
      ],
      connections: [],
    },
    solutionSetup: {
      nodeTypeSetId: 'hormonal',
      nodes: [
        { id: 'stimulus', type: 'signal', label: 'Stimulus', position: { x: 100, y: 300 }, activationLevel: 100, isManualToggle: true },
        { id: 'hormone', type: 'hormone', label: 'Endocrine Hormone', position: { x: 350, y: 300 }, activationLevel: 0 },
        { id: 'response', type: 'receptor', label: 'Target Cell Response', position: { x: 600, y: 300 }, activationLevel: 0 },
      ],
      connections: [
        { id: 'c1', sourceId: 'stimulus', targetId: 'hormone', type: 'activation', strength: 1.0 },
        { id: 'c2', sourceId: 'hormone', targetId: 'response', type: 'activation', strength: 1.0 },
        { id: 'c3', sourceId: 'response', targetId: 'hormone', type: 'repression', strength: 1.5 },
      ],
    },
  },
  {
    id: 'reg_glucose_homeostasis',
    title: '4. Antagonistic Dual-Hormone Glucose Homeostasis',
    description:
      'Assemble the mammalian blood glucose regulatory system utilizing opposing pancreatic hormones. Elevated Blood Glucose must stimulate Insulin to promote Cellular Glucose Uptake (lowering blood glucose), while low blood glucose must derepress Glucagon to stimulate Glycogenolysis (elevating blood glucose).',
    hints: [
      'Why does the vertebrate body employ two distinct, antagonistic hormones to manage blood sugar rather than relying on a single hormone that turns on and off?',
      'Dual antagonistic hormones allow rapid push-pull regulation: insulin actively lowers blood glucose via uptake/storage, whereas glucagon actively elevates blood glucose via mobilization from liver reserves.',
      'Wire Dietary Intake to Blood Glucose (activation), Blood Glucose to Insulin (activation), Insulin to Cellular Uptake (activation), Cellular Uptake to Blood Glucose (repression), Blood Glucose to Glucagon (repression), and Glucagon to Blood Glucose (activation).',
    ],
    solution:
      'Wired antagonistic dual-hormone homeostatic network: Dietary Intake elevates Blood Glucose; Blood Glucose activates Insulin which activates Cellular Uptake, repressing Blood Glucose; meanwhile Blood Glucose represses Glucagon which activates Blood Glucose. System prevents hyperglycemic spike, stabilizing glucose near 21%.',
    start: {
      nodeTypeSetId: 'hormonal',
      nodes: [
        { id: 'diet', type: 'signal', label: 'Dietary Intake', position: { x: 150, y: 150 }, activationLevel: 0, isManualToggle: true },
        { id: 'glucose', type: 'environment', label: 'Blood Glucose', position: { x: 350, y: 150 }, activationLevel: 50 },
        { id: 'insulin', type: 'hormone', label: 'Insulin (β cells)', position: { x: 200, y: 350 }, activationLevel: 0 },
        { id: 'uptake', type: 'receptor', label: 'Cellular Uptake', position: { x: 350, y: 450 }, activationLevel: 0 },
        { id: 'glucagon', type: 'hormone', label: 'Glucagon (α cells)', position: { x: 500, y: 350 }, activationLevel: 0 },
      ],
      connections: [],
    },
    solutionSetup: {
      nodeTypeSetId: 'hormonal',
      nodes: [
        { id: 'diet', type: 'signal', label: 'Dietary Intake', position: { x: 150, y: 150 }, activationLevel: 80, isManualToggle: true },
        { id: 'glucose', type: 'environment', label: 'Blood Glucose', position: { x: 350, y: 150 }, activationLevel: 50 },
        { id: 'insulin', type: 'hormone', label: 'Insulin (β cells)', position: { x: 200, y: 350 }, activationLevel: 0 },
        { id: 'uptake', type: 'receptor', label: 'Cellular Uptake', position: { x: 350, y: 450 }, activationLevel: 0 },
        { id: 'glucagon', type: 'hormone', label: 'Glucagon (α cells)', position: { x: 500, y: 350 }, activationLevel: 0 },
      ],
      connections: [
        { id: 'c0', sourceId: 'diet', targetId: 'glucose', type: 'activation', strength: 1.0 },
        { id: 'c1', sourceId: 'glucose', targetId: 'insulin', type: 'activation', strength: 1.2 },
        { id: 'c2', sourceId: 'insulin', targetId: 'uptake', type: 'activation', strength: 1.0 },
        { id: 'c3', sourceId: 'uptake', targetId: 'glucose', type: 'repression', strength: 1.2 },
        { id: 'c4', sourceId: 'glucose', targetId: 'glucagon', type: 'repression', strength: 1.0 },
        { id: 'c5', sourceId: 'glucagon', targetId: 'glucose', type: 'activation', strength: 0.8 },
      ],
    },
  },
];

export function verifyRegulatoryChallenge(
  challengeId: string,
  nodes: RegulatoryNode[],
  connections: RegulatoryConnection[],
  decayRate: number = DECAY_RATE
): { success: boolean; message: string } {
  const challenge = REGULATORY_CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) {
    return { success: false, message: 'Select a challenge to begin.' };
  }

  if (connections.length === 0) {
    return {
      success: false,
      message: 'No regulatory connections found. Create activation or repression links between components to model the system.',
    };
  }

  // Challenge 1: Lac Operon
  if (challengeId === 'reg_lac_operon') {
    const lactoseNode = nodes.find(n => n.id === 'lactose' || /lactose/i.test(n.label));
    const repressorNode = nodes.find(n => n.id === 'laci' || /repressor/i.test(n.label));
    const operonNode = nodes.find(n => n.id === 'operon' || /operon/i.test(n.label));
    const betagalNode = nodes.find(n => n.id === 'betagal' || /galactosidase|enzyme|product/i.test(n.label));

    if (!lactoseNode || !repressorNode || !operonNode || !betagalNode) {
      return { success: false, message: 'Missing required circuit nodes (Lactose, LacI Repressor, Lac Operon, Beta-Galactosidase).' };
    }

    // Check repression connections
    const hasLactoseRepression = connections.some(c => c.sourceId === lactoseNode.id && c.targetId === repressorNode.id && c.type === 'repression');
    if (!hasLactoseRepression) {
      return { success: false, message: 'Lactose must inhibit/repress the LacI repressor protein (allosteric inactivation).' };
    }

    const hasOperonRepression = connections.some(c => c.sourceId === repressorNode.id && c.targetId === operonNode.id && c.type === 'repression');
    if (!hasOperonRepression) {
      return { success: false, message: 'Active LacI Repressor must repress transcription at the Lac Operon operator.' };
    }

    const hasBetagalActivation = connections.some(c => c.sourceId === operonNode.id && c.targetId === betagalNode.id && c.type === 'activation');
    if (!hasBetagalActivation) {
      return { success: false, message: 'The transcribed Lac Operon must activate production of Beta-Galactosidase enzyme.' };
    }

    // Dynamic test: when Lactose is ON, betagal must reach >= 70%
    const testNodesOn = nodes.map(n => n.id === lactoseNode.id ? { ...n, activationLevel: 100 } : n);
    const steadyStateOn = simulateCircuitSteps(testNodesOn, connections, 30, decayRate);
    const betagalLevelOn = steadyStateOn.find(n => n.id === betagalNode.id)?.activationLevel ?? 0;

    if (betagalLevelOn < 70) {
      return {
        success: false,
        message: `Beta-Galactosidase level is only ${betagalLevelOn.toFixed(1)}%. Ensure RNA Polymerase activates the operon and lacI Expression drives the repressor.`,
      };
    }

    // Dynamic test: when Lactose is OFF, betagal must stay <= 20%
    const testNodesOff = nodes.map(n => n.id === lactoseNode.id ? { ...n, activationLevel: 0 } : n);
    const steadyStateOff = simulateCircuitSteps(testNodesOff, connections, 30, decayRate);
    const betagalLevelOff = steadyStateOff.find(n => n.id === betagalNode.id)?.activationLevel ?? 0;

    if (betagalLevelOff > 20) {
      return {
        success: false,
        message: `In the absence of lactose, Beta-Galactosidase is still expressed at ${betagalLevelOff.toFixed(1)}%. Repression must fully silence the operon when lactose is absent.`,
      };
    }

    return { success: true, message: `${challenge.solution}` };
  }

  // Challenge 2: Trp Operon
  if (challengeId === 'reg_trp_operon') {
    const trpNode = nodes.find(n => n.id === 'tryptophan' || (n.type === 'signal' && /tryptophan/i.test(n.label)));
    const repressorNode = nodes.find(n => n.id === 'repressor' || (n.type === 'protein' && /repressor/i.test(n.label)));
    const operonNode = nodes.find(n => n.id === 'operon' || /operon/i.test(n.label));
    const synthaseNode = nodes.find(n => n.id === 'synthase' || /synthase/i.test(n.label));

    if (!trpNode || !repressorNode || !operonNode || !synthaseNode) {
      return { success: false, message: 'Missing required circuit components for the Trp operon.' };
    }

    const hasTrpActivation = connections.some(c => c.sourceId === trpNode.id && c.targetId === repressorNode.id && c.type === 'activation');
    if (!hasTrpActivation) {
      return { success: false, message: 'Tryptophan must bind and activate the Trp repressor as a corepressor.' };
    }

    const hasOperonRepression = connections.some(c => c.sourceId === repressorNode.id && c.targetId === operonNode.id && c.type === 'repression');
    if (!hasOperonRepression) {
      return { success: false, message: 'Active Trp Repressor must repress the Trp Operon operator.' };
    }

    // Dynamic test: when Tryptophan is ON, Trp Synthase must drop <= 15%
    const testNodesOn = nodes.map(n => n.id === trpNode.id ? { ...n, activationLevel: 100 } : n);
    const steadyStateOn = simulateCircuitSteps(testNodesOn, connections, 30, decayRate);
    const synthaseLevelOn = steadyStateOn.find(n => n.id === synthaseNode.id)?.activationLevel ?? 0;

    if (synthaseLevelOn > 15) {
      return {
        success: false,
        message: `When tryptophan is abundant, Trp Synthase is still at ${synthaseLevelOn.toFixed(1)}%. Increase repressor strength to shut down synthesis.`,
      };
    }

    // Dynamic test: when Tryptophan is OFF, Trp Synthase must be derepressed (>= 70%)
    const testNodesOff = nodes.map(n => n.id === trpNode.id ? { ...n, activationLevel: 0 } : n);
    const steadyStateOff = simulateCircuitSteps(testNodesOff, connections, 30, decayRate);
    const synthaseLevelOff = steadyStateOff.find(n => n.id === synthaseNode.id)?.activationLevel ?? 0;

    if (synthaseLevelOff < 70) {
      return {
        success: false,
        message: `During tryptophan starvation, Trp Synthase expression is only ${synthaseLevelOff.toFixed(1)}%. Ensure RNA Polymerase activates the operon when uninhibited.`,
      };
    }

    return { success: true, message: `${challenge.solution}` };
  }

  // Challenge 3: Negative Feedback Setpoint
  if (challengeId === 'reg_negative_feedback') {
    const stimulusNode = nodes.find(n => n.id === 'stimulus' || /stimulus/i.test(n.label));
    const hormoneNode = nodes.find(n => n.id === 'hormone' || /hormone/i.test(n.label));
    const responseNode = nodes.find(n => n.id === 'response' || /response|receptor/i.test(n.label));

    if (!stimulusNode || !hormoneNode || !responseNode) {
      return { success: false, message: 'Missing Stimulus, Hormone, or Target Response nodes.' };
    }

    const hasFeedbackRepression = connections.some(c => c.sourceId === responseNode.id && c.targetId === hormoneNode.id && c.type === 'repression');
    if (!hasFeedbackRepression) {
      return { success: false, message: 'A closed negative feedback loop requires the Target Response to repress Hormone secretion.' };
    }

    // Dynamic test: under stimulus, response stabilizes within [30%, 55%]
    const testNodes = nodes.map(n => n.id === stimulusNode.id ? { ...n, activationLevel: 100 } : n);
    const steadyState = simulateCircuitSteps(testNodes, connections, 30, decayRate);
    const responseLevel = steadyState.find(n => n.id === responseNode.id)?.activationLevel ?? 0;

    if (responseLevel < 30 || responseLevel > 55) {
      return {
        success: false,
        message: `Target response stabilized at ${responseLevel.toFixed(1)}%, outside the homeostatic target window (30% to 55%). Tune connection strengths.`,
      };
    }

    return { success: true, message: `${challenge.solution}` };
  }

  // Challenge 4: Glucose Homeostasis
  if (challengeId === 'reg_glucose_homeostasis') {
    const glucoseNode = nodes.find(n => n.id === 'glucose' || /glucose/i.test(n.label));
    const insulinNode = nodes.find(n => n.id === 'insulin' || /insulin/i.test(n.label));
    const uptakeNode = nodes.find(n => n.id === 'uptake' || /uptake/i.test(n.label));
    const glucagonNode = nodes.find(n => n.id === 'glucagon' || /glucagon/i.test(n.label));

    if (!glucoseNode || !insulinNode || !uptakeNode || !glucagonNode) {
      return { success: false, message: 'Missing Glucose, Insulin, Cellular Uptake, or Glucagon components.' };
    }

    const hasInsulinUptakeLoop =
      connections.some(c => c.sourceId === glucoseNode.id && c.targetId === insulinNode.id && c.type === 'activation') &&
      connections.some(c => c.sourceId === insulinNode.id && c.targetId === uptakeNode.id && c.type === 'activation') &&
      connections.some(c => c.sourceId === uptakeNode.id && c.targetId === glucoseNode.id && c.type === 'repression');

    if (!hasInsulinUptakeLoop) {
      return {
        success: false,
        message: 'Insulin loop incomplete: Glucose must activate Insulin, Insulin must activate Uptake, and Uptake must repress Glucose.',
      };
    }

    const hasGlucagonLoop =
      connections.some(c => c.sourceId === glucoseNode.id && c.targetId === glucagonNode.id && c.type === 'repression') &&
      connections.some(c => c.sourceId === glucagonNode.id && c.targetId === glucoseNode.id && c.type === 'activation');

    if (!hasGlucagonLoop) {
      return {
        success: false,
        message: 'Glucagon loop incomplete: Glucose must repress Glucagon, and Glucagon must activate Blood Glucose.',
      };
    }

    // Dynamic test: with dietary influx (80), glucose is contained <= 35%
    const dietNode = nodes.find(n => n.id === 'diet' || /diet/i.test(n.label));
    const testNodes = nodes.map(n => {
      if (dietNode && n.id === dietNode.id) return { ...n, activationLevel: 80 };
      if (n.id === glucoseNode.id) return { ...n, activationLevel: 50 };
      return n;
    });
    const steadyState = simulateCircuitSteps(testNodes, connections, 30, decayRate);
    const finalGlucose = steadyState.find(n => n.id === glucoseNode.id)?.activationLevel ?? 0;

    if (finalGlucose > 35) {
      return {
        success: false,
        message: `Blood glucose reached ${finalGlucose.toFixed(1)}% under dietary load. Increase insulin activation or uptake repression strength to contain glucose below 35%.`,
      };
    }

    return { success: true, message: `${challenge.solution}` };
  }

  return { success: false, message: 'Unknown challenge ID.' };
}

export function applyRegulatoryChallengeSolution(
  challenge: RegulatoryChallenge,
  setNodes: (_nodes: RegulatoryNode[]) => void,
  setConnections: (_conns: RegulatoryConnection[]) => void,
  setNodeTypeDefinitions?: (_types: NodeTypeDefinition[]) => void
): void {
  setNodes(challenge.solutionSetup.nodes.map(n => ({ ...n })));
  setConnections(challenge.solutionSetup.connections.map(c => ({ ...c })));
  if (challenge.solutionSetup.nodeTypeSetId && setNodeTypeDefinitions) {
    const set = PRESET_NODE_TYPE_SETS[challenge.solutionSetup.nodeTypeSetId];
    if (set) setNodeTypeDefinitions(set.types);
  }
}
