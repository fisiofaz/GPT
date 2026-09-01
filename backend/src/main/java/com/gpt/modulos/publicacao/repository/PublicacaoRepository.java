package com.gpt.modulos.publicacao.repository;

import com.gpt.modulos.publicacao.model.Publicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicacaoRepository extends JpaRepository<Publicacao, Long> {
    List<Publicacao> findByCongregacaoIdAndAtivoTrueOrderByTituloAsc(Long congregacaoId);
    Optional<Publicacao> findByCodigoIgnoreCaseAndCongregacaoId(String codigo, Long congregacaoId);
    boolean existsByCodigoIgnoreCaseAndCongregacaoId(String codigo, Long congregacaoId);
    
    // 📊 Substitua 'p.quantidade' pelo nome real do atributo na entidade (ex: p.quantidadeEstoque ou p.estoque)
    @Query("SELECT COALESCE(SUM(p.quantidadeEstoque), 0) FROM Publicacao p WHERE p.congregacao.id = :congregacaoId AND p.ativo = true")
    long sumEstoqueByCongregacaoId(@Param("congregacaoId") Long congregacaoId);

}