import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Initialize Redis client (will be undefined if env vars not set)
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limit configurations for different endpoints
export const rateLimiters = {
  // Search endpoint: 10 requests per minute per IP
  search: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'ratelimit:search',
        analytics: true,
      })
    : null,

  // Analyze endpoints: 5 requests per minute per IP (more expensive)
  analyze: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 m'),
        prefix: 'ratelimit:analyze',
        analytics: true,
      })
    : null,

  // Visibility endpoint: 20 requests per minute per IP (lighter)
  visibility: redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'ratelimit:visibility',
        analytics: true,
      })
    : null,
};

export type RateLimitType = keyof typeof rateLimiters;

/**
 * Get client IP from request
 */
function getClientIp(request: NextRequest): string {
  // Check various headers for the real IP (when behind proxy/load balancer)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Vercel-specific header
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for');
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(',')[0].trim();
  }

  // Fallback
  return '127.0.0.1';
}

/**
 * Rate limit response with proper headers
 */
function rateLimitResponse(reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      error: 'Too many requests. Please try again later.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(reset),
      },
    }
  );
}

/**
 * Check rate limit for a request
 * Returns null if allowed, or a 429 response if rate limited
 */
export async function checkRateLimit(
  request: NextRequest,
  type: RateLimitType
): Promise<NextResponse | null> {
  const limiter = rateLimiters[type];

  // If Redis is not configured, skip rate limiting (development mode)
  if (!limiter) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Rate Limit] Skipped (no Redis configured) for ${type}`);
    }
    return null;
  }

  const ip = getClientIp(request);
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    console.log(`[Rate Limit] Blocked ${ip} for ${type} endpoint`);
    return rateLimitResponse(reset);
  }

  // Log rate limit status in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Rate Limit] ${ip} - ${type}: ${remaining}/${limit} remaining`);
  }

  return null;
}

/**
 * Higher-order function to wrap an API route with rate limiting
 */
export function withRateLimit(
  type: RateLimitType,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const rateLimitResponse = await checkRateLimit(request, type);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
    return handler(request);
  };
}
