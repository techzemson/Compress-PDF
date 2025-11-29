import React from 'react';
import { Icon } from './Icon';

export const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto pb-20 animate-fade-in-up">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-16">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full text-blue-600 mb-4">
          {/* @ts-ignore */}
          <Icon name="BookOpen" size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
          How to use <span className="text-blue-600">Compress PDF Pro</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          The ultimate guide to optimizing your PDF documents securely in your browser.
          Discover features, tips, and the benefits of client-side compression.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Step by Step Guide */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
             <span className="bg-blue-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm">1</span>
             Quick Start Guide
          </h2>
          <div className="space-y-8">
             {[
               { title: 'Upload Files', text: 'Drag and drop your PDF files into the upload area or click to browse. You can process multiple files at once.', icon: 'Upload' },
               { title: 'Choose Settings', text: 'Select a compression preset (Recommended, Extreme, etc.) or manually adjust the percentage slider.', icon: 'Sliders' },
               { title: 'Compress', text: 'Click the "Compress PDF" button. The tool will process your files instantly in your browser.', icon: 'Zap' },
               { title: 'Download', text: 'View your savings and download the optimized files individually or share them directly.', icon: 'Download' }
             ].map((step, idx) => (
               <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0 mt-1 text-slate-400">
                    {/* @ts-ignore */}
                    <Icon name={step.icon} size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{step.title}</h3>
                    <p className="text-sm text-slate-600 mt-1 leading-relaxed">{step.text}</p>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Benefits & Key Features */}
        <div className="space-y-6">
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                {/* @ts-ignore */}
                <Icon name="Shield" className="text-green-400" />
                Why it's Safe & Secure
              </h2>
              <p className="text-slate-300 leading-relaxed mb-6">
                Unlike other online tools, <strong>Compress PDF Pro</strong> runs entirely in your browser. 
                Your files are <span className="text-white font-semibold underline decoration-blue-500">never uploaded to any server</span>. 
                This guarantees 100% privacy for your sensitive documents, contracts, and personal data.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                {/* @ts-ignore */}
                <Icon name="Lock" size={16} /> End-to-end Local Processing
              </div>
           </div>

           <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Advanced Features</h2>
              <ul className="space-y-4">
                {[
                  { label: 'Metadata Removal', desc: 'Strips hidden data for privacy.' },
                  { label: 'Custom Compression', desc: 'Fine-tune image quality & dpi.' },
                  { label: 'Web Optimization', desc: 'Linearizes PDF for fast web view.' },
                  { label: 'Real-time Stats', desc: 'See size reduction before download.' },
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-0.5 text-blue-600">
                      {/* @ts-ignore */}
                      <Icon name="CheckCircle2" size={18} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800 block text-sm">{feat.label}</span>
                      <span className="text-xs text-slate-500">{feat.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>

      {/* FAQ / Details */}
      <div className="bg-blue-50 rounded-3xl p-8 md:p-12 border border-blue-100">
         <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Understanding Compression</h2>
            <p className="text-slate-600 mt-2">How we make your files smaller without ruining them.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
               <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                 {/* @ts-ignore */}
                 <Icon name="Image" size={20} />
               </div>
               <h3 className="font-bold text-slate-900 mb-2">Image Optimization</h3>
               <p className="text-sm text-slate-600 leading-relaxed">
                 We intelligently reduce the resolution and quality of images embedded in the PDF, which usually take up the most space.
               </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
               <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                 {/* @ts-ignore */}
                 <Icon name="Type" size={20} />
               </div>
               <h3 className="font-bold text-slate-900 mb-2">Font Subsetting</h3>
               <p className="text-sm text-slate-600 leading-relaxed">
                 We remove unused characters from embedded fonts. If your PDF only uses "A" and "B", we don't keep "C-Z".
               </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100">
               <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                 {/* @ts-ignore */}
                 <Icon name="Trash" size={20} />
               </div>
               <h3 className="font-bold text-slate-900 mb-2">Structure Cleanup</h3>
               <p className="text-sm text-slate-600 leading-relaxed">
                 We strip redundant objects, bookmarks, annotations, and metadata that add weight but no visual value.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};