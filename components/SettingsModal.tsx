
import React, { useState } from 'react';
import { X, User, CreditCard, Bell, Shield, Save, Loader2, CheckCircle, HardDrive } from 'lucide-react';
import { CloudFile } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string } | null;
  storageStats: { used: number; max: number; percent: number; formattedUsed: string; formattedMax: string };
}

type SettingsTab = 'profile' | 'billing' | 'notifications';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, user, storageStats }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: {
      email: true,
      browser: true,
      marketing: false
    }
  });

  if (!isOpen) return null;

  const handleSave = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg('Changes saved successfully');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  const TabButton = ({ id, icon: Icon, label }: { id: SettingsTab; icon: any; label: string }) => (
    <button
      onClick={() => { setActiveTab(id); setSuccessMsg(''); }}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-blue-50 text-blue-700' 
          : 'text-slate-600 hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Sidebar */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 p-6 flex-shrink-0 flex flex-col">
          <h2 className="text-lg font-bold text-slate-800 mb-6 px-2">Account Settings</h2>
          <nav className="space-y-1 flex-1">
            <TabButton id="profile" icon={User} label="My Profile" />
            <TabButton id="billing" icon={CreditCard} label="Billing & Plans" />
            <TabButton id="notifications" icon={Bell} label="Notifications" />
          </nav>
          <div className="mt-auto">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
               <div className="flex items-center gap-2 mb-2">
                 <Shield className="w-4 h-4 text-green-600" />
                 <span className="text-xs font-semibold text-slate-700">Secure Connection</span>
               </div>
               <p className="text-[10px] text-slate-500 leading-tight">
                 Your data is encrypted at rest and in transit using TLS 1.3.
               </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
            <h3 className="text-lg font-semibold text-slate-800 capitalize">
              {activeTab === 'billing' ? 'Billing & Plans' : activeTab}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-8">
            
            {activeTab === 'profile' && (
              <div className="max-w-lg space-y-6">
                <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                  <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white shadow-lg">
                    {formData.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                      Change Avatar
                    </button>
                    <p className="text-xs text-slate-400 mt-2">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-slate-400 mt-1">Contact support to change your email.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="max-w-xl space-y-8">
                {/* Current Plan */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white shadow-lg">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Current Plan</p>
                      <h3 className="text-3xl font-bold mt-1">Pro Plan</h3>
                      <p className="text-slate-400 text-sm mt-1">$12.00 / month</p>
                    </div>
                    <span className="bg-blue-500/20 text-blue-200 border border-blue-500/50 px-3 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>
                  <div className="pt-6 border-t border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Next payment due</span>
                      <span className="font-mono">July 1, 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">Payment method</span>
                      <span className="flex items-center gap-2">
                        <CreditCard className="w-3 h-3" />
                        •••• 4242
                      </span>
                    </div>
                  </div>
                </div>

                {/* Usage Stats */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                   <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-blue-50 rounded-lg">
                       <HardDrive className="w-5 h-5 text-blue-600" />
                     </div>
                     <div>
                       <h4 className="font-semibold text-slate-900">Storage Usage</h4>
                       <p className="text-xs text-slate-500">Values are updated in real-time</p>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div>
                       <div className="flex justify-between text-sm mb-2 font-medium">
                         <span className="text-slate-700">{storageStats.formattedUsed} used</span>
                         <span className="text-slate-400">{storageStats.formattedMax} total</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                         <div 
                           className={`h-full rounded-full transition-all duration-1000 ${
                             storageStats.percent > 90 ? 'bg-red-500' : 'bg-blue-500'
                           }`} 
                           style={{ width: `${storageStats.percent}%` }}
                         ></div>
                       </div>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="block text-xs text-slate-500">Documents</span>
                          <span className="font-semibold text-slate-700">--</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <span className="block text-xs text-slate-500">Images & Media</span>
                          <span className="font-semibold text-slate-700">{storageStats.formattedUsed}</span>
                        </div>
                     </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="max-w-lg space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900 border-b border-slate-100 pb-2">Email Notifications</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Security Alerts</p>
                      <p className="text-xs text-slate-500">Get notified about suspicious activity</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={true} disabled className="sr-only peer" />
                      <div className="w-11 h-6 bg-blue-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all opacity-50 cursor-not-allowed"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Processing Complete</p>
                      <p className="text-xs text-slate-500">When your files finish analyzing</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notifications.email} 
                        onChange={() => setFormData({
                          ...formData, 
                          notifications: {...formData.notifications, email: !formData.notifications.email}
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h4 className="font-medium text-slate-900 border-b border-slate-100 pb-2">Marketing</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Product Updates</p>
                      <p className="text-xs text-slate-500">News about features and improvements</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.notifications.marketing} 
                        onChange={() => setFormData({
                          ...formData, 
                          notifications: {...formData.notifications, marketing: !formData.notifications.marketing}
                        })}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
             <span className="text-xs text-green-600 font-medium flex items-center gap-1 h-5">
               {successMsg && (
                 <>
                   <CheckCircle className="w-3 h-3" />
                   {successMsg}
                 </>
               )}
             </span>
             <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
