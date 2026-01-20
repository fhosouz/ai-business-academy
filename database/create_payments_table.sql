-- Verificar e criar tabela payments se não existir
CREATE TABLE IF NOT EXISTS public.payments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    provider text NOT NULL DEFAULT 'MERCADO_PAGO',
    external_payment_id text NOT NULL,
    external_reference text,
    amount numeric(10,2) NOT NULL,
    status text NOT NULL DEFAULT 'PENDING',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_payment_id ON public.payments(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON public.payments(created_at);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Habilitar RLS na tabela
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Verificar se a tabela foi criada
SELECT 
    'TABLE CREATED' as status,
    table_name,
    table_type,
    is_insertable_into
FROM information_schema.tables 
WHERE table_name = 'payments' AND table_schema = 'public';
