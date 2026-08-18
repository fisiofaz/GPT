-- Criação da tabela de Congregações
CREATE TABLE tb_congregacao (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    estado VARCHAR(2) NOT NULL,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em TIMESTAMP WITHOUT TIME ZONE
);

-- Criação da tabela de Perfis / Roles
CREATE TABLE tb_role (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

-- Carga inicial das Roles do sistema conforme especificação
INSERT INTO tb_role (nome) VALUES 
('ROLE_ADMIN_GERAL'),
('ROLE_ADMIN_CONGREGACAO'),
('ROLE_SUPERINTENDENTE'),
('ROLE_ANCIAO'),
('ROLE_SERVOMINISTERIAL'),
('ROLE_SERVO_TERRITORIO'),
('ROLE_SERVO_PUBLICACOES'),
('ROLE_PUBLICADOR');

-- Criação da tabela de Usuários
CREATE TABLE tb_usuario (
    id BIGSERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    congregacao_id BIGINT,
    ativo BOOLEAN DEFAULT TRUE NOT NULL,
    criado_em TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    atualizado_em TIMESTAMP WITHOUT TIME ZONE,
    CONSTRAINT fk_usuario_congregacao FOREIGN KEY (congregacao_id) REFERENCES tb_congregacao (id) ON DELETE RESTRICT
);

-- Tabela pivô para Papéis Acumuláveis
CREATE TABLE tb_usuario_role (
    usuario_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (usuario_id, role_id),
    CONSTRAINT fk_usuario_role_usuario FOREIGN KEY (usuario_id) REFERENCES tb_usuario (id) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_role_role FOREIGN KEY (role_id) REFERENCES tb_role (id) ON DELETE RESTRICT
);