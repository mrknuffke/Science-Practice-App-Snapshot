/**
 * useSimulationMessage Hook
 * Manages toast message state for simulations
 */

import { useState, useCallback } from 'react';

export type MessageType = 'info' | 'success' | 'error';

export interface SimulationMessage {
  text: string;
  type: MessageType;
}

export function useSimulationMessage() {
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<MessageType>('info');

  const showMessage = useCallback((text: string, type: MessageType = 'info') => {
    setMessage(text);
    setMessageType(type);
  }, []);

  const clearMessage = useCallback(() => {
    setMessage('');
  }, []);

  return {
    message,
    messageType,
    showMessage,
    clearMessage,
  };
}
