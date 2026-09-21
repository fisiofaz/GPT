package com.gpt.modulos.usuario.service;

import com.gpt.config.security.JwtService;
import com.gpt.modulos.usuario.dto.LoginRequestDTO;
import com.gpt.modulos.usuario.dto.LoginResponseDTO;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponseDTO autenticar(LoginRequestDTO request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("E-mail ou senha inválidos"));

        if (!usuario.getAtivo()) {
            throw new BadCredentialsException("Usuário inativo no sistema");
        }

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            throw new BadCredentialsException("E-mail ou senha inválidos");
        }

        String token = jwtService.gerarToken(usuario);

        List<String> roles = usuario.getRoles().stream()
                .map(Role::getNome)
                .collect(Collectors.toList());

        return LoginResponseDTO.builder()
                .token(token)
                .tipo("Bearer")
                .nome(usuario.getNome())
                .email(usuario.getEmail())
                .congregacaoId(usuario.getCongregacao() != null ? usuario.getCongregacao().getId() : null)
                .roles(roles)
                .build();
    }
}