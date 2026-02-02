import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionAnalyses,
  saveSessionAnalyses,
  getSearchAnalyses,
  clearSessionAnalyses,
  getSearchKey,
} from '@/lib/session-store';
import { EnrichedBusiness } from '@/lib/types';

/**
 * GET /api/session - Get all analyses for a session
 * Query params:
 *   - sessionId: required
 *   - niche: optional (filter by search)
 *   - location: optional (filter by search)
 */
export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  const niche = request.nextUrl.searchParams.get('niche');
  const location = request.nextUrl.searchParams.get('location');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    // If niche and location provided, get specific search analyses
    if (niche && location) {
      const businesses = await getSearchAnalyses(sessionId, niche, location);
      return NextResponse.json({
        businesses,
        searchKey: getSearchKey(niche, location),
      });
    }

    // Otherwise get all analyses for session
    const analyses = await getSessionAnalyses(sessionId);
    return NextResponse.json({ analyses: analyses || {} });
  } catch (error) {
    console.error('[Session API] GET error:', error);
    return NextResponse.json({ error: 'Failed to get session data' }, { status: 500 });
  }
}

/**
 * POST /api/session - Save analyses for a session
 * Body:
 *   - sessionId: required
 *   - niche: required
 *   - location: required
 *   - businesses: required (array of EnrichedBusiness)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, niche, location, businesses } = body as {
      sessionId: string;
      niche: string;
      location: string;
      businesses: EnrichedBusiness[];
    };

    if (!sessionId || !niche || !location || !businesses) {
      return NextResponse.json(
        { error: 'sessionId, niche, location, and businesses are required' },
        { status: 400 }
      );
    }

    const success = await saveSessionAnalyses(sessionId, niche, location, businesses);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save (Redis may not be configured)' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Session API] POST error:', error);
    return NextResponse.json({ error: 'Failed to save session data' }, { status: 500 });
  }
}

/**
 * DELETE /api/session - Clear all analyses for a session
 * Query params:
 *   - sessionId: required
 */
export async function DELETE(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('sessionId');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    const success = await clearSessionAnalyses(sessionId);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('[Session API] DELETE error:', error);
    return NextResponse.json({ error: 'Failed to clear session data' }, { status: 500 });
  }
}
