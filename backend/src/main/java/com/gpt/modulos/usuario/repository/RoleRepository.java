package com.gpt.modulos.usuario.repository;

import com.gpt.modulos.usuario.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByNome(String nome);
    Set<Role> findByNomeIn(Set<String> nomes);
}