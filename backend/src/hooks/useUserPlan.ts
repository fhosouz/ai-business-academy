import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type PlanType = 'free' | 'premium' | 'enterprise';

 type UserPlanRow = {
   plan_type: PlanType;
   status: string;
   current_period_end: string | null;
 };

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
        // Buscar plano do usuário na tabela user_plans
        const { data, error } = await supabase
          .from('user_plans')
          .select('plan_type, status, current_period_end')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(1)
          .returns<UserPlanRow[]>();

        console.log('=== USER PLAN QUERY ===');
        console.log('data:', data);
        console.log('error:', error);

        if (error) {
          console.error('Supabase error:', error);
          setPlan('free');
          setLoading(false);
          return;
        }

        const row = data?.[0] ?? null;

        if (!row) {
          console.log('=== USUÁRIO NÃO TEM PLANO ATIVO, USANDO FREE ===');
          setPlan('free');
          setLoading(false);
          return;
        }
        
        // Verificar se o plano ainda está válido
        const now = new Date();
        const periodEnd = row.current_period_end ? new Date(row.current_period_end) : null;
        
        if (periodEnd && periodEnd < now) {
          console.log('=== PLANO EXPIRADO, SETANDO COMO FREE ===');
          setPlan('free');
        } else {
          const userPlan = row.plan_type as PlanType;
          console.log('=== PLANO ENCONTRADO ===');
          console.log('plan_type:', userPlan);
          console.log('status:', row.status);
          console.log('current_period_end:', row.current_period_end);
          
          setPlan(userPlan);
        }
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