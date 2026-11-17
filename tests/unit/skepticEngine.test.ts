import { describe, it, expect } from 'vitest';
import {
  evaluateDefenseRebuttals,
  exportPeerReviewReportToMarkdown,
} from '../../components/skeptic/skepticEngine';
import { SKEPTIC_PRESETS } from '../../components/skeptic/skepticPresets';

describe('The Skeptic Peer Review Engine', () => {
  const preset = SKEPTIC_PRESETS[0];

  describe('evaluateDefenseRebuttals', () => {
    it('rejects an empty or superficial defense submission', () => {
      const emptyRebuttals: Record<string, string> = {
        c1: 'ok',
        c2: 'fine',
        c3: '',
      };

      const result = evaluateDefenseRebuttals(preset, preset.initialChallenges, emptyRebuttals);
      expect(result.overallVerdict).toBe('rejected');
      expect(result.rigorScore).toBeLessThan(50);
      expect(result.vulnerabilities.length).toBeGreaterThan(0);
      expect(result.recommendations.length).toBeGreaterThan(0);
    });

    it('approves a thorough, scientifically grounded defense with controls and calibration', () => {
      const strongRebuttals: Record<string, string> = {
        c1: 'We will include a negative control tube containing 15 mL of 3% hydrogen peroxide with autoclaved boiled homogenate at each test temperature to isolate enzymatic catalysis from non-enzymatic thermal decomposition.',
        c2: 'We will measure water vapor pressure and gas temperature to calculate true molar oxygen production via the ideal gas law: n = (P_total - P_H2O) * V / (R * T), correcting for Charles Law thermal gas expansion.',
        c3: 'We will standardize the pre-incubation period to exactly 5 minutes across all trials and independently verify enzyme stability and baseline activity over time before substrate introduction.',
      };

      const result = evaluateDefenseRebuttals(preset, preset.initialChallenges, strongRebuttals);
      expect(result.overallVerdict).toBe('approved');
      expect(result.rigorScore).toBeGreaterThanOrEqual(80);
      expect(result.strengths.length).toBeGreaterThan(0);
    });

    it('requests revisions when defense is partially developed', () => {
      const partialRebuttals: Record<string, string> = {
        c1: 'We will add a control tube with water to compare decomposition.',
        c2: 'Temperature affects gas volume so we will record the temperature and pressure.',
        c3: 'We will test enzyme stability before starting.',
      };

      const result = evaluateDefenseRebuttals(preset, preset.initialChallenges, partialRebuttals);
      expect(result.overallVerdict).toBe('revisions_requested');
      expect(result.rigorScore).toBeGreaterThanOrEqual(50);
      expect(result.rigorScore).toBeLessThan(80);
    });

    it('handles zero challenges gracefully', () => {
      const result = evaluateDefenseRebuttals(preset, [], {});
      expect(result.overallVerdict).toBe('approved');
      expect(result.rigorScore).toBe(100);
    });
  });

  describe('exportPeerReviewReportToMarkdown', () => {
    it('exports a structured peer review memorandum', () => {
      const rebuttals = {
        c1: 'Added negative boiled control.',
        c2: 'Corrected for water vapor pressure.',
        c3: 'Standardized pre-incubation timing.',
      };
      const evaluation = evaluateDefenseRebuttals(preset, preset.initialChallenges, rebuttals);
      const md = exportPeerReviewReportToMarkdown(preset, preset.initialChallenges, rebuttals, evaluation);

      expect(md).toContain(`# Formal Peer Review Memorandum: ${preset.title}`);
      expect(md).toContain(`**Discipline / Course:** ${preset.course}`);
      expect(md).toContain(`## 1. Experimental Design Overview`);
      expect(md).toContain(`## 2. Peer Review Verdict & Rigor Assessment`);
      expect(md).toContain(`Methodological Rigor Score:`);
      expect(md).toContain(`## 3. Defense Audit Interrogations & Investigator Rebuttals`);
      expect(md).toContain(preset.initialChallenges[0].title);
    });
  });

  describe('Presets integrity', () => {
    it('verifies that all presets have valid investigations and challenges', () => {
      expect(SKEPTIC_PRESETS.length).toBeGreaterThanOrEqual(5);

      SKEPTIC_PRESETS.forEach(p => {
        expect(p.id).toBeTruthy();
        expect(p.title).toBeTruthy();
        expect(p.course).toBeTruthy();
        expect(p.researchQuestion).toBeTruthy();
        expect(p.hypothesis).toBeTruthy();
        expect(p.independentVariable).toBeTruthy();
        expect(p.dependentVariable).toBeTruthy();
        expect(p.controlGroup).toBeTruthy();
        expect(p.initialChallenges.length).toBeGreaterThanOrEqual(3);

        p.initialChallenges.forEach(c => {
          expect(c.id).toBeTruthy();
          expect(c.title).toBeTruthy();
          expect(c.question).toBeTruthy();
          expect(['critical', 'moderate', 'minor']).toContain(c.severity);
          expect(c.hint).toBeTruthy();
        });
      });
    });
  });
});
