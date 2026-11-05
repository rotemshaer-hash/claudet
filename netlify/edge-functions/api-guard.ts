// The platform enforces this limit before the Next.js handler, across instances.
export default async function guard(
  _request: Request,
  context: { next: () => Promise<Response> },
) {
  return context.next();
}
export const config = {
  path: "/api/*",
  rateLimit: { windowLimit: 30, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
