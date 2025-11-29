export enum AppState {
  CONFIGURATION = 'CONFIGURATION',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export enum CompressionLevel {
  EXTREME = 'EXTREME',
  RECOMMENDED = 'RECOMMENDED',
  LOSSLESS = 'LOSSLESS',
  CUSTOM = 'CUSTOM',
  LESS = 'LESS'
}

export interface PDFFile {
  id: string;
  file: File;
  previewUrl?: string;
  originalSize: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
  compressedSize?: number;
}

export interface CompressionSettings {
  level: CompressionLevel;
  imageQuality: number; // 0-100
  grayscale: boolean;
  removeMetadata: boolean;
  subsetFonts: boolean;
  flattenForms: boolean;
  removeAnnotations: boolean;
  downsampleImages: boolean;
  targetDPI: number;
  // New advanced features
  webOptimization: boolean;
  removeBookmarks: boolean;
  cleanContent: boolean;
  removeThumbnails: boolean;
}

export interface ProcessingStats {
  originalTotal: number;
  compressedTotal: number;
  percentageSaved: number;
  timeTaken: number;
}