import React, { useState, useEffect, useMemo } from 'react';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import { X, CheckCircle2, CircleDashed } from 'lucide-react';
import SEO from './SEO';

interface LoadingSessionViewProps {
  course?: string | null;
  topic?: string | null;
  mode?: string | null;
  difficulty?: string | null;
  mascot?: 'robot' | 'beaker' | 'plant' | 'gerbil';
  statusText?: string;
  onCancel?: () => void;
}

const SCIENCE_TIPS_BY_DISCIPLINE: Record<string, string[]> = {
  Biology: [
    "💡 Tip: Enzyme active sites change shape slightly during substrate binding (induced fit model).",
    "🧬 Fun Fact: Mitochondria have their own circular DNA and replicate independently via binary fission.",
    "🌱 Study Strategy: Practice drawing signaling cascades to master cell communication pathways.",
    "🔬 Pro Tip: Pay close attention to negative and positive feedback loops in regulatory questions.",
    "🌍 Ecology Note: Only ~10% of energy transfers between successive trophic levels in an ecosystem.",
  ],
  Chemistry: [
    "⚗️ Tip: Electronegativity differences dictate bond character — covalent vs. polar covalent vs. ionic.",
    "⚡ Chemistry Tip: Catalysts lower activation energy without changing overall reaction enthalpy (ΔH).",
    "🧪 Pro Tip: Always balance redox equations by tracking oxidation states and electron transfer.",
    "🌡️ Gas Law: Ideal gases behave most ideally at high temperature and low pressure.",
    "⚖️ Le Chatelier: Increasing pressure shifts equilibria toward the side with fewer gas moles.",
  ],
  Physics: [
    "⚛️ Physics Tip: Free body diagrams are your best friend — always decompose forces into orthogonal components.",
    "🚀 Momentum: Total momentum is conserved in all isolated collisions (elastic and inelastic).",
    "⚡ Circuit Rule: Current is identical through series components; voltage is identical across parallel branches.",
    "🌊 Wave Tip: Wave speed depends only on the medium, not on frequency or amplitude.",
  ],
  General: [
    "🧠 Active Recall: Testing yourself produces stronger memory traces than re-reading notes.",
    "🎯 Metacognition: When answering questions, identify *why* each distractor option is incorrect.",
    "✨ Socratic Tip: Explain the core scientific mechanism out loud to solidify deep conceptual understanding.",
    "📊 Data Tip: Look at axis scales and error bars first before drawing conclusions from charts.",
  ]
};

const STAGES = [
  { label: 'Curating curriculum standards & learning objectives', minProgress: 15 },
  { label: 'Formulating realistic scientific stimuli & datasets', minProgress: 45 },
  { label: 'Calibrating question difficulty & distractors', minProgress: 75 },
  { label: 'Running verification pass & finalizing session', minProgress: 95 },
];

export const LoadingSessionView: React.FC<LoadingSessionViewProps> = ({
  course = 'Science Practice',
  topic = 'General Review',
  mode = 'quiz',
  difficulty = 'Medium',
  mascot = 'robot',
  statusText,
  onCancel
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [progressPercent, setProgressPercent] = useState(10);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  // Determine science discipline for tailored tips
  const discipline = useMemo(() => {
    const c = (course || '').toLowerCase();
    if (c.includes('bio') || c.includes('life') || c.includes('anatomy') || c.includes('marine')) return 'Biology';
    if (c.includes('chem')) return 'Chemistry';
    if (c.includes('phys') || c.includes('force') || c.includes('motion')) return 'Physics';
    return 'General';
  }, [course]);

  const tipsList = SCIENCE_TIPS_BY_DISCIPLINE[discipline] || SCIENCE_TIPS_BY_DISCIPLINE.General;

  // Cycle rotating tips every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % tipsList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [tipsList.length]);

  // Smooth simulated progress progression
  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent(prev => {
        if (prev < 90) {
          const next = prev + Math.floor(Math.random() * 8) + 4;
          return Math.min(next, 92);
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  // Update active stage based on progress
  useEffect(() => {
    if (progressPercent < 35) setActiveStageIndex(0);
    else if (progressPercent < 65) setActiveStageIndex(1);
    else if (progressPercent < 85) setActiveStageIndex(2);
    else setActiveStageIndex(3);
  }, [progressPercent]);

  const getModeDisplayName = (m?: string | null) => {
    switch (m) {
      case 'frq': return 'Written Response (FRQ)';
      case 'cer': return 'Data Analysis (C.E.R.)';
      case 'explanation': return 'Socratic Chat';
      case 'calculation': return 'Equation Solver';
      case 'flashcards': return 'Flashcard Deck';
      case 'worksheet': return 'Comprehensive Worksheet';
      case 'multimode': return 'Topic Dashboard';
      default: return 'Adaptive Practice';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#12141C] flex flex-col items-center justify-center p-4 sm:p-6 text-center transition-colors duration-300">
      <SEO title={`Preparing ${getModeDisplayName(mode)}...`} />

      <div className="bg-white dark:bg-[#15171C] border border-slate-150 dark:border-slate-800/80 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl max-w-xl w-full text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-40 bg-gradient-to-b from-indigo-500/20 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        {/* Mascot & Thinking Animation */}
        <div className="relative w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-indigo-500/10 dark:bg-[#818CF8]/10 rounded-full blur-xl animate-pulse"></div>
          <ScienceBuddyMascot size={110} mood="thinking" type={mascot} />
        </div>

        {/* Header Title */}
        <h2 className="text-2xl sm:text-3xl font-black text-[#1A1C21] dark:text-[#F8F9FB] mb-2 font-rounded">
          Crafting Your Session
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-md mx-auto mb-6">
          Our AI partner is synthesizing verified problems and rubric benchmarks for you.
        </p>

        {/* Target Session Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {course && (
            <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-[#818CF8] text-[11px] font-black border border-indigo-150 dark:border-indigo-800/40">
              📚 {course}
            </span>
          )}
          {topic && (
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700">
              🔬 {topic}
            </span>
          )}
          <span className="px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-[11px] font-black border border-teal-150 dark:border-teal-800/40">
            🎯 {getModeDisplayName(mode)}
          </span>
          {difficulty && (
            <span className="px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 text-[11px] font-black border border-amber-150 dark:border-amber-800/40">
              ⚡ {difficulty}
            </span>
          )}
        </div>

        {/* Multi-Step Progress Tracker */}
        <div className="space-y-2 mb-6 text-left bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-800/60">
          <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
            <span>Generation Progress</span>
            <span className="text-indigo-600 dark:text-[#818CF8]">{progressPercent}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-[#818CF8] to-teal-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Stepper Status */}
          <div className="space-y-1.5">
            {STAGES.map((stage, idx) => {
              const isDone = activeStageIndex > idx;
              const isCurrent = activeStageIndex === idx;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'text-indigo-600 dark:text-[#818CF8] font-bold'
                      : isDone
                      ? 'text-slate-400 dark:text-slate-500 line-through opacity-75'
                      : 'text-slate-350 dark:text-slate-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : isCurrent ? (
                    <CircleDashed className="w-3.5 h-3.5 text-indigo-500 dark:text-[#818CF8] animate-spin shrink-0" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-700 shrink-0"></div>
                  )}
                  <span className="line-clamp-1">{stage.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rotating Science Tips Card */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs font-medium text-slate-700 dark:text-slate-300 min-h-[3.2rem] flex items-center justify-center transition-all duration-300">
          <p key={currentTipIndex} className="animate-in fade-in slide-in-from-bottom-1 duration-300 leading-relaxed">
            {tipsList[currentTipIndex]}
          </p>
        </div>

        {/* Live Status Text */}
        {statusText && statusText !== 'Generating questions...' && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-3 font-medium">
            Status: {statusText}
          </p>
        )}

        {/* Cancel Button */}
        {onCancel && (
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel & Return to Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
