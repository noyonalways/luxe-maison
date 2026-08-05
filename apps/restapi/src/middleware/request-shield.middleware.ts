import { createMiddleware } from 'hono/factory';

/**
 * Patterns of known sensitive paths, backup files, credentials, and scanner probes.
 */
const BLOCKED_PATH_PATTERNS: RegExp[] = [
  // Environment and configuration files
  /\/\.env(\.|$|\/)/i,
  /\.(env|config|ini|yaml|yml)(\.|$|\/)/i,
  
  // Version control, IDE, and SSH directories
  /\/\.(git|svn|ssh|vscode|npmrc)(\.|$|\/)/i,

  // Credentials, keys, secret dumps, and actuator endpoints
  /(service-account|credentials|gcp-key|gcp-credentials|firebase|application_default_credentials|keyfile|id_rsa|id_ed25519|sftp\.json|user_secrets)/i,
  /\/actuator\/(heapdump|env|logfile)/i,

  // Database backups and compressed dumps
  /\.(sql|dump|bak|backup|swp|tar|tar\.gz|zip|db)$/i,

  // PHP scripts, info pages, and CMS vulnerability probes
  /\.php/i,
  /\/(wp-admin|wp-json|wp-content|wordpress|wp|phpinfo|pinfo|phpmyadmin|cpanel|administrator|drupal|joomla|magento)\b/i,
  /\/(_profiler|_environment|server-info|server-status)/i,
];

// In-memory IP tracking structures
interface ViolationRecord {
  count: number;
  firstViolation: number;
}

const bannedIPs = new Map<string, number>(); // ip -> banExpirationTime
const probeViolations = new Map<string, ViolationRecord>(); // ip -> violation record

const MAX_PROBE_VIOLATIONS = 5;
const VIOLATION_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const BAN_DURATION_MS = 60 * 60 * 1000; // 1 hour

// Periodic cleanup to avoid memory leaks (runs every 5 mins)
const cleanupTimer = setInterval(() => {
  const now = Date.now();

  for (const [ip, expireTime] of bannedIPs.entries()) {
    if (now > expireTime) {
      bannedIPs.delete(ip);
    }
  }

  for (const [ip, record] of probeViolations.entries()) {
    if (now - record.firstViolation > VIOLATION_WINDOW_MS) {
      probeViolations.delete(ip);
    }
  }
}, 5 * 60 * 1000);

if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Extracts client IP from standard proxy headers or fallback
 */
export function getClientIP(c: { req: { header: (name: string) => string | undefined } }): string {
  const xForwardedFor = c.req.header('x-forwarded-for');
  if (xForwardedFor) {
    const ips = xForwardedFor.split(',').map((ip) => ip.trim());
    if (ips[0]) return ips[0];
  }
  const xRealIP = c.req.header('x-real-ip');
  if (xRealIP) return xRealIP;

  return '127.0.0.1';
}

/**
 * Request Shield Middleware:
 * Intercepts malicious scanning/probing requests and enforces automated IP bans.
 */
export const requestShield = createMiddleware(async (c, next) => {
  const clientIP = getClientIP(c);
  const path = c.req.path;
  const now = Date.now();

  // 1. Check if IP is currently banned
  const banExpiration = bannedIPs.get(clientIP);
  if (banExpiration) {
    if (now < banExpiration) {
      return c.json({ status: 'error', message: 'Access denied: IP temporarily banned' }, 403);
    } else {
      bannedIPs.delete(clientIP);
    }
  }

  // 2. Check if request matches blocked path probe patterns
  const isProbe = BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(path));

  if (isProbe) {
    // Record violation
    const currentRecord = probeViolations.get(clientIP);
    if (!currentRecord || now - currentRecord.firstViolation > VIOLATION_WINDOW_MS) {
      probeViolations.set(clientIP, { count: 1, firstViolation: now });
    } else {
      currentRecord.count += 1;
      if (currentRecord.count >= MAX_PROBE_VIOLATIONS) {
        bannedIPs.set(clientIP, now + BAN_DURATION_MS);
        probeViolations.delete(clientIP);
        console.warn(`[SECURITY SHIELD] Auto-banned IP ${clientIP} for 1 hour due to repeated path probing (${path})`);
      }
    }

    console.warn(`[SECURITY SHIELD] Blocked malicious probe attempt: ${c.req.method} ${path} from ${clientIP}`);
    return c.json({ status: 'error', message: 'Forbidden' }, 403);
  }

  await next();
});
