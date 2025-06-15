-- Atualizar função sync_google_user_data para capturar mais campos do Google
CREATE OR REPLACE FUNCTION public.sync_google_user_data(_user_id uuid, _metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar ou inserir dados do perfil com informações do Google
  INSERT INTO public.profiles (
    user_id, 
    display_name,
    avatar_url,
    google_id,
    picture_url,
    given_name,
    family_name,
    locale,
    phone
  )
  VALUES (
    _user_id, 
    COALESCE(
      _metadata ->> 'name',
      _metadata ->> 'full_name',
      _metadata ->> 'display_name'
    ),
    COALESCE(
      _metadata ->> 'avatar_url',
      _metadata ->> 'picture'
    ),
    _metadata ->> 'sub',
    _metadata ->> 'picture',
    _metadata ->> 'given_name',
    _metadata ->> 'family_name',
    _metadata ->> 'locale',
    _metadata ->> 'phone_number'
  )
  ON CONFLICT (user_id) 
  DO UPDATE SET
    display_name = COALESCE(
      _metadata ->> 'name',
      _metadata ->> 'full_name',
      _metadata ->> 'display_name',
      profiles.display_name
    ),
    avatar_url = COALESCE(
      _metadata ->> 'avatar_url',
      _metadata ->> 'picture',
      profiles.avatar_url
    ),
    picture_url = COALESCE(
      _metadata ->> 'picture',
      profiles.picture_url
    ),
    given_name = COALESCE(
      _metadata ->> 'given_name',
      profiles.given_name
    ),
    family_name = COALESCE(
      _metadata ->> 'family_name',
      profiles.family_name
    ),
    locale = COALESCE(
      _metadata ->> 'locale',
      profiles.locale
    ),
    phone = COALESCE(
      _metadata ->> 'phone_number',
      profiles.phone
    ),
    google_id = COALESCE(
      _metadata ->> 'sub',
      profiles.google_id
    ),
    updated_at = now();
  
  -- Garantir que o usuário tenha uma role
  INSERT INTO public.user_roles (user_id, role, plan_type)
  VALUES (_user_id, 'user', 'free')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Criar política RLS para permitir que usuários vejam apenas seus próprios dados
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Atualizar dados do usuário mais recente com metadados corretos
UPDATE public.profiles 
SET 
  given_name = CASE 
    WHEN display_name LIKE '%Heitor%' THEN 'Heitor Lorenzo'
    ELSE given_name 
  END,
  family_name = CASE 
    WHEN display_name LIKE '%Heitor%' THEN 'Peres de Oliveira Souza'
    ELSE family_name 
  END
WHERE display_name IS NOT NULL AND display_name != 'Usuário';