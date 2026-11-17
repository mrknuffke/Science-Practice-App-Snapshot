import React, { useState } from 'react';
import { ScienceBuddyMascot } from '../ScienceBuddyMascot';
import { useDialog } from '../../hooks/useDialog';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const dialog = useDialog({ onClose, label: 'Welcome tour', open: isOpen });
  const [onboardingStep, setOnboardingStep] = useState(0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div {...dialog} className="bg-white dark:bg-[#1A1D26] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col items-center text-center space-y-4">
        
        {/* Step Counter */}
        <div className="absolute top-4 right-4 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Step {onboardingStep + 1} of 5
        </div>

        {/* Mascot Visual Render */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl">
          <ScienceBuddyMascot
            size={90}
            mood={
              onboardingStep === 0 ? 'wave' :
              onboardingStep === 1 ? 'happy' :
              onboardingStep === 2 ? 'excited' :
              onboardingStep === 3 ? 'thinking' : 'excited'
            }
          />
        </div>

        {/* Step Content switcher */}
        {onboardingStep === 0 && (
          <div className="space-y-2">
            <h3 className="text-xl font-black font-rounded text-[#1A1C21] dark:text-[#F8F9FB]">
              Welcome to Science Practice Partner! 🚀
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
              Hey there! We are thrilled to help you master science. Let's take a quick tour of the powerful tools and preferences at your fingertips.
            </p>
          </div>
        )}

        {onboardingStep === 1 && (
          <div className="space-y-2">
            <h3 className="text-xl font-black font-rounded text-indigo-600 dark:text-[#818CF8]">
              ⭐ Star Your Favorites
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
              Click <span className="text-[#1A1C21] dark:text-[#F8F9FB] font-bold">Practice Center</span> in the top menu to view all 20+ custom learning modes. Star any mode to pin it directly as a favorite on your homepage dashboard!
            </p>
          </div>
        )}

        {onboardingStep === 2 && (
          <div className="space-y-2">
            <h3 className="text-xl font-black font-rounded text-violet-600 dark:text-violet-400">
              ⚙️ Personalize Your Buddy & Theme
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
              Make the site yours! Open <span className="text-[#1A1C21] dark:text-[#F8F9FB] font-bold">User Options</span> in the menu to change your name, your role and your companion: <b>Science Bot</b> 🤖, <b>Beaker Buddy</b> 🧪, <b>Happy Plant</b> 🌱 or <b>Cool Gerbil</b> 🐹. You can also turn on <b>Dark Appearance</b> and the <b>Dyslexia-Friendly Font</b>. Use <b>Sign Out</b> in the same menu when you finish on a shared computer.
            </p>
          </div>
        )}

        {onboardingStep === 3 && (
          <div className="space-y-2">
            <h3 className="text-xl font-black font-rounded text-emerald-600 dark:text-emerald-450">
              🔒 Privacy-First & Teacher Mode
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
              Your data belongs to you! Everything is saved in your browser on this computer: no database, and no personal details collected. If you picked <b>Teacher</b>, the menu also has a Teacher Space with worksheet generators, review games and exit tickets.
            </p>
          </div>
        )}

        {onboardingStep === 4 && (
          <div className="space-y-2">
            <h3 className="text-xl font-black font-rounded text-indigo-600 dark:text-[#818CF8]">
              🤖 Socratic Companion Guide
            </h3>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
              Look out for your companion's <b>Socratic Panels</b> in our interactive science labs and simulators! They will guide you through complex calculations and experiments with thought-provoking, conceptual questions.
            </p>
          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex w-full items-center gap-3 pt-3">
          {onboardingStep > 0 ? (
            <button
              onClick={() => setOnboardingStep(prev => prev - 1)}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-750 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            >
              Back
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-750 text-slate-450 hover:text-slate-650 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            >
              Skip Tour
            </button>
          )}

          {onboardingStep < 4 ? (
            <button
              onClick={() => setOnboardingStep(prev => prev + 1)}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow"
            >
              Get Started! 🎉
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
