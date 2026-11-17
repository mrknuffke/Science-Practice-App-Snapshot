import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionResultAlternative {
  transcript: string;
}

interface SpeechRecognitionResultItem {
  0: SpeechRecognitionResultAlternative;
  length: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionEventLike {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEventLike {
  error?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface UseSpeechRecognitionOptions {
  value: string;
  onChange: (nextValue: string) => void;
  onUnsupported?: () => void;
  onStart?: () => void;
}

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  hasSpeechSupport: boolean;
  toggleListening: (e?: { preventDefault?: () => void }) => void;
  stopListening: () => void;
}

/**
 * Shared Web Speech API dictation hook used across Personae, Explanation,
 * Calculation, and ResponseEditor views. Appends live transcripts to the
 * text present when recording started and cleans up on unmount.
 */
export function useSpeechRecognition({
  value,
  onChange,
  onUnsupported,
  onStart,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const startValueRef = useRef<string>('');
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const win = window as unknown as WindowWithSpeechRecognition;
    const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    setHasSpeechSupport(true);
    const recognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      const prefix = startValueRef.current;
      const spacer = prefix.length > 0 && !/\s$/.test(prefix) ? ' ' : '';
      onChangeRef.current(prefix + spacer + transcript);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, []);

  const stopListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
    }
  }, [isListening]);

  const toggleListening = useCallback(
    (e?: { preventDefault?: () => void }) => {
      e?.preventDefault?.();
      if (!hasSpeechSupport) {
        onUnsupported?.();
        return;
      }
      if (isListening) {
        recognitionRef.current?.stop();
      } else {
        startValueRef.current = value;
        recognitionRef.current?.start();
        onStart?.();
      }
    },
    [hasSpeechSupport, isListening, value, onUnsupported, onStart],
  );

  return {
    isListening,
    hasSpeechSupport,
    toggleListening,
    stopListening,
  };
}

