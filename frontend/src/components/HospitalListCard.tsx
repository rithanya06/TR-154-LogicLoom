import React from 'react';
import type { HospitalInfo } from '../types';
import { MapPin, Phone, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

interface HospitalListCardProps {
  hospitals: HospitalInfo[];
  isLoading: boolean;
}

export function HospitalListCard({ hospitals, isLoading }: HospitalListCardProps) {
  if (isLoading) {
    return (
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 border-4 border-primary-DEFAULT border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-secondary">Searching for nearby hospitals...</p>
      </div>
    );
  }

  if (hospitals.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center">
        <MapPin size={32} className="text-text-tertiary mb-3" />
        <p className="text-text-secondary">No hospitals found nearby or location access denied.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="p-6 bg-background-variant/30 border-b border-background-variant">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <MapPin className="text-primary-DEFAULT" /> Nearby Facilities
        </h2>
        <p className="text-sm text-text-tertiary mt-1">Found {hospitals.length} locations within range</p>
      </div>
      
      <div className="divide-y divide-background-variant">
        {hospitals.map((hospital, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={index}
            className="p-5 hover:bg-background-variant/20 transition-colors"
          >
            <h3 className="font-semibold text-text-primary mb-2 text-lg">{hospital.name}</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2 text-accent-blue">
                <Navigation size={16} className="shrink-0 mt-0.5" />
                <span className="font-medium">{hospital.distance_km} km away</span>
              </div>
              
              {hospital.address && (
                <div className="flex items-start gap-2 text-text-secondary">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>{hospital.address}</span>
                </div>
              )}
              
              {hospital.phone && (
                <div className="flex items-start gap-2 text-triage-selfCare">
                  <Phone size={16} className="shrink-0 mt-0.5" />
                  <span>{hospital.phone}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
