import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole, UserWithRole, RolePermissions, ROLE_PERMISSIONS, hasPermission, isAdmin, isUser } from '@/types/roles';

interface UserRoleHook {
  isAdmin: boolean;
  isUser: boolean;
  role: 'admin' | 'user';
  loading: boolean;
  permissions: RolePermissions;
  user: UserWithRole | null;
  hasPermission: (permission: keyof RolePermissions) => boolean;
  canManageCourses: () => boolean;
  canViewAnalytics: () => boolean;
  canManageUsers: () => boolean;
  canManageSettings: () => boolean;
  canViewAdminPanel: () => boolean;
}

export const useUserRole = (): UserRoleHook => {
  const { user } = useAuth();
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [loading, setLoading] = useState(true);

  const getUserRole = (): 'admin' | 'user' => {
    if (!user) return 'user';
    
    // Verificar se o usuário tem role definido no metadata
    const roleFromMetadata = user.user_metadata?.role as 'admin' | 'user';
    
    // Lista de emails admin (hardcoded para segurança)
    const adminEmails = [
      'fabricio@automatizeai.com',
      'admin@automatizeai.com',
      // Adicionar outros emails admin aqui
    ];
    
    // Se for email admin ou tiver role admin no metadata
    if (adminEmails.includes(user.email) || roleFromMetadata === 'admin') {
      return 'admin';
    }
    
    return 'user';
  };

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdminRole(false);
        setLoading(false);
        return;
      }

      try {
        const role = getUserRole();
        setIsAdminRole(role === 'admin');
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdminRole(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, [user]);

  const role: 'admin' | 'user' = getUserRole();
  const permissions: RolePermissions = ROLE_PERMISSIONS[role];
  
  const userWithRole: UserWithRole | null = user ? {
    ...user,
    role,
  } : null;

  const hasRolePermission = (permission: keyof RolePermissions): boolean => {
    return hasPermission(role, permission);
  };

  const canManageCourses = (): boolean => hasRolePermission('canManageCourses');
  const canViewAnalytics = (): boolean => hasRolePermission('canViewAnalytics');
  const canManageUsers = (): boolean => hasRolePermission('canManageUsers');
  const canManageSettings = (): boolean => hasRolePermission('canManageSettings');
  const canViewAdminPanel = (): boolean => hasRolePermission('canViewAdminPanel');

  return { 
    isAdmin: isAdminRole,
    isUser: isUser(role),
    role, 
    loading, 
    permissions,
    user: userWithRole,
    hasPermission: hasRolePermission,
    canManageCourses,
    canViewAnalytics,
    canManageUsers,
    canManageSettings,
    canViewAdminPanel,
  };
};
