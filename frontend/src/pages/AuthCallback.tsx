import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuthStatus } = useAuth();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Obter parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');
        const error = urlParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          navigate('/login');
          return;
        }

        if (!code) {
          console.error('No code received');
          navigate('/login');
          return;
        }

        // Enviar code para backend processar
        const response = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('Backend error:', errorData);
          navigate('/login');
          return;
        }

        const data = await response.json();
        
        // Armazenar token
        localStorage.setItem('auth_token', data.session.access_token);

        // Verificar status de autenticação
        await checkAuthStatus();

        // Redirecionar para dashboard
        navigate('/dashboard');
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/login');
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
