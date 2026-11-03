'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Send, ShieldCheck, Zap, Sparkles, Heart, Moon, Sun, History, Star, Copy, Check } from 'lucide-react';

export default function ClaudetPlatform() {
  const [query, setQuery] = useState('');
  const [activeCanvas, setActiveCanvas] = useState<{ title: string; content: string; aiAnswer?: string; howToUse?: string[]; features?: string[] } | null>(null);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [followUpQuery, setFollowUpQuery] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('claudet_dark_mode') === 'true';
    setIsDarkMode(savedTheme);

    const savedFavs = localStorage.getItem('claudet_favs');
    if (savedFavs) setFavorites(JSON.parse(savedFavs));

    const savedHistory = localStorage.getItem('claudet_history');
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
  }, []);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const toggleFavorite = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    let updated;
    if (favorites.includes(key)) {
      updated = favorites.filter(item => item !== key);
    } else {
      updated = [...favorites, key];
    }
    setFavorites(updated);
    localStorage.setItem('claudet_favs', JSON.stringify(updated));
  };

  const toggleDarkMode = () => {
    triggerHaptic();
    const next = !isDarkMode;
    setIsDarkMode(next);
    localStorage.setItem('claudet_dark_mode', String(next));
  };

  const runSelfDiagnostics = () => {
    triggerHaptic();
    setTestResult('מריץ בדיקת מערכת: המשך שיחה, העתקה, מצב לילה ומנוע AI פעילים בהצלחה.');
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

  const processQueryText = (text: string) => {
    triggerHaptic();
    setIsLoadingAI(true);

    const updatedHistory = [text, ...searchHistory.filter(h => h !== text)].slice(0, 5);
    setSearchHistory(updatedHistory);
    localStorage.setItem('claudet_history', JSON.stringify(updatedHistory));

    setTimeout(() => {
      setIsLoadingAI(false);
      const q = text.toLowerCase();
      let selectedSkill = skillsData.focus;
      let aiCustomText = `ניתוח חכם של הבינה המלאכותית עבור הבקשה שלך: "${text}".`;

      if (q.includes('מוזיקה') || q.includes('פלייליסט') || q.includes('שירים') || q.includes('סאונד') || q.includes('music')) {
        selectedSkill = skillsData.music;
        aiCustomText = `ה-AI הפעיל את סטודיו המוזיקה כדי להתאים לך סאונד ממוקד שמעלה את רמת הפוקוס והאנרגיה בהתאם לבקשה שלך.`;
      } else if (q.includes('ציפורניים') || q.includes('אסתטיקה') || q.includes('nail')) {
        selectedSkill = skillsData.nail;
        aiCustomText = `ה-AI בחר עבורך את סטודיו האסתטיקה כדי להפיק פלטות צבעים וקונספט עיצובי תואם.`;
      } else if (q.includes('קוד') || q.includes('אתר') || q.includes('saas') || q.includes('code') || q.includes('ללמוד')) {
        selectedSkill = skillsData.code;
        aiCustomText = `ה-AI הפעיל את עורך הקוד וסביבת הפיתוח כדי לעזור לך לבנות את הפרויקט הבא שלך ב-Next.js ו-Netlify בצורה נקייה ומדויקת.`;
      } else if (q.includes('דיבור') || q.includes('מו"מ') || q.includes('פודקאסט') || q.includes('voice')) {
        selectedSkill = skillsData.voice;
        aiCustomText = `ה-AI הפעיל את מאמן הדיבור והמו"מ כדי לתרגל איתך טיעונים חזקים ובניית ביטחון עצמי.`;
      } else if (q.includes('ספורט') || q.includes('כושר') || q.includes('sports')) {
        selectedSkill = skillsData.sports;
        aiCustomText = `ה-AI הפעיל את סקיל הספורט והכושר לבניית שגרת אימונים המותאמת לקצב האנרגיה שלך.`;
      } else if (q.includes('תזונה') || q.includes('אנרגיה') || q.includes('nutrition') || q.includes('אוכל')) {
        selectedSkill = skillsData.nutrition;
        aiCustomText = `ה-AI בחר את סטודיו התזונה כדי לתכנן עבורך תפריט נקי ששומר על ערנות גבוהה לאורך היום.`;
      } else if (q.includes('זמן') || q.includes('עדיפויות') || q.includes('95') || q.includes('focus') || q.includes('ניהול')) {
        selectedSkill = skillsData.focus;
        aiCustomText = `ה-AI הפעיל את מטריצת ה-95/5 כדי לסנן רעשים ולמקד אותך בפעולות שיוצרות את מירב ההשפעה.`;
      } else if (q.includes('השראה') || q.includes('יומן') || q.includes('החלטות') || q.includes('journal')) {
        selectedSkill = skillsData.journal;
        aiCustomText = `ה-AI פתח את יומן ההחלטות כדי לנתח את הדילמה שלך בצורה שיטתית ומאובטחת.`;
      } else if (q.includes('מיתוג') || q.includes('עיצוב') || q.includes('branding')) {
        selectedSkill = skillsData.branding;
        aiCustomText = `ה-AI הפעיל את סטודיו המיתוג ליצירת שפה ויזואלית ופלטת צבעים יוקרתית.`;
      } else if (q.includes('פיננסי') || q.includes('תקציב') || q.includes('כסף') || q.includes('capital')) {
        selectedSkill = skillsData.capital;
        aiCustomText = `ה-AI בחר את מודול הניהול הפיננסי לבקרת תקציב מדויקת למיזמים דיגיטליים.`;
      } else if (q.includes('שקט') || q.includes('מיינדפולנס') || q.includes('נשימה') || q.includes('mindset')) {
        selectedSkill = skillsData.mindset;
        aiCustomText = `ה-AI הפעיל את מרחב המיינדפולנס להורדת מתחים ותרגילי נשימה מונחים.`;
      } else if (q.includes('משא ומתן') || q.includes('שכר') || q.includes('negotiation')) {
        selectedSkill = skillsData.negotiation;
        aiCustomText = `ה-AI הפעיל את מעבדת המשא ומתן לגיבוש אסטרטגיית שכנוע מנצחת.`;
      } else if (q.includes('אוטומציות') || q.includes('תוכן') || q.includes('קמפיין') || q.includes('automation')) {
        selectedSkill = skillsData.automation;
        aiCustomText = `ה-AI בחר את עוזר האוטומציות ותכנון התוכן ליצירת קמפיין שיווקי יעיל.`;
      } else if (q.includes('קריירה') || q.includes('נטוורקינג') || q.includes('career')) {
        selectedSkill = skillsData.career;
        aiCustomText = `ה-AI הפעיל את מעקב הקריירה והנטוורקינג לניהול קשרים אסטרטגיים.`;
      } else if (q.includes('בריאות מונעת') || q.includes('מדדים') || q.includes('wellness') || q.includes('שינה')) {
        selectedSkill = skillsData.wellness;
        aiCustomText = `ה-AI הפעיל את יומן הבריאות המונעת למעקב שגרת שינה וחיוניות גופנית.`;
      } else if (q.includes('בריאות') || q.includes('איזון') || q.includes('health')) {
        selectedSkill = skillsData.healthlog;
        aiCustomText = `ה-AI הפעיל את יומן האיזון גוף-נפש לניהול רווחה אישית מיטבית.`;
      } else if (q.includes('סטייל') || q.includes('אופנה') || q.includes('לבוש') || q.includes('style')) {
        selectedSkill = skillsData.style;
        aiCustomText = `ה-AI הפעיל את סטודיו הסטייל והאופנה לתכנון מלתחה חכמה וקונספט עיצובי.`;
      } else if (q.includes('לייף סטייל') || q.includes('פנאי') || q.includes('קפה') || q.includes('lifestyle')) {
        selectedSkill = skillsData.lifestyle;
        aiCustomText = `ה-AI פתח את מרחב הפנאי והלייף סטייל לשילוב רגעים של איכות חיים ושקט.`;
      }

      setActiveCanvas({
        title: selectedSkill.title,
        content: selectedSkill.content,
        aiAnswer: aiCustomText,
        howToUse: selectedSkill.howToUse,
        features: selectedSkill.features
      });
    }, 400);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    processQueryText(query);
  };

  const handleFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpQuery.trim()) return;
    processQueryText(followUpQuery);
    setFollowUpQuery('');
  };

  const copyToClipboard = () => {
    if (!activeCanvas) return;
    const textToCopy = `${activeCanvas.title}\n\n${activeCanvas.content}\n\n${activeCanvas.aiAnswer || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleVoiceSearch = () => {
    triggerHaptic();
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
      isDarkMode 
        ? 'bg-[#120A18] text-[#F4EEF5]' 
        : 'bg-gradient-to-br from-[#FDFBF7] via-[#F4EEF5] to-[#EAE0EE] text-[#2C2638]'
    }`} dir="rtl">
      {/* Background Soft Glows */}
      <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] blur-[120px] pointer-events-none rounded-full transition-colors duration-500 ${
        isDarkMode ? 'bg-purple-900/20' : 'bg-pink-200/30'
      }`} />
      <div className={`absolute bottom-10 right-10 w-[400px] h-[400px] blur-[100px] pointer-events-none rounded-full transition-colors duration-500 ${
        isDarkMode ? 'bg-pink-950/20' : 'bg-purple-200/20'
      }`} />

      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#5A2D6C] via-[#351245] to-[#1E0828] p-[1.5px] shadow-lg shadow-purple-950/40 border border-[#E8A3B8]/50">
            <div className={`w-full h-full rounded-[14px] flex items-center justify-center relative overflow-hidden ${isDarkMode ? 'bg-[#1C0D26]' : 'bg-[#270E35]'}`}>
              <span className="text-xl font-serif text-[#E8A3B8] font-bold tracking-tighter select-none scale-125 drop-shadow-[0_0_6px_rgba(232,163,184,0.6)]">✳︎</span>
            </div>
          </div>
          <div>
            <span className={`text-xl font-serif tracking-wide font-medium block ${isDarkMode ? 'text-[#F4EEF5]' : 'text-[#3C2A4D]'}`}>Claudet</span>
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

      {/* Main Hero & Search Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full z-10 text-center -mt-6">
        <div className="space-y-3 mb-8">
          <h1 className={`text-4xl md:text-5xl font-serif font-light tracking-tight leading-snug ${isDarkMode ? 'text-[#FDFBF7]' : 'text-[#2A1B3D]'}`}>
            מה תרצי ליצור היום?
          </h1>
          <p className={`text-sm md:text-base max-w-lg mx-auto ${isDarkMode ? 'text-purple-200/70' : 'text-[#6B5B7A]'}`}>
            פלטפורמת בינה עדינה עם מועדפים, היסטוריה, מצב לילה ומנוע AI חכם לכל 18 הסקילים שלך.
          </p>
        </div>

        {/* Big Prominent Search Box */}
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

        {/* Search History Chips */}
        {searchHistory.length > 0 && (
          <div className="flex items-center justify-center gap-1.5 flex-wrap mb-6 text-xs">
            <span className={`flex items-center gap-1 opacity-70 ${isDarkMode ? 'text-purple-300' : 'text-purple-900'}`}>
              <History className="w-3 h-3" /> אחרונים:
            </span>
            {searchHistory.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(item);
                  processQueryText(item);
                }}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  isDarkMode 
                    ? 'bg-[#1C0D26] border-purple-900 text-purple-200 hover:bg-[#2A133B]' 
                    : 'bg-white/60 border-purple-100 text-purple-900 hover:bg-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Favorites Quick Row */}
        {favorites.length > 0 && (
          <div className="mb-4 w-full">
            <div className={`text-xs font-semibold mb-2 flex items-center justify-center gap-1 ${isDarkMode ? 'text-amber-300' : 'text-purple-900'}`}>
              <Star className="w-3.5 h-3.5 fill-current" /> סקילים מועדפים:
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {allSkillsList.filter(s => favorites.includes(s.key)).map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setQuery(item.label);
                    setActiveCanvas({
                      title: skillsData[item.key].title,
                      content: skillsData[item.key].content,
                      aiAnswer: `הפעלת את המועדף שלך: ${item.label}.`,
                      howToUse: skillsData[item.key].howToUse,
                      features: skillsData[item.key].features
                    });
                  }}
                  className="text-xs bg-gradient-to-r from-purple-900/80 to-rose-950/80 border border-purple-400/40 text-purple-100 px-3.5 py-2 rounded-full transition-all shadow-sm flex items-center gap-1.5"
                >
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Starters Grid */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl">
          {allSkillsList.map((item) => {
            const isFav = favorites.includes(item.key);
            return (
              <button
                key={item.key}
                onClick={() => {
                  setQuery(item.label);
                  setActiveCanvas({
                    title: skillsData[item.key].title,
                    content: skillsData[item.key].content,
                    aiAnswer: `הפעלת ישירות את המודול: ${item.label}. השתמש בכלים המצורפים כדי להפיק את המקסימום.`,
                    howToUse: skillsData[item.key].howToUse,
                    features: skillsData[item.key].features
                  });
                }}
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

      {/* Micro-UI Active Canvas Drawer */}
      {activeCanvas && (
        <div className={`fixed inset-y-0 left-0 w-full md:w-[500px] border-r p-6 z-50 shadow-2xl transition-all flex flex-col justify-between overflow-y-auto ${
          isDarkMode ? 'bg-[#180C22] border-purple-900 text-[#F4EEF5]' : 'bg-[#FAF7F2] border-purple-200 text-[#2C2638]'
        }`}>
          <div>
            <div className={`flex justify-between items-center mb-6 border-b pb-4 ${isDarkMode ? 'border-purple-900' : 'border-purple-100'}`}>
              <h3 className={`text-lg font-serif font-medium flex items-center gap-2 ${isDarkMode ? 'text-purple-200' : 'text-[#3C2A4D]'}`}>
                <Sparkles className="w-5 h-5 text-[#9D4EDD]" />
                <span>{activeCanvas.title}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className={`p-1.5 rounded-full border transition-all ${isDarkMode ? 'bg-purple-950 border-purple-800 text-purple-200' : 'bg-purple-50 border-purple-200 text-purple-800'}`}
                  title="העתק תוכן"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setActiveCanvas(null)}
                  className={`text-sm font-medium px-3 py-1 rounded-full ${isDarkMode ? 'bg-purple-950 text-purple-200 hover:bg-purple-900' : 'text-purple-700/60 hover:text-purple-900 bg-purple-50'}`}
                >
                  ✕ סגור
                </button>
              </div>
            </div>
            <div className="text-sm space-y-4">
              <p className={`p-4 rounded-xl border leading-relaxed font-normal ${
                isDarkMode ? 'bg-[#221030] border-purple-900 text-purple-100' : 'bg-purple-50/80 border-purple-100/60 text-[#4A3B5C]'
              }`}>
                {activeCanvas.content}
              </p>

              {activeCanvas.aiAnswer && (
                <div className={`p-4 rounded-xl border shadow-sm space-y-2 ${isDarkMode ? 'bg-[#221030] border-purple-900 text-purple-100' : 'bg-white border-purple-200 text-[#4A3B5C]'}`}>
                  <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-purple-400">
                    <Sparkles className="w-4 h-4 text-[#9D4EDD]" />
                    <span>ניתוח AI וקישור לסקיל:</span>
                  </div>
                  <p className={`text-xs leading-relaxed font-medium p-3 rounded-lg border ${
                    isDarkMode ? 'bg-[#180C22] border-purple-900 text-purple-200' : 'bg-purple-50/50 border-purple-100 text-[#4A3B5C]'
                  }`}>
                    {activeCanvas.aiAnswer}
                  </p>
                </div>
              )}

              {activeCanvas.howToUse && (
                <div className="bg-gradient-to-r from-purple-950 to-[#3C2A4D] text-white p-4 rounded-xl shadow-md space-y-2 border border-purple-500/30">
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
                <div className={`p-4 rounded-xl border shadow-sm space-y-2 ${isDarkMode ? 'bg-[#221030] border-purple-900 text-purple-100' : 'bg-white border-purple-100 text-[#6B5B7A]'}`}>
                  <span className="text-xs font-semibold block uppercase tracking-wider mb-2 text-purple-400">יכולות מורחבות במודול:</span>
                  <ul className="text-xs space-y-2 list-disc list-inside leading-relaxed">
                    {activeCanvas.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Follow-up chat box inside drawer */}
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
              onClick={() => setActiveCanvas(null)}
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
