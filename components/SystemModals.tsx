import React from 'react';
import { X, Database, Server, Activity, Cpu } from 'lucide-react';
import { CloudFile } from '../types';

// Database Viewer Modal
export const DatabaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  files: CloudFile[];
}> = ({ isOpen, onClose, files }) => {
  if (!isOpen) return null;

  // Create a "DB View" of the state, excluding heavy base64 data
  const dbState = {
    _comment: "This represents the document-store state in the backend",
    tableName: "cloud_files",
    recordCount: files.length,
    lastSync: new Date().toISOString(),
    records: files.map(f => ({
      _id: f.id,
      filename: f.name,
      fileType: f.type,
      sizeBytes: f.size,
      uploadTimestamp: f.uploadDate.toISOString(),
      status: f.processingState,
      aiMetadata: f.aiData || null
    }))
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded border border-slate-200 shadow-sm">
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <div>
               <h3 className="font-bold text-slate-800 text-sm">State Store Viewer</h3>
               <p className="text-xs text-slate-400">Simulated NoSQL Document Store</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-slate-900 custom-scrollbar relative">
          <div className="absolute top-2 right-4 text-[10px] font-mono text-slate-500 uppercase tracking-wider select-none">
            read_only
          </div>
          <pre className="p-4 text-xs font-mono text-emerald-400 leading-relaxed">
            {JSON.stringify(dbState, null, 2)}
          </pre>
        </div>
        
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
           <span className="flex items-center gap-1.5">
             <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
             Connected to: <span className="font-mono">us-east-1-db-cluster</span>
           </span>
           <span className="font-mono">Query Latency: 4ms</span>
        </div>
      </div>
    </div>
  );
};

// System Status Modal
export const SystemStatusModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const services = [
    { name: 'API Gateway', type: 'infra', status: 'operational', latency: '24ms', load: 'Low' },
    { name: 'Auth Service', type: 'infra', status: 'operational', latency: '12ms', load: 'Low' },
    { name: 'Object Storage (S3)', type: 'storage', status: 'operational', latency: '45ms', load: 'Medium' },
    { name: 'Gemini AI (Moderation)', type: 'ai', status: 'operational', latency: '850ms', load: 'High' },
    { name: 'Gemini AI (Classification)', type: 'ai', status: 'operational', latency: '600ms', load: 'Medium' },
    { name: 'Gemini AI (OCR)', type: 'ai', status: 'operational', latency: '1.2s', load: 'High' },
    { name: 'Gemini AI (Vision)', type: 'ai', status: 'operational', latency: '920ms', load: 'Medium' },
    { name: 'Event Bus (Kafka)', type: 'infra', status: 'operational', latency: '5ms', load: 'Low' },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
           <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white rounded border border-slate-200 shadow-sm">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">System Health Monitor</h3>
              <p className="text-xs text-slate-400">Microservices Status Dashboard</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 space-y-3 bg-white max-h-[60vh] overflow-y-auto">
          {services.map((svc, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-md border shadow-sm ${svc.type === 'ai' ? 'bg-purple-50 border-purple-100 text-purple-600' : 'bg-white border-slate-200 text-slate-500'}`}>
                   {svc.type === 'ai' ? <Cpu className="w-4 h-4" /> : <Server className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">{svc.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">Latency: {svc.latency}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                 <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                   <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                    </span>
                   {svc.status}
                 </span>
                 <span className="text-[10px] text-slate-400">Load: {svc.load}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-xs text-center text-slate-400 flex items-center justify-center gap-2">
            <Activity className="w-3 h-3" />
            <span>All systems operational. Last check: Just now.</span>
          </div>
        </div>
      </div>
    </div>
  );
};