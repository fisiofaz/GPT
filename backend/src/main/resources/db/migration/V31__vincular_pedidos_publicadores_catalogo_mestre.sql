-- Permite que pedidos individuais referenciem o catálogo mestre.
ALTER TABLE tb_pedidos_publicadores
    ADD COLUMN catalogo_mestre_id BIGINT;

ALTER TABLE tb_pedidos_publicadores
    ALTER COLUMN publicacao_id DROP NOT NULL;
-- O pedido deve ter uma publicação operacional ou um item do catálogo.
ALTER TABLE tb_pedidos_publicadores
    ADD CONSTRAINT fk_pedidos_publicadores_catalogo_mestre
    FOREIGN KEY (catalogo_mestre_id)
    REFERENCES tb_catalogo_mestre(id)
    ON DELETE RESTRICT;

ALTER TABLE tb_pedidos_publicadores
    ADD CONSTRAINT chk_pedidos_publicadores_origem
    CHECK (
        publicacao_id IS NOT NULL
        OR catalogo_mestre_id IS NOT NULL
    );

CREATE INDEX idx_pedidos_pub_catalogo_mestre
    ON tb_pedidos_publicadores(catalogo_mestre_id);