package com.gpt.modulos.pessoa.repository;

import com.gpt.modulos.pessoa.model.Pessoa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PessoaRepository extends JpaRepository<Pessoa, Long> {
}