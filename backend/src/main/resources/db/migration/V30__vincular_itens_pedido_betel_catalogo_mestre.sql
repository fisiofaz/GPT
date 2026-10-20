-- Permite que novos itens do Pedido Betel referenciem o Catálogo Mestre.
-- Os registros antigos continuam vinculados à publicação operacional.

ALTER TABLE tb_itens_pedido_betel
    ADD COLUMN catalogo_mestre_id BIGINT;

ALTER TABLE tb_itens_pedido_betel
    ALTER COLUMN publicacao_id DROP NOT NULL;

ALTER TABLE tb_itens_pedido_betel
    ADD CONSTRAINT fk_item_pedido_betel_catalogo_mestre
    FOREIGN KEY (catalogo_mestre_id)
    REFERENCES tb_catalogo_mestre (id)
    ON DELETE RESTRICT;

-- Cada item deve referenciar uma publicação operacional ou um item
-- do Catálogo Mestre, mas não pode ficar sem nenhuma referência.
ALTER TABLE tb_itens_pedido_betel
    ADD CONSTRAINT chk_item_pedido_betel_referencia
    CHECK (
        publicacao_id IS NOT NULL
        OR catalogo_mestre_id IS NOT NULL
    );
