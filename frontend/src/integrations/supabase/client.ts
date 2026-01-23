// ========================================
// SUPABASE CLIENT - CONFIGURAÇÃO DIRETA (FRONTEND)
// ========================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Configuração direta - sem variáveis de ambiente
const SUPABASE_CONFIG = {
  URL: "https://mphzlbyaxddcyvagcerf.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHpsYnlheGRkY3l2YWdjZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzU1MDIsImV4cCI6MjA3NzM1MTUwMn0.G-yYKMB5D_nImRkD65fbK4J_fjx7yX6uSxuOhPdymCk"
};

// Log de configuração
console.log('=== SUPABASE CLIENT CONFIG DIRETA (FRONTEND) ===');
console.log('URL:', SUPABASE_CONFIG.URL ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('ANON_KEY:', SUPABASE_CONFIG.ANON_KEY ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('=== SUPABASE CLIENT CONFIG CONCLUÍDA ===');

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'apikey': SUPABASE_CONFIG.ANON_KEY
    }
  },
  db: {
    schema: 'public'
  }
});

export default supabase;
