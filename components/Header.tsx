import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <nav className="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            {/* @ts-ignore */}
            <Icon name="FileCode2" className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">
            Compress PDF Pro
          </span>
        </div>
        <div>
          {/* Header actions can go here if needed later */}
        </div>
      </div>
    </nav>
  );
};