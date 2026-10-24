
DO $$
DECLARE
    hash_admin TEXT := '${admin_password_bcrypt}';
BEGIN
    -- No ambiente local, não altera a senha se não houver hash configurado.
    IF hash_admin IS NULL OR hash_admin = '' THEN
        RAISE NOTICE
            'ADMIN_PASSWORD_BCRYPT ausente; senha mantida neste ambiente.';
        RETURN;
    END IF;

    -- Valida o formato BCrypt.
    IF hash_admin !~ '^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$' THEN
        RAISE EXCEPTION
            'ADMIN_PASSWORD_BCRYPT não contém um hash BCrypt válido.';
    END IF;

    -- Atualiza somente a senha do administrador.
    UPDATE tb_usuario
    SET senha = hash_admin
    WHERE email = 'admin@gpt.com';

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Usuário admin@gpt.com não encontrado.';
    END IF;

    RAISE NOTICE
        'Senha do administrador atualizada pela migração V33.';
END $$;
