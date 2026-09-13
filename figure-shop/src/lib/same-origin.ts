/** Next may normalize request.url to an internal host behind its server. */
export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || request.headers.get("sec-fetch-site") === "cross-site") return false;
  const expected = new URL(request.url);
  const host = request.headers.get("host");
  if (host) expected.host = host;
  if (origin === expected.origin) return true;
  try { return Boolean(process.env.APP_URL) && origin === new URL(process.env.APP_URL!).origin; }
  catch { return false; }
}
