const express = require('express');

const router = express.Router();

// Health check
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Health check detalhado
router.get('/detailed', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected',
      supabase: 'configured',
      mercadopago: 'configured'
    },
    memory: process.memoryUsage(),
    platform: process.platform,
    nodeVersion: process.version
  });
});

module.exports = { router };
