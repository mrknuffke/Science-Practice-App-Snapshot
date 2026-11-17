import { useEffect } from 'react';
import { MultiModeState, StudySprintState, LabState } from '../types';

interface UseAppPersistenceOptions {
  labState: LabState;
  multiModeState: MultiModeState | null;
  studySprintState: StudySprintState | null;
  onLabStateLoad: (state: LabState) => void;
  onMultiModeLoad: (state: MultiModeState) => void;
  onStudySprintLoad: (state: StudySprintState) => void;
}

/**
 * Custom hook to handle all localStorage persistence logic for the app.
 * Consolidates three separate persistence patterns into one unified hook.
 */
export const useAppPersistence = ({
  labState,
  multiModeState,
  studySprintState,
  onLabStateLoad,
  onMultiModeLoad,
  onStudySprintLoad
}: UseAppPersistenceOptions) => {

  // --- LAB STATE PERSISTENCE ---
  useEffect(() => {
    const savedLab = localStorage.getItem('labState');
    if (savedLab) {
      try {
        const parsed = JSON.parse(savedLab);
        onLabStateLoad(parsed);
      } catch (e) {
        console.error("Failed to parse saved lab state", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- restore saved state once on mount; the loaders are new functions each render and re-running would overwrite live state.
  }, []);

  useEffect(() => {
    localStorage.setItem('labState', JSON.stringify(labState));
  }, [labState]);

  // --- MULTI-MODE PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('science_bot_multimode_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isActive) {
          onMultiModeLoad(parsed);
        }
      } catch (e) {
        console.error("Failed to parse multimode state", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- restore saved state once on mount; the loaders are new functions each render and re-running would overwrite live state.
  }, []);

  useEffect(() => {
    if (multiModeState) {
      localStorage.setItem('science_bot_multimode_state', JSON.stringify(multiModeState));
    } else {
      localStorage.removeItem('science_bot_multimode_state');
    }
  }, [multiModeState]);

  // --- STUDY SPRINT PERSISTENCE ---
  useEffect(() => {
    const saved = localStorage.getItem('sp_study_sprint_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isActive) {
          onStudySprintLoad(parsed);
        }
      } catch (e) {
        console.error("Failed to parse study sprint state", e);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps -- restore saved state once on mount; the loaders are new functions each render and re-running would overwrite live state.
  }, []);

  useEffect(() => {
    if (studySprintState) {
      localStorage.setItem('sp_study_sprint_data', JSON.stringify(studySprintState));
    } else {
      localStorage.removeItem('sp_study_sprint_data');
    }
  }, [studySprintState]);
};
