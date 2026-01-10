-- ========================================
-- CORREÇÃO DE SINTAXE - DIAGNÓSTICO CORRETO
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- 1. DIAGNÓSTICO CORRETO DAS POLICIES
-- ========================================

-- Corrigido: tablename -> tablename (coluna correta em pg_policies)
SELECT 
    'DIAGNÓSTICO CORRETO' as tipo,
    tablename,
    policyname,
    cmd,
    qual,
    CASE 
        WHEN qual IS NULL THEN 'PROBLEMÁTICA'
        WHEN qual = '' THEN 'PROBLEMÁTICA'
        ELSE 'OK'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND cmd = 'INSERT'
AND tablename IN ('user_profiles', 'user_plans', 'user_roles', 'user_notifications')
ORDER BY tablename, policyname;

-- ========================================
-- 2. VERIFICAR SE O TRIGGER EXISTE
-- ========================================

-- Verificar se o trigger existe
SELECT 
    'TRIGGER EXISTE?' as status,
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
-- 3. VERIFICAR SE A FUNÇÃO handle_new_user EXISTE
-- ========================================

-- Verificar se a função existe
SELECT 
    'FUNÇÃO EXISTE?' as status,
    routine_name,
    routine_schema,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user'
AND routine_schema = 'public';

-- ========================================
-- 4. VERIFICAR DADOS ATUAIS DO USUÁRIO
-- ========================================

-- Verificar se usuário já tem dados
SELECT 
    'DADOS ATUAIS DO USUÁRIO' as tipo,
    (SELECT COUNT(*) FROM public.user_profiles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as tem_perfil,
    (SELECT COUNT(*) FROM public.user_plans WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as tem_plano,
    (SELECT COUNT(*) FROM public.user_roles WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as tem_role,
    (SELECT COUNT(*) FROM public.user_notifications WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824') as tem_notifications;
