package com.gpt.modulos.publicacao.repository;

import com.gpt.modulos.publicacao.model.Publicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicacaoRepository extends JpaRepository<Publicacao, Long> {
    List<Publicacao> findByCongregacaoIdAndAtivoTrueOrderByTituloAsc(Long congregacaoId);
    Optional<Publicacao> findByCodigoIgnoreCaseAndCongregacaoId(String codigo, Long congregacaoId);
    boolean existsByCodigoIgnoreCaseAndCongregacaoId(String codigo, Long congregacaoId);
}