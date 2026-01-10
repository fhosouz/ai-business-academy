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
    console.log('AuthProvider: Setting up auth listeners');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Sincronizar dados do Google no login
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          console.log('User signed in:', user.id);
          console.log('User metadata:', user.user_metadata);
          console.log('App metadata:', user.app_metadata);
          
          // Pequeno delay para garantir que dados do banco estejam prontos
          setTimeout(async () => {
            // Sincronizar dados para qualquer login (não apenas Google)
            if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
              try {
                console.log('Calling sync_google_user_data...');
                // Chamar função para sincronizar dados do usuário
                const { error } = await supabase.rpc('sync_google_user_data', {
                  _user_id: user.id,
                  _metadata: user.user_metadata
                });
                
                if (error) {
                  console.error('Error in sync_google_user_data:', error);
                  // Não quebra a aplicação se a função não existir
                  if (error.code === 'PGRST202') {
                    console.log('=== Função sync_google_user_data não encontrada, ignorando sincronização ===');
                  } else {
                    console.log('Erro diferente de função não encontrada, pode ser problema de permissão');
                  }
                } else {
                  console.log('Dados do usuário sincronizados com sucesso');
                }
              } catch (error) {
                console.error('Erro ao sincronizar dados do usuário:', error);
                // Não quebra a aplicação mesmo que falhe a sincronização
              }
            }
            
            // Verificar se usuário tem dados completos após sincronização
            try {
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
                
              if (profileError) {
                console.error('Erro ao verificar perfil:', profileError);
              } else if (profile) {
                console.log('Perfil verificado com sucesso:', profile);
                // Forçar atualização do estado para garantir redirecionamento
                setUser(session?.user ?? null);
                setLoading(false);
              }
            } catch (error) {
              console.error('Erro ao verificar perfil do usuário:', error);
            }
          }, 200); // Aumentado para 200ms
        }
      }
    );

    // Then check for existing session
    console.log('AuthProvider: Checking for existing session');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting session:', error);
      }
      console.log('Existing session found:', !!session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('AuthProvider: Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    try {
      // Para o iframe do preview, vamos usar URL manual para escapar do iframe
      const currentUrl = window.location.href;
      const isInIframe = window !== window.top;
      
      if (isInIframe) {
        // No preview, abre o Google OAuth em uma nova janela
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            skipBrowserRedirect: true
          }
        });
        
        if (error) throw error;
        
        if (data?.url) {
          // Abre em nova janela para escapar do iframe
          window.open(data.url, '_blank');
          return;
        }
      } else {
        // Comportamento normal fora do preview
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/`
          }
        });
        
        if (error) throw error;
      }
    } catch (err) {
      const error = err as any;
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