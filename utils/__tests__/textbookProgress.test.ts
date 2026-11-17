import { describe, it, expect, beforeEach } from 'vitest';
import {
  getTextbookProgressSummary,
  isCheckpointComplete,
  countLessonCheckpoints,
  TEXTBOOK_LESSONS,
} from '../textbookProgress';

describe('textbookProgress utility', () => {
  let mockStore: Record<string, string> = {};
  const mockStorage: Pick<Storage, 'getItem'> = {
    getItem: (key: string) => mockStore[key] ?? null,
  };

  beforeEach(() => {
    mockStore = {};
  });

  it('has exactly 27 lessons in TEXTBOOK_LESSONS', () => {
    expect(TEXTBOOK_LESSONS.length).toBe(27);
  });

  it('correctly evaluates isCheckpointComplete', () => {
    expect(isCheckpointComplete(true)).toBe(true);
    expect(isCheckpointComplete(false)).toBe(false);
    expect(isCheckpointComplete({ completed: true, box: 2 })).toBe(true);
    expect(isCheckpointComplete({ completed: false })).toBe(false);
    expect(isCheckpointComplete(null)).toBe(false);
    expect(isCheckpointComplete(undefined)).toBe(false);
  });

  it('correctly counts lesson checkpoints and ignores underscore metadata', () => {
    const data = {
      _total: 10,
      _resume: { index: 2, id: 's-heat', label: 'Specific Heat', lastVisited: 1000 },
      'chk-0': true,
      'chk-1': { completed: true, box: 1 },
      'chk-2': false,
    };
    expect(countLessonCheckpoints(data)).toBe(2);
  });

  it('returns empty progress summary when localStorage is empty', () => {
    const summary = getTextbookProgressSummary(mockStorage);
    expect(summary.totalLessons).toBe(27);
    expect(summary.startedLessonsCount).toBe(0);
    expect(summary.completedCheckpointsCount).toBe(0);
    expect(summary.hasProgress).toBe(false);
    expect(summary.resume).toBeNull();
  });

  it('correctly parses progress and finds the most recently visited lesson for resume', () => {
    const progressData = {
      '1-1a': {
        'chk-0': true,
        'chk-1': true,
        _resume: {
          index: 1,
          id: 's-shells',
          label: 'Shells & Valence',
          lastVisited: 1000,
        },
      },
      '3-1b': {
        'chk-0': { completed: true },
        'chk-1': { completed: true },
        'chk-2': { completed: true },
        _resume: {
          index: 3,
          id: 's-latent',
          label: 'Latent Heat Math',
          lastVisited: 2000,
        },
      },
    };

    mockStore['gc-textbook-progress'] = JSON.stringify(progressData);

    const summary = getTextbookProgressSummary(mockStorage);
    expect(summary.hasProgress).toBe(true);
    expect(summary.startedLessonsCount).toBe(2);
    expect(summary.completedCheckpointsCount).toBe(5);
    expect(summary.resume).not.toBeNull();
    expect(summary.resume?.lessonId).toBe('3-1b');
    expect(summary.resume?.lessonTitle).toBe('Heating Curves & Phase Transitions');
    expect(summary.resume?.url).toBe('/chem/lessons/3-1b_phase-changes-heating-curves.html#s-latent');
  });
});
