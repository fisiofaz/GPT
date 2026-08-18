package com.gpt.modulos.congregacao.repository;

import com.gpt.modulos.congregacao.model.Congregacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CongregacaoRepository extends JpaRepository<Congregacao, Long> {
}