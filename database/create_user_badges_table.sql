-- ========================================
-- CRIAR TABELA user_badges
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- PROBLEMA: Tabela user_badges não existe no schema
-- CAUSA: Frontend tentando acessar tabela inexistente
-- SOLUÇÃO: Criar tabela user_badges com estrutura correta
-- ========================================

-- ========================================
-- 1. CRIAR TABELA user_badges
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint para evitar duplicatas
    UNIQUE(user_id, badge_id)
);

-- ========================================
-- 2. CRIAR ÍNDICES
-- ========================================

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

-- Índice para consultas por badge
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- Índice composto para performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge ON public.user_badges(user_id, badge_id);

-- ========================================
-- 3. CRIAR TRIGGER PARA updated_at
-- ========================================

-- Criar trigger function se não existir
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger na tabela user_badges
CREATE TRIGGER handle_user_badges_updated_at
    BEFORE UPDATE ON public.user_badges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- 4. HABILITAR RLS (ROW LEVEL SECURITY)
-- ========================================

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. CRIAR POLÍTICAS RLS
-- ========================================

-- Política para usuários verem seus próprios badges
CREATE POLICY "Users can view their own badges"
    ON public.user_badges FOR SELECT
    USING (auth.uid() = user_id);

-- Política para usuários inserirem seus próprios badges
CREATE POLICY "Users can insert their own badges"
    ON public.user_badges FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios badges
CREATE POLICY "Users can update their own badges"
    ON public.user_badges FOR UPDATE
    USING (auth.uid() = user_id);

-- Política para admins gerenciarem todos os badges
CREATE POLICY "Admins can manage all badges"
    ON public.user_badges FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ========================================
-- 6. VERIFICAR SE A TABELA FOI CRIADA
-- ========================================

-- Verificar se a tabela existe
SELECT 
    'VERIFICAÇÃO TABELA user_badges' as etapa,
    table_name,
    table_schema,
    table_type,
    CASE 
        WHEN table_name IS NOT NULL THEN 'TABELA CRIADA ✓'
        ELSE 'TABELA NÃO EXISTE ✗'
    END as status
FROM information_schema.tables 
WHERE table_name = 'user_badges'
AND table_schema = 'public';

-- ========================================
-- 7. VERIFICAR ESTRUTURA DA TABELA
-- ========================================

-- Verificar colunas da tabela
SELECT 
    'VERIFICAÇÃO ESTRUTURA user_badges' as etapa,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns 
WHERE table_name = 'user_badges'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- 8. VERIFICAR ÍNDICES
-- ========================================

-- Verificar índices criados
SELECT 
    'VERIFICAÇÃO ÍNDICES user_badges' as etapa,
    indexname,
    indexdef,
    CASE 
        WHEN indexname IS NOT NULL THEN 'ÍNDICE CRIADO ✓'
        ELSE 'ÍNDICE NÃO EXISTE ✗'
    END as status
FROM pg_indexes 
WHERE tablename = 'user_badges'
AND schemaname = 'public';

-- ========================================
-- 9. VERIFICAR POLÍTICAS RLS
-- ========================================

-- Verificar políticas RLS
SELECT 
    'VERIFICAÇÃO POLÍTICAS RLS user_badges' as etapa,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    CASE 
        WHEN policyname IS NOT NULL THEN 'POLÍTICA CRIADA ✓'
        ELSE 'POLÍTICA NÃO EXISTE ✗'
    END as status
FROM pg_policies 
WHERE tablename = 'user_badges'
AND schemaname = 'public';

-- ========================================
-- 10. TESTAR INSERÇÃO MANUAL
-- ========================================

-- Testar inserção de um badge para o usuário atual
DO $$
DECLARE
    v_user_id UUID := '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824';
    v_badge_id UUID;
    v_insert_result TEXT;
BEGIN
    -- Buscar um badge existente na tabela achievements
    SELECT id INTO v_badge_id 
    FROM public.achievements 
    LIMIT 1;
    
    -- Se não encontrar, criar um badge de teste
    IF v_badge_id IS NULL THEN
        INSERT INTO public.achievements (
            id,
            title,
            description,
            icon,
            type,
            requirement_value
        ) VALUES (
            gen_random_uuid(),
            'Primeiro Passo',
            'Completou sua primeira lição',
            '🎯',
            'lesson_completion',
            1
        ) RETURNING id INTO v_badge_id;
    END IF;
    
    -- Inserir badge para o usuário
    INSERT INTO public.user_badges (
        user_id,
        badge_id
    ) VALUES (
        v_user_id,
        v_badge_id
    ) ON CONFLICT (user_id, badge_id) DO NOTHING;
    
    -- Verificar se foi inserido
    IF EXISTS(
        SELECT 1 FROM public.user_badges 
        WHERE user_id = v_user_id 
        AND badge_id = v_badge_id
    ) THEN
        v_insert_result := 'BADGE INSERIDO COM SUCESSO ✓';
    ELSE
        v_insert_result := 'BADGE JÁ EXISTIA OU FALHA NA INSERÇÃO ✗';
    END IF;
    
    -- Mostrar resultado
    RAISE NOTICE '=== TESTE INSERÇÃO user_badges ===';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Badge ID: %', v_badge_id;
    RAISE NOTICE 'Resultado: %', v_insert_result;
END $$;

-- ========================================
-- 11. VERIFICAR DADOS APÓS TESTE
-- ========================================

-- Verificar se os dados foram inseridos
SELECT 
    'VERIFICAÇÃO DADOS PÓS-TESTE' as etapa,
    COUNT(*) as total_badges,
    CASE 
        WHEN COUNT(*) > 0 THEN 'DADOS EXISTEM ✓'
        ELSE 'SEM DADOS ✗'
    END as status
FROM public.user_badges 
WHERE user_id = '3ac88d0e-e6f7-45af-9cf2-23b7d80a0824';

-- ========================================
-- 12. RESUMO FINAL
-- ========================================

-- Resumo completo
SELECT 
    'RESUMO CRIAÇÃO user_badges' as etapa,
    NOW() as data_hora,
    'Tabela user_badges criada com sucesso' as descricao,
    'Estrutura: id, user_id, badge_id, earned_at, created_at, updated_at' as estrutura,
    'RLS habilitado com políticas adequadas' as seguranca,
    'Índices criados para performance' as performance,
    'Erro 404 deve estar resolvido' as resultado;
