import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { LanguageCode } from '../types';
import { translations, TranslationDictionary } from '../i18n/translations';

export type FontSize = 'sm' | 'md' | 'lg' | 'xl';

interface AccessibilityContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: TranslationDictionary;
  announce: (message: string) => void;
  speakText: (text: string, langCode?: string) => void;
  stopSpeaking: () => void;
  isSpeaking: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('smart_campus_high_contrast') === 'true';
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    return (localStorage.getItem('smart_campus_font_size') as FontSize) || 'md';
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    return (localStorage.getItem('smart_campus_language') as LanguageCode) || 'en';
  });

  const [liveAnnouncement, setLiveAnnouncement] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Apply high contrast class to HTML element
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    localStorage.setItem('smart_campus_high_contrast', String(highContrast));
  }, [highContrast]);

  // Apply font scale class to HTML element
  useEffect(() => {
    document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    document.documentElement.classList.add(`font-scale-${fontSize}`);
    localStorage.setItem('smart_campus_font_size', fontSize);
  }, [fontSize]);

  // Apply language
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('smart_campus_language', language);
  }, [language]);

  const toggleHighContrast = useCallback(() => {
    setHighContrast(prev => !prev);
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
  }, []);

  // Screen reader announcer via aria-live
  const announce = useCallback((message: string) => {
    setLiveAnnouncement('');
    setTimeout(() => {
      setLiveAnnouncement(message);
    }, 50);
  }, []);

  // Web Speech API for visually impaired audio narration
  const speakText = useCallback((text: string, langCode?: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const targetLang = langCode || (language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : language === 'ta' ? 'ta-IN' : 'en-US');
    utterance.lang = targetLang;
    utterance.rate = 0.95; // slightly slower for clear accessibility listening

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  const t = translations[language] || translations.en;

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        fontSize,
        setFontSize,
        language,
        setLanguage,
        t,
        announce,
        speakText,
        stopSpeaking,
        isSpeaking,
      }}
    >
      {/* Hidden ARIA-live polite region for screen readers */}
      <div
        id="sr-announcer"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveAnnouncement}
      </div>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
