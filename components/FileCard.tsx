
import React from 'react';
import { CloudFile, ProcessingState, FileType } from '../types';
import { FileImage, FileVideo, FileText, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface FileCardProps {
  file: CloudFile;
  onClick: (file: CloudFile) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ file, onClick }) => {
  const getIcon = () => {
    switch (file.type) {
      case FileType.VIDEO: return <FileVideo className="w-8 h-8 text-blue-500" />;
      case FileType.IMAGE: return <FileImage className="w-8 h-8 text-purple-500" />;
      default: return <FileText className="w-8 h-8 text-slate-500" />;
    }
  };

  const getStatusBadge = () => {
    switch (file.processingState) {
      case ProcessingState.PROCESSING:
        return (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-full text-xs font-medium text-blue-600 flex items-center gap-1 shadow-sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            Processing
          </div>
        );
      case ProcessingState.COMPLETED:
        // If aiData exists but isSafe is false
        if (file.aiData?.isSafe === false) {
          return (
            <div className="absolute top-2 right-2 bg-red-100 px-2 py-1 rounded-full text-xs font-bold text-red-600 flex items-center gap-1 shadow-sm border border-red-200">
              <AlertCircle className="w-3 h-3" />
              Flagged
            </div>
          );
        }
        return (
          <div className="absolute top-2 right-2 bg-green-100 px-2 py-1 rounded-full text-xs font-medium text-green-700 flex items-center gap-1 shadow-sm border border-green-200">
            <CheckCircle className="w-3 h-3" />
            Ready
          </div>
        );
      case ProcessingState.FAILED:
        return (
          <div className="absolute top-2 right-2 bg-red-100 px-2 py-1 rounded-full text-xs font-medium text-red-600 flex items-center gap-1 shadow-sm">
            Error
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      onClick={() => onClick(file)}
      className="group relative bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Thumbnail Area */}
      <div className="aspect-[4/3] bg-slate-100 relative flex items-center justify-center overflow-hidden">
        {file.type === FileType.IMAGE && file.thumbnailUrl ? (
          <img 
            src={file.thumbnailUrl} 
            alt={file.name} 
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${file.aiData?.isSafe === false ? 'blur-md' : ''}`} 
          />
        ) : (
          <div className="bg-slate-50 w-full h-full flex items-center justify-center">
             {getIcon()}
          </div>
        )}
        
        {getStatusBadge()}
        
        {/* Progress Bar Overlay for Processing */}
        {file.processingState === ProcessingState.PROCESSING && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200">
            <div 
              className="h-full bg-blue-500 transition-all duration-300" 
              style={{ width: `${file.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info Area */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-slate-900 truncate" title={file.name}>{file.name}</h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
          <span className="text-xs text-slate-400">{file.uploadDate.toLocaleDateString()}</span>
        </div>
        
        {/* Quick Tags */}
        {file.aiData?.tags && (
          <div className="flex gap-1 mt-2 flex-wrap h-5 overflow-hidden">
            {file.aiData.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded-full truncate max-w-[80px]">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
