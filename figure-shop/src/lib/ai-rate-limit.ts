type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const WINDOW_MS = 60_000;
const entries = new Map<string, RateLimitEntry>();

function getLimit() {
  const configured = Number(process.env.AI_RATE_LIMIT_PER_MINUTE ?? 10);

  if (!Number.isFinite(configured)) {
    return 10;
  }

  return Math.min(Math.max(Math.floor(configured), 1), 60);
}

function pruneExpiredEntries(now: number) {
  if (entries.size < 500) {
    return;
  }

  for (const [key, entry] of entries) {
    if (entry.resetAt <= now) {
      entries.delete(key);
    }
  }
}

export function consumeAiRateLimit(identifier: string) {
  const now = Date.now();
  const limit = getLimit();
  pruneExpiredEntries(now);

  const current = entries.get(identifier);

  if (!current || current.resetAt <= now) {
    entries.set(identifier, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });

    return {
      allowed: true,
      remaining: limit - 1,
      retryAfterSeconds: 0,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((current.resetAt - now) / 1_000),
      ),
    };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining: limit - current.count,
    retryAfterSeconds: 0,
  };
}
