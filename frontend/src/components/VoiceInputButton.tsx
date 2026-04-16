import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceInputButtonProps {
  onTranscription: (text: string) => void;
  languageCode: string;
}

export function VoiceInputButton({ onTranscription, languageCode }: VoiceInputButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Map our UI lang code to BCP 47
  const langMap: Record<string, string> = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'ta': 'ta-IN',
    'te': 'te-IN'
  };

  useEffect(() => {
    // Setup Web Speech API native browser capabilities
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListen = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.lang = langMap[languageCode] || 'en-US';
        recognitionRef.current.start();
        setIsListening(true);

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onTranscription(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech Recognition Error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      {isListening && (
        <div className="absolute inset-0 bg-accent-red/30 rounded-full animate-pulse-fast scale-[1.3]"></div>
      )}
      <button
        onClick={toggleListen}
        className={`relative z-10 p-3 rounded-full transition-colors shadow-lg ${
          isListening 
            ? 'bg-accent-red text-white' 
            : 'bg-primary-container text-primary-DEFAULT hover:bg-primary-container/80'
        }`}
        title={isListening ? "Stop Listening" : "Start Voice Input"}
      >
        {isListening ? <MicOff size={24} /> : <Mic size={24} />}
      </button>
    </div>
  );
}
