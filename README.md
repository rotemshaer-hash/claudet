# Claudet

A Hebrew RTL conversation workspace with 18 guided AI domains, local skill filtering, optional local question history, favorites, dark mode and voice dictation.

## Run

Use Node 24 (Node >=22.12 is required by the installed toolchain).

```sh
npm ci
cp .env.example .env.local
# Set GEMINI_API_KEY in .env.local; do not commit it.
npm run dev
```

`npm run typecheck`, `npm test`, and `npm run build` are required before merging. CI runs these checks on pull requests and main. Direct dependencies and the lockfile are pinned. Next.js creates its generated type declarations at build/dev time.

## Google configuration

Set the **server-only** `GEMINI_API_KEY` in Google AI Studio / Netlify. `GOOGLE_API_KEY` is accepted only as a fallback when the former is empty. Leading/trailing whitespace is removed. Never prefix a secret with `NEXT_PUBLIC_`, put it in Git, paste it into an issue, or expose provider error bodies to clients.

`GEMINI_MODEL` defaults to `gemini-3.5-flash-lite`. Confirm model availability and the project's actual free quota in AI Studio before generation. The retired Gemini 1.5 family is rejected. There is no automatic switch to a different model, paid service or Google Search grounding.

Netlify values must be available to **Builds and Functions** for the intended context (`production`, `deploy-preview` etc.). A changed variable requires a new deployment; editing a value does not update deployed functions in place. Existing key scope/secret settings are not changed by the app.

### Diagnose connection

The on-screen connection button calls `GET /api/health`. It authenticates with Google and reads the configured model's metadata, without generating text. A successful metadata check proves key/model access, **not** available generation quota. Confirm generation separately with one short prompt.

`POST /api/chat` accepts:

```json
{
  "messages": [
    { "role": "user", "text": "שלום" },
    { "role": "model", "text": "שלום!" },
    { "role": "user", "text": "בואי נמשיך" }
  ],
  "skill": "branding"
}
```

Maximum 12 turns, 4,000 characters per user message, 8,000 per model message, 16,000 combined characters and 80,000 request bytes. Roles must alternate, starting and ending with user. Clients send a bounded context of complete pairs. Legacy `{ "prompt": "..." }` remains supported. Maximum generation output is 2,048 tokens. A truncated answer is marked explicitly.

Responses use `{ok:true,reply,...}` or `{ok:false,error:{code,message},requestId}` with an appropriate non-200 status for errors. Key/model/permission, quota, safety, timeout and network errors are distinguishable. Logs contain only request ID, error code and status; never full provider payloads, query text or credentials. API keys use a request header, not a URL query string. Retries are user initiated; no hidden repeated billable calls are made.

## Deployment and rate limits

Netlify detects Next.js using its maintained OpenNext adapter. Publish `.next`; do not add a SPA catch-all redirect. Tailwind is compiled into local CSS during build, without a runtime CDN script. Keep the adapter unpinned so Netlify maintains its compatibility.

`netlify/edge-functions/api-guard.ts` declares a platform rate limit of 30 requests per IP/domain per 60 seconds on `/api/*`. Check the deploy summary to verify this rule is applied. Netlify enforcement may lag by up to 10 seconds, and per-IP limits are not an absolute cost cap across all visitors. A bounded in-memory per-instance limiter adds 20 chat requests/minute and 6 health requests/minute. It is a local backstop, **not distributed state**. Server-side IP selection uses Netlify's platform client-IP header, never caller-supplied X-Forwarded-For. In local development requests share a local bucket.

Same-origin browser requests only are accepted where an Origin header exists; this is not authentication. The application is public by design. For a private deployment, enable an appropriate hosting access layer before opening it to users. Do not add a client-visible static API secret as a substitute for authentication. Configure Google-side quota/billing restrictions for a hard budget boundary.

The repository's main branch protection must be configured by an account with the required GitHub administration scope. Prefer requiring the Checks workflow before merges. This code change does not silently alter repository access controls or deploy to production.

## Privacy and capabilities

Question text and bounded conversation context are sent to Google to produce answers. Favorite IDs, theme, history preference and at most five recent questions can be stored locally. Users can disable history and delete it. The full transcript is kept only in page memory and is cleared on refresh/new conversation. Storage failure never blocks chat.

Voice input uses the browser's speech recognition implementation, which may use the browser vendor's servers. It requires the visitor's microphone permission; dictated text remains editable before sending. No voice is uploaded by this application's own code. Clipboard success appears only after the browser confirms writing.

The 18 domains contain real server-side instructions but do not execute code, book appointments, publish posts, access accounts or search the live web. The UI explicitly discloses the lack of live web search. Generated links are rendered as untrusted Markdown with raw HTML disabled and safe URL handling. Critical or current information still requires verification.

## Review checklist

- Build, typecheck, server regression tests and UI tests pass.
- Preview metadata check succeeds, then one short generation test returns actual model text.
- Follow-up uses previous context; closing/stopping blocks stale replies.
- Mobile/desktop, keyboard focus, error display and local history controls are checked.
- No production merge or deployment occurs until the reviewed version is approved.
