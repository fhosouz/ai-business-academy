import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Sincronizar dados do Google no login
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          // Verificar se é login com Google e tem metadata
          if (user.app_metadata?.provider === 'google' && user.user_metadata) {
            try {
              // Chamar função para sincronizar dados do Google
              await supabase.rpc('sync_google_user_data', {
                _user_id: user.id,
                _metadata: user.user_metadata
              });
              console.log('Dados do Google sincronizados com sucesso');
            } catch (error) {
              console.error('Erro ao sincronizar dados do Google:', error);
            }
          }
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });
      
      if (error) {
        console.error('Error signing in with Google:', error);
        
        // Mensagens de erro mais específicas
        let errorMessage = 'Não foi possível realizar a autenticação';
        
        if (error.message?.includes('provider is not enabled')) {
          errorMessage = 'Login com Google não está habilitado. Entre em contato com o suporte.';
        } else if (error.message?.includes('Invalid redirect URL')) {
          errorMessage = 'Erro de configuração. Tente novamente em alguns instantes.';
        } else if (error.message?.includes('access_denied')) {
          errorMessage = 'Acesso negado. Você cancelou a autenticação.';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Problema de conexão. Verifique sua internet e tente novamente.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro inesperado ao fazer login';
      throw new Error(message);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};