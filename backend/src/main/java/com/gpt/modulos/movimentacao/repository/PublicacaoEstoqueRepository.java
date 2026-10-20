package com.gpt.modulos.movimentacao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.gpt.modulos.movimentacao.model.PublicacaoEstoque;

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

	@Query("""
	    SELECT COUNT(e)
	    FROM PublicacaoEstoque e
	    WHERE e.congregacao.id = :congregacaoId
	""")
	long countByCongregacaoId(
	    @Param("congregacaoId") Long congregacaoId
	);
	
	@Query("""
	    SELECT COUNT(e)
	    FROM PublicacaoEstoque e
	    WHERE e.congregacao.id = :congregacaoId
	      AND e.ativo = true
	      AND e.publicacao.ativo = true
	""")
	long countEstoquesAtivosByCongregacaoId(
	    @Param("congregacaoId") Long congregacaoId
	);
	
	@Query("""
	    SELECT COUNT(e)
	    FROM PublicacaoEstoque e
	    WHERE e.congregacao.id = :congregacaoId
	      AND e.ativo = true
	      AND e.publicacao.ativo = true
	      AND e.quantidade <= e.estoqueMinimo
	""")
	long countEstoquesBaixosByCongregacaoId(
	    @Param("congregacaoId") Long congregacaoId
	);
	
	@Query("""
	    SELECT COUNT(e)
	    FROM PublicacaoEstoque e
	    WHERE e.congregacao.id = :congregacaoId
	      AND e.ativo = true
	      AND e.publicacao.ativo = true
	      AND e.quantidade = 0
	""")
	long countEstoquesZeradosByCongregacaoId(
	    @Param("congregacaoId") Long congregacaoId
	);
	
	@Query("""
	    SELECT COALESCE(SUM(e.quantidade), 0)
	    FROM PublicacaoEstoque e
	    WHERE e.congregacao.id = :congregacaoId
	      AND e.ativo = true
	      AND e.publicacao.ativo = true
	""")
	long sumQuantidadeAtivaByCongregacaoId(
	    @Param("congregacaoId") Long congregacaoId
	);

}