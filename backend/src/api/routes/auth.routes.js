import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get current user (para frontend obter token)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authorization header required',
        error: 'MISSING_AUTH_HEADER'
      });
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        message: 'Invalid token',
        error: error?.message || 'USER_NOT_FOUND'
      });
    }

    // Obter sessão completa com access_token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return res.status(401).json({
        message: 'Session not found',
        error: sessionError?.message || 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      message: 'User retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata
        },
        session: {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at
        }
      }
    });
  } catch (error) {
    console.error('Error in /auth/me:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Login route
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Placeholder - implementar lógica real depois
  res.json({
    message: 'Login endpoint - placeholder',
    data: {
      email,
      timestamp: new Date().toISOString()
    },
    status: 'implemented',
    timestamp: new Date().toISOString()
  });
});

// Register route
router.post('/register', (req, res) => {
  const { email, password, fullName } = req.body;
  
  // Placeholder - implementar lógica real depois
  res.json({
    message: 'Register endpoint - placeholder',
    data: {
      email,
      fullName,
      timestamp: new Date().toISOString()
    },
    status: 'implemented',
    timestamp: new Date().toISOString()
  });
});

// Logout route
router.post('/logout', (req, res) => {
  // Placeholder - implementar lógica real depois
  res.json({
    message: 'Logout endpoint - placeholder',
    status: 'implemented',
    timestamp: new Date().toISOString()
  });
});

// Refresh token route
router.post('/refresh', (req, res) => {
  // Placeholder - implementar lógica real depois
  res.json({
    message: 'Refresh token endpoint - placeholder',
    status: 'implemented',
    timestamp: new Date().toISOString()
  });
});

export default router;
