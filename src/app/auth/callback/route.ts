import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

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

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the user
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Use service role client to bypass RLS
        const serviceClient = getServiceClient();

        // Check if user already has a subscription record
        const { data: existingSub } = await serviceClient
          .from('subscriptions')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // If no subscription exists, create one with free credits
        if (!existingSub) {
          const { error: insertError } = await serviceClient
            .from('subscriptions')
            .insert({
              user_id: user.id,
              tier: 'free',
              status: 'active',
              credits_remaining: FREE_SIGNUP_CREDITS,
              credits_purchased: 0,
              credits_monthly_allowance: 0,
            });

          if (insertError) {
            console.error('[Auth Callback] Error creating subscription:', insertError);
          } else {
            console.log(`[Auth Callback] Created subscription with ${FREE_SIGNUP_CREDITS} credits for user ${user.id.slice(0, 8)}...`);
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
