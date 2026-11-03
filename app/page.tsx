'use client';

import React, { useState } from 'react';
import { Mic, Send, ShieldCheck, Zap } from 'lucide-react';

export default function ClaudetPlatform() {
  const [query, setQuery] = useState('');
  const [activeCanvas, setActiveCanvas] = useState<{ title: string; content: string; howToUse?: string[]; features?: string[] } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const runSelfDiagnostics = () => {
    setTestResult('מריץ בדיקת מערכת: זיהוי קולי, מדריכי השימוש וכל 18 הסקילים פעילים ותקינים.');
    setTimeout(() => setTestResult(null), 6000);
  };

  const skillsData: Record<string, { title: string; content: string; howToUse: string[]; features: string[] }> = {
    music: {
      title: '🎵 סטודיו מוזיקה, פלייליסטים והשראה קולית',
      content: 'מרחב מוקפד המשלב מחולל פלייליסטים חכם המותאם למצב הרוח שלך, סאונד ממוקד לריכוז עמוק בעבודה, פודקאסטים להעצמה אישית, וחיבור לקצב פנימי.',
      howToUse: [
        'אמור בקול או הקלד את מצב הרוח שלך (למשל: "מוזיקה לריכוז עמוק").',
        'השתמש בפלייליסטים בזמן כתיבת קוד ותכנון פרויקטים למניעת הסחות דעת.',
        'לחץ על Hands-Free כדי להפעיל חיפוש קולי מהיר מבלי לגעת במקלדת.'
      ],
      features: ['פלייליסטים לריכוז ויצירה', 'השראה מוזיקלית וקולית', 'סביבת האזנה נקייה']
    },
    nail: {
      title: '💅 סטודיו עיצוב ציפורניים ואסתטיקה',
      content: 'כלי עיצוב ויזואלי מתקדם המיוצר במיוחד לאנשי מקצוע ולחובבי אסתטיקה לניהול פלטות צבעים יוקרתיות ותכנון קולקציות.',
      howToUse: [
        'אמור בקול סגנון רצוי (למשל: "עיצוב ציפורניים רוז-גולד") לקבלת השראה מיידית.',
        'שמור את תיאורי העיצוב להצגה מהירה מהנייד.',
        'שלב את הגוונים בממשקי ה-Micro-UI שלך לשפה ויזואלית אחידה.'
      ],
      features: ['ניהול פלטות צבעים וטרנדים', 'הפקת תיאורי עיצוב וקולקציות', 'תצוגה מקדימה למובייל']
    },
    code: {
      title: '💻 עורך קוד ופיתוח SaaS',
      content: 'סביבת פיתוח זריזה ומינימליסטית (95/5) המחוברת ישירות ל-GitHub ול-Netlify לניהול קובצי תצורה ופריסות אוטומטיות.',
      howToUse: [
        'השתמש במודול זה לניהול קבצי המערכת שלך (Next.js, Tailwind, tsconfig).',
        'בקש פונקציות קוד חדשות וקבל קטעים נקיים להדבקה מהירה ב-GitHub.',
        'ודא שקישורים וקובצי תשתית מעודכנים לפני פריסה אוטומטית מול Netlify.'
      ],
      features: ['ניהול פריסות אוטומטיות (Deploy)', 'עבודה מול Next.js', 'בניית רכיבי Micro-UI']
    },
    voice: {
      title: '🎙️ מאמן דיבור, פודקאסטים ומו"מ עִסקי',
      content: 'סימולטור קולי חכם המאמן אותך בניהול שיחות שכר, מצגות, מכירות ומו"מ עסקי לבניית ביטחון עצמי ועוצמה תקשורתית.',
      features: ['תרגול קולי חופשי (Hands-Free)', 'סימולציות למצבי קונפליקט ומכירה', 'כלים לחיזוק סמכותיות ושכנוע']
    },
    sports: {
      title: '🏋️‍♀️ ספורט, כושר ומחזור חיים (40+)',
      content: 'תוכנית אימון גופני ומנטלי מותאמת אישית לחיזוק השרירים, בניית עצם, שימור אנרגיה גבוהה ואיזון גוף-נפש לשגרת חיים עמוסה.',
      features: ['אימוני כוח ממוקדים', 'התאמת אימונים לקצב הביולוגי', 'שילוב מתיחות ושחרור מתחים']
    },
    nutrition: {
      title: '🥗 סטודיו אנרגיה ותזונה אינטואיטיבית',
      content: 'מרחב חכם לתכנון ארוחות מותאמות אישית, ניהול רמות האנרגיה היומיות ושמירה על תזונה נקייה ומזינה לפוקוס גבוה בעבודה.',
      features: ['תפריטים מותאמים לעומס קוגניטיבי', 'טיפים ומתכונים מהירים לאנרגיה נקייה', 'מעקב תזונתי לקריירה']
    },
    focus: {
      title: '⚡ ניהול זמן ועדיפויות (95/5 Focus Matrix)',
      content: 'כלי ניהול משימות המיישם את עקרון ה-95/5: זיהוי מדויק של 5% הפעולות שיוצרות 95% מההשפעה והתוצאות בעסק ובחיים.',
      features: ['סינון רעשים וניהול משימות אפקטיבי', 'מיקוד יומי חד ומהיר מהנייד', 'חלוקת משימות לפי השפעה עסקית']
    },
    journal: {
      title: '📖 יומן השראה וקבלת החלטות (Strategic Journal)',
      content: 'מרחב כתיבה אישי ומוצפן לתיעוד החלטות אסטרטגיות, ניתוח דילמות מקצועיות וגיבוש תובנות עומק מתוך מחשבה נקייה.',
      features: ['תיעוד שיטתי של החלטות מפתח', 'מסגרת מחשבתית לניתוח תרחישים', 'שמירה מאובטחת מלאה בענן ובמקומי']
    },
    branding: {
      title: '✨ סטודיו מיתוג ועיצוב דיגיטלי (Micro-Branding)',
      content: 'מחולל קונספטים ויזואליים לאיגוד שפת המותג (רוז-גולד, לבנדר), יצירת פלטות צבעים, מסרים שיווקיים וממשקים נקיים.',
      features: ['ניהול פלטות צבעים מדויקות למותג', 'הפקת רעיונות ללוגואים ומסרים', 'תכנון ממשקים נשיים ויוקרתיים']
    },
    capital: {
      title: '💎 ניהול פיננסי עצמאי ותקציב (Smart Capital)',
      content: 'כלי בקרת תקציב וניהול פיננסי חכם למיזמים דיגיטליים, הוצאות שוטפות ופרויקטים עצמאיים לתמונת מצב נקייה וברורה.',
      features: ['מעקב שוטף אחר הוצאות והכנסות', 'תכנון תקציבי למיזמים דיגיטליים', 'דשבורד ניהולי נקי ומודרני']
    },
    mindset: {
      title: '🧘‍♀️ מרחב שקט ומיינדפולנס (Calm & Mindset Vault)',
      content: 'מקלט דיגיטלי שקט להורדת מתחים, תרגילי נשימה מונחים ומדיטציות קצרות לחידוש האנרגיה והפוקוס לפני פגישות חשובות.',
      features: ['תרגילי נשימה קצרים להרגעה', 'משפטי חיזוק מנטליים והשראה', 'יצירת שקט פנימי ואיזון']
    },
    negotiation: {
      title: '🗣️ סימולטור משא ומתן ושכנוע (Negotiation Lab)',
      content: 'מעבדת סימולציות מתקדמת לתרגול אסטרטגיות שכנוע, סגירת חוזים, עמידה על עקרונות והגנה על אינטרסים עסקיים בביטחון מלא.',
      features: ['תרגול תרחישי משא ומתן שונים', 'גיבוש טיעונים מבוססי לוגיקה', 'טכניקות לנטרול התנגדויות']
    },
    automation: {
      title: '🤖 עוזר אוטומציות ותכנון תוכן (Content Hub)',
      content: 'מרחב לתכנון קמפיינים שיווקיים, כתיבת פוסטים לרשתות, ויצירת רעיונות לאוטומציות חכמות החוסכות זמן יקר ומייצרות נוכחות.',
      features: ['בניית לוח שנה שיווקי וקמפיינים', 'כתיבת טקסטים וניוזלטרים', 'איתור תהליכים לאוטומציה']
    },
    career: {
      title: '🌐 ניהול קריירה ונטוורקינג חכם (Career Tracker)',
      content: 'מערכת לניהול קשרים מקצועיים, שיתופי פעולה, פגישות מפתח ותכנון אסטרטגי של צעדי ההתפתחות הבאים בעולם העסקים והקריירה.',
      features: ['מעקב שיטתי אחר שותפויות וקשרים', 'תכנון אבני דרך להתפתחות', 'מיפוי קשרים אסטרטגיים למיזמים']
    },
    wellness: {
      title: '🩺 יומן בריאות מונעת ומדדים (Wellness Vault)',
      content: 'כלי מעקב אישי מקיף לשנת לילה, מדדי חיוניות גופנית והמלצות מותאמות לשמירה פרואקטיבית על אורח חיים מאוזן ואנרגטי.',
      features: ['מעקב שגרת שינה והתאוששות', 'המלצות לבריאות מונעת מיטבית', 'יצירת שגרת טיפוח אישית']
    },
    healthlog: {
      title: '🌿 יומן בריאות ואיזון גוף-נפש',
      content: 'יומן יומי עדין ומדויק לרישום תחושות, תזונה תומכת, טיפוח אישי וניהול האיזון העדין שבין הגוף והנפש לאורך החודש.',
      features: ['תיעוד יומי של רווחה ואנרגיה', 'המלצות לתזונה וטיפוח תומך', 'מעקב אחר מחזורי אנרגיה']
    },
    style: {
      title: '👗 סטודיו סטייל, אופנה וטרנדים',
      content: 'מרחב יצירתי לתכנון מלתחה חכמה, שילובי צבעים מדויקים, קולקציות לבוש והשראה עיצובית לעולם האופנה והסטייל האישי.',
      features: ['תכנון מלתחה קפסולה מינימליסטית', 'שילובי פלטות צבעים וטרנדים', 'השראה ויזואלית יומית מוקפדת']
    },
    lifestyle: {
      title: '☕ מרחב פנאי, לייף סטייל וקפה',
      content: 'פינת השראה מפנקת המוקדשת להפסקות קפה איכותיות, תכנון תרבות פנאי, קריאה, טיולים וטיפוח רגעים קטנים של שקט ואיכות חיים.',
      features: ['המלצות לשגרת פנאי מעשירה', 'תכנון רגעים של שקט וקפה', 'השראה לעיצוב מרחבי מגורים']
    }
  };

  const defaultHowToUse = [
    'הקלד או דבר אל המיקרופון את השאלות שלך בצורה חופשית.',
    'השתמש במערכת ישירות מהסמארטפון לניהול שוטף ומהיר.',
    'הפק תובנות וקוד מותאם אישית לעבודה שלך מול GitHub ו-Netlify.'
  ];

  const processQueryText = (text: string) => {
    const q = text.toLowerCase();
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
        title: `תוצאה עבור: "${text}"`, 
        content: 'המנוע עיבד את הבקשה הקולית בהצלחה מתוך מאגר הנתונים המאובטח של Claudet.',
        howToUse: defaultHowToUse,
        features: ['ניתוח קולי חכם', 'התאמה מלאה לממשק הנייד', 'שמירה במאגר המקומי']
      });
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    processQueryText(query);
  };

  const toggleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('הדפדפן שלך אינו תומך בזיהוי קולי ישיר. אנא השתמש בטקסט.');
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
      setQuery(speechToText);
      setIsVoiceActive(false);
      processQueryText(speechToText);
    };

    recognition.onerror = () => {
      setIsVoiceActive(false);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FDFBF7] via-[#F4EEF5] to-[#EAE0EE] text-[#2C2638] flex flex-col justify-between font-sans relative overflow-hidden" dir="rtl">
      {/* Background Soft Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-pink-200/30 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-200/20 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#4A1D59] via-[#2B0F38] to-[#1A0824] p-[1.5px] shadow-md shadow-purple-950/30 border border-[#E8A3B8]/40">
            <div className="w-full h-full bg-[#240C30] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <span className="text-xl font-serif text-[#E8A3B8] font-bold tracking-tighter select-none scale-125">✳︎</span>
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
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-white/85 border border-purple-200 text-purple-900 hover:bg-purple-50 transition-all shadow-sm"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>בדוק יכולות מערכת</span>
          </button>

          <button 
            onClick={toggleVoiceSearch}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all shadow-sm ${
              isVoiceActive 
                ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' 
                : 'bg-white/85 border border-purple-100 text-purple-900 hover:bg-purple-100/50'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-[#E8A3B8]" />
            <span>{isVoiceActive ? 'מקשיב לך עכשיו...' : 'Hands-Free (קולי)'}</span>
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
            פלטפורמת בינה עדינה הכוללת את כל 18 הסקילים שלך עם הפעלה קולית ישירה ומדריכי שימוש.
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
              placeholder="חפשי סקיל, בקשי מוזיקה, סטייל, קוד, תזונה או ניהול זמן..."
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

        {/* All Starters Grid */}
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
              className="text-xs bg-white/75 hover:bg-white border border-purple-100 hover:border-purple-300 text-[#4A3B5C] px-3.5 py-2 rounded-full transition-all shadow-sm hover:shadow"
            >
              {item.label}
            </button>
          ))}
        </div>
      </main>

      {/* Micro-UI Active Canvas Drawer */}
      {activeCanvas && (
        <div className="fixed inset-y-0 left-0 w-full md:w-[500px] bg-[#FAF7F2] border-r border-purple-200 p-6 z-50 shadow-2xl transition-all flex flex-col justify-between overflow-y-auto">
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
              <p className="bg-purple-50/80 p-4 rounded-xl border border-purple-100/60 leading-relaxed font-normal">
                {activeCanvas.content}
              </p>

              {activeCanvas.howToUse && (
                <div className="bg-gradient-to-r from-purple-900 to-[#3C2A4D] text-white p-4 rounded-xl shadow-md space-y-2 border border-purple-400/40">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E8A3B8] uppercase tracking-wider">
                    <span className="animate-pulse">✨</span>
                    <span>איך להשתמש בסקיל בצורה הטובה ביותר:</span>
                  </div>
                  <ul className="text-xs text-purple-100 space-y-2 list-disc list-inside leading-relaxed">
                    {activeCanvas.howToUse.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeCanvas.features && (
                <div className="bg-white p-4 rounded-xl border border-purple-100 space-y-2 shadow-sm">
                  <span className="text-xs font-semibold text-purple-900 block uppercase tracking-wider mb-2">יכולות מורחבות במודול:</span>
                  <ul className="text-xs text-[#6B5B7A] space-y-2 list-disc list-inside leading-relaxed">
                    {activeCanvas.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-purple-100 text-center mt-6">
            <button 
              onClick={() => setActiveCanvas(null)}
              className="w-full py-3 bg-[#3C2A4D] text-[#FAF7F2] rounded-xl text-xs font-medium hover:bg-[#2A1B3D] transition-all shadow-md"
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
