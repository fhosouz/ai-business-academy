# Backend Node.js Application

## API Server for AI Business Academy

### Dependencies
- Express.js
- TypeScript
- Mercado Pago Integration
- Supabase Integration

### Setup
```bash
npm install
npm run build
npm start
```

### Environment Variables
- SUPABASE_URL
- SUPABASE_ANON_KEY
- MERCADO_PAGO_ACCESS_TOKEN

### API Endpoints
- POST /api/mercadopago/create-preference
- GET /api/mercadopago/success
- GET /api/mercadopago/failure
