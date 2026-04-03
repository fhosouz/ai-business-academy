import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Verificar configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Configuração do Supabase não encontrada. Verifique as variáveis de ambiente.');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Função de limpeza completa
  const clearAllData = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('supabase.auth.refreshToken');
    sessionStorage.removeItem('supabase.auth.token');
    sessionStorage.removeItem('supabase.auth.refreshToken');
    
    // Limpar cookies
    document.cookie.split(";").forEach(c => {
      const trimmedCookie = c.trim();
      if (trimmedCookie.startsWith('supabase.auth.') || trimmedCookie.startsWith('sb-')) {
        document.cookie = trimmedCookie + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }
    });
  };

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('=== AUTH CALLBACK: START ===');
      console.log('Current URL:', window.location.href);
      console.log('Supabase URL:', supabaseUrl);
      
      try {
        // Verificar se há erro nos query params
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        const errorCode = searchParams.get('error_code');

        // Verificar se há token no hash fragment (Supabase OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        
        // Verificar se há código de autorização (Backend OAuth)
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        console.log('OAuth params:', {
          error,
          code,
          state,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        // Se há erro, redirecionar para login com mensagem
        if (error) {
          console.error('OAuth error:', error, errorDescription);
          navigate(`/login?error=${error}&error_description=${errorDescription || 'Authentication failed'}`);
          return;
        }

        // Se tem código de autorização (Backend OAuth)
        if (code) {
          console.log('Processing backend OAuth callback...');
          await handleBackendOAuth(code, state);
          return;
        }

        // Se tem access token (Supabase OAuth direto)
        if (accessToken) {
          console.log('Processing Supabase OAuth callback...');
          await handleSupabaseOAuth(accessToken, refreshToken);
          return;
        }

        // Se não tem nenhum parâmetro, verificar se há sessão existente
        console.log('No OAuth params found, checking existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigate('/login?error=session_error');
          return;
        }

        if (session?.user) {
          console.log('Found existing session:', session.user.email);
          // Sessão já existe, redirecionar para dashboard
          const userRole = session.user.user_metadata?.role || 'user';
          const redirectTo = userRole === 'admin' ? '/admin' : '/';
          navigate(redirectTo);
          return;
        }

        // Se não encontrou nada, redirecionar para login
        console.log('No session found, redirecting to login');
        navigate('/login?error=no_session');

      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  const handleBackendOAuth = async (code: string, state?: string) => {
    console.log('=== HANDLING BACKEND OAUTH ===');
    
    try {
      // Trocar código por tokens com backend
      const backendUrl = import.meta.env.VITE_API_URL || 'https://ai-business-academy-backend.onrender.com';
      console.log('Exchanging code with backend:', backendUrl);
      
      const response = await fetch(`${backendUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Backend OAuth response:', data);

      if (data.user && data.session) {
        // Criar sessão Supabase com os dados do backend
        const { error: signInError } = await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        });

        if (signInError) {
          console.error('Error setting Supabase session:', signInError);
          throw new Error('Failed to establish session');
        }

        // Atualizar estado do usuário
        const userRole = data.user.role || 'user';
        console.log('User authenticated successfully:', data.user.email, 'Role:', userRole);

        // Redirecionar para dashboard apropriado
        const redirectTo = userRole === 'admin' ? '/admin' : '/';
        navigate(redirectTo);
      } else {
        throw new Error('Invalid response from backend');
      }

    } catch (error) {
      console.error('Backend OAuth error:', error);
      navigate('/login?error=auth_failed');
    }
  };

  const handleSupabaseOAuth = async (accessToken: string, refreshToken?: string) => {
    console.log('=== HANDLING SUPABASE OAUTH ===');
    
    try {
      // Criar sessão com tokens
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      });

      if (error) {
        console.error('Error setting session:', error);
        throw error;
      }

      if (data.user) {
        console.log('Supabase OAuth successful:', data.user.email);
        
        // Redirecionar para dashboard apropriado
        const userRole = data.user.user_metadata?.role || 'user';
        const redirectTo = userRole === 'admin' ? '/admin' : '/';
        navigate(redirectTo);
      } else {
        throw new Error('No user in session data');
      }

    } catch (error) {
      console.error('Supabase OAuth error:', error);
      navigate('/login?error=auth_failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
        const refreshToken = hashParams.get('refresh_token');
        const expiresIn = hashParams.get('expires_in');

        console.log('URL Params:', { error, errorDescription, errorCode });
        console.log('Hash Params:', { 
          accessToken: !!accessToken, 
          refreshToken: !!refreshToken, 
          expiresIn 
        });

        // Se houver erro, tentar tratamento específico
        if (error) {
          console.error('OAuth error:', error, errorDescription, errorCode);
          
          if (errorCode === 'bad_oauth_state') {
            console.log('Bad OAuth state detected - attempting recovery...');
            
            // Limpar todos os dados
            clearAllData();
            
            // Tentar recuperar sessão existente
            try {
              const { data: { session } } = await supabase.auth.getSession();
              
              if (session?.user) {
                console.log('Existing session found, redirecting to dashboard...');
                navigate('/');
                return;
              }
            } catch (sessionError) {
              console.log('Session check failed:', sessionError);
            }
            
            const errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            alert(errorMessage);
            navigate('/login?error=session_expired');
            return;
          }
          
          // Para outros erros, limpar e tentar recuperar sessão
          clearAllData();
          
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              console.log('Error occurred but session exists, redirecting...');
              navigate('/');
              return;
            }
          } catch (recoveryError) {
            console.log('Session recovery failed:', recoveryError);
          }
          
          alert(`Erro de autenticação: ${errorDescription || error}`);
          navigate('/login?error=auth_failed');
          return;
        }

        // Se temos access_token no hash, o Supabase já processou o OAuth
        if (accessToken) {
          console.log('Access token found in hash, processing...');
          
          // Aguardar o Supabase processar a sessão automaticamente
          await new Promise(resolve => setTimeout(resolve, 3000));
          
          // Tentar múltiplas vezes obter a sessão
          let attempts = 0;
          let session = null;
          let sessionError = null;
          
          while (attempts < 5 && !session) {
            try {
              const result = await supabase.auth.getSession();
              session = result.data.session;
              sessionError = result.error;
              
              if (!session && !sessionError) {
                console.log(`Attempt ${attempts + 1}: No session yet, waiting...`);
                await new Promise(resolve => setTimeout(resolve, 1500));
              }
            } catch (attemptError) {
              console.log(`Attempt ${attempts + 1} error:`, attemptError);
            }
            attempts++;
          }
          
          if (sessionError) {
            console.error('Error getting session after OAuth:', sessionError);
            clearAllData();
            alert('Erro ao processar login. Tente novamente.');
            navigate('/login?error=session_error');
            return;
          }

          if (session?.user) {
            console.log('Successfully authenticated:', session.user.email);
            console.log('Redirecting to dashboard...');
            
            // Armazenar token para compatibilidade
            if (session.access_token) {
              localStorage.setItem('auth_token', session.access_token);
            }
            
            // Redirecionar com sucesso
            navigate('/?login_success=true');
          } else {
            console.error('No session found after OAuth after multiple attempts');
            clearAllData();
            alert('Login não concluído. Tente novamente.');
            navigate('/login?error=no_session');
          }
        } else {
          console.error('No access token found in callback');
          
          // Limpar dados e tentar recuperar sessão existente
          clearAllData();
          
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
              console.log('No token but existing session found');
              navigate('/');
              return;
            }
          } catch (recoveryError) {
            console.log('Session recovery failed:', recoveryError);
          }
          
          navigate('/login?error=no_token');
        }
      } catch (error) {
        console.error('Callback error:', error);
        
        // Limpar todos os dados em caso de erro
        clearAllData();
        
        // Tentar recuperar sessão existente
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('Error occurred but session exists, redirecting...');
            navigate('/');
            return;
          }
        } catch (recoveryError) {
          console.error('Recovery failed:', recoveryError);
        }
        
        alert('Erro durante o processamento do login. Tente novamente.');
        navigate('/login?error=callback_failed');
      } finally {
        console.log('=== AUTH CALLBACK: END ===');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Processando autenticação...</h2>
        <p className="text-gray-600">Estamos confirmando seu acesso à plataforma</p>
        <p className="text-sm text-gray-500 mt-2">Isso pode levar alguns segundos</p>
      </div>
    </div>
  );
};

export default AuthCallback;
