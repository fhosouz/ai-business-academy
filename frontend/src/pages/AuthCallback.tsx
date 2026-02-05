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

        // Se houver erro, mostrar mensagem e redirecionar
        if (error) {
          console.error('OAuth error:', error, errorDescription, errorCode);
          
          if (errorCode === 'bad_oauth_state') {
            console.log('Bad OAuth state detected, redirecting to login...');
            alert('Erro na autenticação. Por favor, tente fazer login novamente.');
            navigate('/login');
            return;
          }
          
          alert(`Erro de autenticação: ${errorDescription || error}`);
          navigate('/login');
          return;
        }

        // Se temos access_token no hash, o Supabase já processou o OAuth
        if (accessToken) {
          console.log('Access token found in hash, processing...');
          
          // Aguardar o Supabase processar a sessão automaticamente
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Error getting session after OAuth:', sessionError);
            alert('Erro ao processar login. Tente novamente.');
            navigate('/login');
            return;
          }

          if (session?.user) {
            console.log('Successfully authenticated:', session.user.email);
            console.log('Redirecting to dashboard...');
            navigate('/'); // Redirecionar para a raiz que é o dashboard
          } else {
            console.error('No session found after OAuth');
            alert('Login não concluído. Tente novamente.');
            navigate('/login');
          }
        } else {
          console.error('No access token found in callback');
          navigate('/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        alert('Erro durante o processamento do login. Tente novamente.');
        navigate('/login');
      } finally {
        console.log('=== AUTH CALLBACK: END ===');
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Processando autenticação...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
