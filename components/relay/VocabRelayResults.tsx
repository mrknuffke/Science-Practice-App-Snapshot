import React, { useEffect, useState } from 'react';
import { RelayConfig, RelayGameStats, RelayTeam } from './relayTypes';
import {
  computeRelayAnalytics,
  exportRelaySessionToMarkdown,
} from '../../services/relayEngine';
import { playVictoryFanfare } from './relayAudio';
import {
  Trophy,
  Medal,
  Award,
  Zap,
  CheckCircle,
  AlertCircle,
  Download,
  RotateCcw,
  Home,
  Check,
  Flame,
} from 'lucide-react';

interface VocabRelayResultsProps {
  config: RelayConfig;
  stats: RelayGameStats;
  teams: RelayTeam[];
  onPlayAgain: () => void;
  onExit: () => void;
}

export const VocabRelayResults: React.FC<VocabRelayResultsProps> = ({
  config,
  stats,
  teams,
  onPlayAgain,
  onExit,
}) => {
  const [copied, setCopied] = useState(false);
  const analytics = computeRelayAnalytics(stats, teams);

  useEffect(() => {
    playVictoryFanfare();
  }, []);

  const handleDownloadMarkdown = () => {
    const md = exportRelaySessionToMarkdown(config, stats, teams);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const sanitizedTopic = config.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `vocab-relay-${sanitizedTopic}-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyMarkdown = async () => {
    const md = exportRelaySessionToMarkdown(config, stats, teams);
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  const winningTeam = analytics.winningTeam;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 py-6 px-4">
      {/* Victory Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden text-center">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-4 shadow-lg">
            <Trophy className="w-10 h-10 text-amber-300" />
          </div>
          <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            Match Finished • {config.topic}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2">
            {winningTeam.name} Wins!
          </h1>
          <p className="text-indigo-100 text-base sm:text-lg max-w-md font-medium">
            Champion squad finishing with{' '}
            <strong className="text-amber-300 font-mono font-bold">
              {winningTeam.score.toLocaleString()} points
            </strong>
            !
          </p>
        </div>
      </div>

      {/* Team Podium Standings */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <Medal className="w-5 h-5 text-amber-500" />
          <span>Final Team Standings</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {analytics.teamRankings.map((team, idx) => {
            const isWinner = idx === 0;
            const rankLabel = idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : `${idx + 1}rd Place`;
            const medalEmoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';

            return (
              <div
                key={team.id}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between ${
                  isWinner
                    ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg">{medalEmoji}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {rankLabel}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-1">
                    {team.name}
                  </h3>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Runners: {team.runners.join(', ')}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/60 flex justify-between items-baseline">
                  <span className="text-xs text-slate-400 font-semibold uppercase">Total Score</span>
                  <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                    {team.score.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Match Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* MVP Runner */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Award className="w-4 h-4 text-indigo-500" />
            <span>Match MVP</span>
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white">
              {analytics.mvpRunner ? analytics.mvpRunner.runnerName : 'None'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {analytics.mvpRunner
                ? `${analytics.mvpRunner.points.toLocaleString()} pts (${analytics.mvpRunner.teamName})`
                : '-'}
            </div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Class Accuracy</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {analytics.accuracyPercentage}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {stats.totalCorrect} / {stats.answers.length} terms correct
            </div>
          </div>
        </div>

        {/* Fastest Sprint */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Fastest Sprint</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {analytics.fastestTerm ? `${analytics.fastestTerm.seconds.toFixed(1)}s` : '-'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {analytics.fastestTerm ? `"${analytics.fastestTerm.term}"` : 'No sprints logged'}
            </div>
          </div>
        </div>

        {/* Clean Legs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Clean Legs</span>
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
              {stats.cleanLegsCount}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Legs with zero passes (+25% bonus)
            </div>
          </div>
        </div>
      </div>

      {/* Curriculum Mastery Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Mastered Terms */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400 mb-3">
            <CheckCircle className="w-4 h-4" />
            <span>Mastered Terms ({analytics.masteredTerms.length})</span>
          </div>
          {analytics.masteredTerms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analytics.masteredTerms.map((term, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 rounded-lg text-xs font-semibold border border-emerald-200 dark:border-emerald-800/80"
                >
                  ✓ {term}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
              No terms had 100% correct answers without passes.
            </p>
          )}
        </div>

        {/* Terms Needing Revision */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-400 mb-3">
            <AlertCircle className="w-4 h-4" />
            <span>Terms Needing Revision ({analytics.missedTerms.length})</span>
          </div>
          {analytics.missedTerms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {analytics.missedTerms.map((term, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 rounded-lg text-xs font-semibold border border-amber-200 dark:border-amber-800/80"
                >
                  • {term}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              Flawless match! Zero terms were missed or passed.
            </p>
          )}
        </div>
      </div>

      {/* Action Footer Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
            aria-label="Download match report in markdown"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export Report (.md)</span>
          </button>
          <button
            onClick={handleCopyMarkdown}
            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all flex items-center gap-2 shadow-sm"
            aria-label="Copy match report to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
              </>
            ) : (
              <span>Copy Report</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
            aria-label="Play another match"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
          <button
            onClick={onExit}
            className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
            aria-label="Back to review games hub"
          >
            <Home className="w-4 h-4" />
            <span>Exit to Games</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VocabRelayResults;
