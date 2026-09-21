ALTER TABLE tb_historico_territorio
DROP CONSTRAINT fk_historico_territorio;

ALTER TABLE tb_historico_territorio
ADD CONSTRAINT fk_historico_territorio
FOREIGN KEY (territorio_id)
REFERENCES tb_territorio (id)
ON DELETE RESTRICT;