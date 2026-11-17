import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { STAGES, tally } from '../../components/simulations/carbonJourney/carbonJourneyData';

const ROOT = join(__dirname, '..', '..');

describe('Tracking a Carbon Atom content', () => {
  it('every equation conserves atoms', () => {
    for (const stage of STAGES) {
      if (!stage.equation) continue;
      expect(tally(stage.equation.reactants), stage.id).toEqual(tally(stage.equation.products));
    }
  });

  it('every check has exactly one correct option and feedback on every option', () => {
    for (const stage of STAGES) {
      expect(stage.check.options.filter(o => o.correct), stage.id).toHaveLength(1);
      for (const o of stage.check.options) expect(o.feedback.length, `${stage.id}: ${o.text}`).toBeGreaterThan(20);
    }
  });

  it('options are balanced: 22 words or fewer, correct answer at most 1.8× any distractor', () => {
    for (const stage of STAGES) {
      const correct = stage.check.options.find(o => o.correct)!;
      for (const o of stage.check.options) {
        expect(o.text.split(/\s+/).length, `${stage.id}: ${o.text}`).toBeLessThanOrEqual(22);
        if (!o.correct) {
          expect(correct.text.length / o.text.length, `${stage.id}: ${o.text}`).toBeLessThanOrEqual(1.8);
        }
      }
    }
  });

  it('the correct answer is not always in the same position', () => {
    const positions = new Set(STAGES.map(s => s.check.options.findIndex(o => o.correct)));
    expect(positions.size).toBeGreaterThan(1);
  });
});

describe('osmosis and carbon sims follow the voice rules', () => {
  const dirs = ['components/simulations/osmosis', 'components/simulations/carbonJourney'];
  for (const dir of dirs) {
    it(`${dir} has no em-dashes`, () => {
      for (const f of readdirSync(join(ROOT, dir))) {
        const text = readFileSync(join(ROOT, dir, f), 'utf8');
        expect(text.includes('—') || text.includes('&mdash;'), `${dir}/${f}`).toBe(false);
      }
    });
  }
});
