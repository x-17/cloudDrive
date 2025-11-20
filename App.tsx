
import React, { useState, useCallback, useRef } from 'react';
import { Cloud, UploadCloud, Plus, Search, LayoutGrid, List, Bell, Database, History, LogOut, User as UserIcon } from 'lucide-react';
import { CloudFile, FileType, ProcessingState, ServiceLog, AIAnalysisResult, AppNotification } from './types';
import { FileCard } from './components/FileCard';
import { FileDetailModal } from './components/FileDetailModal';
import { ServiceLogViewer } from './components/ServiceLogViewer';
import { DatabaseModal, SystemStatusModal } from './components/SystemModals';
import { SettingsModal } from './components/SettingsModal';
import { LoginPage } from './components/LoginPage';
import { 
  performModerationCheck, 
  performClassification, 
  performOCR, 
  performMetadataAnalysis 
} from './services/geminiService';

type ViewState = 'drive' | 'recent' | 'logs';

interface UserProfile {
  name: string;
  email: string;
}

const App: React.FC = () => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // App State
  const [files, setFiles] = useState<CloudFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<CloudFile | null>(null);
  const [logs, setLogs] = useState<ServiceLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeView, setActiveView] = useState<ViewState>('drive');
  
  // Modals State
  const [showDbModal, setShowDbModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (userData: UserProfile) => {
    setUser(userData);
    setIsAuthenticated(true);
    addLog('Auth Service', `User ${userData.email} logged in successfully`, 'success');
    addNotification('Welcome Back', `Signed in as ${userData.name}`, 'success');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setFiles([]); // Optional: clear state on logout
    setLogs([]);
  };

  const addLog = (serviceName: string, message: string, status: 'info' | 'success' | 'error' = 'info') => {
    const newLog: ServiceLog = {
      id: Math.random().toString(36).substring(7),
      serviceName,
      message,
      status,
      timestamp: new Date(),
    };
    setLogs(prev => [...prev, newLog]);
  };

  const addNotification = (title: string, message: string, type: AppNotification['type'] = 'info') => {
    const newNotif: AppNotification = {
      id: Math.random().toString(36).substring(7),
      title,
      message,
      type,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateFileAIData = (fileId: string, data: Partial<AIAnalysisResult>) => {
    setFiles(prev => prev.map(f => {
      if (f.id === fileId) {
        return {
          ...f,
          aiData: { ...(f.aiData || {}), ...data }
        };
      }
      return f;
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    const file = uploadedFiles[0];
    const fileId = Math.random().toString(36).substring(7);

    const newFile: CloudFile = {
      id: fileId,
      name: file.name,
      type: file.type.startsWith('image') ? FileType.IMAGE : FileType.DOCUMENT,
      size: file.size,
      url: URL.createObjectURL(file),
      thumbnailUrl: URL.createObjectURL(file),
      uploadDate: new Date(),
      processingState: ProcessingState.PENDING,
      progress: 0,
    };

    setFiles(prev => [newFile, ...prev]);
    // Switch to Recent view so user sees the new file immediately at the top
    setActiveView('recent');
    
    addLog('API Gateway', `Received upload request for "${file.name}"`, 'success');
    addNotification('Upload Started', `Uploading "${file.name}"...`, 'info');
    
    orchestrateProcessing(newFile, file);
    
    event.target.value = '';
  };

  const orchestrateProcessing = async (cloudFile: CloudFile, rawFile: File) => {
    updateFileStatus(cloudFile.id, ProcessingState.PROCESSING, 5);
    addLog('Orchestrator', `Initializing workflow: [Mod, Class, OCR, Meta]`, 'info');

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      updateFileStatus(cloudFile.id, ProcessingState.PROCESSING, 15);
      addLog('Media Service', `Transcoding completed. Thumbnail generated.`, 'success');

      const reader = new FileReader();
      reader.readAsDataURL(rawFile);
      
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        updateFileStatus(cloudFile.id, ProcessingState.PROCESSING, 25);
        addLog('Event Bus', `Broadcasting 'FILE_UPLOADED' event to topic 'image-analysis'`, 'info');

        const moderationTask = performModerationCheck(base64Data, rawFile.type).then(res => {
          updateFileAIData(cloudFile.id, res);
          if (res.isSafe === false) {
            addLog('Moderation Service', `Content Flagged: ${res.safetyReason}`, 'error');
            addNotification('Safety Alert', `"${cloudFile.name}" flagged as unsafe.`, 'warning');
          } else {
            addLog('Moderation Service', `Content Approved.`, 'success');
          }
        });

        const classificationTask = performClassification(base64Data, rawFile.type).then(res => {
          updateFileAIData(cloudFile.id, res);
          addLog('Classifier Service', `Categorized as: ${res.suggestedFolder}`, 'success');
        });

        const ocrTask = performOCR(base64Data, rawFile.type).then(res => {
          updateFileAIData(cloudFile.id, res);
          const textLen = res.extractedText?.length || 0;
          addLog('OCR Service', `Extraction complete. ${textLen} chars found.`, 'success');
        });

        const metadataTask = performMetadataAnalysis(base64Data, rawFile.type).then(res => {
          updateFileAIData(cloudFile.id, res);
          addLog('Metadata Service', `Visual description generated.`, 'success');
        });

        await Promise.all([moderationTask, classificationTask, ocrTask, metadataTask]);
        
        addLog('Database Service', `Persisting aggregated metadata for ${cloudFile.id}`, 'info');
        setFiles(prev => prev.map(f => {
          if (f.id === cloudFile.id) {
            return {
              ...f,
              processingState: ProcessingState.COMPLETED,
              progress: 100,
            };
          }
          return f;
        }));
        addLog('Orchestrator', `Workflow completed successfully.`, 'success');
        addNotification('Processing Complete', `"${cloudFile.name}" analyzed successfully.`, 'success');
      };

    } catch (error) {
      console.error(error);
      updateFileStatus(cloudFile.id, ProcessingState.FAILED, 0);
      addLog('Orchestrator', `Workflow failed critically.`, 'error');
      addNotification('Processing Failed', `Could not process "${cloudFile.name}".`, 'error');
    }
  };

  const updateFileStatus = (id: string, state: ProcessingState, progress: number) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, processingState: state, progress } : f));
  };

  const getNavClass = (view: ViewState) => {
    const base = "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm transition-colors text-left";
    return activeView === view 
      ? `${base} bg-blue-50 text-blue-700` 
      : `${base} text-slate-600 hover:bg-slate-50`;
  };

  const getPageTitle = () => {
    switch(activeView) {
      case 'recent': return 'Recent Files';
      case 'logs': return 'System Event Logs';
      default: return 'My Drive';
    }
  };

  // Helper to sort files based on current view
  const getSortedFiles = () => {
    if (activeView === 'recent') {
      // Recent view: Sort by upload date descending (Newest first)
      return [...files].sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
    }
    // Drive view: Sort by name ascending (A-Z)
    return [...files].sort((a, b) => a.name.localeCompare(b.name));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Check Auth
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const displayedFiles = getSortedFiles();
  const unreadCount = notifications.filter(n => !n.read).length;
  
  // Calculate dynamic storage
  const totalUsage = files.reduce((acc, file) => acc + file.size, 0);
  const maxUsage = 100 * 1024 * 1024; // 100 MB Demo Quota to make the bar move visibly
  const usagePercent = Math.min((totalUsage / maxUsage) * 100, 100);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight">CloudDrive AI</h1>
            <p className="text-xs text-slate-500">Microservices Demo</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setActiveView('drive')} className={getNavClass('drive')}>
            <LayoutGrid className="w-4 h-4" />
            My Drive
          </button>
          <button onClick={() => setActiveView('recent')} className={getNavClass('recent')}>
            <History className="w-4 h-4" />
            Recent
          </button>
          <button onClick={() => setActiveView('logs')} className={getNavClass('logs')}>
            <List className="w-4 h-4" />
            System Logs
          </button>
          <div className="pt-4 mt-4 border-t border-slate-100">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Infrastructure</p>
            <button 
              onClick={() => setShowDbModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-slate-600 text-sm hover:bg-slate-50 hover:text-blue-600 transition-colors rounded-lg text-left group"
            >
              <Database className="w-4 h-4 group-hover:text-blue-600 transition-colors" />
              <span>State Store (DB)</span>
            </button>
            <button 
              onClick={() => setShowStatusModal(true)}
              className="w-full flex items-center gap-3 px-4 py-2 text-green-600 text-sm hover:bg-green-50 transition-colors rounded-lg text-left"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span>Services Online</span>
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
             <div className="flex justify-between items-end mb-2">
               <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Storage Used</h4>
               <span className="text-xs font-bold text-slate-700">{Math.round(usagePercent)}%</span>
             </div>
             <div className="w-full bg-slate-200 rounded-full h-2 mb-2 overflow-hidden">
               <div 
                 className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" 
                 style={{ width: `${usagePercent}%` }}
               ></div>
             </div>
             <div className="flex justify-between text-xs text-slate-500">
               <span>{formatBytes(totalUsage)}</span>
               <span>{formatBytes(maxUsage)}</span>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0 z-20">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">{getPageTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                className={`relative p-2 rounded-full transition-colors ${showNotifications ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
                onClick={() => {
                   setShowNotifications(!showNotifications);
                   setShowProfileMenu(false);
                }}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white ring-1 ring-white"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute top-12 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <h3 className="font-semibold text-sm text-slate-800">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs font-medium text-blue-600 hover:text-blue-700">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center flex flex-col items-center">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <Bell className="w-5 h-5 text-slate-300" />
                          </div>
                          <p className="text-sm text-slate-500">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-slate-50">
                          {notifications.map(n => (
                            <div key={n.id} className={`p-4 flex gap-3 hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/30' : ''}`}>
                              <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                n.type === 'success' ? 'bg-green-500' :
                                n.type === 'error' ? 'bg-red-500' :
                                n.type === 'warning' ? 'bg-amber-500' :
                                'bg-blue-500'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <h4 className={`text-sm font-medium ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</h4>
                                  <span className="text-[10px] text-slate-400">
                                    {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{n.message}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md shadow-blue-600/10 transition-all hover:shadow-lg active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Upload File
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*"
            />

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* User Profile */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 hover:bg-slate-50 p-1.5 pr-3 rounded-lg transition-colors"
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
              >
                 <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-200">
                   <span className="text-xs font-bold">{user?.name.substring(0, 2).toUpperCase()}</span>
                 </div>
                 <div className="hidden md:block text-left">
                   <p className="text-xs font-semibold text-slate-700 leading-none mb-0.5">{user?.name}</p>
                   <p className="text-[10px] text-slate-400 leading-none">Pro Plan</p>
                 </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                 <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)}></div>
                  <div className="absolute top-12 right-0 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                       <p className="text-sm font-medium text-slate-900">{user?.name}</p>
                       <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1">
                      <button 
                        onClick={() => {
                          setShowSettingsModal(true);
                          setShowProfileMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        Account Settings
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                 </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {activeView === 'logs' ? (
            <div className="flex-1 p-6 bg-slate-50 overflow-y-auto">
               <ServiceLogViewer logs={logs} variant="full" />
            </div>
          ) : (
            <>
              {/* Files Grid (Drive or Recent) */}
              <div className="flex-1 overflow-y-auto p-6">
                {files.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <UploadCloud className="w-16 h-16 mb-4 text-slate-300" />
                    <p className="text-lg font-medium text-slate-500">No files uploaded yet</p>
                    <p className="text-sm mt-2 text-slate-400 max-w-sm text-center">Upload an image to trigger the Microservices Architecture (Moderation, Classification, OCR, Metadata).</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-6 text-blue-600 font-medium hover:underline"
                    >
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4 px-1">
                       <h3 className="text-sm font-medium text-slate-500">
                         {activeView === 'recent' ? 'Most Recent Uploads' : 'All Files (A-Z)'}
                       </h3>
                       <span className="text-xs text-slate-400">{displayedFiles.length} items</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {displayedFiles.map(file => (
                        <FileCard key={file.id} file={file} onClick={setSelectedFile} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right Sidebar Log Panel (Only visible in drive/recent mode) */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-slate-200 bg-white flex-shrink-0 h-64 md:h-auto p-4 hidden md:block">
                <ServiceLogViewer logs={logs} variant="sidebar" />
              </div>
            </>
          )}
        </div>

      </main>

      {/* Modals */}
      {selectedFile && (
        <FileDetailModal file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
      <DatabaseModal 
        isOpen={showDbModal} 
        onClose={() => setShowDbModal(false)} 
        files={files} 
      />
      <SystemStatusModal 
        isOpen={showStatusModal} 
        onClose={() => setShowStatusModal(false)} 
      />
      <SettingsModal 
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        user={user}
        storageStats={{
          used: totalUsage,
          max: maxUsage,
          percent: usagePercent,
          formattedUsed: formatBytes(totalUsage),
          formattedMax: formatBytes(maxUsage)
        }}
      />
    </div>
  );
};

export default App;
