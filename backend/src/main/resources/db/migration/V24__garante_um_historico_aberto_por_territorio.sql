CREATE UNIQUE INDEX uk_historico_territorio_aberto
ON tb_historico_territorio (territorio_id)
WHERE data_devolucao IS NULL;