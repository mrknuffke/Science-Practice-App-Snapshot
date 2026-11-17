import React, { useState } from 'react';
import { Sparkles, CheckCircle2, Award, Printer, ArrowRight, Check, Loader2, RefreshCw, CheckSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  generateAssessment, 
  generateDiagnosis, 
  generateChallenge, 
  generateFeedback,
  type LoopQuestion,
  type LoopDiagnosis,
  type LoopChallenge,
  type LoopFeedback
} from '../services/ai/learningLoop';
import MarkdownRenderer from './MarkdownRenderer';

interface LearningLoopViewProps {
  onBack: () => void;
  studentName?: string;
}

type Phase = 'start' | 'assess' | 'diagnosis' | 'challenge' | 'teach-back' | 'feedback';

export const LearningLoopView: React.FC<LearningLoopViewProps> = ({
  onBack,
  studentName: _studentName = "Scholar",
}) => {
  const [phase, setPhase] = useState<Phase>('start');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);

  // Phase 1: Assess
  const [questions, setQuestions] = useState<LoopQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // Phase 2: Diagnosis
  const [diagnosis, setDiagnosis] = useState<LoopDiagnosis | null>(null);

  // Phase 3: Challenge
  const [challenge, setChallenge] = useState<LoopChallenge | null>(null);
  const [researchNotes, setResearchNotes] = useState('');

  // Phase 4: Teach-Back
  const [teachBackText, setTeachBackText] = useState('');
  const [critiqueChecked, setCritiqueChecked] = useState<Record<string, boolean>>({});
  const [shakyAreas, setShakyAreas] = useState('');

  // Phase 5: Feedback & Report
  const [feedback, setFeedback] = useState<LoopFeedback | null>(null);

  // Dynamic status/progress bars
  const phasesOrder: Phase[] = ['assess', 'diagnosis', 'challenge', 'teach-back', 'feedback'];
  const getPhaseNumber = (current: Phase) => phasesOrder.indexOf(current) + 1;

  // 1. Initialize Loop & Start Assessment
  const handleStartLoop = async (selectedTopic?: string) => {
    const finalTopic = selectedTopic || topic.trim();
    if (!finalTopic) return;
    setTopic(finalTopic);
    setLoading(true);
    setError(null);

    try {
      const data = await generateAssessment(finalTopic);
      setQuestions(data.questions || []);
      setPhase('assess');
    } catch (e) {
      console.error(e);
      setError("Unable to initiate loop. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Submit Assessment & Get Diagnosis Gaps
  const handleSubmitAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const answersPayload = questions.map(q => ({
        question: q.question,
        answer: answers[q.id] || ''
      }));

      const diagData = await generateDiagnosis(topic, answersPayload);
      setDiagnosis(diagData);

      // Hydrate custom checklist
      const initialChecked: Record<string, boolean> = {};
      if (diagData.critiqueQuestions) {
        diagData.critiqueQuestions.forEach((q: string, i: number) => {
          initialChecked[`q-${i}`] = false;
        });
      }
      setCritiqueChecked(initialChecked);

      setPhase('diagnosis');
    } catch (e) {
      console.error(e);
      setError("Diagnosis analysis failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Initiate Challenge phase
  const handleStartChallenge = async () => {
    if (!diagnosis) return;
    setLoading(true);
    setError(null);
    try {
      const answersPayload = questions.map(q => ({
        question: q.question,
        answer: answers[q.id] || ''
      }));

      const chalData = await generateChallenge(
        topic, 
        diagnosis.gap, 
        diagnosis.established || [], 
        answersPayload
      );
      setChallenge(chalData);
      setPhase('challenge');
    } catch (e) {
      console.error(e);
      setError("Challenge construction failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Submit Teach-Back & Get Feedback Loop
  const handleSubmitTeachBack = async () => {
    if (!diagnosis) return;
    setLoading(true);
    setError(null);
    try {
      // Gather checklist notes
      const checklistNotes = diagnosis.critiqueQuestions
        ?.map((q: string, i: number) => `- [${critiqueChecked[`q-${i}`] ? 'x' : ' '}] ${q}`)
        .join('\n') || '';

      const combinedCritique = `${checklistNotes}\n\nAreas flagged as shaky:\n${shakyAreas}`;

      const feedData = await generateFeedback(
        topic,
        teachBackText,
        combinedCritique,
        researchNotes
      );
      setFeedback(feedData);
      setPhase('feedback');
    } catch (e) {
      console.error(e);
      setError("Final loop critique failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Print / PDF active learning summary
  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    setPhase('start');
    setTopic('');
    setQuestions([]);
    setAnswers({});
    setDiagnosis(null);
    setChallenge(null);
    setResearchNotes('');
    setTeachBackText('');
    setCritiqueChecked({});
    setShakyAreas('');
    setFeedback(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left print:p-0">
      
      {/* Title Header Viewport */}
      <div className="print:hidden">
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          ← Back to Practice Center
        </button>
        <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">The Learning Loop</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
          An advanced, active 5-phase learning cycle designed to move from initial knowledge checks to conceptual mastery through guided teaching.
        </p>
      </div>

      {/* Progress indicators */}
      {phase !== 'start' && (
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 flex items-center justify-between flex-wrap gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black text-xs font-rounded">
              {getPhaseNumber(phase)}
            </span>
            <div>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Active Loop Cycle</p>
              <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded capitalize">Phase: {phase.replace('-', ' ')}</h4>
            </div>
          </div>
          
          <div className="flex gap-2">
            {phasesOrder.map((p, idx) => {
              const isActive = phase === p;
              const isPast = getPhaseNumber(phase) > idx + 1;
              return (
                <div 
                  key={p} 
                  className={`h-2.5 rounded-full transition-all ${isActive ? 'w-16 bg-indigo-600 dark:bg-[#818CF8]' : isPast ? 'w-8 bg-indigo-500/30' : 'w-4 bg-slate-200 dark:bg-slate-800'}`}
                  title={`Phase ${idx + 1}: ${p.replace('-', ' ')}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Bento content wrapper */}
      <div className="min-h-[25rem] bg-white dark:bg-[#15171C] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-10 shadow-sm relative overflow-hidden">
        
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-[#15171C]/70 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Consulting Socratic Pedagogical engine...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          
          {/* Phase 0: Topic Starter */}
          {phase === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">What do you want to master today?</h3>
                <p className="text-slate-400 text-xs max-w-xl leading-relaxed">
                  Enter any complex scientific concept, mechanism, or topic. We'll guide you through diagnostic tests, hands-on tasks, and explain-back cycles.
                </p>
              </div>

              <div className="max-w-xl flex gap-3">
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="e.g., Cellular Respiration, Tectonic Subduction, Kepler's Laws..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-xs font-bold text-[#1A1C21] dark:text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleStartLoop()}
                  disabled={!topic.trim()}
                  className="btn-squishy px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md flex items-center gap-1.5 disabled:opacity-40"
                >
                  Start Loop <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Curated starters */}
              <div className="space-y-3 pt-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Suggested science loops</span>
                <div className="flex gap-2 flex-wrap">
                  {['Photosynthesis Mechanisms', 'Covalent & Ionic Bonding', 'Natural Selection & Adaptations', 'Newtonian Kinematics'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStartLoop(s)}
                      className="px-4 py-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Phase 1: Assess */}
          {phase === 'assess' && (
            <motion.div 
              key="assess"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Phase 1: Pre-knowledge checks</span>
                <h3 className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Initial Socratic Appraisal</h3>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xl">
                  Before we begin, help your mascot companion evaluate your current familiarity with <strong className="text-[#1A1C21] dark:text-white">{topic}</strong>. No stress!
                </p>
              </div>

              <div className="space-y-6 max-w-2xl">
                {questions.map(q => (
                  <div key={q.id} className="space-y-2">
                    <label className="text-xs font-black text-slate-500 dark:text-slate-400 block">{q.question}</label>
                    <textarea
                      value={answers[q.id] || ''}
                      onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                      placeholder={q.placeholder}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-[#1A1C21] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none min-h-[70px]"
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmitAssessment}
                className="btn-squishy px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md flex items-center gap-1.5"
              >
                Submit and Analyze Gaps <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Phase 2: Diagnosis */}
          {phase === 'diagnosis' && diagnosis && (
            <motion.div 
              key="diagnosis"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Phase 2: Diagnostic Gap Analysis</span>
                <h3 className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Your Study Path</h3>
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 max-w-prose">
                  <p className="text-xs font-black text-amber-600 dark:text-amber-400 font-rounded flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 shrink-0" /> Target Knowledge Gap:
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1.5 leading-relaxed">
                    {diagnosis.gap}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {/* established parts */}
                <div className="bento-card border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                  <h4 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Your Established Foundation</h4>
                  <ul className="space-y-3">
                    {diagnosis.established?.map((est: string, i: number) => (
                      <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-[#1A1C21] dark:text-white">{est}</strong>: {diagnosis.establishedExplanations?.[i]}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* mentor advice */}
                <div className="bento-card border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4 bg-indigo-500/[0.01]">
                  <div>
                    <h4 className="text-xs font-black text-indigo-500 font-rounded uppercase tracking-widest">Mentor Appraisal</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold italic mt-3">
                      "{diagnosis.mentorMessage}"
                    </p>
                  </div>
                  
                  <div className="p-3 bg-indigo-500/10 rounded-xl text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-snug">
                    <span className="font-black text-indigo-500 uppercase tracking-widest block mb-1">Target Milestone:</span>
                    {diagnosis.nextMilestone}: {diagnosis.nextMilestoneDescription}
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartChallenge}
                className="btn-squishy px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md flex items-center gap-1.5"
              >
                Construct Challenge and Research <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Phase 3: Challenge */}
          {phase === 'challenge' && challenge && (
            <motion.div 
              key="challenge"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Phase 3: Concept Challenge</span>
                <h3 className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">{challenge.brief}</h3>
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 max-w-prose">
                  <p className="text-xs font-black text-indigo-500 font-rounded flex items-center gap-1.5">
                    <Award className="w-4 h-4 shrink-0" /> Research Challenge Task:
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-bold mt-1.5 leading-relaxed">
                    {challenge.taskDescription}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                {/* learning links */}
                <div className="lg:col-span-1 bento-card border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                  <h4 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Suggested Learning Resources</h4>
                  <div className="space-y-3.5">
                    {challenge.resources?.map((r, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1">
                        <span className="px-2 py-0.5 text-[8px] font-black uppercase rounded bg-indigo-500/10 text-indigo-500">{r.type}</span>
                        <h5 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded mt-1.5">{r.title}</h5>
                        <p className="text-[10px] text-slate-400 leading-normal">{r.description}</p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 bg-amber-500/[0.04] border border-amber-500/10 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-normal">
                    <span className="font-black text-amber-500 block mb-1">Mentor Hint:</span>
                    {challenge.hint}
                  </div>
                </div>

                {/* notes editor */}
                <div className="lg:col-span-2 bento-card border border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Your Research Workspace</h4>
                    <p className="text-[10px] text-slate-400">Jot down facts, descriptions, and mechanism notes from your exploration.</p>
                  </div>
                  <textarea
                    value={researchNotes}
                    onChange={e => setResearchNotes(e.target.value)}
                    placeholder="Capture key concepts and notes here as you search..."
                    className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold text-[#1A1C21] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none min-h-[220px]"
                  />
                </div>
              </div>

              <button
                onClick={() => setPhase('teach-back')}
                className="btn-squishy px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md flex items-center gap-1.5"
              >
                Proceed to Teach-Back <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Phase 4: Teach-Back */}
          {phase === 'teach-back' && diagnosis && (
            <motion.div 
              key="teach-back"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Phase 4: Teach-Back & Critique</span>
                <h3 className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Explain it simply</h3>
                <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 max-w-prose text-xs font-bold text-slate-600 dark:text-slate-400 leading-normal">
                  <span className="font-black text-indigo-500 block mb-1">Your Prompt Checklist Target:</span>
                  {diagnosis.teachBackFocus}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* teach back input */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  <div className="bento-card border border-slate-100 dark:border-slate-800 p-5 flex-1 flex flex-col gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Socratic Explanation</h4>
                      <p className="text-[10px] text-slate-400">Explain the concept simply in your own words, as if teaching a child. Avoid jargon.</p>
                    </div>
                    <textarea
                      value={teachBackText}
                      onChange={e => setTeachBackText(e.target.value)}
                      placeholder="Write your simplified explanation..."
                      className="flex-1 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs font-bold text-[#1A1C21] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none min-h-[300px]"
                    />
                  </div>
                </div>

                {/* checklist and shaky areas */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                  {/* custom checklist */}
                  <div className="bento-card border border-slate-100 dark:border-slate-800 p-5 space-y-4">
                    <h4 className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-indigo-500" /> Tailored Self-Critique
                    </h4>
                    <div className="space-y-3">
                      {diagnosis.critiqueQuestions?.map((q: string, i: number) => {
                        const checked = !!critiqueChecked[`q-${i}`];
                        return (
                          <label key={i} className="flex items-start gap-3 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={e => setCritiqueChecked(prev => ({ ...prev, [`q-${i}`]: e.target.checked }))}
                              className="mt-0.5 rounded border-slate-350 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-normal">{q}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* shaky points */}
                  <div className="bento-card border border-rose-100 dark:border-rose-950/20 p-5 space-y-3 bg-rose-500/[0.01] flex-1">
                    <h4 className="text-xs font-black text-rose-500 font-rounded">Where are you still shaky?</h4>
                    <p className="text-[10px] text-slate-400 leading-normal">Jot down any parts where you had to guess or felt unsure of the science.</p>
                    <textarea
                      value={shakyAreas}
                      onChange={e => setShakyAreas(e.target.value)}
                      placeholder="e.g., I'm still not 100% sure about the gradient dynamics..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs font-bold text-[#1A1C21] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-500 resize-none min-h-[90px]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitTeachBack}
                className="btn-squishy px-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md flex items-center gap-1.5"
              >
                Submit and Get Feedback <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Phase 5: Feedback / Summary Loop Report */}
          {phase === 'feedback' && feedback && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 print:space-y-6"
            >
              {/* Report Header */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800/60 pb-5">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Phase 5: Diagnostic Mentor Report</span>
                  <h3 className="text-2xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Mastery Assessment</h3>
                  <p className="text-xs text-indigo-600 dark:text-[#818CF8] font-black font-rounded">"{feedback.headline}"</p>
                </div>

                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={handlePrint}
                    className="btn-squishy px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4" /> Print / Export PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="btn-squishy px-4 py-2.5 bg-indigo-600 dark:bg-[#818CF8] text-white dark:text-slate-900 rounded-xl text-xs font-black hover:opacity-90 shadow-sm flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-4 h-4" /> Review New Topic
                  </button>
                </div>
              </div>

              {/* Loop analysis details */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                
                {/* mentor feedback */}
                <div className="md:col-span-8 bento-card border border-slate-100 dark:border-slate-800 p-6 space-y-4 bg-slate-50/[0.2] dark:bg-slate-900/[0.05]">
                  <h4 className="text-xs font-black text-indigo-500 font-rounded uppercase tracking-widest">Mentor Evaluation</h4>
                  <div className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-bold">
                    <MarkdownRenderer content={feedback.reflection || ''} />
                  </div>
                  <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-2xl text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-normal italic">
                    <span className="font-black text-emerald-500 block mb-1">Celebration Note:</span>
                    {feedback.celebrationMessage}
                  </div>
                </div>

                {/* scorecard wins / gaps */}
                <div className="md:col-span-4 flex flex-col gap-6">
                  {/* Wins */}
                  <div className="bento-card border border-emerald-100 dark:border-emerald-950/20 p-5 space-y-3 bg-emerald-500/[0.01]">
                    <h4 className="text-xs font-black text-emerald-500 font-rounded">Conceptual Wins</h4>
                    <ul className="space-y-2">
                      {feedback.wins?.map((win: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs leading-normal text-slate-500 dark:text-slate-400 font-bold">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          {win}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Growth Areas */}
                  <div className="bento-card border border-amber-100 dark:border-amber-950/20 p-5 space-y-3 bg-amber-500/[0.01] flex-1">
                    <h4 className="text-xs font-black text-amber-500 font-rounded">Opportunities for Depth</h4>
                    <ul className="space-y-2">
                      {feedback.growthAreas?.map((g: string, i: number) => (
                        <li key={i} className="flex gap-2 text-xs leading-normal text-slate-500 dark:text-slate-400 font-bold">
                          <span className="text-amber-500 shrink-0 mt-0.5">•</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* printable overview section */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                <div>
                  <h4 className="text-xs font-black text-indigo-500 font-rounded uppercase tracking-widest">Natural Next Step</h4>
                  <p className="text-xs text-slate-700 dark:text-slate-350 font-black mt-2 leading-relaxed font-rounded">
                    Next Gap: {feedback.nextGap}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-normal mt-1 italic">
                    {feedback.nextGapReason}
                  </p>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
};
