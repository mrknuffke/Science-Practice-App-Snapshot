import React, { useState } from 'react';
import { 
  ArrowLeft, Sparkles, BookOpen, Target, Award, ShieldAlert, Cpu, 
  Share2, Accessibility, Flame, RefreshCw, PenTool, BarChart3, 
  HelpCircle, Gamepad2, Info 
} from 'lucide-react';
import { DEFAULT_MODEL, VISION_MODEL, formatModelName } from '../services/ai/core';
import { COURSES } from '../constants/apCourses';

interface HowItWorksViewProps {
  onBack: () => void;
  onOpenSupport: () => void;
  onOpenFeatures?: () => void;
}

const HowItWorksView: React.FC<HowItWorksViewProps> = ({ onBack, onOpenSupport, onOpenFeatures }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleShareLink = () => {
    const url = `${window.location.origin}/?page=how_it_works`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  const modeExplainers = [
    {
      mode: 'Practice Session',
      icon: <Cpu className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
      what: 'Generates diverse question sets (MCQ, Short Answer, Error Correction, Analogies) in a strict JSON schema format. Injects official course standards (AP CED, NGSS) and adjusts vocabulary complexity per grade level. Questions use misconception-aware distractors based on common student errors.',
      schema: 'Enforced JSON schema: 4-option MCQ, correct answer, subType (recall/concept/application). Returns full question array in one call.'
    },
    {
      mode: 'Written Response (FRQ)',
      icon: <PenTool className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
      what: 'Builds AP-style multi-part free response questions with a scenario, supporting data exhibits (dynamically generated tables, charts, or Mermaid diagrams), and 3–4 sub-questions with bold action verbs. The grader evaluates student writing against an internally held rubric.',
      schema: 'Returns { scenario, exhibits[], parts[], type: "frq" }. Exhibits include structured chart data for Recharts rendering.'
    },
    {
      mode: 'Data Analysis (CER)',
      icon: <BarChart3 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />,
      what: 'Generates a unique "Confidential Dossier" — a realistic dataset with a table or graph built by the AI. Students construct a Claim-Evidence-Reasoning argument. The AI grades each component separately on a 1–5 rubric.',
      schema: 'CER scoring response includes: claimScore, evidenceScore, reasoningScore, plus specific feedback per component.'
    },
    {
      mode: 'Flashcards',
      icon: <BookOpen className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
      what: 'Generates term/definition pairs aligned to the course. Write Mode uses fuzzy matching — near-correct answers (minor spelling errors, alternate phrasings) are accepted. Cloze deletion and True/False card types are also generated.',
      schema: 'Returns { flashcards: [{ term, definition, type }] }. Write mode grading uses AI semantic comparison, not strict string match.'
    },
    {
      mode: 'Explanation Partner',
      icon: <HelpCircle className="w-5 h-5 text-sky-500 dark:text-sky-400" />,
      what: 'Uses a Socratic system prompt that instructs the AI never to give direct answers — only ask leading questions. Students must articulate their reasoning to "earn" the answer. The AI awards a Mastery badge when it judges understanding is demonstrated. Configurable persona (Tutor / Socratic / Skeptic / Growth Coach) alters the conversational style.',
      schema: 'Chat-based streaming. The system prompt is pre-loaded with course context and the selected persona instructions before the first user turn.'
    },
    {
      mode: 'Smart Scanner',
      icon: <Cpu className="w-5 h-5 text-rose-500 dark:text-rose-400" />,
      what: 'Uses the Gemini multimodal API to analyze uploaded PDFs and images. Extracts content from your actual notes and generates questions ONLY from that content. Good for personalizing practice to exactly what was covered in class.',
      schema: 'Vision API pass extracts text context from uploaded files, then a second prompt generates questions constrained to that extracted context.'
    },
    {
      mode: 'Lab Co-Pilot',
      icon: <Sparkles className="w-5 h-5 text-amber-500 dark:text-amber-400" />,
      what: 'Multi-track context memory: Design, Data Analysis, Report Feedback, Error Analysis, Mentor, and Safety. Project context persists across sessions. The AI maintains a running "Lab Notebook" mental model of your project.',
      schema: 'Each track uses a specialized system prompt. Project context is injected at the start of every call to maintain continuity.'
    },
    {
      mode: 'Study Sprint',
      icon: <Flame className="w-5 h-5 text-orange-500 dark:text-orange-400" />,
      what: 'Two-step AI: First call recommends a diverse task set (Quiz + FRQ + CER etc.) and explains its reasoning. After completing all tasks, a second AI call generates a personalized PDF report analyzing performance across all tasks and suggesting targeted remediation.',
      schema: 'Task recommendations return a typed JSON array. Report generation takes the full session transcript and returns structured analysis: strengths[], improvements[], recommendations[].'
    },
    {
      mode: 'Document Creator',
      icon: <PenTool className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
      what: 'Teacher-mode prompting: generates aligned documents (Worksheets, CER Tasks, FRQ Sets, Problem Sets, Exit Tickets, Full Tests) with print-ready HTML output styled for A4 PDF. Includes rubric scaffolding, student header lines, and configurable difficulty.',
      schema: 'Each document type has a custom teacher-role system prompt with output formatted as HTML (not Markdown) to ensure print fidelity.'
    },
    {
      mode: 'Review Games',
      icon: <Gamepad2 className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />,
      what: 'Jeopardy: AI generates a structured 5×5 board with data-rich clues. Square Match: generates term/match pairs at configurable difficulty (easy blanks, medium filler, hard distractors). Who Am I: 5 progressive clues from vague to specific, plus a "factoid" reveal.',
      schema: 'Each game type has its own JSON schema. Jeopardy returns { categories[], clues[][] }. Square Match returns { pairs: [{term, match}] }. Who Am I returns { entity, clues[5], factoid }.'
    },
    {
      mode: 'Advanced Study Buddy (AP & IB)',
      icon: <BookOpen className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />,
      what: `Generates custom tutors for ${COURSES.length} AP and IB courses, aligned to the official Course and Exam Descriptions (CED) and IB subject guides. Students choose a course and unit, and the AI guides them through key terms, concepts, and exam-style questions while explaining the scoring guidelines.`,
      schema: 'Uses course-specific CED / subject-guide system instructions to constrain tutor personality and curriculum bounds. Prompts enforce official AP or IB terminology and pacing.'
    },
    {
      mode: 'Calculation Partner',
      icon: <BarChart3 className="w-5 h-5 text-violet-500 dark:text-violet-400" />,
      what: 'Step-by-step quantitative coaching for dimensional analysis, stoichiometry, kinematics, and equilibrium. Support is released gradually: the first turns are heavily guided, later turns hand progressively more of the work back to you.',
      schema: 'Streaming chat with a gradual-release block injected into the system prompt. The AI reads the turn history to decide whether you are in the Guided, Coached, or Independent tier.'
    },
    {
      mode: 'The Learning Loop',
      icon: <RefreshCw className="w-5 h-5 text-emerald-550 dark:text-emerald-400" />,
      what: 'An iterative metacognitive partner that helps students close learning gaps. The AI presents a challenge, evaluates student input, provides target coaching, and loops back with a slightly modified challenge to verify that understanding has been cemented.',
      schema: 'Loop mechanism stores previous student responses, analyzes core misconceptions, and generates iterative prompt chains tracking performance delta across loops.'
    },
    {
      mode: 'Motion Tracker',
      icon: <BarChart3 className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />,
      what: 'A real-world physics video analyzer and data logger. Students watch simulated or uploaded kinematics motion videos, click to track coordinates frame-by-frame, and view instant live position, velocity, and acceleration graphs with best-fit linear/quadratic models.',
      schema: 'Client-side mathematical engine calculating coordinates, delta time, instantaneous velocities, and numerical derivatives, mapped directly to Recharts for dynamic visual modeling.'
    }
  ];

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
            <span className="text-emerald-500 flex items-center gap-1">✓ Copied!</span>
          ) : (
            <span className="flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Share Link</span>
          )}
        </button>
      </div>

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">How It Works</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 leading-relaxed max-w-2xl">
          Science Practice Partner isn't a database of questions — it's a real-time AI tutor that generates, assesses, and explains science concepts on the fly.
        </p>

        {onOpenFeatures && (
          <button
            onClick={onOpenFeatures}
            className="mt-6 w-full text-left bento-card border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 p-4 transition-all group flex items-center gap-3 bg-white dark:bg-[#15171C]"
          >
            <span className="text-emerald-500 text-lg">✦</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
              Want a breakdown of every mode? <strong className="text-emerald-500">View the Features Guide →</strong>
            </span>
          </button>
        )}
      </div>

      {/* ── CONTENT BENTO GRID ── */}
      <div className="space-y-10">

        {/* 1. Tech Stack */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-indigo-650 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">The Tech Stack</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#15171C] hover:border-indigo-500/30 transition-colors">
              <h3 className="font-black text-sm text-[#1A1C21] dark:text-white font-rounded mb-2">Google Gemini API</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Nearly every mode runs on <strong>{formatModelName(DEFAULT_MODEL)}</strong>, picked for speed and reasoning. Image and PDF parsing routes to <strong>{formatModelName(VISION_MODEL)}</strong>, which reads diagrams and handwriting more reliably. Requests are proxied through a serverless function so the API key never reaches your browser.
              </p>
            </div>
            <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#15171C] hover:border-indigo-500/30 transition-colors">
              <h3 className="font-black text-sm text-[#1A1C21] dark:text-white font-rounded mb-2">Modern Frontend</h3>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                Built with <strong>React 18</strong>, <strong>TypeScript</strong>, and <strong>Tailwind CSS</strong>. Bundled with Vite, deployed on Vercel. It's a Single Page Application (SPA) — no page reloads.
              </p>
            </div>
          </div>
        </section>

        {/* 2. Prompt Engineering */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-emerald-650 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Prompt Engineering</h2>
          </div>

          <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#15171C] hover:border-emerald-500/30 transition-colors space-y-4">
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              The site works by sending carefully crafted <strong>pre-prompts</strong> to Gemini — not just simple questions. Each mode has its own system instructions.
            </p>
            <ul className="space-y-3.5 text-xs text-slate-550 dark:text-slate-400 pl-4 list-disc">
              <li>
                <strong className="text-emerald-500 font-rounded">Context Injection:</strong> When you select "AP Biology", the official AP CED standards are injected into the prompt. The AI must align its content to those standards.
              </li>
              <li>
                <strong className="text-emerald-500 font-rounded">Adaptive Complexity:</strong> Elementary students get simple vocabulary and emoji-rich responses. AP Physics students get rigorous academic language and calculation-heavy problems.
              </li>
              <li>
                <strong className="text-emerald-500 font-rounded">Structured Data (JSON Mode):</strong> We force the AI to return strict JSON schemas. Every MCQ always has exactly 4 options. Every FRQ always has a scenario and sub-questions. This prevents the AI from making up its own format.
              </li>
              <li>
                <strong className="text-emerald-500 font-rounded">Persona System:</strong> The Explanation Partner can operate in four modes — Tutor (direct), Socratic (guiding questions), Skeptic (challenging reasoning), or Growth Coach (confidence-building). Each has a different system prompt.
              </li>
            </ul>
          </div>
        </section>

        {/* 3. AI Under the Hood */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Info className="w-5 h-5 text-violet-650 dark:text-violet-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">AI Under the Hood, Mode by Mode</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Each learning mode communicates with the AI differently. Here's exactly what's happening behind the scenes.
          </p>
          
          <div className="space-y-3">
            {modeExplainers.map((m) => (
              <div key={m.mode} className="bento-card border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15171C] overflow-hidden">
                <button
                  onClick={() => toggleSection(m.mode)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="shrink-0">{m.icon}</span>
                    <span className="font-black text-xs text-[#1A1C21] dark:text-white font-rounded">{m.mode}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform ${openSection === m.mode ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === m.mode && (
                  <div className="px-4 pb-4 pt-1 bg-slate-50/[0.3] dark:bg-slate-900/[0.05] space-y-3 border-t border-slate-100 dark:border-slate-800/80 animate-in slide-in-from-top-2 duration-300">
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.what}</p>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-violet-500 block mb-1">Schema / Structure</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{m.schema}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* 4. AI Limitations */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-amber-650 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">AI Is Imperfect — And That's Okay</h2>
          </div>

          <div className="bento-card border border-amber-550/20 dark:border-amber-500/10 p-6 bg-white dark:bg-[#15171C] space-y-4 hover:border-amber-500/30 transition-colors">
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              The AI powering this site is genuinely impressive, but it is <strong>not infallible</strong>. You should know these things:
            </p>
            <ul className="space-y-3 text-xs text-slate-550 dark:text-slate-400 pl-4 list-disc">
              <li>
                <strong className="text-amber-500 font-rounded">Hallucinations happen:</strong> Gemini can sometimes generate plausible-sounding but factually incorrect information. A generated question might have a subtly wrong answer or a misleading distractor. Always apply your own scientific judgment.
              </li>
              <li>
                <strong className="text-amber-500 font-rounded">Grading is not a teacher:</strong> The AI's rubric-based grading is a useful first pass, but it does not replace human assessment. It may give credit for technically correct responses that miss the conceptual mark, or vice versa.
              </li>
              <li>
                <strong className="text-amber-500 font-rounded">Generation failures:</strong> Sometimes the AI times out, returns an error, or produces a malformed response. The "Refresh" button is your friend. These failures are usually transient.
              </li>
              <li>
                <strong className="text-amber-500 font-rounded">It doesn't know your exact curriculum:</strong> Even with course standards injected, the AI cannot know the specific chapter you covered last week, your teacher's preferred definitions, or local curriculum variations. Use it as a supplement, not a replacement.
              </li>
            </ul>
            <p className="text-xs italic text-amber-600 dark:text-amber-400 border-l-2 border-amber-500/50 pl-4">
              "Think of this tool as a very well-read study partner who occasionally misremembers things. Useful, but always worth double-checking." — David
            </p>
          </div>
        </section>

        {/* 5. Accessibility */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 flex items-center justify-center">
              <Accessibility className="w-5 h-5 text-sky-655 dark:text-sky-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Accessibility & Speech</h2>
          </div>

          <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#15171C] space-y-4 hover:border-sky-500/30 transition-colors">
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              We have integrated <strong>Browser-Native Speech Recognition & Natural Speech Synthesis</strong> (Web Speech API). Audio is processed entirely on your device by your browser — never sent to third-party audio servers.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[
                { name: 'Readable Mode', desc: 'Dyslexia-friendly font settings' },
                { name: 'High Contrast', desc: 'Visual clarity optimizations' },
                { name: 'Text-to-Speech', desc: 'Natural voice with science formula pronunciation & speed control' },
                { name: 'Dictation', desc: 'Voice input in text fields' },
                { name: 'Reduced Motion', desc: 'Respects system preferences' },
                { name: 'Keyboard Shortcuts', desc: 'Full keyboard navigation in quiz mode' }
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl px-3 py-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  <div>
                    <strong className="block text-[#1A1C21] dark:text-white font-rounded">{item.name}</strong>
                    <span className="text-[10px] text-slate-400">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Vibe Coding */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-650 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Built via AI-Assisted Development</h2>
          </div>

          <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#15171C] space-y-4 hover:border-orange-500/30 transition-colors">
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              This entire application was built using a methodology often called <a href="https://en.wikipedia.org/wiki/Vibe_coding" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 underline decoration-orange-500/30 underline-offset-4 font-rounded">"Vibe-Coding"</a>.
              The author does not write raw code in React, TypeScript, or Tailwind CSS manually.
            </p>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              The implementation is generated by <strong>agentic AI coding assistants</strong> — frontier reasoning models, principally Anthropic's <strong>Claude</strong> models and Google's <strong>Gemini</strong> models, running in an agent harness with direct access to the repository. The specific tools have changed several times and will change again, so they aren't named here. What doesn't change is the division of labor: the educator sets the pedagogy, writes the science, and does the verification; the model writes the code.
            </p>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              Code is committed to <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 underline decoration-orange-500/30 underline-offset-4 font-rounded">GitHub</a> and automatically deployed via <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:text-orange-400 underline decoration-orange-500/30 underline-offset-4 font-rounded">Vercel</a>. Every AI-written change still gets read, run, and signed off by a human before it ships.
            </p>
          </div>
        </section>

        {/* 7. Privacy */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <Target className="w-5 h-5 text-rose-650 dark:text-rose-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Privacy & Sign-In</h2>
          </div>

          <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#15171C] space-y-4 hover:border-rose-500/30 transition-colors">
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              <strong>There is no user database, and no student account.</strong> The app runs in your browser. Your questions and answers go to Google's API for processing and are not retained by this site. Badges, streaks, and session history live in your browser's local storage — clear it and they're gone. Even the "Share Results" images are generated on your device.
            </p>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              <strong>What signing in actually does:</strong> Google confirms you belong to an approved school Workspace domain. The site checks the domain, then stores a signed token that records <em>only</em> that domain — never your name, your email address, or your Google ID. Nothing about you is written to a server. Free simulations and the chemistry textbook need no sign-in at all.
            </p>
            <p className="text-xs italic text-rose-500 border-l-2 border-rose-500/50 pl-4 font-rounded">
              "Because of my lack of fluency with these coding languages, I do not feel comfortable handling anybody's personal information. Signing in checks that you're at an approved school — that's the whole of it. This site will <strong>never</strong> hold student accounts, profiles, or personal data." — David
            </p>
          </div>
        </section>

        {/* 8. Sustainable */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-teal-650 dark:text-teal-400" />
            </div>
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Sustainable & Ad-Free</h2>
          </div>

          <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 bg-white dark:bg-[#15171C] space-y-4 hover:border-teal-500/30 transition-colors">
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              This site will likely <strong>never feature third-party advertisements</strong>. Ad networks rely on tracking scripts that contradict our core privacy values.
            </p>
            <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
              The real-time AI costs are covered by the creator and the community. If you find value, you can <button onClick={onOpenSupport} className="text-teal-500 dark:text-teal-400 font-black hover:text-teal-605 transition-colors underline decoration-teal-500/30 underline-offset-4 font-rounded">support the project</button>.
            </p>
            <p className="text-[10px] font-black text-teal-500 uppercase tracking-widest leading-normal">
              Note to Students: You should NEVER donate money. Your job is to learn; keep your money for pizza 🍕.
            </p>
          </div>
        </section>

        {/* ── ABOUT THE CREATOR ── */}
        <section className="pt-8 border-t border-slate-100 dark:border-slate-800/80">
          <h2 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded mb-3">About the Creator</h2>
          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Built by <a href="https://www.davidknuffke.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 dark:text-emerald-400 font-black hover:text-emerald-600 transition-colors underline decoration-emerald-500/30 underline-offset-4 font-rounded">David Knuffke</a>, a science educator passionate about making high-quality practice materials accessible to everyone.
          </p>
        </section>

      </div>
    </div>
  );
};

export default HowItWorksView;