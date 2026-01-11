# CONFIGURAÇÃO NETLIFY - FRONTEND

## 🚀 Variáveis de Ambiente (Netlify Dashboard)

### 🔗 API Backend
```bash
VITE_API_URL=https://ai-business-academy-api.onrender.com/api
```

### 🔐 Supabase (Frontend - Apenas URL)
```bash
VITE_SUPABASE_URL=https://mphzlbyaxddcyvagcerf.supabase.co
VITE_SUPABASE_PROJECT_ID=mphzlbyaxddcyvagcerf
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHpsYnlheGRkY3l2YWdjZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzU1MDIsImV4cCI6MjA3NzM1MTUwMn0.G-yYKMB5D_nImRkD65fbK4J_fjx7yX6uSxuOhPdymCk
```

### 🔑 Supabase ANON_KEY (Frontend - Apenas para leitura)
```bash
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHpsYnlheGRkY3l2YWdjZXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3NzU1MDIsImV4cCI6MjA3NzM1MTUwMn0.G-yYKMB5D_nImRkD65fbK4J_fjx7yX6uSxuOhPdymCk
```

### 💳 Mercado Pago (Frontend)
```bash
VITE_MERCADO_PAGO_CHECKOUT_URL=https://api.mercadopago.com/checkout/preferences
VITE_MERCADO_PAGO_PUBLIC_KEY=APP_USR-b9564790-a955-4d0b-8475-4770dc972a0d
```

## 📋 Build Command
```bash
npm install
npm run build
```

## 📋 Publish Directory
```
backend/dist
```

## 🔧 Redirects (netlify.toml)
```toml
[[redirects]]
  from = "/api/*"
  to = "https://ai-business-academy-api.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## ✅ VERIFICAÇÃO PÓS-DEPLOY

1. **Health Check Frontend:**
   ```bash
   curl https://seu-app.netlify.app/api/health
   ```

2. **Console Browser:**
   - F12 → Console
   - Verificar: "✅ Login via API Backend"

3. **Network Tab:**
   - F12 → Network
   - Verificar requisições para /api/*

---

## 🔄 COMUNICAÇÃO FRONTEND ↔ BACKEND

### ✅ Fluxo Normal:
```
Frontend (Netlify)
    ↓ HTTPS Request
Backend (Render)
    ↓ Supabase Client
Supabase (Database)
```

### ✅ Fallback:
```
Frontend (Netlify)
    ↓ Supabase Direto
Supabase (Database)
```

---

## 📊 MONITORAMENTO

### Frontend (Netlify):
- Dashboard → Sites → Seu-app → Overview
- Functions: Logs (se usar)
- Deploy logs

### Backend (Render):
- Dashboard → Services → Backend → Logs
- Metrics: Performance
- Health checks

### Supabase:
- Dashboard → Project → Logs
- Database: Queries
- Auth: Sign-ins
