import { createClient } from '@supabase/supabase-js';

// Configurar Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware de autenticação para proteger rotas
const authMiddleware = async (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE ===');
  console.log('Request headers:', req.headers);
  console.log('Authorization header:', req.headers.authorization);
  
  try {
    // Extrair token do header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header found');
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    console.log('Token extracted:', token ? 'EXISTS' : 'MISSING');
    
    // Verificar token com Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Invalid token or user not found:', error);
      req.user = null;
      return next();
    }

    console.log('User authenticated successfully:', user.id);
    console.log('User email:', user.email);
    
    // Adicionar usuário ao request
    req.user = user;
    req.session = { access_token: token };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    req.user = null;
    next();
  }
};

export default authMiddleware;
