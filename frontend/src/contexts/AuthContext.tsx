import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// Verificação de configuração
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Configuração do Supabase não encontrada');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função de limpeza completa de sessão
  const clearAllAuthData = async () => {
    console.log('=== CLEARING ALL AUTH DATA ===');
    
    try {
      // Limpar Supabase sessão
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.log('Supabase signOut error (expected):', error);
    }
    
    // Limpar storage local
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    sessionStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.refreshToken');
    
    // Limpar cookies relacionados ao Supabase
    document.cookie.split(";").forEach(c => {
      const trimmedCookie = c.trim();
      if (trimmedCookie.startsWith('supabase.auth.') || trimmedCookie.startsWith('sb-')) {
        document.cookie = trimmedCookie + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
    
    console.log('All auth data cleared');
  };

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('=== AUTH INITIALIZATION START ===');
      
      try {
        // Verificar sessão via Supabase
        await checkAuthStatus();

        // Escutar mudanças na autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('=== SUPABASE AUTH STATE CHANGE ===');
            console.log('Event:', event);
            console.log('Session exists:', !!session);
            
            if (event === 'SIGNED_OUT') {
              // Limpeza completa ao sair
              await clearAllAuthData();
              setUser(null);
              setLoading(false);
              return;
            }
            
            if (session?.user) {
              console.log('User authenticated:', session.user.email);
              setUser({
                id: session.user.id,
                email: session.user.email!,
                user_metadata: session.user.user_metadata
              });
              
              // Armazenar token para compatibilidade
              if (session.access_token) {
                localStorage.setItem('auth_token', session.access_token);
              }
            } else {
              console.log('User not authenticated');
              setUser(null);
              localStorage.removeItem('auth_token');
            }
            
            setLoading(false);
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkAuthStatus = async () => {
    console.log('=== AUTH CONTEXT: CHECK AUTH STATUS START ===');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        localStorage.removeItem('auth_token');
      } else if (session?.user) {
        console.log('Session found:', session.user.email);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata
        });
        
        if (session.access_token) {
          localStorage.setItem('auth_token', session.access_token);
        }
      } else {
        console.log('No session found');
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      console.log('=== AUTH CONTEXT: CHECK AUTH STATUS END ===');
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('=== AUTH CONTEXT: GOOGLE SIGN IN START ===');
    try {
      console.log('Starting Google OAuth with multiple strategies...');
      console.log('Current origin:', window.location.origin);
      
      // Limpeza completa antes de novo OAuth
      await clearAllAuthData();
      
      // Aguardar um pouco para garantir limpeza
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Tentar backend OAuth primeiro
      const backendUrl = import.meta.env.VITE_API_URL || 'https://ai-business-academy-backend.onrender.com';
      console.log('Trying backend OAuth first:', `${backendUrl}/api/auth/google`);
      
      // Verificar se backend está disponível
      try {
        const response = await fetch(`${backendUrl}/api/health`, {
          method: 'GET',
          timeout: 5000
        });
        
        if (response.ok) {
          console.log('Backend is available, using backend OAuth');
          window.location.href = `${backendUrl}/api/auth/google`;
          return;
        }
      } catch (backendError) {
        console.log('Backend not available, falling back to Supabase OAuth:', backendError);
      }
      
      // Fallback para Supabase OAuth direto
      console.log('Using Supabase OAuth as fallback');
      const redirectTo = `${window.location.origin}/auth/callback`;
      console.log('Redirect URL:', redirectTo);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false
        }
      });

      if (error) {
        console.error('Supabase OAuth error:', error);
        throw new Error(`Erro na autenticação: ${error.message}`);
      }

      console.log('Supabase OAuth initiated successfully');
      console.log('=== AUTH CONTEXT: GOOGLE SIGN IN END ===');
      
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await clearAllAuthData();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
