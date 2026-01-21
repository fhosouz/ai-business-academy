-- Fix Row Level Security for payments table - VERSÃO SEGURA
-- Mantém políticas existentes + Adiciona apenas política para authenticated

-- 1. REMOVER APENAS políticas que causam conflito
DROP POLICY IF EXISTS "Allow anonymous insertions for webhooks" ON public.payments;

-- 2. Adicionar política para usuários autenticados (sem remover as existentes)
CREATE POLICY "Students can manage their own payments" 
ON public.payments 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. MANTER políticas existentes para service_role (NÃO REMOVER)
-- Estas políticas já estão funcionando para webhooks

-- 4. Garantir que RLS está ativo
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Conceder permissões explícitas
GRANT ALL ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- RESULTADO ESPERADO:
-- - authenticated: auth.uid() = user_id (nova política)
-- - service_role: políticas existentes mantidas
-- - Sem conflitos entre políticas
-- - Webhooks continuam funcionando
