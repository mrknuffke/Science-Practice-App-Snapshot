import React, { useState, useEffect } from 'react';
import { MODES_METADATA } from '../constants/modesRegistry';
import { getBadgesFromStorage, getStreakInfo } from '../services/storageService';
import ContactModal from './ContactModal';
import { getSubject, getTheme } from '../hooks/useTheme';
import { getRandomCourseAndTopic } from '../constants';
import { ViewType, CourseType } from '../types';
import { getTextbookProgressSummary } from '../utils/textbookProgress';
import { Compass } from 'lucide-react';
import { renderModeIcon } from './landing/renderModeIcon';
import { WelcomeHeroTile } from './landing/WelcomeHeroTile';
import { DailyMissionCard } from './landing/DailyMissionCard';
import { CourseTextsSection } from './landing/CourseTextsSection';
import { OnboardingModal } from './landing/OnboardingModal';
import { ProfileSetupModal, PROFILE_DONE_KEY, type UserRole } from './landing/ProfileSetupModal';

export { renderModeIcon };

export interface LandingPageProps {
  onStart: (course?: string, topic?: string) => void;
  onCustomStart: (topic: string) => void;
  onShowHowItWorks: () => void;
  onOpenFeatures?: () => void;
  onOpenTeachers?: () => void;
  onOpenSupport?: () => void;
  onStartExplanation: (course?: string, topic?: string) => void;
  onStartConceptMap?: () => void;
  onStartDiagramLabeling?: () => void;
  onStartSkeptic?: () => void;
  onStartTutor?: () => void;
  onStartSocratic?: () => void;
  onStartGrowthCoach?: () => void;
  onStartFlashcards: (course?: string, topic?: string) => void;
  onStartWorksheet?: () => void;
  onOpenDocumentCreator: () => void;
  onStartFRQ: (course?: string, topic?: string) => void;
  onStartCER: (course?: string, topic?: string) => void;
  onStartCalculation: (course?: string, topic?: string) => void;
  onStartQuizMyNotes: () => void;
  onFeedback: () => void;
  onOpenTrophyRoom: () => void;
  onOpenSessionHistory: () => void;
  onOpenChangelog: () => void;
  onStartLab: () => void;
  onStartMotionTracker?: () => void;
  onStartResearch: () => void;
  onStartMultiMode: () => void;
  onStartRubricTranslator: () => void;
  onStartInterview: () => void;
  onOpenReviewGames?: () => void;
  onStartStudySprint?: () => void;
  onStartReflection?: () => void;
  hasActiveStudySprint?: boolean;
  isLoading?: boolean;
  accessibilityMode?: boolean;
  onToggleAccessibility?: () => void;
  onOpenSimulationsHub?: () => void;
  teacherMode?: boolean;
  onToggleTeacherMode?: () => void;
  onSetRole?: (role: UserRole) => void;
  
  // Custom personalization props
  username?: string;
  onChangeUsername?: (name: string) => void;
  starredSubjects?: string[];
  onOpenSubjectLibrary?: () => void;
  onSelectSubject?: (course: string) => void;
  
  // Starring modes props
  starredModes?: string[];
  onToggleStarMode?: (mode: string) => void;
  onOpenPracticeCenter?: () => void;
  mascot?: 'robot' | 'beaker' | 'plant' | 'gerbil';
  onGetAIAdvisorResponse?: (prompt: string, history?: Array<{ role: string; text: string }>) => Promise<string>;
  onStartApReview?: () => void;
  onStartLearningLoop?: () => void;
  onOpenSettings?: () => void;
  onOpenSimulation?: (view: ViewType) => void;
  onSetDarkMode?: (value: boolean) => void;
  onSetMascot?: (value: 'robot' | 'beaker' | 'plant' | 'gerbil') => void;
}



const getCourseDescription = (course: string): string => {
  if (course.includes('AP ')) return 'Rigorous Advanced Placement standard curriculum preparation and scoring practice.';
  if (course.includes('Honors ')) return 'Deep conceptual extensions, challenging quantitative tasks, and active models.';
  if (course.includes('General ')) return 'Comprehensive fundamental principles, everyday analogies, and clear tutorials.';
  if (course === 'Anatomy and Physiology') return 'Study body structures, organs, skeletal systems, and regulatory homeostasis functions.';
  if (course === 'Marine Biology') return 'Explore ocean water habitats, coral ecosystems, marine organisms, and biodiversity.';
  if (course === 'Biotechnology') return 'Explore genetic molecular engineering, CRISPR gene editing tools, and clinical lab techniques.';
  if (course === 'Forensic Science') return 'Solve crime scenes using DNA extraction analysis, fingerprint chromatography, and trace evidence.';
  return 'Curriculum-aligned science practices, adaptive tutorials, and real-time AI feedback.';
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onStart,
  onCustomStart,
  onShowHowItWorks,
  onOpenFeatures,
  onOpenTeachers: _onOpenTeachers,
  onOpenSupport,
  onStartExplanation,
  onStartConceptMap,
  onStartDiagramLabeling,
  onStartSkeptic,
  onStartTutor,
  onStartSocratic,
  onStartGrowthCoach,
  onStartFlashcards,
  onStartWorksheet: _onStartWorksheet,
  onOpenDocumentCreator: _onOpenDocumentCreator,
  onStartFRQ,
  onStartCER,
  onStartCalculation,
  onStartQuizMyNotes,
  onFeedback: _onFeedback,
  onOpenTrophyRoom,
  onOpenSessionHistory: _onOpenSessionHistory,
  onOpenChangelog,
  onStartLab,
  onStartMotionTracker,
  onStartResearch,
  onStartMultiMode: _onStartMultiMode,
  onStartRubricTranslator: _onStartRubricTranslator,
  onStartInterview: _onStartInterview,
  onOpenReviewGames,
  onStartStudySprint,
  onStartReflection,
  hasActiveStudySprint: _hasActiveStudySprint,
  isLoading,
  accessibilityMode: _accessibilityMode = false,
  onToggleAccessibility: _onToggleAccessibility,
  onOpenSimulationsHub,
  teacherMode: _teacherMode = false,
  onToggleTeacherMode: _onToggleTeacherMode,
  
  // Fallback defaults
  username = '',
  onChangeUsername,
  starredSubjects = ['AP Biology', 'AP Chemistry', 'AP Physics 1'],
  onOpenSubjectLibrary,
  onSelectSubject,
  
  // Starring modes defaults
  starredModes = ['explanation', 'calculation', 'quiz_my_notes', 'study_sprint'],
  onToggleStarMode: _onToggleStarMode,
  onOpenPracticeCenter,
  mascot = 'robot',
  onGetAIAdvisorResponse,
  onStartApReview,
  onStartLearningLoop,
  onOpenSettings,
  onSetRole,
  onOpenSimulation,
  onSetDarkMode,
  onSetMascot,
}) => {
  const [customTopic, setCustomTopic] = useState('');
  const [badgeCount, setBadgeCount] = useState(0);

  const handleSurpriseMeTopic = () => {
    const candidateCourses = (starredSubjects && starredSubjects.length > 0 ? starredSubjects : undefined) as CourseType[] | undefined;
    const pair = getRandomCourseAndTopic(candidateCourses);
    if (pair) {
      setCustomTopic(pair.topic);
    }
  };
  const [streakCount, setStreakCount] = useState(0);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // First sign-in: the profile card (role and name) comes first and is not
  // skippable, then the tour, which is.
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(PROFILE_DONE_KEY) !== 'true') {
      setShowProfileSetup(true);
    } else if (!localStorage.getItem('sp_onboarding_visited')) {
      setShowOnboarding(true);
    }
  }, []);

  const savedRole = localStorage.getItem('sp_open_resources_role');
  const initialRole: UserRole | null = savedRole === 'teacher' || savedRole === 'student' ? savedRole : null;

  const handleSaveProfile = (role: UserRole, name: string) => {
    onSetRole?.(role);
    onChangeUsername?.(name);
    localStorage.setItem(PROFILE_DONE_KEY, 'true');
    setShowProfileSetup(false);
    if (!localStorage.getItem('sp_onboarding_visited')) {
      setShowOnboarding(true);
    }
  };

  const handleCloseOnboarding = () => {
    localStorage.setItem('sp_onboarding_visited', 'true');
    setShowOnboarding(false);
  };

  useEffect(() => {
    const badges = getBadgesFromStorage();
    setBadgeCount(badges.length);
    const streak = getStreakInfo();
    setStreakCount(streak.count);
  }, []);

  // Real-time textbook progress tracking
  const [textbookProgress, setTextbookProgress] = useState(() => getTextbookProgressSummary());

  useEffect(() => {
    const handleUpdate = () => {
      setTextbookProgress(getTextbookProgressSummary());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const getModeColorClasses = (colorClass: string) => {
    switch (colorClass) {
      case 'amber':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/20',
          text: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-100 dark:border-amber-800/30'
        };
      case 'teal':
        return {
          bg: 'bg-teal-500/10 dark:bg-teal-950/20',
          text: 'text-teal-600 dark:text-teal-400',
          border: 'border-teal-100 dark:border-teal-800/30'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/20',
          text: 'text-emerald-600 dark:text-emerald-450',
          border: 'border-emerald-100 dark:border-emerald-800/30'
        };
      case 'violet':
        return {
          bg: 'bg-violet-500/10 dark:bg-violet-950/20',
          text: 'text-violet-600 dark:text-violet-400',
          border: 'border-violet-100 dark:border-violet-800/30'
        };
      case 'pink':
        return {
          bg: 'bg-pink-500/10 dark:bg-pink-950/20',
          text: 'text-pink-600 dark:text-pink-400',
          border: 'border-pink-100 dark:border-pink-800/30'
        };
      case 'orange':
        return {
          bg: 'bg-orange-500/10 dark:bg-orange-950/20',
          text: 'text-orange-600 dark:text-orange-400',
          border: 'border-orange-100 dark:border-orange-800/30'
        };
      case 'coral':
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-950/20',
          text: 'text-rose-600 dark:text-coral',
          border: 'border-rose-100 dark:border-rose-800/30'
        };
      case 'sky':
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-950/20',
          text: 'text-sky-600 dark:text-skyBlue',
          border: 'border-sky-100 dark:border-sky-800/30'
        };
      default: // indigo
        return {
          bg: 'bg-indigo-500/10 dark:bg-indigo-950/20',
          text: 'text-indigo-600 dark:text-[#818CF8]',
          border: 'border-indigo-100 dark:border-indigo-800/30'
        };
    }
  };

  const launchMode = (modeId: string) => {
    switch (modeId) {
      case 'quiz': onStart(); break;
      case 'frq': onStartFRQ(); break;
      case 'cer': onStartCER(); break;
      case 'study_sprint': onStartStudySprint?.(); break;
      case 'concept_map': onStartConceptMap?.(); break;
      case 'diagram_labeling': onStartDiagramLabeling?.(); break;
      case 'explanation': onStartExplanation(); break;
      case 'calculation': onStartCalculation(); break;
      case 'quiz_my_notes': onStartQuizMyNotes(); break;
      case 'flashcards': onStartFlashcards(); break;
      case 'reflection': onStartReflection?.(); break;
      case 'lab': onStartLab(); break;
      case 'skeptic': onStartSkeptic?.(); break;
      case 'tutor': onStartTutor?.(); break;
      case 'socratic': onStartSocratic?.(); break;
      case 'growth_coach': onStartGrowthCoach?.(); break;
      case 'motion_tracker': onStartMotionTracker?.(); break;
      case 'research': onStartResearch(); break;
      case 'simulations_hub': onOpenSimulationsHub?.(); break;
      case 'review_games': onOpenReviewGames?.(); break;
      case 'ap_review_catalog': onStartApReview?.(); break;
      case 'learning_loop': onStartLearningLoop?.(); break;
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      <ContactModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />

      {/* ── BENTO ROW 1: WELCOME HERO & DAILY MISSION PATH ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <WelcomeHeroTile
          username={username}
          onChangeUsername={onChangeUsername}
          mascot={mascot}
          onSetMascot={onSetMascot}
          onSetDarkMode={onSetDarkMode}
          onGetAIAdvisorResponse={onGetAIAdvisorResponse}
          onStart={onStart}
          onStartExplanation={onStartExplanation}
          onStartFlashcards={onStartFlashcards}
          onStartCalculation={onStartCalculation}
          onStartQuizMyNotes={onStartQuizMyNotes}
          onOpenSimulation={onOpenSimulation}
          onOpenSimulationsHub={onOpenSimulationsHub}
          onShowHowItWorks={onShowHowItWorks}
          onOpenFeatures={onOpenFeatures}
          onOpenChangelog={onOpenChangelog}
          onOpenSupport={onOpenSupport}
          onOpenSettings={onOpenSettings}
          onOpenTrophyRoom={onOpenTrophyRoom}
          onOpenSubjectLibrary={onOpenSubjectLibrary}
          onOpenReviewGames={onOpenReviewGames}
          onOpenPracticeCenter={onOpenPracticeCenter}
        />

        <DailyMissionCard
          streakCount={streakCount}
          badgeCount={badgeCount}
          onOpenTrophyRoom={onOpenTrophyRoom}
        />
      </div>

      {/* ── BENTO ROW 2: CORE SUBJECTS GRID (DYNAMIC STARRED) ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
            Practice Subjects
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
          </h3>
          {onOpenSubjectLibrary && (
            <button
              onClick={onOpenSubjectLibrary}
              className="text-xs font-black text-indigo-600 dark:text-[#818CF8] hover:underline flex items-center gap-1 font-rounded animate-in fade-in"
            >
              Subject Library 📚
            </button>
          )}
        </div>
        
        {starredSubjects.length === 0 ? (
          /* Pinned favorites empty state */
          <div className="bento-card border border-dashed border-slate-300 dark:border-slate-700 py-12 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
            <div className="text-4xl select-none">⭐</div>
            <div className="max-w-md space-y-1">
              <h4 className="text-base font-black text-[#1A1C21] dark:text-white font-rounded">No pinned subjects yet!</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                Visit the Subject Library to browse all curriculum courses and pin your favorite topics directly here for quick starts.
              </p>
            </div>
            {onOpenSubjectLibrary && (
              <button
                onClick={onOpenSubjectLibrary}
                className="btn-squishy bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 px-5 py-2.5 text-xs font-black flex items-center gap-2"
              >
                Browse Subject Library 📚
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {starredSubjects.map((course, index) => {
              const subjectName = getSubject(course as CourseType);
              const theme = getTheme(subjectName);
              const desc = getCourseDescription(course);

              return (
                <div
                  key={course}
                  className={`bento-card border flex flex-col justify-between gap-6 h-52 group cursor-pointer transition-all duration-300 hover:shadow-lg`}
                  style={{
                    borderWidth: '1.5px',
                    borderColor: 'var(--card-border-color, currentColor)',
                  }}
                  onClick={() => onSelectSubject && onSelectSubject(course)}
                >
                  <style dangerouslySetInnerHTML={{ __html: `
                    .dark [key="${course}"] { --card-border-color: rgba(${subjectName === 'Biology' ? '74, 222, 128' : subjectName === 'Chemistry' ? '56, 189, 248' : subjectName === 'Physics' ? '251, 113, 133' : '129, 140, 248'}, 0.2); }
                    :not(.dark) [key="${course}"] { --card-border-color: rgba(${subjectName === 'Biology' ? '74, 222, 128' : subjectName === 'Chemistry' ? '56, 189, 248' : subjectName === 'Physics' ? '251, 113, 133' : '129, 140, 248'}, 0.4); }
                  `}} />
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800/40 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform select-none">
                      {theme.icon}
                    </div>
                    <span className={`px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg ${theme.light} ${theme.text}`}>
                      Subject 0{index + 1}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-indigo-500 dark:group-hover:text-[#818CF8] transition-colors font-rounded line-clamp-1">
                      {course}
                    </h4>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">
                      {desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BENTO ROW 3: STARRED MODES & TOOLS (DYNAMIC STARRED FROM PRACTICE CENTER) ── */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2">
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
            Starred Modes & Tools
            <span className="w-6 h-[1px] bg-slate-200 dark:bg-slate-800"></span>
          </h3>
          {onOpenPracticeCenter && (
            <button
              onClick={onOpenPracticeCenter}
              className="text-xs font-black text-indigo-600 dark:text-[#818CF8] hover:underline flex items-center gap-1 font-rounded"
            >
              Practice Center 🎯
            </button>
          )}
        </div>
        
        {starredModes.length === 0 ? (
          /* Starred modes empty state */
          <div className="bento-card border border-dashed border-slate-300 dark:border-slate-700 py-12 text-center flex flex-col items-center justify-center gap-4 animate-in fade-in duration-300">
            <div className="text-4xl select-none">⭐</div>
            <div className="max-w-md space-y-1">
              <h4 className="text-base font-black text-[#1A1C21] dark:text-white font-rounded">No pinned tools yet!</h4>
              <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal">
                Visit the Practice Center to star your favorite learning, revision, or simulation tools to pin them directly here.
              </p>
            </div>
            {onOpenPracticeCenter && (
              <button
                onClick={onOpenPracticeCenter}
                className="btn-squishy bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 px-5 py-2.5 text-xs font-black flex items-center gap-2"
              >
                <span>Open Practice Center</span>
                <Compass className="w-4 h-4 animate-spin-slow" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {starredModes.map(modeId => {
              const meta = MODES_METADATA.find(m => m.id === modeId);
              if (!meta) return null;
              const cl = getModeColorClasses(meta.colorClass);

              return (
                <div
                  key={modeId}
                  className={`bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-4 h-48 group cursor-pointer transition-all duration-300 hover:shadow-lg`}
                  onClick={() => launchMode(modeId)}
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-10 h-10 ${cl.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      {renderModeIcon(meta.icon, `w-5 h-5 ${cl.text}`)}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${cl.bg} ${cl.text}`}>
                      {meta.tagText}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#1A1C21] dark:text-[#F8F9FB] group-hover:text-indigo-500 dark:group-hover:text-[#818CF8] transition-colors font-rounded">
                      {meta.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-snug mt-1.5 line-clamp-3">
                      {meta.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── BENTO ROW 4: SIMULATIONS HUB & EXPLORE TOPICS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Interactives / Simulations (2/3 width) */}
        {onOpenSimulationsHub && (
          <div className="lg:col-span-2 bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 group cursor-pointer" onClick={onOpenSimulationsHub}>
            <div className="flex-1 space-y-3">
              <span className="px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-lg bg-violet-500/10 text-indigo-600 dark:text-[#818CF8]">Science Lab</span>
              <h3 className="text-xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Interactives Lab Hub</h3>
              <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                Hands-on vector simulators for physics Free Body diagrams, phase change kinetics, population genetics, molecular builders, and diffusion labs!
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {['Periodic Table', 'Phase Changes', 'Gas Laws', 'Bonding builders'].map((tag, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-[10px] font-bold rounded-lg">{tag}</span>
                ))}
              </div>
            </div>
            <div className="text-5xl select-none md:pr-4 group-hover:scale-110 transition-transform">🧪</div>
          </div>
        )}

        {/* Custom Topic Direct Search box (1/3 width) */}
        <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-4">
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Instant explore</span>
              <button
                type="button"
                onClick={handleSurpriseMeTopic}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 flex items-center gap-1 transition-colors"
                title="Randomly pick a topic from your subjects"
              >
                <span>🎲</span>
                <span>Surprise Me</span>
              </button>
            </div>
            <h3 className="text-base font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Explore Direct Topic</h3>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g. Krebs Cycle, Kinematics..."
              className="w-full bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/50 text-[#1A1C21] dark:text-white rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
              onKeyDown={(e) => e.key === 'Enter' && customTopic && !isLoading && onCustomStart(customTopic)}
              disabled={isLoading}
            />
            <button
              onClick={() => customTopic && !isLoading && onCustomStart(customTopic)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 py-2.5 rounded-xl text-xs font-black transition-colors flex items-center justify-center shadow-lg shadow-indigo-900/10"
              disabled={isLoading}
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Launch Lesson 🚀'}
            </button>
          </div>
        </div>
      </div>

      {/* ── BENTO ROW 5: COURSE TEXTS ── */}
      <CourseTextsSection textbookProgress={textbookProgress} />

      {/* Footer Info */}
      <footer className="pt-8 border-t border-slate-100 dark:border-slate-800/40 text-center flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
        <div>
          Created by <a href="https://www.davidknuffke.com" target="_blank" rel="noopener noreferrer" className="font-bold hover:text-indigo-500 transition-colors">David Knuffke</a>
        </div>
        <div className="flex gap-4">
          <button onClick={onShowHowItWorks} className="font-bold hover:text-indigo-500 transition-colors">How It Works</button>
          {onOpenSupport && <button onClick={onOpenSupport} className="font-bold hover:text-indigo-500 transition-colors">Support</button>}
          <button onClick={onOpenChangelog} className="font-bold hover:text-indigo-500 transition-colors">Site Updates</button>
        </div>
      </footer>

      {/* ── ONBOARDING SPOTLIGHT WALKTHROUGH OVERLAY ── */}
      <ProfileSetupModal
        isOpen={showProfileSetup}
        initialRole={initialRole}
        initialName={username}
        onSave={handleSaveProfile}
      />
      <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
    </div>
  );
};
