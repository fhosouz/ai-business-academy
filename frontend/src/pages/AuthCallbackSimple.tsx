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

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('=== AUTH CALLBACK: START ===');
      console.log('Current URL:', window.location.href);
      
      try {
        // Verificar se há erro nos query params
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          navigate(`/login?error=${error}&error_description=${errorDescription || 'Authentication failed'}`);
          return;
        }

        // Verificar se há token no hash fragment (Supabase OAuth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        console.log('OAuth params:', {
          error,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken
        });

        if (accessToken) {
          console.log('Processing Supabase OAuth callback...');
          
          // Criar sessão com tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('Error setting session:', error);
            navigate('/login?error=auth_failed');
            return;
          }

          if (data.user) {
            console.log('Supabase OAuth successful:', data.user.email);
            
            // Redirecionar para dashboard apropriado
            const userRole = data.user.user_metadata?.role || 'user';
            const redirectTo = userRole === 'admin' ? '/admin' : '/';
            navigate(redirectTo);
            return;
          }
        }

        // Se não tem token, verificar sessão existente
        console.log('No OAuth params found, checking existing session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          navigate('/login?error=session_error');
          return;
        }

        if (session?.user) {
          console.log('Found existing session:', session.user.email);
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
