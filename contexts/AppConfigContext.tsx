import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppConfig } from '../types';

interface AppConfigContextType {
  config: AppConfig;
  accessibilityMode: boolean;
  teacherMode: boolean;
  useVisuals: boolean;
  updateConfig: (updates: Partial<AppConfig>) => void;
  toggleAccessibility: () => void;
  toggleTeacherMode: () => void;
  toggleVisuals: () => void;
  resetConfig: () => void;
}

const AppConfigContext = createContext<AppConfigContextType | undefined>(undefined);

const DEFAULT_CONFIG: AppConfig = {
  mcqCount: 3,
  saCount: 1,
  errorCount: 1,
  timerDuration: 1200, // 20 mins default for FRQ/CER
  difficulty: 'Medium',
  worksheetStyle: 'Mixed',
  worksheetFocus: ['Standard Mixed'],
  questionStyle: 'Standard',
  analogyCount: 0,
  oddOneOutCount: 0
};

export const AppConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(() => {
    // Try to load from localStorage
    const saved = localStorage.getItem('sp_app_config');
    if (saved) {
      try {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      } catch {
        return DEFAULT_CONFIG;
      }
    }
    return DEFAULT_CONFIG;
  });

  const [accessibilityMode, setAccessibilityMode] = useState(() => {
    const saved = localStorage.getItem('sp_accessibility_mode');
    return saved === 'true';
  });

  const [teacherMode, setTeacherMode] = useState(false);

  const [useVisuals, setUseVisuals] = useState(false); // Default: Text only to save tokens

  // Persist config changes to localStorage
  useEffect(() => {
    localStorage.setItem('sp_app_config', JSON.stringify(config));
  }, [config]);

  // Persist accessibility mode
  useEffect(() => {
    localStorage.setItem('sp_accessibility_mode', String(accessibilityMode));

    // Apply accessibility mode to document
    if (accessibilityMode) {
      document.body.classList.add('accessibility-mode');
    } else {
      document.body.classList.remove('accessibility-mode');
    }
  }, [accessibilityMode]);

  const updateConfig = (updates: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const toggleAccessibility = () => {
    setAccessibilityMode(prev => !prev);
  };

  const toggleTeacherMode = () => {
    setTeacherMode(prev => !prev);
  };

  const toggleVisuals = () => {
    setUseVisuals(prev => !prev);
  };

  const resetConfig = () => {
    setConfig(DEFAULT_CONFIG);
  };

  const value: AppConfigContextType = {
    config,
    accessibilityMode,
    teacherMode,
    useVisuals,
    updateConfig,
    toggleAccessibility,
    toggleTeacherMode,
    toggleVisuals,
    resetConfig
  };

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};
