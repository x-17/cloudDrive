import React, { useEffect, useRef } from 'react';
import { ServiceLog } from '../types';
import { Terminal, Activity, Check, X, Clock, Server, Info } from 'lucide-react';

interface ServiceLogViewerProps {
  logs: ServiceLog[];
  variant?: 'sidebar' | 'full';
}

export const ServiceLogViewer: React.FC<ServiceLogViewerProps> = ({ logs, variant = 'sidebar' }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (variant === 'sidebar') {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, variant]);

  // Sidebar Mode (Terminal Style)
  if (variant === 'sidebar') {
    return (
      <div className="bg-slate-900 text-slate-200 rounded-lg overflow-hidden flex flex-col h-64 md:h-full border border-slate-700 shadow-inner font-mono text-xs">
        <div className="bg-slate-800 p-2 border-b border-slate-700 flex items-center gap-2 sticky top-0 z-10">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span className="font-semibold text-slate-300">Serverless Event Bus</span>
          <div className="ml-auto flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
          </div>
        </div>
        <div className="p-3 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic text-center mt-10">Waiting for events...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-slate-500 shrink-0 tabular-nums">
                  {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 2 } as any)}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-bold ${
                      log.status === 'error' ? 'text-red-400' : 'text-blue-400'
                    }`}>
                      [{log.serviceName}]
                    </span>
                    {log.status === 'success' && <Check className="w-3 h-3 text-green-500" />}
                    {log.status === 'error' && <X className="w-3 h-3 text-red-500" />}
                    {log.status === 'info' && <Activity className="w-3 h-3 text-slate-500" />}
                  </div>
                  <p className="text-slate-300 break-words leading-relaxed opacity-90">{log.message}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>
    );
  }

  // Full Page Mode (Table Style)
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Timestamp
              </th>
              <th className="px-6 py-4 font-semibold text-slate-900">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" /> Service
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-900">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4" /> Status
                </div>
              </th>
              <th className="px-6 py-4 font-semibold text-slate-900">Message</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                  No system logs recorded in this session yet.
                </td>
              </tr>
            ) : (
              logs.slice().reverse().map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 tabular-nums whitespace-nowrap">
                    {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as any)}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700">
                    <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200 text-xs">
                      {log.serviceName}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${log.status === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : ''}
                      ${log.status === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : ''}
                      ${log.status === 'info' ? 'bg-blue-100 text-blue-700 border border-blue-200' : ''}
                    `}>
                      {log.status === 'success' && <Check className="w-3 h-3" />}
                      {log.status === 'error' && <X className="w-3 h-3" />}
                      {log.status === 'info' && <Activity className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 max-w-xl truncate" title={log.message}>
                    {log.message}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};