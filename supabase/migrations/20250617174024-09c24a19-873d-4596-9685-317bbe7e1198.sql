-- Adicionar coluna plan_type na tabela lessons se não existir
ALTER TABLE public.lessons 
ADD COLUMN IF NOT EXISTS plan_type plan_type DEFAULT 'free';