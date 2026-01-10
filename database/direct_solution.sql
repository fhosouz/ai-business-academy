-- ========================================
-- SOLUÇÃO DIRETA - DESABILITAR RLS TEMPORARIAMENTE
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- PROBLEMA REAL: Policy não pode ser atualizada
-- SOLUÇÃO: Desabilitar RLS, criar dados, reabilitar
-- ========================================

-- ========================================
-- 1. DESABILITAR RLS TEMPORARIAMENTE
-- ========================================

-- Desabilitar RLS para permitir que o trigger funcione
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications DISABLE ROW LEVEL SECURITY;

-- ========================================
-- 2. VERIFICAR SE O TRIGGER FUNCIONA AGORA
-- ========================================

-- Verificar se o trigger existe
SELECT 
    'TRIGGER EXISTE' as status,
    trigger_name,
    event_object_schema,
    event_object_table,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_schema = 'auth'
AND event_object_table = 'users';

-- ========================================
-- 3. GARANTIR DADOS DO USUÁRIO ATUAL
-- ========================================

-- Inserir dados do usuário atual (sem RLS)
INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, phone, bio)
VALUES ('3ac88d0e-e6f7-45af-9cf2-23b7d80a0824', 'luanaperes@example.com', 'Luana Peres', NULL, NULL, NULL)
ON CONFLICT (user_id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

INSERT INTO public.user_plans (user_id, plan_type, status)
VALUES ('3ac88d0e-e6f7-45af-9cf2-23b7d80a0824', 'free', 'active')
ON CONFLICT (user_id) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO public.user_roles (user_id, role)
VALUES ('3ac88d0e-e6f7-45af-9cf2-23b7d80a0824', 'user')
ON CONFLICT (user_id, role) DO NOTHING;

-- Inserir notificações básicas
INSERT INTO public.notifications (title, message, target_audience) VALUES
('Bem-vindo à AI Business Academy!', 'Estamos felizes em ter você aqui. Explore nossos cursos e comece sua jornada.', 'all'),
('Novo curso disponível', 'Confira nossos novos cursos de Inteligência Artificial.', 'all'),
('Benefícios Premium', 'Conheça os benefícios de se tornar um aluno Premium.', 'free')
ON CONFLICT DO NOTHING;

-- Associar notificações ao usuário
INSERT INTO public.user_notifications (user_id, notification_id, is_read)
SELECT 
    '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824'::UUID,
    n.id,
    false
FROM public.notifications n
WHERE n.target_audience IN ('all', 'free')
AND n.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM public.user_notifications un 
    WHERE un.user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824'::UUID 
    AND un.notification_id = n.id
)
ON CONFLICT (user_id, notification_id) DO NOTHING;

-- ========================================
-- 4. VERIFICAR DADOS CRIADOS
-- ========================================

-- Verificar se todos os dados foram criados
SELECT 
    'DADOS DO USUÁRIO' as tipo,
    (SELECT COUNT(*) FROM public.user_profiles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as perfil_ok,
    (SELECT COUNT(*) FROM public.user_plans WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as plano_ok,
    (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as role_ok,
    (SELECT COUNT(*) FROM public.user_notifications WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as notifications_ok;

-- ========================================
-- 5. REABILITAR RLS COM POLICIES SIMPLES
-- ========================================

-- Reabilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- Criar policies simples que funcionam
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own plan" ON public.user_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own plan" ON public.user_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own role" ON public.user_roles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.user_notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.user_notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ========================================
-- 6. VERIFICAÇÃO FINAL
-- ========================================

-- Verificar status final
SELECT 
    'SOLUÇÃO DIRETA CONCLUÍDA' as status,
    NOW() as completed_at,
    'RLS desabilitado, dados criados, RLS reabilitado' as message,
    (SELECT COUNT(*) FROM public.user_profiles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as usuario_perfil_ok,
    (SELECT COUNT(*) FROM public.user_plans WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as usuario_plano_ok,
    (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as usuario_role_ok,
    'Sistema funcional e login deve funcionar' as resultado;
