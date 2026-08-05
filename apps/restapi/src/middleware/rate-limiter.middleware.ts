import { createMiddleware } from 'hono/factory';
import { getClientIP } from './request-shield.middleware.js';

interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds (default: 1 min)
  maxRequests?: number; // Max requests allowed per window per IP
  message?: string;
}

interface WindowRecord {
  count: number;
  resetTime: number;
}

/**
 * Creates a rate limiter middleware instance for Hono using an in-memory sliding window
 */
export function createRateLimiter(options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60 * 1000; // 1 minute
  const maxRequests = options.maxRequests ?? 100;
  const message = options.message ?? 'Too many requests, please try again later.';

  const ipHits = new Map<string, WindowRecord>();

  // Cleanup expired entries periodically (every 2 mins)
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipHits.entries()) {
      if (now > record.resetTime) {
        ipHits.delete(ip);
      }
    }
  }, 2 * 60 * 1000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  return createMiddleware(async (c, next) => {
    const clientIP = getClientIP(c);
    const now = Date.now();

    let record = ipHits.get(clientIP);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      ipHits.set(clientIP, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    c.header('X-RateLimit-Limit', maxRequests.toString());
    c.header('X-RateLimit-Remaining', remaining.toString());
    c.header('X-RateLimit-Reset', resetSeconds.toString());

    if (record.count > maxRequests) {
      c.header('Retry-After', resetSeconds.toString());
      return c.json(
        {
          status: 'error',
          message,
        },
        429,
      );
    }

    await next();
  });
}

/**
 * Global API Rate Limiter: 100 requests per minute per IP
 */
export const globalRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'Global rate limit exceeded. Please wait a moment before retrying.',
});

/**
 * Strict Rate Limiter for Auth endpoints: 10 requests per minute per IP
 */
export const authRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Too many authentication attempts. Please wait 1 minute before trying again.',
});
