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

export type TranslateFunction = {
  (key: string): string;
  [key: string]: any;
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslateFunction;
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

  const getNestedKey = (obj: any, path: string): string | undefined => {
    if (!obj || typeof obj !== 'object') return undefined;
    const parts = path.split('.');
    let curr = obj;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        return undefined;
      }
    }
    return typeof curr === 'string' ? curr : undefined;
  };

  const translate = (key: string): string => {
    const activeDict = dictionaries[language] || dictionaries.en;
    const val = getNestedKey(activeDict, key) ?? getNestedKey(dictionaries.en, key);
    if (val !== undefined) return val;

    // Direct key lookup
    if (activeDict[key as keyof Dictionary] && typeof activeDict[key as keyof Dictionary] === 'string') {
      return activeDict[key as keyof Dictionary] as string;
    }
    if (dictionaries.en[key as keyof Dictionary] && typeof dictionaries.en[key as keyof Dictionary] === 'string') {
      return dictionaries.en[key as keyof Dictionary] as string;
    }
    return key;
  };

  const activeDict = dictionaries[language] || dictionaries.en;
  const t: TranslateFunction = Object.assign((key: string) => translate(key), activeDict, dictionaries.en);

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
