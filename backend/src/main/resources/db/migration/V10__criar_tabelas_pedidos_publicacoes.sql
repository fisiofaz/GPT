-- Enum e Tabela de Pedidos Especiais de Publicadores
CREATE TABLE tb_pedidos_publicadores (
    id BIGSERIAL PRIMARY KEY,
    publicador_id BIGINT NOT NULL REFERENCES tb_publicador(id) ON DELETE CASCADE,
    publicacao_id BIGINT NOT NULL REFERENCES tb_publicacao(id) ON DELETE CASCADE,
    congregacao_id BIGINT NOT NULL REFERENCES tb_congregacao(id) ON DELETE CASCADE,
    quantidade INT NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    data_solicitacao TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    data_atendimento TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDENTE', -- PENDENTE, INCLUIDO_NO_PEDIDO, ATENDIDO, CANCELADO
    observacoes VARCHAR(255),
    pedido_betel_id BIGINT -- Vinculo quando for anexado ao pedido consolidado
);

-- Tabela do Pedido Consolidado para Betel (Remessa Mensal)
CREATE TABLE tb_pedidos_betel (
    id BIGSERIAL PRIMARY KEY,
    congregacao_id BIGINT NOT NULL REFERENCES tb_congregacao(id) ON DELETE CASCADE,
    numero_pedido VARCHAR(50), -- Opcional, ex: "BETEL-2026/09"
    mes_ano_referencia VARCHAR(7) NOT NULL, -- Formato "YYYY-MM" (Ex: "2026-09")
    data_criacao TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    data_envio TIMESTAMP WITHOUT TIME ZONE,
    data_recebimento TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'RASCUNHO', -- RASCUNHO, ENVIADO, RECEBIDO_PARCIAL, RECEBIDO_TOTAL, CANCELADO
    observacoes TEXT
);

-- Itens do Pedido Consolidado de Betel
CREATE TABLE tb_itens_pedido_betel (
    id BIGSERIAL PRIMARY KEY,
    pedido_betel_id BIGINT NOT NULL REFERENCES tb_pedidos_betel(id) ON DELETE CASCADE,
    publicacao_id BIGINT NOT NULL REFERENCES tb_publicacao(id) ON DELETE CASCADE,
    quantidade_solicitada INT NOT NULL CHECK (quantidade_solicitada > 0),
    quantidade_recebida INT DEFAULT 0 CHECK (quantidade_recebida >= 0),
    origem VARCHAR(30) NOT NULL DEFAULT 'ESTOQUE' -- ESTOQUE ou ESPECIAL_PUBLICADOR
);

-- Adiciona a FK do pedido_betel_id na tb_pedidos_publicadores
ALTER TABLE tb_pedidos_publicadores
    ADD CONSTRAINT fk_pedido_publicador_betel
    FOREIGN KEY (pedido_betel_id) REFERENCES tb_pedidos_betel(id) ON DELETE SET NULL;

-- Índices para consultas rápidas por congregação e status
CREATE INDEX idx_pedidos_pub_cong ON tb_pedidos_publicadores(congregacao_id, status);
CREATE INDEX idx_pedidos_betel_cong ON tb_pedidos_betel(congregacao_id, status);