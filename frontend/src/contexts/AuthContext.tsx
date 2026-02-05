import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata?: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão via API backend
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    console.log('=== AUTH CONTEXT: CHECK AUTH STATUS START ===');
    try {
      const token = localStorage.getItem('auth_token');
      console.log('Token exists:', !!token);
      
      if (!token) {
        console.log('No token found, setting loading to false');
        setLoading(false);
        return;
      }

      // Usar URL absoluta do backend em produção
      const isProduction = window.location.hostname !== 'localhost';
      const backendUrl = isProduction 
        ? 'https://ai-business-academy-backend.onrender.com/api/auth/me'
        : '/api/auth/me';
      
      console.log('Making request to:', backendUrl);
      
      const response = await fetch(backendUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Auth response status:', response.status);
      
      if (response.ok) {
        const { data } = await response.json();
        console.log('Auth successful, user data:', data.user);
        setUser(data.user);
      } else {
        console.log('Auth failed, removing token');
        localStorage.removeItem('auth_token');
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      localStorage.removeItem('auth_token');
      setUser(null);
    } finally {
      console.log('=== AUTH CONTEXT: CHECK AUTH STATUS END ===');
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('=== AUTH CONTEXT: GOOGLE SIGN IN START ===');
    try {
      console.log('Redirecting to backend OAuth endpoint...');
      // Usar URL absoluta do backend em produção
      const isProduction = window.location.hostname !== 'localhost';
      const backendUrl = isProduction 
        ? 'https://ai-business-academy-backend.onrender.com/api/auth/google'
        : '/api/auth/google';
      
      console.log('Using backend URL:', backendUrl);
      window.location.href = backendUrl;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw new Error('Não foi possível realizar a autenticação');
    } finally {
      console.log('=== AUTH CONTEXT: GOOGLE SIGN IN END ===');
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      localStorage.removeItem('auth_token');
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
