import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

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

        console.log('URL Params:', { code: !!code, state, error, errorDescription });

        if (error) {
          console.error('OAuth error:', error, errorDescription);
          navigate('/login');
          return;
        }

        if (!code) {
          console.error('No code received in callback');
          navigate('/login');
          return;
        }

        console.log('Making request to backend with code...');
        
        // Usar URL absoluta do backend em produção
        const isProduction = window.location.hostname !== 'localhost';
        const backendUrl = isProduction 
          ? 'https://ai-business-academy-backend.onrender.com/api/auth/google'
          : '/api/auth/google';
        
        console.log('Using backend URL:', backendUrl);
        
        // Enviar code para backend processar
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        console.log('Backend response status:', response.status);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error:', errorData);
          navigate('/login');
          return;
        }

        const data = await response.json();
        console.log('Backend response data:', data);
        
        // Armazenar token
        if (data.session?.access_token) {
          localStorage.setItem('auth_token', data.session.access_token);
          console.log('Token stored successfully');
        } else {
          console.error('No access token in response');
          navigate('/login');
          return;
        }

        console.log('Checking auth status...');
        // Verificar status de autenticação
        await checkAuthStatus();

        console.log('Redirecting to dashboard...');
        // Redirecionar para dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login');
      } finally {
        console.log('=== AUTH CALLBACK: END ===');
      }
    };

    handleOAuthCallback();
  }, [navigate, checkAuthStatus]);

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
