package com.gpt.modulos.movimentacao.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.gpt.modulos.movimentacao.model.MovimentacaoEstoque;
import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends JpaRepository<MovimentacaoEstoque, Long> {
		
    List<MovimentacaoEstoque> findByCongregacaoIdOrderByDataMovimentacaoDesc(Long congregacaoId);
    
    List<MovimentacaoEstoque> findByPublicacaoIdOrderByDataMovimentacaoDesc(Long publicacaoId);
    
    boolean existsByPublicadorId(Long publicadorId);
    
}