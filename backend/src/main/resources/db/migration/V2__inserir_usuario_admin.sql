-- Inserir congregação inicial de teste
INSERT INTO tb_congregacao (nome, cidade, estado) 
VALUES ('Congregação Central', 'Santa Maria', 'RS');

-- Inserir usuário Admin (Senha padrão: admin123 codificada em BCrypt)
-- Hash BCrypt para 'admin123': $2a$10$7EqJtq98hPqEX7fNZaFWoO9yBLxIeB54/hFomU5o698gDfs3g2v6a
INSERT INTO tb_usuario (nome, email, senha, congregacao_id, ativo)
VALUES ('Administrador Geral', 'admin@gpt.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoO9yBLxIeB54/hFomU5o698gDfs3g2v6a', 1, TRUE);

-- Vincular o usuário às Roles ADMIN_GERAL e ADMIN_CONGREGACAO (Demonstrando papéis acumuláveis)
INSERT INTO tb_usuario_role (usuario_id, role_id)
SELECT u.id, r.id 
FROM tb_usuario u, tb_role r 
WHERE u.email = 'admin@gpt.com' 
  AND r.nome IN ('ROLE_ADMIN_GERAL', 'ROLE_ADMIN_CONGREGACAO');