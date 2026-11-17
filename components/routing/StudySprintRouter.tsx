import React from 'react';
import { StudySprintState } from '../../types';
import SEO from '../SEO';
import { LandingPage, LandingPageProps } from '../LandingPage';
import { ErrorBoundary } from '../ErrorBoundary';

const StudySprintSetupView = React.lazy(() => import('../StudySprintSetupView').then(m => ({ default: m.StudySprintSetupView })));
const StudySprintDashboard = React.lazy(() => import('../StudySprintDashboard').then(m => ({ default: m.StudySprintDashboard })));
const StudySprintReport = React.lazy(() => import('../StudySprintReport').then(m => ({ default: m.StudySprintReport })));

export const STUDY_SPRINT_VIEWS = new Set<string>([
  'study_sprint_setup',
  'study_sprint_dashboard',
  'study_sprint_report'
]);

interface StudySprintRouterProps {
  view: string;
  studySprintState: StudySprintState | null;
  landingProps: LandingPageProps;
  onStartSprint: (sprintState: StudySprintState) => void;
  onUpdateState: (newState: StudySprintState) => void;
  onLaunchTask: (taskId: string) => void;
  onGenerateReport: () => void;
  onExit: () => void;
  onShareSprint: () => void;
  onBackToDashboard: () => void;
  onBackToLanding: () => void;
}

export const StudySprintRouter: React.FC<StudySprintRouterProps> = ({
  view,
  studySprintState,
  landingProps,
  onStartSprint,
  onUpdateState,
  onLaunchTask,
  onGenerateReport,
  onExit,
  onShareSprint,
  onBackToDashboard,
  onBackToLanding
}) => {
  const renderSprintView = () => {
    if (view === 'study_sprint_setup') {
      return (
        <>
          <SEO title="Study Sprint Setup" />
          <StudySprintSetupView
            onStartSprint={onStartSprint}
            onBack={onBackToLanding}
          />
        </>
      );
    }

    if (view === 'study_sprint_dashboard') {
      if (!studySprintState) return <LandingPage {...landingProps} />;
      return (
        <>
          <SEO title={`Study Sprint: ${studySprintState.topics}`} />
          <StudySprintDashboard
            studySprintState={studySprintState}
            onUpdateState={onUpdateState}
            onLaunchTask={onLaunchTask}
            onGenerateReport={onGenerateReport}
            onExit={onExit}
            onShareSprint={onShareSprint}
          />
        </>
      );
    }

    if (view === 'study_sprint_report') {
      if (!studySprintState) return <LandingPage {...landingProps} />;
      return (
        <>
          <SEO title="Study Sprint Report" />
          <StudySprintReport
            studySprintState={studySprintState}
            onBack={onBackToDashboard}
          />
        </>
      );
    }

    return null;
  };

  return (
    <ErrorBoundary
      fallbackTitle="Study Sprint Error"
      fallbackMessage="An unexpected issue occurred within this Study Sprint session."
      onReset={onBackToLanding}
      resetLabel="Return to Home"
    >
      {renderSprintView()}
    </ErrorBoundary>
  );
};

