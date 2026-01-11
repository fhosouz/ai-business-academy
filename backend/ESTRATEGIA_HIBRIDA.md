// ESTRATÉGIA HÍBRIDA INTELIGENTE
// Mantém Supabase direto + Backend para funcionalidades específicas

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  // Mantém compatibilidade com hooks existentes
  login?: (email: string, password: string) => Promise<void>;
  register?: (email: string, password: string, fullName: string) => Promise<void>;
  source?: 'api' | 'supabase';
}
