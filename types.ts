export enum AppState {
  IDLE = 'IDLE',
  SETTINGS = 'SETTINGS',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export enum CompressionLevel {
  EXTREME = 'EXTREME',
  RECOMMENDED = 'RECOMMENDED',
  LESS = 'LESS',
  CUSTOM = 'CUSTOM'
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
}

export interface ProcessingStats {
  originalTotal: number;
  compressedTotal: number;
  percentageSaved: number;
  timeTaken: number;
}
