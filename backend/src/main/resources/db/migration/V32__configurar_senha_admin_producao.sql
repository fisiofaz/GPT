DO $$
DECLARE
    hash_admin TEXT := '${admin_password_bcrypt}';
BEGIN
    -- Sem hash configurado, mantém a senha existente no ambiente local.
    IF hash_admin = '' THEN
        RAISE NOTICE 'ADMIN_PASSWORD_BCRYPT ausente; senha mantida.';
        RETURN;
    END IF;

    -- Valida o formato BCrypt: versão, custo e 53 caracteres do hash.
    IF hash_admin !~ '^\$2[aby]\$(0[4-9]|[12][0-9]|3[01])\$[./A-Za-z0-9]{53}$' THEN
        RAISE EXCEPTION 'ADMIN_PASSWORD_BCRYPT não contém um hash BCrypt válido.';
    END IF;

    -- Altera somente a senha inicial conhecida do administrador.
    UPDATE tb_usuario
    SET senha = hash_admin
    WHERE email = 'admin@gpt.com'
      AND senha = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi';

    IF NOT FOUND THEN
        RAISE EXCEPTION
            'Senha inicial do administrador não encontrada. Verifique a conta e o histórico de migrações.';
    END IF;
END $$;
