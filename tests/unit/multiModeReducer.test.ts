import { describe, it, expect } from 'vitest';
import {
  multiModeReducer,
  createInitialMultiModeState,
  initialMultiModeState,
  MultiModeViewState,
} from '../../components/multimode/multiModeReducer';
import { AppConfig, ChatMessage, MultiModeState } from '../../types';

describe('multiModeReducer', () => {
  const dummyConfig: AppConfig = {
    difficulty: 'Medium',
    mcqCount: 5,
    saCount: 2,
    errorCount: 1,
    persona: 'Socratic',
    showExplanationPanel: true,
    showCalculationPanel: true,
  };

  describe('createInitialMultiModeState', () => {
    it('creates default state when multiModeState is null and config has panels enabled', () => {
      const state = createInitialMultiModeState(null, dummyConfig);
      expect(state).toEqual({
        loading: false,
        uploadedContext: undefined,
        linkCopied: false,
        showExplanationPanel: true,
        showCalculationPanel: true,
        explanationChat: [],
        calculationChat: [],
        explanationInput: '',
        calculationInput: '',
        explanationLoading: false,
        calculationLoading: false,
      });
    });

    it('honors config panel toggles when false', () => {
      const configDisabled: AppConfig = {
        ...dummyConfig,
        showExplanationPanel: false,
        showCalculationPanel: false,
      };
      const state = createInitialMultiModeState(null, configDisabled);
      expect(state.showExplanationPanel).toBe(false);
      expect(state.showCalculationPanel).toBe(false);
    });

    it('populates initial state from existing multiModeState', () => {
      const mockExisting: MultiModeState = {
        isActive: true,
        course: 'AP Biology',
        topic: 'Enzymes',
        overview: {
          summary: 'Overview of enzyme catalytic mechanisms.',
          keyPoints: ['Active sites', 'Substrate binding'],
          suggestedActivities: ['Quiz'],
          resources: [],
          uploadedContext: 'Lab manual notes for Catalase test.',
        },
        activityLog: [],
        partnerState: {
          explanationChat: [{ role: 'user', text: 'How do inhibitors work?' }],
          calculationChat: [{ role: 'user', text: 'Calculate rate.' }],
        },
      };

      const state = createInitialMultiModeState(mockExisting, dummyConfig);
      expect(state.uploadedContext).toBe('Lab manual notes for Catalase test.');
      expect(state.explanationChat).toHaveLength(1);
      expect(state.explanationChat[0].text).toBe('How do inhibitors work?');
      expect(state.calculationChat).toHaveLength(1);
      expect(state.calculationChat[0].text).toBe('Calculate rate.');
    });
  });

  describe('basic state setters', () => {
    it('handles SET_LOADING', () => {
      const next = multiModeReducer(initialMultiModeState, {
        type: 'SET_LOADING',
        payload: true,
      });
      expect(next.loading).toBe(true);
    });

    it('handles SET_UPLOADED_CONTEXT', () => {
      const next = multiModeReducer(initialMultiModeState, {
        type: 'SET_UPLOADED_CONTEXT',
        payload: 'Extracted context text',
      });
      expect(next.uploadedContext).toBe('Extracted context text');
    });

    it('handles SET_LINK_COPIED', () => {
      const next = multiModeReducer(initialMultiModeState, {
        type: 'SET_LINK_COPIED',
        payload: true,
      });
      expect(next.linkCopied).toBe(true);
    });

    it('handles SET_SHOW_EXPLANATION_PANEL and SET_SHOW_CALCULATION_PANEL', () => {
      let state = multiModeReducer(initialMultiModeState, {
        type: 'SET_SHOW_EXPLANATION_PANEL',
        payload: false,
      });
      expect(state.showExplanationPanel).toBe(false);

      state = multiModeReducer(state, {
        type: 'SET_SHOW_CALCULATION_PANEL',
        payload: false,
      });
      expect(state.showCalculationPanel).toBe(false);
    });

    it('handles SET_EXPLANATION_INPUT and SET_CALCULATION_INPUT', () => {
      let state = multiModeReducer(initialMultiModeState, {
        type: 'SET_EXPLANATION_INPUT',
        payload: 'Question draft',
      });
      expect(state.explanationInput).toBe('Question draft');

      state = multiModeReducer(state, {
        type: 'SET_CALCULATION_INPUT',
        payload: 'Formula draft',
      });
      expect(state.calculationInput).toBe('Formula draft');
    });

    it('handles SET_EXPLANATION_LOADING and SET_CALCULATION_LOADING', () => {
      let state = multiModeReducer(initialMultiModeState, {
        type: 'SET_EXPLANATION_LOADING',
        payload: true,
      });
      expect(state.explanationLoading).toBe(true);

      state = multiModeReducer(state, {
        type: 'SET_CALCULATION_LOADING',
        payload: true,
      });
      expect(state.calculationLoading).toBe(true);
    });

    it('handles SET_EXPLANATION_CHAT and SET_CALCULATION_CHAT', () => {
      const testChat: ChatMessage[] = [{ role: 'user', text: 'Hello' }];
      let state = multiModeReducer(initialMultiModeState, {
        type: 'SET_EXPLANATION_CHAT',
        payload: testChat,
      });
      expect(state.explanationChat).toEqual(testChat);

      state = multiModeReducer(state, {
        type: 'SET_CALCULATION_CHAT',
        payload: testChat,
      });
      expect(state.calculationChat).toEqual(testChat);
    });
  });

  describe('explanation partner chat cycle', () => {
    it('processes SEND_EXPLANATION_START correctly', () => {
      const startingState: MultiModeViewState = {
        ...initialMultiModeState,
        explanationInput: 'Explain activation energy',
        explanationLoading: false,
      };

      const userMsg: ChatMessage = { role: 'user', text: 'Explain activation energy' };
      const next = multiModeReducer(startingState, {
        type: 'SEND_EXPLANATION_START',
        userMessage: userMsg,
      });

      expect(next.explanationChat).toEqual([userMsg]);
      expect(next.explanationInput).toBe('');
      expect(next.explanationLoading).toBe(true);
    });

    it('processes SEND_EXPLANATION_SUCCESS correctly', () => {
      const inFlightState: MultiModeViewState = {
        ...initialMultiModeState,
        explanationChat: [{ role: 'user', text: 'Explain activation energy' }],
        explanationLoading: true,
      };

      const modelMsg: ChatMessage = { role: 'model', text: 'Activation energy is the barrier...' };
      const next = multiModeReducer(inFlightState, {
        type: 'SEND_EXPLANATION_SUCCESS',
        modelMessage: modelMsg,
      });

      expect(next.explanationChat).toHaveLength(2);
      expect(next.explanationChat[1]).toEqual(modelMsg);
      expect(next.explanationLoading).toBe(false);
    });

    it('processes SEND_EXPLANATION_ERROR correctly', () => {
      const inFlightState: MultiModeViewState = {
        ...initialMultiModeState,
        explanationChat: [{ role: 'user', text: 'Explain activation energy' }],
        explanationLoading: true,
      };

      const errorMsg: ChatMessage = { role: 'model', text: 'Error responding.' };
      const next = multiModeReducer(inFlightState, {
        type: 'SEND_EXPLANATION_ERROR',
        errorMessage: errorMsg,
      });

      expect(next.explanationChat).toHaveLength(2);
      expect(next.explanationChat[1]).toEqual(errorMsg);
      expect(next.explanationLoading).toBe(false);
    });
  });

  describe('calculation partner chat cycle', () => {
    it('processes SEND_CALCULATION_START correctly', () => {
      const startingState: MultiModeViewState = {
        ...initialMultiModeState,
        calculationInput: 'Compute Delta G',
        calculationLoading: false,
      };

      const userMsg: ChatMessage = { role: 'user', text: 'Compute Delta G' };
      const next = multiModeReducer(startingState, {
        type: 'SEND_CALCULATION_START',
        userMessage: userMsg,
      });

      expect(next.calculationChat).toEqual([userMsg]);
      expect(next.calculationInput).toBe('');
      expect(next.calculationLoading).toBe(true);
    });

    it('processes SEND_CALCULATION_SUCCESS correctly', () => {
      const inFlightState: MultiModeViewState = {
        ...initialMultiModeState,
        calculationChat: [{ role: 'user', text: 'Compute Delta G' }],
        calculationLoading: true,
      };

      const modelMsg: ChatMessage = { role: 'model', text: 'Delta G = Delta H - T * Delta S' };
      const next = multiModeReducer(inFlightState, {
        type: 'SEND_CALCULATION_SUCCESS',
        modelMessage: modelMsg,
      });

      expect(next.calculationChat).toHaveLength(2);
      expect(next.calculationChat[1]).toEqual(modelMsg);
      expect(next.calculationLoading).toBe(false);
    });

    it('processes SEND_CALCULATION_ERROR correctly', () => {
      const inFlightState: MultiModeViewState = {
        ...initialMultiModeState,
        calculationChat: [{ role: 'user', text: 'Compute Delta G' }],
        calculationLoading: true,
      };

      const errorMsg: ChatMessage = { role: 'model', text: 'Error calculating.' };
      const next = multiModeReducer(inFlightState, {
        type: 'SEND_CALCULATION_ERROR',
        errorMessage: errorMsg,
      });

      expect(next.calculationChat).toHaveLength(2);
      expect(next.calculationChat[1]).toEqual(errorMsg);
      expect(next.calculationLoading).toBe(false);
    });
  });
});
