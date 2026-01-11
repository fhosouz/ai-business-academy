// Hook Híbrido - Migração Segura
// Funciona com API Backend e Supabase direto (fallback)

import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { apiClient } from '@/lib/api';

interface UseAuthHybridReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  source: 'api' | 'supabase';
}

export function useAuthHybrid(): UseAuthHybridReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState<'api' | 'supabase'>('supabase');

  // Inicialização - tenta API primeiro, fallback para Supabase
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar obter sessão da API primeiro
      const token = localStorage.getItem('supabase_token');
      if (token) {
        try {
          // Validar token com API
          const response = await apiClient.healthCheck();
          if (response) {
            setSource('api');
            // Buscar dados do usuário da API
            const userData = await getCurrentUserFromAPI();
            if (userData) {
              setUser(userData);
              setLoading(false);
              return;
            }
          }
        } catch (apiError) {
          console.log('API não disponível, usando Supabase direto');
        }
      }

      // Fallback para Supabase direto
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session) {
        setSession(session);
        setUser(session.user);
        setSource('supabase');
      }
    } catch (err) {
      console.error('Erro na inicialização:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // Tentar login via API primeiro
      try {
        const response = await apiClient.login(email, password);
        
        // Salvar token
        localStorage.setItem('supabase_token', response.session.access_token);
        localStorage.setItem('supabase_refresh_token', response.session.refresh_token);
        
        setUser(response.user);
        setSource('api');
        
        console.log('✅ Login via API Backend');
        return;
      } catch (apiError) {
        console.log('API não disponível, usando Supabase direto');
      }

      // Fallback para Supabase direto
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      setSession(data.session);
      setUser(data.user);
      setSource('supabase');
      
      console.log('✅ Login via Supabase direto');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      setError(null);

      // Tentar registro via API primeiro
      try {
        const response = await apiClient.register(email, password, fullName);
        
        // Salvar token
        localStorage.setItem('supabase_token', response.session.access_token);
        localStorage.setItem('supabase_refresh_token', response.session.refresh_token);
        
        setUser(response.user);
        setSource('api');
        
        console.log('✅ Registro via API Backend');
        return;
      } catch (apiError) {
        console.log('API não disponível, usando Supabase direto');
      }

      // Fallback para Supabase direto
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      
      if (data.session) {
        setSession(data.session);
        setUser(data.user);
      }
      
      setSource('supabase');
      console.log('✅ Registro via Supabase direto');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro no registro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      if (source === 'api') {
        // Logout via API
        const token = localStorage.getItem('supabase_token');
        if (token) {
          await apiClient.logout();
        }
      } else {
        // Logout via Supabase
        await supabase.auth.signOut();
      }

      // Limpar dados locais
      localStorage.removeItem('supabase_token');
      localStorage.removeItem('supabase_refresh_token');
      setUser(null);
      setSession(null);
      setSource('supabase');
    } catch (err) {
      console.error('Erro no logout:', err);
    } finally {
      setLoading(false);
    }
  };

  // Escutar mudanças na sessão do Supabase
  useEffect(() => {
    if (source === 'supabase') {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === 'SIGNED_IN') {
            setSession(session);
            setUser(session?.user ?? null);
          } else if (event === 'SIGNED_OUT') {
            setSession(null);
            setUser(null);
          }
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [source]);

  return {
    user,
    session,
    loading,
    error,
    login,
    register,
    logout,
    source,
  };
}

// Helper function para obter usuário atual da API
async function getCurrentUserFromAPI(): Promise<User | null> {
  try {
    const token = localStorage.getItem('supabase_token');
    if (!token) return null;

    // Implementar endpoint /api/auth/me
    const response = await fetch('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}
