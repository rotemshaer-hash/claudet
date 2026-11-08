// Local per-instance backstop. Netlify's edge rule is the distributed protection.
const buckets = new Map<string, { count: number; until: number }>();
export function allowRequest(key: string, now = Date.now(), limit = 20) {
  for (const [k, b] of buckets) if (b.until <= now) buckets.delete(k);
  const b = buckets.get(key);
  if (b && b.until > now) {
    if (b.count >= limit) return false;
    b.count++;
    return true;
  }
  if (buckets.size >= 10000) return false;
  buckets.set(key, { count: 1, until: now + 60000 });
  return true;
}
export function requestKey(req: Request) {
  return process.env.NETLIFY === "true"
    ? req.headers.get("x-nf-client-connection-ip") || "unknown"
    : "local";
}
export async function readBody(req: Request, max: number) {
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > max) throw new RangeError("too large");
  if (!req.body) return "";
  const reader = req.body.getReader();
  const decoder = new TextDecoder();
  let size = 0,
    text = "";
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new RangeError("too large");
      }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally {
    reader.releaseLock();
  }
}
