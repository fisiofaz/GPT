package com.gpt.modulos.publicacao.repository;

import com.gpt.modulos.publicacao.model.EstoquePublicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EstoquePublicacaoRepository extends JpaRepository<EstoquePublicacao, Long> {
    List<EstoquePublicacao> findByCongregacaoId(Long congregacaoId);
    Optional<EstoquePublicacao> findByPublicacaoIdAndCongregacaoId(Long publicacaoId, Long congregacaoId);
}