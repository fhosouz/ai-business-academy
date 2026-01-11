// ========================================
// SUPABASE CLIENT V3 - VERSÃO FINAL OTIMIZADA COM VALIDAÇÃO
// ========================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Validação crítica de variáveis de ambiente
console.log('=== SUPABASE CLIENT V3 DEBUG START ===');
console.log('import.meta.env:', import.meta.env);
console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ FOUND' : '❌ MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ FOUND' : '❌ MISSING');
console.log('VITE_SUPABASE_SERVICE_ROLE_KEY:', import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ? '✅ FOUND' : '❌ MISSING');

// Validar variáveis críticas
const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  console.error('=== SUPABASE CLIENT V3 ERROR ===');
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Available variables:', Object.keys(import.meta.env));
  console.error('=== SUPABASE CLIENT V3 ERROR END ===');
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

console.log('=== SUPABASE CLIENT V3 DEBUG END ===');
console.log('All required variables found!');

// Configuração robusta e otimizada
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    detectSessionInUrl: true,
    flow: 'implicit' as const,
    debug: import.meta.env.DEV,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
  },
  db: {
    schema: 'public' as const,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
};

// Client principal
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  supabaseConfig
);

// Client admin (para operações privilegiadas)
export const supabaseAdmin = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  {
    ...supabaseConfig,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Helper functions tipadas e robustas
export const supabaseHelpers = {
  // User operations
  async getUserPlan(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_plan', { p_user_id: userId });
      
      if (error) {
        console.error('Error getting user plan:', error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Exception in getUserPlan:', error);
      return null;
    }
  },

  async getUserProgress(userId: string) {
    try {
      const { data, error } = await supabase
        .rpc('get_user_progress', { p_user_id: userId });
      
      if (error) {
        console.error('Error getting user progress:', error);
        return null;
      }
      
      return data?.[0] || null;
    } catch (error) {
      console.error('Exception in getUserProgress:', error);
      return null;
    }
  },

  async syncUserMetadata(userId: string, metadata: Record<string, any>) {
    try {
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
    } catch (error) {
      console.error('Exception in syncUserMetadata:', error);
      return false;
    }
  },

  // Lesson operations
  async updateLessonProgress(
    userId: string, 
    lessonId: string, 
    status: 'not_started' | 'in_progress' | 'completed',
    progressPercentage: number = 0
  ) {
    try {
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
    } catch (error) {
      console.error('Exception in updateLessonProgress:', error);
      return null;
    }
  },

  // Analytics operations
  async trackAnalytics(
    userId: string,
    eventType: string,
    eventData: Record<string, any> = {},
    pageUrl?: string
  ) {
    try {
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
    } catch (error) {
      console.error('Exception in trackAnalytics:', error);
      return false;
    }
  },

  // Plan operations
  async updateUserPlan(
    userId: string,
    planType: 'free' | 'premium' | 'enterprise',
    subscriptionId?: string
  ) {
    try {
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
    } catch (error) {
      console.error('Exception in updateUserPlan:', error);
      return null;
    }
  },

  // Profile operations
  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error getting user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in getUserProfile:', error);
      return null;
    }
  },

  async updateUserProfile(userId: string, updates: Partial<{
    full_name: string;
    avatar_url: string;
    phone: string;
    bio: string;
  }>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Exception in updateUserProfile:', error);
      return null;
    }
  },

  // Health check
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('migration_log')
        .select('status, created_at')
        .eq('phase', 'completion')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error in health check:', error);
        return { status: 'error', message: error.message };
      }

      const lastMigration = data?.[0];
      return {
        status: lastMigration?.status || 'unknown',
        lastMigration: lastMigration?.created_at,
        database: 'connected'
      };
    } catch (error) {
      console.error('Exception in health check:', error);
      return { status: 'error', message: 'Database connection failed' };
    }
  }
};

// Debug em desenvolvimento
if (import.meta.env.DEV) {
  console.log('=== SUPABASE CLIENT V3 CONFIG ===');
  console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Schema: public');
  console.log('Headers configured');
  console.log('RPC functions available');
}

export default supabase;
