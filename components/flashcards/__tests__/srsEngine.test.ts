import { describe, it, expect, beforeEach } from 'vitest';
import { Flashcard } from '../../../types';
import {
  getCardSignature,
  getCardSRS,
  updateCardSRS,
  getDeckSRSStats,
  getDueCards,
  saveDeckToStorage,
  getSavedDecks,
  deleteSavedDeck,
  BOX_INTERVALS
} from '../srsEngine';
import { SavedFlashcardDeck } from '../types';

describe('srsEngine (Leitner Spaced Repetition System)', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockStorage: Storage = {
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, value: string) => { mockStore[key] = value; },
      removeItem: (key: string) => { delete mockStore[key]; },
      clear: () => { mockStore = {}; },
      key: (index: number) => Object.keys(mockStore)[index] ?? null,
      get length() { return Object.keys(mockStore).length; }
    };
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
  });

  const sampleCard1: Flashcard = {
    id: 'c1',
    term: 'Mitochondria',
    definition: 'The powerhouse of the cell, generating ATP via oxidative phosphorylation.',
    type: 'basic'
  };

  const sampleCard2: Flashcard = {
    id: 'c2',
    term: 'Ribosome',
    definition: 'Synthesizes proteins from mRNA transcripts.',
    type: 'basic'
  };

  it('generates consistent card signatures regardless of whitespace and casing', () => {
    const sig1 = getCardSignature(sampleCard1);
    const sig2 = getCardSignature({
      ...sampleCard1,
      term: '  mitochondria  ',
      definition: 'The powerhouse of the cell, generating ATP...'
    });
    expect(sig1).toContain('mitochondria');
    expect(sig1.split('::')[0]).toBe(sig2.split('::')[0]);
  });

  it('initializes new cards in Box 1 with a 1-day interval', () => {
    const sig = getCardSignature(sampleCard1);
    const srs = getCardSRS(sig);
    expect(srs.box).toBe(1);
    expect(srs.intervalDays).toBe(BOX_INTERVALS[1]);
    expect(srs.attempts).toBe(0);
    expect(srs.consecutiveCorrect).toBe(0);
  });

  it('promotes card across boxes on consecutive correct answers up to Box 5', () => {
    const sig = getCardSignature(sampleCard1);
    const startTime = 1700000000000;

    // First correct: Box 1 -> Box 2 (3 days)
    const rec1 = updateCardSRS(sig, 'correct', startTime);
    expect(rec1.box).toBe(2);
    expect(rec1.intervalDays).toBe(3);
    expect(rec1.consecutiveCorrect).toBe(1);
    expect(rec1.attempts).toBe(1);
    expect(rec1.nextDue).toBe(startTime + 3 * 24 * 60 * 60 * 1000);

    // Second correct: Box 2 -> Box 3 (7 days)
    const rec2 = updateCardSRS(sig, 'correct', startTime);
    expect(rec2.box).toBe(3);
    expect(rec2.intervalDays).toBe(7);
    expect(rec2.consecutiveCorrect).toBe(2);

    // Third correct: Box 3 -> Box 4 (14 days)
    const rec3 = updateCardSRS(sig, 'correct', startTime);
    expect(rec3.box).toBe(4);
    expect(rec3.intervalDays).toBe(14);

    // Fourth correct: Box 4 -> Box 5 (30 days - Mastered)
    const rec4 = updateCardSRS(sig, 'correct', startTime);
    expect(rec4.box).toBe(5);
    expect(rec4.intervalDays).toBe(30);

    // Fifth correct: Remains in Box 5 (capped)
    const rec5 = updateCardSRS(sig, 'correct', startTime);
    expect(rec5.box).toBe(5);
    expect(rec5.intervalDays).toBe(30);
    expect(rec5.consecutiveCorrect).toBe(5);
  });

  it('resets card to Box 1 immediately on incorrect answer (Study Again)', () => {
    const sig = getCardSignature(sampleCard1);
    const now = 1700000000000;

    // Advance to Box 4
    updateCardSRS(sig, 'correct', now);
    updateCardSRS(sig, 'correct', now);
    updateCardSRS(sig, 'correct', now);
    const advanced = getCardSRS(sig);
    expect(advanced.box).toBe(4);

    // Miss card
    const resetRec = updateCardSRS(sig, 'incorrect', now);
    expect(resetRec.box).toBe(1);
    expect(resetRec.intervalDays).toBe(1);
    expect(resetRec.consecutiveCorrect).toBe(0);
    expect(resetRec.attempts).toBe(4);
    expect(resetRec.nextDue).toBe(now + 1 * 24 * 60 * 60 * 1000);
  });

  it('accurately calculates deck stats across Leitner boxes', () => {
    const cards = [sampleCard1, sampleCard2];
    const now = 1700000000000;

    // Initially both unattempted -> Box 1, both due
    const initialStats = getDeckSRSStats(cards, now);
    expect(initialStats.total).toBe(2);
    expect(initialStats.box1).toBe(2);
    expect(initialStats.box5).toBe(0);
    expect(initialStats.dueCount).toBe(2);
    expect(initialStats.masteredPercentage).toBe(0);

    // Advance card 1 to Box 5
    const sig1 = getCardSignature(sampleCard1);
    for (let i = 0; i < 4; i++) {
      updateCardSRS(sig1, 'correct', now);
    }

    const updatedStats = getDeckSRSStats(cards, now);
    expect(updatedStats.box5).toBe(1);
    expect(updatedStats.box1).toBe(1);
    expect(updatedStats.masteredPercentage).toBe(50);
  });

  it('filters due cards and provides graceful fallback when none overdue', () => {
    const cards = [sampleCard1, sampleCard2];
    const now = 1700000000000;

    // Both cards due initially
    const due = getDueCards(cards, now);
    expect(due.length).toBe(2);

    // Advance both cards to the future
    const sig1 = getCardSignature(sampleCard1);
    const sig2 = getCardSignature(sampleCard2);
    updateCardSRS(sig1, 'correct', now);
    updateCardSRS(sig2, 'correct', now);

    // Right now, cards are scheduled 3 days ahead, so none strictly overdue
    // getDueCards falls back to lowest box cards so students can always practice
    const fallback = getDueCards(cards, now);
    expect(fallback.length).toBe(2);
  });

  it('manages saving, updating, and deleting custom study decks', () => {
    const newDeck: SavedFlashcardDeck = {
      id: 'deck-123',
      title: 'Cellular Organelles',
      course: 'AP Biology',
      topic: 'Cellular Structure & Function',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      cards: [sampleCard1, sampleCard2]
    };

    saveDeckToStorage(newDeck);
    const decks = getSavedDecks();
    expect(decks.length).toBe(1);
    expect(decks[0].title).toBe('Cellular Organelles');
    expect(decks[0].cards.length).toBe(2);

    // Update title
    saveDeckToStorage({ ...newDeck, title: 'Cellular Organelles (Updated)' });
    const updatedDecks = getSavedDecks();
    expect(updatedDecks.length).toBe(1);
    expect(updatedDecks[0].title).toBe('Cellular Organelles (Updated)');

    // Delete deck
    deleteSavedDeck('deck-123');
    expect(getSavedDecks().length).toBe(0);
  });
});
