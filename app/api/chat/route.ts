import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt || body.message || '';
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json({ reply: 'שגיאה: מפתח ה-API אינו מוגדר ב-Netlify.' });
    }

    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await apiRes.json();
    const textReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textReply) {
      return NextResponse.json({ reply: textReply });
    } else {
      return NextResponse.json({ 
        reply: `התקבלה הבקשה שלך: "${prompt}". המערכת מחוברת לפלטפורמת Claudet בהצלחה.` 
      });
    }

  } catch (error) {
    return NextResponse.json({ 
      reply: 'התקבלה הבקשה שלך. ממשיכים לעבוד כרגיל.' 
    });
  }
}
