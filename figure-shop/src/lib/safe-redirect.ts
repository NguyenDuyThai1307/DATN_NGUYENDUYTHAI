export function safeRedirect(value: string | null, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f]/.test(value)) return fallback;
  try { const url = new URL(value, "https://local.invalid"); return url.origin === "https://local.invalid" ? url.pathname + url.search + url.hash : fallback; } catch { return fallback; }
}
