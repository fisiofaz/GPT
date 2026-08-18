-- 1. Catálogo de Publicações
CREATE TABLE tb_publicacao (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    idioma VARCHAR(30) DEFAULT 'Português' NOT NULL,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Estoque de Publicações por Congregação
CREATE TABLE tb_estoque_publicacao (
    id BIGSERIAL PRIMARY KEY,
    publicacao_id BIGINT NOT NULL,
    congregacao_id BIGINT NOT NULL,
    quantidade_disponivel INT DEFAULT 0 NOT NULL,
    atualizado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_estoque_publicacao FOREIGN KEY (publicacao_id) REFERENCES tb_publicacao (id) ON DELETE RESTRICT,
    CONSTRAINT fk_estoque_congregacao FOREIGN KEY (congregacao_id) REFERENCES tb_congregacao (id) ON DELETE RESTRICT,
    CONSTRAINT uk_estoque_pub_congregacao UNIQUE (publicacao_id, congregacao_id)
);

-- 3. Pedidos / Solicitações de Publicações
CREATE TABLE tb_pedido_publicacao (
    id BIGSERIAL PRIMARY KEY,
    publicador_id BIGINT NOT NULL,
    congregacao_id BIGINT NOT NULL,
    publicacao_id BIGINT NOT NULL,
    quantidade INT NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDENTE' NOT NULL,
    observacoes TEXT,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atendido_em TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_pedido_publicador FOREIGN KEY (publicador_id) REFERENCES tb_usuario (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_congregacao FOREIGN KEY (congregacao_id) REFERENCES tb_congregacao (id) ON DELETE RESTRICT,
    CONSTRAINT fk_pedido_publicacao FOREIGN KEY (publicacao_id) REFERENCES tb_publicacao (id) ON DELETE RESTRICT
);

-- Carga inicial de algumas publicações clássicas para testes
INSERT INTO tb_publicacao (codigo, titulo, categoria, idioma) VALUES
('nwt', 'Tradução do Novo Mundo da Bíblia Sagrada', 'BIBLIA', 'Português'),
('lff', 'Seja Feliz para Sempre!', 'LIVRO', 'Português'),
('th', 'Aprenda a Ler e a Ensinar', 'BROCHURA', 'Português'),
('wp24.1', 'A Sentinela nº 1 2024', 'REVISTA', 'Português');