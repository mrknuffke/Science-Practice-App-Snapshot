import { useCallback } from 'react';
import { StudySprintState, CourseType, TaskResponse, AppState, ModeType } from '../types';

interface UseStudySprintOptions {
  studySprintState: StudySprintState | null;
  currentSprintTaskId: string | null;
  onUpdateState: (updates: Partial<AppState>) => void;
  onStartQuizGeneration: (course: CourseType, unit: string, topic: string, mode: ModeType, viewOverride?: AppState['view'], seedQuestions?: string[]) => void;
  reset: () => void;
}

/**
 * Custom hook encapsulating Study Sprint state management and navigation logic.
 * Handles task launching, navigation, state updates, and sharing.
 */
export const useStudySprint = ({
  studySprintState,
  currentSprintTaskId,
  onUpdateState,
  onStartQuizGeneration,
  reset
}: UseStudySprintOptions) => {

  const handleStart = useCallback(() => {
    if (studySprintState?.isActive) {
      onUpdateState({ view: 'study_sprint_dashboard' });
    } else {
      onUpdateState({ view: 'study_sprint_setup' });
    }
  }, [studySprintState, onUpdateState]);

  const handleSprintStart = useCallback((sprintState: StudySprintState) => {
    onUpdateState({
      studySprintState: sprintState,
      view: 'study_sprint_dashboard'
    });
  }, [onUpdateState]);

  const handleUpdateState = useCallback((newState: StudySprintState) => {
    onUpdateState({ studySprintState: newState });
  }, [onUpdateState]);

  const handleLaunchTask = useCallback((taskId: string) => {
    const task = studySprintState?.tasks.find(t => t.id === taskId);
    if (!task || !studySprintState) return;

    // Mark task as in_progress and set current task
    const updatedTasks = studySprintState.tasks.map(t =>
      t.id === taskId ? { ...t, status: 'in_progress' as const, timestamp: Date.now() } : t
    );

    onUpdateState({
      currentSprintTaskId: taskId,
      studySprintState: {
        ...studySprintState,
        tasks: updatedTasks
      }
    });

    // Launch the appropriate mode for the task
    onStartQuizGeneration(
      studySprintState.course,
      studySprintState.units || studySprintState.topics,
      task.focus || studySprintState.topics,
      task.type,
      undefined
    );
  }, [studySprintState, onUpdateState, onStartQuizGeneration]);

  const handleGenerateReport = useCallback(() => {
    onUpdateState({ view: 'study_sprint_report' });
  }, [onUpdateState]);

  const handleExit = useCallback(() => {
    onUpdateState({
      view: 'landing',
      studySprintState: null
    });
  }, [onUpdateState]);

  const handleBackToDashboard = useCallback(() => {
    // If returning mid-task, reset that task to pending so user can re-attempt
    if (currentSprintTaskId && studySprintState) {
      const updatedTasks = studySprintState.tasks.map(t =>
        t.id === currentSprintTaskId ? { ...t, status: 'pending' as const } : t
      );

      onUpdateState({
        view: 'study_sprint_dashboard',
        currentSprintTaskId: null,
        questions: [],
        answers: {},
        report: null,
        chatHistory: [],
        studySprintState: {
          ...studySprintState,
          tasks: updatedTasks
        }
      });
    } else {
      onUpdateState({ view: 'study_sprint_dashboard', currentSprintTaskId: null });
    }
  }, [currentSprintTaskId, studySprintState, onUpdateState]);

  /**
   * Sprint-aware quit handler.
   * If inside a sprint task (currentSprintTaskId is set), returns to dashboard.
   * Otherwise performs the normal reset (go to landing/menu).
   */
  const handleSprintAwareQuit = useCallback(() => {
    if (currentSprintTaskId) {
      handleBackToDashboard();
    } else {
      reset();
    }
  }, [currentSprintTaskId, handleBackToDashboard, reset]);

  const handleShare = useCallback(() => {
    if (!studySprintState) return;

    const sprintConfig = {
      course: studySprintState.course,
      gradeLevel: studySprintState.gradeLevel,
      units: studySprintState.units,
      topics: studySprintState.topics,
      taskCount: studySprintState.tasks.length,
      subtopicFocus: studySprintState.subtopicFocus || ''
    };

    const encoded = btoa(JSON.stringify(sprintConfig));
    const url = `${window.location.origin}?sprintConfig=${encoded}`;

    navigator.clipboard.writeText(url).then(() => {
      alert('Study Sprint link copied to clipboard! Share it with students so they can start the same sprint.');
    }).catch(err => {
      console.error('Failed to copy:', err);
      alert('Failed to copy link. Please try again.');
    });
  }, [studySprintState]);

  /**
   * Completes the current sprint task and navigates to dashboard.
   * Called from mode completion handlers when inside a sprint.
   */
  const completeCurrentTask = useCallback((taskResponses: TaskResponse[], score: string, duration: number) => {
    if (!currentSprintTaskId || !studySprintState) return;

    const taskId = currentSprintTaskId;
    const updatedTasks = studySprintState.tasks.map(t =>
      t.id === taskId ? {
        ...t,
        status: 'completed' as const,
        responses: taskResponses,
        score,
        duration
      } : t
    );

    onUpdateState({
      studySprintState: {
        ...studySprintState,
        tasks: updatedTasks
      },
      view: 'study_sprint_dashboard',
      currentSprintTaskId: null
    });
  }, [currentSprintTaskId, studySprintState, onUpdateState]);

  return {
    handleStart,
    handleSprintStart,
    handleUpdateState,
    handleLaunchTask,
    handleGenerateReport,
    handleExit,
    handleBackToDashboard,
    handleSprintAwareQuit,
    handleShare,
    completeCurrentTask
  };
};
