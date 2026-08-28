package com.gpt.repositorio;

import com.gpt.dominio.enums.StatusPedidoBetel;
import com.gpt.dominio.model.PedidoBetel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoBetelRepository extends JpaRepository<PedidoBetel, Long> {

    List<PedidoBetel> findByCongregacaoIdOrderByDataCriacaoDesc(Long congregacaoId);

    List<PedidoBetel> findByCongregacaoIdAndStatus(Long congregacaoId, StatusPedidoBetel status);
}