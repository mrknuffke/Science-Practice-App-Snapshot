import { AppConfig, ChatMessage, MultiModeState } from '../../types';

export interface MultiModeViewState {
  loading: boolean;
  uploadedContext?: string;
  linkCopied: boolean;
  showExplanationPanel: boolean;
  showCalculationPanel: boolean;
  explanationChat: ChatMessage[];
  calculationChat: ChatMessage[];
  explanationInput: string;
  calculationInput: string;
  explanationLoading: boolean;
  calculationLoading: boolean;
}

export const initialMultiModeState: MultiModeViewState = {
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
};

export function createInitialMultiModeState(
  multiModeState: MultiModeState | null | undefined,
  config: AppConfig
): MultiModeViewState {
  return {
    loading: false,
    uploadedContext: multiModeState?.overview?.uploadedContext,
    linkCopied: false,
    showExplanationPanel: config.showExplanationPanel !== false,
    showCalculationPanel: config.showCalculationPanel !== false,
    explanationChat: multiModeState?.partnerState?.explanationChat || [],
    calculationChat: multiModeState?.partnerState?.calculationChat || [],
    explanationInput: '',
    calculationInput: '',
    explanationLoading: false,
    calculationLoading: false,
  };
}

export type MultiModeViewAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_UPLOADED_CONTEXT'; payload: string | undefined }
  | { type: 'SET_LINK_COPIED'; payload: boolean }
  | { type: 'SET_SHOW_EXPLANATION_PANEL'; payload: boolean }
  | { type: 'SET_SHOW_CALCULATION_PANEL'; payload: boolean }
  | { type: 'SET_EXPLANATION_CHAT'; payload: ChatMessage[] }
  | { type: 'SET_CALCULATION_CHAT'; payload: ChatMessage[] }
  | { type: 'SET_EXPLANATION_INPUT'; payload: string }
  | { type: 'SET_CALCULATION_INPUT'; payload: string }
  | { type: 'SET_EXPLANATION_LOADING'; payload: boolean }
  | { type: 'SET_CALCULATION_LOADING'; payload: boolean }
  | { type: 'SEND_EXPLANATION_START'; userMessage: ChatMessage }
  | { type: 'SEND_EXPLANATION_SUCCESS'; modelMessage: ChatMessage }
  | { type: 'SEND_EXPLANATION_ERROR'; errorMessage: ChatMessage }
  | { type: 'SEND_CALCULATION_START'; userMessage: ChatMessage }
  | { type: 'SEND_CALCULATION_SUCCESS'; modelMessage: ChatMessage }
  | { type: 'SEND_CALCULATION_ERROR'; errorMessage: ChatMessage };

export function multiModeReducer(
  state: MultiModeViewState,
  action: MultiModeViewAction
): MultiModeViewState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_UPLOADED_CONTEXT':
      return { ...state, uploadedContext: action.payload };
    case 'SET_LINK_COPIED':
      return { ...state, linkCopied: action.payload };
    case 'SET_SHOW_EXPLANATION_PANEL':
      return { ...state, showExplanationPanel: action.payload };
    case 'SET_SHOW_CALCULATION_PANEL':
      return { ...state, showCalculationPanel: action.payload };
    case 'SET_EXPLANATION_CHAT':
      return { ...state, explanationChat: action.payload };
    case 'SET_CALCULATION_CHAT':
      return { ...state, calculationChat: action.payload };
    case 'SET_EXPLANATION_INPUT':
      return { ...state, explanationInput: action.payload };
    case 'SET_CALCULATION_INPUT':
      return { ...state, calculationInput: action.payload };
    case 'SET_EXPLANATION_LOADING':
      return { ...state, explanationLoading: action.payload };
    case 'SET_CALCULATION_LOADING':
      return { ...state, calculationLoading: action.payload };
    case 'SEND_EXPLANATION_START':
      return {
        ...state,
        explanationChat: [...state.explanationChat, action.userMessage],
        explanationInput: '',
        explanationLoading: true,
      };
    case 'SEND_EXPLANATION_SUCCESS':
      return {
        ...state,
        explanationChat: [...state.explanationChat, action.modelMessage],
        explanationLoading: false,
      };
    case 'SEND_EXPLANATION_ERROR':
      return {
        ...state,
        explanationChat: [...state.explanationChat, action.errorMessage],
        explanationLoading: false,
      };
    case 'SEND_CALCULATION_START':
      return {
        ...state,
        calculationChat: [...state.calculationChat, action.userMessage],
        calculationInput: '',
        calculationLoading: true,
      };
    case 'SEND_CALCULATION_SUCCESS':
      return {
        ...state,
        calculationChat: [...state.calculationChat, action.modelMessage],
        calculationLoading: false,
      };
    case 'SEND_CALCULATION_ERROR':
      return {
        ...state,
        calculationChat: [...state.calculationChat, action.errorMessage],
        calculationLoading: false,
      };
    default:
      return state;
  }
}
