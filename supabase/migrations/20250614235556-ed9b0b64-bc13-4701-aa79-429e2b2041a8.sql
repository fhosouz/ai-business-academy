-- Corrigir perfis com dados nulos
UPDATE public.profiles 
SET display_name = CASE 
  WHEN display_name IS NULL OR display_name = '' THEN 'Usuário'
  ELSE display_name 
END
WHERE display_name IS NULL OR display_name = '';

-- Garantir que todos os usuários tenham roles
INSERT INTO public.user_roles (user_id, role, plan_type)
SELECT p.user_id, 'user', 'free'
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.user_id = ur.user_id
WHERE ur.user_id IS NULL;