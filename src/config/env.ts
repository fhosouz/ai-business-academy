// ========================================
// CONFIGURAÇÃO AMBIENTAL SEGURA
// ========================================

export const env = {
  // Supabase
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
  
  // Mercado Pago
  MERCADO_PAGO_PUBLIC_KEY: import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY,
  MERCADO_PAGO_ACCESS_TOKEN: import.meta.env.VITE_MERCADO_PAGO_ACCESS_TOKEN,
  
  // Backend URLs
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL,
  MERCADO_PAGO_CHECKOUT_URL: import.meta.env.VITE_MERCADO_PAGO_CHECKOUT_URL,
  
  // Analytics
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

// Validação de variáveis obrigatórias
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_MERCADO_PAGO_PUBLIC_KEY',
  'VITE_MERCADO_PAGO_CHECKOUT_URL'
] as const;

const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// Type safety para environment
export type Env = typeof env;
