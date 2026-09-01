package com.gpt.modulos.territorio.repository;

import com.gpt.modulos.territorio.model.HistoricoTerritorio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface HistoricoTerritorioRepository extends JpaRepository<HistoricoTerritorio, Long> {

    // Buscar o histórico ativo de um território (onde data_devolucao é nula)
    Optional<HistoricoTerritorio> findByTerritorioIdAndDataDevolucaoIsNull(Long territorioId);

    // Buscar todo o histórico de um território específico
    List<HistoricoTerritorio> findByTerritorioIdOrderByDataRetiradaDesc(Long territorioId);

    // Buscar histórico de territórios retirados por um publicador específico
    List<HistoricoTerritorio> findByPublicadorIdOrderByDataRetiradaDesc(Long publicadorId);
    
 // Consulta otimizada com JOIN FETCH trazendo Território e Publicador
    @Query("SELECT h FROM HistoricoTerritorio h " +
           "JOIN FETCH h.territorio t " +
           "LEFT JOIN FETCH h.publicador p " +
           "WHERE t.congregacao.id = :congregacaoId " +
           "ORDER BY h.dataRetirada DESC")
    List<HistoricoTerritorio> buscarHistoricoGeralPorCongregacao(@Param("congregacaoId") Long congregacaoId);
    
 // 📊 Contagem distinta de territórios trabalhados no período (Ano de Serviço)
    @Query("SELECT COUNT(DISTINCT h.territorio.id) FROM HistoricoTerritorio h JOIN h.territorio t WHERE t.congregacao.id = :congregacaoId AND h.dataDevolucao BETWEEN :inicio AND :fim")
    long countTerritoriosTrabalhadosNoPeriodo(
            @Param("congregacaoId") Long congregacaoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}