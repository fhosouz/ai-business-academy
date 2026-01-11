// Configuração CORS para Netlify + Render
import express from 'express';
import cors from 'cors';

const app = express();

// CORS configurado para Netlify
const corsOptions = {
  origin: [
    'https://seu-app.netlify.app',
    'http://localhost:5173', // Desenvolvimento
    'https://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware para debug de CORS
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  next();
});

// Preflight handling
app.options('*', cors(corsOptions));

export default app;
