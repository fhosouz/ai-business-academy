// ========================================
// SUPABASE CLIENT OTIMIZADO E TIPO SEGURO
// ========================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { env } from '@/config/env';

// Configuração robusta do Supabase
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    detectSessionInUrl: true,
    flow: 'implicit' as const,
    debug: env.IS_DEVELOPMENT,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': env.SUPABASE_ANON_KEY,
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Client principal
export const supabase = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY,
  supabaseConfig
);

// Client admin (para operações privilegiadas)
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    ...supabaseConfig,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper functions tipadas
export const supabaseHelpers = {
  // User operations
  async getUserPlan(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_plan', { p_user_id: userId });
    
    if (error) {
      console.error('Error getting user plan:', error);
      return null;
    }
    
    return data?.[0] || null;
  },

  async getUserProgress(userId: string) {
    const { data, error } = await supabase
      .rpc('get_user_progress', { p_user_id: userId });
    
    if (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
    
    return data?.[0] || null;
  },

  async syncUserMetadata(userId: string, metadata: Record<string, any>) {
    const { data, error } = await supabase
      .rpc('sync_user_metadata', { 
        p_user_id: userId, 
        p_metadata: metadata 
      });
    
    if (error) {
      console.error('Error syncing user metadata:', error);
      return false;
    }
    
    return data;
  },

  // Lesson operations
  async updateLessonProgress(
    userId: string, 
    lessonId: string, 
    status: 'not_started' | 'in_progress' | 'completed',
    progressPercentage: number = 0
  ) {
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        status,
        progress_percentage: progressPercentage,
        last_accessed_at: new Date().toISOString(),
        completed_at: status === 'completed' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating lesson progress:', error);
      return null;
    }

    return data;
  },

  // Analytics operations
  async trackAnalytics(
    userId: string,
    eventType: string,
    eventData: Record<string, any> = {},
    pageUrl?: string
  ) {
    const { error } = await supabase
      .from('user_analytics')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        page_url: pageUrl,
        user_agent: navigator.userAgent,
        ip_address: null, // Será preenchido pelo backend
      });

    if (error) {
      console.error('Error tracking analytics:', error);
      return false;
    }

    return true;
  },

  // Plan operations
  async updateUserPlan(
    userId: string,
    planType: 'free' | 'premium' | 'enterprise',
    subscriptionId?: string
  ) {
    const { data, error } = await supabase
      .from('user_plans')
      .upsert({
        user_id: userId,
        plan_type: planType,
        status: 'active',
        stripe_subscription_id: subscriptionId,
        current_period_end: planType !== 'free' 
          ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 dias
          : null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating user plan:', error);
      return null;
    }

    return data;
  },
};

// Debug em desenvolvimento
if (env.IS_DEVELOPMENT) {
  console.log('=== SUPABASE CLIENT CONFIG ===');
  console.log('URL:', env.SUPABASE_URL);
  console.log('Headers configured');
  console.log('Schema: public');
}

export default supabase;
