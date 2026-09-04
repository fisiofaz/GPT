-- V14
-- Consolida ROLE_SUPERINTENDENTE em ROLE_SUPERINTENDENTE_SERVICO.

-- Transfere as associações dos usuários da role antiga
-- para a role nova, evitando duplicidades.
INSERT INTO tb_usuario_role (usuario_id, role_id)
SELECT ur.usuario_id, role_nova.id
FROM tb_usuario_role ur
JOIN tb_role role_antiga
    ON role_antiga.id = ur.role_id
JOIN tb_role role_nova
    ON role_nova.nome = 'ROLE_SUPERINTENDENTE_SERVICO'
WHERE role_antiga.nome = 'ROLE_SUPERINTENDENTE'
  AND NOT EXISTS (
      SELECT 1
      FROM tb_usuario_role ur_existente
      WHERE ur_existente.usuario_id = ur.usuario_id
        AND ur_existente.role_id = role_nova.id
  );

-- Remove as associações com a role antiga.
DELETE FROM tb_usuario_role
WHERE role_id = (
    SELECT id
    FROM tb_role
    WHERE nome = 'ROLE_SUPERINTENDENTE'
);

-- Remove a role antiga.
DELETE FROM tb_role
WHERE nome = 'ROLE_SUPERINTENDENTE';