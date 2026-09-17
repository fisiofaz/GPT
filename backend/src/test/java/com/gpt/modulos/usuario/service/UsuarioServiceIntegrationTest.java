package com.gpt.modulos.usuario.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.gpt.exceptions.BusinessException;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.dto.UsuarioRequestDTO;
import com.gpt.modulos.usuario.dto.UsuarioResponseDTO;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.RoleRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UsuarioServiceIntegrationTest {

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

    @AfterEach
    void limparSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveCriarUsuarioAPartirDePublicadorExistente() {

        Congregacao congregacao = criarCongregacao("Congregação Teste");

        Role role = criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin",
                "admin@teste.com",
                congregacao,
                Set.of(criarRole("ROLE_ADMIN_GERAL"))
        );

        configurarAutenticacao(admin);

        Pessoa pessoa = Pessoa.builder()
                .nome("Publicador Teste")
                .email("publicador@teste.com")
                .build();

        pessoa = pessoaRepository.save(pessoa);

        Publicador publicador = Publicador.builder()
                .pessoa(pessoa)
                .congregacao(congregacao)
                .ativo(true)
                .build();

        publicador = publicadorRepository.save(publicador);

        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setPublicadorId(publicador.getId());
        dto.setEmail("usuario@teste.com");
        dto.setSenha("123456");
        dto.setRoles(Set.of(role.getNome()));
        
        long quantidadePessoasAntes = pessoaRepository.count();
        long quantidadePublicadoresAntes = publicadorRepository.count();

        UsuarioResponseDTO response = usuarioService.criar(dto);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("Publicador Teste", response.getNome());
        assertEquals("usuario@teste.com", response.getEmail());
        assertEquals(congregacao.getId(), response.getCongregacaoId());

        Usuario usuarioSalvo =
                usuarioRepository.findById(response.getId()).orElseThrow();

        assertEquals(pessoa.getId(), usuarioSalvo.getPessoa().getId());
        assertEquals(publicador.getId(),
                publicadorRepository.findByPessoaId(pessoa.getId())
                        .orElseThrow()
                        .getId());
        assertEquals(
                quantidadePessoasAntes,
                pessoaRepository.count(),
                "Não deve criar uma nova Pessoa ao conceder acesso."
        );

        assertEquals(
                quantidadePublicadoresAntes,
                publicadorRepository.count(),
                "Não deve criar um novo Publicador ao conceder acesso."
        );

        assertFalse(
                usuarioRepository.findById(response.getId())
                        .orElseThrow()
                        .getSenha()
                        .equals("123456"),
                "A senha não deve ser armazenada em texto puro."
        );
    }
    
    @Test
    void naoDeveCriarUsuarioParaPublicadorQueJaPossuiAcesso() {

        Congregacao congregacao = criarCongregacao("Congregação Teste");

        Role role = criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin",
                "admin@teste.com",
                congregacao,
                Set.of(criarRole("ROLE_ADMIN_GERAL"))
        );

        configurarAutenticacao(admin);

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Publicador Com Acesso")
                        .email("publicador@teste.com")
                        .build()
        );

        Publicador publicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );

        Usuario usuarioExistente = Usuario.builder()
                .pessoa(pessoa)
                .nome(pessoa.getNome())
                .email("usuario.existente@teste.com")
                .senha("senha")
                .congregacao(congregacao)
                .ativo(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();

        usuarioRepository.save(usuarioExistente);

        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setPublicadorId(publicador.getId());
        dto.setEmail("novo.usuario@teste.com");
        dto.setSenha("123456");
        dto.setRoles(Set.of(role.getNome()));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> usuarioService.criar(dto)
        );

        assertEquals(
                "Este publicador já possui acesso ao sistema.",
                exception.getMessage()
        );
    }
    
    @Test
    void naoDeveCriarUsuarioParaPublicadorDeOutraCongregacao() {

        Congregacao congregacaoDoUsuario =
                criarCongregacao("Congregação do Superintendente");

        Congregacao outraCongregacao =
                criarCongregacao("Outra Congregação");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente",
                "superintendente@teste.com",
                congregacaoDoUsuario,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Publicador Outra Congregação")
                        .email("publicador.outra@teste.com")
                        .build()
        );

        Publicador publicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(outraCongregacao)
                        .ativo(true)
                        .build()
        );

        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setPublicadorId(publicador.getId());
        dto.setEmail("novo.usuario@teste.com");
        dto.setSenha("123456");
        dto.setRoles(Set.of(roleAnciao.getNome()));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> usuarioService.criar(dto)
        );

        assertEquals(
                "Você não tem permissão para criar usuários em outra congregação.",
                exception.getMessage()
        );

        assertEquals(
                0,
                usuarioRepository.findByEmail("novo.usuario@teste.com").stream().count()
        );
    }
    
    @Test
    void devePermitirQueAdminGeralCrieUsuarioEmOutraCongregacao() {

        Congregacao congregacaoDoAdmin =
                criarCongregacao("Congregação do Admin");

        Congregacao outraCongregacao =
                criarCongregacao("Outra Congregação");

        Role roleAdminGeral =
                criarRole("ROLE_ADMIN_GERAL");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin Geral",
                "admin.geral@teste.com",
                congregacaoDoAdmin,
                Set.of(roleAdminGeral)
        );

        configurarAutenticacao(admin);

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Publicador Outra Congregação")
                        .email("publicador.admin@teste.com")
                        .build()
        );

        Publicador publicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(outraCongregacao)
                        .ativo(true)
                        .build()
        );

        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setPublicadorId(publicador.getId());
        dto.setEmail("usuario.outra@teste.com");
        dto.setSenha("123456");
        dto.setRoles(Set.of(roleAnciao.getNome()));

        UsuarioResponseDTO response = usuarioService.criar(dto);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals("Publicador Outra Congregação", response.getNome());
        assertEquals("usuario.outra@teste.com", response.getEmail());
        assertEquals(outraCongregacao.getId(), response.getCongregacaoId());

        Usuario usuarioSalvo =
                usuarioRepository.findById(response.getId()).orElseThrow();

        assertEquals(
                pessoa.getId(),
                usuarioSalvo.getPessoa().getId()
        );

        assertEquals(
                publicador.getId(),
                publicadorRepository.findByPessoaId(pessoa.getId())
                        .orElseThrow()
                        .getId()
        );
    }
    
    @Test
    void naoDevePermitirQueSuperintendenteAtribuaRoleAdminGeral() {

        Congregacao congregacao =
                criarCongregacao("Congregação do Superintendente");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente",
                "superintendente.roles@teste.com",
                congregacao,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Publicador Teste Role")
                        .email("publicador.role@teste.com")
                        .build()
        );

        Publicador publicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );

        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setPublicadorId(publicador.getId());
        dto.setEmail("usuario.admin@teste.com");
        dto.setSenha("123456");
        dto.setRoles(Set.of("ROLE_ADMIN_GERAL"));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> usuarioService.criar(dto)
        );

        assertEquals(
                "Você não tem permissão para atribuir a role ROLE_ADMIN_GERAL.",
                exception.getMessage()
        );

        assertFalse(
                usuarioRepository.existsByEmail("usuario.admin@teste.com")
        );
    }
    
    @Test
    void naoDeveCriarUsuarioParaPublicadorInativo() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin",
                "admin.inativo@teste.com",
                congregacao,
                Set.of(criarRole("ROLE_ADMIN_GERAL"))
        );

        configurarAutenticacao(admin);

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Publicador Inativo")
                        .email("publicador.inativo@teste.com")
                        .build()
        );

        Publicador publicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(congregacao)
                        .ativo(false)
                        .build()
        );

        UsuarioRequestDTO dto = new UsuarioRequestDTO();
        dto.setPublicadorId(publicador.getId());
        dto.setEmail("usuario.inativo@teste.com");
        dto.setSenha("123456");
        dto.setRoles(Set.of(roleAnciao.getNome()));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> usuarioService.criar(dto)
        );

        assertEquals(
                "Não é possível conceder acesso a um publicador inativo.",
                exception.getMessage()
        );

        assertFalse(
                usuarioRepository.existsByEmail("usuario.inativo@teste.com")
        );
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
                .senha("senha")
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
}