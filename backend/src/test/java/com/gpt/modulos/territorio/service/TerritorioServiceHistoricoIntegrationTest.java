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
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.territorio.dto.HistoricoTerritorioResponseDTO;
import com.gpt.modulos.territorio.dto.MovimentacaoTerritorioDTO;
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
public class TerritorioServiceHistoricoIntegrationTest {
	
	 @Container
	    @ServiceConnection
	    static PostgreSQLContainer postgres =
	            new PostgreSQLContainer("postgres:16-alpine");

	
	@Autowired
    private TerritorioService territorioService;
	
	@Autowired
    private CongregacaoRepository congregacaoRepository;
	
	@Autowired
    private PublicadorRepository publicadorRepository;
    	
	@Autowired
    private PessoaRepository pessoaRepository;
	
	@AfterEach
	void limparSecurityContext() {
	    SecurityContextHolder.clearContext();
	}

	
	 @Test
	    void deveListarHistoricoDoTerritorioDaPropriaCongregacao() {

	        Congregacao congregacao = Congregacao.builder()
	                .nome("Congregação Histórico Teste")
	                .numero("1002")
	                .cidade("Santa Maria")
	                .estado("RS")
	                .build();

	        congregacao = congregacaoRepository.save(congregacao);

	        Pessoa pessoaPublicador = new Pessoa();
	        pessoaPublicador.setNome("Publicador Histórico Teste");
	        pessoaPublicador.setEmail("publicador.historico@example.com");

	        pessoaPublicador = pessoaRepository.save(pessoaPublicador);

	        Publicador publicador = Publicador.builder()
	                .pessoa(pessoaPublicador)
	                .congregacao(congregacao)
	                .ativo(true)
	                .build();

	        publicador = publicadorRepository.save(publicador);

	        Role role = Role.builder()
	                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
	                .build();

	        Pessoa pessoaUsuario = new Pessoa();
	        pessoaUsuario.setNome("Usuário Histórico Teste");
	        pessoaUsuario.setEmail("usuario.historico@example.com");

	        Usuario usuario = Usuario.builder()
	                .pessoa(pessoaUsuario)
	                .nome("Usuário Histórico Teste")
	                .email("usuario.historico@example.com")
	                .senha("senha-teste")
	                .congregacao(congregacao)
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

	        TerritorioRequestDTO territorioRequest =
	                new TerritorioRequestDTO();

	        territorioRequest.setNumero("T-011");
	        territorioRequest.setNome("Território Histórico");
	        territorioRequest.setDescricao(
	                "Território utilizado no teste de histórico."
	        );
	        territorioRequest.setCongregacaoId(congregacao.getId());

	        TerritorioResponseDTO territorio =
	                territorioService.criar(territorioRequest);

	        MovimentacaoTerritorioDTO movimentacao =
	                new MovimentacaoTerritorioDTO();

	        movimentacao.setPublicadorId(publicador.getId());
	        movimentacao.setObservacoes(
	                "Retirada para teste de histórico."
	        );

	        territorioService.retirarTerritorio(
	                territorio.getId(),
	                movimentacao
	        );

	        territorioService.devolverTerritorio(
	                territorio.getId(),
	                "Devolução para teste de histórico."
	        );

	        var historico =
	                territorioService.listarHistorico(
	                        territorio.getId()
	                );

	        assertThat(historico)
	                .hasSize(1);

	        HistoricoTerritorioResponseDTO registro =
	                historico.get(0);

	        assertThat(registro.getTerritorioId())
	                .isEqualTo(territorio.getId());

	        assertThat(registro.getTerritorioNumero())
	                .isEqualTo("T-011");

	        assertThat(registro.getTerritorioNome())
	                .isEqualTo("Território Histórico");

	        assertThat(registro.getPublicadorId())
	                .isEqualTo(publicador.getId());

	        assertThat(registro.getPublicadorNome())
	                .isEqualTo("Publicador Histórico Teste");

	        assertThat(registro.getDataRetirada())
	                .isNotNull();

	        assertThat(registro.getDataDevolucao())
	                .isNotNull();

	        assertThat(registro.getObservacoes())
	                .contains("Retirada para teste de histórico.");

	        assertThat(registro.getObservacoes())
	                .contains("Devolução: Devolução para teste de histórico.");
	    }
	    
	    @Test
	    void deveImpedirUsuarioDeOutraCongregacaoListarHistorico() {

	        Congregacao congregacaoTerritorio = Congregacao.builder()
	                .nome("Congregação Histórico Protegido")
	                .numero("1003")
	                .cidade("Santa Maria")
	                .estado("RS")
	                .build();

	        congregacaoTerritorio =
	                congregacaoRepository.save(congregacaoTerritorio);

	        Congregacao congregacaoUsuario = Congregacao.builder()
	                .nome("Congregação Usuário Histórico")
	                .numero("1004")
	                .cidade("Santa Maria")
	                .estado("RS")
	                .build();

	        congregacaoUsuario =
	                congregacaoRepository.save(congregacaoUsuario);

	        Role role = Role.builder()
	                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
	                .build();

	        Pessoa pessoaPublicador = new Pessoa();
	        pessoaPublicador.setNome("Publicador Histórico Protegido");
	        pessoaPublicador.setEmail(
	                "publicador.historico.protegido@example.com"
	        );

	        pessoaPublicador =
	                pessoaRepository.save(pessoaPublicador);

	        Publicador publicador = Publicador.builder()
	                .pessoa(pessoaPublicador)
	                .congregacao(congregacaoTerritorio)
	                .ativo(true)
	                .build();

	        publicador = publicadorRepository.save(publicador);

	        Pessoa pessoaAdmin = new Pessoa();
	        pessoaAdmin.setNome("Admin Criador Histórico");
	        pessoaAdmin.setEmail(
	                "admin.criador.historico@example.com"
	        );

	        Usuario admin = Usuario.builder()
	                .pessoa(pessoaAdmin)
	                .nome("Admin Criador Histórico")
	                .email("admin.criador.historico@example.com")
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

	        TerritorioRequestDTO request =
	                new TerritorioRequestDTO();

	        request.setNumero("T-012");
	        request.setNome("Território Histórico Protegido");
	        request.setDescricao(
	                "Território pertencente a outra congregação."
	        );
	        request.setCongregacaoId(congregacaoTerritorio.getId());

	        TerritorioResponseDTO territorio =
	                territorioService.criar(request);

	        MovimentacaoTerritorioDTO movimentacao =
	                new MovimentacaoTerritorioDTO();

	        movimentacao.setPublicadorId(publicador.getId());
	        movimentacao.setObservacoes(
	                "Retirada para teste de isolamento."
	        );

	        territorioService.retirarTerritorio(
	                territorio.getId(),
	                movimentacao
	        );

	        territorioService.devolverTerritorio(
	                territorio.getId(),
	                "Devolução para teste de isolamento."
	        );

	        // Agora autenticamos como usuário da outra congregação.
	        Pessoa pessoaUsuario = new Pessoa();
	        pessoaUsuario.setNome("Usuário Histórico Outra Congregação");
	        pessoaUsuario.setEmail(
	                "usuario.historico.outra@example.com"
	        );

	        Usuario usuario = Usuario.builder()
	                .pessoa(pessoaUsuario)
	                .nome("Usuário Histórico Outra Congregação")
	                .email("usuario.historico.outra@example.com")
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
	                () -> territorioService.listarHistorico(
	                        territorio.getId()
	                )
	        );
	    }

}
