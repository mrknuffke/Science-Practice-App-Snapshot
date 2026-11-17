/* eslint-disable @typescript-eslint/no-explicit-any -- this test runs untyped book JavaScript in a vm sandbox; its objects have no static type. */
/**
 * Automated Machine Guard for Assessment Question Register & Balance.
 * Enforces VOICE.md anti-test-engineering invariants across public/chem/pe/data/:
 *  1. No option length giveaway (correct option word count <= 1.8x shortest distractor).
 *  2. Wordiness ceiling (no MCQ option > 25 words for High School PE).
 *  3. Banned academic/testing vocabulary ('candidate', 'serves to', etc.).
 *  4. Zero em-dashes.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import vm from 'vm';

const PE_DATA_DIR = join(__dirname, '..', '..', 'public', 'chem', 'pe', 'data');

const BANNED_PATTERNS = [
  { regex: /\bcandidate\b/i, name: 'bureaucratic "candidate"' },
  { regex: /\bpsychometric\b/i, name: 'bureaucratic "psychometric"' },
  { regex: /\bin order to\b/i, name: 'filler "in order to"' },
  { regex: /\bserves to\b/i, name: 'filler "serves to"' },
  { regex: /\bplays a role in\b/i, name: 'filler "plays a role in"' },
  { regex: /\bit is important to note\b/i, name: 'filler "it is important to note"' },
  { regex: /\bequilibrium vapor pressure\b/i, name: 'inflated "equilibrium vapor pressure"' },
  { regex: /\brate of vaporization\b/i, name: 'inflated "rate of vaporization"' },
  { regex: /—|&mdash;/g, name: 'em-dash (use hyphens, commas, or parentheses)' }
];

function countWords(str: string): number {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

interface LoadedPE {
  filename: string;
  peId: string;
  skills: any[];
}

function loadPEData(filename: string): LoadedPE {
  const filepath = join(PE_DATA_DIR, filename);
  const code = readFileSync(filepath, 'utf8');
  const sandbox = { window: {} as Record<string, any> };
  vm.createContext(sandbox);
  // Data files draw their figures with the shared helpers, which index.html loads first.
  vm.runInContext(readFileSync(join(PE_DATA_DIR, '..', 'pe-figures.js'), 'utf8'), sandbox);
  vm.runInContext(readFileSync(join(PE_DATA_DIR, '..', 'pe-num.js'), 'utf8'), sandbox);
  vm.runInContext(code, sandbox);

  const keys = Object.keys(sandbox.window).filter(k => k.startsWith('PE_DATA_'));
  if (keys.length === 0) {
    throw new Error(`No PE_DATA_* found in ${filename}`);
  }
  const data = sandbox.window[keys[0]];
  return {
    filename,
    peId: data.info.id,
    skills: data.skills
  };
}

describe('Question Register & Option Balance Guard', () => {
  const dummyRng = () => 0.42;

  // Overhauled PE files to test
  const overhauledFiles = ['hs-ps1-3.js', 'hs-ps1-1.js', 'hs-ps1-2.js', 'hs-ps1-4.js', 'hs-ps1-5.js', 'hs-ps1-6.js', 'hs-ps1-7.js', 'hs-ps1-8.js', 'hs-ps2-6.js', 'hs-ps3-1.js', 'hs-ps3-4.js', 'hs-ps4-4.js', 'hs-ess1-1.js', 'hs-ess1-2.js', 'hs-ess1-3.js'];

  for (const filename of overhauledFiles) {
    describe(`PE Data Register & Balance: ${filename}`, () => {
      const pe = loadPEData(filename);

      it(`has no banned phrases or em-dashes anywhere in ${filename}`, () => {
        const code = readFileSync(join(PE_DATA_DIR, filename), 'utf8');
        const violations: string[] = [];
        for (const { regex, name } of BANNED_PATTERNS) {
          if (regex.test(code)) {
            violations.push(name);
          }
        }
        expect(violations, `Found banned patterns in ${filename}: ${violations.join(', ')}`).toEqual([]);
      });

      it(`has balanced option lengths with no giveaways across all items in ${filename}`, () => {
        const offenders: string[] = [];

        for (const skill of pe.skills) {
          const items = [skill.diagnostic(dummyRng)];
          if (skill.diagnosticAlt) items.push(skill.diagnosticAlt(dummyRng));
          for (const practiceFn of skill.practiceLevels) {
            items.push(practiceFn(dummyRng));
          }

          for (const item of items) {
            if (item.type === 'mcq') {
              const counts = item.options.map(countWords);
              const correctWords = counts[item.correctIndex];
              const distractorWords = counts.filter((_: number, idx: number) => idx !== item.correctIndex);
              const minDistractorWords = Math.min(...distractorWords);

              // Ceiling check
              for (const [idx, w] of counts.entries()) {
                if (w > 25) {
                  offenders.push(`${item.id} option ${idx} has ${w} words (>25 word ceiling): "${item.options[idx]}"`);
                }
              }

              // Ratio check (correct answer must not be > 1.8x shortest distractor)
              if (minDistractorWords > 0 && correctWords / minDistractorWords > 1.8) {
                offenders.push(`${item.id} correct answer (${correctWords} words) is >1.8x longer than shortest distractor (${minDistractorWords} words): correct="${item.options[item.correctIndex]}" vs min="${item.options[counts.indexOf(minDistractorWords)]}"`);
              }
            } else if (item.type === 'two_tier') {
              // Tier 1
              const t1Counts = item.tier1Options.map(countWords);
              for (const [idx, w] of t1Counts.entries()) {
                if (w > 25) {
                  offenders.push(`${item.id} tier1 option ${idx} has ${w} words (>25 word ceiling)`);
                }
              }
              const t1Correct = t1Counts[item.correctTier1];
              const t1Distractors = t1Counts.filter((_: number, idx: number) => idx !== item.correctTier1);
              const t1MinDist = Math.min(...t1Distractors);
              if (t1MinDist > 0 && t1Correct / t1MinDist > 1.8) {
                offenders.push(`${item.id} tier1 correct answer (${t1Correct} words) is >1.8x longer than shortest distractor (${t1MinDist} words)`);
              }

              // Tier 2
              const t2Counts = item.tier2Options.map(countWords);
              for (const [idx, w] of t2Counts.entries()) {
                if (w > 25) {
                  offenders.push(`${item.id} tier2 option ${idx} has ${w} words (>25 word ceiling): "${item.tier2Options[idx]}"`);
                }
              }
              const t2Correct = t2Counts[item.correctTier2];
              const t2Distractors = t2Counts.filter((_: number, idx: number) => idx !== item.correctTier2);
              const t2MinDist = Math.min(...t2Distractors);
              if (t2MinDist > 0 && t2Correct / t2MinDist > 1.8) {
                offenders.push(`${item.id} tier2 correct answer (${t2Correct} words) is >1.8x longer than shortest distractor (${t2MinDist} words): correct="${item.tier2Options[item.correctTier2]}" vs min="${item.tier2Options[t2Counts.indexOf(t2MinDist)]}"`);
              }
            } else if (item.type === 'multi_select') {
              const counts = item.options.map(countWords);
              for (const [idx, w] of counts.entries()) {
                if (w > 25) {
                  offenders.push(`${item.id} option ${idx} has ${w} words (>25 word ceiling)`);
                }
              }
            }
          }
        }

        expect(offenders, `Option balance violations found:\n  ${offenders.join('\n  ')}`).toEqual([]);
      });
    });
  }

  describe('Inventory of All PE Assessments in public/chem/pe/data/', () => {
    it('all PE files load and have valid skill structures', () => {
      const files = readdirSync(PE_DATA_DIR).filter(f => f.startsWith('hs-') && f.endsWith('.js'));
      expect(files.length).toBe(15);

      for (const file of files) {
        const pe = loadPEData(file);
        expect(pe.skills.length).toBeGreaterThan(0);
        for (const skill of pe.skills) {
          const diag = skill.diagnostic(dummyRng);
          expect(diag.id).toBeTruthy();
          expect(skill.practiceLevels.length).toBeGreaterThan(0);
        }
      }
    });
  });
});
