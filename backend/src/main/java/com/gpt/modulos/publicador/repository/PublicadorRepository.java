package com.gpt.modulos.publicador.repository;

import com.gpt.modulos.publicador.model.Publicador;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PublicadorRepository extends JpaRepository<Publicador, Long> {
	Page<Publicador> findByCongregacaoIdAndAtivoTrueOrderByPessoa_NomeAsc(
            Long congregacaoId,
            Pageable pageable
    );
	
	Optional<Publicador> findByPessoaId(Long pessoaId);
	
	@Query("""
		    SELECT p
		    FROM Publicador p
		    JOIN p.pessoa pessoa
		    WHERE p.congregacao.id = :congregacaoId
		      AND p.ativo = true
		      AND NOT EXISTS (
		          SELECT u.id
		          FROM Usuario u
		          WHERE u.pessoa.id = pessoa.id
		      )
		    ORDER BY pessoa.nome ASC
		""")
		List<Publicador> findDisponiveisParaUsuario(
		        @Param("congregacaoId") Long congregacaoId
		);
}