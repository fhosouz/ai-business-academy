import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('=== AUTH CALLBACK: START ===');
      console.log('Current URL:', window.location.href);
      
      try {
        // Obter parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');
        const errorDescription = urlParams.get('error_description');
        const errorCode = urlParams.get('error_code');

        console.log('URL Params:', { 
          code: !!code, 
          state, 
          error, 
          errorDescription, 
          errorCode 
        });

        // Se houver erro, mostrar mensagem e redirecionar
        if (error) {
          console.error('OAuth error:', error, errorDescription, errorCode);
          
          // Se for bad_oauth_state, tentar novamente
          if (errorCode === 'bad_oauth_state') {
            console.log('Bad OAuth state detected, redirecting to login...');
            alert('Erro na autenticação. Por favor, tente fazer login novamente.');
            navigate('/login');
            return;
          }
          
          // Outros erros
          alert(`Erro de autenticação: ${errorDescription || error}`);
          navigate('/login');
          return;
        }

        if (!code) {
          console.error('No code received in callback');
          navigate('/login');
          return;
        }

        console.log('Processing OAuth callback with Supabase...');
        
        // O Supabase vai processar o callback automaticamente
        // Apenas aguardar a sessão ser estabelecida
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session after callback:', sessionError);
          alert('Erro ao processar login. Tente novamente.');
          navigate('/login');
          return;
        }

        if (session?.user) {
          console.log('Successfully authenticated:', session.user.email);
          console.log('Redirecting to dashboard...');
          navigate('/dashboard');
        } else {
          console.error('No session found after callback');
          alert('Login não concluído. Tente novamente.');
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
