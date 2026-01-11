import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Debug no build time
  console.log('=== VITE CONFIG DEBUG START ===');
  console.log('Mode:', mode);
  console.log('Process env:', Object.keys(process.env).filter(key => key.includes('SUPABASE') || key.includes('MERCADO')));
  console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ FOUND' : '❌ MISSING');
  console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ FOUND' : '❌ MISSING');
  console.log('VITE_MERCADO_PAGO_PUBLIC_KEY:', process.env.VITE_MERCADO_PAGO_PUBLIC_KEY ? '✅ FOUND' : '❌ MISSING');
  console.log('=== VITE CONFIG DEBUG END ===');

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Forçar exposição de variáveis de ambiente
    envPrefix: 'VITE_',
    // Forçar substituição manual das variáveis
    define: {
      // Substituir manualmente as variáveis críticas
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(process.env.VITE_SUPABASE_URL || ''),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || ''),
      'import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY': JSON.stringify(process.env.VITE_MERCADO_PAGO_PUBLIC_KEY || ''),
      'import.meta.env.VITE_MERCADO_PAGO_CHECKOUT_URL': JSON.stringify(process.env.VITE_MERCADO_PAGO_CHECKOUT_URL || ''),
      // Debug para verificar variáveis
      __APP_ENV__: JSON.stringify(process.env),
    },
    build: {
      // Garantir que variáveis sejam substituídas
      rollupOptions: {
        output: {
          manualChunks: undefined,
        },
      },
    },
  };
});
