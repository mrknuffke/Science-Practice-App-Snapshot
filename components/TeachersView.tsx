import React from 'react';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import { CHEMISTRY_PRESETS, DocumentPreset } from './DocumentCreatorView';
import { PUBLIC_SOURCE_REPO_URL } from '../constants/projectLinks';

interface TeachersViewProps {
  onBack: () => void;
  onOpenSupport: () => void;
  onFeedback: () => void;
  teacherMode: boolean;
  onToggleTeacherMode: () => void;
  
  // Teacher workspace tools
  onOpenDocumentCreator: () => void;
  onStartInterview: () => void;
  onStartRubricTranslator: () => void;
  onOpenReviewGames: () => void;
  onSelectPreset?: (preset: DocumentPreset) => void;
}

const TeachersView: React.FC<TeachersViewProps> = ({
  onBack,
  onOpenSupport,
  onFeedback,
  teacherMode,
  onToggleTeacherMode,
  onOpenDocumentCreator,
  onStartInterview,
  onStartRubricTranslator,
  onOpenReviewGames,
  onSelectPreset,
}) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      
      {/* Visor Header */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          ← Back to Dashboard
        </button>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 select-none border border-amber-500/20">
              <ScienceBuddyMascot size={36} mood="excited" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Teacher Workspace</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 max-w-2xl leading-relaxed">
                Educator-focused materials, print-ready document engines, and curriculum translators built to streamline your daily planning.
              </p>
            </div>
          </div>
          
          <button
            onClick={onToggleTeacherMode}
            className={`btn-squishy px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
              teacherMode
                ? 'bg-amber-600 border-amber-600 text-white shadow-lg shadow-amber-900/15'
                : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 14l9-5-9-5-9 5 9 5zm0 7v-7m0 0l-9-5m9 5l9-5" />
            </svg>
            {teacherMode ? 'Teacher Mode: Active ✓' : 'Activate Teacher Mode'}
          </button>
        </div>
      </div>

      {/* ── SECTION 1: EDUCATIONAL TOOLS launchers (Bento grid) ── */}
      <div className="space-y-4">
        <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
          <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
          Printable & Analytical Engines
          <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Document Creator */}
          <div
            className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-6 min-h-[12rem] group cursor-pointer"
            onClick={onOpenDocumentCreator}
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform select-none">
                📄
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Worksheet Generator
              </span>
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                Document Creator
              </h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Generate highly formatted, printable science worksheets, exit tickets, and multi-section unit tests with full keys instantly.
              </p>
            </div>
          </div>

          {/* Interview Script */}
          <div
            className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-6 min-h-[12rem] group cursor-pointer"
            onClick={onStartInterview}
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform select-none">
                🎙️
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Oral Assessment
              </span>
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                Oral Interview Script
              </h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Formulate verbal evaluation scripts, targeted review questions, and detailed conceptual Socratic guidelines for individual checks.
              </p>
            </div>
          </div>

          {/* Rubric Translator */}
          <div
            className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-6 min-h-[12rem] group cursor-pointer"
            onClick={onStartRubricTranslator}
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform select-none">
                📋
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Scoring Helper
              </span>
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                Rubric Translator
              </h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Translate complex, rigid college-board academic scoring guidelines into digestible checklists that students can easily use to self-grade.
              </p>
            </div>
          </div>

          {/* Review Games */}
          <div
            className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-6 min-h-[12rem] group cursor-pointer"
            onClick={onOpenReviewGames}
          >
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-2xl text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform select-none">
                🎮
              </div>
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Class Games
              </span>
            </div>
            <div>
              <h4 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                Review Games Hub
              </h4>
              <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                Build Jeopardy boards, print custom Square Match vocabulary cards, and run interactive Bingo or progressive Who Am I games.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1B: CURRICULUM PRESETS (Chemistry Units 1–5) ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
            1-Click Document Presets · Chemistry Units 1–5
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
            Pre-configured with NGSS storyline topics &amp; problem distributions
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CHEMISTRY_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {preset.unitBadge}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
                    {preset.modeLabel}
                  </span>
                </div>
                <h4 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                  {preset.title}
                </h4>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  {preset.description}
                </p>
              </div>
              <button
                onClick={() => onSelectPreset?.(preset)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-slate-800/70 dark:hover:bg-amber-500 dark:hover:text-slate-900 text-slate-600 dark:text-slate-300 text-xs font-black transition-all flex items-center justify-center gap-2"
              >
                <span>Generate In 1 Click</span>
                <span className="text-sm">→</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 1C: STUDENT VERIFICATION & RETAKE MANAGEMENT ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
            Student Verification, Retakes &amp; Reset Management
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">
            Client-side receipt authentication &middot; Multi-run retake links &middot; Zero database overhead
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* XL Verifier Card */}
          <div className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-5 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl text-amber-600 dark:text-amber-400">
                  🛡️
                </div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  Units 1 to 8
                </span>
              </div>
              <h4 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                XL Chemistry Seal Verifier
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Scan QR codes or type digital anti-tamper seals from printed student receipts to authenticate scores, reconstruct problem parameters, or generate authorized retake links.
              </p>
            </div>
            <a
              href="/chem/xl/practice/verify.html?from=teachers"
              className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm font-rounded"
            >
              <span>Launch XL Verifier</span>
              <span className="text-sm">&rarr;</span>
            </a>
          </div>

          {/* PE Verifier Card */}
          <div className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-5 group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl text-indigo-600 dark:text-[#818CF8]">
                  🏅
                </div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-[#818CF8]">
                  15 NGSS Modules
                </span>
              </div>
              <h4 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-indigo-500 dark:group-hover:text-[#818CF8] transition-colors font-rounded">
                PE Adaptive Practice Verifier
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Authenticate completion seals from student performance expectation sessions, inspect randomized reaction pools, and verify diagnostic proficiency reports.
              </p>
            </div>
            <a
              href="/chem/pe/verify.html?from=teachers"
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-sm font-rounded"
            >
              <span>Launch PE Verifier</span>
              <span className="text-sm">&rarr;</span>
            </a>
          </div>

          {/* Reset & Retake Protocol Helper */}
          <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-5">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-xl text-emerald-600 dark:text-emerald-400">
                  🔄
                </div>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Student Reset Guide
                </span>
              </div>
              <h4 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">
                Retake &amp; Reset Workflow
              </h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Student data lives entirely in local browser memory. To issue a fresh randomized attempt without losing prior seals, use the <strong>Generate Retake Link</strong> tool (adds <code className="text-amber-500 font-mono text-[11px]">?run=2</code>). To perform a complete reset, students click their name avatar pill in the top header.
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="text-emerald-500 font-bold">&check;</span>
              <span>Each retake run regenerates all numerical values deterministically.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: CLASS SETUP & GUIDELINES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 items-stretch">
        
        {/* Class code guidelines (2/3 width) */}
        <div className="lg:col-span-2 bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-[#818CF8]">
              Educator Setup
            </span>
            <h3 className="text-xl font-black text-[#1A1C21] dark:text-white font-rounded">Classroom Integration</h3>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
              Science Practice Partner uses <strong>Google Sign-In</strong>, restricted to your school's Google Workspace domain (e.g. <code className="bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">@sas.edu.sg</code>). Students sign in once per browser with their existing school-issued Google account to unlock all Socratic, math, and CER tools: no new passwords, no new accounts, and no student data is collected or stored by this app beyond a sign-in check.
            </p>
          </div>
          
          <div className="p-4 bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-center gap-3">
            <span className="text-lg select-none">💡</span>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 italic">
              <strong>Teacher tip:</strong> Do not have students turn in screenshots. Instead, walk around to check progress, or have students document their AI tutor conversations in a physical journal.
            </p>
          </div>
        </div>

        {/* Feedback & Collaboration (1/3 width) */}
        <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Collaboration</span>
            <h3 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Let's Build This Together</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              We want to know what works for you! Share ideas for custom modules, new physics simulators, or rubric integrations.
            </p>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={onFeedback}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/10"
            >
              <span>📬</span> Share Feedback
            </button>
            <button
              onClick={onOpenSupport}
              className="w-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2"
            >
              <span>☕️</span> Support the Project
            </button>
            <a
              href={PUBLIC_SOURCE_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full min-h-[44px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center gap-2"
            >
              <span aria-hidden="true">🧩</span> See the Source Code
            </a>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The code for this app, its simulations and the textbooks is free on GitHub. Borrow what helps your own classes.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TeachersView;
