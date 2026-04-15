import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { AlertTriangle } from 'lucide-react';

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
      console.log('=== AUTH CALLBACK: SUPABASE OAUTH START ===');
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

        console.log('Supabase OAuth params:', {
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
            navigate('/login?error=session_error');
            return;
          }

          if (data.user) {
            console.log('Supabase OAuth successful:', data.user.email);
            
            // Redirecionar para dashboard apropriado
            const userRole = data.user.user_metadata?.role || 'user';
            const redirectTo = userRole === 'admin' ? '/admin' : '/';
            console.log('Redirecting to:', redirectTo, 'Role:', userRole);
            navigate(redirectTo);
            return;
          } else {
            throw new Error('No user in session data');
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
          console.log('Redirecting to existing session:', redirectTo);
          navigate(redirectTo);
          return;
        }

        // Se não encontrou nada, redirecionar para login com erro específico
        console.log('No session found, checking configuration...');
        
        // Verificar se o problema é configuração do Supabase
        try {
          const { data: providers, error: providersError } = await supabase.auth.listProviders();
          if (providersError || !providers?.includes('google')) {
            console.error('Google provider not enabled in Supabase');
            navigate('/login?error=provider_disabled&error_description=Google OAuth não está configurado no Supabase. Contate o administrador.');
            return;
          }
        } catch (providerCheckError) {
          console.log('Could not check providers:', providerCheckError);
        }

        // Se chegou aqui, é problema de configuração
        navigate('/login?error=configuration_error&error_description=OAuth não está configurado corretamente. Verifique as configurações do Supabase.');

      } catch (error) {
        console.error('OAuth callback error:', error);
        navigate('/login?error=callback_failed');
      }
    };

    handleOAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processando Autenticação</h2>
          <p className="text-gray-600 mb-4">Estamos processando seu login com Google...</p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <p>• Verificando suas credenciais</p>
            <p>• Configurando sua sessão</p>
            <p>• Redirecionando para seu dashboard</p>
          </div>
          
          <div className="mt-6">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
