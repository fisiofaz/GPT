package com.gpt.modulos.publicacao.repository;

import com.gpt.modulos.publicacao.model.CategoriaPublicacao;
import com.gpt.modulos.publicacao.model.Publicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicacaoRepository extends JpaRepository<Publicacao, Long> {
    Optional<Publicacao> findByCodigo(String codigo);
    boolean existsByCodigo(String codigo);
    List<Publicacao> findByAtivoTrue();
    List<Publicacao> findByCategoriaAndAtivoTrue(CategoriaPublicacao categoria);
}