// ========================================
// SUPABASE TYPES - DEFINIÇÕES DAS TABELAS (FRONTEND)
// ========================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_plans: {
        Row: {
          id: string
          user_id: string
          plan_type: 'free' | 'premium' | 'enterprise'
          status: 'active' | 'cancelled' | 'expired'
          created_at: string
          updated_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'free' | 'premium' | 'enterprise'
          status?: 'active' | 'cancelled' | 'expired'
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'free' | 'premium' | 'enterprise'
          status?: 'active' | 'cancelled' | 'expired'
          created_at?: string
          updated_at?: string
          expires_at?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string | null
          provider: 'MERCADO_PAGO'
          external_payment_id: string
          external_reference: string
          amount: number
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'
          created_at: string
          updated_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          provider: 'MERCADO_PAGO'
          external_payment_id: string
          external_reference: string
          amount: number
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string | null
          provider?: 'MERCADO_PAGO'
          external_payment_id?: string
          external_reference?: string
          amount?: number
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'
          created_at?: string
          updated_at?: string
          metadata?: Json | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type UserPlanRow = Database['public']['Tables']['user_plans']['Row'];
export type PaymentRow = Database['public']['Tables']['payments']['Row'];
