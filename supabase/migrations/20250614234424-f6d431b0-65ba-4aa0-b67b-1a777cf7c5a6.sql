-- Adicionar campos de telefone e endereço à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT;

-- Atualizar a função handle_new_user para capturar mais dados do Google
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile with all Google data available
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
    NEW.id, 
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      NEW.raw_user_meta_data ->> 'display_name'
    ),
    COALESCE(
      NEW.raw_user_meta_data ->> 'avatar_url',
      NEW.raw_user_meta_data ->> 'picture'
    ),
    NEW.raw_user_meta_data ->> 'provider_id',
    NEW.raw_user_meta_data ->> 'picture',
    NEW.raw_user_meta_data ->> 'given_name',
    NEW.raw_user_meta_data ->> 'family_name',
    NEW.raw_user_meta_data ->> 'locale',
    NEW.raw_user_meta_data ->> 'phone_number'
  );
  
  -- Assign default 'user' role with 'free' plan
  INSERT INTO public.user_roles (user_id, role, plan_type)
  VALUES (NEW.id, 'user', 'free');
  
  RETURN NEW;
END;
$$;

-- Criar função para sincronizar dados do Google no login
CREATE OR REPLACE FUNCTION public.sync_google_user_data(_user_id uuid, _metadata jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar dados do perfil com informações mais recentes do Google
  UPDATE public.profiles 
  SET 
    display_name = COALESCE(
      _metadata ->> 'name',
      _metadata ->> 'full_name',
      _metadata ->> 'display_name',
      display_name
    ),
    avatar_url = COALESCE(
      _metadata ->> 'avatar_url',
      _metadata ->> 'picture',
      avatar_url
    ),
    picture_url = COALESCE(
      _metadata ->> 'picture',
      picture_url
    ),
    given_name = COALESCE(
      _metadata ->> 'given_name',
      given_name
    ),
    family_name = COALESCE(
      _metadata ->> 'family_name',
      family_name
    ),
    locale = COALESCE(
      _metadata ->> 'locale',
      locale
    ),
    phone = COALESCE(
      _metadata ->> 'phone_number',
      phone
    ),
    updated_at = now()
  WHERE user_id = _user_id;
  
  -- Se o perfil não existir, criar um novo
  IF NOT FOUND THEN
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
    );
  END IF;
  
  -- Garantir que o usuário tenha uma role
  INSERT INTO public.user_roles (user_id, role, plan_type)
  VALUES (_user_id, 'user', 'free')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;