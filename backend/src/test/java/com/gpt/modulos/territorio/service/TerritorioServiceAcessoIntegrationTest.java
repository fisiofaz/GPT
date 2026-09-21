package com.gpt.modulos.territorio.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.usuario.enums.RoleName;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;

import jakarta.transaction.Transactional;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class TerritorioServiceAcessoIntegrationTest {
	
	 @Container
	    @ServiceConnection
	    static PostgreSQLContainer postgres =
	            new PostgreSQLContainer("postgres:16-alpine");

	
	@Autowired
    private TerritorioService territorioService;
	
	@Autowired
    private CongregacaoRepository congregacaoRepository;
	
	@AfterEach
	void limparSecurityContext() {
	    SecurityContextHolder.clearContext();
	}

	
	@Test
    void devePermitirQueAdminGeralAcesseTerritorioDeOutraCongregacao() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Território Admin")
                .numero("996")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role roleAdmin = Role.builder()
                .nome(RoleName.ROLE_ADMIN_GERAL.name())
                .build();

        Pessoa pessoaAdmin = new Pessoa();
        pessoaAdmin.setNome("Administrador Geral Teste");
        pessoaAdmin.setEmail("admin.territorio.teste@example.com");

        Usuario admin = Usuario.builder()
                .pessoa(pessoaAdmin)
                .nome("Administrador Geral Teste")
                .email("admin.territorio.teste@example.com")
                .senha("senha-teste")
                .congregacao(null)
                .ativo(true)
                .roles(new HashSet<>())
                .build();

        admin.getRoles().add(roleAdmin);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        admin,
                        null,
                        null
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        TerritorioRequestDTO request =
                new TerritorioRequestDTO();

        request.setNumero("T-007");
        request.setNome("Território do Admin");
        request.setDescricao("Território de outra congregação.");
        request.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO criado =
                territorioService.criar(request);

        assertThat(criado.getCongregacaoId())
                .isEqualTo(congregacao.getId());

        TerritorioResponseDTO encontrado =
                territorioService.buscarPorId(criado.getId());

        assertThat(encontrado.getId())
                .isEqualTo(criado.getId());

        assertThat(encontrado.getNumero())
                .isEqualTo("T-007");

        assertThat(encontrado.getCongregacaoId())
                .isEqualTo(congregacao.getId());
    }
    
    @Test
    void deveImpedirUsuarioDeOutraCongregacaoAcessarTerritorio() {

        Congregacao congregacaoTerritorio = Congregacao.builder()
                .nome("Congregação Dono Território")
                .numero("997")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacaoTerritorio =
                congregacaoRepository.save(congregacaoTerritorio);

        Congregacao congregacaoUsuario = Congregacao.builder()
                .nome("Congregação do Usuário")
                .numero("998")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacaoUsuario =
                congregacaoRepository.save(congregacaoUsuario);

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoaUsuario = new Pessoa();
        pessoaUsuario.setNome("Usuário Outra Congregação");
        pessoaUsuario.setEmail("usuario.outra.congregacao@example.com");

        Usuario usuario = Usuario.builder()
                .pessoa(pessoaUsuario)
                .nome("Usuário Outra Congregação")
                .email("usuario.outra.congregacao@example.com")
                .senha("senha-teste")
                .congregacao(congregacaoUsuario)
                .ativo(true)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(role);

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        usuario,
                        null,
                        null
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        
        TerritorioRequestDTO request =
                new TerritorioRequestDTO();

        request.setNumero("T-008");
        request.setNome("Território Protegido");
        request.setDescricao(
                "Território pertencente a outra congregação."
        );
        request.setCongregacaoId(congregacaoTerritorio.getId());

        Pessoa pessoaAdmin = new Pessoa();
        pessoaAdmin.setNome("Admin Criador Território");
        pessoaAdmin.setEmail("admin.criador.territorio@example.com");

        Usuario admin = Usuario.builder()
                .pessoa(pessoaAdmin)
                .nome("Admin Criador Território")
                .email("admin.criador.territorio@example.com")
                .senha("senha-teste")
                .congregacao(null)
                .ativo(true)
                .roles(new HashSet<>())
                .build();

        admin.getRoles().add(
                Role.builder()
                        .nome(RoleName.ROLE_ADMIN_GERAL.name())
                        .build()
        );

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                admin,
                                null,
                                null
                        )
                );

        TerritorioResponseDTO territorio =
                territorioService.criar(request);

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);

        org.junit.jupiter.api.Assertions.assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () -> territorioService.buscarPorId(territorio.getId())
        );
    }
    
    @Test
    void deveImpedirUsuarioDeOutraCongregacaoListarTerritorios() {

        Congregacao congregacaoUsuario = Congregacao.builder()
                .nome("Congregação do Usuário Listagem")
                .numero("999")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacaoUsuario =
                congregacaoRepository.save(congregacaoUsuario);

        Congregacao outraCongregacao = Congregacao.builder()
                .nome("Outra Congregação Listagem")
                .numero("1000")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        outraCongregacao =
                congregacaoRepository.save(outraCongregacao);

        final Long outraCongregacaoId = outraCongregacao.getId();

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoaUsuario = new Pessoa();
        pessoaUsuario.setNome("Usuário Listagem");
        pessoaUsuario.setEmail("usuario.listagem@example.com");

        Usuario usuario = Usuario.builder()
                .pessoa(pessoaUsuario)
                .nome("Usuário Listagem")
                .email("usuario.listagem@example.com")
                .senha("senha-teste")
                .congregacao(congregacaoUsuario)
                .ativo(true)
                .roles(new HashSet<>())
                .build();

        usuario.getRoles().add(role);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                usuario,
                                null,
                                null
                        )
                );

        org.junit.jupiter.api.Assertions.assertThrows(
                org.springframework.security.access.AccessDeniedException.class,
                () -> territorioService.listarPorCongregacao(
                        outraCongregacaoId
                )
        );
    }
    
    @Test
    void devePermitirAdminGeralListarTerritoriosDeOutraCongregacao() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Listagem Admin")
                .numero("1001")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role roleAdmin = Role.builder()
                .nome(RoleName.ROLE_ADMIN_GERAL.name())
                .build();

        Pessoa pessoaAdmin = new Pessoa();
        pessoaAdmin.setNome("Admin Listagem Teste");
        pessoaAdmin.setEmail("admin.listagem@example.com");

        Usuario admin = Usuario.builder()
                .pessoa(pessoaAdmin)
                .nome("Admin Listagem Teste")
                .email("admin.listagem@example.com")
                .senha("senha-teste")
                .congregacao(null)
                .ativo(true)
                .roles(new HashSet<>())
                .build();

        admin.getRoles().add(roleAdmin);

        SecurityContextHolder.getContext()
                .setAuthentication(
                        new UsernamePasswordAuthenticationToken(
                                admin,
                                null,
                                null
                        )
                );

        TerritorioRequestDTO primeiroRequest =
                new TerritorioRequestDTO();

        primeiroRequest.setNumero("T-009");
        primeiroRequest.setNome("Território Admin 1");
        primeiroRequest.setDescricao("Primeiro território.");
        primeiroRequest.setCongregacaoId(congregacao.getId());

        TerritorioRequestDTO segundoRequest =
                new TerritorioRequestDTO();

        segundoRequest.setNumero("T-010");
        segundoRequest.setNome("Território Admin 2");
        segundoRequest.setDescricao("Segundo território.");
        segundoRequest.setCongregacaoId(congregacao.getId());

        territorioService.criar(primeiroRequest);
        territorioService.criar(segundoRequest);

        final Long congregacaoId = congregacao.getId();

        var territorios =
                territorioService.listarPorCongregacao(congregacaoId);

        assertThat(territorios)
                .hasSize(2);

        assertThat(territorios)
                .extracting(TerritorioResponseDTO::getNumero)
                .containsExactlyInAnyOrder(
                        "T-009",
                        "T-010"
                );

        assertThat(territorios)
                .allMatch(
                        territorio ->
                                congregacaoId.equals(
                                        territorio.getCongregacaoId()
                                )
                );
    }

}
