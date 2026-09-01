package com.gpt.modulos.usuario.repository;

import com.gpt.modulos.usuario.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
	List<Usuario> findByCongregacaoId(Long congregacaoId);
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
}