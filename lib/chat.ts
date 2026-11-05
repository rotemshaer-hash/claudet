import { setTimeout as delay } from "node:timers/promises";
import { getSkill } from "./skills";
import type { ChatTurn } from "./contracts";
export type { ChatTurn } from "./contracts";
import { MAX_INPUT, MAX_CONTEXT, MAX_TURNS, MAX_BODY } from "./contracts";
export { MAX_INPUT, MAX_CONTEXT, MAX_TURNS, MAX_BODY } from "./contracts";
export type ChatInput = { messages: ChatTurn[]; skill?: string };
export type ChatErrorCode =
  | "INVALID_REQUEST"
  | "TOO_LARGE"
  | "NOT_CONFIGURED"
  | "KEY_INVALID"
  | "PERMISSION_DENIED"
  | "MODEL_UNAVAILABLE"
  | "RATE_LIMITED"
  | "PROVIDER_REJECTED"
  | "UPSTREAM_UNAVAILABLE"
  | "TIMEOUT"
  | "BLOCKED"
  | "EMPTY_RESPONSE"
  | "CANCELLED"
  | "FORBIDDEN";
export class ChatError extends Error {
  constructor(
    public code: ChatErrorCode,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function validateChat(body: unknown): ChatInput {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new ChatError("INVALID_REQUEST", 400, "הבקשה אינה תקינה.");
  const b = body as Record<string, unknown>;
  const raw =
    b.messages ??
    (typeof b.prompt === "string" ? [{ role: "user", text: b.prompt }] : null);
  if (!Array.isArray(raw) || !raw.length || raw.length > MAX_TURNS)
    throw new ChatError("INVALID_REQUEST", 400, "יש לשלוח שיחה באורך תקין.");
  const messages: ChatTurn[] = raw.map((m, i) => {
    if (
      !m ||
      typeof m !== "object" ||
      !["user", "model"].includes(m.role) ||
      typeof m.text !== "string" ||
      !m.text.trim() ||
      m.text.length > (m.role === "user" ? MAX_INPUT : 8000)
    )
      throw new ChatError(
        "INVALID_REQUEST",
        400,
        "ההודעה ריקה, ארוכה מדי או אינה תקינה.",
      );
    if (m.role !== (i % 2 === 0 ? "user" : "model"))
      throw new ChatError("INVALID_REQUEST", 400, "סדר ההודעות אינו תקין.");
    return { role: m.role, text: m.text.trim() };
  });
  if (
    messages.at(-1)?.role !== "user" ||
    messages.reduce((n, m) => n + m.text.length, 0) > MAX_CONTEXT
  )
    throw new ChatError(
      "INVALID_REQUEST",
      400,
      "השיחה ארוכה מדי. אפשר לפתוח שיחה חדשה.",
    );
  if (
    b.skill !== undefined &&
    (typeof b.skill !== "string" || !getSkill(b.skill))
  )
    throw new ChatError("INVALID_REQUEST", 400, "התחום שנבחר אינו מוכר.");
  return { messages, skill: b.skill as string | undefined };
}
export function config(env: Record<string, string | undefined> = process.env) {
  const key = env.GEMINI_API_KEY?.trim() || env.GOOGLE_API_KEY?.trim() || "";
  const model = (env.GEMINI_MODEL || "gemini-3.5-flash-lite").trim();
  if (!key)
    throw new ChatError("NOT_CONFIGURED", 503, "חיבור ה־AI טרם הוגדר בשרת.");
  if (!/^gemini-[a-z0-9.-]+$/.test(model) || /^gemini-1\./.test(model))
    throw new ChatError(
      "MODEL_UNAVAILABLE",
      503,
      "מודל ה־AI אינו זמין. נדרש עדכון הגדרת השרת.",
    );
  return { key, model };
}
export function providerError(status: number, body?: unknown): ChatError {
  const e = (body as { error?: { message?: string; status?: string } })?.error;
  if (
    status === 400 &&
    /api.key|API_KEY|invalid key/i.test(
      (e?.message || "") + " " + (e?.status || ""),
    )
  )
    return new ChatError(
      "KEY_INVALID",
      503,
      "מפתח Google אינו תקין. נדרשת בדיקת הגדרת השרת.",
    );
  if (status === 400)
    return new ChatError(
      "PROVIDER_REJECTED",
      502,
      "Google דחתה את הבקשה. אפשר לנסות לפתוח שיחה חדשה.",
    );
  if (status === 401)
    return new ChatError(
      "KEY_INVALID",
      503,
      "מפתח Google אינו מאומת. נדרשת בדיקת הגדרת השרת.",
    );
  if (status === 403)
    return new ChatError(
      "PERMISSION_DENIED",
      503,
      "Google אינה מאפשרת שימוש במפתח או בפרויקט הזה.",
    );
  if (status === 404)
    return new ChatError(
      "MODEL_UNAVAILABLE",
      503,
      "המודל שנבחר אינו זמין לפרויקט.",
    );
  if (status === 429)
    return new ChatError(
      "RATE_LIMITED",
      429,
      "מכסת הבקשות נוצלה או שיש עומס. נסי שוב מאוחר יותר.",
    );
  return new ChatError(
    "UPSTREAM_UNAVAILABLE",
    502,
    "Google לא הצליחה להשלים את הבקשה. אפשר לנסות שוב או לערוך את הניסוח.",
  );
}
export async function googleRequest(
  path: string,
  init: RequestInit = {},
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
  timeoutMs = 25000,
) {
  const { key } = config();
  const timeout = AbortSignal.timeout(timeoutMs);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;
  const canRetry = init.method === "POST";
  const attempt = async (target: string, attemptSignal: AbortSignal) => {
    const res = await fetcher(
      "https://generativelanguage.googleapis.com/v1beta/" + target,
      {
        ...init,
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
          ...init.headers,
        },
        signal: attemptSignal,
        cache: "no-store",
      },
    );
    if ([500, 502, 503, 504].includes(res.status)) {
      await res.body?.cancel();
      return { retryStatus: res.status } as const;
    }
    let data;
    try {
      data = await res.json();
    } catch (error) {
      if (attemptSignal.aborted) throw error;
      if (!res.ok) throw providerError(res.status);
      throw new ChatError(
        "UPSTREAM_UNAVAILABLE",
        502,
        "שירות ה־AI החזיר תשובה שאינה תקינה.",
      );
    }
    if (!res.ok) {
      console.warn(
        JSON.stringify({ event: "gemini_http_error", status: res.status }),
      );
      throw providerError(res.status, data);
    }
    return { data } as const;
  };
  try {
    if (!canRetry) {
      const result = await attempt(path, combined);
      if (result.retryStatus) throw providerError(result.retryStatus);
      return result.data;
    }

    // Reserve part of the server deadline for a second model, even if the
    // primary stalls while producing or transferring the response.
    const primaryDeadline = AbortSignal.timeout(
      Math.max(1, Math.floor(timeoutMs * 0.48)),
    );
    const primarySignal = AbortSignal.any([combined, primaryDeadline]);
    try {
      const first = await attempt(path, primarySignal);
      if (!first.retryStatus) return first.data;
      console.warn(
        JSON.stringify({
          event: "gemini_primary_retry",
          status: first.retryStatus,
        }),
      );
      await delay(400, undefined, { signal: combined });
    } catch (error) {
      if (
        !primaryDeadline.aborted ||
        combined.aborted ||
        error instanceof ChatError
      )
        throw error;
      console.warn(JSON.stringify({ event: "gemini_primary_timeout" }));
    }

    const fallback =
      path === "models/gemini-3.5-flash-lite:generateContent"
        ? "models/gemini-3.8-flash:generateContent"
        : path;
    const second = await attempt(fallback, combined);
    if (second.retryStatus) {
      console.warn(
        JSON.stringify({
          event: "gemini_fallback_http_error",
          status: second.retryStatus,
        }),
      );
      throw providerError(second.retryStatus);
    }
    return second.data;
  } catch (e) {
    if (e instanceof ChatError) throw e;
    if (signal?.aborted) throw new ChatError("CANCELLED", 499, "הבקשה בוטלה.");
    if (timeout.aborted)
      throw new ChatError("TIMEOUT", 504, "הבקשה ארכה זמן רב מדי. נסי שוב.");
    throw new ChatError(
      "UPSTREAM_UNAVAILABLE",
      502,
      "לא ניתן להתחבר כעת לשירות ה־AI.",
    );
  }
}
export async function generateReply(
  input: ChatInput,
  signal?: AbortSignal,
  fetcher: typeof fetch = fetch,
) {
  const { model } = config();
  const skill = getSkill(input.skill);
  const data = await googleRequest(
    `models/${model}:generateContent`,
    {
      method: "POST",
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "את Claudet, עוזרת יצירתית ומעשית. השיבי בשפת המשתמש, בעברית כברירת מחדל, ושמרי על לשון פנייה עקבית. התחילי בתשובה שימושית והוסיפי שאלות קצרות רק אם הן משנות את התוצאה. הפרידי עובדות מהנחות ואל תמציאי פרטים. אין לך חיפוש באינטרנט או יכולת לבצע פעולות בשירותים חיצוניים; אמרי זאת כשנדרש ואל תמציאי מקור או ביצוע. " +
                (skill?.prompt || "בררי שאלה קצרה רק כשחסר מידע חיוני."),
            },
          ],
        },
        contents: input.messages.map((message, index) => ({
          role: message.role,
          parts: [
            {
              text:
                skill && index === input.messages.length - 1
                  ? `התחום שנבחר: ${skill.label}
הבקשה של המשתמש:
${message.text}`
                  : message.text,
            },
          ],
        })),
        generationConfig: { maxOutputTokens: 2048 },
      }),
    },
    signal,
    fetcher,
  );
  const candidate = data?.candidates?.[0];
  if (
    data?.promptFeedback?.blockReason ||
    [
      "SAFETY",
      "RECITATION",
      "BLOCKLIST",
      "PROHIBITED_CONTENT",
      "SPII",
      "IMAGE_SAFETY",
    ].includes(candidate?.finishReason)
  )
    throw new ChatError(
      "BLOCKED",
      422,
      "לא ניתן להשיב לבקשה הזאת. אפשר לנסח אותה מחדש.",
    );
  const reply = candidate?.content?.parts
    ?.filter(
      (p: { text?: unknown; thought?: boolean }) =>
        typeof p.text === "string" && !p.thought,
    )
    .map((p: { text: string }) => p.text)
    .join("\n")
    .trim();
  if (!reply)
    throw new ChatError(
      "EMPTY_RESPONSE",
      502,
      "שירות ה־AI לא החזיר תשובה. נסי לנסח מחדש.",
    );
  return {
    reply,
    model: data?.modelVersion || model,
    truncated: candidate?.finishReason === "MAX_TOKENS",
  };
}
export function errorResponse(error: unknown, requestId: string) {
  const e =
    error instanceof ChatError
      ? error
      : new ChatError("UPSTREAM_UNAVAILABLE", 500, "אירעה שגיאה. נסי שוב.");
  // Deliberately log no provider bodies, user text, credentials or URLs.
  console.warn(JSON.stringify({ requestId, code: e.code, status: e.status }));
  return Response.json(
    { ok: false, error: { code: e.code, message: e.message }, requestId },
    {
      status: e.status,
      headers: {
        "Cache-Control": "no-store",
        ...(e.status === 429 ? { "Retry-After": "60" } : {}),
      },
    },
  );
}
