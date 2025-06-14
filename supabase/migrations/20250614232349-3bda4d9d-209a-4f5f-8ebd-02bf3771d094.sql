-- Adicionar colunas à tabela profiles para armazenar dados do Google
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS google_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS picture_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS given_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS family_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locale TEXT;

-- Criar enum para tipos de plano
CREATE TYPE public.plan_type AS ENUM ('free', 'premium', 'enterprise');

-- Adicionar coluna plan_type à tabela user_roles
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS plan_type public.plan_type DEFAULT 'free';

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_profiles_google_id ON public.profiles(google_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_plan_type ON public.user_roles(plan_type);

-- Atualizar função handle_new_user para incluir dados do Google e plano padrão
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  -- Insert profile with Google data if available
  INSERT INTO public.profiles (
    user_id, 
    display_name,
    avatar_url,
    google_id,
    picture_url,
    given_name,
    family_name,
    locale
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
    NEW.raw_user_meta_data ->> 'locale'
  );
  
  -- Assign default 'user' role with 'free' plan
  INSERT INTO public.user_roles (user_id, role, plan_type)
  VALUES (NEW.id, 'user', 'free');
  
  RETURN NEW;
END;
$$;