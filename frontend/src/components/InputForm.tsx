import React from 'react';
import { User, Activity, FileEdit } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { VoiceInputButton } from './VoiceInputButton';
import type { TriageUiState } from '../types';

interface InputFormProps {
  state: TriageUiState;
  updateState: (updates: Partial<TriageUiState>) => void;
}

export function InputForm({ state, updateState }: InputFormProps) {
  
  const appendSymptoms = (spokenText: string) => {
    const space = state.symptoms.length > 0 && !state.symptoms.endsWith(' ') ? '. ' : '';
    updateState({ symptoms: state.symptoms + space + spokenText });
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Language */}
      <div>
        <label className="block text-text-secondary text-sm font-semibold mb-2">🌐 Select Language</label>
        <LanguageSelector 
          selectedLanguage={state.selectedLanguage} 
          onLanguageSelected={(lang) => updateState({ selectedLanguage: lang })} 
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Age */}
        <div className="flex-1 relative">
          <label className="block text-text-secondary text-sm font-semibold mb-1">Age</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User size={18} className="text-primary-DEFAULT" />
            </div>
            <input 
              type="number"
              value={state.age}
              onChange={(e) => updateState({ age: e.target.value })}
              className="glass-input pl-10"
              placeholder="e.g. 35"
              min="0"
              max="120"
            />
          </div>
        </div>

        {/* Gender */}
        <div className="flex-1 relative">
          <label className="block text-text-secondary text-sm font-semibold mb-1">Gender</label>
          <select 
            value={state.gender}
            onChange={(e) => updateState({ gender: e.target.value })}
            className="glass-input appearance-none text-text-primary bg-background-variant/40"
          >
            <option value="Male" className="bg-background-dark">Male</option>
            <option value="Female" className="bg-background-dark">Female</option>
            <option value="Other" className="bg-background-dark">Other</option>
          </select>
        </div>
      </div>

      {/* Symptoms */}
      <div>
        <label className="block text-text-secondary text-sm font-semibold mb-2">📋 Describe Your Symptoms</label>
        <div className="flex items-start gap-4">
          <div className="relative flex-1">
            <div className="absolute top-3 left-3 pointer-events-none">
              <FileEdit size={18} className="text-primary-DEFAULT" />
            </div>
            <textarea
              value={state.symptoms}
              onChange={(e) => updateState({ symptoms: e.target.value })}
              className="glass-input pl-10 min-h-[120px] resize-y"
              placeholder="e.g. I have a severe headache and fever since 2 days..."
            ></textarea>
          </div>
          <div className="pt-2">
            <VoiceInputButton 
              onTranscription={appendSymptoms} 
              languageCode={state.selectedLanguage}
            />
          </div>
        </div>
      </div>

      {/* Vitals */}
      <div className="relative">
        <label className="block text-text-secondary text-sm font-semibold mb-1">Vitals (Optional)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Activity size={18} className="text-primary-DEFAULT" />
          </div>
          <input 
            type="text"
            value={state.vitals}
            onChange={(e) => updateState({ vitals: e.target.value })}
            className="glass-input pl-10"
            placeholder="e.g. BP: 120/80, Temp: 101°F"
          />
        </div>
      </div>

    </div>
  );
}
