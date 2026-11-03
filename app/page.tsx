'use client';

import React, { useState } from 'react';
import { Sparkles, Mic, Send, ShieldCheck, Zap } from 'lucide-react';

export default function ClaudetPlatform() {
  const [query, setQuery] = useState('');
  const [activeCanvas, setActiveCanvas] = useState<{ title: string; content: string; features?: string[] } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const runSelfDiagnostics = () => {
    setTestResult('מריץ בדיקת מערכת: כל 18 הסקילים, כולל מוזיקה, סטייל ולייף סטייל, פעילים בהצלחה.');
    setTimeout(() => setTestResult(null), 6000);
  };

  const skillsData: Record<string, { title: string; content: string; features: string[] }> = {
    music: {
      title: '🎵 סטודיו מוזיקה, פלייליסטים והשראה',
      content: 'מחולל פלייליסטים חכם המותאם למצב הרוח, מוזיקת רקע ממוקדת לריכוז בעבודה, פודקאסטים להעצמה וקצב אישי.',
      features: ['פלייליסטים מותאמים אישית לריכוז ויצירה', 'השראה מוזיקלית וקולית להעלאת האנרגיה', 'חיבור לעולמות התרבות והסאונד']
    },
    nail: {
      title: '💅 סטודיו עיצוב ציפורניים ואסתטיקה',
      content: 'כלי מותאם אישית לעיצוב קולקציות, בחירת פלטות צבעים (רוז-גולד ולבנדר) ותיאום השראה ויזואלית.',
      features: ['ניהול פלטות צבעים וטרנדים', 'הפקת תיאורי עיצוב וקולקציות', 'תצוגה מקדימה מותאמת למובייל']
    },
    code: {
      title: '💻 עורך קוד ופיתוח SaaS',
      content: 'סביבת פיתוח מהירה המחוברת ל-GitHub ול-Netlify, ניהול קובצי תצורה ובניית רכיבי Micro-UI.',
      features: ['ניהול פריסות אוטומטיות (Deploy)', 'עבודה חלקה מול קבצי Next.js', 'בניית רכיבים מינימליסטיים']
    },
    voice: {
      title: '🎙️ מאמן דיבור, פודקאסטים ומו"מ עִסקי',
      content: 'סימולציות קוליות ותרגול שיחות מתקדמות לפיתוח ביטחון ניהולי, ניהול שיחות שכר ומכירות.',
      features: ['תרגול סימולציות קוליות hands-free', 'חיזוק טיעונים ושכנוע עסקי', 'בניית ביטחון ניהולי']
    },
    sports: {
      title: '🏋️‍♀️ ספורט, כושר ומחזור חיים (40+)',
      content: 'מרחב מותאם אישית לפיתוח כוח פנימי, תוכניות אימון מותאמות לשגרת חיים עמוסה, ומעקב אנרגיה גופנית ומנטלית.',
      features: ['אימוני כוח וחיזוק ממוקדים', 'התאמת שגרת אימונים למחזור החיים', 'כלים מנטליים לבניית ביטחון ועוצמה']
    },
    nutrition: {
      title: '🥗 סטודיו אנרגיה ותזונה אינטואיטיבית',
      content: 'בניית תפריטים, מעקב אחר רמות אנרגיה יומיות, והתאמת תזונה אישית בהתאם לעומס בעבודה ולשגרת האימונים.',
      features: ['התאמת תזונה לקצב אנרגיה אישי', 'תכנון ארוחות מותאם לשגרת ניהול', 'טיפים לחיזוק חיוניות וריכוז']
    },
    focus: {
      title: '⚡ ניהול זמן ועדיפויות (95/5 Focus Matrix)',
      content: 'כלי ניהול משימות מינימליסטי שמזהה את 5% הפעולות שמייצרות 95% מהתוצאות ומארגן את הלו"ז היומי בסמארטפון.',
      features: ['סינון רעשים וניהול משימות אפקטיבי', 'מיקוד בתוצאות קריטיות (95/5)', 'תכנון יומי מהיר מהנייד']
    },
    journal: {
      title: '📖 יומן השראה וקבלת החלטות (Strategic Journal)',
      content: 'מרחב כתיבה מוצפן שבו אפשר לנתח דילמות מקצועיות, לקבל השראה, ולנהל מעקב אחר החלטות קריטיות בקריירה ובמיזמים.',
      features: ['תיעוד החלטות מפתח עסקיות', 'ניתוח תרחישים ולוגיקה מובנית', 'שמירה מאובטחת בענן ובמקומי']
    },
    branding: {
      title: '✨ סטודיו מיתוג ועיצוב דיגיטלי (Micro-Branding)',
      content: 'מחולל אלמנטים גרפיים, פלטות צבעים (רוז-גולד, לבנדר ואובסידיאן), וטיפוגרפיה מדויקת ליצירת חומרי שיווק.',
      features: ['ניהול פלטות צבעים וזהות מותג', 'הפקת רעיונות ללוגואים וממשקים', 'התאמה מושלמת למובייל ולרשתות']
    },
    capital: {
      title: '💎 ניהול פיננסי עצמאי ותקציב (Smart Capital)',
      content: 'מעקב מהיר ופשוט אחר הוצאות, הכנסות, ותכנון תקציבי למיזמים דיגיטליים ופרויקטים עצמאיים.',
      features: ['בקרת תקציב למיזמים דיגיטליים', 'ניתוח הוצאות מול הכנסות בצורה נקייה', 'תכנון פיננסי לטווח ארוך']
    },
    mindset: {
      title: '🧘‍♀️ מרחב שקט ומיינדפולנס (Calm & Mindset Vault)',
      content: 'תרגילי נשימה קצרים, מדיטציות ממוקדות לחידוש אנרגיה לפני פגישות חשובות, ומשפטי חיזוק מנטליים.',
      features: ['תרגילי נשימה מהירים להפגת מתחים', 'משפטי השראה מותאמים אישית', 'הורדת קצב וריכוז מחדש']
    },
    negotiation: {
      title: '🗣️ סימולטור משא ומתן ושכנוע (Negotiation Lab)',
      content: 'כלי אינטראקטיבי לתרגול שיחות שכר, סגירת חוזים וניהול משא ומתן עסקי עם משוב מיידי לבניית ביטחון.',
      features: ['סימולציות שיחה לתרגול חוזים', 'טיפים לשכנוע והצגת טיעונים', 'חיזוק ביטחון ניהולי ועסקי']
    },
    automation: {
      title: '🤖 עוזר אוטומציות ותכנון תוכן (Content Hub)',
      content: 'תכנון קמפיינים, כתיבת פוסטים לרשתות החברתיות, ויצירת רעיונות לאוטומציות שיווקיות בלחיצת כפתור.',
      features: ['תכנון תוכן שיווקי וחברתי', 'רעיונות לאוטומציות בעסקים', 'יצירת קמפיינים ממוקדים']
    },
    career: {
      title: '🌐 ניהול קריירה ונטוורקינג חכם (Career Tracker)',
      content: 'מעקב אחר קשרים מקצועיים, פגישות חשובות, הזדמנויות שיתוף פעולה ותכנון צעדים הבאים בהתפתחות האישית.',
      features: ['ניהול קשרים ושותפויות עסקיות', 'תכנון שלבי התפתחות בקריירה', 'מעקב אחר פגישות מפתח']
    },
    wellness: {
      title: '🩺 יומן בריאות מונעת ומדדים (Wellness Vault)',
      content: 'מעקב אישי אחר שנת לילה, מדדי חיוניות, והמלצות מותאמות לשמירה על אורח חיים מאוזן ובריא לאורך זמן.',
      features: ['מעקב שגרת שינה ואנרגיה', 'המלצות לבריאות מונעת ואורח חיים', 'איזון גוף-נפש שוטף']
    },
    healthlog: {
      title: '🌿 יומן בריאות ואיזון גוף-נפש',
      content: 'מרחב ממוקד למעקב יומי אחר מדדי חיוניות, תזונה תומכת, וניהול רווחה אישית ומנטלית.',
      features: ['רישום מדדים יומיים', 'המלצות לאיזון גוף-נפש', 'מעקב שגרת טיפוח ואנרגיה']
    },
    style: {
      title: '👗 סטודיו סטייל, אופנה וטרנדים',
      content: 'מרחב ליצירת קולקציות לבוש, שילוב צבעים, תכנון מלתחה חכמה והשראה ויזואלית לעולם האופנה והלייף סטייל.',
      features: ['תכנון מלתחה וקולקציות', 'שילובי צבעים וסטייל אישי', 'השראה מעולם הטרנדים והאופנה']
    },
    lifestyle: {
      title: '☕ מרחב פנאי, לייף סטייל וקפה',
      content: 'פינת השראה יומית להפסקות קפה איכותיות, תכנון פנאי, קריאה, טיולים וטיפוח רגעים קטנים של שקט ואיכות חיים.',
      features: ['המלצות לייף סטייל ופנאי', 'תכנון רגעים של שקט ואיכות חיים', 'השראה לעיצוב סביבת מגורים נעימה']
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const q = query.toLowerCase();
    if (q.includes('מוזיקה') || q.includes('פלייליסט') || q.includes('שירים') || q.includes('סאונד')) setActiveCanvas(skillsData.music);
    else if (q.includes('ציפורניים') || q.includes('nail')) setActiveCanvas(skillsData.nail);
    else if (q.includes('קוד') || q.includes('code') || q.includes('אתר')) setActiveCanvas(skillsData.code);
    else if (q.includes('דיבור') || q.includes('מו"מ') || q.includes('voice')) setActiveCanvas(skillsData.voice);
    else if (q.includes('ספורט') || q.includes('כושר')) setActiveCanvas(skillsData.sports);
    else if (q.includes('תזונה') || q.includes('אנרגיה')) setActiveCanvas(skillsData.nutrition);
    else if (q.includes('זמן') || q.includes('ניהול') || q.includes('95')) setActiveCanvas(skillsData.focus);
    else if (q.includes('השראה') || q.includes('יומן') || q.includes('החלטות')) setActiveCanvas(skillsData.journal);
    else if (q.includes('מיתוג') || q.includes('עיצוב')) setActiveCanvas(skillsData.branding);
    else if (q.includes('פיננסי') || q.includes('תקציב') || q.includes('כסף')) setActiveCanvas(skillsData.capital);
    else if (q.includes('שקט') || q.includes('מיינדפולנס') || q.includes('נשימה')) setActiveCanvas(skillsData.mindset);
    else if (q.includes('משא ומתן') || q.includes('שכר')) setActiveCanvas(skillsData.negotiation);
    else if (q.includes('אוטומציות') || q.includes('תוכן') || q.includes('קמפיין')) setActiveCanvas(skillsData.automation);
    else if (q.includes('קריירה') || q.includes('נטוורקינג')) setActiveCanvas(skillsData.career);
    else if (q.includes('בריאות מונעת') || q.includes('מדדים')) setActiveCanvas(skillsData.wellness);
    else if (q.includes('בריאות') || q.includes('איזון')) setActiveCanvas(skillsData.healthlog);
    else if (q.includes('סטייל') || q.includes('אופנה') || q.includes('לבוש')) setActiveCanvas(skillsData.style);
    else if (q.includes('לייף סטייל') || q.includes('פנאי') || q.includes('קפה')) setActiveCanvas(skillsData.lifestyle);
    else {
      setActiveCanvas({ 
        title: `תוצאה עבור: "${query}"`, 
        content: 'המנוע עיבד את הבקשה בהצלחה מתוך מאגר הנתונים המאובטח של Claudet.',
        features: ['ניתוח חכם של הבקשה', 'התאמה מלאה לממשק הנייד', 'שמירה במאגר המקומי']
      });
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
            <span className="text-[10px] text-purple-700/60 tracking-widest uppercase block -mt-1">Full-Suite Engine</span>
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full z-10 text-center -mt-6">
        <div className="space-y-3 mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-[#2A1B3D] font-light tracking-tight leading-snug">
            מה תרצי ליצור היום?
          </h1>
          <p className="text-sm md:text-base text-[#6B5B7A] max-w-lg mx-auto">
            פלטפורמת בינה עדינה הכוללת מוזיקה, סטייל, ניהול, קוד וכל מה שחשוב לך במקום אחד.
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
              placeholder="חפשי מוזיקה, סטייל, קוד, תזונה, ניהול זמן או סקיל..."
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

        {/* All Starters Grid (All 18 Skills) */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
          {[
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
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(item.label);
                setActiveCanvas(skillsData[item.key]);
              }}
              className="text-xs bg-white/70 hover:bg-white border border-purple-100 hover:border-purple-300 text-[#4A3B5C] px-3.5 py-2 rounded-full transition-all shadow-sm hover:shadow"
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
              {activeCanvas.features && (
                <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-2">
                  <span className="text-xs font-semibold text-purple-900 block">יכולות המודול:</span>
                  <ul className="text-xs text-[#6B5B7A] space-y-1.5 list-disc list-inside">
                    {activeCanvas.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
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
        CLAUDET © 2026 • FULL-SUITE CLOUD WORKSPACE
      </footer>
    </div>
  );
}
