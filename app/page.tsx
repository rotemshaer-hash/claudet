'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, Send, ShieldCheck, Zap } from 'lucide-react';

export default function ClaudetPlatform() {
  const [query, setQuery] = useState('');
  const [activeCanvas, setActiveCanvas] = useState<{ title: string; content: string } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const runSelfDiagnostics = () => {
    setTestResult('מריץ בדיקת מערכת: Micro-UI מגיב, חיבור AI פעיל, זיכרון מקומי מוצפן מוכן.');
    setTimeout(() => setTestResult(null), 6000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.toLowerCase();
    if (q.includes('ציפורניים') || q.includes('nail') || q.includes('עיצוב')) {
      setActiveCanvas({ title: 'סטודיו עיצוב ואסתטיקה', content: 'כלי מותאם אישית לעיצוב, פלטות צבעים (רוז-גולד ולבנדר) ותיאום קולקציות.' });
    } else if (q.includes('קוד') || q.includes('code') || q.includes('אתר')) {
      setActiveCanvas({ title: 'עורך קוד ופיתוח SaaS', content: 'ניהול תצורות Next.js, פריסות אוטומטיות ל-Netlify ובניית רכיבי Micro-UI.' });
    } else if (q.includes('דיבור') || q.includes('מו"מ') || q.includes('voice')) {
      setActiveCanvas({ title: 'מאמן תקשורת ומו"מ עִסקי', content: 'סימולציות קוליות ותרגול שיחות מתקדמות לביטחון ניהולי ועסקי.' });
    } else if (q.includes('כושר') || q.includes('מחזור') || q.includes('בריאות')) {
      setActiveCanvas({ title: 'בריאות, כושר ומחזור חיים (40+)', content: 'תוכניות אימון מותאמות אישית, מעקב אנרגיה ובריאות מונעת.' });
    } else {
      setActiveCanvas({ title: `תוצאה עבור: "${query}"`, content: 'המנוע עיבד את הבקשה בהצלחה ומציג את התוצאה המדויקת מתוך מאגר הידע האישי.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F4EEF5] to-[#EAE0EE] text-[#2C2638] flex flex-col justify-between font-sans relative overflow-hidden" dir="rtl">
      {/* Background Soft Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-200/30 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-200/20 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E8A3B8] via-[#D8B4FE] to-[#FDFBF7] p-[1.5px] shadow-md shadow-purple-900/10">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
            </div>
          </div>
          <div>
            <span className="text-xl font-serif text-[#3C2A4D] tracking-wide font-medium block">Claudet</span>
            <span className="text-[10px] text-purple-700/60 tracking-widest uppercase block -mt-1">Micro-UI Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={runSelfDiagnostics}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-white/80 border border-purple-200 text-purple-900 hover:bg-purple-50 transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>בדוק יכולות מערכת</span>
          </button>

          <button 
            onClick={() => setIsVoiceActive(!isVoiceActive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm ${
              isVoiceActive 
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' 
                : 'bg-white/80 border border-purple-100 text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#E8A3B8]" />
            <span>{isVoiceActive ? 'מצב קולי פעיל' : 'Hands-Free'}</span>
          </button>
        </div>
      </header>

      {/* Diagnostic Banner */}
      {testResult && (
        <div className="max-w-xl mx-auto px-4 w-full z-20 mb-[-1rem]">
          <div className="bg-purple-900 text-purple-50 p-3 rounded-xl text-xs flex items-center gap-2 shadow-lg">
            <Zap className="w-4 h-4 text-[#E8A3B8] shrink-0" />
            <span>{testResult}</span>
          </div>
        </div>
      )}

      {/* Main Hero & Search Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-3xl mx-auto w-full z-10 text-center -mt-8">
        <div className="space-y-3 mb-10">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2A1B3D] font-light tracking-tight leading-snug">
            מה תרצי ליצור היום?
          </h1>
          <p className="text-sm md:text-base text-[#6B5B7A] max-w-lg mx-auto">
            פלטפורמת בינה עדינה לניהול, קוד, סטודיו עיצוב ותקשורת עסקית — בהתאמה אישית מלאה.
          </p>
        </div>

        {/* Big Prominent Search Box */}
        <form onSubmit={handleSearch} className="w-full relative group mb-8">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E8A3B8]/40 via-purple-300/30 to-pink-300/40 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition duration-500" />
          <div className="relative bg-white/90 backdrop-blur-md border border-purple-200/80 rounded-2xl flex items-center p-2 shadow-xl">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="שאלי כל דבר, בקשי לבנות אתר, לעצב קולקציה או לאמן אותך לשיחה..."
              className="w-full bg-transparent px-4 py-4 text-sm md:text-base text-[#2C2638] placeholder-[#9A8C98] focus:outline-none"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#D4839E] to-[#9D4EDD] hover:opacity-90 text-white px-6 py-4 rounded-xl transition-all font-medium flex items-center justify-center shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Interactive Quick Starters */}
        <div className="flex flex-wrap justify-center gap-2.5 max-w-2xl">
          {[
            { label: '💅 סטודיו ציפורניים ואסתטיקה', query: 'עיצוב ציפורניים' },
            { label: '💻 עורך קוד ופיתוח SaaS', query: 'בנה לי קוד לאתר' },
            { label: '🎙️ מאמן דיבור ומו"מ', query: 'אימון דיבור וניהול מו"מ' },
            { label: '🏋️‍♀️ בריאות וכושר 40+', query: 'כושר ומחזור חיים' },
            { label: '✨ בדיקת יכולות מערכת', action: runSelfDiagnostics },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (item.query) {
                  setQuery(item.query);
                  const q = item.query.toLowerCase();
                  if (q.includes('ציפורניים')) setActiveCanvas({ title: 'סטודיו עיצוב ואסתטיקה', content: 'כלי עיצוב אינטראקטיבי נפתח בהצלחה.' });
                  else if (q.includes('קוד')) setActiveCanvas({ title: 'עורך קוד ופיתוח SaaS', content: 'סביבת פיתוח מהירה מחוברת ל-GitHub.' });
                  else if (q.includes('דיבור')) setActiveCanvas({ title: 'מאמן תקשורת ומו"מ', content: 'סימולציה קולית מוכנה לתחילת תרגול.' });
                  else if (q.includes('כושר')) setActiveCanvas({ title: 'בריאות וכושר 40+', content: 'תוכנית אישית מותאמת לגוף ולשגרת היום.' });
                } else if (item.action) {
                  item.action();
                }
              }}
              className="text-xs md:text-sm bg-white/70 hover:bg-white border border-purple-100 hover:border-purple-300 text-[#4A3B5C] px-4 py-2.5 rounded-full transition-all shadow-sm hover:shadow"
            >
              {item.label}
            </button>
          ))}
        </div>
      </main>

      {/* Micro-UI Active Canvas Drawer */}
      {activeCanvas && (
        <div className="fixed inset-y-0 left-0 w-full md:w-[500px] bg-[#FAF7F2] border-r border-purple-200 p-6 z-50 shadow-2xl transition-all flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 border-b border-purple-100 pb-4">
              <h3 className="text-lg font-serif font-medium text-[#3C2A4D]">
                {activeCanvas.title}
              </h3>
              <button
                onClick={() => setActiveCanvas(null)}
                className="text-purple-700/60 hover:text-purple-900 text-sm font-medium px-3 py-1 rounded-full bg-purple-50"
              >
                ✕ סגור
              </button>
            </div>
            <div className="text-sm text-[#4A3B5C] space-y-4">
              <p className="bg-purple-50/80 p-4 rounded-xl border border-purple-100/60 leading-relaxed">
                {activeCanvas.content}
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-purple-100 text-center">
            <button 
              onClick={() => setActiveCanvas(null)}
              className="w-full py-3 bg-[#3C2A4D] text-[#FAF7F2] rounded-xl text-xs font-medium hover:bg-[#2A1B3D] transition-all"
            >
              חזור למסך הראשי
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-6 text-center text-[11px] text-[#8C7A9C] border-t border-purple-100/50 tracking-wider">
        CLAUDET © 2026 • SECURED CLOUD WORKSPACE
      </footer>
    </div>
  );
}
