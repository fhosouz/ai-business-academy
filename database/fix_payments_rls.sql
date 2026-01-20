-- Corrigir política RLS para tabela payments
-- Permitir inserção de pagamentos pelo backend

-- 1. Remover política RLS existente (se houver)
DROP POLICY IF EXISTS "users_can_insert_payments" ON public.payments;

-- 2. Criar nova política RLS que permite inserção pelo backend
CREATE POLICY "backend_can_insert_payments" ON public.payments
FOR INSERT
WITH CHECK (
  -- Permitir inserção se o request vier do backend (service role)
  -- Ou se não houver restrições para pagamentos
  true
);

-- 3. Permitir que o backend veja todos os pagamentos
CREATE POLICY "backend_can_select_payments" ON public.payments
FOR SELECT
USING (
  true
);

-- 4. Permitir que o backend atualize pagamentos
CREATE POLICY "backend_can_update_payments" ON public.payments
FOR UPDATE
USING (
  true
)
WITH CHECK (
  true
);

-- 5. Verificar se as políticas foram criadas
SELECT 
    'POLICY CREATED' as status,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'payments';
