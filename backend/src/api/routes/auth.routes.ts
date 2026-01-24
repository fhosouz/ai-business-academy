// Rotas de Autenticação - Controllers
import { Router } from 'express';
import { authService } from '../services/auth.service';

// Import do middleware JavaScript
const { authMiddleware } = require('../middleware/auth.middleware');

const router = Router();

// Login
router.post('/login', authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Register
router.post('/register', authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    await authService.logout(token);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Refresh Token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) {
      return res.status(400).json({ error: 'Refresh token required' });
    }
    
    const result = await authService.refreshToken(refresh_token);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
