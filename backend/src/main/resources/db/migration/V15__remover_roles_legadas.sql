-- V15
-- Remove roles legadas que não fazem parte do modelo atual do sistema.

-- Remove os vínculos dos usuários com as roles legadas.
DELETE FROM tb_usuario_role
WHERE role_id IN (
    SELECT id
    FROM tb_role
    WHERE nome IN (
        'ROLE_ADMIN_CONGREGACAO',
        'ROLE_SUPERINTENDENTE',
        'ROLE_SERVOMINISTERIAL'
    )
);

-- Remove as roles legadas.
DELETE FROM tb_role
WHERE nome IN (
    'ROLE_ADMIN_CONGREGACAO',
    'ROLE_SUPERINTENDENTE',
    'ROLE_SERVOMINISTERIAL'
);