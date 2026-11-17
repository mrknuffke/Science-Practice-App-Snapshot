import { describe, it, expect } from 'vitest';
import {
  extractPropositions,
  evaluatePresetMap,
  arrangeInCircle,
  exportToMermaid,
  exportToMarkdown,
} from '../../components/conceptMap/conceptMapEngine';
import { CONCEPT_MAP_PRESETS } from '../../components/conceptMap/conceptMapPresets';
import {
  ConceptNode,
  ConceptEdge,
  ConceptMapEvaluation,
} from '../../components/conceptMap/conceptMapTypes';

describe('conceptMapEngine', () => {
  const energyPreset = CONCEPT_MAP_PRESETS.find(p => p.id === 'bio-cellular-energy')!;

  const testNodes: ConceptNode[] = [
    { id: 'photosynthesis', label: 'Photosynthesis', x: 200, y: 200, category: 'Pathway' },
    { id: 'glucose', label: 'Glucose', x: 400, y: 200, category: 'Molecule' },
    { id: 'respiration', label: 'Cellular Respiration', x: 600, y: 200, category: 'Pathway' },
    { id: 'atp', label: 'ATP', x: 400, y: 400, category: 'Energy' },
  ];

  it('extracts propositions cleanly from nodes and edges', () => {
    const edges: ConceptEdge[] = [
      { id: 'e1', source: 'photosynthesis', target: 'glucose', label: 'produces' },
      { id: 'e2', source: 'respiration', target: 'atp', label: 'produces' },
    ];

    const propositions = extractPropositions(testNodes, edges);
    expect(propositions).toHaveLength(2);
    expect(propositions[0]).toEqual({
      id: 'e1',
      sourceId: 'photosynthesis',
      sourceLabel: 'Photosynthesis',
      targetId: 'glucose',
      targetLabel: 'Glucose',
      linkingPhrase: 'produces',
      status: 'unreviewed',
      feedback: '',
    });
    expect(propositions[1].sourceLabel).toBe('Cellular Respiration');
    expect(propositions[1].targetLabel).toBe('ATP');
  });

  describe('evaluatePresetMap', () => {
    it('validates sound canonical propositions', () => {
      const edges: ConceptEdge[] = [
        { id: 'e1', source: 'photosynthesis', target: 'glucose', label: 'produces' },
        { id: 'e2', source: 'respiration', target: 'atp', label: 'produces' },
      ];

      const evaluation = evaluatePresetMap(testNodes, edges, energyPreset);
      expect(evaluation.overallScore).toBe(2);
      expect(evaluation.masteryPercentage).toBeGreaterThan(0);
      expect(evaluation.propositions[0].status).toBe('correct');
      expect(evaluation.propositions[0].feedback).toContain('Sound relationship');
    });

    it('handles synonym variations gracefully (e.g. makes, yields, synthesizes)', () => {
      const edges: ConceptEdge[] = [
        { id: 'e1', source: 'photosynthesis', target: 'glucose', label: 'makes' },
      ];

      const evaluation = evaluatePresetMap(testNodes, edges, energyPreset);
      expect(evaluation.propositions[0].status).toBe('correct');
    });

    it('detects backwards/inverted causality vectors as misconceptions', () => {
      // Inverting Glucose -> produces -> Photosynthesis (backwards causality)
      const edges: ConceptEdge[] = [
        { id: 'e1', source: 'glucose', target: 'photosynthesis', label: 'produces' },
      ];

      const evaluation = evaluatePresetMap(testNodes, edges, energyPreset);
      expect(evaluation.propositions[0].status).toBe('invalid');
      expect(evaluation.propositions[0].feedback).toContain('Inverted arrow');
      expect(evaluation.misconceptions.length).toBeGreaterThan(0);
      expect(evaluation.misconceptions[0]).toContain('Directional inversion');
    });

    it('flags imprecise linking phrases with helpful suggestions', () => {
      const edges: ConceptEdge[] = [
        { id: 'e1', source: 'photosynthesis', target: 'glucose', label: 'relates to' },
      ];

      const evaluation = evaluatePresetMap(testNodes, edges, energyPreset);
      expect(evaluation.propositions[0].status).toBe('needs_work');
      expect(evaluation.propositions[0].feedback).toContain('could be more precise');
    });

    it('identifies missing key connections to complete mastery', () => {
      const edges: ConceptEdge[] = [
        { id: 'e1', source: 'photosynthesis', target: 'glucose', label: 'produces' },
      ];

      const evaluation = evaluatePresetMap(testNodes, edges, energyPreset);
      expect(evaluation.missingKeyConnections.length).toBeGreaterThan(0);
    });
  });

  describe('arrangeInCircle', () => {
    it('returns empty array when no nodes are provided', () => {
      expect(arrangeInCircle([], 300, 300, 100)).toEqual([]);
    });

    it('arranges nodes in an equidistant circle around center coordinates', () => {
      const arranged = arrangeInCircle(testNodes, 400, 300, 200);
      expect(arranged).toHaveLength(testNodes.length);

      // Verify each node is approximately radius distance from center
      arranged.forEach(node => {
        const dx = node.x - 400;
        const dy = node.y - 300;
        const dist = Math.sqrt(dx * dx + dy * dy);
        expect(dist).toBeCloseTo(200, 0);
      });
    });
  });

  describe('exportToMermaid', () => {
    it('produces valid Mermaid graph TD definition', () => {
      const edges: ConceptEdge[] = [
        { id: 'e1', source: 'photosynthesis', target: 'glucose', label: 'produces' },
      ];

      const mermaid = exportToMermaid('Cellular Energy', testNodes.slice(0, 2), edges);
      expect(mermaid).toContain('graph TD');
      expect(mermaid).toContain('photosynthesis["Photosynthesis"]');
      expect(mermaid).toContain('glucose["Glucose"]');
      expect(mermaid).toContain('photosynthesis -->|"produces"| glucose');
    });
  });

  describe('exportToMarkdown', () => {
    it('produces structured markdown report with visual mermaid block and evaluation summary', () => {
      const edges: ConceptEdge[] = [
        { id: 'e1', source: 'photosynthesis', target: 'glucose', label: 'produces' },
      ];
      const evaluation: ConceptMapEvaluation = {
        overallScore: 1,
        maxScore: 6,
        masteryPercentage: 17,
        feedbackSummary: 'Good initial start with sound photosynthesis products.',
        propositions: [
          {
            id: 'e1',
            sourceId: 'photosynthesis',
            sourceLabel: 'Photosynthesis',
            targetId: 'glucose',
            targetLabel: 'Glucose',
            linkingPhrase: 'produces',
            status: 'correct',
            feedback: 'Sound relationship.',
          },
        ],
        missingKeyConnections: ['Cellular Respiration -> produces -> ATP'],
        misconceptions: [],
        praise: ['Sound metabolic pathway.'],
      };

      const md = exportToMarkdown(
        energyPreset.title,
        energyPreset.course,
        energyPreset.topic,
        testNodes.slice(0, 2),
        edges,
        evaluation
      );

      expect(md).toContain(`# Concept Map: ${energyPreset.title}`);
      expect(md).toContain('**Course:** AP Biology');
      expect(md).toContain('```mermaid');
      expect(md).toContain('## 2. Propositions');
      expect(md).toContain('**Mastery Score:** 17%');
      expect(md).toContain('Recommended Connections to Explore');
    });
  });
});
