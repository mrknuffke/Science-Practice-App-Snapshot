import { Flashcard } from '../../types';
import { LeitnerBoxNumber, LeitnerStats, SavedFlashcardDeck, SRSItemRecord, SRSProgressMap } from './types';

export const BOX_INTERVALS: Record<LeitnerBoxNumber, number> = {
  1: 1,   // Box 1: 1 day (or immediate review)
  2: 3,   // Box 2: 3 days
  3: 7,   // Box 3: 7 days
  4: 14,  // Box 4: 14 days
  5: 30   // Box 5: 30 days (Mastered)
};

export const SRS_STORAGE_KEY = 'science_partner_flashcard_srs';
export const SAVED_DECKS_KEY = 'science_partner_saved_decks';

/**
 * Generates a stable unique signature for a flashcard based on normalized term and definition.
 */
export function getCardSignature(card: Flashcard): string {
  const cleanTerm = (card.term || '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
  const cleanDef = (card.definition || '')
    .slice(0, 40)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ');
  return `${cleanTerm}::${cleanDef}`;
}

/**
 * Retrieves all stored SRS progress records from localStorage.
 */
export function getAllSRSProgress(): SRSProgressMap {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return {};
    const raw = localStorage.getItem(SRS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.warn('Failed to load flashcard SRS progress from localStorage:', err);
    return {};
  }
}

/**
 * Persists SRS progress map to localStorage.
 */
export function saveAllSRSProgress(progressMap: SRSProgressMap): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(progressMap));
  } catch (err) {
    console.warn('Failed to save flashcard SRS progress to localStorage:', err);
  }
}

/**
 * Gets the current SRS record for a card signature, initializing a Box 1 record if not found.
 */
export function getCardSRS(signature: string, map?: SRSProgressMap): SRSItemRecord {
  const progress = map || getAllSRSProgress();
  if (progress[signature]) {
    return progress[signature];
  }
  return {
    signature,
    box: 1,
    intervalDays: BOX_INTERVALS[1],
    nextDue: 0, // due immediately
    lastAttempt: 0,
    attempts: 0,
    consecutiveCorrect: 0
  };
}

/**
 * Updates a card's SRS status based on whether the student answered correctly ("Got It") or missed ("Study Again").
 */
export function updateCardSRS(
  signature: string,
  result: 'correct' | 'incorrect',
  now: number = Date.now()
): SRSItemRecord {
  const map = getAllSRSProgress();
  const current = getCardSRS(signature, map);

  let newBox: LeitnerBoxNumber;
  let newConsecutive: number;

  if (result === 'correct') {
    newBox = Math.min(5, (current.box || 1) + 1) as LeitnerBoxNumber;
    newConsecutive = (current.consecutiveCorrect || 0) + 1;
  } else {
    newBox = 1;
    newConsecutive = 0;
  }

  const intervalDays = BOX_INTERVALS[newBox];
  const nextDue = now + intervalDays * 24 * 60 * 60 * 1000;

  const updatedRecord: SRSItemRecord = {
    signature,
    box: newBox,
    intervalDays,
    nextDue,
    lastAttempt: now,
    attempts: (current.attempts || 0) + 1,
    consecutiveCorrect: newConsecutive
  };

  map[signature] = updatedRecord;
  saveAllSRSProgress(map);
  return updatedRecord;
}

/**
 * Aggregates Leitner box distribution statistics for a given deck of flashcards.
 */
export function getDeckSRSStats(cards: Flashcard[], now: number = Date.now()): LeitnerStats {
  const map = getAllSRSProgress();
  let box1 = 0;
  let box2 = 0;
  let box3 = 0;
  let box4 = 0;
  let box5 = 0;
  let dueCount = 0;

  cards.forEach(card => {
    const sig = getCardSignature(card);
    const rec = getCardSRS(sig, map);

    switch (rec.box) {
      case 1: box1++; break;
      case 2: box2++; break;
      case 3: box3++; break;
      case 4: box4++; break;
      case 5: box5++; break;
    }

    if (rec.attempts === 0 || rec.nextDue <= now) {
      dueCount++;
    }
  });

  const total = cards.length;
  const masteredPercentage = total > 0 ? Math.round((box5 / total) * 100) : 0;

  return {
    box1,
    box2,
    box3,
    box4,
    box5,
    total,
    dueCount,
    masteredPercentage
  };
}

/**
 * Filters a deck of flashcards down to only those that are currently due for review or unattempted.
 * If no cards are overdue, returns cards in Box 1 or Box 2 to ensure review continuity.
 */
export function getDueCards(cards: Flashcard[], now: number = Date.now()): Flashcard[] {
  const map = getAllSRSProgress();

  const due = cards.filter(card => {
    const sig = getCardSignature(card);
    const rec = getCardSRS(sig, map);
    return rec.attempts === 0 || rec.nextDue <= now;
  });

  if (due.length > 0) return due;

  // Fallback: if none overdue, return Box 1 or lowest box cards so the student can still practice
  const lowestBoxCards = [...cards].sort((a, b) => {
    const sigA = getCardSignature(a);
    const sigB = getCardSignature(b);
    const recA = getCardSRS(sigA, map);
    const recB = getCardSRS(sigB, map);
    return recA.box - recB.box;
  });

  return lowestBoxCards.slice(0, Math.min(10, lowestBoxCards.length));
}

// --- SAVED STUDY DECKS MANAGEMENT ---

/**
 * Retrieves all custom saved flashcard decks from localStorage.
 */
export function getSavedDecks(): SavedFlashcardDeck[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(SAVED_DECKS_KEY);
    const decks: SavedFlashcardDeck[] = raw ? JSON.parse(raw) : [];
    return decks.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  } catch (err) {
    console.warn('Failed to load saved decks from localStorage:', err);
    return [];
  }
}

/**
 * Saves a flashcard deck to localStorage.
 */
export function saveDeckToStorage(deck: SavedFlashcardDeck): SavedFlashcardDeck {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return deck;
    const decks = getSavedDecks();
    const existingIdx = decks.findIndex(d => d.id === deck.id);

    const updatedDeck: SavedFlashcardDeck = {
      ...deck,
      updatedAt: Date.now()
    };

    if (existingIdx >= 0) {
      decks[existingIdx] = updatedDeck;
    } else {
      decks.unshift(updatedDeck);
    }

    localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify(decks));
    return updatedDeck;
  } catch (err) {
    console.warn('Failed to save deck to localStorage:', err);
    return deck;
  }
}

/**
 * Deletes a saved deck by id from localStorage.
 */
export function deleteSavedDeck(id: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const decks = getSavedDecks().filter(d => d.id !== id);
    localStorage.setItem(SAVED_DECKS_KEY, JSON.stringify(decks));
  } catch (err) {
    console.warn('Failed to delete saved deck from localStorage:', err);
  }
}
