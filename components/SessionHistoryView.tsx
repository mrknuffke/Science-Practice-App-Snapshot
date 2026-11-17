import React, { useState, useEffect, useMemo } from 'react';
import { SessionSnapshot, ModeType } from '../types';
import { getSessionHistory, getSessionHistoryMetadata, deleteSession, clearSessionHistory } from '../services/storageService';

interface SessionHistoryViewProps {
  onBack: () => void;
  onViewSession: (sessionId: string) => void;
}

type FilterMode = 'all' | ModeType;
type SortMode = 'newest' | 'oldest' | 'highest_score' | 'lowest_score';

export const SessionHistoryView: React.FC<SessionHistoryViewProps> = ({
  onBack,
  onViewSession
}) => {
  const [sessions, setSessions] = useState<SessionSnapshot[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [metadata, setMetadata] = useState(getSessionHistoryMetadata());

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    setSessions(getSessionHistory());
    setMetadata(getSessionHistoryMetadata());
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this session? This cannot be undone.')) {
      deleteSession(id);
      loadSessions();
    }
  };

  const handleClearAll = () => {
    if (confirm('Delete ALL session history? This cannot be undone.')) {
      clearSessionHistory();
      loadSessions();
    }
  };

  // Filter and sort sessions
  const filteredSessions = useMemo(() => {
    let filtered = sessions;

    // Apply mode filter
    if (filterMode !== 'all') {
      filtered = filtered.filter(s => s.mode === filterMode);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        s.topics.some(t => t.toLowerCase().includes(query)) ||
        s.course.toLowerCase().includes(query)
      );
    }

    // Apply sort
    switch (sortMode) {
      case 'newest':
        filtered.sort((a, b) => b.timestamp - a.timestamp);
        break;
      case 'oldest':
        filtered.sort((a, b) => a.timestamp - b.timestamp);
        break;
      case 'highest_score':
        filtered.sort((a, b) => {
          const scoreA = parseInt(a.score.split('/')[0]) || 0;
          const scoreB = parseInt(b.score.split('/')[0]) || 0;
          return scoreB - scoreA;
        });
        break;
      case 'lowest_score':
        filtered.sort((a, b) => {
          const scoreA = parseInt(a.score.split('/')[0]) || 0;
          const scoreB = parseInt(b.score.split('/')[0]) || 0;
          return scoreA - scoreB;
        });
        break;
    }

    return filtered;
  }, [sessions, filterMode, sortMode, searchQuery]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="bg-transparent text-[#1A1C21] dark:text-[#F8F9FB]">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <button onClick={onBack} className="mb-4 text-slate-400 hover:text-white transition-colors">
          ← Back
        </button>
        <h1 className="text-4xl font-black mb-2">📜 Session History</h1>
        <p className="text-slate-400">
          {metadata.totalSessions} sessions • {metadata.sizeEstimateKB} KB used
        </p>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto mb-6 space-y-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'quiz', 'frq', 'cer', 'flashcards', 'worksheet'] as FilterMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                filterMode === mode
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/10'
                  : 'bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {mode === 'all' ? 'All Modes' : mode.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-4 flex-wrap">
          <input aria-label="Search sessions"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic or course..."
            className="flex-1 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/50 rounded-xl px-4 py-2 text-[#1A1C21] dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />

          <select aria-label="Sort sessions"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800/50 rounded-xl px-4 py-2 text-[#1A1C21] dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_score">Highest Score</option>
            <option value="lowest_score">Lowest Score</option>
          </select>

          {metadata.totalSessions > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 rounded-xl font-bold transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Session List */}
      <div className="max-w-6xl mx-auto grid gap-4">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            {sessions.length === 0
              ? "No sessions yet. Complete a practice session to see it here!"
              : "No sessions match your filters."}
          </div>
        ) : (
          filteredSessions.map(session => (
            <div
              key={session.id}
              className="bento-card cursor-pointer flex flex-col justify-between"
              onClick={() => onViewSession(session.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="px-3 py-1 bg-indigo-600 rounded-full text-xs font-bold uppercase">
                      {session.mode}
                    </span>
                    <span className="text-slate-400 text-sm">
                      {formatDate(session.dateCompleted)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1C21] dark:text-[#F8F9FB] mb-2 font-rounded">
                    {session.course}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {session.topics.map(topic => (
                      <span
                        key={topic}
                        className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs text-slate-600 dark:text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right ml-4">
                  <div className="text-3xl font-black text-indigo-500 dark:text-indigo-400">
                    {session.score}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    {session.questions.length} questions
                  </div>
                  {session.duration && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {formatDuration(session.duration)}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={() => onViewSession(session.id)}
                  className="text-indigo-500 hover:text-indigo-400 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-bold"
                >
                  Review Session →
                </button>
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className="text-rose-500 hover:text-rose-400 dark:text-rose-400 dark:hover:text-rose-300 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
