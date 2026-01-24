// Supabase shim (frontend)
//
// This file exists ONLY to preserve existing frontend code structure after the
// reorganization, while enforcing the 3-layer architecture:
// Frontend -> Backend API -> Database.
//
// It implements a minimal subset of the Supabase query builder used in the UI.
// Every operation is forwarded to the backend endpoint `/api/db/query`.

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

function getAuthTokenFromStorage(): string | null {
  // Primary: token saved by our frontend AuthContext after /api/auth/login
  const direct = localStorage.getItem('auth_token');
  if (direct) return direct;

  // Fallback: Supabase standard localStorage key sb-<projectref>-auth-token
  try {
    const keys = Object.keys(localStorage);
    const sbKey = keys.find((k) => k.startsWith('sb-') && k.endsWith('-auth-token'));
    if (!sbKey) return null;
    const raw = localStorage.getItem(sbKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.access_token || null;
  } catch {
    return null;
  }
}

async function callDb(payload: DbQueryPayload) {
  const token = getAuthTokenFromStorage();
  const res = await fetch('/api/db/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { data: null, error: json?.error || json?.message || 'DB_QUERY_FAILED' };
  }

  return { data: json?.data ?? null, error: json?.error ?? null };
}

class QueryBuilder {
  private payload: DbQueryPayload;

  constructor(table: string, action: DbQueryPayload['action']) {
    this.payload = { table, action, filters: [] };
  }

  select(columns: string = '*') {
    this.payload.action = 'select';
    this.payload.select = columns;
    return this;
  }

  insert(payload: any) {
    this.payload.action = 'insert';
    this.payload.payload = payload;
    return this;
  }

  update(payload: any) {
    this.payload.action = 'update';
    this.payload.payload = payload;
    return this;
  }

  upsert(payload: any, options?: { onConflict?: string }) {
    this.payload.action = 'upsert';
    this.payload.payload = payload;
    this.payload.upsert = options;
    return this;
  }

  delete() {
    this.payload.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'neq', value });
    return this;
  }

  gt(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'gt', value });
    return this;
  }

  gte(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'gte', value });
    return this;
  }

  lt(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'lt', value });
    return this;
  }

  lte(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'lte', value });
    return this;
  }

  like(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'like', value });
    return this;
  }

  ilike(column: string, value: any) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'ilike', value });
    return this;
  }

  in(column: string, value: any[]) {
    this.payload.filters = this.payload.filters || [];
    this.payload.filters.push({ column, op: 'in', value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.payload.order = { column, ascending: options?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.payload.limit = count;
    return this;
  }

  single() {
    this.payload.single = true;
    this.payload.maybeSingle = false;
    return this;
  }

  maybeSingle() {
    this.payload.maybeSingle = true;
    this.payload.single = false;
    return this;
  }

  async then(resolve: any, reject?: any) {
    try {
      const result = await callDb(this.payload);
      return resolve(result);
    } catch (e) {
      if (reject) return reject(e);
      throw e;
    }
  }
}

export const supabase = {
  from(table: string) {
    // default to select builder; caller can change action via insert/update/upsert/delete
    return new QueryBuilder(table, 'select');
  },
  rpc(fn: string, args?: Record<string, any>) {
    return callDb({ table: '__rpc__', action: 'rpc', rpc: { fn, args } });
  },
  auth: {
    // Auth is handled by backend; keep minimal API so code doesn't crash if referenced.
    async getSession() {
      const token = getAuthTokenFromStorage();
      return { data: { session: token ? { access_token: token } : null }, error: null };
    },
    async signOut() {
      localStorage.removeItem('auth_token');
      return { error: null };
    },
  },
};
