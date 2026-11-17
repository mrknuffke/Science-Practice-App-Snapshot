import { describe, it, expect } from 'vitest';
import {
  normalizeAnswer,
  isAnswerCorrect,
  evaluateDiagramAttempts,
  exportDiagramNotesToMarkdown,
} from '../../components/diagramLabeling/diagramLabelingEngine';
import { DIAGRAM_PRESETS } from '../../components/diagramLabeling/diagramLabelingPresets';

describe('Diagram Labeling Engine', () => {
  describe('normalizeAnswer', () => {
    it('lowercases and removes punctuation and whitespace', () => {
      expect(normalizeAnswer('  Outer Membrane! ')).toBe('outermembrane');
      expect(normalizeAnswer('Loop of Henle (descending)')).toBe('loopofhenledescending');
    });

    it('strips leading English articles', () => {
      expect(normalizeAnswer('The Stroma')).toBe('stroma');
      expect(normalizeAnswer('A Galvanic Cell')).toBe('galvaniccell');
      expect(normalizeAnswer('An Ammeter')).toBe('ammeter');
    });

    it('handles empty strings gracefully', () => {
      expect(normalizeAnswer('')).toBe('');
      expect(normalizeAnswer('   ')).toBe('');
    });
  });

  describe('isAnswerCorrect', () => {
    const canonical = 'Outer Membrane';
    const synonyms = ['Outer lipid membrane', 'External membrane'];

    it('matches exact canonical string', () => {
      expect(isAnswerCorrect('Outer Membrane', canonical, synonyms)).toBe(true);
    });

    it('matches case-insensitively and with leading article', () => {
      expect(isAnswerCorrect('the outer membrane', canonical, synonyms)).toBe(true);
      expect(isAnswerCorrect('outer membrane', canonical, synonyms)).toBe(true);
    });

    it('matches accepted synonyms', () => {
      expect(isAnswerCorrect('External Membrane', canonical, synonyms)).toBe(true);
      expect(isAnswerCorrect('the outer lipid membrane', canonical, synonyms)).toBe(true);
    });

    it('rejects incorrect guesses', () => {
      expect(isAnswerCorrect('Inner Membrane', canonical, synonyms)).toBe(false);
      expect(isAnswerCorrect('Mitochondria', canonical, synonyms)).toBe(false);
    });

    it('rejects empty or whitespace guesses', () => {
      expect(isAnswerCorrect('', canonical, synonyms)).toBe(false);
      expect(isAnswerCorrect('   ', canonical, synonyms)).toBe(false);
    });
  });

  describe('evaluateDiagramAttempts', () => {
    const preset = DIAGRAM_PRESETS[0]; // Chloroplast preset

    it('evaluates a 100% correct set of guesses', () => {
      const allCorrectGuesses: Record<string, string> = {};
      preset.callouts.forEach(c => {
        allCorrectGuesses[c.id] = c.label;
      });

      const evaluation = evaluateDiagramAttempts(preset, allCorrectGuesses);
      expect(evaluation.totalCallouts).toBe(preset.callouts.length);
      expect(evaluation.correctCount).toBe(preset.callouts.length);
      expect(evaluation.scorePercentage).toBe(100);
      expect(evaluation.allComplete).toBe(true);
    });

    it('evaluates partially correct or incomplete guesses accurately', () => {
      const partialGuesses: Record<string, string> = {
        [preset.callouts[0].id]: preset.callouts[0].label,
        [preset.callouts[1].id]: 'Wrong Answer',
      };

      const evaluation = evaluateDiagramAttempts(preset, partialGuesses);
      expect(evaluation.totalCallouts).toBe(preset.callouts.length);
      expect(evaluation.correctCount).toBe(1);
      expect(evaluation.scorePercentage).toBe(Math.round((1 / preset.callouts.length) * 100));
      expect(evaluation.attempts[preset.callouts[0].id].isCorrect).toBe(true);
      expect(evaluation.attempts[preset.callouts[1].id].isCorrect).toBe(false);
      expect(evaluation.allComplete).toBe(false);
    });
  });

  describe('exportDiagramNotesToMarkdown', () => {
    const preset = DIAGRAM_PRESETS[0];

    it('generates structured Markdown study notes', () => {
      const md = exportDiagramNotesToMarkdown(preset);
      expect(md).toContain(`# Visual Diagram Guide: ${preset.title}`);
      expect(md).toContain(`**Course:** ${preset.course}`);
      expect(md).toContain(`## Anatomical & Structural Index`);
      expect(md).toContain(preset.callouts[0].label);
    });

    it('includes performance evaluation summary when provided', () => {
      const guesses = { [preset.callouts[0].id]: preset.callouts[0].label };
      const evaluation = evaluateDiagramAttempts(preset, guesses);
      const md = exportDiagramNotesToMarkdown(preset, evaluation);

      expect(md).toContain('## Quiz Performance Summary');
      expect(md).toContain(`**Mastery Score:** ${evaluation.scorePercentage}%`);
    });
  });

  describe('Presets integrity', () => {
    it('verifies that all presets have valid callouts with non-empty labels', () => {
      expect(DIAGRAM_PRESETS.length).toBeGreaterThanOrEqual(5);

      DIAGRAM_PRESETS.forEach(preset => {
        expect(preset.id).toBeTruthy();
        expect(preset.title).toBeTruthy();
        expect(preset.callouts.length).toBeGreaterThan(0);

        preset.callouts.forEach(c => {
          expect(c.id).toBeTruthy();
          expect(c.number).toBeGreaterThan(0);
          expect(c.label).toBeTruthy();
          expect(typeof c.x).toBe('number');
          expect(typeof c.y).toBe('number');
        });
      });
    });
  });
});
