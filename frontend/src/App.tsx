import { useState } from 'react';
import axios from 'axios';
import { RefreshCcw, Stethoscope } from 'lucide-react';
import type { TriageUiState, TriageResponse, HospitalInfo } from './types';
import { InputForm } from './components/InputForm';
import { TriageResultCard } from './components/TriageResultCard';
import { HospitalListCard } from './components/HospitalListCard';

const API_URL = 'http://localhost:8000';

const initialState: TriageUiState = {
  age: '',
  gender: 'Male',
  symptoms: '',
  vitals: '',
  selectedLanguage: 'en',
  isLoading: false,
  isListening: false,
  isLoadingHospitals: false,
  triageResult: null,
  hospitals: [],
  errorMessage: null,
  showResults: false,
};

function App() {
  const [state, setState] = useState<TriageUiState>(initialState);

  const updateState = (updates: Partial<TriageUiState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const handleTriageSubmit = async () => {
    if (!state.age || isNaN(Number(state.age))) {
      alert("Please provide a valid age");
      return;
    }
    if (!state.symptoms) {
      alert("Please describe your symptoms");
      return;
    }

    updateState({ isLoading: true, errorMessage: null, showResults: false });

    // 1. Fetch Triage
    try {
      const response = await axios.post<TriageResponse>(`${API_URL}/triage`, {
        age: parseInt(state.age),
        gender: state.gender,
        symptoms: state.symptoms,
        vitals: state.vitals,
        language: state.selectedLanguage
      });
      
      updateState({ 
        isLoading: false, 
        triageResult: response.data, 
        showResults: true 
      });

      // 2. Queue Hospital Fetching via Geolocation API
      fetchHospitals();

    } catch (err: any) {
      console.error(err);
      updateState({ 
        isLoading: false, 
        errorMessage: err?.response?.data?.detail || "Connection failed to backend API" 
      });
    }
  };

  const fetchHospitals = () => {
    if ('geolocation' in navigator) {
      updateState({ isLoadingHospitals: true });
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const resp = await axios.post<{hospitals: HospitalInfo[], count: number}>(`${API_URL}/hospitals`, {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
            updateState({ hospitals: resp.data.hospitals, isLoadingHospitals: false });
          } catch (e) {
            updateState({ isLoadingHospitals: false });
          }
        },
        () => {
          updateState({ isLoadingHospitals: false });
          console.warn("Geolocation denied");
        }
      );
    }
  };

  const resetForm = () => {
    setState(initialState);
  };

  return (
    <div className="gradient-bg py-8 px-4 sm:px-6 flex flex-col items-center">
      
      {/* Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-primary-DEFAULT to-secondary-DEFAULT rounded-full shadow-lg">
            <Stethoscope className="text-white" size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Rural Health AI</h1>
            <p className="text-primary-light text-sm font-medium">Multilingual Symptom Triage</p>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl space-y-8">
        
        {/* Error Banner */}
        {state.errorMessage && (
          <div className="bg-accent-red/10 border border-accent-red text-accent-red px-4 py-3 rounded-xl flex items-start gap-3">
            <span className="font-medium">Error:</span> {state.errorMessage}
          </div>
        )}

        {/* Input Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Symptom Assessment</h2>
            {state.showResults && (
              <button 
                onClick={resetForm}
                className="flex items-center gap-2 text-sm text-primary-DEFAULT hover:text-primary-light transition-colors"
              >
                <RefreshCcw size={16} /> New Assessment
              </button>
            )}
          </div>
          
          <InputForm state={state} updateState={updateState} />

          <button 
            onClick={handleTriageSubmit}
            disabled={state.isLoading}
            className="w-full mt-8 bg-primary-dark hover:bg-primary-DEFAULT disabled:bg-background-variant text-white font-semibold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-3 disabled:cursor-not-allowed"
          >
            {state.isLoading ? (
              <>
                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                 Analyzing Symptoms...
              </>
            ) : 'Analyze Symptoms'}
          </button>
        </div>

        {/* Results Stream */}
        {state.showResults && state.triageResult && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Assessment Results</h2>
            <TriageResultCard result={state.triageResult} />
            <HospitalListCard hospitals={state.hospitals} isLoading={state.isLoadingHospitals} />
          </div>
        )}

      </div>
      
      {/* Universal Disclaimer */}
      <div className="w-full max-w-4xl mt-12 text-center text-triage-clinic/80 text-sm font-medium bg-triage-clinic/10 p-4 rounded-xl">
        ⚕ This app provides AI-generated guidance only. It is NOT a substitute for professional medical advice. Always consult a qualified doctor.
      </div>
      
    </div>
  );
}

export default App;
