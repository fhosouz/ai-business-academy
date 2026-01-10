-- ========================================
-- PASSO 2: REMOVER POLICIES PROBLEMÁTICAS
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- 1. REMOVER POLICY DE user_notifications
-- ========================================

-- Remover a policy problemática de user_notifications
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.user_notifications;

-- Verificar se foi removida
SELECT 
    'user_notifications - REMOVIDA?' as status,
    COUNT(*) as existe
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'user_notifications'
AND policyname = 'Users can insert own notifications';

-- ========================================
-- 2. REMOVER POLICY DE user_profiles
-- ========================================

-- Remover a policy problemática de user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Verificar se foi removida
SELECT 
    'user_profiles - REMOVIDA?' as status,
    COUNT(*) as existe
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'user_profiles'
AND policyname = 'Users can insert own profile';

-- ========================================
-- 3. REMOVER POLICY DE user_roles
-- ========================================

-- Remover a policy problemática de user_roles
DROP POLICY IF EXISTS "Users can insert own role" ON public.user_roles;

-- Verificar se foi removida
SELECT 
    'user_roles - REMOVIDA?' as status,
    COUNT(*) as existe
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename = 'user_roles'
AND policyname = 'Users can insert own role';

-- ========================================
-- 4. VERIFICAÇÃO FINAL DAS REMOÇÕES
-- ========================================

-- Verificar se todas as policies problemáticas foram removidas
SELECT 
    'VERIFICAÇÃO FINAL' as tipo,
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
