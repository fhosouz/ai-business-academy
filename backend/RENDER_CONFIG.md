# CONFIGURAÇÃO RENDER - BACKEND API

## 🚀 Variáveis de Ambiente (Render Dashboard)

### 🔐 Supabase (Backend)
```
SUPABASE_URL=https://mphzlbyaxddcyvagcerf.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1waHpsYnlheGRkY3l2YWdjZXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3NTUwMiwiZXhwIjoyMDc3MzUxNTAyfQ.pQ2x5x8ZJZ_xk_yJg8U2xJr8sZK6H7n8X2xY4xY4xY4
```

### 💳 Mercado Pago (Backend)
```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-b9564790-a955-4d0b-8475-4770dc972a0d
MERCADOPAGO_WEBHOOK_SECRET=WEBHOOK_SECRET_KEY
```

### ⚙️ Servidor
```
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://seu-app.netlify.app
```

## 📋 Build Command
```
npm install
npm run build
```

## 📋 Start Command
```
npm run server
```

## 🔧 Health Check
```
https://seu-backend.onrender.com/api/health
```

---

## ✅ VERIFICAÇÃO PÓS-DEPLOY

1. **Health Check:**
   ```bash
   curl https://seu-backend.onrender.com/api/health
   ```

2. **Teste API:**
   ```bash
   curl -X POST https://seu-backend.onrender.com/api/health \
   -H "Content-Type: application/json"
   ```

3. **Logs no Render:**
   - Dashboard → Services → Backend → Logs
