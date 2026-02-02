import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

const FREE_SIGNUP_CREDITS = 5;

// Get service role client for bypassing RLS
function getServiceClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase environment variables not set');
  }
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * POST /api/init-subscription
 * Creates a subscription with free credits for new users
 * Called when a user signs up and doesn't have a subscription yet
 */
export async function POST() {
  // Get the current user
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Use service role client to bypass RLS
  const serviceClient = getServiceClient();

  // Check if subscription already exists
  const { data: existing } = await serviceClient
    .from('subscriptions')
    .select('id, credits_remaining')
    .eq('user_id', user.id)
    .single();

  if (existing) {
    // Subscription exists - return current state
    return NextResponse.json({
      success: true,
      message: 'Subscription already exists',
      credits: existing.credits_remaining
    });
  }

  // Create new subscription with free credits
  const { data: newSub, error } = await serviceClient
    .from('subscriptions')
    .insert({
      user_id: user.id,
      tier: 'free',
      status: 'active',
      credits_remaining: FREE_SIGNUP_CREDITS,
      credits_purchased: 0,
      credits_monthly_allowance: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[Init Subscription] Error creating subscription:', error);
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 });
  }

  console.log(`[Init Subscription] Created subscription with ${FREE_SIGNUP_CREDITS} credits for user ${user.id.slice(0, 8)}...`);

  return NextResponse.json({
    success: true,
    message: 'Subscription created',
    credits: newSub.credits_remaining
  });
}
