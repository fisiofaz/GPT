package com.gpt.modulos.movimentacao.repository;

import com.gpt.modulos.publicacao.model.PublicacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicacaoEstoqueRepository extends JpaRepository<PublicacaoEstoque, Long> {

	Optional<PublicacaoEstoque> findByPublicacaoIdAndCongregacaoId(
            Long publicacaoId,
            Long congregacaoId
    );

    boolean existsByPublicacaoIdAndCongregacaoId(
            Long publicacaoId,
            Long congregacaoId
    );

    List<PublicacaoEstoque> findByCongregacaoIdAndAtivoTrueOrderByPublicacaoTituloAsc(
            Long congregacaoId
    );

    List<PublicacaoEstoque> findByPublicacaoId(
            Long publicacaoId
    );

    @Query("""
        SELECT COALESCE(SUM(e.quantidade), 0)
        FROM PublicacaoEstoque e
        WHERE e.congregacao.id = :congregacaoId
          AND e.ativo = true
    """)
    long sumQuantidadeByCongregacaoId(
            @Param("congregacaoId") Long congregacaoId
    );
}