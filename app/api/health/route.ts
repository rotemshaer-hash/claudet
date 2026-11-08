import { randomUUID } from "node:crypto";
import {
  ChatError,
  config,
  errorResponse,
  googleRequest,
} from "../../../lib/chat";
import { allowRequest, requestKey } from "../../../lib/rate-limit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const requestId = randomUUID();
  try {
    if (!allowRequest("health:" + requestKey(req), Date.now(), 6))
      throw new ChatError(
        "RATE_LIMITED",
        429,
        "אפשר לבדוק חיבור שוב בעוד דקה.",
      );
    const { model } = config();
    const data = await googleRequest(`models/${model}`, {}, req.signal);
    if (!data.supportedGenerationMethods?.includes("generateContent"))
      throw new ChatError(
        "MODEL_UNAVAILABLE",
        503,
        "המודל אינו תומך ביצירת תשובות.",
      );
    return Response.json(
      {
        ok: true,
        model,
        message:
          "המפתח והמודל זמינים ב־Google. הבדיקה לא יצרה תשובה ואינה מאמתת מכסת יצירה.",
        checkedAt: new Date().toISOString(),
        requestId,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e, requestId);
  }
}
