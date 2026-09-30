package com.gpt.modulos.territorio.repository;

import com.gpt.modulos.territorio.model.HistoricoTerritorio;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricoTerritorioRepository extends JpaRepository<HistoricoTerritorio, Long> {

	boolean existsByPublicadorId(Long publicadorId);
	
	boolean existsByTerritorioId(Long territorioId);
	
	Optional<HistoricoTerritorio> findByTerritorioIdAndDataDevolucaoIsNull(Long territorioId);

    List<HistoricoTerritorio> findByTerritorioIdOrderByDataRetiradaDesc(Long territorioId);

    List<HistoricoTerritorio> findByPublicadorIdOrderByDataRetiradaDesc(Long publicadorId);
    
    @Query("""
            SELECT h
            FROM HistoricoTerritorio h
            JOIN FETCH h.territorio t
            LEFT JOIN FETCH h.publicador p
            WHERE t.congregacao.id = :congregacaoId
            ORDER BY h.dataRetirada DESC
            """)
    Page<HistoricoTerritorio> buscarHistoricoGeralPorCongregacao(
            @Param("congregacaoId") Long congregacaoId,
            Pageable pageable
   );
    
    @Query("""
            SELECT COUNT(DISTINCT h.territorio.id)
            FROM HistoricoTerritorio h
            JOIN h.territorio t
            WHERE t.congregacao.id = :congregacaoId
              AND h.dataDevolucao BETWEEN :inicio AND :fim
            """)
    long countTerritoriosTrabalhadosNoPeriodo(
    		@Param("congregacaoId") Long congregacaoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}