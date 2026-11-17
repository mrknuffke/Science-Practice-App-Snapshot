import { describe, it, expect } from 'vitest';
import {
  MULTI_STEP_PRESETS,
  MULTI_STEP_DECK_PRESETS,
} from '../../components/flashcards/multiStepPresets';

describe('Multi-Step Flashcards and Presets', () => {
  it('contains valid multi-step presets with sequential steps', () => {
    expect(MULTI_STEP_PRESETS.length).toBeGreaterThanOrEqual(4);

    MULTI_STEP_PRESETS.forEach((card) => {
      expect(card.type).toBe('multi_step');
      expect(card.term).toBeTruthy();
      expect(card.definition).toBeTruthy();
      expect(card.multiStepSteps).toBeDefined();
      expect(card.multiStepSteps!.length).toBeGreaterThanOrEqual(2);

      // Verify step numbers are 1-indexed and strictly increasing
      card.multiStepSteps!.forEach((step, idx) => {
        expect(step.stepNumber).toBe(idx + 1);
        expect(step.title.trim().length).toBeGreaterThan(0);
        expect(step.description.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('contains curated preset decks with non-empty cards', () => {
    expect(MULTI_STEP_DECK_PRESETS.length).toBeGreaterThanOrEqual(2);

    MULTI_STEP_DECK_PRESETS.forEach((deck) => {
      expect(deck.id).toBeTruthy();
      expect(deck.title).toBeTruthy();
      expect(deck.course).toBeTruthy();
      expect(deck.cards.length).toBeGreaterThan(0);

      deck.cards.forEach((card) => {
        expect(card.type).toBe('multi_step');
        expect(card.multiStepSteps?.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  it('covers both AP Biology and AP Chemistry pathways', () => {
    const courses = MULTI_STEP_DECK_PRESETS.map((d) => d.course);
    expect(courses).toContain('AP Biology');
    expect(courses).toContain('AP Chemistry');
  });
});
