-- ========================================
-- VERIFICAÇÃO: POLICIES REMOVIDAS COM SUCESSO?
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- 1. VERIFICAR SE AS POLICIES PROBLEMÁTICAS AINDA EXISTEM
-- ========================================

-- Verificar se as policies específicas ainda existem
SELECT 
    'VERIFICAÇÃO DE POLICIES REMOVIDAS' as tipo,
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
AND policyname IN (
    'Users can insert own profile',
    'Users can insert own plan', 
    'Users can insert own role',
    'Users can insert own notifications'
)
ORDER BY tablename, policyname;

-- ========================================
-- 2. VERIFICAR TODAS AS POLICIES INSERT RESTANTES
-- ========================================

-- Verificar todas as policies INSERT que ainda existem
SELECT 
    'TODAS AS POLICIES INSERT RESTANTES' as tipo,
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
-- 3. RESUMO DA VERIFICAÇÃO
-- ========================================

-- Resumo claro do status
SELECT 
    'RESUMO DA VERIFICAÇÃO' as status,
    (SELECT COUNT(*) FROM pg_policies 
     WHERE schemaname = 'public'
     AND cmd = 'INSERT'
     AND tablename IN ('user_profiles', 'user_plans', 'user_roles', 'user_notifications')
     AND qual IS NULL) as problematicas_restantes,
    
    (SELECT COUNT(*) FROM pg_policies 
     WHERE schemaname = 'public'
     AND cmd = 'INSERT'
     AND tablename IN ('user_profiles', 'user_plans', 'user_roles', 'user_notifications')
     AND qual IS NOT NULL) as corretas_restantes,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies 
              WHERE schemaname = 'public'
              AND cmd = 'INSERT'
              AND tablename IN ('user_profiles', 'user_plans', 'user_roles', 'user_notifications')
              AND qual IS NULL) = 0 
        THEN 'TODAS PROBLEMÁTICAS REMOVIDAS ✓'
        ELSE 'AINDA EXISTEM POLICIES PROBLEMÁTICAS ✗'
    END as resultado_final;
