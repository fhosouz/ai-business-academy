import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// Importar rotas (ES modules)
import authRoutes from './routes/auth.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import usersRoutes from './routes/users.routes.js';
import healthRoutes from './routes/health.routes.js';
import mercadopagoRoutes from './routes/mercadopago.routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configurado para Netlify + desenvolvimento
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://automatizeai-academy.netlify.app',
    'http://localhost:5173',
    'https://localhost:5173',
    'https://automatizeai-academy.netlify.app',
    'https://ai-business-academy.netlify.app' // URL alternativa
  ],
  credentials: false, // Desabilitar credentials para evitar erro com wildcard
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200,
};

// Middlewares globais
app.use(cors(corsOptions));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// Preflight handling
app.options('*', cors(corsOptions));

// Rotas modulares
app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/mercadopago', mercadopagoRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'https://ai-business-academy.netlify.app'}`);
  console.log(`🌐 CORS Origins:`, corsOptions.origin);
});

export default app;
