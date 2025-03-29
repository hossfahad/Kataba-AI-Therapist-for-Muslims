'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SUPPORTED_LANGUAGES, LanguageCode, DEFAULT_LANGUAGE } from '../languages';

// Define the context type
type LanguageContextType = {
  currentLanguage: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isRTL: boolean;
  greeting: string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  isRTL: false,
  greeting: SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE].greeting,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

// Language provider props
interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: LanguageCode;
}

// Language provider component
export const LanguageProvider = ({ 
  children, 
  initialLanguage = DEFAULT_LANGUAGE 
}: LanguageProviderProps) => {
  // State to store the current language
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(initialLanguage);
  
  // Set language and store in localStorage
  const setLanguage = (lang: LanguageCode) => {
    if (SUPPORTED_LANGUAGES[lang]) {
      setCurrentLanguage(lang);
      localStorage.setItem('preferred-language', lang);
      // Update document direction
      document.documentElement.dir = SUPPORTED_LANGUAGES[lang].direction;
      // Update lang attribute
      document.documentElement.lang = lang;
    }
  };

  // Initialize language from localStorage or browser preference on client-side
  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferred-language') as LanguageCode | null;
    
    if (storedLanguage && SUPPORTED_LANGUAGES[storedLanguage]) {
      setLanguage(storedLanguage);
    } else {
      // If no stored preference, try to detect from browser
      const browserLang = navigator.language.split('-')[0] as LanguageCode;
      
      if (SUPPORTED_LANGUAGES[browserLang]) {
        setLanguage(browserLang);
      } else {
        // Fall back to default language
        setLanguage(DEFAULT_LANGUAGE);
      }
    }
  }, []);

  // Derived values
  const isRTL = SUPPORTED_LANGUAGES[currentLanguage].direction === 'rtl';
  const greeting = SUPPORTED_LANGUAGES[currentLanguage].greeting;

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLanguage, 
        setLanguage, 
        isRTL, 
        greeting,
        supportedLanguages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}; 