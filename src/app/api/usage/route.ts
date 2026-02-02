import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Rate limits (per minute)
const LIMITS = {
  search: 10,
  analyze: 5,
};

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  // If Redis not configured, return default limits with 0 used
  if (!redis) {
    return NextResponse.json({
      searches: { used: 0, limit: LIMITS.search },
      analyses: { used: 0, limit: LIMITS.analyze },
    });
  }

  try {
    // Get client IP for rate limit keys
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // Check current usage from rate limit keys
    // These keys are set by our rate limiter with format: ratelimit:{type}:{ip}
    const searchKey = `ratelimit:search:${ip}`;
    const analyzeKey = `ratelimit:analyze:${ip}`;

    // Get remaining counts from rate limiter (if they exist)
    // Note: Upstash rate limiter stores the count in a specific format
    // We'll approximate by checking if keys exist
    const [searchData, analyzeData] = await Promise.all([
      redis.get(searchKey),
      redis.get(analyzeKey),
    ]);

    // Parse the rate limit data (Upstash stores as array with counts)
    const parseUsage = (data: unknown, limit: number): number => {
      if (!data) return 0;
      // Upstash ratelimit stores data in a specific format
      // For simplicity, we'll estimate based on presence
      if (Array.isArray(data)) {
        return Math.min(data.length || 0, limit);
      }
      return 0;
    };

    return NextResponse.json({
      searches: {
        used: parseUsage(searchData, LIMITS.search),
        limit: LIMITS.search,
      },
      analyses: {
        used: parseUsage(analyzeData, LIMITS.analyze),
        limit: LIMITS.analyze,
      },
    });
  } catch (error) {
    console.error('[Usage API] Error:', error);
    return NextResponse.json({
      searches: { used: 0, limit: LIMITS.search },
      analyses: { used: 0, limit: LIMITS.analyze },
    });
  }
}
