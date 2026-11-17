import React, { useState, useEffect } from 'react';
import { COURSES } from '../constants/apCourses';
import { 
  Target, 
  PenTool, 
  BarChart2, 
  Clock, 
  MessageSquare, 
  Calculator, 
  Zap, 
  Layers, 
  Brain, 
  FlaskConical, 
  Camera, 
  Search, 
  Play, 
  Gamepad2,
  ClipboardList,
  BookOpen,
  Award,
  Scale,
  GraduationCap,
  HelpCircle
} from 'lucide-react';

const renderModeIcon = (iconKey: string, className = "w-6 h-6") => {
  switch (iconKey) {
    case 'target': return <Target className={className} />;
    case 'pen-tool': return <PenTool className={className} />;
    case 'bar-chart': return <BarChart2 className={className} />;
    case 'clock': return <Clock className={className} />;
    case 'message-square': return <MessageSquare className={className} />;
    case 'calculator': return <Calculator className={className} />;
    case 'zap': return <Zap className={className} />;
    case 'layers': return <Layers className={className} />;
    case 'brain': return <Brain className={className} />;
    case 'flask': return <FlaskConical className={className} />;
    case 'camera': return <Camera className={className} />;
    case 'search': return <Search className={className} />;
    case 'play': return <Play className={className} />;
    case 'gamepad': return <Gamepad2 className={className} />;
    case 'clipboard-list': return <ClipboardList className={className} />;
    case 'book-open': return <BookOpen className={className} />;
    case 'award': return <Award className={className} />;
    case 'scale': return <Scale className={className} />;
    case 'graduation-cap': return <GraduationCap className={className} />;
    case 'help-circle': return <HelpCircle className={className} />;
    default: return null;
  }
};

interface PracticeCenterViewProps {
  onBack: () => void;
  onStart: () => void;
  onStartExplanation: () => void;
  onStartFlashcards: () => void;
  onOpenDocumentCreator: () => void;
  onStartFRQ: () => void;
  onStartCER: () => void;
  onStartQuizMyNotes: () => void;
  onStartCalculation: () => void;
  onStartLab: () => void;
  onStartMotionTracker?: () => void;
  onStartResearch: () => void;
  onStartRubricTranslator: () => void;
  onStartInterview: () => void;
  onOpenReviewGames?: () => void;
  onStartStudySprint?: () => void;
  onStartReflection?: () => void;
  onOpenSimulationsHub?: () => void;
  onStartApReview?: () => void;
  onStartLearningLoop?: () => void;
  onStartConceptMap?: () => void;
  onStartDiagramLabeling?: () => void;
  onStartSkeptic?: () => void;
  onStartTutor?: () => void;
  onStartSocratic?: () => void;
  onStartGrowthCoach?: () => void;
  teacherMode: boolean;
  hasActiveStudySprint?: boolean;
  
  // Tab selection props
  initialTab?: TabType;
  onTabChange?: (tab: TabType) => void;

  // Custom starred mode props
  starredModes?: string[];
  onToggleStarMode?: (mode: string) => void;
}

type TabType = 'practice' | 'study' | 'lab' | 'interactives';

export const PracticeCenterView: React.FC<PracticeCenterViewProps> = ({
  onBack,
  onStart,
  onStartExplanation,
  onStartFlashcards,
  onOpenDocumentCreator: _onOpenDocumentCreator,
  onStartFRQ,
  onStartCER,
  onStartQuizMyNotes,
  onStartCalculation,
  onStartLab,
  onStartMotionTracker,
  onStartResearch,
  onStartRubricTranslator: _onStartRubricTranslator,
  onStartInterview: _onStartInterview,
  onOpenReviewGames,
  onStartStudySprint,
  onStartReflection,
  onOpenSimulationsHub,
  onStartApReview,
  onStartLearningLoop,
  onStartConceptMap,
  onStartDiagramLabeling,
  onStartSkeptic,
  onStartTutor,
  onStartSocratic,
  onStartGrowthCoach,
  teacherMode: _teacherMode,
  hasActiveStudySprint = false,
  initialTab = 'practice',
  onTabChange,
  
  // Starring defaults
  starredModes = [],
  onToggleStarMode,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- sync only when the parent changes the tab; reading activeTab here would undo the student's own tab clicks.
  }, [initialTab]);

  const tabs: { id: TabType; label: string; icon: string; visible: boolean }[] = [
    { id: 'practice', label: 'Practice & Assess', icon: 'clipboard-list', visible: true },
    { id: 'study', label: 'Study & Review', icon: 'book-open', visible: true },
    { id: 'lab', label: 'Lab & Research', icon: 'flask', visible: true },
    { id: 'interactives', label: 'Interactives & Games', icon: 'gamepad', visible: true },
  ];

  const renderStarButton = (modeId: string) => {
    if (!onToggleStarMode) return null;
    const isStarred = starredModes.includes(modeId);
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // Avoid triggering card launch when starring
          onToggleStarMode(modeId);
        }}
        className={`absolute top-5 right-5 p-2 rounded-xl transition-all border z-10 ${
          isStarred
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-850 text-slate-400 hover:text-amber-500 hover:scale-110'
        }`}
        title={isStarred ? "Remove from home favorites" : "Add to home favorites"}
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </button>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      {/* Visor Header */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          ← Back to Dashboard
        </button>
        <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Practice Center</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
          Your centralized learning hub. Star your favorite study aids or practice categories to pin them directly to your homepage for quick access!
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-100 dark:border-slate-800/60 pb-3 flex-wrap">
        {tabs
          .filter(t => t.visible)
          .map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                onTabChange?.(tab.id);
              }}
              className={`px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border ${
                activeTab === tab.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-900/15 dark:bg-[#818CF8] dark:border-[#818CF8] dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{renderModeIcon(tab.icon, "w-4 h-4")}</span>
              <span className="font-rounded">{tab.label}</span>
            </button>
          ))}
      </div>

      {/* Tab Contents */}
      <div className="mt-8">
        {activeTab === 'practice' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Adaptive Session */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 dark:hover:border-[#818CF8]/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStart}
            >
              {renderStarButton('quiz')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('target', "w-6 h-6 text-indigo-600 dark:text-[#818CF8]")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-[#818CF8] pr-12">
                  Adaptive MCQ & Short Answer
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-indigo-600 dark:group-hover:text-[#818CF8] transition-colors font-rounded">
                  Adaptive Practice Session
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Engage with AI-generated multiple choice and short answer questions tailored to your performance level with instant feedback.
                </p>
              </div>
            </div>

            {/* Written Response (FRQ) */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartFRQ}
            >
              {renderStarButton('frq')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('pen-tool', "w-6 h-6 text-amber-600 dark:text-amber-400")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 pr-12">
                  AP-Style FRQ Assessment
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                  Written Response (FRQ)
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Draft detailed long-form qualitative arguments and experimental layouts graded in real-time against strict board rubrics.
                </p>
              </div>
            </div>

            {/* Data Analysis (CER) */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-teal-500/40 dark:hover:border-teal-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartCER}
            >
              {renderStarButton('cer')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('bar-chart', "w-6 h-6 text-teal-600 dark:text-teal-400")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 pr-12">
                  Claim-Evidence-Reasoning
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors font-rounded">
                  Data Analysis Scenario (C.E.R.)
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Analyze charts, data matrices, and scientific observations to construct a logical scientific claim supported by data and reasoning.
                </p>
              </div>
            </div>

            {/* Study Sprint */}
            {onStartStudySprint && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative animate-in fade-in"
                onClick={onStartStudySprint}
              >
                {renderStarButton('study_sprint')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('clock', "w-6 h-6 text-emerald-600 dark:text-emerald-400")}
                  </div>
                  <div className="flex items-center gap-2 pr-12">
                    {hasActiveStudySprint && (
                      <span className="px-2 py-0.5 text-[8px] font-black bg-rose-500/20 text-rose-500 dark:text-rose-400 rounded-md uppercase tracking-wider animate-pulse">
                        Active
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Multi-Task Roadmap
                    </span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors font-rounded">
                    {hasActiveStudySprint ? 'Resume Study Sprint' : 'Create a Study Sprint'}
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Set a focused 3-step task roadmap combining interactive studies and quizzes, generating a diagnostic proficiency profile.
                  </p>
                </div>
              </div>
            )}

            {/* Advanced Study Buddy */}
            {onStartApReview && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-violet-500/40 dark:hover:border-violet-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative animate-in fade-in"
                onClick={onStartApReview}
              >
                {renderStarButton('ap_review_catalog')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('brain', "w-6 h-6 text-violet-600 dark:text-violet-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 pr-12">
                    AP &amp; IB Review
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors font-rounded">
                    Advanced Study Buddy
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Review core concepts across {COURSES.length} AP and IB courses, aligned strictly with official CED and subject-guide scope.
                  </p>
                </div>
              </div>
            )}

            {/* The Learning Loop */}
            {onStartLearningLoop && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative animate-in fade-in"
                onClick={onStartLearningLoop}
              >
                {renderStarButton('learning_loop')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('layers', "w-6 h-6 text-emerald-600 dark:text-emerald-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 pr-12">
                    5-Phase Conceptual Mastery
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors font-rounded">
                    The Learning Loop
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Master any topic via 5 active steps: Socratic assess checks, gap connection diagnosis, challenge research, and critique teach-backs.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'study' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Concept Map Builder */}
            {onStartConceptMap && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-violet-500/40 dark:hover:border-violet-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartConceptMap}
              >
                {renderStarButton('concept_map')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('network', "w-6 h-6 text-violet-600 dark:text-violet-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 pr-12">
                    Concept Web
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors font-rounded">
                    Concept Map Builder
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Build interactive relational concept webs with directional linking propositions, AI-powered semantic audits, and Mermaid diagram export.
                  </p>
                </div>
              </div>
            )}

            {/* Diagram Labeling */}
            {onStartDiagramLabeling && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartDiagramLabeling}
              >
                {renderStarButton('diagram_labeling')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('image', "w-6 h-6 text-emerald-600 dark:text-emerald-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 pr-12">
                    Visual Recall
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors font-rounded">
                    Diagram Labeling
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Test and reinforce anatomical, cellular, and physical schematic mastery with interactive pins, word bank matching, and instant feedback.
                  </p>
                </div>
              </div>
            )}

            {/* Socratic Explanation Chat */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-teal-500/40 dark:hover:border-teal-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartExplanation}
            >
              {renderStarButton('explanation')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-teal-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('message-square', "w-6 h-6 text-teal-600 dark:text-teal-400")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 pr-12">
                  Dialogue Tutor
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors font-rounded">
                  Explanation Partner (Socratic Chat)
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Engage in a friendly, socratic dialog session. Ask questions, clarify difficult concepts, and work through examples with your AI study companion.
                </p>
              </div>
            </div>

            {/* Step-by-Step Math Partner */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-violet-500/40 dark:hover:border-violet-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartCalculation}
            >
              {renderStarButton('calculation')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('calculator', "w-6 h-6 text-violet-600 dark:text-violet-400")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 pr-12">
                  Equation Solver
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors font-rounded">
                  Calculation Partner
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Input physics equations, chemistry stoichiometry ratios, or mathematical models to get interactive step-by-step guidance.
                </p>
              </div>
            </div>

            {/* Smart Scanner */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 dark:hover:border-indigo-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartQuizMyNotes}
            >
              {renderStarButton('quiz_my_notes')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('zap', "w-6 h-6 text-indigo-600 dark:text-indigo-400")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-450 pr-12">
                  Notes Transcriber
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors font-rounded">
                  Smart Scanner (Quiz My Notes)
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Upload photos or text files of handwritten class lectures to instantly extract key terms, summaries, and customized study sets.
                </p>
              </div>
            </div>

            {/* Flashcards */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-pink-500/40 dark:hover:border-pink-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartFlashcards}
            >
              {renderStarButton('flashcards')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('layers', "w-6 h-6 text-pink-600 dark:text-pink-400")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 pr-12">
                  Recall Deck
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors font-rounded">
                  Flashcard Study Decks
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Study quick-recall vocabulary and key formulas using interactive flipping flashcards powered by spaced-repetition logic.
                </p>
              </div>
            </div>

            {/* Metacognition Reflection */}
            {onStartReflection && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-orange-500/40 dark:hover:border-orange-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartReflection}
              >
                {renderStarButton('reflection')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('brain', "w-6 h-6 text-orange-600 dark:text-orange-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 pr-12">
                    Self-Evaluation
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors font-rounded">
                    Metacognition Reflection
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Review your progress, evaluate study strengths and learning gaps, and receive suggestions for optimal next science modules.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lab' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lab Co-Pilot */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartLab}
            >
              {renderStarButton('lab')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('flask', "w-6 h-6 text-emerald-600 dark:text-emerald-400")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 pr-12">
                  Interactive Lab Assistant
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors font-rounded">
                  Lab Co-Pilot
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Design lab investigations, write protocols, plot quantitative graphs, and calculate margins of error inside a dedicated sandbox environment.
                </p>
              </div>
            </div>

            {/* Kinematics Video Lab */}
            {onStartMotionTracker && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-coral/40 dark:hover:border-coral/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartMotionTracker}
              >
                {renderStarButton('motion_tracker')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-coral/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('camera', "w-6 h-6 text-rose-600 dark:text-coral")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-coral/10 text-rose-600 dark:text-coral pr-12">
                    Video Mechanics
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-rose-500 dark:group-hover:text-coral transition-colors font-rounded">
                    Kinematics Motion Tracker
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Track dynamic falling coordinates, evaluate gravity constants, and plot real-time trajectory curves from science videos.
                  </p>
                </div>
              </div>
            )}

            {/* Research Project */}
            <div
              className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-skyBlue/40 dark:hover:border-[#818CF8]/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
              onClick={onStartResearch}
            >
              {renderStarButton('research')}
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-skyBlue/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                  {renderModeIcon('search', "w-6 h-6 text-sky-600 dark:text-skyBlue")}
                </div>
                <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-skyBlue/10 text-sky-600 dark:text-skyBlue pr-12">
                  Literature Reviewer
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-sky-500 dark:group-hover:text-[#818CF8] transition-colors font-rounded">
                  Research Project Assistant
                </h3>
                <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                  Receive structured assistance for academic biology/chemistry inquiry projects, draft abstracts, and analyze sources.
                </p>
              </div>
            </div>

            {/* The Skeptic (AI Peer Review Partner) */}
            {onStartSkeptic && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-rose-500/40 dark:hover:border-rose-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartSkeptic}
              >
                {renderStarButton('skeptic')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('scale', "w-6 h-6 text-rose-600 dark:text-rose-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 pr-12">
                    Pre-Lab Defense
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors font-rounded">
                    The Skeptic (Peer Review)
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Defend your experimental design against an AI peer reviewer probing for hidden confounding variables, control flaws, and measurement uncertainties.
                  </p>
                </div>
              </div>
            )}

            {/* AI Science Tutor */}
            {onStartTutor && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 dark:hover:border-emerald-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartTutor}
              >
                {renderStarButton('tutor')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('graduation-cap', "w-6 h-6 text-emerald-600 dark:text-emerald-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 pr-12">
                    Step-by-Step
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors font-rounded">
                    AI Science Tutor
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Step-by-step calculation partner with dimensional analysis checks and an interactive mathematical scratchpad.
                  </p>
                </div>
              </div>
            )}

            {/* AI Socratic Guide */}
            {onStartSocratic && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-violet-500/40 dark:hover:border-violet-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartSocratic}
              >
                {renderStarButton('socratic')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('help-circle', "w-6 h-6 text-violet-600 dark:text-violet-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 pr-12">
                    Dialectic Inquiry
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors font-rounded">
                    AI Socratic Guide
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Explore scientific paradoxes and first principles through dialectic inquiry and reasoning depth evaluation.
                  </p>
                </div>
              </div>
            )}

            {/* AI Growth Coach */}
            {onStartGrowthCoach && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 dark:hover:border-amber-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onStartGrowthCoach}
              >
                {renderStarButton('growth_coach')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('award', "w-6 h-6 text-amber-600 dark:text-amber-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 pr-12">
                    Metacognitive
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">
                    AI Growth Coach
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Transform exam mistakes and study blocks into mastery with evidence-based error taxonomy diagnostics.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'interactives' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Simulations Hub */}
            {onOpenSimulationsHub && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-violet-500/40 dark:hover:border-violet-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onOpenSimulationsHub}
              >
                {renderStarButton('simulations_hub')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('play', "w-6 h-6 text-violet-600 dark:text-violet-455")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-450 pr-12">
                    Simulators & Builders
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-violet-500 dark:group-hover:text-[#818CF8] transition-colors font-rounded">
                    Interactives Lab Hub
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Interactive simulations for covalent/ionic bonding builders, periodic tables, ecosystems, genetics, and thermodynamic phase change curves.
                  </p>
                </div>
              </div>
            )}

            {/* Review Games */}
            {onOpenReviewGames && (
              <div
                className="bento-card border border-slate-100 dark:border-slate-800/80 hover:border-pink-500/40 dark:hover:border-pink-400/40 flex flex-col justify-between gap-6 min-h-[13rem] group cursor-pointer relative"
                onClick={onOpenReviewGames}
              >
                {renderStarButton('review_games')}
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform select-none">
                    {renderModeIcon('gamepad', "w-6 h-6 text-pink-600 dark:text-pink-400")}
                  </div>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400 pr-12">
                    Class Games
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-pink-500 dark:group-hover:text-pink-400 transition-colors font-rounded">
                    Review Games Hub
                  </h3>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                    Play scientific revision games like Jeopardy, Bingo, Taboo, and Who Am I to practice vocabulary and recall with friends!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
