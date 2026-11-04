import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json({ reply: 'שגיאה: מפתח ה-API של גוגל אינו מוגדר ב-Netlify.' });
    }

    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiRes.json();
    
    // בדיקה האם יש תשובה תקינה מה-API של גוגל
    if (data && data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const reply = data.candidates[0].content.parts[0].text;
      return NextResponse.json({ reply });
    } else {
      // במקרה שהמבנה שונה, נחזיר את ההודעה המלאה כדי שנראה מה גוגל החזיר
      return NextResponse.json({ 
        reply: `תשובה גולמית מהשרת: ${JSON.stringify(data)}` 
      });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Error processing AI request' }, { status: 500 });
  }
}
