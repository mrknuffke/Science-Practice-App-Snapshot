
import React, { useEffect, useState } from 'react';
import { SavedBadge } from '../types';
import { getBadgesFromStorage, getStudentLevel, clearBadges, getStreakInfo, calculateTotalXP } from '../services/storageService';
import { useDialog } from '../hooks/useDialog';

interface TrophyRoomViewProps {
  onBack: () => void;
}

const TrophyRoomView: React.FC<TrophyRoomViewProps> = ({ onBack }) => {
  const [badges, setBadges] = useState<SavedBadge[]>([]);
  const [selectedBadgeIndex, setSelectedBadgeIndex] = useState<number | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [showLegend, setShowLegend] = useState(false);
  const badgeDialog = useDialog({ onClose: () => setSelectedBadgeIndex(null), label: 'Badge details', open: selectedBadgeIndex !== null });
  const legendDialog = useDialog({ onClose: () => setShowLegend(false), labelledBy: 'badge-legend-title', open: showLegend });

  useEffect(() => {
    setBadges(getBadgesFromStorage());
    setStreakCount(getStreakInfo().count);
  }, []);

  // Keyboard navigation for Modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedBadgeIndex === null) return;

      if (e.key === 'ArrowRight') {
        setSelectedBadgeIndex((prev) => {
          if (prev === null || prev >= badges.length - 1) return prev;
          return prev + 1;
        });
      } else if (e.key === 'ArrowLeft') {
        setSelectedBadgeIndex((prev) => {
          if (prev === null || prev <= 0) return prev;
          return prev - 1;
        });
      } else if (e.key === 'Escape') {
        setSelectedBadgeIndex(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBadgeIndex, badges.length]);

  const _uniqueTopics = new Set(badges.map(b => b.topic)).size;
  const totalXP = calculateTotalXP(badges);
  const level = getStudentLevel(totalXP);

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all your badges and reset your streak? This cannot be undone.")) {
      clearBadges();
      setBadges([]);
      setStreakCount(0);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const selectedBadge = selectedBadgeIndex !== null ? badges[selectedBadgeIndex] : null;

  return (
    <div className="bg-transparent text-[#1A1C21] dark:text-[#F8F9FB] overflow-x-hidden print:bg-white print:text-slate-900 print:p-0">

      {/* Modal Overlay */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setSelectedBadgeIndex(null)}>
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm transition-opacity duration-300"></div>

          <div {...badgeDialog} className="relative w-full max-w-2xl flex items-center justify-center gap-4">
            {/* Left Arrow */}
            <button
              aria-label="Previous badge"
              onClick={(e) => { e.stopPropagation(); setSelectedBadgeIndex(prev => (prev !== null && prev > 0 ? prev - 1 : prev)); }}
              disabled={selectedBadgeIndex === 0}
              className={`p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${selectedBadgeIndex === 0 ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>

            <div className="relative bg-white rounded-[3rem] p-2 shadow-2xl animate-in zoom-in-95 fade-in duration-300 w-full" onClick={(e) => e.stopPropagation()}>
              <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden border-4 h-full flex flex-col p-8 md:p-12" style={{ borderColor: selectedBadge.color }}>

                <div className="flex justify-between items-center mb-8">
                  <span className="text-sm font-black uppercase tracking-widest px-4 py-2 rounded-xl text-white shadow-sm" style={{ backgroundColor: selectedBadge.color }}>
                    {selectedBadge.rarity}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                    {formatDate(selectedBadge.dateEarned)}
                  </span>
                </div>

                <div className="text-center py-6 mb-4">
                  <div className="text-9xl drop-shadow-2xl">{selectedBadge.emoji}</div>
                </div>

                <div className="text-center space-y-4">
                  <h3 className="text-4xl font-black text-slate-900 leading-tight">{selectedBadge.name}</h3>
                  <p className="text-lg text-slate-600 leading-relaxed italic">"{selectedBadge.description}"</p>

                  {selectedBadge.score && (
                    <div className="inline-block px-4 py-2 rounded-xl bg-slate-200 text-slate-600 font-black text-sm">
                      Score: {selectedBadge.score}
                    </div>
                  )}

                  <div className="pt-8 border-t border-slate-200 mt-4">
                    <div className="inline-block px-4 py-2 rounded-full bg-white border border-slate-200">
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                        {selectedBadge.course.includes('AP') ? 'AP Science' : 'Science'} • {selectedBadge.topic}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Arrow */}
            <button
              aria-label="Next badge"
              onClick={(e) => { e.stopPropagation(); setSelectedBadgeIndex(prev => (prev !== null && prev < badges.length - 1 ? prev + 1 : prev)); }}
              disabled={selectedBadgeIndex === badges.length - 1}
              className={`p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all ${selectedBadgeIndex === badges.length - 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Badge Legend Modal */}
      {showLegend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setShowLegend(false)}>
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
          <div {...legendDialog} className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6" onClick={e => e.stopPropagation()}>
            <h3 id="badge-legend-title" className="text-2xl font-black text-slate-800 uppercase tracking-tight">Badge Rarity Guide</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-slate-200">
                  &lt;70%
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Common</h4>
                  <p className="text-xs text-slate-400">Good effort! Keep practicing.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-blue-200">
                  70-89%
                </div>
                <div>
                  <h4 className="font-bold text-blue-700">Uncommon</h4>
                  <p className="text-xs text-slate-400">Solid understanding of the core concepts.</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-amber-200">
                  90-99%
                </div>
                <div>
                  <h4 className="font-bold text-amber-700">Rare</h4>
                  <p className="text-xs text-slate-400">Excellent mastery! Near perfection.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 relative overflow-hidden rounded-xl p-1">
                <div className="absolute inset-0 ultra-rare-shine"></div>
                <div className="w-12 h-12 rounded-xl bg-pink-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-pink-200 relative z-10">
                  100%
                </div>
                <div className="relative z-10">
                  <h4 className="font-bold text-pink-700">Ultra Rare</h4>
                  <p className="text-xs text-slate-400">Perfect Score! Truly legendary.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setShowLegend(false)} className="w-full py-3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition-colors">Close</button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-0">
        {/* Header (Hidden on Print) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Lab
            </button>
            <button
              onClick={() => setShowLegend(true)}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
            >
              Badge Legend ℹ️
            </button>
          </div>

          {badges.length > 0 && (
            <div className="flex items-center gap-4">
              <button
                onClick={handlePrint}
                className="text-xs font-bold text-slate-400 hover:text-emerald-400 uppercase tracking-widest transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print Collection
              </button>
              <button
                onClick={handleDeleteAll}
                className="text-xs font-bold text-rose-500/50 hover:text-rose-500 uppercase tracking-widest transition-colors"
              >
                Reset Data
              </button>
            </div>
          )}
        </div>

        {/* Browser Storage Warning (Hidden on Print) */}
        <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/35 dark:border-amber-550/20 rounded-2xl p-4 mb-8 flex items-start gap-4 print:hidden transition-all duration-300">
          <div className="text-amber-600 dark:text-amber-400 text-xl mt-0.5 select-none">⚠️</div>
          <div>
            <p className="text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-1">Browser Storage Notice</p>
            <p className="text-amber-900/80 dark:text-slate-300 text-xs leading-relaxed">
              Trophies and streaks are stored locally in this browser. They will be lost if you clear your cache, use incognito mode, or switch devices.
              <button onClick={handlePrint} className="text-indigo-650 dark:text-[#818CF8] hover:underline font-black ml-1">Print your collection</button> to keep a permanent record.
            </p>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="bento-card mb-12 relative overflow-hidden print:bg-white print:border-2 print:border-slate-200 print:shadow-none print:text-slate-900 print:mb-8 print:p-0 print:rounded-none">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none print:hidden"></div>
          <div className="relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center print:flex-row print:justify-between print:items-end">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 print:text-slate-900">Trophy Room</h1>
              <p className="text-slate-400 lg:text-lg print:text-slate-500">Your scientific achievements archive.</p>
            </div>

            <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 w-full md:w-auto">
              {/* Streak Card */}
              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-orange-500/30 flex-1 text-center min-w-[140px] print:bg-slate-50 print:border-slate-200">
                <div className="text-3xl md:text-4xl font-black text-orange-400 mb-1 print:text-slate-900">{streakCount}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Day Streak 🔥</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/30 flex-1 text-center min-w-[140px] print:bg-slate-50 print:border-slate-200">
                <div className="text-3xl md:text-4xl font-black text-emerald-400 mb-1 print:text-slate-900">{badges.length}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Badges Earned</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/30 flex-1 text-center min-w-[140px] print:bg-slate-50 print:border-slate-200">
                <div className="text-3xl md:text-4xl font-black text-indigo-400 mb-1 print:text-slate-900">{totalXP}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total XP Pts</div>
              </div>
            </div>
          </div>

          {/* Level Bar */}
          <div className="mt-8 pt-8 border-t border-slate-700/50 print:border-slate-200">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest print:text-slate-500">Current Rank</span>
              <span className="text-xl font-black text-white print:text-slate-900">{level}</span>
            </div>
            <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden print:bg-slate-200 relative">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 print:bg-slate-800 print:from-slate-800 print:to-slate-800 transition-all duration-1000"
                style={{ width: `${Math.min(100, (totalXP / 1000) * 100)}%` }} // Scaled to 1000 XP for the bar visual
              ></div>
              {/* Markers for ranks */}
              <div className="absolute top-0 bottom-0 left-[5%] w-px bg-slate-900/50"></div>
              <div className="absolute top-0 bottom-0 left-[15%] w-px bg-slate-900/50"></div>
              <div className="absolute top-0 bottom-0 left-[30%] w-px bg-slate-900/50"></div>
              <div className="absolute top-0 bottom-0 left-[50%] w-px bg-slate-900/50"></div>
              <div className="absolute top-0 bottom-0 left-[75%] w-px bg-slate-900/50"></div>
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-bold text-slate-600 uppercase tracking-widest">
              <span>Novice</span>
              <span>Department Chair (1000 XP)</span>
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        {badges.length === 0 ? (
          <div className="text-center py-20 animate-in fade-in zoom-in duration-500 print:hidden">
            <div className="text-6xl mb-6 opacity-30 grayscale">🏆</div>
            <h3 className="text-2xl font-bold text-white mb-4">Your collection is empty</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Complete practice sessions or explanation challenges to earn badges and level up your scientific rank.
            </p>
            <button
              onClick={onBack}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-emerald-500/20"
            >
              Start Earning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 print:grid-cols-3 print:gap-4">
            {badges.map((badge, index) => (
              <div
                key={badge.id}
                className="group relative perspective-1000 animate-in fade-in slide-in-from-bottom-4 duration-500 print:break-inside-avoid cursor-pointer"
                onClick={() => setSelectedBadgeIndex(index)}
              >
                <div className="relative bg-white rounded-[2rem] p-1 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-2xl group-hover:shadow-white/20 print:shadow-none print:transform-none print:border print:border-slate-200">
                  {/* Holographic Shine for Ultra Rare */}
                  {badge.rarity === 'ULTRA RARE' && <div className="ultra-rare-shine rounded-[2rem] z-20"></div>}

                  {/* Card Content */}
                  <div className="bg-slate-50 rounded-[1.8rem] overflow-hidden border-2 h-full flex flex-col print:bg-white" style={{ borderColor: badge.color }}>

                    {/* Header: Rarity & Date */}
                    <div className="flex justify-between items-center p-4 pb-0">
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md text-white print:text-black print:border print:border-black/10" style={{ backgroundColor: badge.color }}>
                        {badge.rarity}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {formatDate(badge.dateEarned)}
                      </span>
                    </div>

                    {/* Emoji */}
                    <div className="text-center py-6">
                      <div className="text-6xl drop-shadow-md transform transition-transform group-hover:scale-110 duration-300 print:text-5xl print:transform-none">{badge.emoji}</div>
                    </div>

                    {/* Text Details */}
                    <div className="p-5 pt-0 text-center flex-1 flex flex-col">
                      <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 line-clamp-2">{badge.name}</h3>
                      <p className="text-xs text-slate-500 leading-snug italic mb-4 line-clamp-3 flex-1">"{badge.description}"</p>

                      <div className="pt-4 border-t border-slate-200 mt-auto">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">
                          {badge.course.includes('AP') ? 'AP Science' : 'Science'} • {badge.topic}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrophyRoomView;
