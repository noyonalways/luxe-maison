## 1. Security & Protection Middleware Implementation

- [x] 1.1 Create request shield middleware (`apps/restapi/src/middleware/request-shield.middleware.ts`) with scanning path patterns (`.env*`, `.git/*`, `*.sql`, `service-account.json`, `phpinfo.php`, `wp-admin`, etc.), probe tracking, and automatic IP banning.
- [x] 1.2 Create rate limiting middleware (`apps/restapi/src/middleware/rate-limiter.middleware.ts`) supporting global request limits (100 req/min) and strict route limits (10 req/min for auth).
- [x] 1.3 Create security response headers middleware (`apps/restapi/src/middleware/security-headers.middleware.ts`) to attach standard security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `X-XSS-Protection`).

## 2. Server Application Integration

- [x] 2.1 Integrate `requestShield`, `securityHeaders`, and `rateLimiter` into the Hono middleware pipeline in `apps/restapi/src/app.ts`.
- [x] 2.2 Apply strict rate limiting middleware specifically to `/api/auth/*` and `/api/customer-auth/*` route groups in `apps/restapi/src/app.ts`.

## 3. Verification & Testing

- [x] 3.1 Verify request shield blocks probes for `.env`, `service-account.json`, `phpinfo.php`, `.git/HEAD` with 403 Forbidden.
- [x] 3.2 Verify rate limiter enforces 429 Too Many Requests with `Retry-After` headers when request rates exceed limits.
- [x] 3.3 Ensure standard security headers are present on server responses and project builds cleanly via `pnpm check-types`.
