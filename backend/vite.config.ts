import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
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
    // Forçar cache busting para evitar bundle antigo
    build: {
      rollupOptions: {
        output: {
          // Forçar nome diferente do bundle
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          manualChunks: undefined,
        },
      },
      // Forçar limpeza de cache
      minify: 'terser',
    },
    // Forçar versão no bundle
    define: {
      __APP_VERSION__: JSON.stringify(`v${Date.now()}`),
    },
  };
});
