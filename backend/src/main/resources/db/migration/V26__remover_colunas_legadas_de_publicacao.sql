-- ============================================================
-- V26 - Remover dados de estoque do cadastro de publicação
-- ============================================================
--
-- O estoque passou a ser controlado exclusivamente por:
--
--     tb_publicacao_estoque
--
-- A V25 já transferiu os dados existentes de:
--
--     tb_publicacao.quantidade_estoque
--     tb_publicacao.estoque_minimo
--     tb_publicacao.congregacao_id
--
-- para tb_publicacao_estoque.
--
-- A partir desta migration, tb_publicacao representa somente
-- o cadastro da publicação.
-- ============================================================


-- Remover primeiro a FK que vinculava a publicação à congregação.
ALTER TABLE tb_publicacao
    DROP CONSTRAINT IF EXISTS fk_publicacao_congregacao;


-- Remover o índice criado pela V8.
DROP INDEX IF EXISTS idx_publicacao_congregacao;


-- Remover as colunas que pertencem ao estoque.
ALTER TABLE tb_publicacao
    DROP COLUMN IF EXISTS congregacao_id;

ALTER TABLE tb_publicacao
    DROP COLUMN IF EXISTS quantidade_estoque;

ALTER TABLE tb_publicacao
    DROP COLUMN IF EXISTS estoque_minimo;