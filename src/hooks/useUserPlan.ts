import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PlanType = 'free' | 'premium' | 'enterprise';

export const useUserPlan = () => {
  const [plan, setPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (!user) {
        setPlan('free');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('plan_type')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          // Fallback: considerar como free se Supabase falhar
          console.log('=== FALLBACK: Setando plano como FREE devido a erro Supabase ===');
          setPlan('free');
          setLoading(false);
          return;
        }
        
        setPlan((data as any)?.plan_type || 'free');
      } catch (error) {
        console.error('Error fetching user plan:', error);
        // Fallback: considerar como free se houver erro
        setPlan('free');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

  const canAccessPremium = plan === 'premium' || plan === 'enterprise';

  return {
    plan,
    loading,
    canAccessPremium,
    isFree: plan === 'free',
    isPremium: plan === 'premium',
    isEnterprise: plan === 'enterprise'
  };
};