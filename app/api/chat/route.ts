import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // כאן תתבצע הפנייה למנוע ה-AI החינמי
    const reply = `קיבלתי את השאלה שלך: "${prompt}". המערכת מחוברת ומוכנה לענות לכל משתמש בצורה חכמה!`;

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Error processing request' }, { status: 500 });
  }
}
