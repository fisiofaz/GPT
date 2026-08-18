package com.gpt.modulos.usuario.service;

import com.gpt.config.security.JwtService;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.usuario.dto.LoginRequestDTO;
import com.gpt.modulos.usuario.dto.LoginResponseDTO;
import com.gpt.modulos.usuario.dto.RegistroRequestDTO;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.RoleRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final CongregacaoRepository congregacaoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponseDTO registrar(RegistroRequestDTO request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        Congregacao congregacao = null;
        if (request.getCongregacaoId() != null) {
            congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                    .orElseThrow(() -> new IllegalArgumentException("Congregação não encontrada"));
        }

        Set<Role> roles = new HashSet<>();
        for (String roleName : request.getRoles()) {
            Role role = roleRepository.findByNome(roleName)
                    .orElseThrow(() -> new IllegalArgumentException("Role não encontrada: " + roleName));
            roles.add(role);
        }

        Usuario novoUsuario = Usuario.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha())) // Criptografia nativa em BCrypt
                .congregacao(congregacao)
                .ativo(true)
                .roles(roles)
                .build();

        usuarioRepository.save(novoUsuario);

        return autenticar(new LoginRequestDTO() {{
            setEmail(request.getEmail());
            setSenha(request.getSenha());
        }});
    }

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