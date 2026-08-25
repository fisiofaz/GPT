CREATE TABLE tb_publicador (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    congregacao_id BIGINT NOT NULL,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_publicador_congregacao FOREIGN KEY (congregacao_id) REFERENCES tb_congregacao(id) ON DELETE CASCADE
);

-- Índices para otimização de busca
CREATE INDEX idx_publicador_congregacao_ativo ON tb_publicador(congregacao_id, ativo);
CREATE INDEX idx_publicador_nome ON tb_publicador(nome);