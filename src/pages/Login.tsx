import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Chrome, BookOpen } from 'lucide-react';

const Login = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para a plataforma...",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Erro inesperado ao fazer login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Bem-vindo à AutomatizeAI Academy</CardTitle>
            <CardDescription>
              Faça login para acessar cursos de Inteligência Artificial
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              size="lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <Chrome className="w-5 h-5 mr-2" />
              )}
              {isLoading ? 'Autenticando...' : 'Continuar com Google'}
            </Button>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Ao fazer login, você concorda com nossos</p>
              <p>Termos de Uso e Política de Privacidade</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;