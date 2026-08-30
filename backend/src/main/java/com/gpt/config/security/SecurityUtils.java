package com.gpt.config.security;

import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UsuarioRepository usuarioRepository;

    public Optional<Usuario> getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return usuarioRepository.findByEmail(auth.getName());
    }

    public Long getCongregacaoIdLogada() {
        return getUsuarioLogado()
                .map(u -> u.getCongregacao() != null ? u.getCongregacao().getId() : null)
                .orElse(null);
    }
}