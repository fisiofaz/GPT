package com.gpt.modulos.publicacao.repository;

import com.gpt.modulos.publicacao.model.MovimentacaoEstoque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
    List<MovimentacaoEstoque> findByCongregacaoIdOrderByDataMovimentacaoDesc(Long congregacaoId);
    List<MovimentacaoEstoque> findByPublicacaoIdOrderByDataMovimentacaoDesc(Long publicacaoId);
}