-- Tabela do Catálogo de Publicações / Estoque por Congregação
CREATE TABLE IF NOT EXISTS tb_publicacao (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    idioma VARCHAR(30) DEFAULT 'Português',
    quantidade_estoque INTEGER NOT NULL DEFAULT 0,
    estoque_minimo INTEGER NOT NULL DEFAULT 5,
    congregacao_id BIGINT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    atualizado_em TIMESTAMP WITHOUT TIME ZONE,
    
    CONSTRAINT fk_publicacao_congregacao FOREIGN KEY (congregacao_id) REFERENCES tb_congregacao(id),
    CONSTRAINT uk_publicacao_codigo_congregacao UNIQUE (codigo, congregacao_id)
);

-- Tabela de Histórico de Movimentações de Estoque
CREATE TABLE IF NOT EXISTS tb_movimentacao_estoque (
    id BIGSERIAL PRIMARY KEY,
    publicacao_id BIGINT NOT NULL,
    congregacao_id BIGINT NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    quantidade INTEGER NOT NULL,
    quantidade_anterior INTEGER NOT NULL,
    quantidade_posterior INTEGER NOT NULL,
    publicador_id BIGINT,
    responsavel_id BIGINT NOT NULL,
    observacoes VARCHAR(255),
    data_movimentacao TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),

    CONSTRAINT fk_movimentacao_publicacao FOREIGN KEY (publicacao_id) REFERENCES tb_publicacao(id),
    CONSTRAINT fk_movimentacao_congregacao FOREIGN KEY (congregacao_id) REFERENCES tb_congregacao(id),
    CONSTRAINT fk_movimentacao_publicador FOREIGN KEY (publicador_id) REFERENCES tb_publicador(id),
    CONSTRAINT fk_movimentacao_responsavel FOREIGN KEY (responsavel_id) REFERENCES tb_usuario(id)
);

CREATE INDEX IF NOT EXISTS idx_publicacao_congregacao ON tb_publicacao(congregacao_id);
CREATE INDEX IF NOT EXISTS idx_movimentacao_publicacao ON tb_movimentacao_estoque(publicacao_id);
CREATE INDEX IF NOT EXISTS idx_movimentacao_congregacao ON tb_movimentacao_estoque(congregacao_id);