package com.gpt.modulos.publicacao.repository;

import com.gpt.modulos.publicacao.model.CatalogoMestre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatalogoMestreRepository extends JpaRepository<CatalogoMestre, Long> {
	List<CatalogoMestre> findAllByOrderByTituloAsc();
    Optional<CatalogoMestre> findByCodigo(String codigo);
}