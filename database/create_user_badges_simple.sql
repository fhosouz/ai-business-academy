-- ========================================
-- CRIAR TABELA achievements PRIMEIRO - SUPABASE
-- AI BUSINESS ACADEMY
-- ========================================

-- ========================================
-- 1. CRIAR TABELA achievements (PRIMEIRO)
-- ========================================

CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    badge_type TEXT DEFAULT 'course_completion' CHECK (badge_type IN ('course_completion', 'streak', 'achievement', 'milestone')),
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. CRIAR TRIGGER PARA achievements
-- ========================================

-- Criar trigger function se não existir
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para achievements
DROP TRIGGER IF EXISTS achievements_updated_at ON public.achievements;
CREATE TRIGGER achievements_updated_at
    BEFORE UPDATE ON public.achievements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- 3. CRIAR TABELA user_badges (DEPOIS)
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
-- 4. CRIAR ÍNDICES PARA user_badges
-- ========================================

-- Índice para consultas por usuário
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);

-- Índice para consultas por badge
CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON public.user_badges(badge_id);

-- Índice composto para performance
CREATE INDEX IF NOT EXISTS idx_user_badges_user_badge ON public.user_badges(user_id, badge_id);

-- ========================================
-- 5. CRIAR TRIGGER PARA user_badges
-- ========================================

-- Criar trigger para user_badges
DROP TRIGGER IF EXISTS user_badges_updated_at ON public.user_badges;
CREATE TRIGGER user_badges_updated_at
    BEFORE UPDATE ON public.user_badges
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ========================================
-- 6. INSERIR BADGES INICIAIS
-- ========================================

-- Inserir alguns badges básicos se não existirem
INSERT INTO public.achievements (title, description, icon, badge_type, points) VALUES
    ('Primeiro Curso', 'Completou seu primeiro curso', '🎓', 'course_completion', 100),
    ('Estudante Dedicado', 'Completou 5 cursos', '📚', 'milestone', 500),
    ('Mestre em IA', 'Completou todos os cursos de IA', '🤖', 'achievement', 1000),
    ('Semana de Estudos', 'Estudou por 7 dias seguidos', '🔥', 'streak', 50),
    ('Explorador', 'Acessou todos os módulos', '🗺️', 'achievement', 200)
ON CONFLICT DO NOTHING;

-- ========================================
-- 7. VERIFICAÇÃO FINAL - SIMPLIFICADA
-- ========================================

-- Verificar se achievements foi criada
SELECT 
    'VERIFICAÇÃO achievements' as etapa,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'achievements' AND table_schema = 'public'
        ) THEN 'TABELA achievements CRIADA ✓'
        ELSE 'ERRO: TABELA NÃO FOI CRIADA ✗'
    END as status;

-- Verificar se user_badges foi criada
SELECT 
    'VERIFICAÇÃO user_badges' as etapa,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'user_badges' AND table_schema = 'public'
        ) THEN 'TABELA user_badges CRIADA ✓'
        ELSE 'ERRO: TABELA NÃO FOI CRIADA ✗'
    END as status;

-- ========================================
-- 8. CONCLUSÃO
-- ========================================

SELECT 
    'CONCLUSÃO' as etapa,
    'Tabelas achievements e user_badges criadas com sucesso!' as mensagem,
    NOW() as data_hora;
