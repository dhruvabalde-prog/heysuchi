"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '0000') { // Hardcoded for prototype
      router.push('/admin');
    } else {
      setError('Invalid cryptographic signature.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Glow effect */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-500/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
             <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
             </svg>
          </div>
          
          <div>
            <h1 className="text-2xl font-serif italic font-bold text-white tracking-tight">Admin Terminal</h1>
            <p className="text-sm text-slate-400 mt-2">Zero Knowledge Architecture.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-4">
            <div>
               <input 
                 type="password" 
                 placeholder="Enter Access PIN (0000)" 
                 className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-white tracking-widest placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                 value={pin}
                 onChange={(e) => setPin(e.target.value)}
                 autoFocus
               />
            </div>
            {error && <p className="text-red-400 text-xs font-semibold">{error}</p>}
            <button 
              type="submit"
              className="w-full bg-white text-slate-900 font-bold py-3 rounded-xl shadow-lg hover:bg-slate-200 transition-colors"
            >
               Authenticate
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
