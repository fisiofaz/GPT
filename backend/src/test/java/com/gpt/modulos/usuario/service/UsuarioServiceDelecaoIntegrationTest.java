package com.gpt.modulos.usuario.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.RoleRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;

import jakarta.transaction.Transactional;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UsuarioServiceDelecaoIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private PublicadorRepository publicadorRepository;

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @AfterEach
    void limparSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private Congregacao criarCongregacao(String nome) {
        Congregacao congregacao = Congregacao.builder()
                .nome(nome)
                .numero("001")
                .cidade("Santa Maria")
                .estado("RS")
                .numeroCircuito("RS-01")
                .build();

        return congregacaoRepository.save(congregacao);
    }

    private Role criarRole(String nome) {
        return roleRepository.findByNome(nome)
                .orElseGet(() -> roleRepository.save(
                        Role.builder()
                                .nome(nome)
                                .build()
                ));
    }

    private Usuario criarUsuarioAutenticado(
            String nome,
            String email,
            Congregacao congregacao,
            Set<Role> roles) {

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome(nome)
                        .email(email)
                        .build()
        );

        Usuario usuario = Usuario.builder()
                .pessoa(pessoa)
                .nome(nome)
                .email(email)
                .senha(passwordEncoder.encode("senha"))
                .congregacao(congregacao)
                .ativo(true)
                .roles(new HashSet<>(roles))
                .build();

        return usuarioRepository.save(usuario);
    }

    private void configurarAutenticacao(Usuario usuario) {

        var authorities = usuario.getRoles().stream()
                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(
                        role.getNome()
                ))
                .toList();

        Authentication authentication =
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        authorities
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }

    @Test
    void deveExcluirUsuarioDaMesmaCongregacaoSemExcluirPublicador() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente",
                "superintendente.delecao@teste.com",
                congregacao,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Usuário Alvo")
                        .email("pessoa.alvo.delecao@teste.com")
                        .build()
        );

        Publicador publicadorAlvo = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoaAlvo)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );

        Usuario usuarioAlvo = usuarioRepository.save(
                Usuario.builder()
                        .pessoa(pessoaAlvo)
                        .nome("Usuário Alvo")
                        .email("usuario.alvo.delecao@teste.com")
                        .senha(passwordEncoder.encode("senha"))
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        Long usuarioId = usuarioAlvo.getId();
        Long pessoaId = pessoaAlvo.getId();
        Long publicadorId = publicadorAlvo.getId();

        usuarioService.deletar(usuarioId);

        assertFalse(usuarioRepository.findById(usuarioId).isPresent());

        assertNotNull(
                pessoaRepository.findById(pessoaId).orElse(null)
        );

        assertNotNull(
                publicadorRepository.findById(publicadorId).orElse(null)
        );
    }
    
    @Test
    void naoDevePermitirExcluirProprioUsuario() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente",
                "superintendente.proprio.delecao@teste.com",
                congregacao,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> usuarioService.deletar(superintendente.getId())
        );

        assertEquals(
                "Você não pode excluir o próprio usuário.",
                exception.getMessage()
        );

        Usuario usuarioAtualizado =
                usuarioRepository.findById(superintendente.getId())
                        .orElseThrow();

        assertTrue(usuarioAtualizado.getAtivo());
    }
    
    @Test
    void naoDevePermitirExcluirUsuarioDeOutraCongregacao() {

        Congregacao congregacaoA =
                criarCongregacao("Congregação A");

        Congregacao congregacaoB =
                criarCongregacao("Congregação B");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente A",
                "superintendente.exclusao.outra@teste.com",
                congregacaoA,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Usuário Congregação B")
                        .email("pessoa.alvo.exclusao.b@teste.com")
                        .build()
        );

        Publicador publicadorAlvo = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoaAlvo)
                        .congregacao(congregacaoB)
                        .ativo(true)
                        .build()
        );

        Usuario usuarioAlvo = usuarioRepository.save(
                Usuario.builder()
                        .pessoa(pessoaAlvo)
                        .nome("Usuário Congregação B")
                        .email("usuario.alvo.exclusao.b@teste.com")
                        .senha(passwordEncoder.encode("senha"))
                        .congregacao(congregacaoB)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        Long usuarioId = usuarioAlvo.getId();
        Long pessoaId = pessoaAlvo.getId();
        Long publicadorId = publicadorAlvo.getId();

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> usuarioService.deletar(usuarioId)
        );

        assertEquals(
                "Você não tem permissão para excluir usuários de outra congregação.",
                exception.getMessage()
        );

        assertTrue(usuarioRepository.findById(usuarioId).isPresent());
        assertTrue(pessoaRepository.findById(pessoaId).isPresent());
        assertTrue(publicadorRepository.findById(publicadorId).isPresent());
    }
    
    @Test
    void devePermitirQueAdminGeralExcluaUsuarioDeOutraCongregacao() {

        Congregacao congregacaoA =
                criarCongregacao("Congregação A");

        Congregacao congregacaoB =
                criarCongregacao("Congregação B");

        Role roleAdmin =
                criarRole("ROLE_ADMIN_GERAL");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario adminGeral = criarUsuarioAutenticado(
                "Administrador Geral",
                "admin.delecao.outra@teste.com",
                congregacaoA,
                Set.of(roleAdmin)
        );

        configurarAutenticacao(adminGeral);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Usuário Congregação B")
                        .email("pessoa.alvo.admin.delecao@teste.com")
                        .build()
        );

        Publicador publicadorAlvo = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoaAlvo)
                        .congregacao(congregacaoB)
                        .ativo(true)
                        .build()
        );

        Usuario usuarioAlvo = usuarioRepository.save(
                Usuario.builder()
                        .pessoa(pessoaAlvo)
                        .nome("Usuário Congregação B")
                        .email("usuario.alvo.admin.delecao@teste.com")
                        .senha(passwordEncoder.encode("senha"))
                        .congregacao(congregacaoB)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        Long usuarioId = usuarioAlvo.getId();
        Long pessoaId = pessoaAlvo.getId();
        Long publicadorId = publicadorAlvo.getId();

        usuarioService.deletar(usuarioId);

        assertFalse(usuarioRepository.findById(usuarioId).isPresent());

        assertTrue(pessoaRepository.findById(pessoaId).isPresent());

        assertTrue(publicadorRepository.findById(publicadorId).isPresent());
    }
}