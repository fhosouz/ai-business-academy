// ========================================
// CONFIGURAÇÃO DIRETA - SEM VARIÁVEIS DE AMBIENTE
// ========================================

// Configuração direta das variáveis críticas
const SUPABASE_CONFIG = {
  URL: "https://mphzlbyaxddcyvagcerf.supabase.co",
  ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHpsYnlheGRkY3l2YWdjZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzU1MDIsImV4cCI6MjA3NzM1MTUwMn0.G-yYKMB5D_nImRkD65fbK4J_fjx7yX6uSxuOhPdymCk"
};

const MERCADO_PAGO_CONFIG = {
  PUBLIC_KEY: "APP_USR-b9564790-a955-4d0b-8475-4770dc972a0d",
  CHECKOUT_URL: "https://api.mercadopago.com/checkout/preferences"
};

export const env = {
  // Supabase - configuração direta
  SUPABASE_URL: SUPABASE_CONFIG.URL,
  SUPABASE_ANON_KEY: SUPABASE_CONFIG.ANON_KEY,
  
  // Mercado Pago - configuração direta
  MERCADO_PAGO_PUBLIC_KEY: MERCADO_PAGO_CONFIG.PUBLIC_KEY,
  MERCADO_PAGO_CHECKOUT_URL: MERCADO_PAGO_CONFIG.CHECKOUT_URL,
  
  // Analytics (opcional, pode ficar undefined)
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

// Log de sucesso
console.log('=== CONFIGURAÇÃO DIRETA CARREGADA ===');
console.log('SUPABASE_URL:', SUPABASE_CONFIG.URL ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('SUPABASE_ANON_KEY:', SUPABASE_CONFIG.ANON_KEY ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('MERCADO_PAGO_PUBLIC_KEY:', MERCADO_PAGO_CONFIG.PUBLIC_KEY ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('MERCADO_PAGO_CHECKOUT_URL:', MERCADO_PAGO_CONFIG.CHECKOUT_URL ? '✅ CONFIGURADO' : '❌ ERRO');
console.log('=== CONFIGURAÇÃO DIRETA CONCLUÍDA ===');

// Type safety para environment
export type Env = typeof env;
