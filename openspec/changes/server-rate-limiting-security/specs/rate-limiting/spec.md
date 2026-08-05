## ADDED Requirements

### Requirement: Global API Rate Limiting
The server SHALL restrict client request frequency per IP address across all public API endpoints using a sliding window or fixed window algorithm.

#### Scenario: Request count within allowable global limit
- **WHEN** a client IP sends requests below the configured maximum global limit (default: 100 requests per minute)
- **THEN** the server SHALL allow the requests to proceed to the route handler and return normal response status

#### Scenario: Request count exceeds allowable global limit
- **WHEN** a client IP exceeds the configured maximum global limit within the time window
- **THEN** the server SHALL respond with HTTP status 429 Too Many Requests and include a `Retry-After` header specifying the wait duration in seconds

### Requirement: Strict Rate Limiting for Authentication Endpoints
The server SHALL enforce a stricter rate limit for authentication and sensitive operations endpoints (`/api/auth/*`, `/api/customer-auth/*`).

#### Scenario: Authentication request count within limit
- **WHEN** a client IP submits authentication requests within the strict limit (default: 10 requests per minute)
- **THEN** the server SHALL allow the request to be processed by the auth route handler

#### Scenario: Authentication request count exceeds limit
- **WHEN** a client IP exceeds the strict authentication rate limit within the time window
- **THEN** the server SHALL reject subsequent authentication requests with HTTP status 429 Too Many Requests without executing credential validation logic

### Requirement: Rate Limit Header Reporting
The server SHALL include standard rate limit headers on HTTP responses to inform clients of their quota state.

#### Scenario: Include rate limit status headers
- **WHEN** any HTTP request is processed by the rate limiting middleware
- **THEN** the response headers SHALL include `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset`
