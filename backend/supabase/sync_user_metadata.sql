-- Função RPC para sincronizar metadados do usuário
-- Sincroniza automaticamente os metadados do auth com a tabela profiles
-- Mantém consistência entre auth e profiles

CREATE OR REPLACE FUNCTION sync_user_metadata(
    p_user_id UUID,
    p_metadata JSONB
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    profile_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_profile_id UUID;
    v_email TEXT;
    v_full_name TEXT;
    v_avatar_url TEXT;
    v_phone TEXT;
BEGIN
    -- Extrair metadados
    v_email := p_metadata->>'email';
    v_full_name := p_metadata->>'full_name';
    v_avatar_url := p_metadata->>'avatar_url';
    v_phone := p_metadata->>'phone';
    
    -- Inserir ou atualizar perfil
    INSERT INTO profiles (
        id,
        email,
        full_name,
        avatar_url,
        phone,
        updated_at
    ) VALUES (
        p_user_id,
        v_email,
        v_full_name,
        v_avatar_url,
        v_phone,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        avatar_url = EXCLUDED.avatar_url,
        phone = EXCLUDED.phone,
        updated_at = NOW()
    RETURNING profiles.id INTO v_profile_id;
    
    -- Retornar sucesso
    RETURN NEXT
    SELECT 
        true as success,
        'Profile synced successfully' as message,
        v_profile_id as profile_id;
        
EXCEPTION WHEN OTHERS THEN
    RETURN NEXT
    SELECT 
        false as success,
        'Error syncing profile: ' || SQLERRM as message,
        NULL as profile_id;
END;
$$;
