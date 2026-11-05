import { randomUUID } from "node:crypto";
import {
  ChatError,
  errorResponse,
  generateReply,
  MAX_BODY,
  validateChat,
} from "../../../lib/chat";
import { allowRequest, readBody, requestKey } from "../../../lib/rate-limit";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  const requestId = randomUUID();
  try {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin)
      throw new ChatError("FORBIDDEN", 403, "הבקשה אינה מורשית.");
    if (!allowRequest(requestKey(req)))
      throw new ChatError(
        "RATE_LIMITED",
        429,
        "נשלחו בקשות רבות מדי. נסי שוב בעוד דקה.",
      );
    if (
      !req.headers
        .get("content-type")
        ?.toLowerCase()
        .startsWith("application/json")
    )
      throw new ChatError("INVALID_REQUEST", 415, "יש לשלוח בקשה בתבנית JSON.");
    let body: unknown;
    try {
      body = JSON.parse(await readBody(req, MAX_BODY));
    } catch (e) {
      if (e instanceof RangeError)
        throw new ChatError("TOO_LARGE", 413, "הבקשה ארוכה מדי.");
      throw new ChatError("INVALID_REQUEST", 400, "הבקשה אינה JSON תקין.");
    }
    const result = await generateReply(validateChat(body), req.signal);
    return Response.json(
      { ok: true, ...result, requestId },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e, requestId);
  }
}
