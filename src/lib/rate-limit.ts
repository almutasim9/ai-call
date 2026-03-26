/**
 * Simple in-memory rate limiter — sliding window per key.
 *
 * Note: Each serverless function instance has its own memory, so this
 * provides per-instance protection rather than global limiting.
 * For global rate limiting, replace the store with a Redis/Supabase backend.
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Clean up expired entries every 5 minutes to prevent memory growth
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

/**
 * Returns true if the request is within the rate limit, false if it should be blocked.
 * @param key      Unique identifier (e.g. IP address or tenant ID)
 * @param limit    Maximum number of requests allowed in the window
 * @param windowMs Window duration in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}
