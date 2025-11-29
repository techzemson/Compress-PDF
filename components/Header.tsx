import React from 'react';
import { Icon } from './Icon';
import { AppState } from '../types';

interface HeaderProps {
  currentState: AppState;
  onNavigate: (state: AppState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentState, onNavigate }) => {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onNavigate(AppState.CONFIGURATION)}
        >
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
            {/* @ts-ignore */}
            <Icon name="FileCode2" className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
            Compress PDF Pro
          </span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
             onClick={() => onNavigate(AppState.CONFIGURATION)}
             className={`
                px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${currentState !== AppState.DOCUMENTATION 
                   ? 'bg-blue-50 text-blue-700' 
                   : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}
             `}
          >
             {/* @ts-ignore */}
             <Icon name="Zap" size={18} />
             <span className="hidden sm:inline">Tool</span>
          </button>
          
          <button 
             onClick={() => onNavigate(AppState.DOCUMENTATION)}
             className={`
                px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                ${currentState === AppState.DOCUMENTATION 
                   ? 'bg-blue-50 text-blue-700' 
                   : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'}
             `}
          >
             {/* @ts-ignore */}
             <Icon name="BookOpen" size={18} />
             <span className="hidden sm:inline">Documentation</span>
          </button>
        </div>
      </div>
    </nav>
  );
};