/**
 * Simple fixed-window rate limiter using an in-memory Map.
 *
 * On Vercel, warm serverless invocations share the same process, so this
 * provides effective burst protection per-instance. State resets on cold
 * starts — for true distributed rate limiting across all instances, use an
 * external store (e.g. Upstash Redis with @upstash/ratelimit).
 */

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true };
  }

  if (entry.count >= limit) {
    return { success: false };
  }

  entry.count++;
  return { success: true };
}
