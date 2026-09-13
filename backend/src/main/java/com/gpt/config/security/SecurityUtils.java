package com.gpt.config.security;

import com.gpt.modulos.usuario.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    public Optional<Usuario> getUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth == null || !auth.isAuthenticated()) {
            return Optional.empty();
        }

        if (auth.getPrincipal() instanceof Usuario usuario) {
            return Optional.of(usuario);
        }

        return Optional.empty();
    }

    public Long getCongregacaoIdLogada() {
        return getUsuarioLogado()
                .map(u -> u.getCongregacao() != null ? u.getCongregacao().getId() : null)
                .orElse(null);
    }
}