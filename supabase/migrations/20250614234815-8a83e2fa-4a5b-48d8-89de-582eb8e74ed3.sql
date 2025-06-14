-- Criar tabela para analytics de acesso às páginas (se não existir)
CREATE TABLE IF NOT EXISTS public.page_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  page_path TEXT NOT NULL,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para sessões de usuário
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pages_visited INTEGER DEFAULT 1,
  duration_seconds INTEGER DEFAULT 0
);

-- Criar tabela para dados de engajamento
CREATE TABLE IF NOT EXISTS public.user_engagement (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'course_view', 'lesson_start', 'lesson_complete', 'search', etc.
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS nas novas tabelas
ALTER TABLE public.page_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_engagement ENABLE ROW LEVEL SECURITY;

-- Políticas para page_analytics
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.page_analytics;
CREATE POLICY "Anyone can insert analytics" 
ON public.page_analytics 
FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view all analytics" ON public.page_analytics;
CREATE POLICY "Admins can view all analytics" 
ON public.page_analytics 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_sessions
CREATE POLICY "Anyone can insert sessions" 
ON public.user_sessions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all sessions" 
ON public.user_sessions 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Políticas para user_engagement
CREATE POLICY "Users can insert their own engagement" 
ON public.user_engagement 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all engagement" 
ON public.user_engagement 
FOR SELECT 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Criar função para obter dados de analytics reais
CREATE OR REPLACE FUNCTION public.get_analytics_data()
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  result jsonb := '{}';
  page_views_data jsonb;
  user_growth_data jsonb;
  top_content_data jsonb;
BEGIN
  -- Dados de visualização de páginas (últimos 30 dias)
  SELECT jsonb_agg(
    jsonb_build_object(
      'page', 
      CASE page_path
        WHEN '/' THEN 'Dashboard'
        WHEN '/courses' THEN 'Cursos'
        WHEN '/lessons' THEN 'Aulas'
        WHEN '/profile' THEN 'Perfil'
        WHEN '/admin' THEN 'Admin'
        ELSE page_path
      END,
      'views', views_count
    )
  ) INTO page_views_data
  FROM (
    SELECT 
      page_path,
      COUNT(*) as views_count
    FROM public.page_analytics 
    WHERE created_at >= now() - interval '30 days'
    GROUP BY page_path
    ORDER BY views_count DESC
    LIMIT 10
  ) pv;

  -- Crescimento de usuários (últimos 7 dias)
  SELECT jsonb_agg(
    jsonb_build_object(
      'date', date_created,
      'users', users_count
    )
  ) INTO user_growth_data
  FROM (
    SELECT 
      DATE(created_at) as date_created,
      COUNT(*) as users_count
    FROM public.profiles 
    WHERE created_at >= now() - interval '7 days'
    GROUP BY DATE(created_at)
    ORDER BY date_created
  ) ug;

  -- Conteúdo mais acessado
  SELECT jsonb_agg(
    jsonb_build_object(
      'type', event_type,
      'count', event_count
    )
  ) INTO top_content_data
  FROM (
    SELECT 
      event_type,
      COUNT(*) as event_count
    FROM public.user_engagement 
    WHERE created_at >= now() - interval '30 days'
    GROUP BY event_type
    ORDER BY event_count DESC
    LIMIT 5
  ) tc;

  -- Construir resultado final
  result := jsonb_build_object(
    'page_views', COALESCE(page_views_data, '[]'::jsonb),
    'user_growth', COALESCE(user_growth_data, '[]'::jsonb),
    'top_content', COALESCE(top_content_data, '[]'::jsonb)
  );

  RETURN result;
END;
$$;