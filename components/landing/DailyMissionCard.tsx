import React from 'react';

interface DailyMissionCardProps {
  streakCount: number;
  badgeCount: number;
  onOpenTrophyRoom: () => void;
}

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({
  streakCount,
  badgeCount,
  onOpenTrophyRoom
}) => {
  return (
    <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-4">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Your Journey Path</span>
        <h3 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Daily Mission</h3>
      </div>
      
      <div className="space-y-3 flex-1 py-1 flex flex-col justify-center">
        {/* Streak indicator */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/30">
          <div className="text-2xl select-none">🔥</div>
          <div>
            <h4 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB]">{streakCount > 0 ? `${streakCount} Day Streak!` : 'Start Streak'}</h4>
            <p className="text-[10px] text-slate-400">Practice daily to build deep retention.</p>
          </div>
        </div>

        {/* Badges unlocked */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100/50 dark:border-slate-800/30">
          <div className="text-2xl select-none">🏆</div>
          <div>
            <h4 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB]">{badgeCount} Badges Earned</h4>
            <p className="text-[10px] text-slate-400">Claim scientific achievements.</p>
          </div>
        </div>
      </div>

      <button
        onClick={onOpenTrophyRoom}
        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors text-center font-rounded"
      >
        Achievements Room →
      </button>
    </div>
  );
};
