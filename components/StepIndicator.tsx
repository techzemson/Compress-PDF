import React from 'react';
import { AppState } from '../types';
import { Icon } from './Icon';

interface StepIndicatorProps {
  currentState: AppState;
}

const steps = [
  { id: AppState.IDLE, label: 'Upload', icon: 'UploadCloud' },
  { id: AppState.SETTINGS, label: 'Settings', icon: 'Sliders' },
  { id: AppState.PROCESSING, label: 'Compressing', icon: 'Cpu' },
  { id: AppState.RESULT, label: 'Download', icon: 'Download' },
];

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentState }) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(s => s.id === currentState);
  };

  const activeIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-4xl mx-auto mb-8 px-4">
      <div className="relative flex justify-between items-center">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = index === activeIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center group">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300
                  ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white border-slate-300 text-slate-400'}
                  ${isCurrent ? 'scale-110 ring-4 ring-blue-100' : ''}
                `}
              >
                {/* @ts-ignore */}
                <Icon name={step.icon} size={18} />
              </div>
              <span className={`
                mt-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-300
                ${isActive ? 'text-blue-700' : 'text-slate-400'}
              `}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};