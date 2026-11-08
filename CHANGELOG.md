# Reliability repair

## AI and server

- Replace retired Gemini 1.5 with a configurable active-model default; accept the standard Google key fallback and trim whitespace.
- Stop fabricated success replies. Return typed, sanitized errors and true HTTP statuses; use request IDs without logging secrets.
- Validate input, bounded streamed body size, complete conversation turns and skill IDs.
- Add real metadata-only connection diagnostics, timeout/cancellation and full response-part parsing.
- Add platform rate-limit configuration and a documented local backstop.

## Product

- Replace overlapping drawer with a responsive conversation workspace.
- Implement local skill filtering and 18 domain instructions; clearly describe the actual capabilities.
- Preserve bounded follow-up context, cancel requests and ignore late replies.
- Make local history optional/deletable; guard corrupted and blocked browser storage.
- Improve keyboard labels, status announcements, contrast, reduced motion and safe Markdown/code output.
- Handle microphone lifecycle and clipboard failures.

## Maintenance

- Compile CSS during the build, pin direct dependency versions, add a lockfile, remove unused libraries.
- Add strict TypeScript, meaningful regression/UI tests, CI, environment example and setup documentation.
- Main-branch administration settings and provider-account restrictions are separate account operations, not changes made by this patch.
