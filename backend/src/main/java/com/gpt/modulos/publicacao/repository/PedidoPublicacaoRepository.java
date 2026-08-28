package com.gpt.modulos.publicacao.repository;

import com.gpt.dominio.enums.StatusPedido;
import com.gpt.modulos.publicacao.model.PedidoPublicacao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoPublicacaoRepository extends JpaRepository<PedidoPublicacao, Long> {
    List<PedidoPublicacao> findByCongregacaoIdOrderByCriadoEmDesc(Long congregacaoId);
    List<PedidoPublicacao> findByCongregacaoIdAndStatusOrderByCriadoEmDesc(Long congregacaoId, StatusPedido status);
    List<PedidoPublicacao> findByPublicadorIdOrderByCriadoEmDesc(Long publicadorId);
}