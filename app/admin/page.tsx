"use client";

import { useState } from 'react';

const APP_FEATURES = [
  { id: 'myDay', name: 'My Day (Daily Core)', desc: 'Ultradian timelines and non-negotiables.' },
  { id: 'actions', name: 'Actions (Doomscroll UI)', desc: '1-Tap decision card viewport.' },
  { id: 'suchi', name: 'Suchi Main Orchestrator', desc: 'Central command gateway.' },
  { id: 'chats', name: 'Chats', desc: 'Agent & Team/Family communication channels.' },
  { id: 'goals', name: 'Goals (Missions)', desc: 'AI-planned outcomes and timelines.' },
  { id: 'vault', name: 'Vault (Artifacts)', desc: 'Google Drive connected document storage.' },
  { id: 'settings', name: 'Settings (Sovereignty)', desc: 'Autonomy toggles and integrations.' },
  { id: 'voiceInput', name: 'Voice Input', desc: 'Tap-to-hold persistent mic.' },
  { id: 'cameraVision', name: 'Computer Vision', desc: 'Real-time contextual visual capture.' },
  { id: 'googleWorkspace', name: 'Google Workspace', desc: 'Enable Docs, Sheets, Calendar, Gmail.' },
  { id: 'chatgptPlugins', name: 'ChatGPT Plugins', desc: 'Access third-party API tool executions.' },
  { id: 'agentAutonomy', name: 'Full Agent Autonomy', desc: 'DANGEROUS: Agents execute without asking.', warning: true },
];

export default function AdminPanel() {
  // Initialize all to true for prototype
  const [flags, setFlags] = useState<Record<string, boolean>>(
    APP_FEATURES.reduce((acc, feat) => ({ ...acc, [feat.id]: true }), {})
  );

  const toggleFlag = (key: string) => {
    setFlags(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-10 pt-6 pb-20 max-w-2xl mx-auto">
      
      {/* Header */}
      <section className="shrink-0 flex items-center justify-between">
        <h1 className="text-4xl font-serif italic text-slate-900 dark:text-white tracking-tight leading-tight">
          Superapp Operations
        </h1>
        <div className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded-full text-xs font-black uppercase tracking-widest border border-red-200 dark:border-red-500/20">
          Admin Terminal
        </div>
      </section>

      <section className="bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/30 rounded-2xl p-5">
         <h3 className="text-indigo-900 dark:text-indigo-400 font-bold text-sm mb-1">Global Feature Matrix</h3>
         <p className="text-indigo-700 dark:text-indigo-500/80 text-xs leading-relaxed">
           Toggle these flags to enable or restrict specific features for active users. Disabling a feature removes it entirely from the user interface.
         </p>
      </section>

      {/* Feature Flags List */}
      <section className="space-y-4">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-[2rem] p-4 divide-y divide-slate-100/50 dark:divide-slate-800 border border-slate-200/50 dark:border-slate-800 shadow-sm">
          
          {APP_FEATURES.map((feat) => (
             <div key={feat.id} className="flex items-center justify-between py-4">
               <div className="pr-4">
                 <h4 className={`font-semibold \${feat.warning ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
                   {feat.name}
                 </h4>
                 <p className="text-sm text-slate-500 dark:text-slate-400">{feat.desc}</p>
               </div>
               <button 
                 onClick={() => toggleFlag(feat.id)} 
                 className={`w-14 h-7 shrink-0 rounded-full relative shadow-inner transition-colors \${flags[feat.id] ? (feat.warning ? 'bg-red-500' : 'bg-indigo-500') : 'bg-slate-300 dark:bg-slate-600'}`}
               >
                 <div className={`w-6 h-6 bg-white rounded-full absolute top-0.5 shadow-sm transition-all \${flags[feat.id] ? 'right-0.5' : 'left-0.5'}`}></div>
               </button>
             </div>
          ))}

        </div>
      </section>

    </div>
  );
}
