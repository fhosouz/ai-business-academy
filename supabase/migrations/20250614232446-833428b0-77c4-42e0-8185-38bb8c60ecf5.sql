-- Criar função para verificar plano do usuário
CREATE OR REPLACE FUNCTION public.get_user_plan(_user_id uuid)
RETURNS plan_type
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT plan_type
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Criar função para verificar se usuário pode acessar conteúdo premium
CREATE OR REPLACE FUNCTION public.can_access_premium(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND plan_type IN ('premium', 'enterprise')
  )
$$;

-- Adicionar política para cursos baseada no plano
CREATE POLICY "Free users can only view free courses" 
ON public.courses 
FOR SELECT 
TO authenticated
USING (
  is_premium = false OR 
  public.can_access_premium(auth.uid())
);

-- Adicionar política para aulas baseada no plano
CREATE POLICY "Free users can only view free lessons" 
ON public.lessons 
FOR SELECT 
TO authenticated
USING (
  is_free = true OR 
  public.can_access_premium(auth.uid())
);