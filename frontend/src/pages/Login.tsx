import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BookOpen } from 'lucide-react';
import { sanitizeInput } from '@/utils/inputValidation';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { useAuthForm } from '@/hooks/useAuthForm';

const Login = () => {
  const { user, loading, signInWithGoogle, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);
  
  const {
    formData,
    formErrors,
    handleInputChange,
    validateForm,
    resetForm
  } = useAuthForm();

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

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(false)) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Chamada via API backend (arquitetura 3 camadas)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no login');
      }

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para a plataforma...",
      });

      // Armazenar token e atualizar contexto
      if (data.token) {
        localStorage.setItem('auth_token', data.token);
        
        // Atualizar contexto de autenticação imediatamente
        await checkAuthStatus();
        
        console.log('=== EMAIL LOGIN: TOKEN STORED AND AUTH CHECKED ===');
        console.log('Navigating to home page...');
        navigate('/', { replace: true });
      }

    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : "Email ou senha incorretos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(true) || !isPasswordStrong) {
      if (!isPasswordStrong) {
        toast({
          title: "Erro",
          description: "A senha não atende aos critérios de segurança",
          variant: "destructive",
        });
      }
      return;
    }

    setIsSigningUp(true);
    
    try {
      // Chamada via API backend (arquitetura 3 camadas)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: sanitizeInput(formData.fullName, 50),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no cadastro');
      }

      toast({
        title: "🎉 Cadastro realizado com sucesso!",
        description: "Enviamos um email de confirmação elegante para você. Verifique sua caixa de entrada e confirme sua conta para começar sua jornada na AutomatizeAI Academy!",
      });

      resetForm();

    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: error instanceof Error ? error.message : "Erro inesperado ao criar conta",
        variant: "destructive",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  useEffect(() => {
    console.log('=== LOGIN PAGE USEEFFECT TRIGGERED ===');
    console.log('User exists:', !!user);
    console.log('Loading state:', loading);
    console.log('Current pathname:', window.location.pathname);
    console.log('Current URL:', window.location.href);
    console.log('User object:', user);
    console.log('User ID:', user?.id);
    console.log('User email:', user?.email);
    console.log('Timestamp:', new Date().toISOString());
    
    // Apenas redirecionar se user existe E não estamos na página de login
    if (user && !loading && window.location.pathname === '/login') {
      console.log('=== LOGIN PAGE REDIRECTING TO HOME ===');
      console.log('User ID:', user.id);
      console.log('User email:', user.email);
      console.log('Redirecting to: /');
      console.log('Navigation function called');
      
      // Forçar redirecionamento com replace
      navigate('/', { replace: true });
      
      console.log('Navigation called, waiting for redirect...');
    } else {
      console.log('=== LOGIN PAGE NOT REDIRECTING ===');
      console.log('Reason:', user ? 'Still loading' : 'No user found');
      console.log('User exists:', !!user);
      console.log('Loading:', loading);
      console.log('Pathname:', window.location.pathname);
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    
    if (message === 'confirmed') {
      console.log('=== EMAIL CONFIRMATION MESSAGE FOUND ===');
      toast({
        title: "✅ Email confirmado com sucesso!",
        description: "Sua conta foi ativada! Agora você pode fazer login com seu email e senha para acessar a AutomatizeAI Academy.",
      });
      
      window.history.replaceState({}, '', '/login');
      console.log('URL cleaned from confirmation message');
    }
  }, [user, loading, navigate, toast]);

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
              Faça login ou crie sua conta para acessar cursos de IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <GoogleSignInButton
              onSignIn={handleGoogleSignIn}
              isLoading={isLoading}
              disabled={isSigningUp}
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <SignInForm
                  formData={formData}
                  formErrors={formErrors}
                  onInputChange={handleInputChange}
                  onSubmit={handleEmailSignIn}
                  isLoading={isLoading}
                />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <SignUpForm
                  formData={formData}
                  formErrors={formErrors}
                  onInputChange={handleInputChange}
                  onSubmit={handleEmailSignUp}
                  isLoading={isSigningUp}
                  isPasswordStrong={isPasswordStrong}
                  onPasswordStrengthChange={setIsPasswordStrong}
                />
              </TabsContent>
            </Tabs>
            
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
