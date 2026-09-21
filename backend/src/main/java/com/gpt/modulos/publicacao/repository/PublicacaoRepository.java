package com.gpt.modulos.publicacao.repository;

import com.gpt.modulos.publicacao.model.Publicacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublicacaoRepository extends JpaRepository<Publicacao, Long> {
    
	Optional<Publicacao> findByCodigoIgnoreCase(String codigo);

    boolean existsByCodigoIgnoreCase(String codigo);
}