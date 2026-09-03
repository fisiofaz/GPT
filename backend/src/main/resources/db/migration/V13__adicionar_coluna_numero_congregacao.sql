-- V13
-- Ajusta a tabela de congregações para suportar
-- o número da congregação e o número do circuito.

ALTER TABLE tb_congregacao
    ADD COLUMN IF NOT EXISTS numero VARCHAR(150);

ALTER TABLE tb_congregacao
    ADD COLUMN IF NOT EXISTS numero_circuito VARCHAR(30);


-- A migration V2 já cria uma congregação inicial.
-- Como a coluna numero passa a ser obrigatória na entidade,
-- garantimos um valor para registros existentes.
UPDATE tb_congregacao
SET numero = '000'
WHERE numero IS NULL;


-- Depois de popular os registros existentes,
-- podemos aplicar a restrição NOT NULL.
ALTER TABLE tb_congregacao
    ALTER COLUMN numero SET NOT NULL;


-- numero_circuito é opcional na entidade,
-- portanto permanece permitindo NULL.