// Serviço de Autenticação - Integração com Supabase
import { createClient } from '@supabase/supabase-js';
import type { AuthUser, LoginRequest, RegisterRequest, AuthResponse, AuthError } from '../domains/auth.types.js';

class AuthService {
  private supabase: any;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw this.handleError(error);
      }

      // Buscar perfil do usuário
      const profile = await this.getUserProfile(data.user.id);
      
      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          full_name: profile?.full_name,
          avatar_url: profile?.avatar_url,
          role: profile?.role || 'user',
          plan: profile?.plan || 'free'
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at!
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
          },
        },
      });

      if (error) {
        throw this.handleError(error);
      }

      // Criar perfil inicial
      await this.createUserProfile(data.user!.id, {
        full_name: userData.full_name,
        role: 'user',
        plan: 'free'
      });

      return {
        user: {
          id: data.user!.id,
          email: data.user!.email!,
          full_name: userData.full_name,
          avatar_url: null,
          role: 'user',
          plan: 'free'
        },
        session: {
          access_token: data.session!.access_token,
          refresh_token: data.session!.refresh_token,
          expires_at: data.session!.expires_at!
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.admin.signOut(token);
      if (error) {
        throw this.handleError(error);
      }
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw this.handleError(error);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
          avatar_url: data.user.user_metadata?.avatar_url,
          role: 'user',
          plan: 'free'
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at!
        }
      };
    } catch (error) {
      throw error;
    }
  }

  private async getUserProfile(userId: string) {
    const { data } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return data;
  }

  private async createUserProfile(userId: string, profile: any) {
    const { error } = await this.supabase
      .from('user_profiles')
      .insert({
        user_id: userId,
        ...profile,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): AuthError {
    return {
      code: error.code || 'UNKNOWN_ERROR',
      message: error.message || 'An error occurred',
      details: error
    };
  }
}

export const authService = new AuthService();
