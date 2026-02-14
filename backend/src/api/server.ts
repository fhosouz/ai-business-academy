import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { paymentsRoutes } from './routes/payments.routes';

// Carregar variáveis de ambiente do backend
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configuração segura do Supabase no backend
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Middlewares
app.use(cors({
  origin: [
    'https://automatizeai-academy.netlify.app', 
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Usar routes de pagamentos
app.use('/api/payments', paymentsRoutes);

type DbFilterOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';

type DbQueryPayload = {
  table: string;
  action: 'select' | 'insert' | 'update' | 'upsert' | 'delete' | 'rpc';
  select?: string;
  filters?: Array<{ column: string; op: DbFilterOp; value: any }>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
  maybeSingle?: boolean;
  payload?: any;
  upsert?: { onConflict?: string };
  rpc?: { fn: string; args?: Record<string, any> };
};

async function getUserFromRequest(req: express.Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { user: null as any, token: null as string | null, error: 'MISSING_AUTH_HEADER' };
  }
  const token = authHeader.slice('Bearer '.length).trim();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    return { user: null as any, token, error: 'INVALID_TOKEN' };
  }
  return { user: data.user, token, error: null as string | null };
}

function applyFilters(query: any, filters: DbQueryPayload['filters']) {
  if (!filters || !Array.isArray(filters)) return query;
  for (const f of filters) {
    if (!f?.column || !f?.op) continue;
    switch (f.op) {
      case 'eq':
        query = query.eq(f.column, f.value);
        break;
      case 'neq':
        query = query.neq(f.column, f.value);
        break;
      case 'gt':
        query = query.gt(f.column, f.value);
        break;
      case 'gte':
        query = query.gte(f.column, f.value);
        break;
      case 'lt':
        query = query.lt(f.column, f.value);
        break;
      case 'lte':
        query = query.lte(f.column, f.value);
        break;
      case 'like':
        query = query.like(f.column, f.value);
        break;
      case 'ilike':
        query = query.ilike(f.column, f.value);
        break;
      case 'in':
        query = query.in(f.column, f.value);
        break;
    }
  }
  return query;
}

function enforceUserScope(payload: DbQueryPayload, userId: string) {
  const scopedTables = new Set([
    'user_profiles',
    'user_plans',
    'user_roles',
    'user_lesson_progress',
    'payments',
  ]);

  const publicTables = new Set([
    'courses',
    'categories',
    'lessons',
    'articles',
  ]);

  // Se for uma tabela pública, não aplicar scope de usuário
  if (publicTables.has(payload.table)) return payload;

  if (!scopedTables.has(payload.table)) return payload;

  const filters = Array.isArray(payload.filters) ? [...payload.filters] : [];
  const userIdFilter = filters.find((f) => f?.column === 'user_id' && f?.op === 'eq');
  if (userIdFilter && userIdFilter.value !== userId) {
    throw new Error('USER_SCOPE_VIOLATION');
  }
  if (!userIdFilter) {
    filters.push({ column: 'user_id', op: 'eq', value: userId });
  }
  return { ...payload, filters };
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get current user (frontend auth context)
app.get('/api/auth/me', async (req, res) => {
  try {
    const { user, error } = await getUserFromRequest(req);
    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized', error });
    }
    return res.json({
      message: 'User retrieved successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        },
      },
    });
  } catch (e: any) {
    return res.status(500).json({ message: 'Internal server error', error: e?.message });
  }
});

// Autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user, session: data.session, token: data.session?.access_token || null });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ user: data.user, session: data.session, token: data.session?.access_token || null });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth - GET para iniciar fluxo OAuth seguro
app.get('/api/auth/google', async (req, res) => {
  try {
    console.log('🔐 OAuth Init - Request received');
    console.log('🔐 OAuth Init - Headers:', req.headers);
    console.log('🔐 OAuth Init - Query params:', req.query);
    
    // Gerar state CSRF para segurança
    const state = Math.random().toString(36).substring(2, 15);
    
    console.log('🔐 OAuth Init - Generated state:', state);
    
    // Armazenar state em cookie (simples e seguro)
    res.cookie('oauth_state', state, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600000, // 10 minutos
      sameSite: 'lax'
    });
    
    const frontendUrl = process.env.FRONTEND_URL || 'https://automatizeai-academy.netlify.app';
    const redirectUri = `${frontendUrl}/auth/callback`;
    
    console.log('🌐 OAuth Init - Frontend URL:', frontendUrl);
    console.log('🔄 OAuth Init - Redirect URI:', redirectUri);
    console.log('🔧 OAuth Init - Supabase URL:', process.env.SUPABASE_URL);
    
    // Usar Supabase client para gerar URL OAuth (mais seguro)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: {
          state: state
        }
      }
    });
    
    if (error) {
      console.error('❌ OAuth URL generation error:', error);
      return res.status(500).json({ error: 'Failed to generate OAuth URL', details: error.message });
    }
    
    console.log('✅ OAuth Init - Generated URL:', data.url);
    
    // Redirecionar para URL gerada pelo Supabase
    res.redirect(data.url);
  } catch (error) {
    console.error('❌ OAuth init error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth', details: error.message });
  }
});

// Google OAuth Callback - POST para processar token
app.post('/api/auth/google', async (req, res) => {
  try {
    console.log('🔄 OAuth Callback - Request received');
    console.log('🔄 OAuth Callback - Headers:', req.headers);
    console.log('🔄 OAuth Callback - Body:', req.body);
    
    const { code, state } = req.body;
    
    console.log('🔄 OAuth Callback - Received code:', !!code);
    console.log('🔄 OAuth Callback - Received state:', state);
    console.log('🍪 OAuth Callback - Stored state:', req.cookies?.oauth_state);
    
    if (!code) {
      console.error('❌ OAuth Callback - No code received');
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    // Validar CSRF state do cookie
    const storedState = req.cookies?.oauth_state;
    if (!state || !storedState || state !== storedState) {
      console.error('❌ OAuth Callback - Invalid state mismatch');
      console.error('Expected state:', storedState);
      console.error('Received state:', state);
      return res.status(400).json({ error: 'Invalid OAuth state' });
    }
    
    // Limpar cookie após validação
    res.clearCookie('oauth_state');
    
    console.log('✅ OAuth Callback - State validated, exchanging code...');
    
    // Trocar code por tokens com Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ OAuth Callback - Code exchange error:', error);
      return res.status(400).json({ error: error.message, details: error });
    }
    
    console.log('✅ OAuth Callback - Code exchange successful');
    console.log('👤 OAuth Callback - User ID:', data.user?.id);
    console.log('📧 OAuth Callback - User email:', data.user?.email);
    
    // Buscar/criar perfil do usuário
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user?.id)
      .single();
    
    if (!profile) {
      console.log('👤 OAuth Callback - Creating new user profile...');
      // Criar perfil inicial
      const { data: newProfile } = await supabase
        .from('user_profiles')
        .insert({
          user_id: data.user!.id,
          full_name: data.user?.user_metadata?.full_name || data.user?.email?.split('@')[0],
          role: 'user',
          plan: 'free',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      profile = newProfile;
      console.log('✅ OAuth Callback - Profile created:', profile);
    } else {
      console.log('👤 OAuth Callback - Existing profile found:', profile);
    }
    
    const responseData = {
      user: {
        id: data.user?.id,
        email: data.user?.email,
        full_name: profile?.full_name || data.user?.user_metadata?.full_name,
        avatar_url: data.user?.user_metadata?.avatar_url,
        role: profile?.role || 'user',
        plan: profile?.plan || 'free'
      },
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    };
    
    console.log('✅ OAuth Callback - Sending response to frontend');
    res.json(responseData);
  } catch (error) {
    console.error('❌ OAuth Callback error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Generic DB endpoint (used by frontend supabase shim)
app.post('/api/db/query', async (req, res) => {
  try {
    const { user, error } = await getUserFromRequest(req);
    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized', code: error });
    }

    const body = req.body as DbQueryPayload;
    if (!body?.table || !body?.action) {
      return res.status(400).json({ error: 'Missing table/action' });
    }

    const safeBody = enforceUserScope(body, user.id);

    const allowedActions = new Set(['select', 'insert', 'update', 'upsert', 'delete', 'rpc']);
    if (!allowedActions.has(safeBody.action)) {
      return res.status(400).json({ error: 'Unsupported action' });
    }

    let query: any;

    if (safeBody.action === 'rpc') {
      if (!safeBody.rpc?.fn) {
        return res.status(400).json({ error: 'Missing rpc.fn' });
      }
      const { data, error: rpcError } = await supabase.rpc(safeBody.rpc.fn, safeBody.rpc.args || {});
      return res.json({ data, error: rpcError || null });
    }

    if (safeBody.action === 'select') {
      query = supabase.from(safeBody.table).select(safeBody.select || '*');
      query = applyFilters(query, safeBody.filters);
      if (safeBody.order?.column) {
        query = query.order(safeBody.order.column, { ascending: safeBody.order.ascending !== false });
      }
      if (typeof safeBody.limit === 'number') {
        query = query.limit(safeBody.limit);
      }
      if (safeBody.single) {
        query = query.single();
      } else if (safeBody.maybeSingle) {
        query = query.maybeSingle();
      }
      const { data, error: qError } = await query;
      return res.json({ data, error: qError || null });
    }

    if (safeBody.action === 'insert') {
      query = supabase.from(safeBody.table).insert(safeBody.payload);
      const { data, error: qError } = await query;
      return res.json({ data, error: qError || null });
    }

    if (safeBody.action === 'update') {
      query = supabase.from(safeBody.table).update(safeBody.payload);
      query = applyFilters(query, safeBody.filters);
      const { data, error: qError } = await query;
      return res.json({ data, error: qError || null });
    }

    if (safeBody.action === 'upsert') {
      query = supabase
        .from(safeBody.table)
        .upsert(
          safeBody.payload,
          safeBody.upsert?.onConflict ? { onConflict: safeBody.upsert.onConflict } : undefined
        );
      const { data, error: qError } = await query;
      return res.json({ data, error: qError || null });
    }

    if (safeBody.action === 'delete') {
      query = supabase.from(safeBody.table).delete();
      query = applyFilters(query, safeBody.filters);
      const { data, error: qError } = await query;
      return res.json({ data, error: qError || null });
    }

    return res.status(400).json({ error: 'Unhandled action' });
  } catch (e: any) {
    const message = e?.message || 'Internal server error';
    const status = message === 'USER_SCOPE_VIOLATION' ? 403 : 500;
    return res.status(status).json({ error: message });
  }
});

// Cursos
app.get('/api/courses', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_published', true);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Usuários - Perfil
app.get('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json(data || null);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/users/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Usuários - Progresso
app.get('/api/users/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Buscar progresso do usuário em todas as lições
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .select(`
        *,
        lessons(id, title, course_id, courses(title, category_id))
      `)
      .eq('user_id', userId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Calcular estatísticas
    const totalLessons = data?.length || 0;
    const completedLessons = data?.filter(lesson => lesson.completed).length || 0;
    const totalTime = data?.reduce((acc, lesson) => acc + (lesson.time_spent || 0), 0) || 0;

    res.json({
      progress: data || [],
      stats: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        completion_rate: totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0,
        total_time_spent: totalTime
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users/:userId/progress/:lessonId', async (req, res) => {
  try {
    const { userId, lessonId } = req.params;
    const progressData = req.body;
    
    const { data, error } = await supabase
      .from('user_lesson_progress')
      .upsert({
        user_id: userId,
        lesson_id: lessonId,
        ...progressData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
