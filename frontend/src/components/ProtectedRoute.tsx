import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  fallbackPath?: string;
  permission?: keyof import('@/types/roles').RolePermissions;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole = 'user',
  fallbackPath = '/login',
  permission
}) => {
  const { user, loading } = useAuth();
  const { role, hasPermission } = useUserRole();

  console.log('=== PROTECTED ROUTE RENDERING ===');
  console.log('User exists:', !!user);
  console.log('Loading state:', loading);
  console.log('User role:', role);
  console.log('Required role:', requiredRole);
  console.log('Required permission:', permission);
  console.log('Current pathname:', window.location.pathname);

  if (loading) {
    console.log('=== PROTECTED ROUTE: STILL LOADING ===');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!user) {
    console.log('=== PROTECTED ROUTE: NO USER FOUND, REDIRECTING TO LOGIN ===');
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar se tem a role necessária
  if (requiredRole && role !== requiredRole) {
    console.log(`=== PROTECTED ROUTE: ROLE MISMATCH ===`);
    console.log(`Current role: ${role}, Required: ${requiredRole}`);
    
    // Se é user tentando acessar área admin
    if (role === 'user' && requiredRole === 'admin') {
      console.log('User trying to access admin area - redirecting to dashboard');
      return <Navigate to="/" replace />;
    }
    
    // Se é admin tentando acessar área específica de user
    if (role === 'admin' && requiredRole === 'user') {
      console.log('Admin trying to access user area - redirecting to admin');
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar permissão específica
  if (permission && !hasPermission(permission)) {
    console.log(`=== PROTECTED ROUTE: PERMISSION DENIED ===`);
    console.log(`Missing permission: ${permission}`);
    return <Navigate to="/" replace />;
  }

  console.log('=== PROTECTED ROUTE: ACCESS GRANTED ===');
  return <>{children}</>;
};

// Componente para rotas apenas de admin
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute 
      requiredRole="admin" 
      fallbackPath="/login"
      permission="canViewAdminPanel"
    >
      {children}
    </ProtectedRoute>
  );
};

// Componente para rotas que precisam de permissões específicas
export const PermissionRoute: React.FC<{
  children: React.ReactNode;
  permission: keyof import('@/types/roles').RolePermissions;
}> = ({ children, permission }) => {
  return (
    <ProtectedRoute permission={permission}>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;