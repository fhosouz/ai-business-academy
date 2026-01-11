const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rotas (usando require para CommonJS)
const { authRoutes } = require('./routes/auth.routes');
const { coursesRoutes } = require('./routes/courses.routes');
const { paymentsRoutes } = require('./routes/payments.routes');
const { usersRoutes } = require('./routes/users.routes');
const { healthRoutes } = require('./routes/health.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configurado para Netlify + desenvolvimento
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://ai-business-academy.netlify.app',
    'http://localhost:5173',
    'https://localhost:5173',
    'https://ai-business-academy.netlify.app',
    'https://*.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
