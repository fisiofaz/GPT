package com.gpt.modulos.publicador.repository;

import com.gpt.modulos.publicador.model.Publicador;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicadorRepository extends JpaRepository<Publicador, Long> {
    List<Publicador> findByCongregacaoIdAndAtivoTrueOrderByNomeAsc(Long congregacaoId);
}