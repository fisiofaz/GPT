-- V22 - Vincula Usuario a Pessoa/Publicador
-- A base atual possui 1 Usuario (admin@gpt.com), sem Pessoa/Publicador.

ALTER TABLE tb_usuario
    ADD COLUMN pessoa_id BIGINT;

-- Cria a Pessoa correspondente aos Usuarios existentes.
INSERT INTO tb_pessoa (
    nome,
    email,
    situacao
)
SELECT
    u.nome,
    u.email,
    'ATIVO'
FROM tb_usuario u;

-- Todo Usuario existente passa a ter um Publicador correspondente.
INSERT INTO tb_publicador (
    pessoa_id,
    congregacao_id,
    ativo
)
SELECT
    p.id,
    u.congregacao_id,
    TRUE
FROM tb_usuario u
JOIN tb_pessoa p
    ON p.email = u.email;

-- Vincula o Usuario à Pessoa criada.
UPDATE tb_usuario u
SET pessoa_id = p.id
FROM tb_pessoa p
WHERE p.email = u.email;

-- A partir daqui, todo Usuario deve obrigatoriamente possuir uma Pessoa.
ALTER TABLE tb_usuario
    ALTER COLUMN pessoa_id SET NOT NULL;

ALTER TABLE tb_usuario
    ADD CONSTRAINT fk_usuario_pessoa
    FOREIGN KEY (pessoa_id)
    REFERENCES tb_pessoa(id)
    ON DELETE RESTRICT;

ALTER TABLE tb_usuario
    ADD CONSTRAINT uk_usuario_pessoa
    UNIQUE (pessoa_id);