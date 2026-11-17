import React, { useState } from 'react';
import { ArrowLeft, Share2, Sparkles, Cpu } from 'lucide-react';
import { SIMULATIONS_REGISTRY } from '../constants/simulationsRegistry';
import { COURSES } from '../constants/apCourses';

interface FeaturesViewProps {
  onBack: () => void;
  onOpenHowItWorks?: () => void;
}

export const FeaturesView: React.FC<FeaturesViewProps> = ({ onBack, onOpenHowItWorks }) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = () => {
    const url = `${window.location.origin}/?page=features`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      
      {/* ── NAVIGATION ROW ── */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        <button
          onClick={handleShareLink}
          className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors"
        >
          {copiedLink ? (
            <span className="text-emerald-500 flex items-center gap-1">✓ Copied Link!</span>
          ) : (
            <><Share2 className="w-3.5 h-3.5" /> Share Guide</>
          )}
        </button>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-8 bg-white dark:bg-[#1A1D26] rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="space-y-4 relative z-10 flex-1">
          <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider">
            Curriculum Aligned
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] tracking-tight font-rounded">
            Features Reference Guide
          </h1>
          <p className="text-slate-500 dark:text-slate-450 text-xs font-semibold leading-relaxed max-w-xl">
            Discover how to use every adaptive mode, gamified challenge, interactive laboratory, and teacher resource in Science Practice Partner.
          </p>

          {onOpenHowItWorks && (
            <button
              onClick={onOpenHowItWorks}
              className="mt-2 flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-black transition-all active:scale-95"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              Curious under the hood? See AI Mechanics →
            </button>
          )}
        </div>
        <div className="text-6xl select-none hidden md:block">📚</div>
      </div>

      {/* ── INTERACTIVE CONTROLS AND UTILITIES ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Capabilities */}
        <div className="lg:col-span-2 bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#1A1D26] rounded-[2rem] shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Core Capabilities</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-[#818CF8]">
                <Cpu className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-wider font-rounded">Misconception Analysis</h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Doesn't just grade multiple-choice options. The AI evaluates student logic, diagnoses precise underlying misconceptions, and gives encouraging targeted guidance.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-black uppercase tracking-wider font-rounded">Active Expression</h4>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Fosters retrieval and synthesis over passive consumption. Asks students to write out explanations, construct arguments, and analyze quantitative curves.
              </p>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#1A1D26] rounded-[2rem] shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-450 dark:text-slate-500 uppercase tracking-widest">Keyboard Shortcuts</h3>
          <div className="space-y-2.5">
            {[
              ['Select MCQ Option', '1, 2, 3, 4'],
              ['Submit Answer', 'Enter'],
              ['Next Question', 'Space'],
              ['Explain Concept', 'E'],
              ['Close Overlay Modal', 'Esc'],
            ].map(([action, key]) => (
              <div key={action} className="flex justify-between items-center text-[11px] border-b border-slate-100 dark:border-slate-850 pb-1.5 font-semibold text-slate-500 dark:text-slate-400">
                <span>{action}</span>
                <kbd className="bg-slate-50 dark:bg-slate-900 px-2 py-0.5 rounded text-slate-800 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-850 text-[10px] shadow-sm">{key}</kbd>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── FEATURES DICTIONARY BY CATEGORY ── */}
      <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 bg-white dark:bg-[#1A1D26] rounded-[2rem] shadow-sm space-y-10">
        
        {/* Practice & Assess Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-2">
            <span className="text-emerald-600 dark:text-emerald-400 text-lg">📝</span>
            <h3 className="text-base font-black font-rounded text-[#1A1C21] dark:text-[#F8F9FB]">Practice & Assessment Systems</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Practice Session</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                The core mode. Features adaptive MCQ, error correction, scientific analogies, and odd-one-out sorting. Focuses on targeted micro-curriculums.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Written Response (FRQ)</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Multi-part free-response simulator. Students analyze data scenarios, interpret exhibits, and construct thorough scientific answers graded by an AI rubric.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Data Analysis (CER)</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Claim-Evidence-Reasoning practice. Injects interactive synthetic data tables. Students construct rigorous claims, defend them with data, and argue science concepts.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">The Learning Loop</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                An iterative reinforcement partner. The AI provides a challenge, reviews your work, gives immediate socratic feedback, and poses a secondary shifted scenario to cement mastery.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Calculation Partner</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Math-heavy science coaching. Walk through dimensional analysis, equilibrium constants, kinematics, and chemical formulas step-by-step with formulas.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Motion Tracker</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Physics video logger. Tracks moving objects frame-by-frame on screen to graph position, velocity, and acceleration against math best-fit regression lines.
              </p>
            </div>
          </div>
        </div>

        {/* Study & Review Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-2">
            <span className="text-indigo-650 dark:text-indigo-400 text-lg">💡</span>
            <h3 className="text-base font-black font-rounded text-[#1A1C21] dark:text-[#F8F9FB]">Study & Active Recall Review</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Advanced Study Buddy</strong>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                A curriculum-bound companion matching the official AP Course &amp; Exam Description (CED) and IB subject guides. {COURSES.length} courses — the AP and IB sciences, plus maths, history, English, computer science, economics, and world languages.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Concept Map Builder</strong>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                An interactive node-and-edge relational knowledge web. Connect scientific concepts with directional linking propositions, audited in real-time by canonical pedagogical rules and AI semantic validation.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Explanation Partner</strong>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                A conversational tutor that encourages deep dialog. Select specialized AI personas (Growth Coach, growth-mindset guide, skeptic) to tailor the conversational rigor.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Flashcards Portfolio</strong>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                Active recall vocabulary drills. Includes matching, write mode (utilizing semantic fuzzy matching for rephrased terminology), and reverse translation options.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Smart Scanner</strong>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                Multimodal visual upload. Upload PDFs, photos of handwriting, or textbook pages to extract notes and build instant quizzes constrained to the source content.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Study Sprint</strong>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                AI-curated learning paths. Completing Sprints compiles a performance profile detailing strength charts, growth areas, and printable study guides.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">MultiMode Dashboard</strong>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed font-semibold">
                All-in-one workspace focusing on a single key concept. Synchronizes flashcard sessions, socratic chat, and calculations on one seamless page layout.
              </p>
            </div>
          </div>
        </div>

        {/* Labs & Simulations Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-2">
            <span className="text-cyan-600 dark:text-cyan-400 text-lg">🧪</span>
            <h3 className="text-base font-black font-rounded text-[#1A1C21] dark:text-[#F8F9FB]">Interactive Labs & Simulations</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Interactives Lab Hub</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Central dashboard housing {SIMULATIONS_REGISTRY.length} hands-on model builders covering bonding, atomic structure, thermodynamics, kinetics, ecology, genetics, and force vectors. Free to anyone — no sign-in needed.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">SAS General Chemistry Textbook</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                An open-access interactive chemistry text with 27 lessons of retrieval-practice widgets, particle diagrams, spaced-repetition review, and a slide-out reference drawer. Also free and sign-in-free.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Build an Atom Bohr Sandbox</strong>
              <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed font-semibold">
                Chemistry sandbox (inspired by PhET Interactive Simulations). Click inventory triggers to add protons, neutrons, and electrons to fill animated shells, check nuclear stability, and clear gamified challenge cards.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Lab Co-Pilot</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Multi-track laboratory companion. Helps students refine experimental procedures, perform calculations, run safety checklist diagnostics, and draft lab reports.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Research Mentor</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Science fair and thesis coach. Maps methodologies, refines background literature citations, drafts flowcharts, and assists with data logging parameters.
              </p>
            </div>
          </div>
        </div>

        {/* Teacher Resources Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-850 pb-2">
            <span className="text-violet-650 dark:text-violet-400 text-lg">👩‍🏫</span>
            <h3 className="text-base font-black font-rounded text-[#1A1C21] dark:text-[#F8F9FB]">Teacher Resources & Printing</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Document Creator</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Printable assignment engine. Generates worksheets, exit tickets, structured CER grids, calculations problem sets, and full test blueprints in clean, styled A4 PDF markup.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Interview Script Generator</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Verbal conference scaffolds. Generates tailored interview sheets for teacher-student check-ins, complete with focal queries, follow-up tips, and rubric checklists.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Rubric Translator</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Converts dry NGSS or AP syllabus documentation into highly engaging, kid-friendly "I Can..." checkboxes to foster self-evaluation and student reflection.
              </p>
            </div>

            <div className="space-y-1">
              <strong className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] hover:text-indigo-500 dark:hover:text-[#818CF8] transition-colors block">Gamified Review Boards</strong>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                AI-powered classroom activities. Builds Jeopardy sheets, custom vocabulary matching puzzle blocks, and progressive clue game decks (Who Am I) to review topics.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FeaturesView;