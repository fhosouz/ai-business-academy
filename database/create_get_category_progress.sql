-- Criar função RPC get_category_progress
-- Esta função calcula o progresso do usuário em uma categoria de cursos

CREATE OR REPLACE FUNCTION public.get_category_progress(category_id uuid, user_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_lessons integer;
  completed_lessons integer;
BEGIN
  -- Contar total de aulas na categoria
  SELECT COUNT(*)
  INTO total_lessons
  FROM lessons l
  JOIN courses c ON l.course_id = c.id
  WHERE c.category_id = get_category_progress.category_id;
  
  IF total_lessons = 0 THEN
    RETURN 0;
  END IF;
  
  -- Contar aulas completadas pelo usuário
  SELECT COUNT(*)
  INTO completed_lessons
  FROM user_lesson_progress ulp
  JOIN lessons l ON ulp.lesson_id = l.id
  JOIN courses c ON l.course_id = c.id
  WHERE c.category_id = get_category_progress.category_id
    AND ulp.user_id = get_category_progress.user_id
    AND ulp.status = 'completed';
  
  RETURN (completed_lessons * 100 / total_lessons);
END;
$$;

-- Conceder permissão de execução para usuários autenticados
GRANT EXECUTE ON FUNCTION public.get_category_progress TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_category_progress TO service_role;

-- Comentário:
-- Esta função é usada para mostrar o progresso do aluno nas categorias de cursos
-- Retorna percentual de 0 a 100 baseado nas aulas completadas
