import express from 'express';

const router = express.Router();

// Basic health check
router.get('/', (req, res) => {
  res.json({
    message: 'Backend API is running',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  res.json({
    message: 'Backend API detailed health check',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected',
      supabase: 'connected',
      mercadopago: 'connected'
    }
  });
});

export default router;
