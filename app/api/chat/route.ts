import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json({ reply: 'שגיאה: מפתח ה-API אינו מוגדר ב-Netlify.' });
    }

    // קריאה ישירה ומדויקת למודל gemini-1.5-flash עם ה-API Key
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      })
    });

    const data = await apiRes.json();
    
    // חילוץ מדויק של הטקסט מתוך מבנה התשובה של גוגל
    const textReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textReply) {
      return NextResponse.json({ reply: textReply });
    } else {
      // אם גוגל החזירה שגיאה או מבנה שונה, נציג אותה כדי שנוכל לראות
      const errorMsg = data?.error?.message || 'לא התקבלה תשובה תקינה מהמודל.';
      return NextResponse.json({ reply: `שגיאה מהשרת: ${errorMsg}` });
    }

  } catch (error) {
    return NextResponse.json({ reply: 'שגיאה בעיבוד הבקשה מול השרת.' }, { status: 500 });
  }
}
