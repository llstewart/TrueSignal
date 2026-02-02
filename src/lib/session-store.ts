import { Redis } from '@upstash/redis';
import { EnrichedBusiness } from './types';

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Session data structure
export interface SessionAnalyses {
  // Keyed by "niche|location" for easy lookup
  [searchKey: string]: {
    niche: string;
    location: string;
    businesses: EnrichedBusiness[];
    analyzedAt: string; // ISO date
  };
}

// TTL for session data (7 days in seconds)
const SESSION_TTL = 7 * 24 * 60 * 60;

/**
 * Generate a search key from niche and location
 */
export function getSearchKey(niche: string, location: string): string {
  return `${niche.toLowerCase().trim()}|${location.toLowerCase().trim()}`;
}

/**
 * Get all analyses for a session
 */
export async function getSessionAnalyses(sessionId: string): Promise<SessionAnalyses | null> {
  if (!redis) {
    console.log('[Session Store] Redis not configured, skipping');
    return null;
  }

  try {
    const key = `session:${sessionId}:analyses`;
    const data = await redis.get<SessionAnalyses>(key);
    return data;
  } catch (error) {
    console.error('[Session Store] Error getting analyses:', error);
    return null;
  }
}

/**
 * Save analyses for a session (merges with existing)
 */
export async function saveSessionAnalyses(
  sessionId: string,
  niche: string,
  location: string,
  businesses: EnrichedBusiness[]
): Promise<boolean> {
  if (!redis) {
    console.log('[Session Store] Redis not configured, skipping');
    return false;
  }

  try {
    const key = `session:${sessionId}:analyses`;
    const searchKey = getSearchKey(niche, location);

    // Get existing data
    const existing = await redis.get<SessionAnalyses>(key) || {};

    // Merge with existing businesses for this search
    const existingForSearch = existing[searchKey]?.businesses || [];
    const existingMap = new Map(existingForSearch.map(b => [b.placeId || b.name, b]));

    // Add/update with new businesses
    for (const business of businesses) {
      const id = business.placeId || business.name;
      existingMap.set(id, business);
    }

    // Update the session data
    const updated: SessionAnalyses = {
      ...existing,
      [searchKey]: {
        niche,
        location,
        businesses: Array.from(existingMap.values()),
        analyzedAt: new Date().toISOString(),
      },
    };

    // Save with TTL
    await redis.set(key, updated, { ex: SESSION_TTL });

    console.log(`[Session Store] Saved ${businesses.length} businesses for session ${sessionId.slice(0, 8)}...`);
    return true;
  } catch (error) {
    console.error('[Session Store] Error saving analyses:', error);
    return false;
  }
}

/**
 * Get analyses for a specific search within a session
 */
export async function getSearchAnalyses(
  sessionId: string,
  niche: string,
  location: string
): Promise<EnrichedBusiness[]> {
  if (!redis) {
    return [];
  }

  try {
    const key = `session:${sessionId}:analyses`;
    const searchKey = getSearchKey(niche, location);
    const data = await redis.get<SessionAnalyses>(key);

    return data?.[searchKey]?.businesses || [];
  } catch (error) {
    console.error('[Session Store] Error getting search analyses:', error);
    return [];
  }
}

/**
 * Clear all analyses for a session
 */
export async function clearSessionAnalyses(sessionId: string): Promise<boolean> {
  if (!redis) {
    return false;
  }

  try {
    const key = `session:${sessionId}:analyses`;
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('[Session Store] Error clearing analyses:', error);
    return false;
  }
}
