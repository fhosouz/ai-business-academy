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
        // TEMPORÁRIO: Usar 'role' em vez de 'plan_type' que não existe
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        console.log('=== USER ROLES QUERY ===');
        console.log('data:', data);
        console.log('error:', error);

        if (error) {
          console.error('Supabase error:', error);
          
          // Se usuário não existe em user_roles, criar automaticamente
          if (error.code === 'PGRST116') {
            console.log('=== USUÁRIO NÃO EXISTE EM USER_ROLES, CRIANDO AUTOMATICAMENTE ===');
            
            const { data: insertData, error: insertError } = await supabase
              .from('user_roles')
              .insert({
                user_id: user.id,
                role: 'user' // Usuários novos são 'free' por padrão
              })
              .select()
              .single();

            if (insertError) {
              console.error('Erro ao criar user_role:', insertError);
              setPlan('free');
            } else {
              console.log('User role criado com sucesso:', insertData);
              setPlan('free'); // role 'user' = plan 'free'
            }
          } else {
            console.log('=== FALLBACK: Setando plano como FREE devido a erro Supabase ===');
            setPlan('free');
          }
          
          setLoading(false);
          return;
        }
        
        // TEMPORÁRIO: Mapear role para plan_type
        const roleToPlan: Record<string, PlanType> = {
          'admin': 'premium',
          'user': 'free',
          'premium': 'premium',
          'enterprise': 'enterprise'
        };
        
        const userPlan = roleToPlan[data?.role || 'user'] || 'free';
        console.log('=== MAPEAMENTO ROLE → PLAN ===');
        console.log('role:', data?.role);
        console.log('plan:', userPlan);
        
        setPlan(userPlan);
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