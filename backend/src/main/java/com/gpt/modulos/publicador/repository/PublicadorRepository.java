package com.gpt.modulos.publicador.repository;

import com.gpt.modulos.publicador.model.Publicador;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PublicadorRepository extends JpaRepository<Publicador, Long> {
	Page<Publicador> findByCongregacaoIdAndAtivoTrueOrderByPessoa_NomeAsc(
            Long congregacaoId,
            Pageable pageable
    );
	
	Optional<Publicador> findByPessoaId(Long pessoaId);
}