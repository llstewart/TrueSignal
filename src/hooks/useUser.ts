'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

const FREE_SIGNUP_CREDITS = 5;

interface Subscription {
  tier: 'free' | 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  credits_remaining: number;
  credits_purchased: number;
  credits_monthly_allowance: number;
  current_period_end: string | null;
}

interface UseUserReturn {
  user: User | null;
  subscription: Subscription | null;
  isLoading: boolean;
  credits: number;
  tier: string;
  refreshUser: () => Promise<void>;
  deductCredit: (amount?: number) => Promise<boolean>;
}

const defaultSubscription: Subscription = {
  tier: 'free',
  status: 'active',
  credits_remaining: FREE_SIGNUP_CREDITS,
  credits_purchased: 0,
  credits_monthly_allowance: 0,
  current_period_end: null,
};

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch subscription data
        const { data: sub, error: fetchError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (sub) {
          setSubscription(sub as Subscription);
        } else if (fetchError?.code === 'PGRST116') {
          // No subscription found - create one with free credits
          console.log('[useUser] Creating subscription with free credits for new user');
          const { data: newSub, error: insertError } = await supabase
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

          if (insertError) {
            console.error('[useUser] Error creating subscription:', insertError);
            setSubscription(defaultSubscription);
          } else if (newSub) {
            setSubscription(newSub as Subscription);
          }
        } else {
          setSubscription(defaultSubscription);
        }
      } else {
        setSubscription(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchUser();

    // Listen for auth changes
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          fetchUser();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSubscription(null);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, [fetchUser, supabase.auth]);

  const deductCredit = useCallback(async (amount: number = 1): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: 'Business analysis',
      });

      if (error) {
        console.error('Error deducting credit:', error);
        return false;
      }

      // Refresh subscription data
      await fetchUser();
      return data === true;
    } catch (error) {
      console.error('Error deducting credit:', error);
      return false;
    }
  }, [user, supabase, fetchUser]);

  const credits = subscription
    ? subscription.credits_remaining + subscription.credits_purchased
    : 0;

  const tier = subscription?.tier || 'free';

  return {
    user,
    subscription,
    isLoading,
    credits,
    tier,
    refreshUser: fetchUser,
    deductCredit,
  };
}
