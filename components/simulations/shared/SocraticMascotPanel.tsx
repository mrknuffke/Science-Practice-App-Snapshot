import React, { useState, useEffect } from 'react';
import { ScienceBuddyMascot } from '../../ScienceBuddyMascot';
import { Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';

interface SocraticMascotPanelProps {
  tips: string[];
  title?: string;
  mood?: 'happy' | 'thinking' | 'excited' | 'wave' | 'sad';
}

export const SocraticMascotPanel: React.FC<SocraticMascotPanelProps> = ({ 
  tips, 
  title = "Socratic Mascot Tips",
  mood = "thinking"
}) => {
  const [tipIndex, setTipIndex] = useState(0);
  const [pulsing, setPulsing] = useState(false);

  // Trigger slight pulse animation when tip changes to grab attention
  useEffect(() => {
    setPulsing(true);
    const t = setTimeout(() => setPulsing(false), 600);
    return () => clearTimeout(t);
  }, [tipIndex]);

  const handleNext = () => {
    setTipIndex(prev => (prev + 1) % tips.length);
  };

  const handlePrev = () => {
    setTipIndex(prev => (prev - 1 + tips.length) % tips.length);
  };

  if (!tips || tips.length === 0) return null;

  return (
    <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-5 bg-white dark:bg-[#15171C] rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center gap-6 transition-all duration-300">
      
      {/* Mascot Icon Container */}
      <div className="shrink-0 flex flex-col items-center gap-2">
        <ScienceBuddyMascot size={80} mood={mood} />
        <span className="text-[9px] font-black uppercase tracking-wider text-slate-405 dark:text-slate-500">Mascot Guide</span>
      </div>

      {/* Socratic Hint / Question Area */}
      <div className="flex-1 space-y-3 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 dark:text-[#818CF8]" />
            <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">{title}</h4>
          </div>
          <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            {tipIndex + 1} of {tips.length}
          </span>
        </div>

        {/* Speech bubble */}
        <div className={`p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl relative transition-all duration-350 min-h-[4.5rem] flex items-center ${pulsing ? 'scale-[1.01] border-indigo-400/30' : ''}`}>
          {/* Bubble Arrow */}
          <div className="hidden md:block absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-slate-50 dark:bg-slate-900 border-l border-b border-slate-100 dark:border-slate-850 rotate-45"></div>
          
          <p className="text-xs text-slate-650 dark:text-slate-350 leading-relaxed font-medium">
            {tips[tipIndex]}
          </p>
        </div>

        {/* Carousel buttons */}
        {tips.length > 1 && (
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-450 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-850 transition-all active:scale-90"
              title="Previous Tip"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-indigo-650 dark:text-[#818CF8] text-xs font-black uppercase tracking-wider flex items-center gap-1 transition-all active:scale-95 hover:opacity-90"
              title="Next Tip"
            >
              <span>Next Tip</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
