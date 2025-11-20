
import React from 'react';
import { CloudFile, ProcessingState } from '../types';
import { X, Shield, Tag, FileText, Image as ImageIcon, FolderInput, AlertTriangle, Loader } from 'lucide-react';

interface FileDetailModalProps {
  file: CloudFile | null;
  onClose: () => void;
}

export const FileDetailModal: React.FC<FileDetailModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  const data = file.aiData;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Left: Preview */}
        <div className="md:w-1/2 bg-slate-100 p-6 flex items-center justify-center relative">
          {file.thumbnailUrl ? (
            <img 
              src={file.thumbnailUrl} 
              alt={file.name} 
              className={`max-w-full max-h-full rounded-lg shadow-lg object-contain ${data?.isSafe === false ? 'blur-xl opacity-50' : ''}`} 
            />
          ) : (
            <div className="text-slate-400 flex flex-col items-center">
              <ImageIcon className="w-16 h-16 mb-2" />
              <span>No preview available</span>
            </div>
          )}
          
          {/* Overlay for flagged content */}
          {data?.isSafe === false && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 px-6 py-4 rounded-xl shadow-lg flex flex-col items-center text-center max-w-xs">
                <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
                <h3 className="font-bold text-red-600">Sensitive Content Detected</h3>
                <p className="text-sm text-slate-600 mt-1">{data.safetyReason || "This image has been flagged by our moderation service."}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Data */}
        <div className="md:w-1/2 flex flex-col h-full max-h-[90vh]">
          {/* Header */}
          <div className="p-5 border-b border-slate-100 flex justify-between items-start bg-white sticky top-0 z-10">
            <div>
              <h2 className="text-xl font-bold text-slate-800 truncate max-w-xs" title={file.name}>{file.name}</h2>
              <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                <span className={`w-2 h-2 rounded-full ${file.processingState === ProcessingState.COMPLETED ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></span>
                Status: <span className="capitalize font-medium">{file.processingState}</span>
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-white">
            
            {/* 1. Metadata Service */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wider">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span>Metadata Service</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 border border-slate-100">
                {data?.description || (
                   <span className="text-slate-400 italic flex items-center gap-2">
                     <Loader className="w-3 h-3 animate-spin" /> generating description...
                   </span>
                )}
              </div>
            </div>

            {/* 2. Classification Service */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wider">
                <Tag className="w-4 h-4 text-blue-500" />
                <span>Classification Service</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {data?.tags ? (
                  data.tags.map((tag, i) => (
                    <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100">
                      #{tag}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400 italic flex items-center gap-2">
                     <Loader className="w-3 h-3 animate-spin" /> classifying...
                   </span>
                )}
              </div>
              {data?.suggestedFolder && (
                 <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 bg-slate-50 p-2 rounded border border-dashed border-slate-200">
                   <FolderInput className="w-3 h-3" />
                   Suggested Path: <span className="font-mono text-slate-700">/CloudDrive/{data.suggestedFolder}/</span>
                 </div>
              )}
            </div>

            {/* 3. Content Moderation Service */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>Moderation Service</span>
              </div>
              <div className={`p-3 rounded-lg border ${data?.isSafe === false ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                 <div className="flex items-center justify-between">
                   <span className={`text-sm font-medium ${
                     data?.isSafe === undefined ? 'text-slate-500' : 
                     data?.isSafe === false ? 'text-red-700' : 'text-emerald-700'
                   }`}>
                     {data?.isSafe === undefined ? "Pending Check..." : (data.isSafe ? "Content Passed Safety Check" : "Content Flagged")}
                   </span>
                   {data?.isSafe === true && <CheckCircleIcon className="w-4 h-4 text-emerald-600" />}
                 </div>
                 {data?.safetyReason && (
                   <p className="text-xs mt-1 text-red-600">{data.safetyReason}</p>
                 )}
              </div>
            </div>

            {/* 4. OCR Service */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 uppercase tracking-wider">
                <FileText className="w-4 h-4 text-orange-500" />
                <span>OCR Service</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 border border-slate-100 min-h-[80px] max-h-40 overflow-y-auto font-mono text-xs">
                {data?.extractedText ? data.extractedText : (
                  <span className="text-slate-400 italic flex items-center gap-2">
                     {file.processingState === ProcessingState.COMPLETED ? "No text detected." : (
                       <><Loader className="w-3 h-3 animate-spin" /> scanning text...</>
                     )}
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
             <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
               Close
             </button>
             <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm">
               Download JSON Report
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckCircleIcon = ({className}: {className?: string}) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
