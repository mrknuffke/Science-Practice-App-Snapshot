import {
  RelayTeam,
  RelayConfig,
  RelayGameStats,
} from '../components/relay/relayTypes';

/**
 * Calculates score for a single term answer.
 * Base points: +100 for correct, 0 for pass.
 * Speed bonus: up to +50 points proportional to remaining time.
 * Streak bonus: +10% at 3+ streak, +20% at 5+ streak.
 */
export function calculateTermScore(
  correct: boolean,
  timeSpentSeconds: number,
  maxTurnSeconds: number,
  streak: number
): { points: number; speedBonus: number; streakBonus: number } {
  if (!correct) {
    return { points: 0, speedBonus: 0, streakBonus: 0 };
  }

  const basePoints = 100;
  const clampedTime = Math.max(0, Math.min(timeSpentSeconds, maxTurnSeconds));
  const remainingFraction = (maxTurnSeconds - clampedTime) / maxTurnSeconds;
  const speedBonus = Math.max(0, Math.round(remainingFraction * 50));

  let streakMultiplier = 1.0;
  if (streak >= 5) streakMultiplier = 1.2;
  else if (streak >= 3) streakMultiplier = 1.1;

  const rawPoints = basePoints + speedBonus;
  const totalPoints = Math.round(rawPoints * streakMultiplier);
  const streakBonus = totalPoints - rawPoints;

  return {
    points: totalPoints,
    speedBonus,
    streakBonus,
  };
}

/**
 * Calculates clean leg completion bonus (25% boost if runner completed leg with zero passes).
 */
export function calculateCleanLegBonus(legPoints: number, hadPasses: boolean): number {
  if (hadPasses || legPoints <= 0) return 0;
  return Math.round(legPoints * 0.25);
}

/**
 * Shuffles an array in place using standard Fisher-Yates algorithm.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface RelayMVP {
  runnerName: string;
  teamName: string;
  points: number;
  correctCount: number;
}

export interface RelayAnalytics {
  winningTeam: RelayTeam;
  teamRankings: RelayTeam[];
  accuracyPercentage: number;
  mvpRunner: RelayMVP | null;
  fastestTerm: { term: string; seconds: number; runner: string } | null;
  masteredTerms: string[];
  missedTerms: string[];
}

/**
 * Synthesizes comprehensive end-of-match performance analytics.
 */
export function computeRelayAnalytics(
  stats: RelayGameStats,
  teams: RelayTeam[]
): RelayAnalytics {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const winningTeam = sortedTeams[0] || teams[0];

  const totalAttempted = stats.answers.length > 0
    ? stats.answers.length
    : (stats.totalCorrect + stats.totalPassed);
  const correctCount = stats.answers.length > 0
    ? stats.answers.filter((a) => a.correct).length
    : stats.totalCorrect;
  const accuracyPercentage =
    totalAttempted > 0
      ? Math.round((correctCount / totalAttempted) * 100)
      : 0;

  // Compute MVP runner
  const runnerStats: Record<string, { runnerName: string; teamName: string; points: number; correctCount: number }> = {};
  for (const ans of stats.answers) {
    const team = teams.find(t => t.id === ans.teamId);
    const key = `${ans.teamId}::${ans.runnerName}`;
    if (!runnerStats[key]) {
      runnerStats[key] = {
        runnerName: ans.runnerName,
        teamName: team?.name || 'Team',
        points: 0,
        correctCount: 0,
      };
    }
    runnerStats[key].points += ans.pointsEarned;
    if (ans.correct) {
      runnerStats[key].correctCount++;
    }
  }

  const allRunners = Object.values(runnerStats);
  allRunners.sort((a, b) => b.points - a.points);
  const mvpRunner = allRunners.length > 0 ? allRunners[0] : null;

  // Find fastest correct term
  let fastestTerm: { term: string; seconds: number; runner: string } | null = null;
  for (const ans of stats.answers) {
    if (ans.correct) {
      if (!fastestTerm || ans.timeSpentSeconds < fastestTerm.seconds) {
        fastestTerm = {
          term: ans.term,
          seconds: ans.timeSpentSeconds,
          runner: ans.runnerName,
        };
      }
    }
  }

  // Mastered vs Missed Terms
  const termSuccessMap: Record<string, { correct: number; incorrect: number }> = {};
  for (const ans of stats.answers) {
    if (!termSuccessMap[ans.term]) {
      termSuccessMap[ans.term] = { correct: 0, incorrect: 0 };
    }
    if (ans.correct) {
      termSuccessMap[ans.term].correct++;
    } else {
      termSuccessMap[ans.term].incorrect++;
    }
  }

  const masteredTerms: string[] = [];
  const missedTerms: string[] = [];

  for (const [term, data] of Object.entries(termSuccessMap)) {
    if (data.incorrect === 0 && data.correct > 0) {
      masteredTerms.push(term);
    } else if (data.incorrect > 0) {
      missedTerms.push(term);
    }
  }

  return {
    winningTeam,
    teamRankings: sortedTeams,
    accuracyPercentage,
    mvpRunner,
    fastestTerm,
    masteredTerms,
    missedTerms,
  };
}

/**
 * Formats a clean, downloadable Markdown recap report for the teacher and class.
 */
export function exportRelaySessionToMarkdown(
  config: RelayConfig,
  stats: RelayGameStats,
  teams: RelayTeam[]
): string {
  const analytics = computeRelayAnalytics(stats, teams);
  const dateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  let md = `# 🏃 Vocab Relay: Class Review Match Report\n\n`;
  md += `**Date:** ${dateStr}  \n`;
  md += `**Course:** ${config.course}  \n`;
  md += `**Topic:** ${config.topic}  \n`;
  md += `**Game Mode:** ${config.gameMode} (${config.modality})  \n`;
  md += `**Laps Completed:** ${config.totalLaps}  \n\n`;
  md += `---\n\n`;

  md += `## 🏆 Final Podium & Team Standings\n\n`;
  analytics.teamRankings.forEach((team, idx) => {
    const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
    md += `${idx + 1}. ${medal} **${team.name}**: ${team.score.toLocaleString()} pts (Runners: ${team.runners.join(', ')})\n`;
  });
  md += `\n`;

  if (analytics.mvpRunner) {
    md += `> [!NOTE]\n`;
    md += `> **Match MVP:** **${analytics.mvpRunner.runnerName}** (${analytics.mvpRunner.teamName}) with **${analytics.mvpRunner.points.toLocaleString()} pts** and ${analytics.mvpRunner.correctCount} correct terms!\n\n`;
  }

  md += `## 📊 Performance Statistics\n\n`;
  md += `- **Overall Class Accuracy:** ${analytics.accuracyPercentage}%\n`;
  md += `- **Total Terms Answered Correctly:** ${stats.totalCorrect} / ${stats.answers.length}\n`;
  md += `- **Passed Terms:** ${stats.totalPassed}\n`;
  if (analytics.fastestTerm) {
    md += `- **Fastest Sprint:** "${analytics.fastestTerm.term}" answered in **${analytics.fastestTerm.seconds.toFixed(1)}s** by ${analytics.fastestTerm.runner}\n`;
  }
  md += `\n---\n\n`;

  md += `## 🎯 Curriculum Reinforcement Breakdown\n\n`;
  md += `### ✅ Mastered Vocabulary (${analytics.masteredTerms.length})\n`;
  if (analytics.masteredTerms.length > 0) {
    analytics.masteredTerms.forEach(t => {
      md += `- **${t}**\n`;
    });
  } else {
    md += `*None fully mastered without passes.*\n`;
  }
  md += `\n`;

  md += `### 🔄 Terms Needing Revision (${analytics.missedTerms.length})\n`;
  if (analytics.missedTerms.length > 0) {
    analytics.missedTerms.forEach(t => {
      md += `- **${t}** (Target for follow-up flashcard practice or retrieval starter)\n`;
    });
  } else {
    md += `*Flawless round! Zero terms missed.*\n`;
  }
  md += `\n---\n\n*Generated by Science Practice Partner (sciencepractice.app): Vocab Relay Review Game.*\n`;

  return md;
}
