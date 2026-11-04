import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // קריאה למודל השפה החינמי של גוגל (או מנוע חיצוני תואם)
    // במידה ומוגדר מפתח סביבה חינמי, נשתמש בו, אחרת נחזיר מענה דינמי מלא
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (apiKey) {
      const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      const data = await apiRes.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'לא התקבלה תשובה מהמודל.';
      return NextResponse.json({ reply });
    }

    // מענה חלופי דינמי במידה וטרם הוגדר מפתח סביבה ב-Netlify
    return NextResponse.json({ 
      reply: `התקבלה השאלה: "${prompt}". כדי לחבר מודל חינמי מלא, הגדר את מפתח ה-GEMINI_API_KEY בהגדרות Netlify, והמערכת תתחיל לענות תשובות עומק כמו שאני עושה כאן!` 
    });

  } catch (error) {
    return NextResponse.json({ error: 'Error processing AI request' }, { status: 500 });
  }
}
