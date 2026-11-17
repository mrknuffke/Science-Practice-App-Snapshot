/**
 * pe-scoring.js - the scoring rules for the chem PE adaptive practice.
 *
 * Pure functions, no DOM. pe-engine.js calls these; services/__tests__/peScoring.test.ts
 * runs them in a sandbox. Change a rule here and the test, never in the engine.
 *
 * The one principle: only a first-try answer counts as independent evidence. A second try
 * comes after a hint that often narrows the choice to two or three options, so it still
 * teaches but it does not raise a result.
 *
 * Each skill ends with a score from 1 to 4:
 *   4 Mastered        first try at Level 2 and first try at Level 3
 *   3 Proficient      one first-try answer at Level 2 or above
 *   2 Developing      Level 1 passed, or Level 2 only with a hint
 *   1 Needs Practice  Level 1 missed
 *
 * Stages a skill moves through:
 *   L2       the placement item (diagnostic, or diagnosticAlt when the bank has one)
 *   L3       the challenge item, after a first-try L2
 *   CONFIRM  one more item after a second-try L2 (the other L2 item if there is one, else L3)
 *   L1       the foundational item, after L2 is missed twice
 *   L2B      a different L2 item after L1 (only when the skill has diagnosticAlt)
 *   DONE
 *
 * The same item is never served twice in one skill. Every bank now has diagnosticAlt for every
 * skill (guarded by peDataKeys.test.ts); the no-alt paths stay as a fallback for a new bank.
 */
(function (global) {
  'use strict';

  const LEVEL_NAMES = { 4: 'Mastered', 3: 'Proficient', 2: 'Developing', 1: 'Needs Practice' };

  // Item tier (1, 2 or 3) each stage serves. CONFIRM depends on the bank, so it is resolved
  // with confirmItemLevel().
  const STAGE_ITEM_LEVEL = { L2: 2, L3: 3, L1: 1, L2B: 2 };

  function hasAlt(skill) {
    return !!(skill && typeof skill.diagnosticAlt === 'function');
  }

  function confirmItemLevel(skill) {
    return hasAlt(skill) ? 2 : 3;
  }

  /**
   * Apply one finished item to a skill's progress.
   * outcome: 'first' (right on attempt 1), 'second' (right on attempt 2) or 'miss'.
   * Returns { stage, score, done } where score is the skill's result if it ended here
   * (or its standing so far, if not done).
   */
  function step(stage, outcome, skill) {
    const first = outcome === 'first';
    const right = outcome === 'first' || outcome === 'second';
    switch (stage) {
      case 'L2':
        if (first) return { stage: 'L3', score: 3, done: false };
        if (right) return { stage: 'CONFIRM', score: 2, done: false };
        return { stage: 'L1', score: 1, done: false };
      case 'L3':
        return { stage: 'DONE', score: first ? 4 : 3, done: true };
      case 'CONFIRM':
        return { stage: 'DONE', score: first ? 3 : 2, done: true };
      case 'L1':
        if (!right) return { stage: 'DONE', score: 1, done: true };
        if (hasAlt(skill)) return { stage: 'L2B', score: 2, done: false };
        return { stage: 'DONE', score: 2, done: true };
      case 'L2B':
        return { stage: 'DONE', score: first ? 3 : 2, done: true };
      default:
        throw new Error('pe-scoring: unknown stage ' + stage);
    }
  }

  /**
   * Read a skill's score from saved progress. Receipts saved before this file existed carry
   * only an earnedLevel string; those map to the level the old receipt counted them as, so a
   * saved seal still matches what it sealed.
   */
  function skillScore(prog) {
    if (!prog) return 0;
    if (typeof prog.score === 'number' && prog.done) return prog.score;
    switch (prog.earnedLevel) {
      case 'Level 3 - Mastered': return 4;
      case 'Level 2 - Proficient':
      case 'Level 2 - Remediated': return 3;
      case 'Level 1 - Developing': return 2;
      case 'Needs Practice': return 1;
      default: return 0;
    }
  }

  function median(nums) {
    if (!nums.length) return 0;
    const s = nums.slice().sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  }

  /** Summary of a finished deck: counts per level, the PE median, and the sealed count. */
  function summarize(skills, skillProgress) {
    const scores = skills.map(s => skillScore(skillProgress[s.id]));
    const counts = { 4: 0, 3: 0, 2: 0, 1: 0 };
    scores.forEach(n => { if (counts[n] !== undefined) counts[n]++; });
    const finished = scores.filter(n => n > 0);
    return {
      scores,
      counts,
      total: skills.length,
      proficientOrAbove: counts[4] + counts[3],
      median: median(finished),
      levelString: scores.join('')
    };
  }

  const STAGE_LABELS = {
    L2: 'L2', L3: 'L3', CONFIRM: 'Check', L1: 'L1', L2B: 'New L2'
  };
  const OUTCOME_LABELS = { first: 'first try', second: 'second try', miss: 'missed' };

  /** "L2 first try → L3 missed" from a skill's path, for the scorecard. */
  function pathwayText(prog, arrow) {
    const sep = arrow || ' &rarr; ';
    if (prog && Array.isArray(prog.path) && prog.path.length) {
      return prog.path.map(p => `${STAGE_LABELS[p.stage] || p.stage} ${OUTCOME_LABELS[p.outcome] || p.outcome}`).join(sep);
    }
    // Receipts saved before this file existed.
    if (!prog) return '';
    if (prog.level3Passed) return 'L2 first try' + sep + 'L3 right';
    if (prog.level2Passed && prog.level2Attempts === 1) return 'L2 first try' + sep + 'L3 missed';
    if (prog.level2Passed && prog.level2Attempts === 2) return 'L2 second try';
    if (prog.remediationPassed) return 'L2 missed' + sep + 'L1 right' + sep + 'L2 repeat right';
    if (prog.level1Passed) return 'L2 missed' + sep + 'L1 right';
    return 'L2 missed' + sep + 'L1 missed';
  }

  global.PEScoring = {
    LEVEL_NAMES,
    STAGE_ITEM_LEVEL,
    hasAlt,
    confirmItemLevel,
    step,
    skillScore,
    median,
    summarize,
    pathwayText
  };
})(typeof window !== 'undefined' ? window : this);
