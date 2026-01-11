// ========================================
// HOOKS OTIMIZADOS E TIPO SEGUROS
// ========================================

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, supabaseHelpers } from '@/integrations/supabase/client-v2';
import { env } from '@/config/env';

// Types melhorados
export type PlanType = 'free' | 'premium' | 'enterprise';
export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface UserPlan {
  id: string;
  user_id: string;
  plan_type: PlanType;
  status: 'active' | 'cancelled' | 'expired';
  stripe_subscription_id?: string;
  mercado_pago_preference_id?: string;
  current_period_end?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProgress {
  total_lessons: number;
  completed_lessons: number;
  in_progress_lessons: number;
  completion_percentage: number;
}

export interface UserAnalytics {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  page_url?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

// Hook principal de autenticação
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Obter sessão inicial
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          await loadUserProfile(session.user.id);
          
          // Sincronizar metadados se existirem
          if (session.user.user_metadata && Object.keys(session.user.user_metadata).length > 0) {
            await supabaseHelpers.syncUserMetadata(
              session.user.id,
              session.user.user_metadata
            );
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    signIn,
    signInWithGoogle,
    signOut,
  };
};

// Hook de planos robusto
export const useUserPlan = () => {
  const [plan, setPlan] = useState<PlanType>('free');
  const [loading, setLoading] = useState(true);
  const [userPlanData, setUserPlanData] = useState<UserPlan | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPlan('free');
      setLoading(false);
      return;
    }

    const fetchUserPlan = async () => {
      try {
        setLoading(true);

        // Usar RPC function otimizada
        const planData = await supabaseHelpers.getUserPlan(user.id);
        
        if (planData) {
          setPlan(planData.plan_type as PlanType);
          setUserPlanData(planData as UserPlan);
        } else {
          // Fallback: buscar diretamente da tabela
          const { data, error } = await supabase
            .from('user_plans')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single();

          if (error) {
            console.error('Error fetching user plan:', error);
            
            // Criar plano free automaticamente se não existir
            if (error.code === 'PGRST116') {
              await supabaseHelpers.updateUserPlan(user.id, 'free');
              setPlan('free');
            }
          } else if (data) {
            setPlan(data.plan_type as PlanType);
            setUserPlanData(data as UserPlan);
          }
        }
      } catch (error) {
        console.error('Error in fetchUserPlan:', error);
        setPlan('free');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPlan();
  }, [user]);

  const canAccessPremium = plan === 'premium' || plan === 'enterprise';
  const isFree = plan === 'free';
  const isPremium = plan === 'premium';
  const isEnterprise = plan === 'enterprise';

  return {
    plan,
    loading,
    canAccessPremium,
    isFree,
    isPremium,
    isEnterprise,
    userPlanData,
  };
};

// Hook de progresso do usuário
export const useUserProgress = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        setLoading(true);

        // Usar RPC function otimizada
        const progressData = await supabaseHelpers.getUserProgress(user.id);
        
        if (progressData) {
          setProgress(progressData as UserProgress);
        }
      } catch (error) {
        console.error('Error fetching user progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  const updateProgress = async (
    lessonId: string,
    status: 'not_started' | 'in_progress' | 'completed',
    progressPercentage: number = 0
  ) => {
    if (!user) return;

    try {
      await supabaseHelpers.updateLessonProgress(
        user.id,
        lessonId,
        status,
        progressPercentage
      );

      // Recarregar progresso
      const progressData = await supabaseHelpers.getUserProgress(user.id);
      if (progressData) {
        setProgress(progressData as UserProgress);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return {
    progress,
    loading,
    updateProgress,
  };
};

// Hook de analytics
export const useAnalytics = () => {
  const { user } = useAuth();

  const trackEvent = async (
    eventType: string,
    eventData: Record<string, any> = {},
    pageUrl?: string
  ) => {
    if (!user) return;

    try {
      await supabaseHelpers.trackAnalytics(
        user.id,
        eventType,
        eventData,
        pageUrl || window.location.href
      );
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  };

  const trackPageView = (pageUrl?: string) => {
    trackEvent('page_view', {}, pageUrl);
  };

  const trackCourseAccess = (courseId: string, courseName: string) => {
    trackEvent('course_access', {
      course_id: courseId,
      course_name: courseName,
    });
  };

  const trackLessonProgress = (
    lessonId: string,
    lessonTitle: string,
    progress: number
  ) => {
    trackEvent('lesson_progress', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      progress_percentage: progress,
    });
  };

  const trackPremiumUpgrade = (planType: PlanType, revenue: number) => {
    trackEvent('premium_upgrade', {
      plan_type: planType,
      revenue,
      currency: 'BRL',
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackCourseAccess,
    trackLessonProgress,
    trackPremiumUpgrade,
  };
};
