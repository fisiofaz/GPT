-- 1. Criação da tabela principal de Territórios
CREATE TABLE tb_territorio (
    id BIGSERIAL PRIMARY KEY,
    numero VARCHAR(20) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(30) DEFAULT 'DISPONIVEL' NOT NULL,
    congregacao_id BIGINT NOT NULL,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_territorio_congregacao FOREIGN KEY (congregacao_id) REFERENCES tb_congregacao (id) ON DELETE RESTRICT,
    CONSTRAINT uk_territorio_numero_congregacao UNIQUE (numero, congregacao_id)
);

-- 2. Criação da tabela de Histórico / Movimentação (Retiradas e Devoluções)
CREATE TABLE tb_historico_territorio (
    id BIGSERIAL PRIMARY KEY,
    territorio_id BIGINT NOT NULL,
    publicador_id BIGINT NOT NULL,
    data_retirada TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    data_devolucao TIMESTAMP WITHOUT TIME ZONE,
    observacoes TEXT,
    CONSTRAINT fk_historico_territorio FOREIGN KEY (territorio_id) REFERENCES tb_territorio (id) ON DELETE CASCADE,
    CONSTRAINT fk_historico_publicador FOREIGN KEY (publicador_id) REFERENCES tb_usuario (id) ON DELETE RESTRICT
);