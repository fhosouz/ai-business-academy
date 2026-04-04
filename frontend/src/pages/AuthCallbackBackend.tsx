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
      console.log('=== AUTH CALLBACK: BACKEND OAUTH START ===');
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

        // Verificar se há código de autorização (Backend OAuth)
        const code = searchParams.get('code');
        const state = searchParams.get('state');

        console.log('Backend OAuth params:', {
          hasCode: !!code,
          state
        });

        if (code) {
          console.log('Processing backend OAuth callback...');
          
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
            return;
          } else {
            throw new Error('Invalid response from backend');
          }
        }

        // Se não tem código, verificar se há token no hash (fallback)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          console.log('Fallback: Processing Supabase OAuth callback...');
          
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
            console.log('Fallback OAuth successful:', data.user.email);
            const userRole = data.user.user_metadata?.role || 'user';
            const redirectTo = userRole === 'admin' ? '/admin' : '/';
            navigate(redirectTo);
            return;
          }
        }

        // Se não encontrou nada, verificar sessão existente
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
