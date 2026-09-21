ALTER TABLE tb_publicador
    ADD COLUMN pessoa_id BIGINT NOT NULL;

ALTER TABLE tb_publicador
    ADD CONSTRAINT fk_publicador_pessoa
    FOREIGN KEY (pessoa_id)
    REFERENCES tb_pessoa(id)
    ON DELETE RESTRICT;

ALTER TABLE tb_publicador
    ADD CONSTRAINT uk_publicador_pessoa
    UNIQUE (pessoa_id);

ALTER TABLE tb_publicador
    DROP COLUMN nome;

ALTER TABLE tb_publicador
    DROP COLUMN telefone;