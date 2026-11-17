import { describe, it, expect } from 'vitest';
import {
  calculateTermScore,
  calculateCleanLegBonus,
  shuffleArray,
  computeRelayAnalytics,
  exportRelaySessionToMarkdown,
} from '../../services/relayEngine';
import {
  RelayConfig,
  RelayGameStats,
  RelayTeam,
} from '../../components/relay/relayTypes';

describe('Vocab Relay Engine (services/relayEngine.ts)', () => {
  describe('calculateTermScore', () => {
    it('awards 0 points and 0 bonus when answer is incorrect or passed', () => {
      const res = calculateTermScore(false, 5, 30, 0);
      expect(res.points).toBe(0);
      expect(res.speedBonus).toBe(0);
      expect(res.streakBonus).toBe(0);
    });

    it('awards base 100 points when answered at the last second (no speed bonus, no streak)', () => {
      const res = calculateTermScore(true, 30, 30, 0);
      expect(res.points).toBe(100);
      expect(res.speedBonus).toBe(0);
      expect(res.streakBonus).toBe(0);
    });

    it('awards maximum speed bonus (+50 pts) when answered instantly (0s spent)', () => {
      const res = calculateTermScore(true, 0, 30, 0);
      expect(res.points).toBe(150);
      expect(res.speedBonus).toBe(50);
      expect(res.streakBonus).toBe(0);
    });

    it('scales speed bonus linearly with time remaining', () => {
      // 15 seconds spent out of 30 -> 50% time left -> +25 speed bonus -> 125 total points
      const res = calculateTermScore(true, 15, 30, 0);
      expect(res.speedBonus).toBe(25);
      expect(res.points).toBe(125);
    });

    it('applies +10% streak multiplier when streak >= 3', () => {
      // 15s spent -> 100 base + 25 speed = 125 raw -> 125 * 1.1 = 137.5 -> 138 rounded
      const res = calculateTermScore(true, 15, 30, 3);
      expect(res.points).toBe(138);
      expect(res.streakBonus).toBe(13);
    });

    it('applies +20% streak multiplier when streak >= 5', () => {
      // 0s spent -> 100 base + 50 speed = 150 raw -> 150 * 1.2 = 180
      const res = calculateTermScore(true, 0, 30, 5);
      expect(res.points).toBe(180);
      expect(res.streakBonus).toBe(30);
    });

    it('clamps timeSpent between 0 and maxTurnSeconds', () => {
      const overTime = calculateTermScore(true, 45, 30, 0);
      expect(overTime.points).toBe(100);
      expect(overTime.speedBonus).toBe(0);

      const underTime = calculateTermScore(true, -10, 30, 0);
      expect(underTime.points).toBe(150);
      expect(underTime.speedBonus).toBe(50);
    });
  });

  describe('calculateCleanLegBonus', () => {
    it('awards 25% bonus for a leg with zero passes', () => {
      const bonus = calculateCleanLegBonus(400, false);
      expect(bonus).toBe(100);
    });

    it('awards 0 bonus if runner had any passes during the leg', () => {
      const bonus = calculateCleanLegBonus(400, true);
      expect(bonus).toBe(0);
    });

    it('awards 0 bonus if leg points are 0 or negative', () => {
      expect(calculateCleanLegBonus(0, false)).toBe(0);
      expect(calculateCleanLegBonus(-50, false)).toBe(0);
    });
  });

  describe('shuffleArray', () => {
    it('preserves array length and all original elements without mutating original', () => {
      const original = ['ATP', 'Enzyme', 'Substrate', 'Ribosome', 'Mitochondria'];
      const copy = [...original];
      const shuffled = shuffleArray(original);

      expect(shuffled).toHaveLength(original.length);
      expect(original).toEqual(copy); // non-mutating
      expect([...shuffled].sort()).toEqual([...original].sort());
    });
  });

  describe('computeRelayAnalytics', () => {
    const mockTeams: RelayTeam[] = [
      {
        id: 'team_red',
        name: 'Red Dragons',
        color: 'rose',
        score: 650,
        currentRunnerIndex: 1,
        runners: ['Alice', 'Bob'],
      },
      {
        id: 'team_blue',
        name: 'Blue Phoenixes',
        color: 'indigo',
        score: 820,
        currentRunnerIndex: 1,
        runners: ['Charlie', 'Dana'],
      },
    ];

    const mockStats: RelayGameStats = {
      totalTerms: 5,
      totalCorrect: 4,
      totalPassed: 1,
      fastestAnswerSeconds: 3.2,
      cleanLegsCount: 2,
      answers: [
        {
          term: 'ATP Synthase',
          category: 'Respiration',
          correct: true,
          timeSpentSeconds: 3.2,
          teamId: 'team_blue',
          runnerName: 'Charlie',
          lap: 1,
          pointsEarned: 145,
        },
        {
          term: 'RuBisCO',
          category: 'Photosynthesis',
          correct: true,
          timeSpentSeconds: 5.0,
          teamId: 'team_blue',
          runnerName: 'Charlie',
          lap: 1,
          pointsEarned: 140,
        },
        {
          term: 'Okazaki Fragments',
          category: 'Genetics',
          correct: false,
          timeSpentSeconds: 20.0,
          teamId: 'team_red',
          runnerName: 'Alice',
          lap: 1,
          pointsEarned: 0,
        },
        {
          term: 'Okazaki Fragments',
          category: 'Genetics',
          correct: true,
          timeSpentSeconds: 8.0,
          teamId: 'team_blue',
          runnerName: 'Dana',
          lap: 1,
          pointsEarned: 130,
        },
        {
          term: 'Allosteric Regulation',
          category: 'Enzymes',
          correct: true,
          timeSpentSeconds: 4.1,
          teamId: 'team_red',
          runnerName: 'Bob',
          lap: 1,
          pointsEarned: 142,
        },
      ],
    };

    it('correctly ranks teams by score and determines winning squad', () => {
      const analytics = computeRelayAnalytics(mockStats, mockTeams);
      expect(analytics.winningTeam.id).toBe('team_blue');
      expect(analytics.teamRankings[0].id).toBe('team_blue');
      expect(analytics.teamRankings[1].id).toBe('team_red');
    });

    it('computes overall accuracy percentage accurately', () => {
      // 4 correct answers out of 5 total logged records in mockStats.answers -> 80%
      const analytics = computeRelayAnalytics(mockStats, mockTeams);
      expect(analytics.accuracyPercentage).toBe(80);
    });

    it('identifies Match MVP runner based on highest accumulated points', () => {
      const analytics = computeRelayAnalytics(mockStats, mockTeams);
      expect(analytics.mvpRunner).not.toBeNull();
      // Charlie scored 145 + 140 = 285 pts
      expect(analytics.mvpRunner?.runnerName).toBe('Charlie');
      expect(analytics.mvpRunner?.teamName).toBe('Blue Phoenixes');
      expect(analytics.mvpRunner?.points).toBe(285);
      expect(analytics.mvpRunner?.correctCount).toBe(2);
    });

    it('finds the fastest answered sprint with runner attribution', () => {
      const analytics = computeRelayAnalytics(mockStats, mockTeams);
      expect(analytics.fastestTerm).toEqual({
        term: 'ATP Synthase',
        seconds: 3.2,
        runner: 'Charlie',
      });
    });

    it('categorizes mastered terms vs terms needing revision correctly', () => {
      const analytics = computeRelayAnalytics(mockStats, mockTeams);
      // 'ATP Synthase', 'RuBisCO', 'Allosteric Regulation' were answered correctly with 0 misses
      expect(analytics.masteredTerms).toContain('ATP Synthase');
      expect(analytics.masteredTerms).toContain('RuBisCO');
      expect(analytics.masteredTerms).toContain('Allosteric Regulation');

      // 'Okazaki Fragments' was missed once by Alice
      expect(analytics.missedTerms).toContain('Okazaki Fragments');
    });

    it('handles empty stats gracefully without runtime exceptions', () => {
      const emptyStats: RelayGameStats = {
        totalTerms: 0,
        totalCorrect: 0,
        totalPassed: 0,
        fastestAnswerSeconds: 999,
        cleanLegsCount: 0,
        answers: [],
      };
      const analytics = computeRelayAnalytics(emptyStats, mockTeams);
      expect(analytics.accuracyPercentage).toBe(0);
      expect(analytics.mvpRunner).toBeNull();
      expect(analytics.fastestTerm).toBeNull();
      expect(analytics.masteredTerms).toHaveLength(0);
      expect(analytics.missedTerms).toHaveLength(0);
    });
  });

  describe('exportRelaySessionToMarkdown', () => {
    it('produces formatted markdown recap with headers, podium, and stats', () => {
      const config: RelayConfig = {
        gameMode: 'pass_and_play',
        modality: 'caller_guesser',
        course: 'AP Biology',
        topic: 'Cellular Energetics',
        totalLaps: 2,
        termsPerRunner: 3,
        turnSeconds: 30,
        teams: [
          {
            id: 't1',
            name: 'Cell Champions',
            color: 'indigo',
            score: 750,
            currentRunnerIndex: 0,
            runners: ['Elena', 'Sam'],
          },
        ],
      };

      const stats: RelayGameStats = {
        totalTerms: 3,
        totalCorrect: 3,
        totalPassed: 0,
        fastestAnswerSeconds: 4.5,
        cleanLegsCount: 1,
        answers: [
          {
            term: 'Glycolysis',
            category: 'Respiration',
            correct: true,
            timeSpentSeconds: 4.5,
            teamId: 't1',
            runnerName: 'Elena',
            lap: 1,
            pointsEarned: 140,
          },
        ],
      };

      const md = exportRelaySessionToMarkdown(config, stats, config.teams);
      expect(md).toContain('# 🏃 Vocab Relay: Class Review Match Report');
      expect(md).toContain('**Course:** AP Biology');
      expect(md).toContain('**Topic:** Cellular Energetics');
      expect(md).toContain('Cell Champions');
      expect(md).toContain('750 pts');
      expect(md).toContain('Glycolysis');
      expect(md).toContain('Overall Class Accuracy:');
    });
  });
});
