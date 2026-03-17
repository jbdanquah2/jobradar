'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ArrowRight, X, Info } from 'lucide-react';

interface SetupStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
}

export default function SetupGuide({ 
  hasJobs, 
  profileHasSkills 
}: { 
  hasJobs: boolean, 
  profileHasSkills: boolean 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('jobradar_setup_dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
    // Show if not dismissed OR if essential steps are missing
    if (!dismissed || (!hasJobs || !profileHasSkills)) {
      setIsVisible(true);
    }
  }, [hasJobs, profileHasSkills]);

  const handleDismiss = () => {
    localStorage.setItem('jobradar_setup_dismissed', 'true');
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible || (isDismissed && hasJobs && profileHasSkills)) return null;

  const steps: SetupStep[] = [
    {
      id: 'profile',
      title: 'Update your Resume',
      description: 'JobRadar uses your "Core Technical Skills" to calculate match scores.',
      isCompleted: profileHasSkills
    },
    {
      id: 'ingest',
      title: 'Fetch your first jobs',
      description: 'Click "Fetch Jobs" to start scraping remote opportunities.',
      isCompleted: hasJobs
    }
  ];

  const allDone = steps.every(s => s.isCompleted);

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
            <Info className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 leading-tight">Welcome to JobRadar</h2>
            <p className="mt-1 text-sm text-gray-600">A smart, discovery engine for remote software engineering roles.</p>
          </div>
        </div>
        <button 
          onClick={handleDismiss}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`flex flex-col rounded-xl border p-4 transition-all ${
              step.isCompleted 
                ? 'border-green-100 bg-green-50/30 opacity-75' 
                : 'border-blue-100 bg-white shadow-sm ring-1 ring-blue-50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider ${step.isCompleted ? 'text-green-600' : 'text-blue-600'}`}>
                Step {step.id === 'profile' ? '1' : '2'}
              </span>
              {step.isCompleted ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <Circle className="h-5 w-5 text-blue-200" />
              )}
            </div>
            <h3 className="font-bold text-gray-900">{step.title}</h3>
            <p className="mt-1 text-sm text-gray-500 leading-relaxed">{step.description}</p>
          </div>
        ))}
      </div>

      {!allDone && (
        <div className="mt-6 flex items-center gap-2 rounded-lg bg-blue-100/50 p-3 text-sm font-medium text-blue-800">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-600" />
          Follow these steps to personalize your discovery engine.
        </div>
      )}

      {allDone && !isDismissed && (
        <div className="mt-6 flex items-center justify-between rounded-lg bg-green-600 p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="font-bold">You are all set! JobRadar is ready to go.</p>
          </div>
          <button 
            onClick={handleDismiss}
            className="flex items-center gap-1 rounded-md bg-white/20 px-3 py-1.5 text-xs font-bold hover:bg-white/30 transition-all active:scale-95"
          >
            Start Discovering <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
