import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ChatError,
  config,
  generateReply,
  googleRequest,
  providerError,
  validateChat,
} from "../lib/chat";
import { allowRequest, readBody } from "../lib/rate-limit";
import { filterSkills, skills } from "../lib/skills";
import { POST } from "../app/api/chat/route";
import { GET } from "../app/api/health/route";
const ok = (data: unknown, status = 200) =>
  Promise.resolve(Response.json(data, { status }));
beforeEach(() => {
  vi.stubEnv("GEMINI_API_KEY", "fake-test-key");
  vi.stubEnv("GEMINI_MODEL", "gemini-3.5-flash-lite");
  vi.spyOn(console, "warn").mockImplementation(() => {});
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
describe("input and context", () => {
  it.each([
    null,
    [],
    {},
    { prompt: "" },
    { prompt: 5 },
    { messages: [{ role: "model", text: "x" }] },
    {
      messages: [
        { role: "user", text: "x" },
        { role: "user", text: "y" },
      ],
    },
    { prompt: "x", skill: "fake" },
    { prompt: "x".repeat(4001) },
  ])("rejects malformed request %j", (body) =>
    expect(() => validateChat(body)).toThrow(ChatError),
  );
  it("preserves complete conversation and a selected skill", () => {
    const body = {
      messages: [
        { role: "user", text: "hello" },
        { role: "model", text: "hi" },
        { role: "user", text: "continue" },
      ],
      skill: "branding",
    };
    expect(validateChat(body)).toEqual(body);
  });
  it("accepts a legacy prompt", () =>
    expect(validateChat({ prompt: " hello " })).toEqual({
      messages: [{ role: "user", text: "hello" }],
      skill: undefined,
    }));
  it("rejects oversized combined context", () =>
    expect(() =>
      validateChat({
        messages: Array.from({ length: 11 }, (_, i) => ({
          role: i % 2 ? "model" : "user",
          text: "a".repeat(2000),
        })),
      }),
    ).toThrow());
});
describe("configuration and provider", () => {
  it("trims server key and supports GOOGLE_API_KEY fallback", () =>
    expect(
      config({
        GEMINI_API_KEY: " ",
        GOOGLE_API_KEY: " fallback ",
        GEMINI_MODEL: "gemini-3.5-flash-lite",
      }),
    ).toEqual({ key: "fallback", model: "gemini-3.5-flash-lite" }));
  it("reports missing key", () => expect(() => config({})).toThrow(/הוגדר/));
  it("rejects retired models and path injection", () => {
    for (const model of ["gemini-1.5-flash", "../models/pro", "bad"])
      expect(() =>
        config({ GEMINI_API_KEY: "x", GEMINI_MODEL: model }),
      ).toThrow();
  });
  it.each([
    [400, "KEY_INVALID"],
    [401, "KEY_INVALID"],
    [403, "PERMISSION_DENIED"],
    [404, "MODEL_UNAVAILABLE"],
    [429, "RATE_LIMITED"],
    [500, "UPSTREAM_UNAVAILABLE"],
  ])("maps provider status %s safely", (status, code) => {
    const e = providerError(Number(status), {
      error: { message: "API key invalid secret-test" },
    });
    expect(e.code).toBe(code);
    expect(e.message).not.toContain("secret-test");
  });
  it("joins all public text parts, excludes thoughts, sends context and skill instruction", async () => {
    const f = vi.fn(() =>
      ok({
        candidates: [
          {
            content: {
              parts: [
                { text: "private", thought: true },
                { text: "one" },
                { text: "two" },
              ],
            },
            finishReason: "STOP",
          },
        ],
      }),
    );
    const result = await generateReply(
      validateChat({
        messages: [
          { role: "user", text: "hello" },
          { role: "model", text: "hi" },
          { role: "user", text: "continue" },
        ],
        skill: "code",
      }),
      undefined,
      f,
    );
    expect(result.reply).toBe("one\ntwo");
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).not.toContain("fake-test-key");
    expect(new Headers(init.headers).get("x-goog-api-key")).toBe(
      "fake-test-key",
    );
    const b = JSON.parse(init.body as string);
    expect(b.contents).toHaveLength(3);
    expect(b.systemInstruction.parts[0].text).toContain("מפתחת תוכנה");
    expect(b.tools).toBeUndefined();
  });
  it.each([
    { promptFeedback: { blockReason: "SAFETY" } },
    { candidates: [{ finishReason: "RECITATION" }] },
  ])("reports blocking honestly", async (data) =>
    expect(
      generateReply(
        { messages: [{ role: "user", text: "x" }] },
        undefined,
        () => ok(data),
      ),
    ).rejects.toMatchObject({ code: "BLOCKED", status: 422 }),
  );
  it("reports empty replies", async () =>
    expect(
      generateReply(
        { messages: [{ role: "user", text: "x" }] },
        undefined,
        () => ok({ candidates: [] }),
      ),
    ).rejects.toMatchObject({ code: "EMPTY_RESPONSE" }));
  it("reports truncation", async () =>
    expect(
      generateReply(
        { messages: [{ role: "user", text: "x" }] },
        undefined,
        () =>
          ok({
            candidates: [
              {
                content: { parts: [{ text: "partial" }] },
                finishReason: "MAX_TOKENS",
              },
            ],
          }),
      ),
    ).resolves.toMatchObject({ truncated: true }));
  it("does not hide upstream errors", async () =>
    expect(
      googleRequest("models/test", {}, undefined, () =>
        ok({ error: { message: "not found" } }, 404),
      ),
    ).rejects.toMatchObject({ code: "MODEL_UNAVAILABLE" }));
  it("handles non-JSON errors without leaks", async () =>
    expect(
      googleRequest(
        "models/test",
        {},
        undefined,
        async () => new Response("<html>bad</html>", { status: 502 }),
      ),
    ).rejects.toMatchObject({ status: 502 }));
  it("handles cancellation", async () => {
    const c = new AbortController();
    c.abort();
    await expect(
      googleRequest("models/test", {}, c.signal, async () => {
        throw Error("aborted");
      }),
    ).rejects.toMatchObject({ code: "CANCELLED" });
  });
  it("times out", async () => {
    const f = vi.fn(
      (_url: unknown, init: RequestInit) =>
        new Promise<Response>((_, reject) => {
          init.signal?.addEventListener("abort", () =>
            reject(Error("aborted")),
          );
        }),
    );
    await expect(
      googleRequest("models/test", {}, undefined, f as typeof fetch, 5),
    ).rejects.toMatchObject({ code: "TIMEOUT" });
  });
});
describe("request boundaries", () => {
  it("limits a client and expires the bucket", () => {
    const key = "test-" + crypto.randomUUID();
    expect(allowRequest(key, 1, 1)).toBe(true);
    expect(allowRequest(key, 2, 1)).toBe(false);
    expect(allowRequest(key, 60001, 1)).toBe(true);
  });
  it("rejects streamed oversized bodies without relying on Content-Length", async () => {
    const req = new Request("https://app.test", {
      method: "POST",
      body: "abcdef",
    });
    await expect(readBody(req, 4)).rejects.toBeInstanceOf(RangeError);
  });
  it("rejects foreign origin before upstream", async () => {
    const f = vi.fn();
    vi.stubGlobal("fetch", f);
    const r = await POST(
      new Request("https://app.test/api/chat", {
        method: "POST",
        headers: {
          origin: "https://evil.test",
          "content-type": "application/json",
        },
        body: "{}",
      }),
    );
    expect(r.status).toBe(403);
    expect(f).not.toHaveBeenCalled();
  });
  it("rejects invalid JSON with HTTP 400", async () => {
    const r = await POST(
      new Request("https://app.test/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: "{",
      }),
    );
    expect(r.status).toBe(400);
    expect(await r.json()).toMatchObject({
      ok: false,
      error: { code: "INVALID_REQUEST" },
    });
  });
  it("returns provider errors instead of fabricated success", async () => {
    vi.stubGlobal("fetch", () =>
      ok({ error: { message: "secret here" } }, 403),
    );
    const r = await POST(
      new Request("https://app.test/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: "hello" }),
      }),
    );
    expect(r.status).toBe(503);
    expect(JSON.stringify(await r.json())).not.toContain("secret here");
  });
  it("health checks model metadata without generating text", async () => {
    const f = vi.fn((_url: unknown) =>
      ok({ supportedGenerationMethods: ["generateContent"] }),
    );
    vi.stubGlobal("fetch", f);
    const r = await GET(new Request("https://app.test/api/health"));
    expect(r.status).toBe(200);
    expect(f.mock.calls[0][0]).toMatch(/models\/gemini-3.5-flash-lite$/);
  });
});
it("each of 18 skills has a distinct instruction and local search works", () => {
  expect(skills).toHaveLength(18);
  expect(new Set(skills.map((s) => s.prompt)).size).toBe(18);
  expect(filterSkills("מיתוג").some((s) => s.key === "branding")).toBe(true);
  expect(filterSkills("xyz-no-match")).toEqual([]);
});
