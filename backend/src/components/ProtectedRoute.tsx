import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  console.log('=== PROTECTED ROUTE RENDERING ===');
  console.log('User exists:', !!user);
  console.log('Loading state:', loading);
  console.log('User ID:', user?.id);
  console.log('User email:', user?.email);
  console.log('Current pathname:', window.location.pathname);
  console.log('Current URL:', window.location.href);
  console.log('Timestamp:', new Date().toISOString());

  if (loading) {
    console.log('=== PROTECTED ROUTE: STILL LOADING ===');
    console.log('Showing loading spinner...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verificar se usuário existe E tem dados completos no banco
  if (!user) {
    console.log('=== PROTECTED ROUTE: NO USER FOUND, REDIRECTING TO LOGIN ===');
    console.log('Redirect reason: User is null or undefined');
    console.log('Destination: /login');
    console.log('Navigation will be executed now...');
    return <Navigate to="/login" replace />;
  }

  // Usuário existe, permitir acesso (banco de dados está correto)
  console.log('=== PROTECTED ROUTE: USER AUTHENTICATED, ALLOWING ACCESS ===');
  console.log('User ID:', user.id);
  console.log('User email:', user.email);
  console.log('Allowing access to protected content');
  console.log('Children will be rendered now...');
  return <>{children}</>;
};

export default ProtectedRoute;