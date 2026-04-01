import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('=== AUTH CALLBACK: START ===');
      console.log('Current URL:', window.location.href);
      
      try {
        // Verificar se há erro nos query params
        const urlParams = new URLSearchParams(window.location.search);
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        const errorCode = urlParams.get('error_code');

        // Verificar se há token no hash fragment (Supabase OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
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
            
            // Tentar recuperar sessão existente
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            
            if (session?.user) {
              console.log('Existing session found, redirecting to dashboard...');
              navigate('/');
              return;
            }
            
            // Limpar storage e redirecionar para login com mensagem
            localStorage.removeItem('auth_token');
            sessionStorage.clear();
            
            const errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
            alert(errorMessage);
            navigate('/login?error=session_expired');
            return;
          }
          
          // Para outros erros, também tentar recuperar sessão
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('Error occurred but session exists, redirecting...');
            navigate('/');
            return;
          }
          
          alert(`Erro de autenticação: ${errorDescription || error}`);
          navigate('/login?error=auth_failed');
          return;
        }

        // Se temos access_token no hash, o Supabase já processou o OAuth
        if (accessToken) {
          console.log('Access token found in hash, processing...');
          
          // Aguardar o Supabase processar a sessão automaticamente
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Tentar múltiplas vezes obter a sessão
          let attempts = 0;
          let session = null;
          let sessionError = null;
          
          while (attempts < 3 && !session) {
            const result = await supabase.auth.getSession();
            session = result.data.session;
            sessionError = result.error;
            
            if (!session && !sessionError) {
              console.log(`Attempt ${attempts + 1}: No session yet, waiting...`);
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
            attempts++;
          }
          
          if (sessionError) {
            console.error('Error getting session after OAuth:', sessionError);
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
            alert('Login não concluído. Tente novamente.');
            navigate('/login?error=no_session');
          }
        } else {
          console.error('No access token found in callback');
          
          // Última tentativa: verificar se há sessão existente
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('No token but existing session found');
            navigate('/');
            return;
          }
          
          navigate('/login?error=no_token');
        }
      } catch (error) {
        console.error('Callback error:', error);
        
        // Em caso de erro, tentar recuperar sessão existente
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
