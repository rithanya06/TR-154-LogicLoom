import { motion } from 'framer-motion';
import { CheckCircle, HeartPulse, Hospital, AlertTriangle, HelpCircle, ActivitySquare } from 'lucide-react';
import type { TriageResponse } from '../types';

interface TriageResultCardProps {
  result: TriageResponse;
}

const getStyles = (level: string) => {
  switch (level.toLowerCase()) {
    case 'self-care': return { 
      color: 'text-triage-selfCare', 
      bg: 'bg-triage-selfCareBg', 
      border: 'border-triage-selfCare/50',
      icon: <CheckCircle className="text-triage-selfCare" size={28} />,
      label: 'SELF-CARE',
      desc: 'Manageable at home with basic care' 
    };
    case 'clinic': return { 
      color: 'text-triage-clinic', 
      bg: 'bg-triage-clinicBg', 
      border: 'border-triage-clinic/50',
      icon: <HeartPulse className="text-triage-clinic" size={28} />,
      label: 'CLINIC VISIT',
      desc: 'Visit a doctor when possible' 
    };
    case 'hospital': return { 
      color: 'text-triage-hospital', 
      bg: 'bg-triage-hospitalBg',
      border: 'border-triage-hospital/50',
      icon: <Hospital className="text-triage-hospital" size={28} />,
      label: 'HOSPITAL',
      desc: 'Requires hospital care soon' 
    };
    case 'emergency': return { 
      color: 'text-triage-emergency', 
      bg: 'bg-triage-emergencyBg animate-pulse', 
      border: 'border-triage-emergency shadow-[0_0_20px_rgba(244,67,54,0.3)]',
      icon: <AlertTriangle className="text-triage-emergency" size={28} />,
      label: '⚠ EMERGENCY',
      desc: 'Seek immediate medical help!' 
    };
    default: return { 
      color: 'text-triage-clinic', 
      bg: 'bg-triage-clinicBg', 
      border: 'border-triage-clinic/50',
      icon: <HelpCircle className="text-triage-clinic" size={28} />,
      label: 'UNKNOWN',
      desc: 'Please consult a professional' 
    };
  }
};

export function TriageResultCard({ result }: TriageResultCardProps) {
  const styles = getStyles(result.triage_level);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border-2 ${styles.border} bg-background-card overflow-hidden shadow-2xl`}
    >
      {/* Banner */}
      <div className={`p-6 bg-gradient-to-r from-[${styles.bg}] to-background-card flex items-center gap-4`}>
        <div className={`p-3 rounded-full bg-background-dark/50 shadow-inner`}>
          {styles.icon}
        </div>
        <div>
          <h2 className={`text-2xl font-bold tracking-wide ${styles.color}`}>{styles.label}</h2>
          <p className="text-text-secondary text-sm">{styles.desc}</p>
        </div>
      </div>

      <div className="p-6">
        {/* Follow up */}
        {result.follow_up_question && (
          <div className="mb-6 p-4 rounded-xl bg-accent-blue/10 border border-accent-blue/30 flex gap-4">
            <HelpCircle className="text-accent-blue shrink-0 mt-1" size={20} />
            <div>
              <p className="text-xs font-bold text-accent-blue uppercase tracking-wider mb-1">Follow-up Question</p>
              <p className="text-text-primary text-sm">{result.follow_up_question}</p>
            </div>
          </div>
        )}

        {/* Probable Conditions */}
        {result.conditions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ActivitySquare className="text-primary-DEFAULT" size={22} />
              <h3 className="text-lg font-semibold text-text-primary">Probable Conditions</h3>
            </div>
            
            <div className="space-y-4">
              {result.conditions.map((cond, i) => {
                const confPercent = Math.round(cond.confidence * 100);
                const barColor = confPercent >= 70 ? 'bg-triage-selfCare' : confPercent >= 40 ? 'bg-triage-clinic' : 'bg-triage-hospital';
                
                return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    key={i} 
                    className="p-4 rounded-xl bg-background-variant/40"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-text-primary">{cond.condition}</span>
                      <span className={`font-bold ${barColor.replace('bg-', 'text-')}`}>{confPercent}%</span>
                    </div>
                    {/* Confidence bar */}
                    <div className="w-full h-1.5 bg-background-variant rounded-full mb-2 overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full`} style={{ width: `${confPercent}%` }} />
                    </div>
                    <p className="text-xs text-text-tertiary">{cond.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        <hr className="border-background-variant mb-6" />

        {/* First Aid */}
        {result.first_aid.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="text-primary-DEFAULT" size={22} />
              <h3 className="text-lg font-semibold text-text-primary">First-Aid Steps</h3>
            </div>
            <ul className="space-y-3">
              {result.first_aid.map((step, i) => (
                <li key={i} className="flex gap-3 bg-secondary-container/30 p-4 rounded-xl items-start">
                  <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-secondary-DEFAULT/20 text-secondary-DEFAULT text-xs font-bold leading-none mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-text-primary text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 text-center text-xs text-text-tertiary bg-background-variant/20 p-3 rounded-lg border border-background-variant/50">
          ⚕ {result.disclaimer}
        </p>
      </div>
    </motion.div>
  );
}
