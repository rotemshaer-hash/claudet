import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      return NextResponse.json({ reply: 'שגיאה: מפתח ה-API אינו מוגדר.' });
    }

    // שימוש בנתיב v1 היציב לחלוטין
    const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    const textReply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (textReply) {
      return NextResponse.json({ reply: textReply });
    } else {
      const errorMsg = data?.error?.message || JSON.stringify(data);
      return NextResponse.json({ reply: `שגיאה משרת גוגל: ${errorMsg}` });
    }

  } catch (error) {
    return NextResponse.json({ reply: 'שגיאה בעיבוד הבקשה מול השרת.' }, { status: 500 });
  }
}
