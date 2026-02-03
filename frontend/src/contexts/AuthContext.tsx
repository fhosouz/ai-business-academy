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

      console.log('Making request to /api/auth/me');
      const response = await fetch('/api/auth/me', {
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
    try {
      // Backend OAuth proxy - mais seguro
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw new Error('Não foi possível realizar a autenticação');
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
