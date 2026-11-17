import { describe, it, expect } from 'vitest';
import {
  classifyErrorTaxonomy,
  parseTutorMathSteps,
  measureSocraticDepth,
  generateOfflineFallbackResponse,
  exportPersonaSessionToMarkdown,
} from '../../components/personae/personaeEngine';
import {
  TUTOR_PRESETS,
  SOCRATIC_PRESETS,
  GROWTH_COACH_PRESETS,
} from '../../components/personae/personaePresets';
import { PersonaChatMessage } from '../../components/personae/personaeTypes';

describe('AI Personae Engine & Utilities', () => {
  describe('classifyErrorTaxonomy', () => {
    it('accurately identifies calculation and unit conversion errors', () => {
      const input = 'I calculated kinetic energy but forgot to convert 72 km/h into m/s, so my arithmetic was off by a factor of 13.';
      const result = classifyErrorTaxonomy(input);
      expect(result.category).toBe('calculation');
      expect(result.categoryLabel).toContain('Unit Conversion');
      expect(result.correctiveStrategy).toContain('dimensional analysis');
      expect(result.growthAffirmation).toBeTruthy();
    });

    it('accurately identifies prompt constraint overlooks and misreads', () => {
      const input = 'I missed the question because I overlooked the word NOT and rushed through the options.';
      const result = classifyErrorTaxonomy(input);
      expect(result.category).toBe('misread');
      expect(result.categoryLabel).toContain('Misread');
      expect(result.correctiveStrategy).toContain('Circle or highlight prompt qualifiers');
      expect(result.growthAffirmation).toBeTruthy();
    });

    it('accurately identifies factual retrieval gaps and terminology blanks', () => {
      const input = 'During the quiz I completely blanked on the difference between Aldosterone and ADH and forgot which hormone regulates sodium.';
      const result = classifyErrorTaxonomy(input);
      expect(result.category).toBe('recall_gap');
      expect(result.categoryLabel).toContain('Retrieval Gap');
      expect(result.correctiveStrategy).toContain('contrasting flashcards');
      expect(result.growthAffirmation).toBeTruthy();
    });

    it('identifies conceptual misconceptions when errors are theoretical', () => {
      const input = 'I wrote that plants do photosynthesis during the day and cellular respiration only at night.';
      const result = classifyErrorTaxonomy(input);
      expect(result.category).toBe('misconception');
      expect(result.categoryLabel).toContain('Conceptual Misconception');
      expect(result.correctiveStrategy).toContain('Map the complete causal chain');
      expect(result.growthAffirmation).toBeTruthy();
    });
  });

  describe('parseTutorMathSteps', () => {
    it('parses structured steps with formulas and explanations', () => {
      const sampleText = `
Step 1: Calculate moles of H₂: n = 8.00 g / 2.02 g/mol = 3.96 mol
Step 2: Calculate moles of O₂: n = 32.0 g / 32.00 g/mol = 1.00 mol
Step 3: Determine limiting reactant: O₂ is limiting since 1.00 mol requires 2.00 mol H₂
      `;
      const steps = parseTutorMathSteps(sampleText);
      expect(steps.length).toBe(3);
      expect(steps[0].stepNumber).toBe(1);
      expect(steps[0].label).toBe('Step 1');
      expect(steps[0].explanation).toBe('Calculate moles of H₂');
      expect(steps[0].calculation).toContain('3.96 mol');
    });

    it('handles numeric bullet lists (1. and 2.)', () => {
      const sampleText = `
1. State given values: v0 = 0 m/s, a = 2.5 m/s²
2. Choose kinematic equation: v² = v₀² + 2aΔx
      `;
      const steps = parseTutorMathSteps(sampleText);
      expect(steps.length).toBe(2);
      expect(steps[0].stepNumber).toBe(1);
      expect(steps[1].stepNumber).toBe(2);
    });

    it('returns an empty array when text has no step structure', () => {
      const rawText = 'Just a paragraph explaining photosynthesis in general terms.';
      const steps = parseTutorMathSteps(rawText);
      expect(steps).toEqual([]);
    });
  });

  describe('measureSocraticDepth', () => {
    it('returns baseline depth for empty history', () => {
      const depth = measureSocraticDepth([]);
      expect(depth).toBe(10);
    });

    it('increases depth with turn count, elaboration, and causal vocabulary', () => {
      const shallowHistory: PersonaChatMessage[] = [
        { id: '1', role: 'user', text: 'Yes, it stops.', timestamp: Date.now() },
      ];
      const deepHistory: PersonaChatMessage[] = [
        {
          id: '1',
          role: 'user',
          text: 'At the top of the trajectory, the ball instantaneous velocity reaches zero because gravity acts continuously downwards, which results in a constant acceleration of 9.8 m/s².',
          timestamp: Date.now(),
        },
        {
          id: '2',
          role: 'model',
          text: 'Excellent observation. What happens to the net force at that point?',
          timestamp: Date.now(),
        },
        {
          id: '3',
          role: 'user',
          text: 'Therefore, the net force is not zero since the gravitational force mg is still pulling it towards the center of Earth, consequently maintaining downwards acceleration.',
          timestamp: Date.now(),
        },
      ];

      const shallowScore = measureSocraticDepth(shallowHistory);
      const deepScore = measureSocraticDepth(deepHistory);

      expect(deepScore).toBeGreaterThan(shallowScore);
      expect(deepScore).toBeGreaterThanOrEqual(60);
      expect(deepScore).toBeLessThanOrEqual(100);
    });
  });

  describe('generateOfflineFallbackResponse', () => {
    it('generates structured tutor response with givens and equations', () => {
      const reply = generateOfflineFallbackResponse('tutor', 'General Chemistry', 'Stoichiometry', 'How do I find moles?');
      expect(reply).toContain('### Step-by-Step Guidance');
      expect(reply).toContain('Identify the Given Quantities');
      expect(reply).toContain('General Chemistry');
    });

    it('generates reflective socratic inquiry questions', () => {
      const reply = generateOfflineFallbackResponse('socratic', 'AP Biology', 'Cellular Respiration', 'Why fermentation?');
      expect(reply).toContain('Before we look at the conclusion');
      expect(reply).toContain('Cellular Respiration');
      expect(reply).toContain('Why does that relationship hold true here?');
    });

    it('generates growth coach diagnosis and affirmation', () => {
      const reply = generateOfflineFallbackResponse(
        'growth_coach',
        'AP Physics 1',
        'Work & Energy',
        'I messed up the unit conversion from km/h to m/s'
      );
      expect(reply).toContain('### Growth Coach Reflection');
      expect(reply).toContain('Mathematical / Unit Conversion Slip');
      expect(reply).toContain('Keep in Mind:');
    });
  });

  describe('exportPersonaSessionToMarkdown', () => {
    it('exports a complete Markdown transcript with metadata and scratchpad', () => {
      const history: PersonaChatMessage[] = [
        { id: '1', role: 'user', text: 'How do I calculate kinetic energy?', timestamp: Date.now() },
        { id: '2', role: 'model', text: 'Use KE = 0.5 * m * v^2.', timestamp: Date.now() },
      ];
      const scratchpad = 'Given: m = 1200 kg, v = 20 m/s';
      const md = exportPersonaSessionToMarkdown('tutor', 'AP Physics 1', 'Kinetic Energy', history, scratchpad);

      expect(md).toContain('# AI Science Tutor: Step-by-Step Problem Solving Guide');
      expect(md).toContain('**Course:** AP Physics 1');
      expect(md).toContain('**Topic:** Kinetic Energy');
      expect(md).toContain('## 📝 Working Scratchpad & Formula Notes');
      expect(md).toContain('Given: m = 1200 kg, v = 20 m/s');
      expect(md).toContain('## 💬 Interactive Dialogue Transcript');
      expect(md).toContain('How do I calculate kinetic energy?');
      expect(md).toContain('Use KE = 0.5 * m * v^2.');
    });
  });

  describe('Presets integrity', () => {
    it('verifies that all presets for all 3 personae are well-formed', () => {
      const allPresets = [...TUTOR_PRESETS, ...SOCRATIC_PRESETS, ...GROWTH_COACH_PRESETS];
      expect(allPresets.length).toBeGreaterThanOrEqual(12);

      allPresets.forEach(preset => {
        expect(preset.id).toBeTruthy();
        expect(['tutor', 'socratic', 'growth_coach']).toContain(preset.persona);
        expect(preset.title).toBeTruthy();
        expect(preset.course).toBeTruthy();
        expect(preset.topic).toBeTruthy();
        expect(preset.starterPrompt).toBeTruthy();
      });

      // Specific checks
      TUTOR_PRESETS.forEach(p => {
        expect(p.persona).toBe('tutor');
        expect(p.initialScratchpad).toBeDefined();
      });

      SOCRATIC_PRESETS.forEach(p => {
        expect(p.persona).toBe('socratic');
      });

      GROWTH_COACH_PRESETS.forEach(p => {
        expect(p.persona).toBe('growth_coach');
        expect(p.sampleErrorText).toBeDefined();
      });
    });
  });
});
