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
        // Buscar plano do usuário na tabela user_plans
        const { data, error } = await supabase
          .from('user_plans')
          .select('plan_type, status, current_period_end')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .single();

        console.log('=== USER PLAN QUERY ===');
        console.log('data:', data);
        console.log('error:', error);

        if (error) {
          console.error('Supabase error:', error);
          
          // Se usuário não tem plano ativo, criar como free
          if (error.code === 'PGRST116') {
            console.log('=== USUÁRIO NÃO TEM PLANO, CRIANDO COMO FREE ===');
            
            const { data: insertData, error: insertError } = await supabase
              .from('user_plans')
              .insert({
                user_id: user.id,
                plan_type: 'free',
                status: 'active',
                current_period_end: null,
                updated_at: new Date().toISOString()
              })
              .select()
              .single();

            if (insertError) {
              console.error('Erro ao criar plano free:', insertError);
              setPlan('free');
            } else {
              console.log('Plano free criado com sucesso:', insertData);
              setPlan('free');
            }
          } else if (error.code === '406' || error.message?.includes('Not Acceptable')) {
            console.log('=== ERRO DE CORS/RLS, TENTANDO NOVAMENTE ===');
            setTimeout(() => {
              fetchUserPlan();
            }, 1000);
            return;
          } else {
            console.log('=== FALLBACK: Setando plano como FREE devido a erro Supabase ===');
            setPlan('free');
          }
          
          setLoading(false);
          return;
        }
        
        // Verificar se o plano ainda está válido
        const now = new Date();
        const periodEnd = data.current_period_end ? new Date(data.current_period_end) : null;
        
        if (periodEnd && periodEnd < now) {
          console.log('=== PLANO EXPIRADO, SETANDO COMO FREE ===');
          setPlan('free');
        } else {
          const userPlan = data.plan_type as PlanType;
          console.log('=== PLANO ENCONTRADO ===');
          console.log('plan_type:', userPlan);
          console.log('status:', data.status);
          console.log('current_period_end:', data.current_period_end);
          
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