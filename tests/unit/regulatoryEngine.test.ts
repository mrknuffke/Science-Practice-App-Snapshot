import { describe, it, expect } from 'vitest';
import { RegulatoryNode, RegulatoryConnection } from '../../types';
import { calculateNextStep } from '../../components/simulations/regulatoryModeler/regulatoryEngine';
import {
  REGULATORY_CHALLENGES,
  verifyRegulatoryChallenge,
  applyRegulatoryChallengeSolution,
  simulateCircuitSteps,
  RegulatoryChallenge,
} from '../../components/simulations/regulatoryModeler/regulatoryChallenges';
import { DECAY_RATE } from '../../components/simulations/regulatoryModeler/modelerConstants';

describe('Regulatory Engine & Challenge Solvability', () => {
  describe('calculateNextStep Pure Calculations', () => {
    it('preserves manual toggle signal nodes without decay', () => {
      const signalNode: RegulatoryNode = {
        id: 'sig',
        type: 'signal',
        label: 'Ligand',
        position: { x: 0, y: 0 },
        activationLevel: 80,
        isManualToggle: true,
      };

      const next = calculateNextStep([signalNode], [], DECAY_RATE);
      expect(next[0].activationLevel).toBe(80);
    });

    it('decays un-stimulated components proportionally to decay rate', () => {
      const node: RegulatoryNode = {
        id: 'gene1',
        type: 'gene',
        label: 'Target',
        position: { x: 0, y: 0 },
        activationLevel: 100,
      };

      const next = calculateNextStep([node], [], 0.15);
      expect(next[0].activationLevel).toBe(85); // 100 - 100 * 0.15
    });

    it('applies activation and repression influences and clamps to [0, 100]', () => {
      const source: RegulatoryNode = {
        id: 's',
        type: 'signal',
        label: 'Source',
        position: { x: 0, y: 0 },
        activationLevel: 100,
        isManualToggle: true,
      };
      const target: RegulatoryNode = {
        id: 't',
        type: 'gene',
        label: 'Target',
        position: { x: 0, y: 0 },
        activationLevel: 0,
      };

      // Full activation
      const actConn: RegulatoryConnection = {
        id: 'c1',
        sourceId: 's',
        targetId: 't',
        type: 'activation',
        strength: 2.0,
      };
      let res = calculateNextStep([source, target], [actConn], DECAY_RATE);
      expect(res.find(n => n.id === 't')!.activationLevel).toBeGreaterThan(0);

      // Repression driving below 0 clamps to 0
      const repConn: RegulatoryConnection = {
        id: 'c2',
        sourceId: 's',
        targetId: 't',
        type: 'repression',
        strength: 5.0,
      };
      res = calculateNextStep([source, target], [repConn], DECAY_RATE);
      expect(res.find(n => n.id === 't')!.activationLevel).toBe(0);
    });
  });

  describe('Multi-Step Dynamics (simulateCircuitSteps)', () => {
    it('converges simple activation cascade to 100% steady state', () => {
      const nodes: RegulatoryNode[] = [
        { id: 's', type: 'signal', label: 'Signal', position: { x: 0, y: 0 }, activationLevel: 100, isManualToggle: true },
        { id: 'g', type: 'gene', label: 'Gene', position: { x: 0, y: 0 }, activationLevel: 0 },
        { id: 'p', type: 'protein', label: 'Protein', position: { x: 0, y: 0 }, activationLevel: 0 },
      ];
      const conns: RegulatoryConnection[] = [
        { id: 'c1', sourceId: 's', targetId: 'g', type: 'activation', strength: 1.0 },
        { id: 'c2', sourceId: 'g', targetId: 'p', type: 'activation', strength: 1.0 },
      ];

      const finalNodes = simulateCircuitSteps(nodes, conns, 30);
      expect(finalNodes.find(n => n.id === 'g')!.activationLevel).toBe(100);
      expect(finalNodes.find(n => n.id === 'p')!.activationLevel).toBe(100);
    });

    it('dampens negative feedback loop into stable homeostatic corridor', () => {
      const nodes: RegulatoryNode[] = [
        { id: 'stim', type: 'signal', label: 'Stimulus', position: { x: 0, y: 0 }, activationLevel: 100, isManualToggle: true },
        { id: 'horm', type: 'hormone', label: 'Hormone', position: { x: 0, y: 0 }, activationLevel: 0 },
        { id: 'resp', type: 'receptor', label: 'Response', position: { x: 0, y: 0 }, activationLevel: 0 },
      ];
      const conns: RegulatoryConnection[] = [
        { id: 'c1', sourceId: 'stim', targetId: 'horm', type: 'activation', strength: 1.0 },
        { id: 'c2', sourceId: 'horm', targetId: 'resp', type: 'activation', strength: 1.0 },
        { id: 'c3', sourceId: 'resp', targetId: 'horm', type: 'repression', strength: 1.5 },
      ];

      const finalNodes = simulateCircuitSteps(nodes, conns, 35);
      const respLevel = finalNodes.find(n => n.id === 'resp')!.activationLevel;
      expect(respLevel).toBeGreaterThan(30);
      expect(respLevel).toBeLessThan(50);
    });
  });

  describe('Challenge Verification Engine', () => {
    it('Challenge 1 (Lac Operon): validates double-negative derepression and solves cleanly', () => {
      const ch = REGULATORY_CHALLENGES.find(c => c.id === 'reg_lac_operon')!;

      // Empty connections fail
      expect(verifyRegulatoryChallenge(ch.id, ch.start.nodes, []).success).toBe(false);

      // Inverted or incomplete circuit fails
      const brokenConns = ch.solutionSetup.connections.filter(c => c.type !== 'repression');
      expect(verifyRegulatoryChallenge(ch.id, ch.solutionSetup.nodes, brokenConns).success).toBe(false);

      // Solution setup solves
      const res = verifyRegulatoryChallenge(ch.id, ch.solutionSetup.nodes, ch.solutionSetup.connections);
      expect(res.success).toBe(true);
      expect(res.message).toContain('derepression');
    });

    it('Challenge 2 (Trp Operon): validates corepression shutdown under high tryptophan', () => {
      const ch = REGULATORY_CHALLENGES.find(c => c.id === 'reg_trp_operon')!;

      // Solution setup solves
      const res = verifyRegulatoryChallenge(ch.id, ch.solutionSetup.nodes, ch.solutionSetup.connections);
      expect(res.success).toBe(true);
      expect(res.message).toContain('repressible');
    });

    it('Challenge 3 (Endocrine Negative Feedback): validates homeostatic setpoint control', () => {
      const ch = REGULATORY_CHALLENGES.find(c => c.id === 'reg_negative_feedback')!;

      // Missing feedback repression connection fails
      const noFeedback = ch.solutionSetup.connections.filter(c => c.type !== 'repression');
      const failRes = verifyRegulatoryChallenge(ch.id, ch.solutionSetup.nodes, noFeedback);
      expect(failRes.success).toBe(false);
      expect(failRes.message).toContain('negative feedback loop');

      // Solution setup solves
      const res = verifyRegulatoryChallenge(ch.id, ch.solutionSetup.nodes, ch.solutionSetup.connections);
      expect(res.success).toBe(true);
      expect(res.message).toContain('homeostatic');
    });

    it('Challenge 4 (Glucose Antagonistic Homeostasis): validates push-pull dual loops', () => {
      const ch = REGULATORY_CHALLENGES.find(c => c.id === 'reg_glucose_homeostasis')!;

      // Solution setup solves
      const res = verifyRegulatoryChallenge(ch.id, ch.solutionSetup.nodes, ch.solutionSetup.connections);
      expect(res.success).toBe(true);
      expect(res.message).toContain('antagonistic');
    });

    it('handles unknown challenge id gracefully', () => {
      expect(verifyRegulatoryChallenge('unknown_id', [], []).success).toBe(false);
    });
  });

  describe('Solution Applicator', () => {
    it('applyRegulatoryChallengeSolution sets up solution state and solves all challenges', () => {
      REGULATORY_CHALLENGES.forEach((challenge: RegulatoryChallenge) => {
        let appliedNodes: RegulatoryNode[] = [];
        let appliedConns: RegulatoryConnection[] = [];

        applyRegulatoryChallengeSolution(
          challenge,
          (nodes) => { appliedNodes = nodes; },
          (conns) => { appliedConns = conns; }
        );

        expect(appliedNodes.length).toBeGreaterThan(0);
        expect(appliedConns.length).toBeGreaterThan(0);

        const ver = verifyRegulatoryChallenge(challenge.id, appliedNodes, appliedConns);
        expect(ver.success).toBe(true);
      });
    });
  });
});
