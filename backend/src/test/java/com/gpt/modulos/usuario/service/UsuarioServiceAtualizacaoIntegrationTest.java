package com.gpt.modulos.usuario.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import com.gpt.modulos.usuario.dto.UsuarioResponseDTO;
import com.gpt.modulos.usuario.dto.UsuarioUpdateDTO;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.RoleRepository;
import com.gpt.modulos.usuario.repository.UsuarioRepository;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class UsuarioServiceAtualizacaoIntegrationTest {

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

    @Test
    void deveAtualizarUsuarioESincronizarPessoa() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleAdmin =
                criarRole("ROLE_ADMIN_GERAL");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin",
                "admin.atualizacao@teste.com",
                congregacao,
                Set.of(roleAdmin)
        );

        configurarAutenticacao(admin);

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Nome Original")
                        .email("pessoa@teste.com")
                        .build()
        );

        Publicador publicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );

        Usuario usuario = usuarioRepository.save(
                Usuario.builder()
                        .pessoa(pessoa)
                        .nome("Nome Original")
                        .email("usuario@teste.com")
                        .senha("senha-original")
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome("Nome Atualizado");
        dto.setEmail("usuario.atualizado@teste.com");
        dto.setRoles(Set.of(roleAnciao.getNome()));

        UsuarioResponseDTO response =
                usuarioService.atualizar(usuario.getId(), dto);

        assertNotNull(response);
        assertEquals(usuario.getId(), response.getId());
        assertEquals("Nome Atualizado", response.getNome());
        assertEquals(
                "usuario.atualizado@teste.com",
                response.getEmail()
        );
        assertEquals(
                congregacao.getId(),
                response.getCongregacaoId()
        );

        Usuario usuarioAtualizado =
                usuarioRepository.findById(usuario.getId())
                        .orElseThrow();

        Pessoa pessoaAtualizada =
                pessoaRepository.findById(pessoa.getId())
                        .orElseThrow();

        Publicador publicadorAtualizado =
                publicadorRepository.findByPessoaId(pessoa.getId())
                        .orElseThrow();

        assertEquals(
                "Nome Atualizado",
                usuarioAtualizado.getNome()
        );

        assertEquals(
                "usuario.atualizado@teste.com",
                usuarioAtualizado.getEmail()
        );

        assertEquals(
                "Nome Atualizado",
                pessoaAtualizada.getNome()
        );

        assertEquals(
                pessoa.getId(),
                usuarioAtualizado.getPessoa().getId()
        );

        assertEquals(
                publicador.getId(),
                publicadorAtualizado.getId()
        );

        assertEquals(
                congregacao.getId(),
                usuarioAtualizado.getCongregacao().getId()
        );
    }
    
    @Test
    void deveAtualizarSenhaDoUsuario() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleAdmin =
                criarRole("ROLE_ADMIN_GERAL");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin",
                "admin.senha@teste.com",
                congregacao,
                Set.of(roleAdmin)
        );

        configurarAutenticacao(admin);

        Pessoa pessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Publicador Senha")
                        .email("pessoa.senha@teste.com")
                        .build()
        );

        Publicador publicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );

        String senhaOriginal = "123456";
        String senhaNova = "novaSenha123";

        Usuario usuario = usuarioRepository.save(
                Usuario.builder()
                        .pessoa(pessoa)
                        .nome("Publicador Senha")
                        .email("usuario.senha@teste.com")
                        .senha(passwordEncoder.encode(senhaOriginal))
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        String senhaCriptografadaOriginal = usuario.getSenha();

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome("Publicador Senha");
        dto.setEmail("usuario.senha@teste.com");
        dto.setSenha(senhaNova);
        dto.setRoles(Set.of(roleAnciao.getNome()));

        usuarioService.atualizar(usuario.getId(), dto);

        Usuario usuarioAtualizado =
                usuarioRepository.findById(usuario.getId())
                        .orElseThrow();

        assertNotEquals(
                senhaCriptografadaOriginal,
                usuarioAtualizado.getSenha()
        );

        assertEquals(
                true,
                passwordEncoder.matches(
                        senhaNova,
                        usuarioAtualizado.getSenha()
                )
        );

        assertEquals(
                false,
                passwordEncoder.matches(
                        senhaOriginal,
                        usuarioAtualizado.getSenha()
                )
        );

        assertEquals(
                publicador.getId(),
                publicadorRepository.findByPessoaId(pessoa.getId())
                        .orElseThrow()
                        .getId()
        );
    }
    
    @Test
    void naoDeveAtualizarUsuarioComEmailJaUtilizadoPorOutroUsuario() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleAdmin =
                criarRole("ROLE_ADMIN_GERAL");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin",
                "admin.email@teste.com",
                congregacao,
                Set.of(roleAdmin)
        );

        configurarAutenticacao(admin);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Usuário Alvo")
                        .email("pessoa.alvo@teste.com")
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
                        .email("usuario.alvo@teste.com")
                        .senha("senha")
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        Pessoa outraPessoa = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Outro Usuário")
                        .email("outra.pessoa@teste.com")
                        .build()
        );

        Publicador outroPublicador = publicadorRepository.save(
                Publicador.builder()
                        .pessoa(outraPessoa)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );

        Usuario outroUsuario = usuarioRepository.save(
                Usuario.builder()
                        .pessoa(outraPessoa)
                        .nome("Outro Usuário")
                        .email("email.existente@teste.com")
                        .senha("senha")
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome("Usuário Alvo Alterado");
        dto.setEmail(outroUsuario.getEmail());
        dto.setRoles(Set.of(roleAnciao.getNome()));

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> usuarioService.atualizar(usuarioAlvo.getId(), dto)
        );

        assertEquals(
                "Já existe outro usuário cadastrado com este e-mail.",
                exception.getMessage()
        );

        Usuario usuarioVerificado =
                usuarioRepository.findById(usuarioAlvo.getId())
                        .orElseThrow();

        Pessoa pessoaVerificada =
                pessoaRepository.findById(pessoaAlvo.getId())
                        .orElseThrow();

        assertEquals(
                "usuario.alvo@teste.com",
                usuarioVerificado.getEmail()
        );

        assertEquals(
                "Usuário Alvo",
                usuarioVerificado.getNome()
        );

        assertEquals(
                "Usuário Alvo",
                pessoaVerificada.getNome()
        );

        assertEquals(
                publicadorAlvo.getId(),
                publicadorRepository.findByPessoaId(pessoaAlvo.getId())
                        .orElseThrow()
                        .getId()
        );
    }
    
    @Test
    void naoDeveAtualizarUsuarioDeOutraCongregacao() {

        Congregacao congregacaoA =
                criarCongregacao("Congregação A");

        Congregacao congregacaoB =
                criarCongregacao("Congregação B");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente",
                "superintendente@teste.com",
                congregacaoA,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Usuário Congregação B")
                        .email("pessoa.b@teste.com")
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
                        .email("usuario.b@teste.com")
                        .senha("senha")
                        .congregacao(congregacaoB)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome("Nome Alterado");
        dto.setEmail("usuario.b.alterado@teste.com");
        dto.setRoles(Set.of(roleAnciao.getNome()));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> usuarioService.atualizar(usuarioAlvo.getId(), dto)
        );

        assertEquals(
                "Você não tem permissão para atualizar usuários de outra congregação.",
                exception.getMessage()
        );

        Usuario usuarioVerificado =
                usuarioRepository.findById(usuarioAlvo.getId())
                        .orElseThrow();

        Pessoa pessoaVerificada =
                pessoaRepository.findById(pessoaAlvo.getId())
                        .orElseThrow();

        assertEquals(
                "Usuário Congregação B",
                usuarioVerificado.getNome()
        );

        assertEquals(
                "usuario.b@teste.com",
                usuarioVerificado.getEmail()
        );

        assertEquals(
                "Usuário Congregação B",
                pessoaVerificada.getNome()
        );

        assertEquals(
                congregacaoB.getId(),
                usuarioVerificado.getCongregacao().getId()
        );

        assertEquals(
                publicadorAlvo.getId(),
                publicadorRepository.findByPessoaId(pessoaAlvo.getId())
                        .orElseThrow()
                        .getId()
        );
    }
    
    @Test
    void naoDevePermitirAlterarPropriasRoles() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario usuario = criarUsuarioAutenticado(
                "Superintendente",
                "superintendente.roles@teste.com",
                congregacao,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(usuario);

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome(usuario.getNome());
        dto.setEmail(usuario.getEmail());
        dto.setRoles(Set.of(roleAnciao.getNome()));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> usuarioService.atualizar(usuario.getId(), dto)
        );

        assertEquals(
                "Você não pode alterar suas próprias roles.",
                exception.getMessage()
        );

        Usuario usuarioVerificado =
                usuarioRepository.findById(usuario.getId())
                        .orElseThrow();

        assertEquals(
                Set.of(roleSuperintendente.getNome()),
                usuarioVerificado.getRoles()
                        .stream()
                        .map(Role::getNome)
                        .collect(java.util.stream.Collectors.toSet())
        );
    }
    
    @Test
    void naoDevePermitirAtribuirRoleAdminGeralNaAtualizacao() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Role roleAdmin =
                criarRole("ROLE_ADMIN_GERAL");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente",
                "superintendente.admin@teste.com",
                congregacao,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Usuário Alvo")
                        .email("pessoa.alvo.admin@teste.com")
                        .build()
        );

        publicadorRepository.save(
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
                        .email("usuario.alvo.admin@teste.com")
                        .senha("senha")
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome("Usuário Alvo Alterado");
        dto.setEmail("usuario.alvo.admin.alterado@teste.com");
        dto.setRoles(Set.of(roleAdmin.getNome()));

        AccessDeniedException exception = assertThrows(
                AccessDeniedException.class,
                () -> usuarioService.atualizar(usuarioAlvo.getId(), dto)
        );

        assertEquals(
                "Você não tem permissão para atribuir a role ROLE_ADMIN_GERAL.",
                exception.getMessage()
        );
    }
    
    @Test
    void naoDeveAtualizarUsuarioComRoleInexistente() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleAdmin =
                criarRole("ROLE_ADMIN_GERAL");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario admin = criarUsuarioAutenticado(
                "Admin",
                "admin.role.inexistente@teste.com",
                congregacao,
                Set.of(roleAdmin)
        );

        configurarAutenticacao(admin);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Usuário Alvo")
                        .email("usuario.role@teste.com")
                        .build()
        );

        publicadorRepository.save(
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
                        .email("usuario.role@teste.com")
                        .senha("senha")
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome("Usuário Alvo");
        dto.setEmail("usuario.role@teste.com");
        dto.setRoles(Set.of("ROLE_NAO_EXISTE"));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> usuarioService.atualizar(usuarioAlvo.getId(), dto)
        );

        assertEquals(
                "Uma ou mais roles informadas não existem.",
                exception.getMessage()
        );
    }
    
    @Test
    void deveTransferirRoleSuperintendenteParaOutroUsuario() {

        Congregacao congregacao =
                criarCongregacao("Congregação Teste");

        Role roleSuperintendente =
                criarRole("ROLE_SUPERINTENDENTE_SERVICO");

        Role roleAnciao =
                criarRole("ROLE_ANCIAO");

        Usuario superintendente = criarUsuarioAutenticado(
                "Superintendente Atual",
                "superintendente.transferencia@teste.com",
                congregacao,
                Set.of(roleSuperintendente)
        );

        configurarAutenticacao(superintendente);

        Pessoa pessoaAlvo = pessoaRepository.save(
                Pessoa.builder()
                        .nome("Novo Superintendente")
                        .email("novo.superintendente.pessoa@teste.com")
                        .build()
        );

        publicadorRepository.save(
                Publicador.builder()
                        .pessoa(pessoaAlvo)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );

        Usuario usuarioAlvo = usuarioRepository.save(
                Usuario.builder()
                        .pessoa(pessoaAlvo)
                        .nome("Novo Superintendente")
                        .email("novo.superintendente@teste.com")
                        .senha("senha")
                        .congregacao(congregacao)
                        .ativo(true)
                        .roles(new HashSet<>(Set.of(roleAnciao)))
                        .build()
        );

        UsuarioUpdateDTO dto = new UsuarioUpdateDTO();
        dto.setNome("Novo Superintendente");
        dto.setEmail("novo.superintendente@teste.com");
        dto.setRoles(Set.of(roleSuperintendente.getNome()));

        usuarioService.atualizar(usuarioAlvo.getId(), dto);

        Usuario superintendenteAtualizado =
                usuarioRepository.findById(superintendente.getId())
                        .orElseThrow();

        Usuario novoSuperintendente =
                usuarioRepository.findById(usuarioAlvo.getId())
                        .orElseThrow();

        assertEquals(
                Set.of(),
                superintendenteAtualizado.getRoles()
                        .stream()
                        .map(Role::getNome)
                        .collect(java.util.stream.Collectors.toSet())
        );

        assertEquals(
                Set.of(roleSuperintendente.getNome()),
                novoSuperintendente.getRoles()
                        .stream()
                        .map(Role::getNome)
                        .collect(java.util.stream.Collectors.toSet())
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
                .map(role ->
                        new org.springframework.security.core.authority.SimpleGrantedAuthority(
                                role.getNome()
                        )
                )
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