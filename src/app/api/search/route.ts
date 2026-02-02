import { NextRequest, NextResponse } from 'next/server';
import { searchGoogleMaps } from '@/lib/outscraper';
import { SearchRequest, SearchResponse, Business } from '@/lib/types';
import Cache, { cache, CACHE_TTL } from '@/lib/cache';
import { checkRateLimit } from '@/lib/api-rate-limit';

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'search');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: SearchRequest = await request.json();

    if (!body.niche || !body.location) {
      return NextResponse.json(
        { error: 'Niche and location are required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = Cache.searchKey(body.niche, body.location);
    const cachedResults = await cache.get<Business[]>(cacheKey);

    if (cachedResults) {
      console.log(`[Search API] Cache HIT for "${body.niche}" in "${body.location}"`);
      const response: SearchResponse = {
        businesses: cachedResults,
        totalResults: cachedResults.length,
        cached: true,
      };
      return NextResponse.json(response);
    }

    console.log(`[Search API] Cache MISS for "${body.niche}" in "${body.location}"`);
    const businesses = await searchGoogleMaps(body.niche, body.location, 25);

    // Cache the results
    await cache.set(cacheKey, businesses, CACHE_TTL.SEARCH_RESULTS);

    const response: SearchResponse = {
      businesses,
      totalResults: businesses.length,
      cached: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
