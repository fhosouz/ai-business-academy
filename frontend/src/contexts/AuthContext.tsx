import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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
    // Verificar sessão via Supabase
    checkAuthStatus();

    // Escutar mudanças na autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('=== SUPABASE AUTH STATE CHANGE ===');
        console.log('Event:', event);
        console.log('Session exists:', !!session);
        
        if (session?.user) {
          console.log('User authenticated:', session.user.email);
          setUser({
            id: session.user.id,
            email: session.user.email!,
            user_metadata: session.user.user_metadata
          });
          
          // Armazenar token no localStorage para compatibilidade
          if (session.access_token) {
            localStorage.setItem('auth_token', session.access_token);
          }
        } else {
          console.log('User not authenticated');
          setUser(null);
          localStorage.removeItem('auth_token');
        }
        
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    console.log('=== AUTH CONTEXT: CHECK AUTH STATUS START ===');
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setUser(null);
        localStorage.removeItem('auth_token');
      } else if (session?.user) {
        console.log('Session found:', session.user.email);
        setUser({
          id: session.user.id,
          email: session.user.email!,
          user_metadata: session.user.user_metadata
        });
        
        if (session.access_token) {
          localStorage.setItem('auth_token', session.access_token);
        }
      } else {
        console.log('No session found');
        setUser(null);
        localStorage.removeItem('auth_token');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setUser(null);
      localStorage.removeItem('auth_token');
    } finally {
      console.log('=== AUTH CONTEXT: CHECK AUTH STATUS END ===');
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('=== AUTH CONTEXT: GOOGLE SIGN IN START ===');
    try {
      console.log('Starting Google OAuth with Supabase...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('OAuth error:', error);
        throw error;
      }

      console.log('OAuth URL generated:', data.url);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw new Error('Não foi possível realizar a autenticação');
    } finally {
      console.log('=== AUTH CONTEXT: GOOGLE SIGN IN END ===');
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
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
