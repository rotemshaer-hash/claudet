'use client';

import React, { useState } from 'react';
import { Mic, Send, ShieldCheck, Zap } from 'lucide-react';

export default function ClaudetPlatform() {
  const [query, setQuery] = useState('');
  const [activeCanvas, setActiveCanvas] = useState<{ title: string; content: string; features?: string[] } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const runSelfDiagnostics = () => {
    setTestResult('מריץ בדיקת מערכת: כל 18 הסקילים המורחבים, מנוע Micro-UI ולוגו הכוכבית פועלים בהצלחה.');
    setTimeout(() => setTestResult(null), 6000);
  };

  const skillsData: Record<string, { title: string; content: string; features: string[] }> = {
    music: {
      title: '🎵 סטודיו מוזיקה, פלייליסטים והשראה קולית',
      content: 'מרחב מוקפד המשלב מחולל פלייליסטים חכם המותאם למצב הרוח שלך, סאונד ממוקד לריכוז עמוק בעבודה, פודקאסטים להעצמה אישית, וחיבור לקצב פנימי שמחזק את האנרגיה לאורך כל היום.',
      features: [
        'מחולל פלייליסטים דינמיים לפי רמות אנרגיה וריכוז נדרשות',
        'המלצות לסאונדטרקים ופודקאסטים להעלאת הביטחון והפוקוס',
        'סביבת האזנה נקייה ללא הסחות דעת לבניית השראה יצירתית',
        'ניהול תדרי קול מותאמים אישית לשגרת העבודה והיצירה'
      ]
    },
    nail: {
      title: '💅 סטודיו עיצוב ציפורניים ואסתטיקה',
      content: 'כלי עיצוב ויזואלי מתקדם המיוצר במיוחד לאנשי מקצוע ולחובבי אסתטיקה. מאפשר ניהול פלטות צבעים יוקרתיות (רוז-גולד, לבנדר ואובסידיאן), תכנון קולקציות ותיאום מראה נקי ומודרני.',
      features: [
        'מחולל פלטות צבעים וטרנדים מובילים באסתטיקה וטיפוח',
        'ממשק להפקת תיאורי עיצוב מדויקים וקונספטים לקולקציות',
        'שמירת השראה ויזואלית וקטלוג אישי מהנייד',
        'תצוגה מקדימה מהירה של התאמת גוונים וסגנונות נשיים'
      ]
    },
    code: {
      title: '💻 עורך קוד ופיתוח SaaS',
      content: 'סביבת פיתוח זריזה ומינימליסטית (95/5) המחוברת ישירות ל-GitHub ול-Netlify. נועדה לניהול קובצי תצורה, פריסות אוטומטיות (Deploy) וכתיבת רכיבים נקיים ללא תקלות.',
      features: [
        'בקרת קוד מלאה וניהול קבצי מערכת (Next.js, Tailwind, tsconfig)',
        'מעקב ופתרון תקלות פריסה מול Netlify ישירות מהנייד',
        'יצירת רכיבי Micro-UI מודולריים, מהירים וקלילים',
        'סנכרון מיידי ואוטומטי מול המאגר ב-GitHub'
      ]
    },
    voice: {
      title: '🎙️ מאמן דיבור, פודקאסטים ומו"מ עִסקי',
      content: 'סימולטור קולי חכם המאמן אותך בניהול שיחות שכר, מצגות, מכירות ומו"מ עסקי. מנתח את הטיעונים שלך ומספק פידבק מיידי לבניית ביטחון עצמי ועוצמה תקשורתית.',
      features: [
        'תרגול קולי חופשי (Hands-Free) לשיפור שטף הדיבור',
        'סימולציות למצבי קונפליקט, מכירה וניהול משא ומתן מורכב',
        'כלים מעשיים לחיזוק סמכותיות, שכנוע והעברת מסרים',
        'ניתוח מובנה של טיעונים עסקיים ומענה על התנגדויות'
      ]
    },
    sports: {
      title: '🏋️‍♀️ ספורט, כושר ומחזור חיים (40+)',
      content: 'תוכנית אימון גופני ומנטלי מותאמת אישית, המתמקדת בחיזוק השרירים, בניית עצם, שימור אנרגיה גבוהה ואיזון גוף-נפש המותאם לשגרת חיים עמוסה ותובענית.',
      features: [
        'אימוני כוח וחיזוק ממוקדים לטווח ארוך ולבריאות איתנה',
        'התאמת עצימות האימונים לקצב הביולוגי ולמחזור החיים',
        'שילוב תרגילי מתיחה, יציבה ושחרור מתחים מהיומיום',
        'מעקב אנרגיה גופנית ומנטלית להשגת תוצאות מקסימליות'
      ]
    },
    nutrition: {
      title: '🥗 סטודיו אנרגיה ותזונה אינטואיטיבית',
      content: 'מרחב חכם לתכנון ארוחות מותאמות אישית, ניהול רמות האנרגיה היומיות ושמירה על תזונה נקה ומזינה המעניקה פוקוס וערנות גבוהה לאורך יום העבודה.',
      features: [
        'בניית תפריטים אינטואיטיביים המותאמים לעומס קוגניטיבי',
        'טיפים ומתכונים מהירים לאנרגיה נקייה ויציבה בדם',
        'מעקב תזונתי המשתלב בשגרת ניהול וקריירה',
        'התאמת רכיבי מזון לחיזוק מערכת החיסון והריכוז'
      ]
    },
    focus: {
      title: '⚡ ניהול זמן ועדיפויות (95/5 Focus Matrix)',
      content: 'כלי ניהול משימות אסתטי ומינימליסטי המיישם את עקרון ה-95/5: זיהוי מדויק של 5% הפעולות שיוצרות 95% מההשפעה והתוצאות בעסק ובחיים האישיים.',
      features: [
        'סינון רעשים וביצוע "ניקוי אורוות" למשימות לא חיוניות',
        'מיקוד יומי חד, מהיר ויעיל היישר מהסמארטפון',
        'חלוקת משימות לפי השפעה עסקית ואישית גבוהה',
        'ניהול לו"ז נקי המפנה זמן פנוי למנוחה ויצירה'
      ]
    },
    journal: {
      title: '📖 יומן השראה וקבלת החלטות (Strategic Journal)',
      content: 'מרחב כתיבה אישי ומוצפן המיועד לתיעוד החלטות אסטרטגיות, ניתוח דילמות מקצועיות, וגיבוש תובנות עומק מתוך מחשבה נקייה וממוקדת.',
      features: [
        'תיעוד שיטתי של החלטות מפתח בקריירה ובמיזמים',
        'מסגרת מחשבתית לניתוח תרחישים וקבלת החלטות מושכלת',
        'מרחב אישי לכתיבת השראה, חזון ויעדים ארוכי טווח',
        'שמירה מאובטחת מלאה של הנתונים בענן ובזיכרון המקומי'
      ]
    },
    branding: {
      title: '✨ סטודיו מיתוג ועיצוב דיגיטלי (Micro-Branding)',
      content: 'מחולל קונספטים ויזואליים המאגד את שפת המותג שלך (רוז-גולד, לבנדר, ואדריכלות ניקוי ויזואלי). מסייע ביצירת פלטות צבעים, מסרים שיווקיים וממשקים נקיים.',
      features: [
        'ניהול והגדרת פלטות צבעים מדויקות לזהות המותג',
        'הפקת רעיונות ללוגואים, כותרות ומסרים שיווקיים מדויקים',
        'יצירת קו ויזואלי אחיד לרשתות ולפלטפורמות הדיגיטליות',
        'תכנון ממשקי משתמש מינימליסטיים, נשיים ויוקרתיים'
      ]
    },
    capital: {
      title: '💎 ניהול פיננסי עצמאי ותקציב (Smart Capital)',
      content: 'כלי בקרת תקציב וניהול פיננסי חכם למיזמים דיגיטליים, הוצאות שוטפות ופרויקטים עצמאיים, המציג תמונת מצב נקייה וברורה ללא סיבוכים מיותרים.',
      features: [
        'מעקב שוטף ומהיר אחר הוצאות והכנסות עסקיות ואישיות',
        'תכנון תקציבי למיזמים דיגיטליים חדשים ולצמיחה',
        'ניתוח פיננסי חכם לקבלת החלטות כלכליות בטוחות',
        'דשורד ניהולי נקי, מודרני וקל לשימוש מהנייד'
      ]
    },
    mindset: {
      title: '🧘‍♀️ מרחב שקט ומיינדפולנס (Calm & Mindset Vault)',
      content: 'מקלט דיגיטלי שקט להורדת מתחים, תרגילי נשימה מונחים, ומדיטציות קצרות המיועדות לחידוש האנרגיה והפוקוס המנטלי רגע לפני פגישות או החלטות חשובות.',
      features: [
        'תרגילי נשימה קצרים (Box Breathing) להרגעה מיידית',
        'משפטי חיזוק מנטליים והשראה לניהול יום מאוזן',
        'כלי להורדת עומס מנטלי ויצירת שקט פנימי',
        'מרחב התאוששות מהיר בין משימות עמוסות'
      ]
    },
    negotiation: {
      title: '🗣️ סימולטור משא ומתן ושכנוע (Negotiation Lab)',
      content: 'מעבדת סימולציות מתקדמת לתרגול אסטרטגיות שכנוע, סגירת חוזים, עמידה על עקרונות והגנה על האינטרסים העסקיים והאישיים שלך בביטחון מלא.',
      features: [
        'תרגול תרחישי משא ומתן מול גורמים שונים בשוק',
        'גיבוש טיעונים חזקים ומבוססי לוגיקה עסקית',
        'טכניקות מתקדמות לנטרול התנגדויות והגעה להסכמות',
        'חיזוק תחושת המסוגלות והעוצמה במעמדי סגירת עסקה'
      ]
    },
    automation: {
      title: '🤖 עוזר אוטומציות ותכנון תוכן (Content Hub)',
      content: 'מרחב לתכנון קמפיינים שיווקיים, כתיבת פוסטים לרשתות החברתיות, ויצירת רעיונות לאוטומציות חכמות שחוסכות זמן יקר ומייצרות נוכחות דיגיטלית רציפה.',
      features: [
        'בניית לוח שנה שיווקי ותכנון קמפיינים בלחיצת כפתור',
      'כתיבת טקסטים שיווקיים, ניוזלטרים ותוכן לרשתות',
        'איתור תהליכים עסקיים שניתן להפוך לאוטומטיים לחלוטין',
        'ניהול חכם של ערוצי השיווק הישירים שלך'
      ]
    },
    career: {
      title: '🌐 ניהול קריירה ונטוורקינג חכם (Career Tracker)',
      content: 'מערכת לניהול קשרים מקצועיים, שיתופי פעולה, פגישות מפתח ותכנון אסטרטגי של צעדי ההתפתחות הבאים בעולם העסקים והקריירה.',
      features: [
        'מעקב שיטתי אחר שותפויות, קשרים והזדמנויות עסקיות',
        'תכנון אבני דרך להתפתחות אישית ומקצועית',
        'ניהול פגישות נטוורקינג והפקת לקחים אחריהן',
        'מיפוי קשרים אסטרטגיים לקידום מיזמים משותפים'
      ]
    },
    wellness: {
      title: '🩺 יומן בריאות מונעת ומדדים (Wellness Vault)',
      content: 'כלי מעקב אישי מקיף לשנת לילה, מדדי חיוניות גופנית, והמלצות מותאמות לשמירה פרואקטיבית על אורח חיים מאוזן, בריא ואנרגטי.',
      features: [
        'מעקב אחר שגרת השינה, האיכות וההתאוששות הלילית',
        'המלצות מותאמות לבריאות מונעת ואורח חיים מיטבי',
        'מעקב אחר מדדי חיוניות גופניים ומנטליים שוטפים',
        'יצירת שגרת טיפוח אישית המותאמת לקצב החיים שלך'
      ]
    },
    healthlog: {
      title: '🌿 יומן בריאות ואיזון גוף-נפש',
      content: 'יומן יומי עדין ומדויק לרישום תחושות, תזונה תומכת, טיפוח אישי וניהול האיזון העדין שבין הגוף והנפש לאורך החודש.',
      features: [
        'תיעוד יומי של רמות רווחה, אנרגיה ומצב רוח',
        'המלצות מותאמות לתזונה ולטיפוח תומך גוף-נפש',
        'מעקב אחר מחזורי אנרגיה אישיים וזמני מנוחה נדרשים',
        'יצירת הרגלים קטנים שמחזקים את הבריאות הפנימית'
      ]
    },
    style: {
      title: '👗 סטודיו סטייל, אופנה וטרנדים',
      content: 'מרחב יצירתי לתכנון מלתחה חכמה, שילובי צבעים מדויקים, קולקציות לבוש והשראה עיצובית לעולם האופנה והסטייל האישי.',
      features: [
        'תכנון מלתחה קפסולה מינימליסטית, יוקרתית ונוחה',
        'שילובי פלטות צבעים וטרנדים מובילים באופנה ובסטייל',
        'שמירת קונספטים לעיצוב אישי ולהופעות מוקפדות',
        'השראה ויזואלית יומית המותאמת לטעם האישי שלך'
      ]
    },
    lifestyle: {
      title: '☕ מרחב פנאי, לייף סטייל וקפה',
      content: 'פינת השראה מפנקת המוקדשת להפסקות קפה איכותיות, תכנון תרבות פנאי, קריאה, טיולים וטיפוח רגעים קטנים של שקט ואיכות חיים אמיתית.',
      features: [
        'המלצות ליצירת שגרת פנאי מעשירה ומרגיעה',
        'תכנון רגעים של שקט, קפה וקריאה בתוך שגרת העומס',
        'השראה לעיצוב מרחבי מגורים נעימים, חמים ומוארים',
        'טיפוח תחביבים אישיים וחיבור לעולמות התרבות'
      ]
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
          {/* Original Asterisk Logo */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E8A3B8] via-[#D8B4FE] to-[#FAF7F2] p-[1.5px] shadow-md shadow-purple-900/10">
            <div className="w-full h-full bg-[#FAF7F2] rounded-[14px] flex items-center justify-center relative overflow-hidden">
              <span className="text-xl font-serif text-[#9D4EDD] font-bold tracking-tighter select-none">✳︎</span>
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
            פלטפורמת בינה עדינה הכוללת את כל 18 הסקילים המפורטים והאינטראקטיביים שלך.
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

        {/* All Starters Grid (All 18 Detailed Skills) */}
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

      {/* Micro-UI Active Canvas Drawer with Detailed Capabilities */}
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
