/**
 * Message Toast Component
 * Reusable toast notification for simulation feedback
 */

import React, { useEffect } from 'react';
import { CheckCircle, Info, AlertCircle } from 'lucide-react';

export interface MessageToastProps {
  message: string;
  type: 'info' | 'success' | 'error';
  duration?: number;
  onDismiss?: () => void;
}

const MessageToast: React.FC<MessageToastProps> = ({
  message,
  type,
  duration = 3000,
  onDismiss,
}) => {
  useEffect(() => {
    if (!message || !onDismiss) return;

    const timer = setTimeout(() => {
      onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!message) return null;

  const styles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
  };

  const style = styles[type];

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50
        ${style.bg} ${style.border} border-2 rounded-xl shadow-2xl px-6 py-4
        flex items-center gap-3 max-w-md animate-slide-up`}
      role="alert"
      aria-live="polite"
    >
      {style.icon}
      <p className={`font-semibold ${style.text}`}>{message}</p>
    </div>
  );
};

export default MessageToast;
