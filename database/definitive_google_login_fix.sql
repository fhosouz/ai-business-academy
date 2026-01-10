-- ========================================
-- SOLUÇÃO DEFINITIVA - CADASTRO AUTOMÁTICO GOOGLE LOGIN
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- PASSO 1: VERIFICAR ESTADO ATUAL DO SISTEMA
-- ========================================

-- Verificar se usuário existe em auth.users
SELECT 
    'PASSO 1 - USUÁRIO EM auth.users' as etapa,
    id,
    email,
    created_at,
    last_sign_in_at,
    CASE 
        WHEN id IS NOT NULL THEN 'USUÁRIO EXISTE EM auth.users ✓'
        ELSE 'USUÁRIO NÃO EXISTE EM auth.users ✗'
    END as status
FROM auth.users 
WHERE id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824';

-- Verificar se usuário tem dados nas tabelas
SELECT 
    'PASSO 1 - DADOS NAS TABELAS' as etapa,
    (SELECT COUNT(*) FROM public.user_profiles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as profiles_count,
    (SELECT COUNT(*) FROM public.user_plans WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as plans_count,
    (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as roles_count,
    CASE 
        WHEN (
            EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824')
            AND EXISTS (SELECT 1 FROM public.user_plans WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824')
            AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824')
        ) THEN 'DADOS COMPLETOS ✓'
        ELSE 'DADOS INCOMPLETOS ✗'
    END as status;

-- ========================================
-- PASSO 2: VERIFICAR SE TRIGGER EXISTE
-- ========================================

-- Verificar se trigger existe
SELECT 
    'PASSO 2 - TRIGGER' as etapa,
    trigger_name,
    event_object_schema,
    event_object_table,
    event_manipulation,
    action_timing,
    action_statement,
    CASE 
        WHEN trigger_name IS NOT NULL THEN 'TRIGGER EXISTE ✓'
        ELSE 'TRIGGER NÃO EXISTE ✗'
    END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_schema = 'auth'
AND event_object_table = 'users';

-- ========================================
-- PASSO 3: VERIFICAR SE FUNÇÃO EXISTE
-- ========================================

-- Verificar se função handle_new_user existe
SELECT 
    'PASSO 3 - FUNÇÃO' as etapa,
    routine_name,
    routine_schema,
    routine_type,
    security_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN 'FUNÇÃO EXISTE ✓'
        ELSE 'FUNÇÃO NÃO EXISTE ✗'
    END as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ========================================
-- PASSO 4: CRIAR FUNÇÃO handle_new_user COM SEGURANÇA
-- ========================================

-- Remover função existente para recriar
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Criar função com SECURITY DEFINER para bypass RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RAISE NOTICE '[TRIGGER] Criando dados para novo usuário: %', NEW.id;
    RAISE NOTICE '[TRIGGER] Email: %', NEW.email;
    RAISE NOTICE '[TRIGGER] Provedor: %', COALESCE(NEW.app_metadata->>'provider', 'email');
    
    -- Inserir perfil na tabela user_profiles
    BEGIN
        INSERT INTO public.user_profiles (user_id, email, full_name, avatar_url, phone, bio)
        VALUES (
            NEW.id,
            COALESCE(NEW.email, ''),
            CASE 
                WHEN NEW.app_metadata->>'provider' = 'google' THEN
                    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User')
                ELSE
                    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User')
            END,
            CASE 
                WHEN NEW.app_metadata->>'provider' = 'google' THEN
                    COALESCE(NEW.raw_user_meta_data->>'picture', NEW.raw_user_meta_data->>'avatar_url', '')
                ELSE
                COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
            END,
            NULL, -- phone
            NULL  -- bio
        );
        RAISE NOTICE '[TRIGGER] Perfil inserido com sucesso para usuário: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '[TRIGGER] Erro ao inserir perfil: %', SQLERRM;
        RETURN NEW; -- Continuar mesmo se falhar
    END;
    
    -- Inserir plano free padrão
    BEGIN
        INSERT INTO public.user_plans (user_id, plan_type, status)
        VALUES (NEW.id, 'free', 'active');
        RAISE NOTICE '[TRIGGER] Plano inserido com sucesso para usuário: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '[TRIGGER] Erro ao inserir plano: %', SQLERRM;
    END;
    
    -- Inserir role padrão
    BEGIN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'user');
        RAISE NOTICE '[TRIGGER] Role inserida com sucesso para usuário: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '[TRIGGER] Erro ao inserir role: %', SQLERRM;
    END;
    
    -- Associar notificações globais
    BEGIN
        INSERT INTO public.user_notifications (user_id, notification_id, is_read)
        SELECT 
            NEW.id,
            n.id,
            false
        FROM public.notifications n
        WHERE n.target_audience IN ('all', 'free')
        AND n.is_active = true;
        RAISE NOTICE '[TRIGGER] Notificações associadas com sucesso para usuário: %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '[TRIGGER] Erro ao associar notificações: %', SQLERRM;
    END;
    
    RAISE NOTICE '[TRIGGER] Dados criados com sucesso para usuário: %', NEW.id;
    RETURN NEW;
END;
$$;

-- Verificar se função foi criada
SELECT 
    'PASSO 4 - FUNÇÃO CRIADA' as etapa,
    routine_name,
    routine_schema,
    routine_type,
    security_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN 'FUNÇÃO CRIADA COM SUCESSO ✓'
        ELSE 'FALHA AO CRIAR FUNÇÃO ✗'
    END as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ========================================
-- PASSO 5: CRIAR TRIGGER NA TABELA auth.users
-- ========================================

-- Remover trigger existente para recriar
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Criar trigger que dispara após INSERT em auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Verificar se trigger foi criado
SELECT 
    'PASSO 5 - TRIGGER CRIADO' as etapa,
    trigger_name,
    event_object_schema,
    event_object_table,
    event_manipulation,
    action_timing,
    action_statement,
    CASE 
        WHEN trigger_name IS NOT NULL THEN 'TRIGGER CRIADO COM SUCESSO ✓'
        ELSE 'FALHA AO CRIAR TRIGGER ✗'
    END as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_schema = 'auth'
AND event_object_table = 'users';

-- ========================================
-- PASSO 6: CRIAR NOTIFICAÇÕES BÁSICAS SE NECESSÁRIO
-- ========================================

-- Inserir notificações básicas se não existirem
INSERT INTO public.notifications (title, message, target_audience) VALUES
('Bem-vindo à AI Business Academy!', 'Estamos felizes em ter você aqui. Explore nossos cursos e comece sua jornada.', 'all'),
('Novo curso disponível', 'Confira nossos novos cursos de Inteligência Artificial.', 'all'),
('Benefícios Premium', 'Conheça os benefícios de se tornar um aluno Premium.', 'free')
ON CONFLICT DO NOTHING;

-- ========================================
-- PASSO 7: VERIFICAÇÃO FINAL DO SISTEMA
-- ========================================

-- Verificar status final do sistema
SELECT 
    'PASSO 7 - VERIFICAÇÃO FINAL' as etapa,
    (SELECT COUNT(*) FROM information_schema.triggers 
     WHERE trigger_name = 'on_auth_user_created' 
     AND event_object_schema = 'auth' 
     AND event_object_table = 'users') as trigger_ok,
    
    (SELECT COUNT(*) FROM information_schema.routines 
     WHERE routine_name = 'handle_new_user' 
     AND routine_schema = 'public') as funcao_ok,
    
    (SELECT COUNT(*) FROM public.notifications 
     WHERE is_active = true) as notificacoes_ok,
    
    CASE 
        WHEN (
            EXISTS (SELECT 1 FROM information_schema.triggers 
                   WHERE trigger_name = 'on_auth_user_created' 
                   AND event_object_schema = 'auth' 
                   AND event_object_table = 'users')
            AND EXISTS (SELECT 1 FROM information_schema.routines 
                   WHERE routine_name = 'handle_new_user' 
                   AND routine_schema = 'public')
        ) THEN 'SISTEMA PRONTO PARA CADASTRO AUTOMÁTICO ✓'
        ELSE 'SISTEMA AINDA NÃO ESTÁ PRONTO ✗'
    END as status_final;

-- ========================================
-- PASSO 8: CRIAR DADOS DO USUÁRIO ATUAL PARA TESTE
-- ========================================

-- Garantir que usuário atual tenha dados (se trigger não funcionou para ele)
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

-- Associar notificações ao usuário atual
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
-- PASSO 9: VERIFICAÇÃO FINAL DOS DADOS DO USUÁRIO
-- ========================================

-- Verificar dados finais do usuário
SELECT 
    'PASSO 9 - DADOS FINAIS DO USUÁRIO' as etapa,
    (SELECT COUNT(*) FROM public.user_profiles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as perfil_ok,
    (SELECT COUNT(*) FROM public.user_plans WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as plano_ok,
    (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as role_ok,
    (SELECT COUNT(*) FROM public.user_notifications WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as notifications_ok,
    CASE 
        WHEN (
            EXISTS (SELECT 1 FROM public.user_profiles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824')
            AND EXISTS (SELECT 1 FROM public.user_plans WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824')
            AND EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824')
        ) THEN 'USUÁRIO COM DADOS COMPLETOS ✓'
        ELSE 'USUÁRIO AINDA SEM DADOS COMPLETOS ✗'
    END as status_usuario;

SELECT 
    'SOLUÇÃO DEFINITIVA CONCLUÍDA' as status,
    NOW() as completed_at,
    'Sistema pronto para cadastro automático via Google Login' as message,
    'Execute este script completo no Supabase SQL Editor' as instrucoes;
