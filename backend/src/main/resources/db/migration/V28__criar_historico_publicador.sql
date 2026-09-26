CREATE TABLE tb_historico_publicador (
    id BIGSERIAL PRIMARY KEY,

    publicador_id BIGINT NOT NULL,

    nome_publicador VARCHAR(150) NOT NULL,

    congregacao_id BIGINT NOT NULL,

    evento VARCHAR(40) NOT NULL,

    data_evento TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),

    usuario_responsavel_id BIGINT,

    observacoes VARCHAR(500)
);

ALTER TABLE tb_historico_publicador
    ADD CONSTRAINT fk_historico_publicador_congregacao
    FOREIGN KEY (congregacao_id)
    REFERENCES tb_congregacao(id)
    ON DELETE RESTRICT;

ALTER TABLE tb_historico_publicador
    ADD CONSTRAINT fk_historico_publicador_usuario
    FOREIGN KEY (usuario_responsavel_id)
    REFERENCES tb_usuario(id)
    ON DELETE SET NULL;

CREATE INDEX idx_historico_publicador_publicador
    ON tb_historico_publicador(publicador_id);

CREATE INDEX idx_historico_publicador_congregacao
    ON tb_historico_publicador(congregacao_id);

CREATE INDEX idx_historico_publicador_data
    ON tb_historico_publicador(data_evento);