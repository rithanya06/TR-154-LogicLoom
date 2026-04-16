# 🏥 Rural Health AI – Multilingual Symptom Triage Assistant

An intelligent, full-stack healthcare assistant designed specifically for rural users. It accepts symptoms in text or voice (in multiple Indian languages), analyzes them using Groq's LLaMA 3 model, and provides triage recommendations, possible conditions, simple first-aid guidance, and a map of nearby hospitals using OpenStreetMap.

This repository contains **three complete components**:
1. **FastAPI Backend** (Python) 
2. **Native Android Application** (Kotlin + Jetpack Compose)
3. **Web Application Frontend** (React + Tailwind + Vite)

---

## ✨ Core Features
- **🎙️ Voice Input (Web Speech API / Android Native):** Fill in the symptom fields directly by speaking natively into your browser or Android phone.
- **🌍 Multilingual Support:** Accepts inputs in English, Tamil, Hindi, and Telugu. Automatically translates everything to English for AI analysis and translates back for the user perfectly. 
- **🧠 Advanced AI Triage:** Intelligent routing and classification (Self-care, Clinic Visit, Hospital, Emergency) complete with probability confidence scores.
- **🗺️ Geolocation Mapping:** Automatically finds OpenStreetMap registered hospitals/clinics within a 10km radius of the patient's device relative to their GPS coordinates.
- **🎨 Glassmorphic Theming:** Stunning healthcare-themed deep blue/teal design language synced perfectly across both Android Compose and React.

---

## 🛠️ Technology Stack
- **AI Processing:** [Groq API (LLaMA-3)](https://groq.com)
- **Backend Infrastructure:** Python 3.11, FastAPI, Uvicorn, Pydantic
- **Android App:** Kotlin, Android Studio, Jetpack Compose, Material 3, Retrofit
- **Web App:** React 19, Vite, TypeScript, TailwindCSS v3.4, Framer Motion, Lucide-React
- **Geography/Mapping:** Overpass API (OpenStreetMap)

---

## 🚀 Getting Started

### 1. Start the Backend (FastAPI)
The central intelligence. Both the Web App and the Android app connect here.
```bash
cd backend

# Setup environment variables using the provided example
cp .env.example .env
# Open .env and add your GROQ_API_KEY=gsk_your_key_here

# Install dependencies
pip install -r requirements.txt

# Start the server on port 8000
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Run the Web Application (React)
The beautiful responsive front-end port of the system.
```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server
npm run dev
```
👉 Once running, open your browser to `http://localhost:5173/`

### 3. Run the Android App (Kotlin)
The native mobile implementation.
1. Open **Android Studio**.
2. Select **Open Project** and navigate to the `android/` folder inside this repository.
3. Wait for the Gradle Sync to complete downloading all dependencies.
4. Click the green **Play (Run 'app')** button. 
*(Note: Ensure your Android Emulator can reach `http://10.0.2.2:8000` which inherently binds to your machine's localhost where FastAPI runs).*

---

## ⚖️ Disclaimer
This is an AI-powered informational tool and prototype. **It is NOT a substitute for professional medical judgment, diagnosis, or triage.** General-purpose LLMs can hallucinate medical facts in life-threatening scenarios. Do not use this in production clinical environments without strict safety guardrails.
