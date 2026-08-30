package com.gpt.modulos.pedido.repository;

import com.gpt.modulos.pedido.enums.StatusPedidoPublicador;
import com.gpt.modulos.pedido.model.PedidoPublicador;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoPublicadorRepository extends JpaRepository<PedidoPublicador, Long> {

    List<PedidoPublicador> findByCongregacaoIdOrderByDataSolicitacaoDesc(Long congregacaoId);

    List<PedidoPublicador> findByCongregacaoIdAndStatusOrderByDataSolicitacaoAsc(Long congregacaoId, StatusPedidoPublicador status);

    List<PedidoPublicador> findByPedidoBetelId(Long pedidoBetelId);

    @Query("SELECT p FROM PedidoPublicador p WHERE p.congregacao.id = :congregacaoId AND p.status = 'PENDENTE'")
    List<PedidoPublicador> buscarPendentesParaConsolidacao(@Param("congregacaoId") Long congregacaoId);
}