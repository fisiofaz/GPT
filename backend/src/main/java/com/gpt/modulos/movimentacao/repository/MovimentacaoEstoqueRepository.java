package com.gpt.modulos.movimentacao.repository;

import com.gpt.modulos.movimentacao.model.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovimentacaoEstoqueRepository
        extends JpaRepository<MovimentacaoEstoque, Long> {

    @EntityGraph(attributePaths = {
            "publicacao",
            "publicador.pessoa",
            "responsavel.pessoa"
    })
    Optional<MovimentacaoEstoque> findWithDetailsById(Long id);

    @EntityGraph(attributePaths = {
            "publicador.pessoa",
            "responsavel.pessoa"
    })
    List<MovimentacaoEstoque> findByCongregacaoIdOrderByDataMovimentacaoDesc(
            Long congregacaoId
    );

    @EntityGraph(attributePaths = {
            "publicador.pessoa",
            "responsavel.pessoa"
    })
    List<MovimentacaoEstoque> findByPublicacaoIdOrderByDataMovimentacaoDesc(
            Long publicacaoId
    );

    boolean existsByPublicadorId(Long publicadorId);
}