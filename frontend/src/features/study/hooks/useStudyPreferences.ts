import { useCallback, useEffect, useMemo, useState } from 'react';

type AnswerSide = 'front' | 'back';

export type StudyPreferences = {
  allowMC: boolean;
  allowTyped: boolean;
  autoAdvance: boolean;
  showCardProgress: boolean;
  autoRead: boolean;
  readLanguage: string;
  showKeyboardShortcuts: boolean;
  answerSide: AnswerSide;
};

export const STUDY_PREFERENCES_KEY = 'smartlearn-study-preferences';

const DEFAULT_STUDY_PREFERENCES: StudyPreferences = {
  allowMC: true,
  allowTyped: true,
  autoAdvance: true,
  showCardProgress: false,
  autoRead: false,
  readLanguage: 'en-US',
  showKeyboardShortcuts: true,
  answerSide: 'back',
};

const loadStoredPreferences = (): StudyPreferences => {
  if (typeof window === 'undefined') return { ...DEFAULT_STUDY_PREFERENCES };
  try {
    const raw = window.localStorage.getItem(STUDY_PREFERENCES_KEY);
    if (!raw) return { ...DEFAULT_STUDY_PREFERENCES };
    const parsed = JSON.parse(raw) as Partial<StudyPreferences>;
    return { ...DEFAULT_STUDY_PREFERENCES, ...parsed };
  } catch (error) {
    console.error('Không thể đọc tùy chọn học tập từ localStorage', error);
    return { ...DEFAULT_STUDY_PREFERENCES };
  }
};

export interface StudyPreferenceHandlers {
  setAllowMC: (value: boolean) => void;
  setAllowTyped: (value: boolean) => void;
  setAutoAdvance: (value: boolean) => void;
  setShowCardProgress: (value: boolean) => void;
  setAutoRead: (value: boolean) => void;
  setReadLanguage: (value: string) => void;
  setShowKeyboardShortcuts: (value: boolean) => void;
  setAnswerSide: (side: AnswerSide) => void;
}

export function useStudyPreferences() {
  const [preferences, setPreferences] = useState<StudyPreferences>(() => loadStoredPreferences());

  const updatePreference = useCallback(<K extends keyof StudyPreferences>(key: K, value: StudyPreferences[K]) => {
    setPreferences(prev => {
      const next: StudyPreferences = { ...prev, [key]: value };
      if (!next.allowMC && !next.allowTyped) {
        if (key === 'allowMC') {
          next.allowTyped = true;
        } else if (key === 'allowTyped') {
          next.allowMC = true;
        } else {
          next.allowMC = true;
        }
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STUDY_PREFERENCES_KEY, JSON.stringify(preferences));
    } catch (error) {
      console.error('Không thể lưu tùy chọn học tập vào localStorage', error);
    }
  }, [preferences]);

  const handlers: StudyPreferenceHandlers = useMemo(() => ({
    setAllowMC: (value: boolean) => updatePreference('allowMC', value),
    setAllowTyped: (value: boolean) => updatePreference('allowTyped', value),
    setAutoAdvance: (value: boolean) => updatePreference('autoAdvance', value),
    setShowCardProgress: (value: boolean) => updatePreference('showCardProgress', value),
    setAutoRead: (value: boolean) => updatePreference('autoRead', value),
    setReadLanguage: (value: string) => updatePreference('readLanguage', value),
    setShowKeyboardShortcuts: (value: boolean) => updatePreference('showKeyboardShortcuts', value),
    setAnswerSide: (side: AnswerSide) => updatePreference('answerSide', side),
  }), [updatePreference]);

  return {
    preferences,
    handlers,
  } as const;
}
