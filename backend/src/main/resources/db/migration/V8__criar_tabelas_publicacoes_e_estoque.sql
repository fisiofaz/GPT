-- Evolução da tabela de publicações criada na V5
-- A V5 já criou tb_publicacao, portanto aqui fazemos apenas alterações.

ALTER TABLE tb_publicacao
    ADD COLUMN IF NOT EXISTS quantidade_estoque INTEGER NOT NULL DEFAULT 0;

ALTER TABLE tb_publicacao
    ADD COLUMN IF NOT EXISTS estoque_minimo INTEGER NOT NULL DEFAULT 5;

ALTER TABLE tb_publicacao
    ADD COLUMN IF NOT EXISTS congregacao_id BIGINT;

ALTER TABLE tb_publicacao
    ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP WITHOUT TIME ZONE;


-- As publicações existentes na V5 pertencem à congregação
-- criada inicialmente pela V2.
UPDATE tb_publicacao
SET congregacao_id = (
    SELECT id
    FROM tb_congregacao
    ORDER BY id
    LIMIT 1
)
WHERE congregacao_id IS NULL;


ALTER TABLE tb_publicacao
    ALTER COLUMN congregacao_id SET NOT NULL;


ALTER TABLE tb_publicacao
    ADD CONSTRAINT fk_publicacao_congregacao
    FOREIGN KEY (congregacao_id)
    REFERENCES tb_congregacao(id);


ALTER TABLE tb_publicacao
    ADD CONSTRAINT uk_publicacao_codigo_congregacao
    UNIQUE (codigo, congregacao_id);


CREATE INDEX IF NOT EXISTS idx_publicacao_congregacao
    ON tb_publicacao(congregacao_id);


-- Tabela de histórico de movimentações de estoque

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

    CONSTRAINT fk_movimentacao_publicacao
        FOREIGN KEY (publicacao_id)
        REFERENCES tb_publicacao(id),

    CONSTRAINT fk_movimentacao_congregacao
        FOREIGN KEY (congregacao_id)
        REFERENCES tb_congregacao(id),

    CONSTRAINT fk_movimentacao_publicador
        FOREIGN KEY (publicador_id)
        REFERENCES tb_publicador(id),

    CONSTRAINT fk_movimentacao_responsavel
        FOREIGN KEY (responsavel_id)
        REFERENCES tb_usuario(id)
);


CREATE INDEX IF NOT EXISTS idx_movimentacao_publicacao
    ON tb_movimentacao_estoque(publicacao_id);

CREATE INDEX IF NOT EXISTS idx_movimentacao_congregacao
    ON tb_movimentacao_estoque(congregacao_id);