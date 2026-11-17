import { useState, useCallback } from 'react';

interface UseErrorHandlerReturn {
  error: string | null;
  showError: (message: string | null) => void;
  clearError: () => void;
  hasError: boolean;
}

/**
 * Hook to manage error state and display error modals
 * Centralizes error handling across the application
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string | null) => {
    setError(message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    showError,
    clearError,
    hasError: error !== null
  };
};
