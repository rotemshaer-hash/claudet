'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, Send, Code2, Heart, Dumbbell, Calendar, Users, Activity } from 'lucide-react';

export default function ClaudetSearchEngine() {
  const [query, setQuery] = useState('');
  const [activeCanvas, setActiveCanvas] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.toLowerCase();
    if (q.includes('ציפורניים') || q.includes('nail')) setActiveCanvas('nail');
    else if (q.includes('קוד') || q.includes('code') || q.includes('אתר')) setActiveCanvas('code');
    else if (q.includes('דיבור') || q.includes('שכר') || q.includes('voice')) setActiveCanvas('voice');
    else if (q.includes('כושר') || q.includes('אימון')) setActiveCanvas('fitness');
    else if (q.includes('אינסטגרם') || q.includes('insta')) setActiveCanvas('insta');
  };

  return (
    <div className="min-h-screen bg-[#070611] text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden" dir="rtl">
      {/* Background Micro-Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-pink-900/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E8A3B8] via-[#9D4EDD] to-[#070611] p-[1px] shadow-lg shadow-purple-950/50">
            <div className="w-full h-full bg-[#070611] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#E8A3B8]" />
            </div>
          </div>
          <span className="text-xl font-serif text-[#E8A3B8] tracking-wide font-medium">Claudet</span>
        </div>

        <button 
          onClick={() => setIsVoiceActive(!isVoiceActive)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${
            isVoiceActive 
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse' 
              : 'bg-white/5 border border-white/10 text-slate-300 hover:border-[#E8A3B8]/40'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-[#E8A3B8]" />
          <span>{isVoiceActive ? 'מצב קולי פעיל' : 'Hands-Free Studio'}</span>
        </button>
      </header>

      {/* Main Search Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full z-10 -mt-12 text-center">
        <div className="space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-slate-100 font-light tracking-tight">
            מה תרצי ליצור היום?
          </h1>
          <p className="text-sm text-slate-400">
            קוד, אוטומציות, סטודיו עיצוב, ותקשורת ניהולית — מונגשים עבורך.
          </p>
        </div>

        {/* Prompt Input Box */}
        <form onSubmit={handleSearch} className="w-full relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#E8A3B8]/30 via-purple-600/20 to-pink-600/30 rounded-2xl blur opacity-40 group-hover:opacity-75 transition duration-500" />
          <div className="relative bg-[#0D0B1A] border border-white/10 rounded-2xl flex items-center p-2 shadow-2xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="שאלי כל דבר, בקשי לבנות אתר, לעצב ציפורניים או לאמן אותך לשיחה..."
              className="w-full bg-transparent px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#E8A3B8] hover:bg-[#f4c2c2] text-[#070611] p-3 rounded-xl transition-all font-medium flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Quick Starters */}
        <div className="flex flex-wrap justify-center gap-2 mt-6">
          {[
            { label: '💅 סטודיו ציפורניים', canvas: 'nail' },
            { label: '💻 עורך קוד ו-SaaS', canvas: 'code' },
            { label: '🎙️ מאמן דיבור ומו"מ', canvas: 'voice' },
            { label: '🏋️‍♀️ כושר ומחזור', canvas: 'fitness' },
            { label: '🩺 בריאות 40+', canvas: 'health' },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveCanvas(item.canvas)}
              className="text-xs bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#E8A3B8]/30 text-slate-300 px-3.5 py-2 rounded-full transition-all"
            >
              {item.label}
            </button>
          ))}
        </div>
      </main>

      {/* Micro-UI Drawer */}
      {activeCanvas && (
        <div className="fixed inset-y-0 left-0 w-full md:w-[500px] bg-[#0A0818] border-r border-white/10 p-6 z-50 shadow-2xl transition-all animate-in slide-in-from-left duration-300">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h3 className="text-lg font-medium text-[#E8A3B8]">
              Claudet Micro-Canvas: {activeCanvas}
            </h3>
            <button
              onClick={() => setActiveCanvas(null)}
              className="text-slate-400 hover:text-white text-sm"
            >
              ✕ סגור
            </button>
          </div>
          <div className="text-sm text-slate-300 space-y-4">
            <p className="bg-purple-950/30 p-3 rounded-lg border border-purple-800/20">
              ⚡ כלי אינטראקטיבי מוכן לעבודה: {activeCanvas}
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-600 border-t border-white/5">
        Claudet © 2026 • Encrypted Local Vault Active
      </footer>
    </div>
  );
}
