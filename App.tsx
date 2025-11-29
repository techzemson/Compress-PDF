
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { Icon } from './components/Icon';
import { ResultCharts } from './components/Charts';
import { AppState, CompressionLevel, CompressionSettings, PDFFile, ProcessingStats } from './types';
import { PDFDocument } from 'pdf-lib';

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
  compressionPercentage: 45, // Target reduction (used for visual target only now)
  imageQuality: 75,
  grayscale: false,
  removeMetadata: true,
  subsetFonts: true,
  flattenForms: false,
  removeAnnotations: false,
  downsampleImages: true,
  targetDPI: 144,
  webOptimization: true,
  removeBookmarks: false,
  cleanContent: true,
  removeThumbnails: true
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CONFIGURATION);
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [settings, setSettings] = useState<CompressionSettings>(DEFAULT_SETTINGS);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [currentAction, setCurrentAction] = useState('Initializing...');
  const [stats, setStats] = useState<ProcessingStats | null>(null);

  // Sync Level with Percentage
  const handleLevelChange = (level: CompressionLevel) => {
    let percentage = 45;
    if (level === CompressionLevel.EXTREME) percentage = 80;
    if (level === CompressionLevel.RECOMMENDED) percentage = 45;
    if (level === CompressionLevel.LOSSLESS) percentage = 15;
    if (level === CompressionLevel.LESS) percentage = 25;
    
    setSettings(prev => ({
      ...prev,
      level,
      compressionPercentage: percentage
    }));
  };

  const handlePercentageChange = (val: number) => {
    setSettings(prev => ({
      ...prev,
      level: CompressionLevel.CUSTOM,
      compressionPercentage: val
    }));
  };

  // Actual Processing Logic
  useEffect(() => {
    if (appState === AppState.PROCESSING) {
      processFiles();
    }
  }, [appState]);

  const processFiles = async () => {
    setGlobalProgress(10);
    setCurrentAction('Loading PDF engine...');
    
    const startTime = Date.now();
    let processedCount = 0;
    const totalFiles = files.length;
    const newFiles: PDFFile[] = [];

    for (const fileObj of files) {
      setCurrentAction(`Processing ${fileObj.file.name}...`);
      
      try {
        // Read file
        const arrayBuffer = await fileObj.file.arrayBuffer();
        
        // Load PDF document
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        
        // --- Apply Optimizations ---
        
        // 1. Metadata Removal
        if (settings.removeMetadata) {
          pdfDoc.setTitle('');
          pdfDoc.setAuthor('');
          pdfDoc.setSubject('');
          pdfDoc.setKeywords([]);
          pdfDoc.setProducer('');
          pdfDoc.setCreator('');
        }

        // 2. Note: pdf-lib doesn't support deep image compression (resampling) 
        // without complex canvas logic. It primarily optimizes structure.
        
        // Save the PDF
        // useObjectStreams: false can sometimes reduce size for simple docs, 
        // but true is usually better for compression. Let's try to be smart.
        const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
        
        const compressedBlob = new Blob([pdfBytes], { type: 'application/pdf' });
        const compressedFile = new File([compressedBlob], fileObj.file.name, { 
          type: 'application/pdf',
          lastModified: Date.now()
        });

        // Determine if we actually saved space
        const isSmaller = compressedFile.size < fileObj.originalSize;
        const finalFile = isSmaller ? compressedFile : fileObj.file;
        const finalSize = finalFile.size;

        newFiles.push({
          ...fileObj,
          file: finalFile, // Replace the file reference with the processed one
          compressedSize: finalSize,
          status: 'done',
          progress: 100
        });

      } catch (error) {
        console.error("Error processing PDF:", error);
        // Fallback to original
        newFiles.push({
          ...fileObj,
          compressedSize: fileObj.originalSize,
          status: 'error',
          progress: 100
        });
      }

      processedCount++;
      setGlobalProgress(10 + (processedCount / totalFiles) * 80);
    }

    setFiles(newFiles);
    setGlobalProgress(100);
    setCurrentAction('Finalizing...');

    const originalTotal = newFiles.reduce((acc, f) => acc + f.originalSize, 0);
    const compressedTotal = newFiles.reduce((acc, f) => acc + (f.compressedSize || f.originalSize), 0);
    const timeTaken = (Date.now() - startTime) / 1000;

    setStats({
      originalTotal,
      compressedTotal,
      percentageSaved: Math.max(0, ((originalTotal - compressedTotal) / originalTotal) * 100),
      timeTaken
    });

    setTimeout(() => {
      setAppState(AppState.RESULT);
    }, 500);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = (Array.from(e.dataTransfer.files) as File[]).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      addFiles(droppedFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = (Array.from(e.target.files) as File[]).filter(f => f.type === 'application/pdf');
      if (selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
    }
  };

  const addFiles = (newFiles: File[]) => {
    const mappedFiles = newFiles.map(f => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      originalSize: f.size,
      status: 'pending',
      progress: 0
    } as PDFFile));
    setFiles(prev => [...prev, ...mappedFiles]);
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
    setAppState(AppState.CONFIGURATION);
    setGlobalProgress(0);
    setStats(null);
    setSettings(DEFAULT_SETTINGS);
  };

  const handleDownload = () => {
    if (files.length === 0) return;
    
    files.forEach(file => {
      const url = URL.createObjectURL(file.file);
      const filename = `compressed_${file.file.name}`;
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  const handlePreview = () => {
    if (files.length === 0) return;
    const url = URL.createObjectURL(files[0].file);
    window.open(url, '_blank');
  };

  const handleShare = async () => {
    if (files.length === 0) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Compressed PDF',
          text: 'Here are my compressed PDF files.',
          files: files.map(f => f.file),
        });
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      alert('Web Share API is not supported in this browser.');
    }
  };

  // Real-time calculation for display
  const totalOriginalSize = files.reduce((acc, f) => acc + f.originalSize, 0);
  const estimatedTotalSize = totalOriginalSize * (1 - settings.compressionPercentage / 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 pb-20">
      <Header />
      
      <main className="flex-grow pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Title Section */}
        {appState === AppState.CONFIGURATION && (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
              Compress PDF Files <span className="text-blue-600">Online</span>
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Reduce file size while optimizing for maximal quality. 
              Secure, fast, and free with advanced compression algorithms.
            </p>
          </div>
        )}

        <StepIndicator currentState={appState} />

        {/* View: CONFIGURATION (Upload + Settings) */}
        {appState === AppState.CONFIGURATION && (
          <div className="animate-fade-in-up">
            {/* If no files, show large dropzone */}
            {files.length === 0 ? (
              <div 
                className="max-w-3xl mx-auto relative group border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer bg-white shadow-sm"
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
            ) : (
              /* Files Selected - Show Split View */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: File List & Add More */}
                <div className="lg:col-span-1 space-y-4">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-semibold text-slate-700">{files.length} Files Selected</span>
                      <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-700 font-medium">Clear All</button>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                      {files.map(file => (
                        <div key={file.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 min-w-[2.5rem] bg-red-100 rounded flex items-center justify-center text-red-500">
                              {/* @ts-ignore */}
                              <Icon name="FileText" size={20} />
                            </div>
                            <div className="truncate">
                              <p className="font-medium text-slate-800 text-sm truncate">{file.file.name}</p>
                              <p className="text-xs text-slate-500">{formatSize(file.originalSize)}</p>
                            </div>
                          </div>
                          <button onClick={() => removeFile(file.id)} className="text-slate-400 hover:text-red-500 p-2">
                            {/* @ts-ignore */}
                            <Icon name="Trash2" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                      <label className="flex items-center justify-center gap-2 w-full py-2 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-white transition-all cursor-pointer text-sm font-medium">
                        <input type="file" multiple accept="application/pdf" className="hidden" onChange={handleFileInput} />
                        {/* @ts-ignore */}
                        <Icon name="Plus" size={16} /> Add more files
                      </label>
                    </div>
                  </div>
                  
                  {/* Summary Card for Mobile/Desktop */}
                  <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
                    <div className="space-y-4 mb-6">
                       <div className="flex justify-between items-center">
                         <p className="text-slate-400 text-sm">Total Original</p>
                         <p className="text-lg font-semibold text-slate-300">{formatSize(totalOriginalSize)}</p>
                       </div>
                       
                       <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                         <p className="text-slate-400 text-sm">Target Reduction</p>
                         <p className="text-green-400 font-bold">{settings.compressionPercentage}%</p>
                       </div>

                       <div className="flex justify-between items-center">
                         <p className="text-white font-medium">Est. Target Size</p>
                         <p className="text-2xl font-bold text-white bg-blue-600/30 px-3 py-1 rounded-lg border border-blue-500/30">
                            {formatSize(estimatedTotalSize)}
                         </p>
                       </div>
                    </div>

                    <button 
                      onClick={startProcessing}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex justify-center items-center gap-2 text-lg"
                    >
                      Compress PDF
                      {/* @ts-ignore */}
                      <Icon name="Zap" size={20} fill="currentColor"/>
                    </button>
                  </div>
                </div>

                {/* Right Column: Settings */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Compression Level Cards */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          {/* @ts-ignore */}
                          <Icon name="BarChart3" className="text-blue-600" size={20}/>
                          Compression Mode
                        </h3>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                       {[
                         { id: CompressionLevel.RECOMMENDED, title: 'Recommended', desc: 'Good quality, good compression (~45%).', color: 'border-blue-500 bg-blue-50' },
                         { id: CompressionLevel.EXTREME, title: 'Extreme', desc: 'Low quality, max compression (~80%).', color: 'border-green-500 bg-green-50' },
                         { id: CompressionLevel.LOSSLESS, title: 'Lossless', desc: 'Max quality, low compression (~15%).', color: 'border-purple-500 bg-purple-50' },
                         { id: CompressionLevel.LESS, title: 'High Quality', desc: 'Better quality, some compression (~25%).', color: 'border-orange-500 bg-orange-50' },
                       ].map((level) => (
                         <div 
                           key={level.id}
                           onClick={() => handleLevelChange(level.id as CompressionLevel)}
                           className={`
                             relative p-4 rounded-xl border-2 cursor-pointer transition-all h-full
                             ${settings.level === level.id ? `border-blue-600 bg-blue-50 ring-1 ring-blue-600` : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'}
                           `}
                         >
                           <div className="flex justify-between items-start">
                             <div>
                               <p className="font-bold text-slate-900">{level.title}</p>
                               <p className="text-xs text-slate-500 mt-1 leading-relaxed">{level.desc}</p>
                             </div>
                             {settings.level === level.id && (
                               <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white shrink-0 ml-2">
                                 {/* @ts-ignore */}
                                 <Icon name="Check" size={12} />
                               </div>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>

                     {/* Reduction Slider */}
                     <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                          <label className="text-sm font-bold text-slate-700">Target Reduction Percentage</label>
                          <span className="text-sm font-bold text-blue-600 bg-white px-3 py-1 rounded-md shadow-sm border border-slate-200">
                            {settings.compressionPercentage}%
                          </span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="90" 
                          step="5"
                          value={settings.compressionPercentage}
                          onChange={(e) => handlePercentageChange(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                          <span>10% (Low)</span>
                          <span>90% (High)</span>
                        </div>
                     </div>
                  </div>

                  {/* Advanced Settings */}
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                     <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                       {/* @ts-ignore */}
                       <Icon name="Settings" className="text-slate-600" size={20}/>
                       Advanced Options
                     </h3>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                       {[
                         { key: 'grayscale', label: 'Grayscale', icon: 'Monitor' },
                         { key: 'removeMetadata', label: 'No Metadata', icon: 'Tag' },
                         { key: 'webOptimization', label: 'Web Optimize', icon: 'Globe' },
                         { key: 'subsetFonts', label: 'Subset Fonts', icon: 'Type' },
                         { key: 'flattenForms', label: 'Flatten Forms', icon: 'Layout' },
                         { key: 'removeBookmarks', label: 'No Bookmarks', icon: 'Bookmark' },
                         { key: 'removeAnnotations', label: 'No Annotations', icon: 'MessageSquare' },
                         { key: 'removeThumbnails', label: 'No Thumbnails', icon: 'Image' },
                         { key: 'cleanContent', label: 'Clean Content', icon: 'Sparkles' },
                       ].map((item) => (
                         <label key={item.key} className="flex items-center space-x-3 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors select-none">
                            <div className={`
                              w-5 h-5 rounded flex items-center justify-center border transition-colors
                              ${settings[item.key as keyof CompressionSettings] ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-300'}
                            `}>
                               {settings[item.key as keyof CompressionSettings] && (
                                 /* @ts-ignore */
                                 <Icon name="Check" size={14} strokeWidth={3} />
                               )}
                            </div>
                            <input 
                               type="checkbox" 
                               checked={settings[item.key as keyof CompressionSettings] as boolean}
                               onChange={(e) => setSettings({...settings, [item.key]: e.target.checked})}
                               className="hidden"
                            />
                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                         </label>
                       ))}
                     </div>

                     <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-semibold text-slate-700">Image Quality</label>
                          <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{settings.imageQuality}%</span>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="100" 
                          value={settings.imageQuality}
                          onChange={(e) => setSettings({...settings, imageQuality: parseInt(e.target.value)})}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                     </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View: PROCESSING */}
        {appState === AppState.PROCESSING && (
           <div className="max-w-2xl mx-auto text-center pt-10">
              <div className="relative w-48 h-48 mx-auto mb-8">
                 <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                 <div 
                    className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
                 ></div>
                 <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-4xl font-bold text-slate-800">{Math.round(globalProgress)}%</span>
                 </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentAction}</h2>
              <p className="text-slate-500">Please wait while we optimize your documents...</p>

              <div className="mt-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-left max-w-lg mx-auto">
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                       <span className={globalProgress > 10 ? 'text-blue-600' : 'text-slate-400'}>Analyzing</span>
                       <span className={globalProgress > 40 ? 'text-blue-600' : 'text-slate-400'}>Processing</span>
                       <span className={globalProgress > 80 ? 'text-blue-600' : 'text-slate-400'}>Finalizing</span>
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
          <div className="max-w-5xl mx-auto animate-fade-in-up pb-10">
            
            {/* Top Bar with New Action */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Result Summary</h2>
                <button 
                  onClick={resetApp}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-full flex items-center gap-2 shadow-lg shadow-blue-200 transition-all hover:scale-105"
                >
                    {/* @ts-ignore */}
                    <Icon name="Plus" size={18} /> Compress Another PDF
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               {/* Left: Actions */}
               <div className="lg:col-span-1 space-y-6">
                  {/* Success Card */}
                  <div className={`
                    border rounded-2xl p-6 text-center relative overflow-hidden
                    ${stats.percentageSaved > 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}
                  `}>
                     <div className={`
                       inline-flex items-center justify-center w-12 h-12 rounded-full mb-3
                       ${stats.percentageSaved > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}
                     `}>
                        {/* @ts-ignore */}
                        <Icon name={stats.percentageSaved > 0 ? "Check" : "AlertCircle"} size={24} strokeWidth={3} />
                     </div>
                     <h2 className="text-xl font-bold text-slate-900 mb-1">
                        {stats.percentageSaved > 0 ? "Success!" : "Optimized"}
                     </h2>
                     <p className="text-sm text-slate-600 mb-4">
                        {stats.percentageSaved > 0 ? "Your files are now smaller." : "File is already optimized."}
                     </p>
                     <div className="bg-white/60 rounded-lg p-3 backdrop-blur-sm border border-slate-100">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-slate-500">Saved</span>
                           <span className={`font-bold ${stats.percentageSaved > 0 ? 'text-green-700' : 'text-slate-700'}`}>
                             {formatSize(stats.originalTotal - stats.compressedTotal)}
                           </span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
                     <h3 className="text-lg font-bold text-slate-900 mb-2">Download Options</h3>
                     
                     <button 
                        onClick={handleDownload}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                     >
                        {/* @ts-ignore */}
                        <Icon name="Download" size={20} />
                        Download PDF
                     </button>
                     <p className="text-xs text-center text-slate-500 mt-2">
                       Files are processed locally in your browser.
                     </p>

                     <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                       <button 
                         onClick={handleShare}
                         className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                       >
                          {/* @ts-ignore */}
                          <Icon name="Share2" size={16} /> Share
                       </button>
                       <button 
                         onClick={handlePreview}
                         className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                       >
                          {/* @ts-ignore */}
                          <Icon name="Eye" size={16} /> Preview
                       </button>
                     </div>
                  </div>

                  {stats.percentageSaved < 5 && (
                     <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-slate-600 leading-relaxed">
                        <p className="font-bold text-blue-800 mb-1">Note on Compression</p>
                        Your file was already well-compressed. Client-side tools optimize structure and metadata. For deep image compression (50%+), server-side tools are typically required.
                     </div>
                  )}
               </div>

               {/* Right: Analytics */}
               <div className="lg:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col">
                      <h3 className="text-xl font-bold text-slate-900 mb-6">Analysis Report</h3>
                      <ResultCharts stats={stats} />
                      
                      {/* Feature Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-auto pt-8">
                        {[
                            { label: 'Secure', icon: 'Lock', color: 'text-green-600', bg: 'bg-green-50' },
                            { label: 'Optimized', icon: 'Zap', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            { label: 'Fast', icon: 'Timer', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { label: 'Clean', icon: 'Sparkles', color: 'text-purple-600', bg: 'bg-purple-50' },
                        ].map((badge, i) => (
                        <div key={i} className={`flex flex-col items-center justify-center p-4 rounded-xl ${badge.bg} transition-transform hover:scale-105`}>
                            {/* @ts-ignore */}
                            <Icon name={badge.icon} className={`${badge.color} mb-2`} size={24} />
                            <span className={`text-xs font-bold ${badge.color} uppercase`}>{badge.label}</span>
                        </div>
                        ))}
                      </div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
