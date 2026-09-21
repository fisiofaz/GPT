package com.gpt.modulos.territorio.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.usuario.enums.RoleName;
import com.gpt.modulos.usuario.model.Role;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.territorio.dto.MovimentacaoTerritorioDTO;
import com.gpt.modulos.territorio.dto.TerritorioRequestDTO;
import com.gpt.modulos.territorio.dto.TerritorioResponseDTO;
import com.gpt.modulos.territorio.enums.StatusTerritorio;
import com.gpt.modulos.territorio.model.Territorio;
import com.gpt.modulos.territorio.repository.TerritorioRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.territorio.dto.HistoricoTerritorioResponseDTO;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.postgresql.PostgreSQLContainer;

import java.util.HashSet;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TerritorioServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer postgres =
            new PostgreSQLContainer("postgres:16-alpine");

    @Autowired
    private TerritorioService territorioService;

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @Autowired
    private TerritorioRepository territorioRepository;
    
    @Autowired
    private PublicadorRepository publicadorRepository;
    
    @Autowired
    private PessoaRepository pessoaRepository;

    @AfterEach
    void limparSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void deveCriarTerritorioAtravésDoService() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Território Teste")
                .numero("997")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoa = Pessoa.builder()
                .nome("Usuário Teste Território")
                .email("territorio.teste@example.com")
                .build();

        Usuario usuario = Usuario.builder()
                .pessoa(pessoa)
                .nome("Usuário Teste Território")
                .email("territorio.teste@example.com")
                .senha("senha-teste")
                .congregacao(congregacao)
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

        TerritorioRequestDTO request = new TerritorioRequestDTO();

        request.setNumero("T-001");
        request.setNome("Território Teste");
        request.setDescricao("Território criado pelo teste de integração.");
        request.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO response =
                territorioService.criar(request);

        assertThat(response.getId()).isNotNull();
        assertThat(response.getNumero())
                .isEqualTo("T-001");
        assertThat(response.getNome())
                .isEqualTo("Território Teste");
        assertThat(response.getStatus())
                .isEqualTo(StatusTerritorio.DISPONIVEL);
        assertThat(response.getCongregacaoId())
                .isEqualTo(congregacao.getId());

        Territorio territorioPersistido =
                territorioRepository.findById(response.getId())
                        .orElseThrow();

        assertThat(territorioPersistido.getNumero())
                .isEqualTo("T-001");
        assertThat(territorioPersistido.getNome())
                .isEqualTo("Território Teste");
        assertThat(territorioPersistido.getStatus())
                .isEqualTo(StatusTerritorio.DISPONIVEL);
        assertThat(territorioPersistido.getCongregacao().getId())
                .isEqualTo(congregacao.getId());
    }
    
    @Test
    void deveImpedirCriacaoDeTerritorioEmOutraCongregacao() {

        Congregacao congregacaoUsuario = Congregacao.builder()
                .nome("Congregação do Usuário")
                .numero("996")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacaoUsuario =
                congregacaoRepository.save(congregacaoUsuario);

        Congregacao outraCongregacao = Congregacao.builder()
                .nome("Outra Congregação")
                .numero("995")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        outraCongregacao =
                congregacaoRepository.save(outraCongregacao);

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoa = Pessoa.builder()
                .nome("Usuário Isolamento Teste")
                .email("isolamento.teste@example.com")
                .build();

        Usuario usuario = Usuario.builder()
                .pessoa(pessoa)
                .nome("Usuário Isolamento Teste")
                .email("isolamento.teste@example.com")
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

        TerritorioRequestDTO request = new TerritorioRequestDTO();

        request.setNumero("T-002");
        request.setNome("Território Outra Congregação");
        request.setDescricao("Teste de isolamento entre congregações.");
        request.setCongregacaoId(outraCongregacao.getId());

        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> territorioService.criar(request)
        )
                .isInstanceOf(
                        org.springframework.security.access.AccessDeniedException.class
                )
                .hasMessage(
                        "Você não tem permissão para acessar outra congregação."
                );

        assertThat(
                territorioRepository.existsByNumeroAndCongregacaoId(
                        "T-002",
                        outraCongregacao.getId()
                )
        ).isFalse();
    }
    
    @Test
    void deveImpedirNovaRetiradaDeTerritorioEmTrabalho() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Retirada Teste")
                .numero("994")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Pessoa pessoa = new Pessoa();

        pessoa.setNome("Publicador Retirada Teste");
        pessoa.setEmail("retirada.teste@example.com");

        pessoa = pessoaRepository.save(pessoa);

        Publicador publicador = Publicador.builder()
                .pessoa(pessoa)
                .congregacao(congregacao)
                .ativo(true)
                .build();

        publicador = publicadorRepository.save(publicador);

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoaUsuario = new Pessoa();

        pessoaUsuario.setNome("Usuário Retirada Teste");
        pessoaUsuario.setEmail("usuario.retirada@example.com");

        Usuario usuario = Usuario.builder()
                .pessoa(pessoaUsuario)
                .nome("Usuário Retirada Teste")
                .email("usuario.retirada@example.com")
                .senha("senha-teste")
                .congregacao(congregacao)
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

        TerritorioRequestDTO territorioRequest =
                new TerritorioRequestDTO();

        territorioRequest.setNumero("T-003");
        territorioRequest.setNome("Território Retirada Teste");
        territorioRequest.setDescricao(
                "Território utilizado no teste de retirada."
        );
        territorioRequest.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(territorioRequest);

        MovimentacaoTerritorioDTO movimentacao =
                new MovimentacaoTerritorioDTO();

        movimentacao.setPublicadorId(publicador.getId());

        territorioService.retirarTerritorio(
                territorio.getId(),
                movimentacao
        );

        org.assertj.core.api.Assertions.assertThatThrownBy(
                () -> territorioService.retirarTerritorio(
                        territorio.getId(),
                        movimentacao
                )
        )
                .isInstanceOf(IllegalStateException.class)
                .hasMessage(
                        "O território não está disponível para retirada"
                );

        Territorio territorioPersistido =
                territorioRepository.findById(territorio.getId())
                        .orElseThrow();

        assertThat(territorioPersistido.getStatus())
                .isEqualTo(StatusTerritorio.EM_TRABALHO);
    }
    
    @Test
    void deveDevolverTerritorioEVoltarParaDisponivel() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Devolução Teste")
                .numero("993")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Pessoa pessoa = new Pessoa();
        pessoa.setNome("Publicador Devolução Teste");
        pessoa.setEmail("devolucao.teste@example.com");

        pessoa = pessoaRepository.save(pessoa);

        Publicador publicador = Publicador.builder()
                .pessoa(pessoa)
                .congregacao(congregacao)
                .ativo(true)
                .build();

        publicador = publicadorRepository.save(publicador);

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoaUsuario = new Pessoa();
        pessoaUsuario.setNome("Usuário Devolução Teste");
        pessoaUsuario.setEmail("usuario.devolucao@example.com");

        Usuario usuario = Usuario.builder()
                .pessoa(pessoaUsuario)
                .nome("Usuário Devolução Teste")
                .email("usuario.devolucao@example.com")
                .senha("senha-teste")
                .congregacao(congregacao)
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

        TerritorioRequestDTO territorioRequest =
                new TerritorioRequestDTO();

        territorioRequest.setNumero("T-004");
        territorioRequest.setNome("Território Devolução Teste");
        territorioRequest.setDescricao(
                "Território utilizado no teste de devolução."
        );
        territorioRequest.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(territorioRequest);

        MovimentacaoTerritorioDTO movimentacao =
                new MovimentacaoTerritorioDTO();

        movimentacao.setPublicadorId(publicador.getId());
        movimentacao.setObservacoes("Retirada para teste de devolução.");

        territorioService.retirarTerritorio(
                territorio.getId(),
                movimentacao
        );

        Territorio territorioEmTrabalho =
                territorioRepository.findById(territorio.getId())
                        .orElseThrow();

        assertThat(territorioEmTrabalho.getStatus())
                .isEqualTo(StatusTerritorio.EM_TRABALHO);

        HistoricoTerritorioResponseDTO historico =
                territorioService.devolverTerritorio(
                        territorio.getId(),
                        "Devolução realizada no teste."
                );

        assertThat(historico.getId()).isNotNull();
        assertThat(historico.getTerritorioId())
                .isEqualTo(territorio.getId());
        assertThat(historico.getPublicadorId())
                .isEqualTo(publicador.getId());
        assertThat(historico.getDataRetirada())
                .isNotNull();
        assertThat(historico.getDataDevolucao())
                .isNotNull();
        assertThat(historico.getObservacoes())
                .contains("Retirada para teste de devolução.");
        assertThat(historico.getObservacoes())
                .contains("Devolução: Devolução realizada no teste.");

        Territorio territorioDisponivel =
                territorioRepository.findById(territorio.getId())
                        .orElseThrow();

        assertThat(territorioDisponivel.getStatus())
                .isEqualTo(StatusTerritorio.DISPONIVEL);
    }
    
    @Test
    void deveImpedirDevolucaoDeTerritorioSemRetiradaEmAberto() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Devolução Inválida")
                .numero("994")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoaUsuario = new Pessoa();
        pessoaUsuario.setNome("Usuário Devolução Inválida");
        pessoaUsuario.setEmail("usuario.devolucao.invalida@example.com");

        Usuario usuario = Usuario.builder()
                .pessoa(pessoaUsuario)
                .nome("Usuário Devolução Inválida")
                .email("usuario.devolucao.invalida@example.com")
                .senha("senha-teste")
                .congregacao(congregacao)
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

        TerritorioRequestDTO territorioRequest =
                new TerritorioRequestDTO();

        territorioRequest.setNumero("T-005");
        territorioRequest.setNome("Território Sem Retirada");
        territorioRequest.setDescricao(
                "Território utilizado no teste de devolução inválida."
        );
        territorioRequest.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(territorioRequest);

        assertThat(territorio.getStatus())
                .isEqualTo(StatusTerritorio.DISPONIVEL);

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalStateException.class,
                () -> territorioService.devolverTerritorio(
                        territorio.getId(),
                        "Tentativa de devolução inválida."
                )
        );

        Territorio territorioAtualizado =
                territorioRepository.findById(territorio.getId())
                        .orElseThrow();

        assertThat(territorioAtualizado.getStatus())
                .isEqualTo(StatusTerritorio.DISPONIVEL);
    }
    
    @Test
    void deveImpedirSegundaDevolucaoDoMesmoTerritorio() {

        Congregacao congregacao = Congregacao.builder()
                .nome("Congregação Segunda Devolução")
                .numero("995")
                .cidade("Santa Maria")
                .estado("RS")
                .build();

        congregacao = congregacaoRepository.save(congregacao);

        Pessoa pessoa = new Pessoa();
        pessoa.setNome("Publicador Segunda Devolução");
        pessoa.setEmail("publicador.segunda.devolucao@example.com");

        pessoa = pessoaRepository.save(pessoa);

        Publicador publicador = Publicador.builder()
                .pessoa(pessoa)
                .congregacao(congregacao)
                .ativo(true)
                .build();

        publicador = publicadorRepository.save(publicador);

        Role role = Role.builder()
                .nome(RoleName.ROLE_SERVO_TERRITORIO.name())
                .build();

        Pessoa pessoaUsuario = new Pessoa();
        pessoaUsuario.setNome("Usuário Segunda Devolução");
        pessoaUsuario.setEmail("usuario.segunda.devolucao@example.com");

        Usuario usuario = Usuario.builder()
                .pessoa(pessoaUsuario)
                .nome("Usuário Segunda Devolução")
                .email("usuario.segunda.devolucao@example.com")
                .senha("senha-teste")
                .congregacao(congregacao)
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

        TerritorioRequestDTO territorioRequest =
                new TerritorioRequestDTO();

        territorioRequest.setNumero("T-006");
        territorioRequest.setNome("Território Segunda Devolução");
        territorioRequest.setDescricao(
                "Território utilizado no teste de segunda devolução."
        );
        territorioRequest.setCongregacaoId(congregacao.getId());

        TerritorioResponseDTO territorio =
                territorioService.criar(territorioRequest);

        MovimentacaoTerritorioDTO movimentacao =
                new MovimentacaoTerritorioDTO();

        movimentacao.setPublicadorId(publicador.getId());
        movimentacao.setObservacoes("Retirada para teste.");

        territorioService.retirarTerritorio(
                territorio.getId(),
                movimentacao
        );

        HistoricoTerritorioResponseDTO primeiraDevolucao =
                territorioService.devolverTerritorio(
                        territorio.getId(),
                        "Primeira devolução."
                );

        assertThat(primeiraDevolucao.getDataDevolucao())
                .isNotNull();

        Territorio territorioDisponivel =
                territorioRepository.findById(territorio.getId())
                        .orElseThrow();

        assertThat(territorioDisponivel.getStatus())
                .isEqualTo(StatusTerritorio.DISPONIVEL);

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalStateException.class,
                () -> territorioService.devolverTerritorio(
                        territorio.getId(),
                        "Segunda devolução inválida."
                )
        );

        Territorio territorioFinal =
                territorioRepository.findById(territorio.getId())
                        .orElseThrow();

        assertThat(territorioFinal.getStatus())
                .isEqualTo(StatusTerritorio.DISPONIVEL);
    }
           
}