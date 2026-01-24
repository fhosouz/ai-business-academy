import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserPlan {
  plan: 'free' | 'premium' | 'enterprise';
  canAccessPremium: boolean;
  expiresAt: string | null;
  loading: boolean;
}

export const useUserPlan = (): UserPlan => {
  const { user } = useAuth();
  const [planData, setPlanData] = useState({
    plan: 'free' as 'free' | 'premium' | 'enterprise',
    canAccessPremium: false,
    expiresAt: null as string | null,
    loading: true
  });

  useEffect(() => {
    const fetchPlan = async () => {
      if (!user) {
        setPlanData({
          plan: 'free',
          canAccessPremium: false,
          expiresAt: null,
          loading: false
        });
        return;
      }

      try {
        // Simulação - em produção, buscaria do backend
        const mockPlan = {
          plan: 'free',
          canAccessPremium: false,
          expiresAt: null
        };
        setPlanData(mockPlan);
      } catch (error) {
        console.error('Error fetching user plan:', error);
        setPlanData({
          plan: 'free',
          canAccessPremium: false,
          expiresAt: null,
          loading: false
        });
      }
    };

    fetchPlan();
  }, [user]);

  return planData;
};
