import React from 'react';
import { AppConfig, AppState, CourseType, ModeType, TestConfig } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';

const DocumentCreatorView = React.lazy(() => import('../DocumentCreatorView'));
const DocumentConfigView = React.lazy(() => import('../DocumentConfigView').then(m => ({ default: m.DocumentConfigView })));
const TestCreatorConfigView = React.lazy(() => import('../TestCreatorConfigView').then(m => ({ default: m.TestCreatorConfigView })));
const RubricTranslatorView = React.lazy(() => import('../RubricTranslatorView'));
const InterviewScriptView = React.lazy(() => import('../InterviewScriptView'));
const ReflectionView = React.lazy(() => import('../ReflectionView'));
const TeachersView = React.lazy(() => import('../TeachersView'));

export const TEACHER_TOOL_VIEWS = new Set<string>([
  'teachers',
  'interview',
  'reflection',
  'document_creator',
  'document_config',
  'test_creator_setup',
  'rubric_translator'
]);

interface TeacherToolsRouterProps {
  view: string;
  mode: ModeType;
  config: AppConfig;
  selectedCourse?: CourseType | null;
  selectedTopic?: string | null;
  selectedLevel?: string | null;
  quizDatabase: Record<CourseType, Record<string, Record<string, string[]>>>;
  teacherMode: boolean;
  toggleTeacherMode: () => void;
  onFeedback: () => void;
  onOpenSupport: () => void;
  onBackToLanding: () => void;
  onNavigate: (view: string, updates?: Partial<AppState>) => void;
  onStartTestGeneration: (config: TestConfig) => void;
  onStartQuizGeneration: (course: CourseType, unit: string, topic: string | string[], mode: ModeType, viewOverride?: AppState['view']) => void;
}

export const TeacherToolsRouter: React.FC<TeacherToolsRouterProps> = ({
  view,
  mode,
  config,
  selectedCourse,
  selectedTopic,
  selectedLevel,
  quizDatabase,
  teacherMode,
  toggleTeacherMode,
  onFeedback,
  onOpenSupport,
  onBackToLanding,
  onNavigate,
  onStartTestGeneration,
  onStartQuizGeneration
}) => {
  const availableCourses = Object.keys(quizDatabase).filter(course => {
    if (selectedLevel === 'Elementary School') return course.includes('Elementary');
    if (selectedLevel === 'Middle School') return course.includes('Middle School');
    if (selectedLevel === 'High School') {
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

  const renderTeacherTool = () => {
    if (view === 'interview') {
      return <InterviewScriptView onBack={onBackToLanding} />;
    }

  if (view === 'reflection') {
    return <ReflectionView onBack={onBackToLanding} />;
  }

  if (view === 'rubric_translator' && selectedCourse) {
    return (
      <RubricTranslatorView
        course={selectedCourse}
        onBack={onBackToLanding}
      />
    );
  }

  if (view === 'teachers') {
    return (
      <TeachersView
        onBack={onBackToLanding}
        onOpenSupport={onOpenSupport}
        onFeedback={onFeedback}
        teacherMode={teacherMode}
        onToggleTeacherMode={toggleTeacherMode}
        onOpenDocumentCreator={() => onNavigate('document_creator')}
        onSelectPreset={(preset) => onNavigate('document_config', {
          mode: preset.mode,
          selectedCourse: preset.course as CourseType,
          selectedTopic: preset.topic,
          config: {
            ...config,
            ...(preset.configUpdates || {})
          }
        })}
        onStartInterview={() => onStartQuizGeneration('Custom Practice', 'Interview', 'Assessment Script', 'interview', undefined)}
        onStartRubricTranslator={() => onNavigate('rubric_translator', { selectedCourse: selectedCourse || 'AP Biology' })}
        onOpenReviewGames={() => onNavigate('review_games')}
      />
    );
  }

  if (view === 'document_creator') {
    return (
      <DocumentCreatorView
        onBack={onBackToLanding}
        onSelectPreset={(preset) => onNavigate('document_config', {
          mode: preset.mode,
          selectedCourse: preset.course as CourseType,
          selectedTopic: preset.topic,
          config: {
            ...config,
            ...(preset.configUpdates || {})
          }
        })}
        onStartWorksheet={() => onNavigate('document_config', {
          mode: 'worksheet',
          config: { ...config, worksheetFocus: ['Standard Mixed'] }
        })}
        onStartCER={() => onNavigate('document_config', {
          mode: 'cer',
          config: { ...config, worksheetFocus: ['CER Practice'] }
        })}
        onStartFRQ={() => onNavigate('document_config', {
          mode: 'frq',
          config: { ...config, saCount: 5, mcqCount: 0, worksheetFocus: ['Standard Mixed'] }
        })}
        onStartCalculation={() => onNavigate('document_config', {
          mode: 'calculation',
          config: { ...config, worksheetFocus: ['Math & Problem Solving'] }
        })}
        onStartExitTicket={() => onNavigate('document_config', {
          mode: 'exit_ticket',
          config: { ...config, saCount: 1, mcqCount: 1, worksheetFocus: ['Standard Mixed'] }
        })}
        onStartTest={() => onNavigate('test_creator_setup', {
          mode: 'test_creator',
          config: { ...config, worksheetFocus: ['Standard Mixed'] }
        })}
      />
    );
  }

  if (view === 'document_config') {
    const documentMode = mode as 'worksheet' | 'flashcards' | 'note_sheet' | 'frq' | 'cer' | 'calculation' | 'exit_ticket' | 'test_creator';

    return (
      <DocumentConfigView
        mode={documentMode}
        config={config}
        onUpdateConfig={(newConfig) => onNavigate('document_config', { config: { ...config, ...newConfig } })}
        onStart={(course, topic) => {
          const courseKey = Object.keys(quizDatabase).find(k => k.toLowerCase() === course.toLowerCase());
          const finalCourse = (courseKey || course) as CourseType;
          const targetMode = mode === 'exit_ticket' ? 'worksheet' : mode;
          onStartQuizGeneration(finalCourse, 'Custom Session', topic, targetMode as 'worksheet' | 'frq' | 'cer' | 'calculation', 'worksheet');
        }}
        onBack={() => onNavigate('document_creator')}
        availableCourses={availableCourses}
        getTopicsForCourse={getTopicsForCourse}
        initialCourse={selectedCourse || undefined}
        initialTopic={selectedTopic || undefined}
      />
    );
  }

  if (view === 'test_creator_setup') {
      return (
        <TestCreatorConfigView
          onBack={() => onNavigate('document_creator')}
          availableCourses={availableCourses}
          onStartTest={(testConfig) => {
            onNavigate('analyzing', {
              testConfig,
              selectedCourse: testConfig.course as CourseType,
              selectedTopic: testConfig.unitTitle
            });
            onStartTestGeneration(testConfig);
          }}
        />
      );
    }

    return null;
  };

  const isHub = view === 'teachers';

  return (
    <ErrorBoundary
      fallbackTitle="Teacher Tool Error"
      fallbackMessage="An unexpected issue occurred within this Teacher Tool."
      onReset={() => {
        if (isHub) {
          onBackToLanding();
        } else {
          onNavigate('teachers');
        }
      }}
      resetLabel={isHub ? "Return to Home" : "Return to Teachers Hub"}
    >
      {renderTeacherTool()}
    </ErrorBoundary>
  );
};
