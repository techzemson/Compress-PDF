import React from 'react';
import { Icon } from './Icon';

export const Header: React.FC = () => {
  return (
    <nav className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            {/* @ts-ignore */}
            <Icon name="FileCode2" className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
            Compress PDF Pro
          </span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-blue-600 transition-colors">How it works</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Security</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Pricing</a>
          <button className="bg-slate-900 text-white px-4 py-2 rounded-full hover:bg-slate-800 transition-colors flex items-center gap-2">
            {/* @ts-ignore */}
            <Icon name="Github" size={16} />
            GitHub
          </button>
        </div>
      </div>
    </nav>
  );
};