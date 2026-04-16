import React from 'react';

interface LanguageOption {
  code: string;
  displayName: string;
  nativeName: string;
}

const supportedLanguages: LanguageOption[] = [
  { code: 'en', displayName: 'English', nativeName: 'English' },
  { code: 'hi', displayName: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', displayName: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', displayName: 'Telugu', nativeName: 'తెలుగు' }
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageSelected: (langCode: string) => void;
}

export function LanguageSelector({ selectedLanguage, onLanguageSelected }: LanguageSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {supportedLanguages.map((lang) => {
        const isSelected = selectedLanguage === lang.code;
        return (
          <button
            key={lang.code}
            onClick={(e) => {
              e.preventDefault();
              onLanguageSelected(lang.code);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isSelected 
                ? 'bg-primary-container border-primary-DEFAULT text-white shadow-[0_0_10px_rgba(20,163,168,0.3)]' 
                : 'bg-background-variant border-background-variant text-text-secondary hover:text-text-primary hover:border-text-secondary'
            }`}
          >
            {lang.nativeName} ({lang.displayName})
          </button>
        );
      })}
    </div>
  );
}
