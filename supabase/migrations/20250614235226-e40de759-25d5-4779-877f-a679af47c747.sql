-- Corrigir constraint única na tabela profiles para user_id
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_key,
ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);

-- Corrigir a função sync_google_user_data para usar ON CONFLICT corretamente
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
    _metadata ->> 'provider_id',
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
    updated_at = now();
  
  -- Garantir que o usuário tenha uma role
  INSERT INTO public.user_roles (user_id, role, plan_type)
  VALUES (_user_id, 'user', 'free')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;