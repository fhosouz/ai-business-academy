// ========================================
// CONFIGURAÇÃO AMBIENTAL SEGURA COM LOGS DETALHADOS
// ========================================

// Log detalhado para debug
console.log('=== ENVIRONMENT DEBUG START ===');
console.log('import.meta.env:', import.meta.env);
console.log('Available VITE_ variables:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

export const env = {
  // Supabase
  SUPABASE_URL: (() => {
    const value = import.meta.env.VITE_SUPABASE_URL;
    console.log('VITE_SUPABASE_URL:', value ? '✅ FOUND' : '❌ MISSING');
    console.log('VITE_SUPABASE_URL value:', value);
    return value;
  })(),
  SUPABASE_ANON_KEY: (() => {
    const value = import.meta.env.VITE_SUPABASE_ANON_KEY;
    console.log('VITE_SUPABASE_ANON_KEY:', value ? '✅ FOUND' : '❌ MISSING');
    console.log('VITE_SUPABASE_ANON_KEY value:', value ? `${value.substring(0, 20)}...` : 'undefined');
    return value;
  })(),
  
  // Mercado Pago
  MERCADO_PAGO_PUBLIC_KEY: (() => {
    const value = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
    console.log('VITE_MERCADO_PAGO_PUBLIC_KEY:', value ? '✅ FOUND' : '❌ MISSING');
    console.log('VITE_MERCADO_PAGO_PUBLIC_KEY value:', value);
    return value;
  })(),
  
  // Mercado Pago Checkout URL
  MERCADO_PAGO_CHECKOUT_URL: (() => {
    const value = import.meta.env.VITE_MERCADO_PAGO_CHECKOUT_URL;
    console.log('VITE_MERCADO_PAGO_CHECKOUT_URL:', value ? '✅ FOUND' : '❌ MISSING');
    console.log('VITE_MERCADO_PAGO_CHECKOUT_URL value:', value);
    return value;
  })(),
  
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

console.log('Required variables:', requiredEnvVars);
console.log('Checking each required variable...');

const missingVars = requiredEnvVars.filter(varName => {
  const exists = !!import.meta.env[varName];
  console.log(`${varName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
  return !exists;
});

console.log('Missing variables:', missingVars);
console.log('Missing variables count:', missingVars.length);

if (missingVars.length > 0) {
  console.error('=== ENVIRONMENT ERROR ===');
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('Available environment variables:', Object.keys(import.meta.env));
  console.error('=== ENVIRONMENT ERROR END ===');
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

console.log('=== ENVIRONMENT DEBUG END ===');
console.log('All required variables found successfully!');

// Type safety para environment
export type Env = typeof env;
