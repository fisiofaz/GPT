package com.gpt.modulos.pedido.repository;

import com.gpt.modulos.pedido.enums.StatusPedidoBetel;
import com.gpt.modulos.pedido.model.PedidoBetel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoBetelRepository extends JpaRepository<PedidoBetel, Long> {

    List<PedidoBetel> findByCongregacaoIdOrderByDataCriacaoDesc(Long congregacaoId);

    List<PedidoBetel> findByCongregacaoIdAndStatus(Long congregacaoId, StatusPedidoBetel status);
}