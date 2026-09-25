"use client";

import { useState } from 'react';

const FILTERS = ['All', 'Review', 'Confirm', 'Respond', 'Approve', 'Choose', 'Schedule', 'Done'];

const MOCK_ACTIONS = [
  {
    id: 1,
    type: 'Review',
    title: 'Review this email',
    explanation: 'Sarah sent an updated partnership proposal.',
    context: 'Received 10 mins ago. Suchi has already summarised the changes.',
    attachment: 'Partnership_Proposal_v3.pdf',
    options: ['Looks good, approve', 'Draft a reply for changes', 'Archive']
  },
  {
    id: 2,
    type: 'Choose',
    title: 'Which flight should I use?',
    explanation: 'Suchi found 4 flight options and 3 hotels for the Japan trip.',
    context: 'Need departure window to proceed booking.',
    attachment: 'Japan_Trip_Plan.md',
    options: ['Morning flights (6am - 10am)', 'Afternoon flights (12pm - 4pm)', 'Evening flights (after 6pm)']
  },
  {
    id: 3,
    type: 'Approve',
    title: 'Send this reply?',
    explanation: 'I’ve attached the updated proposal and suggested Thursday at 3 PM.',
    context: 'Draft generated based on your voice note.',
    options: ['Yes, send it', 'Edit before sending', 'Discard draft']
  }
];

export default function ActionsPage() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [actions, setActions] = useState(MOCK_ACTIONS);

  const handleActionClick = (actionId: number, choice: string) => {
    alert(`Decision logged: \${choice}`);
    setActions(prev => prev.filter(a => a.id !== actionId));
  };

  const filteredActions = actions.filter(a => activeFilter === 'All' || a.type === activeFilter);

  return (
    <div className="h-full flex flex-col pt-6 relative">
      
      {/* Locked Header & Filters */}
      <section className="shrink-0 z-20 pb-4">
        <h1 className="text-4xl font-serif italic text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
          Actions
        </h1>
        
        {/* Horizontally scrollable pill filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-5 py-2 rounded-full text-[13px] font-bold tracking-wide whitespace-nowrap transition-all shadow-sm border \${
                activeFilter === filter 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* Snap Scrolling 'Doomscroll' Feed */}
      <section className="flex-1 overflow-y-auto snap-y snap-mandatory pb-32 scrollbar-hide -mx-6 px-6">
        {filteredActions.length === 0 ? (
          <div className="h-[70vh] flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
             <p className="font-semibold text-lg">Nothing needs you right now.</p>
             <p className="text-sm opacity-70">You're all caught up.</p>
          </div>
        ) : (
          filteredActions.map((action, index) => (
            <div key={action.id} className="snap-start snap-always w-full h-[75vh] flex flex-col justify-center pb-10">
              <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 flex flex-col h-full max-h-[600px] border border-slate-200/50 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                
                {/* Meta Tag */}
                <div className="mb-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[11px] font-black uppercase tracking-widest border border-indigo-100">
                    {action.type}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3 leading-tight">{action.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-4">{action.explanation}</p>
                  
                  {action.context && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 mb-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{action.context}</p>
                    </div>
                  )}

                  {action.attachment && (
                    <div className="flex items-center gap-4 bg-white/60 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl p-4 mb-6 cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors group">
                      <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl shadow-sm group-hover:bg-blue-100 dark:group-hover:bg-blue-500/20 transition-colors">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-[15px] font-semibold text-slate-900 dark:text-white truncate">{action.attachment}</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Tap to view</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Massive Thumb-friendly Actions pinned to bottom of card */}
                <div className="flex flex-col gap-3 pt-6 shrink-0 border-t border-slate-100 dark:border-slate-800">
                  {action.options.map((opt, i) => (
                    <button 
                      key={opt} 
                      onClick={() => handleActionClick(action.id, opt)}
                      className={`w-full text-left px-6 py-4 rounded-3xl border shadow-sm text-[16px] font-bold transition-all active:scale-[0.98] \${
                        i === 0 
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 hover:bg-slate-800 dark:hover:bg-white' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </section>

    </div>
  );
}
