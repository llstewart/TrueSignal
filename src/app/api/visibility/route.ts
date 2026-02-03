import { NextRequest, NextResponse } from 'next/server';
import { checkSearchVisibility } from '@/lib/visibility';
import { VisibilityRequest, VisibilityResponse } from '@/lib/types';
import { checkRateLimit } from '@/lib/api-rate-limit';

export async function POST(request: NextRequest) {
  // Check rate limit
  const rateLimitResponse = await checkRateLimit(request, 'visibility');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body: VisibilityRequest = await request.json();

    if (!body.businessName || !body.niche || !body.location) {
      return NextResponse.json(
        { error: 'Business name, niche, and location are required' },
        { status: 400 }
      );
    }

    const rank = await checkSearchVisibility(
      body.businessName,
      body.niche,
      body.location
    );

    const response: VisibilityResponse = {
      rank,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Visibility API error:', error);

    const message = error instanceof Error ? error.message : 'An unexpected error occurred';

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
