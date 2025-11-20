
export enum FileType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
}

export enum ProcessingState {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AIAnalysisResult {
  isSafe?: boolean;
  safetyReason?: string;
  tags?: string[];
  extractedText?: string;
  description?: string;
  suggestedFolder?: string;
}

export interface CloudFile {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  url: string;
  thumbnailUrl?: string;
  uploadDate: Date;
  processingState: ProcessingState;
  progress: number; // 0-100
  aiData?: AIAnalysisResult;
  base64Data?: string; // For demo purposes to keep data in memory
}

export interface ServiceLog {
  id: string;
  serviceName: string;
  timestamp: Date;
  message: string;
  status: 'info' | 'success' | 'error';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
  read: boolean;
}
