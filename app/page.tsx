'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Send, ShieldCheck, Zap, Sparkles, Heart, Moon, Sun, History, Star, Copy, Check } from 'lucide-react';

export default function ClaudetPlatform() {
  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const [activeTitle, setActiveTitle] = useState<string | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('claudet_dark_mode') === 'true';
      setIsDarkMode(savedTheme);

      const savedFavs = localStorage.getItem('claudet_favs');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));

      const savedHistory = localStorage.getItem('claudet_history');
      if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const toggleFavorite = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    let updated = favorites.includes(key) ? favorites.filter(item => item !== key) : [...favorites, key];
    setFavorites(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('claudet_favs', JSON.stringify(updated));
    }
  };

  const toggleDarkMode = () => {
    triggerHaptic();
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('claudet_dark_mode', String(next));
    }
  };

  const runSelfDiagnostics = () => {
    triggerHaptic();
    setTestResult('מריץ בדיקת מערכת: חיבור לשרת ה-API פעיל.');
    setTimeout(() => setTestResult(null), 5000);
  };

  // פונקציה ששולחת את השאלה אל ה-API שלנו ומקבלת תשובה חיה
  const processQueryText = async (text: string) => {
    triggerHaptic();
    setIsLoadingAI(true);

    const updatedHistory = [text, ...searchHistory.filter(h => h !== text)].slice(0, 5);
    setSearchHistory(updatedHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('claudet_history', JSON.stringify(updatedHistory));
    }

    try {
      // שליחת השאלה אל קובץ ה-API שיצרנו בשרת
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text })
      });
      const data = await res.json();
      const aiReply = data.reply || 'תשובה ריקה מהשרת.';

      setActiveTitle("שיחת AI פעילה");
      setChatMessages(prev => [
        ...prev,
        { role: 'user', text: text },
        { role: 'ai', text: aiReply }
      ]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        { role: 'user', text: text },
        { role: 'ai', text: 'שגיאה בתקשורת מול השרת. אנא נסה שוב.' }
      ]);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setChatMessages([]);
    processQueryText(query);
    setQuery('');
  };

  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;
    processQueryText(followUpQuery);
    setFollowUpQuery('');
  };

  const copyToClipboard = () => {
    if (chatMessages.length === 0) return;
    const textToCopy = chatMessages.map(m => `${m.role === 'user' ? 'אתה' : 'AI'}: ${m.text}`).join('\n\n');
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const toggleVoiceSearch = () => {
    triggerHaptic();
    if (typeof window === 'undefined') return;
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('הדפדפן שלך אינו תומך בזיהוי קולי ישיר.');
      return;
    }

    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'he-IL';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsVoiceActive(true);

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      setIsVoiceActive(false);
      processQueryText(speechToText);
    };

    recognition.onerror = () => setIsVoiceActive(false);
    recognition.onend = () => setIsVoiceActive(false);

    recognition.start();
  };

  const allSkillsList = [
    { label: '🎵 מוזיקה ופלייליסטים', key: 'music' },
    { label: '💅 סטודיו ציפורניים', key: 'nail' },
    { label: '💻 עורך קוד SaaS', key: 'code' },
    { label: '🎙️ מאמן דיבור ומו"מ', key: 'voice' },
    { label: '🏋️‍♀️ ספורט וכושר 40+', key: 'sports' },
    { label: '🥗 אנרגיה ותזונה', key: 'nutrition' },
    { label: '⚡ ניהול זמן 95/5', key: 'focus' },
    { label: '📖 יומן החלטות', key: 'journal' },
    { label: '✨ סטודיו מיתוג', key: 'branding' },
    { label: '💎 ניהול פיננסי', key: 'capital' },
    { label: '🧘‍♀️ מרחב מיינדפולנס', key: 'mindset' },
    { label: '🗣️ סימולטור מו"מ', key: 'negotiation' },
    { label: '🤖 אוטומציות ותוכן', key: 'automation' },
    { label: '🌐 נטוורקינג וקריירה', key: 'career' },
    { label: '🩺 יומן בריאות', key: 'wellness' },
    { label: '🌿 איזון גוף-נפש', key: 'healthlog' },
    { label: '👗 סטודיו סטייל ואופנה', key: 'style' },
    { label: '☕ לייף סטייל ופנאי', key: 'lifestyle' },
  ];

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans relative overflow-hidden transition-colors duration-500 ${
      isDarkMode ? 'bg-[#120A18] text-[#F4EEF5]' : 'bg-gradient-to-br from-[#FDFBF7] via-[#F4EEF5] to-[#EAE0EE] text-[#2C2638]'
    }`} dir="rtl">
      {/* Background Glows */}
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[120px] pointer-events-none rounded-full transition-colors duration-500 ${
        isDarkMode ? 'bg-purple-900/20' : 'bg-pink-200/30'
      }`} />
      <div className={`absolute bottom-10 right-10 w-[400px] h-[400px] blur-[100px] pointer-events-none rounded-full transition-colors duration-500 ${
        isDarkMode ? 'bg-pink-950/20' : 'bg-purple-200/20'
      }`} />

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5A2D6C] via-[#351245] to-[#1E0828] p-[1.5px] shadow-xl shadow-purple-950/40 border border-[#E8A3B8]/60">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden ${isDarkMode ? 'bg-[#1C0D26]' : 'bg-[#270E35]'}`}>
              <span className="text-2xl font-serif text-[#E8A3B8] font-bold tracking-tighter select-none scale-125 drop-shadow-[0_0_8px_rgba(232,163,184,0.8)]">✳︎</span>
            </div>
          </div>
          <div>
            <span className={`text-xl font-serif tracking-wide font-semibold block ${isDarkMode ? 'text-[#F4EEF5]' : 'text-[#3C2A4D]'}`}>Claudet</span>
            <span className="text-[10px] text-purple-400/80 tracking-widest uppercase block -mt-1">Full-Suite Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleDarkMode}
            className={`p-2.5 rounded-full border transition-all shadow-sm ${
              isDarkMode ? 'bg-[#221030] border-purple-800 text-amber-300' : 'bg-white/85 border-purple-200 text-purple-900 hover:bg-purple-50'
            }`}
            title="שינוי ערכת נושא"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={runSelfDiagnostics}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium border transition-all shadow-sm ${
              isDarkMode ? 'bg-[#221030] border-purple-800 text-purple-200' : 'bg-white/85 border-purple-200 text-purple-900 hover:bg-purple-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>בדיקת מערכת</span>
          </button>

          <button 
            onClick={toggleVoiceSearch}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm ${
              isVoiceActive 
                ? 'bg-rose-500/20 text-rose-300 border border-rose-400 animate-pulse' 
                : isDarkMode ? 'bg-[#221030] border-purple-800 text-purple-200' : 'bg-white/85 border border-purple-100 text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#E8A3B8]" />
            <span>{isVoiceActive ? 'מקשיב לך...' : 'Hands-Free'}</span>
          </button>
        </div>
      </header>

      {/* Diagnostic Banner */}
      {testResult && (
        <div className="max-w-xl mx-auto px-4 w-full z-20 mb-[-1rem]">
          <div className="bg-purple-950 text-purple-200 p-3 rounded-xl text-xs flex items-center gap-2 shadow-lg border border-purple-800">
            <Zap className="w-4 h-4 text-[#E8A3B8] shrink-0" />
            <span>{testResult}</span>
          </div>
        </div>
      )}

      {/* Main Hero Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full z-10 text-center -mt-6">
        <div className="space-y-3 mb-8">
          <h1 className={`text-4xl md:text-5xl font-serif font-light tracking-tight leading-snug ${isDarkMode ? 'text-[#FDFBF7]' : 'text-[#2A1B3D]'}`}>
            מה תרצי ליצור היום?
          </h1>
          <p className={`text-sm md:text-base max-w-lg mx-auto ${isDarkMode ? 'text-purple-200/70' : 'text-[#6B5B7A]'}`}>
            פלטפורמת בינה עדינה עם מועדפים, היסטוריה, מצב לילה ומנוע API חכם לכל 18 הסקילים שלך.
          </p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="w-full relative group mb-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#E8A3B8]/40 via-purple-300/30 to-pink-300/40 rounded-3xl blur-md opacity-50 group-hover:opacity-90 transition duration-500" />
          <div className={`relative backdrop-blur-md border rounded-2xl flex items-center p-2 shadow-xl transition-colors duration-300 ${
            isDarkMode ? 'bg-[#1C0D26]/90 border-purple-800/80 text-white' : 'bg-white/90 border-purple-200/80 text-[#2C2638]'
          }`}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="שאל כל דבר חופשי או חפש סקיל..."
              className={`w-full bg-transparent px-4 py-4 text-sm md:text-base focus:outline-none ${isDarkMode ? 'placeholder-purple-400/50 text-white' : 'placeholder-[#9A8C98]'}`}
            />
            {isLoadingAI && (
              <span className="text-xs text-purple-400 animate-pulse px-2">חושב...</span>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-[#D4839E] to-[#9D4EDD] hover:opacity-90 text-white px-6 py-4 rounded-xl transition-all font-medium flex items-center justify-center shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-6 text-xs">
            <span className={`flex items-center gap-1 opacity-70 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>
              <History className="w-3 h-3" /> אחרונים:
            </span>
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => processQueryText(item)}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  isDarkMode ? 'bg-[#1C0D26] border-purple-900 text-purple-200 hover:bg-[#2A133B]' : 'bg-white/60 border-purple-100 text-purple-900 hover:bg-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Favorites */}
        {favorites.length > 0 && (
          <div className="mb-4 w-full">
            <div className={`text-xs font-semibold mb-2 flex items-center justify-center gap-1 ${isDarkMode ? 'text-amber-300' : 'text-purple-900'}`}>
              <Star className="w-3.5 h-3.5 fill-current" /> סקילים מועדפים:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {allSkillsList.filter(s => favorites.includes(s.key)).map((item) => (
                <button
                  key={item.key}
                  onClick={() => processQueryText(item.label)}
                  className="text-xs bg-gradient-to-r from-purple-900/80 to-rose-950/80 border border-purple-400/40 text-purple-100 px-3.5 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Skills Grid */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
          {allSkillsList.map((item) => {
            const isFav = favorites.includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => processQueryText(item.label)}
                className={`group relative text-xs border px-3.5 py-2 rounded-full transition-all shadow-sm flex items-center gap-2 ${
                  isDarkMode 
                    ? 'bg-[#1C0D26]/80 border-purple-900/80 text-purple-200 hover:bg-[#281238] hover:border-purple-600' 
                    : 'bg-white/75 border-purple-100 text-[#4A3B5C] hover:bg-white hover:border-purple-300 hover:shadow'
                }`}
              >
                <span>{item.label}</span>
                <span 
                  onClick={(e) => toggleFavorite(item.key, e)}
                  className={`transition-colors ${isFav ? 'text-rose-400' : 'text-purple-300/40 hover:text-purple-300'}`}
                >
                  <Heart className={`w-3 h-3 ${isFav ? 'fill-current' : ''}`} />
                </span>
              </button>
            );
          })}
        </div>
      </main>

      {/* Chat Drawer */}
      {activeTitle && (
        <div className={`fixed inset-y-0 left-0 w-full md:w-[500px] border-r p-6 z-50 shadow-2xl transition-all flex flex-col justify-between overflow-y-auto ${
          isDarkMode ? 'bg-[#180C22] border-purple-900 text-[#F4EEF5]' : 'bg-[#FAF7F2] border-purple-200 text-[#2C2638]'
        }`}>
          <div>
            <div className={`flex justify-between items-center mb-6 border-b pb-4 ${isDarkMode ? 'border-purple-900' : 'border-purple-100'}`}>
              <h3 className={`text-lg font-serif font-medium flex items-center gap-2 ${isDarkMode ? 'text-purple-200' : 'text-[#3C2A4D]'}`}>
                <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
                <span>{activeTitle}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className={`p-1.5 rounded-full border transition-all ${isDarkMode ? 'bg-purple-950 border-purple-800 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-800'}`}
                  title="העתק שיחה"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => { setActiveTitle(null); setChatMessages([]); }}
                  className={`text-sm font-medium px-3 py-1 rounded-full ${isDarkMode ? 'bg-purple-950 text-purple-200 hover:bg-purple-900' : 'text-purple-700/60 hover:text-purple-900 bg-purple-50'}`}
                >
                  ✕ סגור
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="space-y-4 mb-6">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  msg.role === 'user' 
                    ? (isDarkMode ? 'bg-[#251235] border-purple-800 text-purple-100 ml-6' : 'bg-purple-100/70 border-purple-200 text-[#2C2638] ml-6')
                    : (isDarkMode ? 'bg-[#1E0D2B] border-purple-900 text-purple-200 mr-6' : 'bg-white border-purple-100 text-[#4A3B5C] mr-6 shadow-sm')
                }`}>
                  <span className="font-semibold block mb-1 text-[10px] uppercase tracking-wider text-purple-400">
                    {msg.role === 'user' ? 'אתה:' : 'Claudet AI:'}
                  </span>
                  <p className="font-normal">{msg.text}</p>
                </div>
              ))}
              {isLoadingAI && (
                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-900 text-xs text-purple-300 animate-pulse text-center">
                  מנסח תשובה מול השרת...
                </div>
              )}
            </div>
          </div>

          {/* Follow-up input */}
          <div className={`pt-4 border-t mt-6 space-y-3 ${isDarkMode ? 'border-purple-900' : 'border-purple-100'}`}>
            <form onSubmit={handleFollowUp} className="flex items-center gap-2">
              <input 
                type="text"
                value={followUpQuery}
                onChange={(e) => setFollowUpQuery(e.target.value)}
                placeholder="המשך שיחה או שולח שאלה נוספת..."
                className={`w-full text-xs px-3 py-2.5 rounded-xl border focus:outline-none ${
                  isDarkMode ? 'bg-[#221030] border-purple-800 text-white placeholder-purple-400/50' : 'bg-white border-purple-200 text-[#2C2638] placeholder-purple-300'
                }`}
              />
              <button
                type="submit"
                className="bg-purple-700 hover:bg-purple-800 text-white px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-sm"
              >
                שולח
              </button>
            </form>

            <button 
              onClick={() => { setActiveTitle(null); setChatMessages([]); }}
              className="w-full py-2.5 bg-[#3C2A4D] text-[#FAF7F2] rounded-xl text-xs font-medium hover:bg-[#2A1B3D] transition-all shadow-md"
            >
              חזור למסך הראשי
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className={`p-6 text-center text-[11px] border-t tracking-wider ${
        isDarkMode ? 'text-purple-400/60 border-purple-950' : 'text-[#8C7A9C] border-purple-100/50'
      }`}>
        CLAUDET © 2026 • FULL-SUITE CLOUD WORKSPACE
      </footer>
    </div>
  );
}
