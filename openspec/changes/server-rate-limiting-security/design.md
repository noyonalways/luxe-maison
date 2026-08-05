## Context

The server log shows an ongoing automated reconnaissance attack where external bots scan for credentials, backup files, configuration files (`.env*`, `.git/*`, `*.sql`, `service-account.json`, `*.php`), and CMS endpoints (`wp-admin`, `wp-json`). 
Without rate limiting or path shielding, the application remains vulnerable to brute-force credential guessing, denial-of-service, and resource exhaustion.

The REST API application in `@luxe-maison/restapi` is built on Hono and running under Node.js (`@hono/node-server`). We need an architecture-agnostic in-memory security layer (with optional Redis support) that intercepts request probes, enforces rate limits, applies security headers, and temporarily bans offending IPs.

## Goals / Non-Goals

**Goals:**
- **Request Shield Middleware**: Immediately intercept and block scanning attempts for sensitive files (`.env*`, `.git/HEAD`, `phpinfo.php`, `service-account.json`, `*.sql`, etc.) returning `403 Forbidden`.
- **Automated IP Banning**: Automatically track probe violations per IP address; temporarily ban any IP address exceeding a threshold (e.g., 5 probe violations within 10 minutes for 1 hour).
- **Rate Limiting**: Enforce global request rate limits (e.g. 100 requests/min per IP) and strict rate limits for authentication endpoints (e.g. 10 requests/min per IP), responding with `429 Too Many Requests`.
- **Security Headers**: Standardize security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `X-XSS-Protection`) across all responses.
- **Configurability & Zero External Storage Dependency**: Default to an efficient, self-cleaning in-memory store so it works seamlessly without requiring external infrastructure (Redis), while allowing configuration via environment variables.

**Non-Goals:**
- Cloud-level WAF deployment (e.g., AWS WAF, Cloudflare) configuration, though this server-side defense complements edge security.
- Persistent database logging for every blocked request (logs will be emitted via standard request logger to prevent I/O bottlenecks).

## Decisions

### Decision 1: Hono Middleware Architecture for Request Shield and Rate Limiting
- **Choice**: Implement `requestShield` and `rateLimiter` as custom Hono middleware functions positioned at the top of the middleware stack in `app.ts`.
- **Rationale**: Hono middleware executes before route handlers and logger parsing. Intercepting probing requests early avoids unneeded routing overhead and database connections.
- **Alternatives Considered**:
  - *Express or Nginx proxy configuration*: Exposes configuration outside the codebase; application-level middleware ensures protection across all deployment environments (Nixpacks, Docker, local dev).

### Decision 2: In-Memory Sliding Window / Probe Tracking Store
- **Choice**: Implement an in-memory sliding window cache with automatic periodic cleanup (TTL garbage collection) to store IP hit counts and ban timestamps.
- **Rationale**: Highly performant (< 0.1 ms overhead per request), zero external dependency (no Redis required for single-instance deployments), and safe against memory leaks due to periodic pruning.
- **Alternatives Considered**:
  - *Redis store*: Adds infrastructure setup requirements. Memory-store with Redis interface allows plugging in Redis later if multi-node scaling is needed.

### Decision 3: Categorized Path Pattern Matching for Request Shield
- **Choice**: Pre-compile Regular Expressions matching common reconnaissance vectors:
  - Configuration & Environment: `/\.(env|config|yml|yaml|ini|json|bak|backup|old|save|swp|txt)(\.|\/|$)/i`, `/\.env/i`
  - Version Control & Keys: `/\.git/i`, `/\.svn/i`, `/\.ssh/i`, `/\.vscode/i`
  - Secrets & Credentials: `/service-account\.json/i`, `/credentials\.json/i`, `/keyfile/i`, `/id_rsa/i`, `/actuator/i`
  - Database Dumps: `/\.(sql|dump|tar|gz|zip|db)$/i`
  - Script & CMS probes: `/\.php$/i`, `/wp-admin/i`, `/wp-json/i`, `/wordpress/i`, `/phpinfo/i`
- **Rationale**: Fast pattern matching allows identifying malicious requests in standard O(1) time per request.

### Decision 4: Tiered Rate Limits (Global vs. Auth)
- **Choice**:
  - **Global API Rate Limit**: 100 requests per 1-minute window per IP.
  - **Auth Rate Limit**: 10 requests per 1-minute window per IP on `/api/auth/*` and `/api/customer-auth/*`.
- **Rationale**: General web browsing needs high throughput, while sensitive auth routes (login, register) need strict limits to prevent brute-force attacks.

## Risks / Trade-offs

- **[Risk] Reverse proxy IP masking (X-Forwarded-For spoofing)** → **Mitigation**: Extract client IP safely by parsing `X-Forwarded-For` header (taking the first untrusted upstream IP) or `c.req.header('x-real-ip')` falling back to connection remote address.
- **[Risk] Memory leak from tracking millions of unique scanner IPs** → **Mitigation**: Implement TTL cleanup interval (e.g., every 5 minutes) to sweep expired IP entries from memory maps.
- **[Risk] False positives blocking legitimate user requests** → **Mitigation**: Only match explicit prohibited patterns (e.g. `.env`, `.git`, `*.php`, `id_rsa`) and do not block legitimate API dynamic route parameters.
