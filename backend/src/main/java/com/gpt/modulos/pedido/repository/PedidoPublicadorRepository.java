package com.gpt.modulos.pedido.repository;

import com.gpt.modulos.pedido.enums.StatusPedidoPublicador;
import com.gpt.modulos.pedido.model.PedidoPublicador;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PedidoPublicadorRepository extends JpaRepository<PedidoPublicador, Long> {

    List<PedidoPublicador> findByCongregacaoIdOrderByDataSolicitacaoDesc(Long congregacaoId);

    List<PedidoPublicador> findByCongregacaoIdAndStatusOrderByDataSolicitacaoAsc(Long congregacaoId, StatusPedidoPublicador status);

    List<PedidoPublicador> findByPedidoBetelId(Long pedidoBetelId);

    @Query("SELECT p FROM PedidoPublicador p WHERE p.congregacao.id = :congregacaoId AND p.status = 'PENDENTE'")
    List<PedidoPublicador> buscarPendentesParaConsolidacao(@Param("congregacaoId") Long congregacaoId);

    // Métricas para o Dashboard
    long countByCongregacaoId(Long congregacaoId);

    // Correção: soma diretamente o campo quantidade da própria entidade PedidoPublicador
    @Query("SELECT COALESCE(SUM(p.quantidade), 0) FROM PedidoPublicador p WHERE p.congregacao.id = :congregacaoId AND p.dataSolicitacao BETWEEN :inicio AND :fim")
    long sumItensEntreguesNoPeriodo(
            @Param("congregacaoId") Long congregacaoId,
            @Param("inicio") LocalDateTime inicio,
            @Param("fim") LocalDateTime fim
    );
}