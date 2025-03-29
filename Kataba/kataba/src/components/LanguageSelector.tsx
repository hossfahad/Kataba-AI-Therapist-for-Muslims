'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/hooks/useLanguage';
import { LanguageCode } from '@/lib/languages';
import { Check, Globe, ChevronDown } from 'lucide-react';

export const LanguageSelector = () => {
  const { currentLanguage, setLanguage, supportedLanguages, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleDropdown = () => setIsOpen(!isOpen);
  
  const handleSelectLanguage = (code: LanguageCode) => {
    setLanguage(code);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, code: LanguageCode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectLanguage(code);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={handleToggleDropdown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select language"
      >
        <Globe className="h-4 w-4" />
        <span className={isRTL ? 'ml-1' : 'mr-1'}>
          {supportedLanguages[currentLanguage].name}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {isOpen && (
        <div 
          className="absolute mt-1 py-1 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10"
          style={{ [isRTL ? 'right' : 'left']: '0' }}
        >
          <ul role="listbox" className="max-h-60 overflow-auto">
            {Object.entries(supportedLanguages).map(([code, { name }]) => (
              <li
                key={code}
                role="option"
                aria-selected={currentLanguage === code}
                className={`
                  flex items-center justify-between px-3 py-2 text-sm cursor-pointer
                  ${currentLanguage === code ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
                `}
                onClick={() => handleSelectLanguage(code as LanguageCode)}
                onKeyDown={(e) => handleKeyDown(e, code as LanguageCode)}
                tabIndex={0}
              >
                <span>{name}</span>
                {currentLanguage === code && <Check className="h-4 w-4" />}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}; 