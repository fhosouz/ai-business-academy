-- ========================================
-- CRIAR FUNÇÃO RPC sync_google_user_data
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- PROBLEMA: Função sync_google_user_data não existe no schema
-- CAUSA: Frontend tentando chamar função RPC inexistente
-- SOLUÇÃO: Criar função RPC com parâmetros corretos
-- ========================================

-- ========================================
-- 1. CRIAR FUNÇÃO sync_google_user_data
-- ========================================

CREATE OR REPLACE FUNCTION public.sync_google_user_data(
    p_user_id UUID,
    p_metadata JSONB
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result JSON;
    v_profile_exists BOOLEAN;
    v_plan_exists BOOLEAN;
    v_role_exists BOOLEAN;
BEGIN
    -- Verificar se usuário existe
    IF p_user_id IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'user_id is null');
    END IF;
    
    -- Verificar se metadata existe
    IF p_metadata IS NULL THEN
        RETURN json_build_object('success', false, 'error', 'metadata is null');
    END IF;
    
    -- Inserir ou atualizar perfil
    INSERT INTO public.user_profiles (
        user_id, 
        email, 
        full_name, 
        avatar_url,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        p_metadata->>'email',
        p_metadata->>'name',
        p_metadata->>'picture',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        updated_at = NOW();
    
    -- Inserir ou atualizar plano
    INSERT INTO public.user_plans (
        user_id, 
        plan_type, 
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        'free',
        'active',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        plan_type = EXCLUDED.plan_type,
        status = EXCLUDED.status,
        updated_at = NOW();
    
    -- Inserir ou atualizar role
    INSERT INTO public.user_roles (
        user_id, 
        role,
        created_at,
        updated_at
    ) VALUES (
        p_user_id,
        'student',
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        role = EXCLUDED.role,
        updated_at = NOW();
    
    -- Verificar se dados foram criados
    SELECT EXISTS(
        SELECT 1 FROM public.user_profiles WHERE user_id = p_user_id
    ) INTO v_profile_exists;
    
    SELECT EXISTS(
        SELECT 1 FROM public.user_plans WHERE user_id = p_user_id
    ) INTO v_plan_exists;
    
    SELECT EXISTS(
        SELECT 1 FROM public.user_roles WHERE user_id = p_user_id
    ) INTO v_role_exists;
    
    -- Retornar resultado
    v_result := json_build_object(
        'success', true,
        'user_id', p_user_id,
        'profile_exists', v_profile_exists,
        'plan_exists', v_plan_exists,
        'role_exists', v_role_exists,
        'message', 'User data synchronized successfully'
    );
    
    RETURN v_result;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Retornar erro
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'user_id', p_user_id,
            'message', 'Error synchronizing user data'
        );
END;
$$;

-- ========================================
-- 2. VERIFICAR SE A FUNÇÃO FOI CRIADA
-- ========================================

-- Verificar se a função existe no schema
SELECT 
    'VERIFICAÇÃO FUNÇÃO RPC' as etapa,
    routine_name,
    routine_schema,
    routine_type,
    security_type,
    external_language,
    CASE 
        WHEN routine_name IS NOT NULL THEN 'FUNÇÃO CRIADA ✓'
        ELSE 'FUNÇÃO NÃO EXISTE ✗'
    END as status
FROM information_schema.routines 
WHERE routine_name = 'sync_google_user_data'
AND routine_schema = 'public';

-- ========================================
-- 3. TESTAR A FUNÇÃO MANUALMENTE
-- ========================================

-- Testar a função com dados reais
DO $$
DECLARE
    test_result JSON;
    test_user_id UUID := '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824';
    test_metadata JSONB := '{"sub": "114140646333698449366", "name": "Fabricio Souza", "email": "fabricio.henrique.souza99@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocK2_f6jNMoih0g9KTD0iEcU9S1gcNCdZaBHGg0Yo503QPb0Zg=s96-c"}';
BEGIN
    -- Testar a função
    SELECT public.sync_google_user_data(test_user_id, test_metadata) INTO test_result;
    
    -- Mostrar resultado
    RAISE NOTICE '=== TESTE sync_google_user_data ===';
    RAISE NOTICE 'Resultado: %', test_result;
    
    IF (test_result->>'success')::boolean = true THEN
        RAISE NOTICE '✅ Função funcionou corretamente';
    ELSE
        RAISE NOTICE '❌ Erro na função: %', test_result->>'error';
    END IF;
END $$;

-- ========================================
-- 4. VERIFICAR DADOS DO USUÁRIO APÓS TESTE
-- ========================================

-- Verificar se os dados foram criados
SELECT 
    'VERIFICAÇÃO DADOS PÓS-TESTE' as etapa,
    'user_profiles' as tabela,
    COUNT(*) as total_registros,
    CASE 
        WHEN COUNT(*) > 0 THEN 'DADOS EXISTEM ✓'
        ELSE 'SEM DADOS ✗'
    END as status
FROM public.user_profiles 
WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824'

UNION ALL

SELECT 
    'VERIFICAÇÃO DADOS PÓS-TESTE' as etapa,
    'user_plans' as tabela,
    COUNT(*) as total_registros,
    CASE 
        WHEN COUNT(*) > 0 THEN 'DADOS EXISTEM ✓'
        ELSE 'SEM DADOS ✗'
    END as status
FROM public.user_plans 
WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824'

UNION ALL

SELECT 
    'VERIFICAÇÃO DADOS PÓS-TESTE' as etapa,
    'user_roles' as tabela,
    COUNT(*) as total_registros,
    CASE 
        WHEN COUNT(*) > 0 THEN 'DADOS EXISTEM ✓'
        ELSE 'SEM DADOS ✗'
    END as status
FROM public.user_roles 
WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824';

-- ========================================
-- 5. RESUMO FINAL
-- ========================================

-- Resumo completo
SELECT 
    'RESUMO CRIAÇÃO RPC' as etapa,
    NOW() as data_hora,
    'Função sync_google_user_data criada com sucesso' as descricao,
    'Parâmetros: p_user_id, p_metadata' as parametros,
    'Retorno: JSON com resultado da sincronização' as retorno,
    'Erro PGRST202 deve estar resolvido' as resultado;
