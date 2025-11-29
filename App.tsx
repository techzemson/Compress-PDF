import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { Icon } from './components/Icon';
import { ResultCharts } from './components/Charts';
import { AppState, CompressionLevel, CompressionSettings, PDFFile, ProcessingStats } from './types';

// Helper to format bytes
const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const DEFAULT_SETTINGS: CompressionSettings = {
  level: CompressionLevel.RECOMMENDED,
  imageQuality: 75,
  grayscale: false,
  removeMetadata: true,
  subsetFonts: true,
  flattenForms: false,
  removeAnnotations: false,
  downsampleImages: true,
  targetDPI: 144,
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('Initializing...');
  const [stats, setStats] = useState<ProcessingStats | null>(null);

  // Fake processing logic
  useEffect(() => {
    if (appState === AppState.PROCESSING) {
      let progress = 0;
      const totalSteps = 100;
      const interval = setInterval(() => {
        progress += Math.random() * 2;
        if (progress > 100) progress = 100;
        
        setGlobalProgress(progress);
        
        // Update action text based on progress
        if (progress < 20) setCurrentAction('Analyzing PDF structure...');
        else if (progress < 40) setCurrentAction('Optimizing images and resources...');
        else if (progress < 60) setCurrentAction('Subsetting fonts and stripping metadata...');
        else if (progress < 80) setCurrentAction('Rebuilding PDF file...');
        else setCurrentAction('Finalizing compression...');

        if (progress >= 100) {
          clearInterval(interval);
          finishProcessing();
        }
      }, 80); // Adjust speed

      return () => clearInterval(interval);
    }
  }, [appState]);

  const finishProcessing = () => {
    // Calculate fake results based on settings
    const originalTotal = files.reduce((acc, f) => acc + f.originalSize, 0);
    
    // Simulate compression ratio based on "level"
    let ratio = 0.7; // Default 30% reduction
    if (settings.level === CompressionLevel.EXTREME) ratio = 0.3; // 70% reduction
    if (settings.level === CompressionLevel.LESS) ratio = 0.9; // 10% reduction
    if (settings.level === CompressionLevel.CUSTOM) {
        ratio = (settings.imageQuality / 100);
    }
    
    // Add some randomness
    ratio = ratio * (0.9 + Math.random() * 0.2); 

    const compressedTotal = Math.floor(originalTotal * ratio);
    
    setStats({
      originalTotal,
      compressedTotal,
      percentageSaved: ((originalTotal - compressedTotal) / originalTotal) * 100,
      timeTaken: 4.2 // Mock time
    });

    setAppState(AppState.RESULT);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      const newFiles = droppedFiles.map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        file: f,
        originalSize: f.size,
        status: 'pending',
        progress: 0
      } as PDFFile));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = (Array.from(e.target.files) as File[]).filter(f => f.type === 'application/pdf');
      if (selectedFiles.length > 0) {
        const newFiles = selectedFiles.map(f => ({
          id: Math.random().toString(36).substr(2, 9),
          file: f,
          originalSize: f.size,
          status: 'pending',
          progress: 0
        } as PDFFile));
        setFiles(prev => [...prev, ...newFiles]);
      }
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const startProcessing = () => {
    if (files.length === 0) return;
    setAppState(AppState.PROCESSING);
  };

  const resetApp = () => {
    setFiles([]);
    setAppState(AppState.IDLE);
    setGlobalProgress(0);
    setStats(null);
  };

  // Render sub-components inline for simplicity in this structure, normally would separate.

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20">
      <Header />
      
      <main className="flex-grow pt-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Compress PDF Files <span className="text-blue-600">Online</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Reduce file size while optimizing for maximal quality. 
            Secure, fast, and free with advanced compression algorithms.
          </p>
        </div>

        <StepIndicator currentState={appState} />

        {/* View: UPLOAD */}
        {appState === AppState.IDLE && (
          <div className="max-w-3xl mx-auto animate-fade-in-up">
            <div 
              className={`
                relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                ${files.length > 0 ? 'border-blue-400 bg-blue-50/50' : 'border-slate-300 hover:border-blue-400 hover:bg-white'}
              `}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
            >
              <input 
                type="file" 
                multiple 
                accept="application/pdf" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleFileInput}
              />
              
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                  {/* @ts-ignore */}
                  <Icon name="Upload" size={40} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Drop PDF files here</h3>
                  <p className="text-slate-500 mt-2">or click to browse from your device</p>
                </div>
                <div className="flex gap-4 mt-4">
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-500 flex items-center gap-1">
                     {/* @ts-ignore */}
                     <Icon name="Shield" size={12}/> Secure
                  </span>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-500 flex items-center gap-1">
                     {/* @ts-ignore */}
                     <Icon name="Zap" size={12}/> Fast
                  </span>
                </div>
              </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                 <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-semibold text-slate-700">{files.length} Files Selected</span>
                    <button 
                      onClick={() => setAppState(AppState.SETTINGS)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
                    >
                      Continue to Settings 
                      {/* @ts-ignore */}
                      <Icon name="ArrowRight" size={18} />
                    </button>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {files.map(file => (
                      <div key={file.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-12 bg-red-100 rounded flex items-center justify-center text-red-500">
                             {/* @ts-ignore */}
                             <Icon name="FileText" size={24} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-800 truncate max-w-xs">{file.file.name}</p>
                            <p className="text-sm text-slate-500">{formatSize(file.originalSize)}</p>
                          </div>
                        </div>
                        <button onClick={() => removeFile(file.id)} className="text-slate-400 hover:text-red-500 p-2">
                           {/* @ts-ignore */}
                           <Icon name="Trash2" size={18} />
                        </button>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </div>
        )}

        {/* View: SETTINGS */}
        {appState === AppState.SETTINGS && (
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Compression Levels */}
              <div className="col-span-2 space-y-6">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      {/* @ts-ignore */}
                      <Icon name="BarChart3" className="text-blue-600" size={20}/>
                      Compression Level
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: CompressionLevel.EXTREME, title: 'Extreme Compression', desc: 'Low quality, high compression. Perfect for archiving.', color: 'border-green-500 bg-green-50' },
                        { id: CompressionLevel.RECOMMENDED, title: 'Recommended', desc: 'Good quality, good compression. Best for most files.', color: 'border-blue-500 bg-blue-50' },
                        { id: CompressionLevel.LESS, title: 'Less Compression', desc: 'High quality, low compression. Best for printing.', color: 'border-orange-500 bg-orange-50' },
                      ].map((level) => (
                        <div 
                          key={level.id}
                          onClick={() => setSettings({...settings, level: level.id as CompressionLevel})}
                          className={`
                            relative p-4 rounded-xl border-2 cursor-pointer transition-all
                            ${settings.level === level.id ? `border-blue-600 bg-blue-50 ring-1 ring-blue-600` : 'border-slate-200 hover:border-blue-300'}
                          `}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-slate-900">{level.title}</p>
                              <p className="text-sm text-slate-500">{level.desc}</p>
                            </div>
                            {settings.level === level.id && (
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white">
                                {/* @ts-ignore */}
                                <Icon name="Check" size={14} />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>

                 {/* Advanced Toggles */}
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <button 
                      className="flex items-center justify-between w-full text-left font-semibold text-slate-800 mb-4"
                      onClick={() => setSettings(s => ({...s, level: CompressionLevel.CUSTOM}))} // Hack to show interest
                    >
                      <span className="flex items-center gap-2">
                        {/* @ts-ignore */}
                        <Icon name="Settings" className="text-slate-600" size={20}/>
                        Advanced Settings
                      </span>
                    </button>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'grayscale', label: 'Convert to Grayscale', icon: 'Monitor' },
                        { key: 'removeMetadata', label: 'Remove Metadata', icon: 'Tag' },
                        { key: 'subsetFonts', label: 'Subset Embedded Fonts', icon: 'Type' },
                        { key: 'flattenForms', label: 'Flatten Forms', icon: 'Layout' },
                        { key: 'removeAnnotations', label: 'Remove Annotations', icon: 'MessageSquare' },
                        { key: 'downsampleImages', label: 'Downsample Images', icon: 'Image' },
                      ].map((item) => (
                        <label key={item.key} className="flex items-center space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                           <input 
                              type="checkbox" 
                              checked={settings[item.key as keyof CompressionSettings] as boolean}
                              onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                              className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                           />
                           <span className="text-sm font-medium text-slate-700">{item.label}</span>
                        </label>
                      ))}
                    </div>

                    {/* Image Quality Slider (Visible if needed) */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <div className="flex justify-between items-center mb-2">
                         <label className="text-sm font-medium text-slate-700">Image Quality Limit</label>
                         <span className="text-sm font-bold text-blue-600">{settings.imageQuality}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={settings.imageQuality}
                        onChange={(e) => setSettings({...settings, imageQuality: parseInt(e.target.value)})}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between mt-1 text-xs text-slate-400">
                         <span>Low Quality</span>
                         <span>Original</span>
                      </div>
                    </div>
                 </div>
              </div>

              {/* Summary Panel */}
              <div className="col-span-1">
                 <div className="bg-slate-900 text-white rounded-2xl p-6 sticky top-24">
                    <h3 className="text-xl font-bold mb-6">Summary</h3>
                    <div className="space-y-4 text-sm text-slate-300">
                       <div className="flex justify-between">
                          <span>Files</span>
                          <span className="text-white font-medium">{files.length}</span>
                       </div>
                       <div className="flex justify-between">
                          <span>Total Size</span>
                          <span className="text-white font-medium">{formatSize(files.reduce((a, b) => a + b.originalSize, 0))}</span>
                       </div>
                       <div className="h-px bg-slate-700 my-4"></div>
                       <div className="flex justify-between items-center">
                          <span>Est. Reduction</span>
                          <span className="text-green-400 font-bold text-lg">
                            {settings.level === CompressionLevel.EXTREME ? '~70%' : settings.level === CompressionLevel.LESS ? '~10%' : '~40%'}
                          </span>
                       </div>
                    </div>
                    
                    <button 
                      onClick={startProcessing}
                      className="w-full mt-8 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex justify-center items-center gap-2"
                    >
                      Compress PDF
                      {/* @ts-ignore */}
                      <Icon name="Zap" size={18} fill="currentColor"/>
                    </button>
                    
                    <p className="text-xs text-slate-500 text-center mt-4">
                      By processing, you agree to our Terms of Service.
                    </p>
                 </div>
              </div>
            </div>
          </div>
        )}

        {/* View: PROCESSING */}
        {appState === AppState.PROCESSING && (
           <div className="max-w-2xl mx-auto text-center pt-10">
              <div className="relative w-48 h-48 mx-auto mb-8">
                 {/* Spinner Rings */}
                 <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                 <div 
                    className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
                 ></div>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-slate-800">{Math.round(globalProgress)}%</span>
                 </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentAction}</h2>
              <p className="text-slate-500">Please wait while we work our magic...</p>

              {/* Progress Detail Bar */}
              <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-left max-w-lg mx-auto">
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                       <span className={globalProgress > 20 ? 'text-blue-600' : 'text-slate-400'}>Analyzing</span>
                       <span className={globalProgress > 50 ? 'text-blue-600' : 'text-slate-400'}>Optimizing</span>
                       <span className={globalProgress > 90 ? 'text-blue-600' : 'text-slate-400'}>Building</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-blue-600 transition-all duration-300 ease-out" 
                         style={{ width: `${globalProgress}%` }}
                       ></div>
                    </div>
                 </div>
              </div>
           </div>
        )}

        {/* View: RESULT */}
        {appState === AppState.RESULT && stats && (
          <div className="max-w-5xl mx-auto animate-fade-in-up">
            
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center mb-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  {/* @ts-ignore */}
                  <Icon name="Award" size={120} className="text-green-600"/>
               </div>
               
               <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-full mb-4">
                  {/* @ts-ignore */}
                  <Icon name="Check" size={32} strokeWidth={3} />
               </div>
               <h2 className="text-3xl font-bold text-slate-900 mb-2">Compression Complete!</h2>
               <p className="text-slate-600 max-w-xl mx-auto">
                  We've successfully optimized your PDF files. Your documents are now smaller and easier to share.
               </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left: Actions */}
               <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                     <h3 className="text-lg font-bold text-slate-900 mb-4">Download</h3>
                     <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 mb-3">
                        {/* @ts-ignore */}
                        <Icon name="Download" size={20} />
                        Download All ({formatSize(stats.compressedTotal)})
                     </button>
                     <div className="grid grid-cols-2 gap-2">
                       <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                          {/* @ts-ignore */}
                          <Icon name="Share2" size={16} /> Share
                       </button>
                       <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-2">
                          {/* @ts-ignore */}
                          <Icon name="Eye" size={16} /> Preview
                       </button>
                     </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                     <h4 className="font-semibold text-blue-900 mb-2">Pro Tip</h4>
                     <p className="text-sm text-blue-700">
                        Did you know? You can further reduce file size by converting to Grayscale in the Advanced Settings.
                     </p>
                  </div>
                  
                  <button 
                    onClick={resetApp}
                    className="w-full text-slate-500 hover:text-blue-600 font-medium text-sm flex items-center justify-center gap-2 py-4"
                  >
                     {/* @ts-ignore */}
                     <Icon name="RefreshCw" size={16} /> Compress Another PDF
                  </button>
               </div>

               {/* Right: Analytics */}
               <div className="lg:col-span-2">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 px-2">Analysis Report</h3>
                  <ResultCharts stats={stats} />

                  {/* Feature Badges for Result */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                     {[
                        { label: 'Secure', icon: 'Lock', color: 'text-green-600', bg: 'bg-green-50' },
                        { label: 'Optimized', icon: 'Zap', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                        { label: 'Fast', icon: 'Timer', color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Clean', icon: 'Sparkles', color: 'text-purple-600', bg: 'bg-purple-50' },
                     ].map((badge, i) => (
                       <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-xl ${badge.bg}`}>
                          {/* @ts-ignore */}
                          <Icon name={badge.icon} className={`${badge.color} mb-2`} size={24} />
                          <span className={`text-xs font-bold ${badge.color} uppercase`}>{badge.label}</span>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-8 mt-auto">
         <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
            <p>&copy; 2024 Compress PDF Pro. All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-2">
               <a href="#" className="hover:text-blue-600">Privacy Policy</a>
               <span>&middot;</span>
               <a href="#" className="hover:text-blue-600">Terms of Service</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;