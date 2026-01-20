// ========================================
// CONFIGURAÇÃO COM VARIÁVEIS DE AMBIENTE - ARQUITETURA BACKEND
// ========================================

// Configuração do Supabase
const SUPABASE_CONFIG = {
  URL: "https://mphzlbyaxddcyvagcerf.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHpsYnlheGRkY3l2YWdjZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzU1MDIsImV4cCI6MjA3NzM1MTUwMn0.G-yYKMB5D_nImRkD65fbK4J_fjx7yX6uSxuOhPdymCk"
};

export const env = {
  // Supabase - usar variáveis do Netlify
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || SUPABASE_CONFIG.URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_CONFIG.ANON_KEY,
  
  // API URL - variável do Netlify
  VITE_API_URL: import.meta.env.VITE_API_URL || 'https://ai-business-academy-backend.onrender.com/api',
  
  // Analytics (opcional)
  GOOGLE_ANALYTICS_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
  
  // Flags
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD,
  
  // Rate Limiting
  RATE_LIMIT_REQUESTS: parseInt(import.meta.env.VITE_RATE_LIMIT_REQUESTS || '100'),
  RATE_LIMIT_WINDOW: parseInt(import.meta.env.VITE_RATE_LIMIT_WINDOW || '900000'), // 15 minutes
  
  // Cache
  CACHE_TTL: parseInt(import.meta.env.VITE_CACHE_TTL || '300'), // 5 minutes
  
  // Security
  CORS_ORIGINS: import.meta.env.VITE_CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  SESSION_TIMEOUT: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '3600000'), // 1 hour
} as const;

// Log de configuração
console.log('=== CONFIGURAÇÃO CARREGADA ===');
console.log('SUPABASE_URL:', env.SUPABASE_URL ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('SUPABASE_ANON_KEY:', env.SUPABASE_ANON_KEY ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('VITE_API_URL:', env.VITE_API_URL);
console.log('=== CONFIGURAÇÃO CONCLUÍDA ===');

// Type safety para environment
export type Env = typeof env;
