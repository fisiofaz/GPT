-- 1. Adicionar a coluna de formato na tabela de publicações da congregação
ALTER TABLE tb_publicacao 
ADD COLUMN IF NOT EXISTS formato VARCHAR(30) DEFAULT 'NORMAL';

-- 2. Criar a Tabela Mestra Global de Catálogo (Modelos pré-definidos)
CREATE TABLE IF NOT EXISTS tb_catalogo_mestre (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    titulo VARCHAR(150) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    formato VARCHAR(30) NOT NULL DEFAULT 'NORMAL',
    idioma VARCHAR(40) NOT NULL DEFAULT 'PORTUGUES',
    descricao VARCHAR(255)
);

-- 3. Carga inicial de itens comuns para autopreenchimento
INSERT INTO tb_catalogo_mestre (codigo, titulo, categoria, formato, idioma, descricao) VALUES
('nwt-normal', 'Tradução do Novo Mundo das Escrituras Sagradas', 'BIBLIA', 'NORMAL', 'PORTUGUES', 'Edição padrão capa cinza'),
('nwt-bolso', 'Tradução do Novo Mundo das Escrituras Sagradas (Bolso)', 'BIBLIA', 'PEQUENO', 'PORTUGUES', 'Edição compacta de bolso'),
('nwt-grande', 'Tradução do Novo Mundo das Escrituras Sagradas (Letra Grande)', 'BIBLIA', 'GRANDE', 'PORTUGUES', 'Edição de estudo letra grande com referências'),
('lff', 'Seja Feliz para Sempre! – Um Curso da Bíblia Interativo', 'LIVRO', 'NORMAL', 'PORTUGUES', 'Livro principal para estudos bíblicos'),
('th', 'Dedique-se à Leitura e ao Ensino', 'BROCHURA', 'NORMAL', 'PORTUGUES', 'Brochura da reunião do meio de semana'),
('rr', 'A Adoração Pura de Jeová É Restaurada!', 'LIVRO', 'NORMAL', 'PORTUGUES', 'Livro de Ezequiel'),
('bt', '“Dê Testemunho Cabal” sobre o Reino de Deus', 'LIVRO', 'NORMAL', 'PORTUGUES', 'Livro de Atos dos Apóstolos'),
('mwb', 'Apostila da Reunião Nossa Vida e Ministério Cristão', 'REVISTA', 'NORMAL', 'PORTUGUES', 'Apostila mensal'),
('wp', 'A Sentinela (Edição para o Público)', 'REVISTA', 'NORMAL', 'PORTUGUES', 'Revista pública de distribuição'),
('w', 'A Sentinela (Edição de Estudo)', 'REVISTA', 'NORMAL', 'PORTUGUES', 'Revista mensal de estudo'),
('g', 'Despertai!', 'REVISTA', 'NORMAL', 'PORTUGUES', 'Revista periódica Despertai!'),
('t-30', 'O que você acha do futuro?', 'TRATADO', 'PEQUENO', 'PORTUGUES', 'Tratado de pregação'),
('t-33', 'Quem controla o mundo?', 'TRATADO', 'PEQUENO', 'PORTUGUES', 'Tratado de pregação')
ON CONFLICT (codigo) DO NOTHING;