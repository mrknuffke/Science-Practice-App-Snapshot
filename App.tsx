import React, { useState, useMemo, useEffect } from 'react';
import {
  AP_BIO_DATA, HS_BIO_DATA,
  AP_CHEM_DATA, HS_CHEM_DATA,
  AP_PHYSICS_C_DATA, AP_PHYSICS_2_DATA, AP_PHYSICS_1_DATA, HS_PHYSICS_DATA,
  MS_LIFE_SCI_DATA, MS_PHYS_SCI_DATA, MS_EARTH_SPACE_DATA,
  ES_LIFE_SCI_DATA, ES_PHYS_SCI_DATA, ES_EARTH_SPACE_DATA,
  ANATOMY_DATA, MARINE_BIO_DATA, BIOTECH_DATA, FORENSICS_DATA,
  AP_ENV_SCI_DATA, HS_ENV_SCI_DATA,
  HS_PHYSICAL_SCIENCE_DATA,
  IB_BIO_SL_DATA, IB_BIO_HL_DATA,
  IB_CHEM_SL_DATA, IB_CHEM_HL_DATA,
  IB_PHYSICS_SL_DATA, IB_PHYSICS_HL_DATA,
  IB_ESS_SL_DATA, IB_ESS_HL_DATA,
  parseQuizData
} from './constants';
import { AppState, Question, CourseType, ChatMessage, LabTrack, WhoAmIPuzzle, AppConfig, ModeType, ViewType, MultiModeState, TestConfig } from './types';
import type { CourseEntry } from './constants/apCourses';

import { getDiagnosticReport, getDiverseQuestions, getReplacementQuestion, getExplanationChatResponse, getCalculationChatResponse, getExplanationReport, getFlashcards, getFRQQuestion, getCERQuestion, getLabAssistance, generateTest, generateCalculationProblems, getStudySprintTaskRecommendations, getWhoAmIPuzzles, getMascotAdvisorResponse, getCarryOverGreeting } from './services/geminiService';
import { validateAndFixQuestions } from './services/ai/questionValidator';
import { adaptQuizResponses, adaptExplanationResponses, adaptCalculationResponses, adaptFlashcardResponses } from './utils/studySprintAdapter';
import { saveBadgeToStorage, updateStreak, saveSessionToHistory, getBadgesFromStorage, getStreakInfo } from './services/storageService';
import { DashboardShell } from './components/DashboardShell';
import QuestionCard from './components/QuestionCard';
import { LandingPage } from './components/LandingPage';
import { PROFILE_DONE_KEY, type UserRole } from './components/landing/ProfileSetupModal';
import { disableGoogleAutoSelect } from './utils/googleAuth';
import { Star, Backpack, GraduationCap, ArrowLeft } from 'lucide-react';
import ContactModal from './components/ContactModal';
import Gatekeeper from './components/Gatekeeper';
import { LoadingSessionView } from './components/LoadingSessionView';
import SEO from './components/SEO';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy-loaded secondary views
const SubjectLibraryView = React.lazy(() => import('./components/SubjectLibraryView').then(m => ({ default: m.SubjectLibraryView })));
const PracticeCenterView = React.lazy(() => import('./components/PracticeCenterView').then(m => ({ default: m.PracticeCenterView })));
const ResultsView = React.lazy(() => import('./components/ResultsView'));
const HowItWorksView = React.lazy(() => import('./components/HowItWorksView'));
const ExplanationView = React.lazy(() => import('./components/ExplanationView'));
const CalculationView = React.lazy(() => import('./components/CalculationView'));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));
const APReviewCatalogView = React.lazy(() => import('./components/APReviewCatalogView').then(m => ({ default: m.APReviewCatalogView })));
const APReviewTutorView = React.lazy(() => import('./components/APReviewTutorView').then(m => ({ default: m.APReviewTutorView })));
const LearningLoopView = React.lazy(() => import('./components/LearningLoopView').then(m => ({ default: m.LearningLoopView })));
const ChangelogView = React.lazy(() => import('./components/ChangelogView'));
const TrophyRoomView = React.lazy(() => import('./components/TrophyRoomView'));
const FlashcardView = React.lazy(() => import('./components/FlashcardView'));
const WorksheetView = React.lazy(() => import('./components/WorksheetView'));
const FRQView = React.lazy(() => import('./components/FRQView'));
const CERView = React.lazy(() => import('./components/CERView'));
const FeaturesView = React.lazy(() => import('./components/FeaturesView'));
const QuizMyNotesView = React.lazy(() => import('./components/QuizMyNotesView').then(m => ({ default: m.QuizMyNotesView })));
const NoteSheetView = React.lazy(() => import('./components/NoteSheetView').then(m => ({ default: m.NoteSheetView })));
const LabView = React.lazy(() => import('./components/LabView').then(m => ({ default: m.LabView })));
const UniversalInputView = React.lazy(() => import('./components/UniversalInputView').then(m => ({ default: m.UniversalInputView })));
const MultiModeView = React.lazy(() => import('./components/MultiModeView').then(m => ({ default: m.MultiModeView })));
const MultiModeReport = React.lazy(() => import('./components/MultiModeReport').then(m => ({ default: m.MultiModeReport })));
const ResearchModeView = React.lazy(() => import('./components/ResearchModeView').then(m => ({ default: m.ResearchModeView })));
const SupportView = React.lazy(() => import('./components/SupportView'));
const SessionHistoryView = React.lazy(() => import('./components/SessionHistoryView').then(m => ({ default: m.SessionHistoryView })));
const SessionDetailView = React.lazy(() => import('./components/SessionDetailView').then(m => ({ default: m.SessionDetailView })));
const ConceptMapView = React.lazy(() => import('./components/conceptMap/ConceptMapView'));
const DiagramLabelingView = React.lazy(() => import('./components/diagramLabeling/DiagramLabelingView'));
const SkepticView = React.lazy(() => import('./components/skeptic/SkepticView'));
const TutorView = React.lazy(() => import('./components/personae/TutorView'));
const SocraticView = React.lazy(() => import('./components/personae/SocraticView'));
const GrowthCoachView = React.lazy(() => import('./components/personae/GrowthCoachView'));
const OpenResourcesView = React.lazy(() => import('./components/OpenResourcesView'));

// Domain Sub-Routers
import { SimulationRouter, SIMULATION_VIEWS } from './components/routing/SimulationRouter';
import { ReviewGamesRouter, REVIEW_GAME_VIEWS } from './components/routing/ReviewGamesRouter';
import { StudySprintRouter, STUDY_SPRINT_VIEWS } from './components/routing/StudySprintRouter';
import { TeacherToolsRouter, TEACHER_TOOL_VIEWS } from './components/routing/TeacherToolsRouter';
import { useAppPersistence } from './hooks/useAppPersistence';
import { useStudySprint } from './hooks/useStudySprint';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { useErrorHandler } from './hooks/useErrorHandler';
import { useKeyboardNavigation } from './hooks/useKeyboardNavigation';
import { VIEW_TO_PAGE } from './constants/publicRoutes';

// Helper to safely extract error message from unknown error
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
};

// Shared fallback for lazy-loaded simulation views

// Shared fallback for lazy-loaded secondary views
const ViewLoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center flex-col gap-4 p-8">
    <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin"></div>
    <div className="text-center">
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">Loading View</h3>
      <p className="text-slate-400 text-xs animate-pulse">Preparing component resources...</p>
    </div>
  </div>
);


const AppContent: React.FC = () => {
  const _toast = useToast();
  const quizDatabase = useMemo((): Record<CourseType, Record<string, Record<string, string[]>>> => {
    // Shared Data Parsing
    const apBioData = parseQuizData(AP_BIO_DATA);
    const hsBioData = parseQuizData(HS_BIO_DATA);

    const apChemData = parseQuizData(AP_CHEM_DATA);
    const hsChemData = parseQuizData(HS_CHEM_DATA);

    const apEnvData = parseQuizData(AP_ENV_SCI_DATA);
    const hsEnvData = parseQuizData(HS_ENV_SCI_DATA);

    const hsPhysicsData = parseQuizData(HS_PHYSICS_DATA);

    const emptyData: Record<string, Record<string, string[]>> = {};

    return {
      'Custom Practice': emptyData,
      // Biology
      'AP Biology': apBioData,
      'Honors Biology': hsBioData,
      'General Biology': hsBioData,

      // Electives
      'Anatomy and Physiology': parseQuizData(ANATOMY_DATA),
      'Marine Biology': parseQuizData(MARINE_BIO_DATA),
      'Biotechnology': parseQuizData(BIOTECH_DATA),
      'Forensic Science': parseQuizData(FORENSICS_DATA),
      'Physical Science': parseQuizData(HS_PHYSICAL_SCIENCE_DATA),

      // Chemistry
      'AP Chemistry': apChemData,
      'Honors Chemistry': hsChemData,
      'General Chemistry': hsChemData,

      // Physics
      'AP Physics C': parseQuizData(AP_PHYSICS_C_DATA),
      'AP Physics 2': parseQuizData(AP_PHYSICS_2_DATA),
      'AP Physics 1': parseQuizData(AP_PHYSICS_1_DATA),
      'Honors Physics': hsPhysicsData,
      'General Physics': hsPhysicsData,

      // Environmental
      'AP Environmental Science': apEnvData,
      'Environmental Science': hsEnvData,

      // Earth and Space Science (High School)
      'Honors Earth and Space Science': emptyData,
      'General Earth and Space Science': emptyData,

      // Middle School
      'Middle School Life Science': parseQuizData(MS_LIFE_SCI_DATA),
      'Middle School Physical Science': parseQuizData(MS_PHYS_SCI_DATA),
      'Middle School Earth and Space Science': parseQuizData(MS_EARTH_SPACE_DATA),

      // Elementary
      'Elementary School Life Science': parseQuizData(ES_LIFE_SCI_DATA),
      'Elementary School Physical Science': parseQuizData(ES_PHYS_SCI_DATA),
      'Elementary School Earth and Space Science': parseQuizData(ES_EARTH_SPACE_DATA),

      // International Baccalaureate (IB)
      'IB Biology SL': parseQuizData(IB_BIO_SL_DATA),
      'IB Biology HL': parseQuizData(IB_BIO_HL_DATA),
      'IB Chemistry SL': parseQuizData(IB_CHEM_SL_DATA),
      'IB Chemistry HL': parseQuizData(IB_CHEM_HL_DATA),
      'IB Physics SL': parseQuizData(IB_PHYSICS_SL_DATA),
      'IB Physics HL': parseQuizData(IB_PHYSICS_HL_DATA),
      'IB Environmental Systems and Societies SL': parseQuizData(IB_ESS_SL_DATA),
      'IB Environmental Systems and Societies HL': parseQuizData(IB_ESS_HL_DATA),
    };
  }, []);

  const [state, setState] = useState<AppState>({
    view: 'landing',
    mode: 'quiz',

    selectedLevel: null,
    selectedCourse: null,
    selectedUnit: null,
    selectedTopic: null, // Single-topic selection (used alongside selectedTopics)
    selectedTopics: [], // NEW: Primary field for multi-topic support
    questions: [],
    flashcards: [],
    whoAmIPuzzles: [],
    answers: {},
    chatHistory: [],
    report: null,
    accessibilityMode: localStorage.getItem('sp_accessibility_mode') === 'true',
    selectedLabTrack: 'design',
    labState: {
      projectContext: '',
      dataTable: [{ x: '', y: '' }, { x: '', y: '' }, { x: '', y: '' }],
      dataHeaders: { xLabel: 'X', xUnit: '', yLabel: 'Y', yUnit: '' }
    },
    teacherMode: localStorage.getItem('sp_teacher_mode') === 'true',
    useVisuals: false, // Default: Text only to save tokens
    config: {
      mcqCount: 3,
      saCount: 1,
      errorCount: 1,
      timerDuration: 1200, // 20 mins default for FRQ/CER
      difficulty: 'Medium',
      worksheetStyle: 'Mixed',
      worksheetFocus: ['Standard Mixed'],
      questionStyle: 'Standard',
      analogyCount: 0,
      oddOneOutCount: 0
    },
    multiModeState: null,
    studySprintState: null,
    currentSprintTaskId: null // Track which Study Sprint task is currently being worked on
  });

  const [isPreparingQuiz, setIsPreparingQuiz] = useState(false);
  const [preparingStatus, setPreparingStatus] = useState<string>('Generating questions...');
  // Error handling hook
  const { error: lastError, showError: setLastError, clearError: _clearLastError } = useErrorHandler();

  // State for Note Sheet
  const [noteSheetContent, setNoteSheetContent] = useState<string>("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);


  const [replacingIndex, setReplacingIndex] = useState<number | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [customTopic, setCustomTopic] = useState('');
  const [selectedApCourse, setSelectedApCourse] = useState<CourseEntry | null>(null);
  const [selectedApExamParam, setSelectedApExamParam] = useState<string | null>(null);

  const [linkCopied, setLinkCopied] = useState(false);

  // Session timing for history
  const sessionStartTimeRef = React.useRef<number>(Date.now());

  // Pending deep link action to execute after successful sign-in
  const pendingDeepLinkRef = React.useRef<(() => void) | null>(null);

  // Session history navigation
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  // Practice Center active tab state
  const [practiceCenterTab, setPracticeCenterTab] = useState<'practice' | 'study' | 'lab' | 'interactives'>('practice');

  // --- AUTHENTICATION STATE ---
  // Auth version - increment this when the authentication system changes
  // This forces all users to re-authenticate with the new system
  const AUTH_VERSION = 4; // Bumped: migrated from Classroom Code to Google OAuth sign-in

  const [isAuthenticated, setIsAuthenticated] = useState(() => {

    // Check if auth version matches - if not, clear stale data and force re-auth
    const storedVersion = localStorage.getItem('auth_version');
    if (storedVersion !== String(AUTH_VERSION)) {
      // Clear old auth data and update version
      localStorage.removeItem('classroom_code');
      localStorage.removeItem('oauth_session');
      localStorage.setItem('auth_version', String(AUTH_VERSION));
      return false;
    }
    // Check local storage on initial load
    return !!localStorage.getItem('oauth_session');
  });

  // Re-validate the stored Google sign-in session against the server on app load.
  // If it's no longer valid (expired, or the account's domain was removed from
  // OAUTH_ALLOWED_DOMAINS), politely bounce the user back to the Gatekeeper.
  useEffect(() => {
    const storedSession = localStorage.getItem('oauth_session');
    if (!storedSession || !isAuthenticated) return;

    fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oauthSession: storedSession })
    })
      .then(res => {
        if (!res.ok) {
          // Session is no longer valid: clear it and bounce to Gatekeeper
          localStorage.removeItem('oauth_session');
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        // Network error: don't lock the user out, they may be offline
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOAuthUnlock = (sessionToken: string) => {
    localStorage.setItem('oauth_session', sessionToken);
    localStorage.setItem('auth_version', String(AUTH_VERSION));
    setIsAuthenticated(true);
    if (pendingDeepLinkRef.current) {
      const pendingAction = pendingDeepLinkRef.current;
      pendingDeepLinkRef.current = null;
      pendingAction();
    }
  };

  // --- DARK MODE STATE & PERSISTENCE ---
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('sp_dark_mode');
    if (saved !== null) return saved === 'true';
    const gcTheme = localStorage.getItem('gc-theme');
    if (gcTheme !== null) return gcTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('sp_dark_mode', String(isDarkMode));
    localStorage.setItem('gc-theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- USER PROFILE STATE & PERSISTENCE ---
  const [username, setUsername] = useState(() => {
    return localStorage.getItem('sp_username') || '';
  });

  useEffect(() => {
    localStorage.setItem('sp_username', username);
  }, [username]);

  // --- MASCOT COMPANION STATE & PERSISTENCE ---
  const [mascot, setMascot] = useState<'robot' | 'beaker' | 'plant' | 'gerbil'>(() => {
    const saved = localStorage.getItem('sp_mascot');
    if (saved === 'robot' || saved === 'beaker' || saved === 'plant' || saved === 'gerbil') {
      return saved;
    }
    return 'robot';
  });

  useEffect(() => {
    localStorage.setItem('sp_mascot', mascot);
  }, [mascot]);

  // --- STARRED SUBJECTS STATE & PERSISTENCE ---
  const [starredSubjects, setStarredSubjects] = useState<string[]>(() => {
    const saved = localStorage.getItem('sp_starred_subjects');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['AP Biology', 'AP Chemistry', 'AP Physics 1'];
      }
    }
    return ['AP Biology', 'AP Chemistry', 'AP Physics 1'];
  });



  useEffect(() => {
    localStorage.setItem('sp_starred_subjects', JSON.stringify(starredSubjects));
  }, [starredSubjects]);

  const handleToggleStarSubject = (course: string) => {
    setStarredSubjects(prev => {
      if (prev.includes(course)) {
        return prev.filter(c => c !== course);
      } else {
        return [...prev, course];
      }
    });
  };

  // --- STARRED MODES STATE & PERSISTENCE ---
  const [starredModes, setStarredModes] = useState<string[]>(() => {
    const saved = localStorage.getItem('sp_starred_modes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return ['explanation', 'calculation', 'quiz_my_notes', 'study_sprint'];
      }
    }
    return ['explanation', 'calculation', 'quiz_my_notes', 'study_sprint'];
  });

  useEffect(() => {
    localStorage.setItem('sp_starred_modes', JSON.stringify(starredModes));
  }, [starredModes]);

  const handleToggleStarMode = (modeId: string) => {
    setStarredModes(prev => {
      if (prev.includes(modeId)) {
        return prev.filter(m => m !== modeId);
      } else {
        return [...prev, modeId];
      }
    });
  };

  useEffect(() => {
    updateStreak();
  }, []);

  // --- BACKWARDS COMPATIBILITY: Migrate old single-topic to multi-topic array ---
  useEffect(() => {
    if (state.selectedTopic && state.selectedTopics.length === 0) {
      setState(prev => ({
        ...prev,
        selectedTopics: [prev.selectedTopic!]
      }));
    }
  }, [state.selectedTopic, state.selectedTopics.length]);

  // --- ACCESSIBILITY EFFECT ---
  useEffect(() => {
    localStorage.setItem('sp_accessibility_mode', String(state.accessibilityMode));
    if (state.accessibilityMode) {
      document.body.classList.add('accessibility-mode');
    } else {
      document.body.classList.remove('accessibility-mode');
    }
  }, [state.accessibilityMode]);

  // --- TEACHER MODE PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('sp_teacher_mode', String(state.teacherMode));
  }, [state.teacherMode]);

  // --- APP PERSISTENCE (Lab, MultiMode, Study Sprint) ---
  useAppPersistence({
    labState: state.labState,
    multiModeState: state.multiModeState,
    studySprintState: state.studySprintState,
    onLabStateLoad: (labState) => {
      setState(prev => ({ ...prev, labState: { ...prev.labState, ...labState } }));
    },
    onMultiModeLoad: (multiModeState) => {
      setState(prev => ({ ...prev, multiModeState }));
    },
    onStudySprintLoad: (studySprintState) => {
      setState(prev => ({
        ...prev,
        studySprintState,
        view: studySprintState.isActive ? 'study_sprint_dashboard' : prev.view
      }));
    }
  });

  const toggleAccessibility = () => {
    setState(prev => ({ ...prev, accessibilityMode: !prev.accessibilityMode }));
  };

  // Role is the user-facing name for teacher mode: "teacher" shows the Teacher Space.
  // The role key is written only on an explicit choice (never on load), so the
  // profile card can tell "never chose" from "chose student".
  const setRole = (role: UserRole) => {
    localStorage.setItem('sp_open_resources_role', role);
    setState(prev => ({ ...prev, teacherMode: role === 'teacher' }));
  };

  const toggleTeacherMode = () => {
    setRole(state.teacherMode ? 'student' : 'teacher');
  };

  // Ends the Google session on this device. The name and the profile card flag go
  // too, so the next student on a shared computer starts clean; badges, history
  // and display preferences stay (Fully Reset Profile removes those).
  const handleSignOut = () => {
    localStorage.removeItem('oauth_session');
    localStorage.removeItem('sp_username');
    localStorage.removeItem(PROFILE_DONE_KEY);
    disableGoogleAutoSelect();
    setUsername('');
    setIsAuthenticated(false);
    setState(prev => ({ ...prev, view: 'landing', selectedCourse: null, selectedUnit: null }));
  };


  // --- THEME LOGIC ---
  // Theme hook - derives subject and theme colors from selected course
  const { subject: _subject, theme } = useTheme(state.selectedCourse);
  // -------------------



  /* ------------------------------------------------------------------
   * QUIZ LOGIC
   * ------------------------------------------------------------------ */
  // Helper to toggle Focus
  const handleShareLink = () => {
    if (!state.selectedCourse || !state.selectedTopic) return;

    // Construct the URL manually to be safe
    const baseUrl = window.location.origin;
    const params = new URLSearchParams();
    params.set('course', state.selectedCourse);
    params.set('topic', state.selectedTopic);
    params.set('mode', state.mode);

    // Encode Config
    const configToShare = {
      mcqCount: state.config.mcqCount,
      saCount: state.config.saCount,
      difficulty: state.config.difficulty,
      timerDuration: state.config.timerDuration,
      errorCount: state.config.errorCount,
      worksheetFocus: state.config.worksheetFocus
    };
    try {
      const configStr = btoa(JSON.stringify(configToShare));
      params.set('config', configStr);
    } catch (e) {
      console.error("Failed to encode config", e);
    }

    const fullUrl = `${baseUrl}/?${params.toString()}`;

    navigator.clipboard.writeText(fullUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // Refactored to accept args instead of relying solely on state
  const startQuizGeneration = async (
    course: CourseType,
    unit: string,
    topics: string | string[], // UPDATED: Accept both single topic and array
    modeOverride?: ModeType,
    viewOverride?: AppState['view'],
    seedQuestions: string[] = [], // Optional seed questions from DB
    contextOverride?: string, // New optional context for Multi-Mode
    configOverride?: Partial<AppConfig> // Optional config override for deep linking
  ) => {
    if (!isAuthenticated) return;

    setIsPreparingQuiz(true);
    setLastError(null);
    setCurrentQuestionIndex(0);

    // Reset session start time for duration tracking
    sessionStartTimeRef.current = Date.now();

    // Normalize topics to array
    const topicArray = Array.isArray(topics) ? topics : [topics];
    const topic = topicArray[0]; // For backwards compat with code that uses single topic

    const targetMode = modeOverride || state.mode;

    // Handle Quiz My Notes specifics: redirect to setup if trying to "generate" via this flow (e.g. retry)
    if (targetMode === 'quiz_my_notes') {
      setState(prev => ({ ...prev, view: 'quiz_my_notes_setup', mode: 'quiz_my_notes' }));
      setIsPreparingQuiz(false);
      return;
    }

    if (targetMode === 'interview') {
      setState(prev => ({ ...prev, view: 'interview', mode: 'interview' }));
      setIsPreparingQuiz(false);
      return;
    }

    if (targetMode === 'who_am_i') {
      setState(prev => ({ ...prev, view: 'who_am_i_setup', mode: 'who_am_i' }));
      setIsPreparingQuiz(false);
      return;
    }

    setState(prev => ({
      ...prev,
      selectedCourse: course,
      selectedUnit: unit || "Custom Unit",
      selectedTopic: topic, // Backwards compat
      selectedTopics: topicArray, // NEW: Multi-topic support
      view: viewOverride || (targetMode === 'worksheet' ? 'worksheet' :
        targetMode === 'frq' ? 'frq' :
          targetMode === 'cer' ? 'cer' :
            targetMode === 'explanation' ? 'explanation' :
              targetMode === 'flashcards' ? 'flashcards' :
                targetMode === 'calculation' ? 'calculation' :
                  targetMode === 'lab' ? 'lab' :
                    targetMode === 'research' ? 'research' :
                      targetMode === 'square_match' ? 'square_match' : 'quiz'),
      mode: targetMode,
      questions: [], // Reset questions to prevent stale data render
      answers: {},
      report: null,
      // Apply config override if present
      config: configOverride ? { ...prev.config, ...configOverride } : prev.config
    }));

    const activeConfig = configOverride ? { ...state.config, ...configOverride } : state.config;

    try {
      if (targetMode === 'lab') {
        // Lab Mode Initialization
        setState(prev => ({
          ...prev,
          chatHistory: [], // Start fresh or maybe keep history if desired? Let's start fresh.
          report: null
        }));
        // We do NOT need to fetch questions.
      } else if (targetMode === 'explanation') {
        const initialGreeting = await getExplanationChatResponse(course, topic, []);
        setState(prev => ({
          ...prev,
          chatHistory: [{ role: 'model', text: initialGreeting }],
          report: null
        }));
      } else if (targetMode === 'calculation' && viewOverride === 'worksheet') {
        // PROBLEM SET GENERATOR FLOW
        const count = activeConfig.saCount || 5;
        const problems = await generateCalculationProblems(course, topic, count, activeConfig.difficulty, activeConfig.sequencingStyle);

        setState(prev => ({
          ...prev,
          questions: problems,
          answers: {},
          report: null
        }));

      } else if (targetMode === 'calculation' && !viewOverride) {
        // CHAT PARTNER FLOW
        const initialGreeting = await getCalculationChatResponse(course, topic, [], undefined);
        setState(prev => ({
          ...prev,
          chatHistory: [{ role: 'model', text: initialGreeting }],
          report: null
        }));
      } else if (targetMode === 'flashcards') {
        setState(prev => ({ ...prev, flashcards: [] }));
        const cards = await getFlashcards(course, topicArray); // UPDATED: Use topicArray
        setState(prev => ({ ...prev, flashcards: cards }));
      } else if (targetMode === 'frq') {
        const qStyle = (activeConfig.questionStyle as 'Standard' | 'Data Analysis' | 'Experimental Design') || 'Standard';
        const frq = await getFRQQuestion(course, topicArray, activeConfig.difficulty, seedQuestions, qStyle); // UPDATED: Use topicArray
        setState(prev => ({
          ...prev,
          questions: [frq],
          answers: {},
          report: null
        }));
      } else if (targetMode === 'cer') {
        const cer = await getCERQuestion(course, topicArray, activeConfig.difficulty, seedQuestions); // UPDATED: Use topicArray
        setState(prev => ({
          ...prev,
          questions: [cer],
          answers: {},
          report: null
        }));
      } else {
        // Quiz OR Worksheet Mode
        // Respect config for both modes now that we have the Creator UI
        const qCount = activeConfig.mcqCount;
        const saCount = activeConfig.saCount;

        setPreparingStatus('Generating questions...');
        const rawQuestions = await getDiverseQuestions(
          course,
          topicArray, // UPDATED: Use topicArray
          seedQuestions,
          qCount,
          saCount,
          activeConfig.errorCount,
          activeConfig.difficulty,
          activeConfig.worksheetStyle,
          activeConfig.worksheetFocus, // Pass Array
          activeConfig.analogyCount || 0,
          activeConfig.oddOneOutCount || 0,
          activeConfig.fillInBlankCount || 0,
          contextOverride // Pass uploaded context
        );

        if (!rawQuestions || rawQuestions.length === 0) throw new Error("AI returned no questions.");

        // --- POST-GENERATION VALIDATION PASS ---
        // Run a separate LLM check on MCQ / fill_in_blank questions before
        // serving them to students. Catches logical inconsistencies (e.g.
        // negative-stem questions where all options satisfy the positive stem).
        const hasMCQ = rawQuestions.some(q => q.type === 'mcq' || q.type === 'fill_in_blank');
        let questions = rawQuestions;
        if (hasMCQ) {
          setPreparingStatus('Verifying questions...');
          questions = await validateAndFixQuestions(rawQuestions, course, topicArray[0]);
        }

        if (!questions || questions.length === 0) throw new Error("All generated questions failed quality validation. Please try again.");

        setState(prev => ({
          ...prev,
          questions,
          answers: {},
          report: null,
        }));
      }
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err) || "Unknown Connection Error";
      console.error("Session Start Failed:", errorMsg);
      setLastError(errorMsg);
      // We do NOT redirect to menu here. We let the UI stay in its current state (loading),
      // and the render loop will show the Error Modal over it based on `lastError`.
    } finally {
      setIsPreparingQuiz(false);
      window.scrollTo(0, 0);
    }
  }



  // --- MULTI-MODE LOGIC ---
  const handleStartMultiMode = (course: CourseType, topic: string) => {
    // Check if we have a saved session for THIS topic
    // If so, maybe we don't clear? For now, let's allow the persistence effect to handle restoring IF it matches
    // But since the user specifically clicked "Start" on a topic, we might want to start fresh or just check consistency.

    // Simplest approach: Update selection, set view. Effect will load state if exists, View will fetch overview if null.
    setState(prev => ({
      ...prev,
      selectedCourse: course,
      selectedTopic: topic,
      view: 'multimode',
      mode: 'multimode',
      multiModeState: prev.multiModeState?.topic === topic ? prev.multiModeState : null // clear if switching topics
    }));
  };

  const handleUpdateMultiModeState = (newState: MultiModeState | null) => {
    setState(prev => ({ ...prev, multiModeState: newState }));
  };

  const handleLaunchMultiModeActivity = (mode: string, _contextOverride?: string) => {
    if (!state.selectedCourse || !state.selectedTopic) return;

    if (mode === 'report') {
      setState(prev => ({ ...prev, view: 'multimode_report' }));
      return;
    }

    // Map simple mode string to AppState mode
    // Supported: 'quiz', 'flashcards', 'frq', 'cer'
    // Type assertion: mode comes from MultiModeView which only passes valid mode types
    const validMode = mode as 'quiz' | 'flashcards' | 'frq' | 'cer';
    startQuizGeneration(
      state.selectedCourse,
      state.selectedUnit || "Multi-Mode Unit",
      state.selectedTopic,
      validMode,
      undefined,
      []
    );
  };

  const handleExitMultiModeReport = () => {
    // Clear persistence and go menu
    setState(prev => ({
      ...prev,
      view: 'menu',
      mode: 'quiz',
      multiModeState: null
    }));
  };

  // --- STUDY SPRINT HOOK INITIALIZATION ---
  // Simple reset for the hook (will be wrapped by main reset function)
  const simpleReset = () => {
    setState(prev => ({
      ...prev,
      view: 'landing',
      mode: 'quiz',
      selectedUnit: null,
      selectedTopic: null,
      selectedCourse: null,
      selectedLevel: null,
      analyzedImage: undefined,
      questions: [],
      flashcards: [],
      whoAmIPuzzles: [],
      answers: {},
      chatHistory: [],
      report: null
    }));
    setLastError(null);
    setCurrentQuestionIndex(0);
  };

  const handleStartWhoAmIGeneration = async (
    course: CourseType,
    topic: string,
    options?: { count?: number; difficultyMix?: 'easier' | 'mixed' | 'harder'; silliness?: number; sourceContext?: string }
  ) => {
    setIsPreparingQuiz(true);
    setLastError(null);
    try {
      const count = options?.count ?? 5;
      const generatedPuzzles = await getWhoAmIPuzzles(course, topic, count, {
        difficultyMix: options?.difficultyMix,
        silliness: options?.silliness,
        sourceContext: options?.sourceContext,
      });
      setState(prev => ({
        ...prev,
        selectedCourse: course,
        selectedTopic: topic,
        whoAmIPuzzles: generatedPuzzles,
        view: 'who_am_i_preview'
      }));
    } catch (err: unknown) {
      setLastError(getErrorMessage(err) || "Failed to generate puzzles");
    } finally {
      setIsPreparingQuiz(false);
    }
  };

  const handleRegenerateWhoAmIClues = async (puzzleIndex: number, difficulty?: 'easier' | 'harder') => {
    if (!state.selectedCourse || !state.selectedTopic || !state.whoAmIPuzzles) return;

    setIsPreparingQuiz(true);
    try {
      if (puzzleIndex === -1) {
        // Bulk regenerate: replace the entire deck with the same count and settings
        const count = state.whoAmIPuzzles.length;
        const newPuzzles = await getWhoAmIPuzzles(state.selectedCourse, state.selectedTopic, count);
        setState(prev => ({ ...prev, whoAmIPuzzles: newPuzzles }));
      } else {
        // Single puzzle regenerate with optional difficulty adjustment
        const newPuzzles = await getWhoAmIPuzzles(state.selectedCourse, state.selectedTopic, 1, difficulty);
        if (newPuzzles.length > 0) {
          const updated = [...state.whoAmIPuzzles];
          updated[puzzleIndex] = newPuzzles[0];
          setState(prev => ({ ...prev, whoAmIPuzzles: updated }));
        }
      }
    } catch (err: unknown) {
      setLastError(getErrorMessage(err) || "Failed to regenerate puzzle");
    } finally {
      setIsPreparingQuiz(false);
    }
  };

  const handleStartWhoAmIGame = (puzzles: WhoAmIPuzzle[]) => {
    setState(prev => ({
      ...prev,
      whoAmIPuzzles: puzzles,
      view: 'who_am_i_game'
    }));
  };

  const sprint = useStudySprint({
    studySprintState: state.studySprintState,
    currentSprintTaskId: state.currentSprintTaskId,
    onUpdateState: (updates) => {
      setState(prev => ({ ...prev, ...updates }));
    },
    onStartQuizGeneration: startQuizGeneration,
    reset: simpleReset
  });

  // --- STUDY SPRINT LOGIC (using hook) ---
  const handleStartStudySprint = sprint.handleStart;
  const handleStudySprintStart = sprint.handleSprintStart;
  const handleStudySprintUpdateState = sprint.handleUpdateState;
  const handleStudySprintLaunchTask = sprint.handleLaunchTask;
  const handleStudySprintGenerateReport = sprint.handleGenerateReport;
  const handleStudySprintExit = sprint.handleExit;
  const handleStudySprintBackToDashboard = () => {
    sprint.handleBackToDashboard();
    setLastError(null);
    setCurrentQuestionIndex(0);
  };
  const handleSprintAwareQuit = sprint.handleSprintAwareQuit;
  const handleStudySprintShare = sprint.handleShare;


  const startTestGeneration = async (testConfig: TestConfig) => {
    try {
      const sections = await generateTest(testConfig);

      // Transform sections into a flat list of questions with sectionTitle metadata
      const allQuestions = sections.flatMap(s =>
        s.questions.map(q => ({
          ...q,
          sectionTitle: s.title // Properly track section title in Question metadata
        }))
      );

      setState(prev => ({
        ...prev,
        view: 'worksheet', // Reuse worksheet view for print
        questions: allQuestions,
        mode: 'test_creator'
      }));

    } catch (e) {
      console.error(e);
      alert("Failed to generate test. Please try again.");
      setState(prev => ({ ...prev, view: 'test_creator_setup' }));
    }
  };


  // --- SIMULATION HANDLERS ---
  const handleOpenSimulationsHub = () => {
    setState((prev) => ({
      ...prev,
      view: 'simulations_hub',
      mode: 'simulation',
      selectedCourse: prev.selectedCourse || 'General Chemistry',
    }));
  };

  // --- DEEP LINKING HANDLER (ON MOUNT) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const courseParam = params.get('course');
    const topicParam = params.get('topic');
    const modeParam = params.get('mode');
    const sprintParam = params.get('sprint');
    const pageParam = params.get('page');
    const tabParam = params.get('tab');
    const contactParam = params.get('contact') || params.get('feedback');
    if (contactParam === 'true' || contactParam === '1' || pageParam === 'contact' || pageParam === 'feedback') {
      setShowFeedbackModal(true);
    }

    // If the browser loaded the SPA at /chem, forward to the textbook immediately
    if (window.location.pathname === '/chem' || window.location.pathname === '/chem/') {
      window.location.replace('/chem/index.html' + window.location.search + window.location.hash);
      return;
    }

    // If the browser loaded the SPA at /physics, forward to the textbook immediately
    if (window.location.pathname === '/physics' || window.location.pathname === '/physics/') {
      window.location.replace('/physics/index.html' + window.location.search + window.location.hash);
      return;
    }

    // If the browser loaded the SPA at /bio, forward to the textbook immediately
    if (window.location.pathname === '/bio' || window.location.pathname === '/bio/') {
      window.location.replace('/bio/index.html' + window.location.search + window.location.hash);
      return;
    }

    // Direct routing for open science resources hub
    if (
      window.location.pathname === '/resources' ||
      window.location.pathname === '/resources/' ||
      window.location.pathname === '/open' ||
      window.location.pathname === '/open/'
    ) {
      setState(prev => ({ ...prev, view: 'open_resources' }));
      return;
    }

    // Direct textbook deep link: opens textbook without sign-in
    if (pageParam === 'textbook' || pageParam === 'chem') {
      window.location.href = '/chem/index.html';
      return;
    }
    if (pageParam === 'physics') {
      window.location.href = '/physics/index.html';
      return;
    }
    if (pageParam === 'bio') {
      window.location.href = '/bio/index.html';
      return;
    }

    // Handle public page deep links: these bypass the gatekeeper
    const publicPages: Record<string, AppState['view']> = {
      'how_it_works': 'how_it_works',
      'features': 'features',
      'support': 'support',
      'teachers': 'teachers',
      'changelog': 'changelog',
      'resources': 'open_resources',
      'open': 'open_resources',
      'interactives': 'simulations_hub',
      'covalent_bonding': 'covalent_bonding',
      'ionic_bonding': 'ionic_bonding',
      'periodic_table': 'periodic_table',
      'build_an_atom': 'build_an_atom',
      'ecosystem_simulation': 'ecosystem_simulation',
      'population_genetics': 'population_genetics',
      'phase_change': 'phase_change',
      'regulatory_modeler': 'regulatory_modeler',
      'diffusion': 'diffusion_simulation',
      'reaction_kinetics': 'reaction_kinetics_simulation',
      'gas_laws': 'gas_laws',
      'free_body_diagram': 'free_body_diagram',
      'video-lab': 'motion_tracker',
      'calorimetry': 'calorimetry',
      'blood_buffer': 'blood_buffer',
      'blood_buffers': 'blood_buffer',
      'nuclear_decay': 'nuclear_decay',
      'osmosis': 'osmosis_lab',
      'carbon_atom': 'carbon_journey',
      'island_biogeography': 'island_biogeography',
      'concept_map': 'concept_map',
      'diagram_labeling': 'diagram_labeling',
      'skeptic': 'skeptic',
      'tutor': 'tutor',
      'socratic': 'socratic',
      'growth_coach': 'growth_coach',
      'vocab_relay': 'vocab_relay',
    };
    if (pageParam && publicPages[pageParam]) {
      const view = publicPages[pageParam];
      const isSimulation = [
        'simulations_hub', 'covalent_bonding', 'ionic_bonding', 'periodic_table', 'build_an_atom',
        'ecosystem_simulation', 'population_genetics', 'phase_change', 'regulatory_modeler',
        'diffusion_simulation', 'reaction_kinetics_simulation', 'gas_laws', 'free_body_diagram',
        'motion_tracker', 'calorimetry', 'blood_buffer', 'nuclear_decay', 'osmosis_lab', 'carbon_journey',
        'island_biogeography',
      ].includes(view);
      const isConceptMap = view === 'concept_map';
      const isDiagramLabeling = view === 'diagram_labeling';
      const isSkeptic = view === 'skeptic';
      const isTutor = view === 'tutor';
      const isSocratic = view === 'socratic';
      const isGrowthCoach = view === 'growth_coach';
      const isVocabRelay = view === 'vocab_relay';
      setState(prev => ({
        ...prev,
        view,
        ...(isSimulation ? { mode: 'simulation' as const, selectedCourse: prev.selectedCourse || 'General Chemistry' as CourseType } : {}),
        ...(isConceptMap ? { mode: 'concept_map' as const, selectedCourse: prev.selectedCourse || 'AP Biology' as CourseType } : {}),
        ...(isDiagramLabeling ? { mode: 'diagram_labeling' as const, selectedCourse: prev.selectedCourse || 'AP Biology' as CourseType } : {}),
        ...(isSkeptic ? { mode: 'skeptic' as const, selectedCourse: prev.selectedCourse || 'AP Biology' as CourseType } : {}),
        ...(isTutor ? { mode: 'tutor' as const, selectedCourse: prev.selectedCourse || 'General Chemistry' as CourseType } : {}),
        ...(isSocratic ? { mode: 'socratic' as const, selectedCourse: prev.selectedCourse || 'AP Biology' as CourseType } : {}),
        ...(isGrowthCoach ? { mode: 'growth_coach' as const, selectedCourse: prev.selectedCourse || 'AP Biology' as CourseType } : {}),
        ...(isVocabRelay ? { mode: 'vocab_relay' as const, selectedCourse: prev.selectedCourse || 'AP Biology' as CourseType } : {}),
      }));
      return;
    }

    // Handle Lab & Research / Practice Center deep links (deferred until authenticated)
    if (pageParam === 'lab' || pageParam === 'lab_research' || (pageParam === 'practice_center' && tabParam === 'lab') || tabParam === 'lab') {
      const openLabResearch = () => {
        setPracticeCenterTab('lab');
        setState(prev => ({
          ...prev,
          view: 'practice_center'
        }));
      };

      if (!isAuthenticated) {
        pendingDeepLinkRef.current = openLabResearch;
      } else {
        openLabResearch();
      }
      return;
    }

    if (pageParam === 'practice_center') {
      const targetTab = (tabParam === 'study' || tabParam === 'interactives' || tabParam === 'practice') ? tabParam : 'practice';
      const openPracticeCenter = () => {
        setPracticeCenterTab(targetTab);
        setState(prev => ({
          ...prev,
          view: 'practice_center'
        }));
      };

      if (!isAuthenticated) {
        pendingDeepLinkRef.current = openPracticeCenter;
      } else {
        openPracticeCenter();
      }
      return;
    }

    // Handle Study Sprint deep links (deferred until authenticated)
    if (sprintParam) {
      const launchSprint = () => {
        try {
          const sprintConfig = JSON.parse(atob(sprintParam));
          setState(prev => ({
            ...prev,
            view: 'study_sprint_setup'
          }));

          // Pre-fill the setup form by triggering auto-generation
          setTimeout(() => {
            getStudySprintTaskRecommendations(
              sprintConfig.course,
              sprintConfig.gradeLevel,
              sprintConfig.units || '',
              sprintConfig.topics,
              sprintConfig.taskCount || 3,
              sprintConfig.subtopicFocus || ''
            ).then((tasks: import('./types').StudySprintTask[]) => {
              const sprintState: import('./types').StudySprintState = {
                isActive: true,
                course: sprintConfig.course,
                gradeLevel: sprintConfig.gradeLevel,
                units: sprintConfig.units || '',
                topics: sprintConfig.topics,
                subtopicFocus: sprintConfig.subtopicFocus || undefined,
                tasks,
                sessionStartTime: Date.now()
              };
              setState(prev => ({
                ...prev,
                studySprintState: sprintState,
                view: 'study_sprint_dashboard'
              }));
            }).catch((err: unknown) => {
              console.error("Failed to load sprint from deep link:", err);
            });
          }, 100);
        } catch (e) {
          console.error("Failed to decode sprint config", e);
        }
      };

      if (!isAuthenticated) {
        pendingDeepLinkRef.current = launchSprint;
      } else {
        launchSprint();
      }
      return;
    }

    // Basic validation to check if course exists in our types (deferred until authenticated)
    if (courseParam && topicParam) {
      const decodedCourse = decodeURIComponent(courseParam) as CourseType;
      const decodedTopic = decodeURIComponent(topicParam);
      const configParam = params.get('config');

      let decodedConfig = undefined;
      if (configParam) {
        try {
          decodedConfig = JSON.parse(atob(configParam));
        } catch (e) {
          console.error("Failed to decode config", e);
        }
      }

      // Type guard for mode parameter from URL
      const validModes: readonly string[] = ['quiz', 'explanation', 'flashcards', 'worksheet', 'frq', 'cer', 'calculation', 'quiz_my_notes', 'lab', 'interview', 'exit_ticket', 'test_creator', 'research', 'multimode', 'review_games', 'jeopardy', 'square_match', 'who_am_i', 'bingo'];
      const mode = (modeParam && validModes.includes(modeParam)) ?
        modeParam as 'quiz' | 'explanation' | 'flashcards' | 'worksheet' | 'frq' | 'cer' | 'calculation' | 'quiz_my_notes' | 'lab' | 'interview' | 'exit_ticket' | 'test_creator' | 'research' | 'multimode' | 'review_games' | 'jeopardy' | 'square_match' | 'who_am_i' | 'bingo' :
        'quiz';

      const launchAction = () => {
        startQuizGeneration(
          decodedCourse,
          "Direct Link",
          decodedTopic,
          mode,
          undefined, // No view override
          [],
          undefined,
          decodedConfig // Pass the config!
        );
      };

      if (!isAuthenticated) {
        pendingDeepLinkRef.current = launchAction;
      } else {
        launchAction();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- deep links are read once at load; a pending launch waits in pendingDeepLinkRef for sign-in.
  }, []);

  // --- HISTORY HANDLING (Browser Back Button Support) ---
  useEffect(() => {
    // 1. Set initial state for the current page (Entrance)
    if (!window.history.state) {
      window.history.replaceState({ view: 'landing' }, '');
    }

    // 2. Listen for PopState (Back/Forward)
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setState(prev => ({ ...prev, view: event.state.view }));
        if (event.state.tab) {
          setPracticeCenterTab(event.state.tab);
        }
      } else {
        setState(prev => ({ ...prev, view: 'landing' }));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 3. Sync View Changes to History (with shareable URLs for simulations and lab deep link)
  useEffect(() => {
    const historyView = window.history.state?.view;
    const historyTab = window.history.state?.tab;
    if (historyView !== state.view || (state.view === 'practice_center' && historyTab !== practiceCenterTab)) {
      // Map views to shareable ?page= params
      const viewToPage = VIEW_TO_PAGE;
      // Simulations are always shareable: authenticated or not
      const isSimView = viewToPage[state.view] !== undefined &&
        state.view !== 'how_it_works' && state.view !== 'features' &&
        state.view !== 'support' && state.view !== 'teachers' &&
        state.view !== 'reflection' && state.view !== 'changelog';
      let pageParam = (!isAuthenticated || isSimView) ? viewToPage[state.view] : undefined;
      let url = pageParam ? `?page=${pageParam}` : window.location.pathname;
      if (state.view === 'practice_center' && practiceCenterTab === 'lab') {
        url = '?page=lab';
      }
      window.history.pushState({ view: state.view, tab: practiceCenterTab }, '', url);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- push a history entry only on navigation; signing in must not add an extra Back step.
  }, [state.view, practiceCenterTab]);

  const handleCustomStart = (topic: string) => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic) return;

    // Try to find if this topic matches any course in quizDatabase
    let matchedCourse: CourseType | undefined;
    for (const [courseName, courseUnits] of Object.entries(quizDatabase)) {
      if (courseName === 'Custom Practice') continue;
      for (const courseUnitsObj of Object.values(courseUnits)) {
        for (const topicKey of Object.keys(courseUnitsObj)) {
          if (topicKey.toLowerCase() === trimmedTopic.toLowerCase()) {
            matchedCourse = courseName as CourseType;
            break;
          }
        }
        if (matchedCourse) break;
      }
      if (matchedCourse) break;
    }

    const finalCourse: CourseType = matchedCourse || (state.selectedCourse && state.selectedCourse !== 'Custom Practice' ? state.selectedCourse : 'Custom Practice');

    // Instant Explore must always launch a digital interactive session (never a printable worksheet)
    startQuizGeneration(finalCourse, 'Custom Session', trimmedTopic, 'quiz');
  };

  const handleSubmit = async (frqAnswer?: string) => {
    if (!state.selectedCourse) return;
    setState(prev => ({ ...prev, view: 'analyzing' }));
    try {
      // If FRQ or CER, inject the single answer
      const finalAnswers = frqAnswer ? { 0: frqAnswer } : state.answers;

      const report = await getDiagnosticReport(
        state.selectedCourse,
        state.selectedUnit!,
        state.selectedTopics.join(', '), // UPDATED: Use multi-topic string
        state.questions,
        finalAnswers,
        state.useVisuals // Pass visual preference
      );

      // Auto-save badge (skip for Study Sprint tasks)
      let savedBadgeId: string | undefined;
      if (report.badge && !state.currentSprintTaskId) {
        const savedBadge = saveBadgeToStorage(
          report.badge,
          state.selectedTopics.join(', '), // UPDATED: Use multi-topic string
          state.selectedCourse,
          report.score
        );
        savedBadgeId = savedBadge.id;
      }

      // NEW: Save session to history (skip for Study Sprint sub-tasks)
      if (!state.currentSprintTaskId) {
        const duration = Date.now() - sessionStartTimeRef.current;
        saveSessionToHistory(
          state.mode,
          state.selectedCourse,
          state.selectedTopics,
          state.selectedUnit,
          state.questions,
          finalAnswers,
          report,
          state.config,
          duration,
          savedBadgeId
        );
      }

      // If this is a Study Sprint task, capture results and return to dashboard
      if (state.currentSprintTaskId && state.studySprintState) {
        const taskId = state.currentSprintTaskId;
        const task = state.studySprintState.tasks.find(t => t.id === taskId);

        if (task) {
          const responses = adaptQuizResponses(state.questions, finalAnswers, report.detailedFeedback);
          sprint.completeCurrentTask(responses, report.score, Date.now() - (task.timestamp || Date.now()));
          setState(prev => ({
            ...prev,
            questions: [],
            answers: {},
            report: null
          }));
          return;
        }
      }

      setState(prev => ({ ...prev, view: 'results', report }));
    } catch (err) {
      const errorMessage = state.currentSprintTaskId
        ? "Feedback generation failed. Please provide more complete answers and try again."
        : "AI Analysis failed. Please try again.";
      alert(errorMessage);

      // If Study Sprint task, return to dashboard and mark task as pending again
      if (state.currentSprintTaskId && state.studySprintState) {
        const updatedTasks = state.studySprintState.tasks.map(t =>
          t.id === state.currentSprintTaskId ? { ...t, status: 'pending' as const } : t
        );
        setState(prev => ({
          ...prev,
          studySprintState: prev.studySprintState ? {
            ...prev.studySprintState,
            tasks: updatedTasks
          } : null,
          currentSprintTaskId: null,
          view: 'study_sprint_dashboard',
          questions: [],
          answers: {},
          report: null
        }));
      } else {
        setState(prev => ({ ...prev, view: state.mode === 'frq' ? 'frq' : state.mode === 'cer' ? 'cer' : 'quiz' }));
      }
    }
  };

  const handleFlagQuestion = async (index: number, adjustment: 'easier' | 'harder' | 'standard' = 'standard') => {
    if (!state.selectedTopic || !state.selectedCourse) return;
    const questionToReplace = state.questions[index];

    setReplacingIndex(index);
    try {
      const newQuestion = await getReplacementQuestion(
        state.selectedCourse,
        state.selectedTopic,
        questionToReplace.text,
        questionToReplace.type,
        adjustment
      );

      setState(prev => {
        const newQuestions = [...prev.questions];
        newQuestions[index] = newQuestion;

        const newAnswers = { ...prev.answers };
        delete newAnswers[index];

        return {
          ...prev,
          questions: newQuestions,
          answers: newAnswers
        };
      });
    } catch (err) {
      console.error("Failed to replace question", err);
      alert("Could not generate a replacement question at this time.");
    } finally {
      setReplacingIndex(null);
    }
  };

  // Explanation Chat Handlers
  const handleExplanationMessage = async (msg: string) => {
    if (!state.selectedCourse || !state.selectedTopic) return;

    // Optimistic update
    const newHistory: ChatMessage[] = [...state.chatHistory, { role: 'user', text: msg }];
    setState(prev => ({ ...prev, chatHistory: newHistory }));
    setIsPreparingQuiz(true); // Reuse loading state for chat thinking

    try {
      const response = await getExplanationChatResponse(state.selectedCourse, state.selectedTopic, newHistory, state.config.persona);
      setState(prev => ({
        ...prev,
        chatHistory: [...newHistory, { role: 'model', text: response }]
      }));
    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setIsPreparingQuiz(false);
    }
  };

  const handleExplanationFinish = async () => {
    if (!state.selectedCourse || !state.selectedTopic) return;
    setState(prev => ({ ...prev, view: 'analyzing' }));

    try {
      const report = await getExplanationReport(state.selectedCourse, state.selectedTopic, state.chatHistory);
      if (report.badge && !state.currentSprintTaskId) {
        saveBadgeToStorage(report.badge, state.selectedTopic!, state.selectedCourse, report.score);
      }

      if (state.currentSprintTaskId && state.studySprintState) {
        const taskId = state.currentSprintTaskId;
        const task = state.studySprintState.tasks.find(t => t.id === taskId);
        if (task) {
          const responses = adaptExplanationResponses(report.detailedFeedback);
          sprint.completeCurrentTask(responses, report.score, Date.now() - (state.studySprintState?.sessionStartTime || Date.now()));
          return;
        }
      }

      setState(prev => ({ ...prev, view: 'results', report }));
    } catch (err) {
      alert("Report generation failed. Please try again.");
      if (state.currentSprintTaskId) {
        sprint.handleBackToDashboard();
      } else {
        setState(prev => ({ ...prev, view: 'explanation' }));
      }
    }
  };

  const handleCarryOverExplanationSession = async () => {
    if (!state.selectedCourse || !state.selectedTopic) return;
    setIsPreparingQuiz(true);
    setPreparingStatus("Summarizing progress & carrying over to fresh memory...");

    try {
      const continuationGreeting = await getCarryOverGreeting(
        state.selectedCourse,
        state.selectedTopic,
        state.chatHistory,
        'explanation'
      );
      setState(prev => ({
        ...prev,
        chatHistory: [{ role: 'model', text: continuationGreeting }]
      }));
    } catch (err) {
      console.error("Carry over failed", err);
    } finally {
      setIsPreparingQuiz(false);
    }
  };

  const handleCarryOverCalculationSession = async () => {
    if (!state.selectedCourse || !state.selectedTopic) return;
    setIsPreparingQuiz(true);
    setPreparingStatus("Summarizing math equations & carrying over to fresh memory...");

    try {
      const continuationGreeting = await getCarryOverGreeting(
        state.selectedCourse,
        state.selectedTopic,
        state.chatHistory,
        'calculation'
      );
      setState(prev => ({
        ...prev,
        chatHistory: [{ role: 'model', text: continuationGreeting }]
      }));
    } catch (err) {
      console.error("Carry over failed", err);
    } finally {
      setIsPreparingQuiz(false);
    }
  };


  const handleCalculationMessage = async (msg: string, role: 'user' | 'model' = 'user', image?: string) => {
    if (!state.selectedCourse || !state.selectedTopic) return;

    // Optimistic update
    const newHistory: ChatMessage[] = [...state.chatHistory, { role, text: msg }];
    setState(prev => ({ ...prev, chatHistory: newHistory }));
    setIsPreparingQuiz(true);

    try {
      const response = await getCalculationChatResponse(state.selectedCourse, state.selectedTopic, newHistory, image);
      setState(prev => ({
        ...prev,
        chatHistory: [...newHistory, { role: 'model', text: response }]
      }));
    } catch (err: unknown) {
      console.error("Chat error", err);
      setLastError(getErrorMessage(err) || "Failed to get calculation help.");
    } finally {
      setIsPreparingQuiz(false);
    }
  };

  const handleCalculationFinish = () => {
    if (state.currentSprintTaskId) {
      const responses = adaptCalculationResponses(state.chatHistory, state.selectedTopic || undefined);
      sprint.completeCurrentTask(responses, "Completed", Date.now() - (state.studySprintState?.sessionStartTime || Date.now()));
      setTimeout(() => setState(prev => ({ ...prev, view: 'study_sprint_dashboard' })), 100);
    } else {
      reset();
    }
  };

  const handleFlashcardFinish = (score?: number, maxScore?: number) => {
    if (state.currentSprintTaskId) {
      // Need a string for score. Convert explicitly to bypass strict null checks.
      const finalScore = score !== undefined && maxScore !== undefined ? String(`${score}/${maxScore}`) : "Completed";
      const responses = adaptFlashcardResponses(state.flashcards, score, maxScore);
      sprint.completeCurrentTask(responses, finalScore, Date.now() - (state.studySprintState?.sessionStartTime || Date.now()));
      setTimeout(() => setState(prev => ({ ...prev, view: 'study_sprint_dashboard' })), 100);
    } else {
      reset();
    }
  };

  const handleLabMessage = async (track: LabTrack, msg: string, context?: string, data?: string, includeVisuals?: boolean) => {
    // Optimistic Update
    const newHistory: ChatMessage[] = [...state.chatHistory, { role: 'user', text: msg }];
    setState(prev => ({ ...prev, chatHistory: newHistory }));
    setIsPreparingQuiz(true);

    try {
      const response = await getLabAssistance(track, newHistory, context, data, state.selectedCourse || 'General Biology', includeVisuals);
      setState(prev => ({
        ...prev,
        chatHistory: [...newHistory, { role: 'model', text: response }]
      }));
    } catch (err) {
      console.error("Lab Error", err);
    } finally {
      setIsPreparingQuiz(false);
    }
  };

  const handleLabTrackChange = async (track: LabTrack) => {
    // 1. Insert Divider Message
    const dividerMsg: ChatMessage = {
      role: 'model',
      text: `--- Switched to ${track.toUpperCase()} Mode ---`,
      isDivider: true
    };

    // 2. Determine Greeting
    const greetings: Record<string, string> = {
      design: "I'm ready to help you design an experiment. What is your research question?",
      analysis: "I'm ready to help you analyze data. Please paste your data or upload a CSV.",
      feedback: "I'm ready to review your report. Please paste your text (or CER) below.",
      errors: "Let's troubleshoot your results. What did you observe versus what you expected?",
      mentor: "I am your Research Mentor. I will help guide your projects and keep track of your context.",
      safety: "I'm ready to review your experimental protocol for safety hazards. Please paste your procedure below or upload a file. (Note: I am an AI, not a certified safety officer.)"
    };

    const greetingMsg: ChatMessage = {
      role: 'model',
      text: greetings[track] || "I am ready to help."
    };

    // 3. Update state
    setState(prev => ({
      ...prev,
      selectedLabTrack: track,
      chatHistory: [...prev.chatHistory, dividerMsg, greetingMsg],
    }));
  };


  // Main reset function with sprint-aware logic
  const reset = () => {
    if (state.currentSprintTaskId) {
      sprint.handleBackToDashboard();
      setLastError(null);
      setCurrentQuestionIndex(0);
      return;
    }
    simpleReset();
  };

  const handleSessionQuit = () => {
    // If we're in a Study Sprint task, delegate to sprint-aware quit
    if (state.currentSprintTaskId) {
      handleSprintAwareQuit();
      return;
    }

    setState(prev => ({
      ...prev,
      view: 'menu',
      // Keep current mode and selectedLevel
      selectedCourse: null,
      selectedUnit: null,
      selectedTopic: null,
      questions: [],
      answers: {},
      report: null,
      chatHistory: [], // Clear chat logic if any
      analyzedImage: undefined
    }));
    setLastError(null);
    setCurrentQuestionIndex(0);
  };

  const handleRetrySameTopic = () => {
    if (!state.selectedCourse || !state.selectedUnit || !state.selectedTopic) return;
    if (state.mode === 'study_sprint') return; // Study Sprint uses its own task launching
    startQuizGeneration(state.selectedCourse, state.selectedUnit, state.selectedTopic, state.mode, undefined, []);
  };

  const handleNewTopic = () => {
    if (state.selectedCourse === 'Custom Practice') {
      reset();
    } else {
      setState(prev => ({
        ...prev,
        view: 'menu',
        selectedTopic: null,
        report: null,
        questions: [],
        flashcards: [],
        answers: {},
        chatHistory: []
      }));
    }
  };

  const handleChangeCourse = () => {
    setState(prev => ({
      ...prev,
      view: 'menu',
      selectedCourse: null,
      selectedUnit: null,
      selectedTopic: null,
      report: null,
      questions: [],
      flashcards: [],
      answers: {},
      chatHistory: []
    }));
  };

  const handleAnswerChange = (index: number, val: string) => {
    setState(prev => ({
      ...prev,
      answers: { ...prev.answers, [index]: val }
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < state.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmit();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  // Keyboard navigation for Quiz Mode
  useKeyboardNavigation({
    isActive: state.view === 'quiz',
    questions: state.questions,
    currentQuestionIndex,
    onNextQuestion: handleNextQuestion,
    onSubmit: handleSubmit
  });

  // --- VIEW ROUTING ---

  // Priority Check: Loading State
  // This must be checked before specific content views like FRQ or Worksheet 
  // to avoid rendering them with empty data.
  // CRITICAL CHANGE: Skip full screen loader if we are already in Explanation mode
  // This allows the ExplanationView to show the typing indicator bubbles instead of unmounting.

  // --- AUTHENTICATION CHECK ---
  // --- AUTHENTICATION CHECK ---
  // Allow public views to bypass auth
  // Simulations are fully client-side (no Gemini calls): open access without auth
  const isPublicView =
    state.mode === 'simulation' ||
    ['how_it_works', 'features', 'support', 'teachers', 'changelog', 'open_resources'].includes(state.view);

  if (!isAuthenticated && !isPublicView) {
    return (
      <Gatekeeper
        onGoogleUnlock={handleOAuthUnlock}
        onOpenOpenResources={() => setState(prev => ({ ...prev, view: 'open_resources' }))}
        onShowHowItWorks={() => setState(prev => ({ ...prev, view: 'how_it_works' }))}
        onOpenFeatures={() => setState(prev => ({ ...prev, view: 'features' }))}
        onOpenTeachers={() => setState(prev => ({ ...prev, view: 'teachers' }))}
        onOpenSupport={() => setState(prev => ({ ...prev, view: 'support' }))}
        onFeedback={() => setShowFeedbackModal(true)}
        onOpenSimulations={handleOpenSimulationsHub}
        onOpenChangelog={() => setState(prev => ({ ...prev, view: 'changelog' }))}
      />
    );
  }

  // --- PERSISTENT ERROR MODAL ---
  if (lastError) {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-rose-100 flex flex-col gap-4">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 text-2xl mb-2">
            ⚠️
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Session Error</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{lastError}</p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => {
                setLastError(null);
                setIsPreparingQuiz(false); // Ensure loading is off
                setState(prev => ({ ...prev, view: 'menu' }));
              }}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors"
            >
              Return to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- PRIORITY LOADING STATE (Corrected) ---
  // If we are preparing a quiz/session, we generally want to show the loader.
  // EXCEPTION: If we are in "Explanation" or "Calculation" mode and ALREADY have chat history,
  // we do NOT want to show the full screen loader (we want the chat UI to show "typing" instead).
  const shouldShowLoader = (isPreparingQuiz || (state.view === 'quiz' && state.questions.length === 0)) && !(
    (state.view === 'explanation' && state.chatHistory.length > 0) ||
    (state.view === 'calculation' && state.chatHistory.length > 0) ||
    (state.view === 'lab' && state.chatHistory.length > 0)
  );

  if (shouldShowLoader) {
    return (
      <LoadingSessionView
        course={state.selectedCourse}
        topic={state.selectedTopic || (state.selectedTopics && state.selectedTopics.length > 0 ? state.selectedTopics.join(', ') : undefined)}
        mode={state.mode}
        difficulty={state.config?.difficulty}
        mascot={mascot}
        statusText={preparingStatus}
        onCancel={() => {
          setIsPreparingQuiz(false);
          setState(prev => ({
            ...prev,
            view: 'landing'
          }));
        }}
      />
    );
  }

  // --- QUIZ MY NOTES HANDLERS ---
  // --- QUIZ MY NOTES HANDLERS ---
  const handleQuizMyNotesSuccess = (questions: Question[], courseName: string, topicName: string) => {
    setState(prev => ({
      ...prev,
      view: 'quiz',
      mode: 'quiz_my_notes',
      questions: questions,
      selectedCourse: 'Custom Practice',
      selectedUnit: courseName, // Mapping User's "Course Name" to Main Idea/Unit for display
      selectedTopic: topicName,
      answers: {},
      report: null
    }));
    setIsPreparingQuiz(false);
  };

  // --- Smart Scanner Note Sheet ---
  const handleNoteSheetReady = (content: string, courseName: string, topicName: string) => {
    setState(prev => ({
      ...prev,
      view: 'note_sheet',
      selectedCourse: 'Custom Practice',
      selectedUnit: courseName,
      selectedTopic: topicName
    }));
    setNoteSheetContent(content);
    setIsPreparingQuiz(false);
  };


  const landingProps = {
    onStart: (course?: string, topic?: string) => {
      if (course && topic) {
        startQuizGeneration(course as CourseType, 'Custom Session', topic, 'quiz');
      } else {
        setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'quiz' }));
      }
    },
    onStartExplanation: (course?: string, topic?: string) => {
      if (course && topic) {
        startQuizGeneration(course as CourseType, 'Custom Session', topic, 'explanation');
      } else {
        setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'explanation' }));
      }
    },
    onStartConceptMap: () => setState(prev => ({ ...prev, view: 'concept_map', mode: 'concept_map' })),
    onStartDiagramLabeling: () => setState(prev => ({ ...prev, view: 'diagram_labeling', mode: 'diagram_labeling' })),
    onStartSkeptic: () => setState(prev => ({ ...prev, view: 'skeptic', mode: 'skeptic' })),
    onStartTutor: () => setState(prev => ({ ...prev, view: 'tutor', mode: 'tutor' })),
    onStartSocratic: () => setState(prev => ({ ...prev, view: 'socratic', mode: 'socratic' })),
    onStartGrowthCoach: () => setState(prev => ({ ...prev, view: 'growth_coach', mode: 'growth_coach' })),
    onStartFlashcards: (course?: string, topic?: string) => {
      if (course && topic) {
        startQuizGeneration(course as CourseType, 'Custom Session', topic, 'flashcards');
      } else {
        setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'flashcards' }));
      }
    },
    onStartWorksheet: () => setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'worksheet' })),
    onOpenDocumentCreator: () => setState(prev => ({ ...prev, view: 'document_creator' })),
    onStartFRQ: (course?: string, topic?: string) => {
      if (course && topic) {
        startQuizGeneration(course as CourseType, 'Custom Session', topic, 'frq');
      } else {
        setState(prev => ({ ...prev, view: 'level_selection', mode: 'frq' }));
      }
    },
    onStartCER: (course?: string, topic?: string) => {
      if (course && topic) {
        startQuizGeneration(course as CourseType, 'Custom Session', topic, 'cer');
      } else {
        setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'cer' }));
      }
    },
    onStartQuizMyNotes: () => setState(prev => ({ ...prev, view: 'quiz_my_notes_setup' })),
    onStartCalculation: (course?: string, topic?: string) => {
      if (course && topic) {
        startQuizGeneration(course as CourseType, 'Custom Session', topic, 'calculation');
      } else {
        setState(prev => ({
          ...prev,
          view: 'calculation',
          mode: 'calculation',
          selectedCourse: 'Custom Practice',
          selectedLevel: 'High School',
          selectedUnit: 'General Practice',
          selectedTopic: 'Math Helper'
        }));
      }
    },
    onCustomStart: handleCustomStart,
    onShowHowItWorks: () => setState(prev => ({ ...prev, view: 'how_it_works' })),
    onOpenFeatures: () => setState(prev => ({ ...prev, view: 'features' })),
    onOpenTeachers: () => setState(prev => ({ ...prev, view: 'teachers' })),
    onOpenSupport: () => setState(prev => ({ ...prev, view: 'support' })),
    onFeedback: () => setShowFeedbackModal(true),
    onOpenTrophyRoom: () => setState(prev => ({ ...prev, view: 'trophy_room' })),
    onOpenSessionHistory: () => setState(prev => ({ ...prev, view: 'session_history' })),
    onOpenChangelog: () => { window.scrollTo(0, 0); setState(prev => ({ ...prev, view: 'changelog' })); },
    onStartLab: () => startQuizGeneration('Custom Practice', 'Lab', 'Lab Assistant', 'lab', undefined),
    onStartMotionTracker: () => setState(prev => ({ ...prev, view: 'motion_tracker' })),
    onStartResearch: () => setState(prev => ({ ...prev, view: 'research', mode: 'research' })),
    onStartRubricTranslator: () => setState(prev => ({ ...prev, view: 'rubric_translator', selectedCourse: prev.selectedCourse || 'AP Biology' })),
    onStartInterview: () => startQuizGeneration('Custom Practice', 'Interview', 'Assessment Script', 'interview', undefined),
    isLoading: isPreparingQuiz,
    accessibilityMode: state.accessibilityMode,
    onToggleAccessibility: toggleAccessibility,
    teacherMode: state.teacherMode,
    onToggleTeacherMode: toggleTeacherMode,
    onSetRole: setRole,
    onStartMultiMode: () => setState(prev => ({ ...prev, view: 'level_selection', mode: 'multimode' })), // Add trigger for MultiMode too!
    onOpenReviewGames: () => setState(prev => ({ ...prev, view: 'review_games' })),
    onStartStudySprint: handleStartStudySprint,
    onStartReflection: () => setState(prev => ({ ...prev, view: 'reflection' })),
    hasActiveStudySprint: state.studySprintState?.isActive || false,
    onOpenSimulationsHub: handleOpenSimulationsHub,
    username: username,
    onChangeUsername: (name: string) => setUsername(name),
    mascot: mascot,
    onSetMascot: (m: 'robot' | 'beaker' | 'plant' | 'gerbil') => setMascot(m),
    onSetDarkMode: (v: boolean) => setIsDarkMode(v),
    onOpenSimulation: (view: ViewType) => setState(prev => ({
      ...prev, view, mode: 'simulation' as const,
      selectedCourse: prev.selectedCourse || ('General Chemistry' as CourseType),
    })),
    onGetAIAdvisorResponse: (prompt: string, history?: Array<{ role: string; text: string }>) => getMascotAdvisorResponse(prompt, username, mascot, history),
    onOpenSettings: () => setState(prev => ({ ...prev, view: 'settings' })),
    starredSubjects: starredSubjects,
    onOpenSubjectLibrary: () => setState(prev => ({ ...prev, view: 'subject_library' })),
    starredModes: starredModes,
    onToggleStarMode: handleToggleStarMode,
    onOpenPracticeCenter: () => setState(prev => ({ ...prev, view: 'practice_center' })),
    onStartApReview: () => setState(prev => ({ ...prev, view: 'ap_review_catalog' })),
    onStartLearningLoop: () => setState(prev => ({ ...prev, view: 'learning_loop' })),
    onSelectSubject: (course: string) => {
      setState(prev => ({
        ...prev,
        selectedCourse: course as CourseType,
        selectedUnit: null,
        selectedTopic: null,
        view: 'menu'
      }));
    },
  };

  // --- DETECT DASHBOARD SHELL LAYOUT ---
  const isDashboardView = [
    'landing', 'practice_center', 'subject_library', 'simulations_hub', 'level_selection', 'menu', 'browse',
    'trophy_room', 'session_history', 'session_detail',
    'teachers', 'document_creator', 'document_config', 'test_creator_setup', 'rubric_translator', 'reflection', 'interview',
    'who_am_i_setup', 'who_am_i_preview', 'who_am_i_game',
    'study_sprint_setup', 'study_sprint_dashboard', 'study_sprint_report',
    'research', 'changelog', 'features', 'how_it_works', 'support', 'settings', 'open_resources',
    'ap_review_catalog', 'ap_review_tutor', 'learning_loop',
    'review_games', 'square_match_setup', 'bingo_setup', 'charades_setup', 'taboo_setup', 'jeopardy_setup'
  ].includes(state.view);

  const wrapDashboard = (node: React.ReactNode) => {
    if (!isDashboardView) return node;
    const badges = getBadgesFromStorage();
    const streak = getStreakInfo();

    return (
      <DashboardShell
        currentView={state.view === 'practice_center' && practiceCenterTab === 'lab' ? 'lab_research' : state.view}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        accessibilityMode={state.accessibilityMode}
        onToggleAccessibility={toggleAccessibility}
        teacherMode={state.teacherMode}
        onToggleTeacherMode={toggleTeacherMode}
        onSignOut={handleSignOut}
        username={username}
        onNavigate={(view) => {
          if (view === 'lab_research') {
            setPracticeCenterTab('lab');
            setState(prev => ({
              ...prev,
              view: 'practice_center',
              selectedUnit: null,
              selectedCourse: prev.selectedCourse,
            }));
            return;
          }
          if (view === 'practice_center') {
            setPracticeCenterTab('practice');
            setState(prev => ({
              ...prev,
              view: 'practice_center',
              selectedUnit: null,
              selectedCourse: prev.selectedCourse,
            }));
            return;
          }
          setState(prev => ({
            ...prev,
            view: view as ViewType,
            selectedUnit: view === 'landing' ? null : prev.selectedUnit,
            selectedCourse: view === 'landing' ? null : prev.selectedCourse,
          }));
        }}
        badgeCount={badges.length}
        streakCount={streak.count}
        mascot={mascot}
        onChangeMascot={(newMascot) => setMascot(newMascot)}

      >
        {node}
      </DashboardShell>
    );
  };

  // --- RENDER ---
  const renderMainView = () => {
    if (state.view === 'subject_library') {
      const availableCourses = Object.keys(quizDatabase);
      return (
        <SubjectLibraryView
          availableCourses={availableCourses}
          starredSubjects={starredSubjects}
          onToggleStar={handleToggleStarSubject}
          onSelectCourse={(course) => {
            setState(prev => ({
              ...prev,
              selectedCourse: course,
              selectedUnit: null,
              selectedTopic: null,
              view: 'menu',
            }));
          }}
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
        />
      );
    }

    if (state.view === 'practice_center') {
      return (
        <PracticeCenterView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          initialTab={practiceCenterTab}
          onTabChange={setPracticeCenterTab}
          onStart={() => setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'quiz' }))}
          onStartExplanation={() => setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'explanation' }))}
          onStartFlashcards={() => setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'flashcards' }))}
          onOpenDocumentCreator={() => setState(prev => ({ ...prev, view: 'document_creator' }))}
          onStartFRQ={() => setState(prev => ({ ...prev, view: 'level_selection', mode: 'frq' }))}
          onStartCER={() => setState(prev => ({ ...prev, view: prev.selectedCourse ? 'menu' : 'level_selection', mode: 'cer' }))}
          onStartQuizMyNotes={() => setState(prev => ({ ...prev, view: 'quiz_my_notes_setup' }))}
          onStartCalculation={() => setState(prev => ({
            ...prev,
            view: 'calculation',
            mode: 'calculation',
            selectedCourse: 'Custom Practice',
            selectedLevel: 'High School',
            selectedUnit: 'General Practice',
            selectedTopic: 'Math Helper'
          }))}
          onStartLab={() => startQuizGeneration('Custom Practice', 'Lab', 'Lab Assistant', 'lab', undefined)}
          onStartMotionTracker={() => setState(prev => ({ ...prev, view: 'motion_tracker' }))}
          onStartResearch={() => setState(prev => ({ ...prev, view: 'research', mode: 'research' }))}
          onStartRubricTranslator={() => setState(prev => ({ ...prev, view: 'rubric_translator', selectedCourse: prev.selectedCourse || 'AP Biology' }))}
          onStartInterview={() => startQuizGeneration('Custom Practice', 'Interview', 'Assessment Script', 'interview', undefined)}
          onOpenReviewGames={() => setState(prev => ({ ...prev, view: 'review_games' }))}
          onStartStudySprint={handleStartStudySprint}
          onStartReflection={() => setState(prev => ({ ...prev, view: 'reflection' }))}
          onOpenSimulationsHub={handleOpenSimulationsHub}
          onStartApReview={() => setState(prev => ({ ...prev, view: 'ap_review_catalog' }))}
          onStartLearningLoop={() => setState(prev => ({ ...prev, view: 'learning_loop' }))}
          onStartConceptMap={() => setState(prev => ({ ...prev, view: 'concept_map', mode: 'concept_map' }))}
          onStartDiagramLabeling={() => setState(prev => ({ ...prev, view: 'diagram_labeling', mode: 'diagram_labeling' }))}
          onStartSkeptic={() => setState(prev => ({ ...prev, view: 'skeptic', mode: 'skeptic' }))}
          onStartTutor={() => setState(prev => ({ ...prev, view: 'tutor', mode: 'tutor' }))}
          onStartSocratic={() => setState(prev => ({ ...prev, view: 'socratic', mode: 'socratic' }))}
          onStartGrowthCoach={() => setState(prev => ({ ...prev, view: 'growth_coach', mode: 'growth_coach' }))}
          teacherMode={state.teacherMode}
          hasActiveStudySprint={state.studySprintState?.isActive || false}
          starredModes={starredModes}
          onToggleStarMode={handleToggleStarMode}
        />
      );
    }

    if (state.view === 'note_sheet') {
    return (
      <NoteSheetView
        content={noteSheetContent}
        courseName={state.selectedUnit || "Custom Course"}
        topic={state.selectedTopic || "Notes"}
        onBack={() => setState(prev => ({ ...prev, view: 'menu' }))}
      />
    );
  }

  if (state.view === 'lab') {
    return (
      <>
        <SEO title="Lab Co-Pilot" />
        <LabView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          onSendMessage={handleLabMessage}
          chatHistory={state.chatHistory}
          isThinking={isPreparingQuiz}
          selectedTrack={state.selectedLabTrack}
          onTrackChange={handleLabTrackChange}
          labState={state.labState}
          onUpdateLabState={(updates) => setState(prev => ({ ...prev, labState: { ...prev.labState, ...updates } }))}
        />
      </>
    );
  }

  if (SIMULATION_VIEWS.has(state.view)) {
    return (
      <SimulationRouter
        view={state.view}
        course={state.selectedCourse}
        isAuthenticated={isAuthenticated}
        onNavigate={(targetView) => setState(prev => ({ ...prev, view: targetView as ViewType }))}
        onBackToLanding={() => setState(prev => ({ ...prev, view: 'landing', mode: 'quiz' }))}
      />
    );
  }

  if (state.view === 'quiz_my_notes_setup') {
    return (
      <QuizMyNotesView
        onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
        onQuizReady={handleQuizMyNotesSuccess}
        onNoteSheetReady={handleNoteSheetReady}
        isLoading={isPreparingQuiz}
        setIsLoading={setIsPreparingQuiz}
      />
    );
  }

  if (TEACHER_TOOL_VIEWS.has(state.view)) {
    return (
      <TeacherToolsRouter
        view={state.view}
        mode={state.mode}
        config={state.config}
        selectedCourse={state.selectedCourse}
        selectedTopic={state.selectedTopic}
        selectedLevel={state.selectedLevel}
        quizDatabase={quizDatabase}
        teacherMode={state.teacherMode}
        toggleTeacherMode={toggleTeacherMode}
        onFeedback={() => setShowFeedbackModal(true)}
        onOpenSupport={() => setState(prev => ({ ...prev, view: 'support' }))}
        onBackToLanding={() => setState(prev => ({ ...prev, view: 'landing' }))}
        onNavigate={(targetView, updates) => setState(prev => ({ ...prev, view: targetView as ViewType, ...(updates || {}) }))}
        onStartTestGeneration={startTestGeneration}
        onStartQuizGeneration={startQuizGeneration}
      />
    );
  }


  if (state.view === 'landing') {
    return (
      <>
        <SEO />
        <LandingPage {...landingProps} />
      </>
    );
  }


  if (state.view === 'trophy_room') return <TrophyRoomView onBack={() => setState(prev => ({ ...prev, view: 'landing' }))} />;
  if (state.view === 'how_it_works') return <HowItWorksView
    onBack={() => setState(prev => ({ ...prev, view: isAuthenticated ? 'landing' : 'landing' }))}
    onOpenSupport={() => setState(prev => ({ ...prev, view: 'support' }))}
    onOpenFeatures={() => setState(prev => ({ ...prev, view: 'features' }))}
  />;

  if (state.view === 'features') {
    return <FeaturesView
      onBack={() => setState(prev => ({ ...prev, view: isAuthenticated ? 'landing' : 'landing' }))}
      onOpenHowItWorks={() => setState(prev => ({ ...prev, view: 'how_it_works' }))}
    />;
  }

  if (state.view === 'support') {
    return <SupportView
      onBack={() => setState(prev => ({ ...prev, view: isAuthenticated ? 'landing' : 'landing' }))}
      onFeedback={() => setShowFeedbackModal(true)}
      onOpenChangelog={() => setState(prev => ({ ...prev, view: 'changelog' }))}
    />;
  }

  if (state.view === 'open_resources') {
    return (
      <React.Suspense fallback={<ViewLoadingFallback />}>
        <OpenResourcesView
          onBack={() => setState(prev => ({ ...prev, view: isAuthenticated ? 'landing' : 'landing' }))}
          isAuthenticated={isAuthenticated}
          onSelectSimulation={(simView) => {
            setState(prev => ({
              ...prev,
              view: simView,
              mode: 'simulation',
              selectedCourse: prev.selectedCourse || 'General Chemistry',
            }));
          }}
        />
      </React.Suspense>
    );
  }

  if (state.view === 'ap_review_catalog') {
    return (
      <APReviewCatalogView
        onBack={() => setState(prev => ({ ...prev, view: 'practice_center' }))}
        onSelectCourse={(course, examParam) => {
          setSelectedApCourse(course);
          setSelectedApExamParam(examParam);
          setState(prev => ({ ...prev, view: 'ap_review_tutor' }));
        }}
        studentName={username}
      />
    );
  }

  if (state.view === 'ap_review_tutor' && selectedApCourse) {
    return (
      <APReviewTutorView
        course={selectedApCourse}
        examParam={selectedApExamParam}
        username={username}
        mascot={mascot}
        onBack={() => setState(prev => ({ ...prev, view: 'ap_review_catalog' }))}
      />
    );
  }

  if (state.view === 'learning_loop') {
    return (
      <LearningLoopView
        onBack={() => setState(prev => ({ ...prev, view: 'practice_center' }))}
        studentName={username}
      />
    );
  }

  if (state.view === 'concept_map') {
    return (
      <React.Suspense fallback={<ViewLoadingFallback />}>
        <ConceptMapView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          course={state.selectedCourse || undefined}
        />
      </React.Suspense>
    );
  }

  if (state.view === 'diagram_labeling') {
    return (
      <React.Suspense fallback={<ViewLoadingFallback />}>
        <DiagramLabelingView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          course={state.selectedCourse || undefined}
        />
      </React.Suspense>
    );
  }

  if (state.view === 'skeptic') {
    return (
      <React.Suspense fallback={<ViewLoadingFallback />}>
        <SkepticView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          course={state.selectedCourse || undefined}
        />
      </React.Suspense>
    );
  }

  if (state.view === 'tutor') {
    return (
      <React.Suspense fallback={<ViewLoadingFallback />}>
        <TutorView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          course={state.selectedCourse || undefined}
        />
      </React.Suspense>
    );
  }

  if (state.view === 'socratic') {
    return (
      <React.Suspense fallback={<ViewLoadingFallback />}>
        <SocraticView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          course={state.selectedCourse || undefined}
        />
      </React.Suspense>
    );
  }

  if (state.view === 'growth_coach') {
    return (
      <React.Suspense fallback={<ViewLoadingFallback />}>
        <GrowthCoachView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          course={state.selectedCourse || undefined}
        />
      </React.Suspense>
    );
  }

  if (state.view === 'changelog') return <ChangelogView onBack={() => setState(prev => ({ ...prev, view: 'landing' }))} />;

  if (state.view === 'settings') {
    return (
      <SettingsView
        username={username}
        onChangeUsername={(name) => {
          setUsername(name);
          localStorage.setItem('sp_username', name);
        }}
        mascot={mascot}
        onChangeMascot={(newMascot) => {
          setMascot(newMascot);
          localStorage.setItem('sp_mascot', newMascot);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        accessibilityMode={state.accessibilityMode}
        onToggleAccessibility={toggleAccessibility}
        teacherMode={state.teacherMode}
        onSetRole={setRole}
        onSignOut={handleSignOut}
        onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
        onResetProfile={() => {
          localStorage.clear();
          window.location.reload();
        }}
        onFlushHistory={() => {
          localStorage.removeItem('science_partner_session_history');
          localStorage.removeItem('science_partner_badges');
          localStorage.removeItem('science_partner_streak');
          setState(prev => ({ ...prev, view: 'landing' }));
        }}
      />
    );
  }

  if (state.view === 'worksheet') {
    if (isPreparingQuiz && state.questions.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-6">
          <SEO title="Designing Worksheet..." />
          <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Designing Worksheet</h3>
            <p className="text-slate-500 animate-pulse">Curating practice problems...</p>
          </div>
        </div>
      );
    }
    return (
      <>
        <SEO title={`Worksheet: ${state.selectedTopic || state.selectedCourse || 'Printable'}`} />
        <WorksheetView
          course={state.selectedCourse!}
          topic={state.selectedTopic!}
          questions={state.questions}
          onBack={handleSprintAwareQuit}
          onRefresh={handleRetrySameTopic}
        />
      </>
    );
  }

  if (state.view === 'frq') {
    if (isPreparingQuiz && state.questions.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-6">
          <SEO title="Creating Simulation..." />
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-amber-900 mb-2">Creating Simulation</h3>
            <p className="text-slate-500 animate-pulse">Designing experimental parameters...</p>
          </div>
        </div>
      );
    }
    return (
      <>
        <SEO title={`FRQ Practice: ${state.selectedTopic || state.selectedCourse || 'Written'}`} />
        <FRQView
          course={state.selectedCourse!}
          topic={state.selectedTopic!}
          question={state.questions[0]}
          durationSeconds={state.config.timerDuration || 0}
          onSubmit={(ans) => handleSubmit(ans)}
          onQuit={handleSessionQuit}
          onRefresh={() => handleRetrySameTopic()}
          onHarder={() => handleFlagQuestion(0, 'harder')}
          onEasier={() => handleFlagQuestion(0, 'easier')}
        />
      </>
    );
  }

  if (state.view === 'cer') {
    if (isPreparingQuiz && state.questions.length === 0) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-6">
          <SEO title="Generating Scenario..." />
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-indigo-900 mb-2">Generating Data Analysis Scenario</h3>
            <p className="text-slate-500 animate-pulse">Consulting scientific models...</p>
          </div>
        </div>
      );
    }
    return (
      <>
        <SEO title={`C.E.R. Analysis: ${state.selectedTopic || state.selectedCourse || 'Data Scenario'}`} />
        <CERView
          course={state.selectedCourse!}
          topic={state.selectedTopic!}
          question={state.questions[0]}
          durationSeconds={state.config.timerDuration ?? 1200}
          onSubmit={(ans) => handleSubmit(ans)}
          onQuit={handleSprintAwareQuit}
          onRefresh={() => handleRetrySameTopic()}
          onHarder={() => handleFlagQuestion(0, 'harder')}
          onEasier={() => handleFlagQuestion(0, 'easier')}
        />
      </>
    );
  }

  // --- MISSING VIEWS RESTORED ---

  if (state.view === 'flashcards') {
    return (
      <>
        <SEO title={`Flashcards: ${state.selectedTopic || state.selectedCourse || 'Recall Deck'}`} />
        <FlashcardView
          course={state.selectedCourse!}
          topic={state.selectedTopic!}
          flashcards={state.flashcards}
          onFinish={handleFlashcardFinish}
          onQuit={handleSprintAwareQuit}
          isLoading={isPreparingQuiz}
        />
      </>
    );
  }

  if (state.view === 'explanation') {
    return (
      <ExplanationView
        course={state.selectedCourse!}
        topic={state.selectedTopic!}
        history={state.chatHistory}
        onSendMessage={handleExplanationMessage}
        onFinish={handleExplanationFinish}
        onQuit={handleSprintAwareQuit}
        isLoading={isPreparingQuiz}
        onShareLink={handleShareLink}
        onStartFreshSession={handleCarryOverExplanationSession}
      />
    );
  }


  if (state.view === 'calculation') {
    const isSprintTask = !!state.currentSprintTaskId;
    return (
      <CalculationView
        course={state.selectedCourse!}
        topic={state.selectedTopic!}
        history={state.chatHistory}
        onSendMessage={handleCalculationMessage}
        onFinish={handleCalculationFinish}
        onQuit={isSprintTask ? handleStudySprintBackToDashboard : reset}
        isLoading={isPreparingQuiz}
        onShareLink={handleShareLink}
        isStudySprint={isSprintTask}
        onStartFreshSession={handleCarryOverCalculationSession}
      />
    );
  }

  if (state.view === 'results' && state.report) {
    return (
      <ResultsView
        report={state.report}
        topic={state.selectedTopic || "Practice Session"}
        course={state.selectedCourse!}
        onRetry={handleRetrySameTopic}
        onNewTopic={handleNewTopic}
        onChangeCourse={handleChangeCourse}
        onGoHome={reset}
      />
    );
  }

  if (state.view === 'analyzing') {
    const isSprintTask = !!state.currentSprintTaskId;
    return (
      <div className={`min-h-screen ${theme.light} flex flex-col items-center justify-center p-6 text-center`}>
        <SEO title="Analyzing Results..." />
        <div className={`bg-white p-12 rounded-[3rem] shadow-2xl max-w-lg w-full border ${theme.border}`}>
          <div className={`w-24 h-24 border-4 ${theme.border} border-t-transparent rounded-full animate-spin mx-auto mb-8`}></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Generating Feedback</h2>
          <p className="text-slate-500 italic">
            {isSprintTask
              ? 'Saving your results… Full feedback will be ready at the end of your Sprint.'
              : state.mode === 'frq'
                ? 'Evaluating response...'
                : 'Analyzing your performance...'}
          </p>
        </div>
      </div>
    );
  }

  if (state.view === 'quiz') {
    if (state.questions.length === 0) return null;

    const currentQuestion = state.questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === state.questions.length - 1;

    return (
      <div className={`min-h-screen ${theme.light} flex flex-col`}>
        <SEO title={state.selectedTopic || state.selectedCourse || "Quiz"} />
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button aria-label="Back" onClick={handleSprintAwareQuit} className="text-slate-400 hover:text-rose-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-800 leading-tight truncate max-w-[200px] md:max-w-md">{state.selectedTopic}</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{state.selectedCourse}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Visual Mode Toggle */}
            <button
              onClick={() => setState(prev => ({ ...prev, useVisuals: !prev.useVisuals }))}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-2 ${state.useVisuals
                ? 'bg-indigo-100 border-indigo-300 text-indigo-600'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600'
                }`}
              title="Enable Visual Diagrams in Feedback"
            >
              <span className={state.useVisuals ? 'opacity-100' : 'opacity-50'}>Visuals</span>
              <div className={`w-2 h-2 rounded-full ${state.useVisuals ? 'bg-indigo-500 animate-pulse' : 'bg-slate-300'}`}></div>
            </button>

            <button onClick={handleShareLink} className="text-slate-400 hover:text-indigo-500 transition-colors flex items-center gap-1" title="Share Deep Link">
              {linkCopied ? (
                <span className="text-xs font-bold text-indigo-500 animate-pulse">Copied!</span>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              )}
            </button>
            <div className="text-right">
              <span className={`text-2xl font-black ${theme.text}`}>{currentQuestionIndex + 1}</span>
              <span className="text-slate-300 font-bold mx-1">/</span>
              <span className="text-slate-400 font-bold">{state.questions.length}</span>
            </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-200">
          <div className={`h-full ${theme.primary} transition-all duration-300`} style={{ width: `${((currentQuestionIndex + 1) / state.questions.length) * 100}%` }}></div>
        </div>

        {/* Main Loading Case Check - This part is covered by the top-level loading check */}

        <main className="flex-1 max-w-3xl mx-auto w-full p-4 md:p-8 pb-32">
          {/* IMAGE DISPLAY (For Visual Mode) */}
          {state.analyzedImage && (
            <div className="mb-8">
              <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm inline-block">
                <img src={state.analyzedImage} alt="Uploaded Diagram" className="max-h-[300px] rounded-xl" />
              </div>
            </div>
          )}

          <QuestionCard
            course={state.selectedCourse!}
            question={currentQuestion}
            answer={state.answers[currentQuestionIndex] || ''}
            onAnswerChange={(val) => handleAnswerChange(currentQuestionIndex, val)}
            onFlag={() => handleFlagQuestion(currentQuestionIndex)}
            onEasier={() => handleFlagQuestion(currentQuestionIndex, 'easier')}
            onHarder={() => handleFlagQuestion(currentQuestionIndex, 'harder')}
            isSubmitted={false}
            isReplacing={replacingIndex === currentQuestionIndex}
            teacherMode={state.teacherMode}
          />
        </main>

        {/* Footer Controls */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-40">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 disabled:opacity-20 hover:bg-slate-50 transition-colors"
            >
              Previous
            </button>

            {isLastQuestion ? (
              <button
                onClick={() => handleSubmit()}
                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${theme.primary} shadow-${theme.primary}/30`}
              >
                Submit & Grade
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 ${theme.primary} shadow-${theme.primary}/30`}
              >
                Next Question
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- END RESTORED VIEWS ---

  if (state.view === 'level_selection') {
    return (
      <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#12141C] text-[#1A1C21] dark:text-[#F8F9FB] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-5xl w-full mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
          <button
            onClick={() => setState(prev => ({ ...prev, view: 'landing' }))}
            className="absolute top-[-60px] left-0 text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors flex items-center gap-2 text-xs font-black uppercase tracking-widest"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <h2 className="text-3xl md:text-5xl font-black text-[#1A1C21] dark:text-white mb-2 font-rounded">Select Grade Level</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-12">
            {state.mode === 'explanation' ? 'For Explanation Partner Session' :
              state.mode === 'flashcards' ? 'For Flashcard Study Deck' :
                state.mode === 'worksheet' ? 'For Printable Worksheet' :
                  state.mode === 'frq' ? 'For Written Response Practice' :
                    state.mode === 'cer' ? 'For C.E.R. Data Analysis' :
                      state.mode === 'multimode' ? 'For Topic Dashboard' :
                        'For Practice Session'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Show all levels for FRQ mode too (Written Response) */}
            <>
                <button
                  onClick={() => setState(prev => ({ ...prev, view: 'menu', selectedLevel: 'Elementary School' }))}
                  className="bento-card border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15171C] hover:border-orange-500/40 p-6 rounded-[2rem] text-left transition-all group flex flex-col h-full shadow-sm hover:shadow-md"
                >
                  <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform">
                    <Star className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1C21] dark:text-white mb-2 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors font-rounded">Elementary</h3>
                  <p className="text-slate-555 dark:text-slate-400 text-xs leading-relaxed">Fun and engaging science for Grades 3-5. Covers Plants, Animals, Earth, and Space.</p>
                </button>

                <button
                  onClick={() => setState(prev => ({ ...prev, view: 'menu', selectedLevel: 'Middle School' }))}
                  className="bento-card border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15171C] hover:border-amber-500/40 p-6 rounded-[2rem] text-left transition-all group flex flex-col h-full shadow-sm hover:shadow-md"
                >
                  <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 text-amber-500 dark:text-amber-400 group-hover:scale-110 transition-transform">
                    <Backpack className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-[#1A1C21] dark:text-white mb-2 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors font-rounded">Middle School</h3>
                  <p className="text-slate-555 dark:text-slate-400 text-xs leading-relaxed">Aligned with NGSS for Grades 6-8. Covers Life, Physical, and Earth Science.</p>
                </button>
            </>

            <button
              onClick={() => setState(prev => ({ ...prev, view: 'menu', selectedLevel: 'High School' }))}
              className="bento-card border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15171C] hover:border-emerald-500/40 p-6 rounded-[2rem] text-left transition-all group flex flex-col h-full shadow-sm hover:shadow-md"
            >
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-[#1A1C21] dark:text-white mb-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors font-rounded">High School & AP</h3>
              <p className="text-slate-555 dark:text-slate-400 text-xs leading-relaxed">Includes AP Biology, Chemistry, Physics, and Electives. AP Aligned and NGSS standards.</p>
            </button>
          </div>

          {/* EXPLORE TOPIC INPUT (New Location) */}
          <div className="w-full max-w-md mx-auto mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/50">
            <label className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3 block">Or explore a specific topic directly</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="e.g. Krebs Cycle, Kinematics..."
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 text-[#1A1C21] dark:text-white rounded-xl px-4 py-3 w-full focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-400 font-medium"
                onKeyDown={(e) => e.key === 'Enter' && customTopic && !isPreparingQuiz && handleCustomStart(customTopic)}
                disabled={isPreparingQuiz}
              />
              <button
                onClick={() => customTopic && !isPreparingQuiz && handleCustomStart(customTopic)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-50 w-24 flex items-center justify-center shadow-lg shadow-indigo-900/10"
              >
                {isPreparingQuiz ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "GO"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (REVIEW_GAME_VIEWS.has(state.view)) {
    return (
      <ReviewGamesRouter
        view={state.view}
        selectedCourse={state.selectedCourse}
        selectedTopic={state.selectedTopic}
        whoAmIPuzzles={state.whoAmIPuzzles}
        isPreparingQuiz={isPreparingQuiz}
        onBackToLanding={() => setState(prev => ({ ...prev, view: 'landing' }))}
        onNavigate={(view, mode) => setState(prev => ({ ...prev, view: view as ViewType, ...(mode ? { mode: mode as ModeType } : {}) }))}
        onStartWhoAmIGeneration={(course, topic, opts) => handleStartWhoAmIGeneration(course, topic, opts)}
        onLoadWhoAmIGame={(puzzles, loadedCourse, loadedTopic) => {
          setState(prev => ({
            ...prev,
            whoAmIPuzzles: puzzles,
            selectedCourse: loadedCourse as CourseType,
            selectedTopic: loadedTopic,
            view: 'who_am_i_preview'
          }));
        }}
        onUpdateWhoAmIPuzzles={(puzzles) => setState(prev => ({ ...prev, whoAmIPuzzles: puzzles }))}
        onStartWhoAmIGame={handleStartWhoAmIGame}
        onRegenerateWhoAmIClues={handleRegenerateWhoAmIClues}
      />
    );
  }


  if (state.view === 'multimode') {
    if (!state.selectedCourse || !state.selectedTopic) return <LandingPage {...landingProps} />;
    return (
      <>
        <SEO title={`${state.selectedTopic} Dashboard`} />
        <MultiModeView
          course={state.selectedCourse}
          topic={state.selectedTopic}
          multiModeState={state.multiModeState}
          onUpdateState={handleUpdateMultiModeState}
          onLaunchActivity={handleLaunchMultiModeActivity}
          onBack={() => setState(prev => ({ ...prev, view: 'menu', multiModeState: null }))}
          config={state.config}
          onUpdateConfig={(newConfig) => setState(prev => ({ ...prev, config: { ...prev.config, ...newConfig } }))}
          onShareLink={handleShareLink}
        />
      </>
    );
  }

  if (state.view === 'multimode_report') {
    if (!state.multiModeState) return <LandingPage {...landingProps} />;
    return (
      <MultiModeReport
        state={state.multiModeState}
        onClose={handleExitMultiModeReport}
      />
    );
  }

  // --- STUDY SPRINT VIEWS ---
  if (STUDY_SPRINT_VIEWS.has(state.view)) {
    return (
      <StudySprintRouter
        view={state.view}
        studySprintState={state.studySprintState}
        landingProps={landingProps}
        onStartSprint={handleStudySprintStart}
        onUpdateState={handleStudySprintUpdateState}
        onLaunchTask={handleStudySprintLaunchTask}
        onGenerateReport={handleStudySprintGenerateReport}
        onExit={handleStudySprintExit}
        onShareSprint={handleStudySprintShare}
        onBackToDashboard={handleStudySprintBackToDashboard}
        onBackToLanding={() => setState(prev => ({ ...prev, view: 'landing', mode: 'quiz' }))}
      />
    );
  }


  // --- SESSION HISTORY VIEWS ---
  if (state.view === 'session_history') {
    return (
      <>
        <SEO title="Session History" />
        <SessionHistoryView
          onBack={() => setState(prev => ({ ...prev, view: 'landing' }))}
          onViewSession={(sessionId) => {
            setSelectedSessionId(sessionId);
            setState(prev => ({ ...prev, view: 'session_detail' }));
          }}
        />
      </>
    );
  }

  if (state.view === 'session_detail' && selectedSessionId) {
    return (
      <>
        <SEO title="Session Review" />
        <SessionDetailView
          sessionId={selectedSessionId}
          onBack={() => setState(prev => ({ ...prev, view: 'session_history' }))}
        />
      </>
    );
  }

  if (state.view === 'research') {
    return (
      <ResearchModeView
        course={state.selectedCourse || 'AP Biology'} // Default if null
        config={state.config}
        onUpdateConfig={(updates) => setState(prev => ({ ...prev, config: { ...prev.config, ...updates } }))}
        onBack={() => setState(prev => ({ ...prev, view: 'landing', mode: 'quiz' }))}
      />
    );
  }


  // Menu View (Universal Input)
  if (state.view === 'menu') {
    const availableCourses = Object.keys(quizDatabase).filter(course => {
      if (state.selectedLevel === 'Elementary School') return course.includes('Elementary');
      if (state.selectedLevel === 'Middle School') return course.includes('Middle School');
      if (state.selectedLevel === 'High School') {
        return !course.includes('Elementary') && !course.includes('Middle School');
      }
      return true;
    });

    const getTopicsForCourse = (course: string) => {
      const courseData = quizDatabase[course as CourseType];
      return courseData ? Object.keys(courseData).flatMap(unit =>
        Object.keys(courseData[unit] || {})
      ) : [];
    };

    return (
      <>
        <SEO title={state.selectedCourse ? `${state.selectedCourse} Menu` : "Menu"} />
        <UniversalInputView
          level={state.selectedLevel || 'General'}
          availableCourses={availableCourses}
          getTopicsForCourse={getTopicsForCourse}
          onBack={() => setState(prev => ({ ...prev, view: 'landing', mode: 'quiz' }))}
          onBrowse={() => setState(prev => ({ ...prev, view: 'browse' }))}
          config={state.config}
          onUpdateConfig={(newConfig) => setState(prev => ({ ...prev, config: { ...prev.config, ...newConfig } }))}
          mode={state.mode}
          onUpdateMode={(newMode) => setState(prev => ({ ...prev, mode: newMode as ModeType }))}
          initialCourse={state.selectedCourse}
          initialTopic={state.selectedTopic}
          onStart={(course, topics, modeOverride) => {
            const rawMode = modeOverride || state.mode;
            const activeMode = (rawMode === 'worksheet' ? 'quiz' : rawMode) as ModeType;
            const courseKey = Object.keys(quizDatabase).find(k => k.toLowerCase() === course.toLowerCase());
            // Allow custom course input by casting to CourseType
            const finalCourse = (courseKey || course) as CourseType;

            // For multi-mode, only use first topic (doesn't support multi-topic yet)
            const singleTopic = Array.isArray(topics) ? topics[0] : topics;

            // Route to MultiModeView for Topic Dashboard
            if (activeMode === 'multimode') {
              handleStartMultiMode(finalCourse, singleTopic);
            } else if (activeMode === 'study_sprint') {
              // Study Sprint should not reach this point, but handle gracefully
              return;
            } else {
              startQuizGeneration(finalCourse, state.selectedUnit || 'Custom Session', topics, activeMode, undefined);
            }
          }}
        />
      </>
    );
  }

  // Browse View (Legacy Grid Layout)
  if (state.view === 'browse') {
    const availableCourses = Object.keys(quizDatabase).filter(course => {
      if (state.selectedLevel === 'Elementary School') return course.includes('Elementary');
      if (state.selectedLevel === 'Middle School') return course.includes('Middle School');
      if (state.selectedLevel === 'High School') {
        return !course.includes('Elementary') && !course.includes('Middle School');
      }
      return true;
    });

    const showCourse = (course: string) => {
      if (state.selectedLevel === 'Elementary School') return course.includes('Elementary');
      if (state.selectedLevel === 'Middle School') return course.includes('Middle School');
      if (state.selectedLevel === 'High School') {
        return !course.includes('Elementary') && !course.includes('Middle School');
      }
      return true;
    };

    const handleBrowseStart = (topic: string) => {
      // Redirect to Settings/UniversalInputView instead of auto-starting
      setState(prev => ({
        ...prev,
        view: 'menu',
        selectedUnit: prev.selectedUnit, // Preserve unit
        selectedTopic: topic
      }));
    };

    return (
      <div className={`min-h-screen ${!state.selectedCourse ? 'bg-slate-100' : theme.light} p-4 md:p-6 flex items-center justify-center transition-colors duration-500`}>
        <div className={`max-w-6xl w-full bg-white shadow-2xl rounded-[3rem] overflow-hidden border ${!state.selectedCourse ? 'border-slate-200' : theme.border}`}>
          <header className={`${!state.selectedCourse ? 'bg-slate-800' : theme.dark} text-white p-12 text-center relative overflow-hidden transition-colors duration-500`}>
            <div className="relative z-10">
              <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-2">Science Practice Partner</p>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                {state.mode === 'frq' ? 'Written Response' : 'Practice Session'}
              </h1>
            </div>
            <button onClick={() => setState(prev => ({ ...prev, view: 'menu' }))} className="absolute top-6 left-6 text-white bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-full backdrop-blur-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Search
            </button>
          </header>

          <div className="p-10">
            {!state.selectedCourse ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center mb-10">
                  <h3 className="text-2xl font-bold text-slate-800">Select Your Course</h3>
                </div>
                {/* High School Courses */}
                {state.selectedLevel === 'High School' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
                    {/* Life Sciences */}
                    <div className="space-y-4">
                      <h4 className="text-emerald-600 font-bold text-sm uppercase border-b border-emerald-100 pb-2">Life Sciences</h4>
                      {['AP Biology', 'Honors Biology', 'General Biology', 'Anatomy and Physiology', 'Marine Biology', 'Biotechnology', 'Forensic Science'].filter(showCourse).map(c => (
                        <button key={c} onClick={() => setState(prev => ({ ...prev, selectedCourse: c as CourseType }))} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 font-bold text-slate-700 text-sm transition-colors">{c}</button>
                      ))}
                    </div>

                    {/* Chemistry */}
                    <div className="space-y-4">
                      <h4 className="text-violet-600 font-bold text-sm uppercase border-b border-violet-100 pb-2">Chemistry</h4>
                      {['AP Chemistry', 'Honors Chemistry', 'General Chemistry'].filter(showCourse).map(c => (
                        <button key={c} onClick={() => setState(prev => ({ ...prev, selectedCourse: c as CourseType }))} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-violet-500 hover:bg-violet-50 font-bold text-slate-700 text-sm transition-colors">{c}</button>
                      ))}
                    </div>

                    {/* Physics */}
                    <div className="space-y-4">
                      <h4 className="text-indigo-600 font-bold text-sm uppercase border-b border-indigo-100 pb-2">Physics</h4>
                      {['AP Physics 1', 'AP Physics 2', 'AP Physics C', 'Honors Physics', 'General Physics', 'Physical Science'].filter(showCourse).map(c => (
                        <button key={c} onClick={() => setState(prev => ({ ...prev, selectedCourse: c as CourseType }))} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 font-bold text-slate-700 text-sm transition-colors">{c}</button>
                      ))}
                    </div>

                    {/* Earth & Space (inc. Enviro) */}
                    <div className="space-y-4">
                      <h4 className="text-amber-600 font-bold text-sm uppercase border-b border-amber-100 pb-2">Earth & Space</h4>
                      {['AP Environmental Science', 'Environmental Science', 'Honors Earth and Space Science', 'General Earth and Space Science'].filter(showCourse).map(c => (
                        <button key={c} onClick={() => setState(prev => ({ ...prev, selectedCourse: c as CourseType }))} className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-amber-500 hover:bg-amber-50 font-bold text-slate-700 text-sm transition-colors">{c}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // K-8 Courses
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableCourses.map(c => (
                      <button key={c} onClick={() => setState(prev => ({ ...prev, selectedCourse: c as CourseType }))} className="w-full text-left p-4 rounded-xl border border-slate-100 hover:border-orange-500 hover:bg-orange-50 font-bold text-slate-700">{c}</button>
                    ))}
                  </div>
                )}
              </div>
            ) : !state.selectedUnit ? (
              // Unit Selection
              <div className="space-y-4">
                <button onClick={() => setState(prev => ({ ...prev, selectedCourse: null }))} className="text-xs font-bold text-slate-400">← Back to Courses</button>
                <h3 className="text-2xl font-bold text-slate-800">{state.selectedCourse}: Select Unit</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(quizDatabase[state.selectedCourse as CourseType] || {}).map(unit => (
                    <button key={unit} onClick={() => setState(prev => ({ ...prev, selectedUnit: unit }))} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-500 font-bold text-left">{unit}</button>
                  ))}
                </div>
              </div>
            ) : (
              // Topic Selection
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <button onClick={() => setState(prev => ({ ...prev, selectedUnit: null }))} className="text-xs font-bold text-slate-400">← Back to Units</button>
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{state.selectedUnit}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Object.keys(quizDatabase[state.selectedCourse as CourseType]?.[state.selectedUnit!] || {}).map((topic: string) => (
                    <button key={topic} onClick={() => handleBrowseStart(topic)} className="p-3 rounded-xl border border-slate-100 hover:bg-indigo-50 text-slate-700 font-bold text-left">{topic}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback / Loading
  return null;
  };

  return (
    <>
      {wrapDashboard(
        <React.Suspense fallback={<ViewLoadingFallback />}>
          {renderMainView()}
        </React.Suspense>
      )}
      <ContactModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </>
  );
};

// Toast container that uses the context
const ToastContainerWrapper: React.FC = () => {
  const { toasts, removeToast } = useToast();
  return <ToastContainer toasts={toasts} onClose={removeToast} />;
};

// Main App wrapper with ToastProvider
const App: React.FC = () => {
  return (
    <ToastProvider>
      <ErrorBoundary
        fallbackTitle="Application Error"
        fallbackMessage="An unexpected issue occurred in the application."
        onReset={() => {
          window.location.href = window.location.pathname;
        }}
        resetLabel="Return to Application Home"
      >
        <AppContent />
      </ErrorBoundary>
      <ToastContainerWrapper />
    </ToastProvider>
  );
};

export default App;
