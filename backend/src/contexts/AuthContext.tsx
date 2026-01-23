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
    console.log('=== AUTH PROVIDER INITIALIZING ===');
    console.log('AuthProvider: Setting up auth listeners');
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== AUTH STATE CHANGE DETECTED ===');
        console.log('Event:', event);
        console.log('Session exists:', !!session);
        console.log('Session user ID:', session?.user?.id);
        console.log('Session user email:', session?.user?.email);
        console.log('Current user state before update:', !!user);
        console.log('Current loading state before update:', loading);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        console.log('User state after update:', !!session?.user);
        console.log('Loading state after update:', false);
        console.log('Session object:', session);
        console.log('User object:', session?.user);
        
        // Sincronizar dados do Google no login
        if (event === 'SIGNED_IN' && session?.user) {
          const user = session.user;
          console.log('=== USER SIGNED IN - STARTING PROCESS ===');
          console.log('User ID:', user.id);
          console.log('User email:', user.email);
          console.log('User metadata:', user.user_metadata);
          console.log('App metadata:', user.app_metadata);
          console.log('Provider:', user.app_metadata?.provider);
          console.log('Created at:', user.created_at);
          console.log('Last sign in:', user.last_sign_in_at);
          
          // Pequeno delay para garantir que dados do banco estejam prontos
          setTimeout(async () => {
            console.log('=== STARTING USER DATA VERIFICATION AFTER DELAY ===');
            console.log('Delay completed, starting verification...');
            
            // Sincronizar dados para qualquer login (não apenas Google)
            if (user.user_metadata && Object.keys(user.user_metadata).length > 0) {
              try {
                console.log('=== CALLING SYNC GOOGLE USER DATA ===');
                console.log('User ID:', user.id);
                console.log('User metadata:', user.user_metadata);
                
                // Chamar função para sincronizar dados do usuário
                const { error } = await supabase.rpc('sync_google_user_data', {
                  p_user_id: user.id,
                  p_metadata: user.user_metadata
                });
                
                if (error) {
                  console.error('=== ERROR IN SYNC GOOGLE USER DATA ===');
                  console.error('Error:', error);
                  console.error('Error code:', error.code);
                  console.error('Error message:', error.message);
                  console.error('Error details:', error.details);
                  console.error('Error hint:', error.hint);
                  
                  // Não quebra a aplicação se a função não existir
                  if (error.code === 'PGRST202') {
                    console.log('=== Função sync_google_user_data não encontrada, ignorando sincronização ===');
                  } else {
                    console.log('=== Erro diferente de função não encontrada, pode ser problema de permissão ===');
                  }
                } else {
                  console.log('=== SYNC GOOGLE USER DATA SUCCESS ===');
                  console.log('Dados do usuário sincronizados com sucesso');
                }
              } catch (error) {
                console.error('=== EXCEPTION IN SYNC GOOGLE USER DATA ===');
                console.error('Exception:', error);
                console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error');
                // Não quebra a aplicação mesmo que falhe a sincronização
              }
            } else {
              console.log('=== NO USER METADATA FOUND ===');
              console.log('Skipping sync_google_user_data call');
            }
            
            // Verificar se usuário tem dados completos após sincronização
            console.log('=== VERIFYING USER PROFILE IN DATABASE ===');
            try {
              console.log('Querying user_profiles for user_id:', user.id);
              
              const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();
                
              console.log('=== PROFILE QUERY RESULT ===');
              console.log('Profile data:', profile);
              console.log('Profile error:', profileError);
              
              if (profileError) {
                console.error('=== ERROR VERIFYING PROFILE ===');
                console.error('Profile error:', profileError);
                console.error('Profile error code:', profileError.code);
                console.error('Profile error message:', profileError.message);
                console.error('Profile error details:', profileError.details);
                console.error('Profile error hint:', profileError.hint);
              } else if (profile) {
                console.log('=== PROFILE FOUND AND VERIFIED ===');
                console.log('Profile data:', profile);
                console.log('Profile user_id matches:', profile.user_id === user.id);
                console.log('Profile email:', profile.email);
                console.log('Profile full_name:', profile.full_name);
                
                // Verificar outras tabelas também
                console.log('=== VERIFYING USER PLAN ===');
                const { data: plan, error: planError } = await supabase
                  .from('user_plans')
                  .select('*')
                  .eq('user_id', user.id)
                  .maybeSingle();
                  
                console.log('=== PLAN QUERY RESULT ===');
                console.log('Plan data:', plan);
                console.log('Plan error:', planError);
                
                console.log('=== VERIFYING USER ROLE ===');
                const { data: role, error: roleError } = await supabase
                  .from('user_roles')
                  .select('*')
                  .eq('user_id', user.id)
                  .maybeSingle();
                  
                console.log('=== ROLE QUERY RESULT ===');
                console.log('Role data:', role);
                console.log('Role error:', roleError);
                
                // Verificar se todos os dados existem
                const hasProfile = !!profile;
                const hasPlan = !!plan;
                const hasRole = !!role;
                
                console.log('=== USER DATA COMPLETENESS CHECK ===');
                console.log('Has profile:', hasProfile);
                console.log('Has plan:', hasPlan);
                console.log('Has role:', hasRole);
                console.log('All data complete:', hasProfile && hasPlan && hasRole);
                
                // Forçar atualização do estado para garantir redirecionamento
                console.log('=== UPDATING AUTH STATE FOR REDIRECT ===');
                console.log('Setting user state to:', session?.user);
                console.log('Setting loading state to: false');
                
                setUser(session?.user ?? null);
                setLoading(false);
                
                console.log('=== AUTH STATE UPDATED SUCCESSFULLY ===');
                console.log('User should now be redirected to home');
              } else {
                console.error('=== NO PROFILE FOUND FOR USER ===');
                console.error('User ID:', user.id);
                console.error('This indicates the trigger is not working properly');
                console.error('User will not be able to access protected routes');
              }
            } catch (error) {
              console.error('=== EXCEPTION IN PROFILE VERIFICATION ===');
              console.error('Exception:', error);
              console.error('Exception message:', error instanceof Error ? error.message : 'Unknown error');
            }
            
            console.log('=== USER DATA VERIFICATION COMPLETED ===');
          }, 1000); // Aumentado para 1 segundo para garantir tempo suficiente
        } else {
          console.log('=== NOT A SIGN_IN EVENT ===');
          console.log('Event:', event);
          console.log('Skipping user data verification');
        }
      }
    );

    // Then check for existing session
    console.log('=== CHECKING EXISTING SESSION ===');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('=== ERROR GETTING EXISTING SESSION ===');
        console.error('Error:', error);
      }
      console.log('=== EXISTING SESSION RESULT ===');
      console.log('Session found:', !!session);
      console.log('Session user ID:', session?.user?.id);
      console.log('Session user email:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      console.log('=== SESSION CHECK COMPLETED ===');
    });

    return () => {
      console.log('=== AUTH PROVIDER CLEANUP ===');
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
          const authWindow = window.open(data.url, '_blank');
          
          // Verificar periodicamente se o usuário foi autenticado
          const checkAuth = setInterval(async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (session?.user) {
                // Usuário autenticado, limpar intervalo e atualizar estado
                clearInterval(checkAuth);
                setSession(session);
                setUser(session.user);
                setLoading(false);
                // Fechar a janela de autenticação se ainda estiver aberta
                if (authWindow && !authWindow.closed) {
                  authWindow.close();
                }
              }
            } catch (error) {
              console.error('Error checking auth status:', error);
            }
          }, 1000); // Verificar a cada 1 segundo
          
          // Parar de verificar após 5 minutos
          setTimeout(() => {
            clearInterval(checkAuth);
          }, 300000);
          
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