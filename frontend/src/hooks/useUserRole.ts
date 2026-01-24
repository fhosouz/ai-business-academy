import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserRole {
  isAdmin: boolean;
  role: 'admin' | 'user';
  loading: boolean;
}

export const useUserRole = (): UserRole => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        // Simulação - em produção, buscaria do backend
        const userRole = user.user_metadata?.role || 'user';
        setIsAdmin(userRole === 'admin');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  return { isAdmin, role: isAdmin ? 'admin' : 'user', loading };
};
