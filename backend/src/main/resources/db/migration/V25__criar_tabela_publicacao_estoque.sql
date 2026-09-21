-- ============================================================
-- V25 - Criação do estoque de publicações por congregação
-- ============================================================
--
-- Evolução do modelo de estoque:
--
-- Antes:
--   quantidade_estoque, estoque_minimo e congregacao_id
--   ficavam diretamente em tb_publicacao.
--
-- Agora:
--   o estoque pertence à combinação Publicação + Congregação.
--
-- A tabela antiga tb_estoque_publicacao (V5) permanece
-- preservada neste momento para não alterar migrations
-- já executadas nem eliminar dados históricos.
-- ============================================================


CREATE TABLE IF NOT EXISTS tb_publicacao_estoque (
    id BIGSERIAL PRIMARY KEY,

    publicacao_id BIGINT NOT NULL,

    congregacao_id BIGINT NOT NULL,

    quantidade INTEGER NOT NULL DEFAULT 0,

    estoque_minimo INTEGER NOT NULL DEFAULT 5,

    ativo BOOLEAN NOT NULL DEFAULT TRUE,

    criado_em TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    atualizado_em TIMESTAMP WITHOUT TIME ZONE,

    CONSTRAINT uk_publicacao_estoque_publicacao_congregacao
        UNIQUE (publicacao_id, congregacao_id),

    CONSTRAINT fk_publicacao_estoque_publicacao
        FOREIGN KEY (publicacao_id)
        REFERENCES tb_publicacao(id),

    CONSTRAINT fk_publicacao_estoque_congregacao
        FOREIGN KEY (congregacao_id)
        REFERENCES tb_congregacao(id)
);


CREATE INDEX IF NOT EXISTS idx_publicacao_estoque_publicacao
    ON tb_publicacao_estoque(publicacao_id);


CREATE INDEX IF NOT EXISTS idx_publicacao_estoque_congregacao
    ON tb_publicacao_estoque(congregacao_id);


-- ============================================================
-- Migração dos dados existentes do modelo V8
-- ============================================================
--
-- As publicações criadas pelas migrations anteriores já possuem
-- congregacao_id, quantidade_estoque e estoque_minimo em
-- tb_publicacao.
--
-- Esses dados são transferidos para o novo modelo.
-- ============================================================

INSERT INTO tb_publicacao_estoque (
    publicacao_id,
    congregacao_id,
    quantidade,
    estoque_minimo,
    ativo,
    criado_em
)
SELECT
    p.id,
    p.congregacao_id,
    COALESCE(p.quantidade_estoque, 0),
    COALESCE(p.estoque_minimo, 5),
    p.ativo,
    COALESCE(p.criado_em, CURRENT_TIMESTAMP)
FROM tb_publicacao p
WHERE p.congregacao_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM tb_publicacao_estoque pe
      WHERE pe.publicacao_id = p.id
        AND pe.congregacao_id = p.congregacao_id
  );