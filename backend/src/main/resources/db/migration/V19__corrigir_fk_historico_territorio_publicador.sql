ALTER TABLE tb_historico_territorio
    DROP CONSTRAINT fk_historico_publicador;

ALTER TABLE tb_historico_territorio
    ADD CONSTRAINT fk_historico_publicador
    FOREIGN KEY (publicador_id)
    REFERENCES tb_publicador(id)
    ON DELETE RESTRICT;