import { NextRequest, NextResponse } from 'next/server';

// In-memory sliding window rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 120; // max 120 requests per minute per IP

/**
 * Enforces rate limiting per IP address.
 */
export function checkRateLimit(ip: string): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    const resetTime = now + RATE_LIMIT_WINDOW_MS;
    rateLimitMap.set(ip, { count: 1, resetTime });
    return { success: true, limit: MAX_REQUESTS_PER_WINDOW, remaining: MAX_REQUESTS_PER_WINDOW - 1, reset: Math.ceil(resetTime / 1000) };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { success: false, limit: MAX_REQUESTS_PER_WINDOW, remaining: 0, reset: Math.ceil(record.resetTime / 1000) };
  }

  record.count += 1;
  return { success: true, limit: MAX_REQUESTS_PER_WINDOW, remaining: MAX_REQUESTS_PER_WINDOW - record.count, reset: Math.ceil(record.resetTime / 1000) };
}

/**
 * Validates CSRF headers for state-changing requests (POST, PUT, DELETE, PATCH).
 */
export function validateCsrf(request: NextRequest): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const fetchSite = request.headers.get('sec-fetch-site');

  // Same-origin or same-site check
  if (fetchSite && ['same-origin', 'same-site', 'none'].includes(fetchSite)) {
    return true;
  }

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      return originHost === host;
    } catch {
      return false;
    }
  }

  return true;
}
