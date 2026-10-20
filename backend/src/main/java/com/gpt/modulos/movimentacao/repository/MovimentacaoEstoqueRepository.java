package com.gpt.modulos.movimentacao.repository;

import com.gpt.modulos.movimentacao.model.MovimentacaoEstoque;
import com.gpt.modulos.movimentacao.enums.TipoMovimentacao;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
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
    

	@Query("""
	    SELECT COUNT(m)
	    FROM MovimentacaoEstoque m
	    WHERE m.congregacao.id = :congregacaoId
	      AND m.tipo = :tipo
	      AND m.dataMovimentacao >= :inicio
	      AND m.dataMovimentacao < :fim
	""")
	long countByCongregacaoAndTipoNoPeriodo(
	    @Param("congregacaoId") Long congregacaoId,
	    @Param("tipo") TipoMovimentacao tipo,
	    @Param("inicio") LocalDateTime inicio,
	    @Param("fim") LocalDateTime fim
	);
	
	@Query("""
	    SELECT COALESCE(SUM(m.quantidade), 0)
	    FROM MovimentacaoEstoque m
	    WHERE m.congregacao.id = :congregacaoId
	      AND m.tipo = :tipo
	      AND m.dataMovimentacao >= :inicio
	      AND m.dataMovimentacao < :fim
	""")
	long sumQuantidadeByCongregacaoAndTipoNoPeriodo(
	    @Param("congregacaoId") Long congregacaoId,
	    @Param("tipo") TipoMovimentacao tipo,
	    @Param("inicio") LocalDateTime inicio,
	    @Param("fim") LocalDateTime fim
	);

}