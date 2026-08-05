import { createMiddleware } from 'hono/factory';

/**
 * Security Headers Middleware:
 * Applies HTTP security headers to protect against MIME sniffing, clickjacking, XSS, etc.
 */
export const securityHeaders = createMiddleware(async (c, next) => {
  await next();

  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  c.header('Content-Security-Policy', "default-src 'self'");
});
