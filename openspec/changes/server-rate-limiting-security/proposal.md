## Why

Automated vulnerability scanners and malicious actors are actively probing server endpoints for sensitive configuration files (`.env*`, `.git/HEAD`, `phpinfo.php`, `service-account.json`, database dumps, SSH keys). Implementing rate limiting and automated security request shielding (path pattern blocking and IP throttling) is necessary to protect server credentials, prevent brute-force attacks, and preserve system resources.

## What Changes

- **Rate Limiting**: Introduce middleware-level rate limiting in `@luxe-maison/restapi` to limit incoming HTTP request rates per client IP across global API routes and strict rate limits for sensitive/authentication endpoints.
- **Request Shield Middleware**: Implement path pattern blocking that intercepts and immediately rejects requests probing for sensitive files (`.env*`, `.git/*`, `*.php`, `*.sql`, `*.json` credentials, `.ssh/*`, `wp-admin`, etc.).
- **Automatic IP Banning**: Automatically track probe violations per IP and temporarily block repeat offending IP addresses.
- **Security Headers**: Standardize security response headers across server responses (`X-Content-Type-Options`, `X-Frame-Options`, `Content-Security-Policy`, `X-XSS-Protection`).

## Capabilities

### New Capabilities
- `rate-limiting`: Restricts HTTP request frequency per client IP globally and per sensitive API endpoint.
- `request-shield`: Intercepts and blocks malicious file scanning attempts (`.env`, credentials, scripts, hidden directories) and manages IP ban lists.

### Modified Capabilities

## Impact

- `@luxe-maison/restapi`: Updates server initialization (`src/index.ts` / Hono middleware chain) with rate limiter and security shield middleware.
- Dependencies: Uses memory/sliding-window storage for client IP tracking within `@luxe-maison/restapi`.
- Client HTTP Responses: Returns `429 Too Many Requests` when rate limits are exceeded, and `403 Forbidden` for blocked probe patterns.
