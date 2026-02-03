import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

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
app.use(cors());
app.use(express.json());

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
    // Gerar state CSRF para segurança
    const state = Math.random().toString(36).substring(2, 15);
    
    // Armazenar state em cookie (simples e seguro)
    res.cookie('oauth_state', state, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600000 // 10 minutos
    });
    
    const supabaseUrl = process.env.SUPABASE_URL!;
    const redirectUri = `${process.env.FRONTEND_URL || 'https://automatizeai-academy.netlify.app'}/auth/callback`;
    
    // URL OAuth do Supabase com parâmetros seguros
    const authUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectUri)}&client_id=supabase&response_type=code&state=${state}`;
    
    // Redirecionar diretamente (mais seguro que retornar URL)
    res.redirect(authUrl);
  } catch (error) {
    console.error('OAuth init error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth' });
  }
});

// Google OAuth Callback - POST para processar token
app.post('/api/auth/google', async (req, res) => {
  try {
    const { code, state } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Authorization code is required' });
    }
    
    // Trocar code por tokens com Supabase
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    // Buscar/criar perfil do usuário
    let { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', data.user?.id)
      .single();
    
    if (!profile) {
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
    }
    
    res.json({
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
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Internal server error' });
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

// Pagamentos (Mercado Pago)
app.post('/api/payments/create-preference', async (req, res) => {
  try {
    const { items, userId } = req.body;
    
    // Integração com Mercado Pago no backend
    const preference = {
      items,
      back_urls: {
        success: `${process.env.FRONTEND_URL}/payment/success`,
        failure: `${process.env.FRONTEND_URL}/payment/failure`,
        pending: `${process.env.FRONTEND_URL}/payment/pending`,
      },
      auto_return: 'approved',
    };

    // Aqui você faria a integração real com Mercado Pago
    // Por enquanto, retornamos uma simulação
    res.json({
      id: 'preference_' + Date.now(),
      init_point: 'https://www.mercadopago.com.br/checkout/v1/redirect',
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
});
