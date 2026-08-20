import React, { createContext, useContext, useState, useEffect } from 'react';
import { en } from '../i18n/en';
import { ta } from '../i18n/ta';
import { hi } from '../i18n/hi';

export type SupportedLanguage = 'en' | 'ta' | 'hi';

type Dictionary = typeof en;

const dictionaries: Record<SupportedLanguage, Dictionary> = {
  en,
  ta,
  hi,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: keyof Dictionary) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('civicflow_language');
      if (saved === 'ta' || saved === 'hi' || saved === 'en') return saved;
    } catch {
      // fallback
    }
    return 'en';
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('civicflow_language', lang);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: keyof Dictionary): string => {
    const dict = dictionaries[language] || dictionaries.en;
    return dict[key] || dictionaries.en[key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
