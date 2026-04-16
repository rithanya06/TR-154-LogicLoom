// Types spanning API boundaries and Core Data

export interface ConditionInfo {
  condition: string;
  confidence: number;
  description: string;
}

export interface TriageResponse {
  triage_level: 'self-care' | 'clinic' | 'hospital' | 'emergency';
  conditions: ConditionInfo[];
  first_aid: string[];
  follow_up_question?: string;
  disclaimer: string;
}

export interface HospitalInfo {
  name: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  address?: string;
  phone?: string;
}

export interface TriageUiState {
  age: string;
  gender: string;
  symptoms: string;
  vitals: string;
  selectedLanguage: string;
  
  isLoading: boolean;
  isListening: boolean;
  isLoadingHospitals: boolean;

  triageResult: TriageResponse | null;
  hospitals: HospitalInfo[];
  
  errorMessage: string | null;
  showResults: boolean;
}
