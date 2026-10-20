package com.gpt.modulos.publicador.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.model.SituacaoPessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicador.dto.PublicadorRequestDTO;
import com.gpt.modulos.publicador.dto.PublicadorResponseDTO;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;

import jakarta.persistence.EntityNotFoundException;
import com.gpt.shared.dto.PageResponse;
import com.gpt.config.security.SecurityUtils;

import org.springframework.data.domain.PageRequest;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import static org.mockito.Mockito.when;
import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.BeforeEach;

@Testcontainers
@SpringBootTest
@ActiveProfiles("test")
@Transactional
class PublicadorServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private PublicadorService publicadorService;
    
    @MockitoBean
    private SecurityUtils securityUtils;

    @Autowired
    private PublicadorRepository publicadorRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private CongregacaoRepository congregacaoRepository;
    
    @BeforeEach
    void configurarSeguranca() {
        when(securityUtils.isAdminGeral()).thenReturn(true);
    }

    @Test
    void deveCriarPublicadorComPessoaECongregacao() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("  João da Silva  ");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.silva@teste.com");
        request.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO response = publicadorService.criar(request);

        assertNotNull(response.getId());
        assertEquals("João da Silva", response.getNome());
        assertEquals(LocalDate.of(1990, 5, 10), response.getDataNascimento());
        assertEquals("55999999999", response.getTelefone());
        assertEquals("joao.silva@teste.com", response.getEmail());
        assertTrue(response.getAtivo());
        assertEquals(congregacao.getId(), response.getCongregacaoId());

        Publicador publicador = publicadorRepository.findById(response.getId())
                .orElseThrow();

        assertNotNull(publicador.getPessoa());
        assertEquals(congregacao.getId(), publicador.getCongregacao().getId());
        assertTrue(publicador.getAtivo());

        Pessoa pessoa = pessoaRepository.findById(publicador.getPessoa().getId())
                .orElseThrow();

        assertEquals("João da Silva", pessoa.getNome());
        assertEquals(LocalDate.of(1990, 5, 10), pessoa.getDataNascimento());
        assertEquals("55999999999", pessoa.getTelefone());
        assertEquals("joao.silva@teste.com", pessoa.getEmail());
    }
    
    @Test
    void naoDeveCriarPublicadorQuandoCongregacaoNaoExiste() {

        long pessoasAntes = pessoaRepository.count();
        long publicadoresAntes = publicadorRepository.count();

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("João da Silva");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.inexistente@teste.com");
        request.setCongregacaoId(999999L);

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> publicadorService.criar(request)
        );

        assertEquals(
                "Congregação não encontrada com ID: 999999",
                exception.getMessage()
        );

        assertEquals(pessoasAntes, pessoaRepository.count());
        assertEquals(publicadoresAntes, publicadorRepository.count());
    }
    
 
    @Test
    void deveDesativarPublicadorESincronizarSituacaoDaPessoa() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("João da Silva");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.desativar@teste.com");
        request.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado = publicadorService.criar(request);

        publicadorService.desativar(criado.getId());

        Publicador publicador = publicadorRepository.findById(criado.getId())
                .orElseThrow();

        Pessoa pessoa = pessoaRepository.findById(publicador.getPessoa().getId())
                .orElseThrow();

        assertFalse(publicador.getAtivo());
        assertEquals(SituacaoPessoa.INATIVO, pessoa.getSituacao());
    }
    
    @Test
    void deveReativarPublicadorESincronizarSituacaoDaPessoa() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("João da Silva");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.reativar@teste.com");
        request.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado = publicadorService.criar(request);

        publicadorService.desativar(criado.getId());

        publicadorService.reativar(criado.getId());

        Publicador publicador = publicadorRepository.findById(criado.getId())
                .orElseThrow();

        Pessoa pessoa = pessoaRepository.findById(publicador.getPessoa().getId())
                .orElseThrow();

        assertTrue(publicador.getAtivo());
        assertEquals(SituacaoPessoa.ATIVO, pessoa.getSituacao());
    }
    
    @Test
    void deveListarApenasPublicadoresAtivosDaCongregacaoOrdenadosPorNome() {

        Congregacao congregacao1 = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação A")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        Congregacao congregacao2 = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação B")
                        .numero("002")
                        .cidade("Porto Alegre")
                        .estado("RS")
                        .numeroCircuito("RS-02")
                        .build()
        );

        PublicadorRequestDTO joao = new PublicadorRequestDTO();
        joao.setNome("João da Silva");
        joao.setDataNascimento(LocalDate.of(1990, 5, 10));
        joao.setTelefone("55999999999");
        joao.setEmail("joao.listar@teste.com");
        joao.setCongregacaoId(congregacao1.getId());

        PublicadorRequestDTO ana = new PublicadorRequestDTO();
        ana.setNome("Ana Souza");
        ana.setDataNascimento(LocalDate.of(1985, 3, 20));
        ana.setTelefone("55888888888");
        ana.setEmail("ana.listar@teste.com");
        ana.setCongregacaoId(congregacao1.getId());

        PublicadorRequestDTO carlos = new PublicadorRequestDTO();
        carlos.setNome("Carlos Oliveira");
        carlos.setDataNascimento(LocalDate.of(1992, 8, 15));
        carlos.setTelefone("55777777777");
        carlos.setEmail("carlos.listar@teste.com");
        carlos.setCongregacaoId(congregacao1.getId());

        PublicadorRequestDTO maria = new PublicadorRequestDTO();
        maria.setNome("Maria Santos");
        maria.setDataNascimento(LocalDate.of(1988, 11, 2));
        maria.setTelefone("55666666666");
        maria.setEmail("maria.listar@teste.com");
        maria.setCongregacaoId(congregacao2.getId());

        PublicadorResponseDTO publicadorJoao = publicadorService.criar(joao);
        PublicadorResponseDTO publicadorAna = publicadorService.criar(ana);
        PublicadorResponseDTO publicadorCarlos = publicadorService.criar(carlos);
        publicadorService.criar(maria);

        publicadorService.desativar(publicadorJoao.getId());

        PageResponse<PublicadorResponseDTO> resultado =
                publicadorService.listarPorCongregacao(
                        congregacao1.getId(),
                        PageRequest.of(0, 10)
                );

        assertEquals(2, resultado.getTotalElements());
        assertEquals(1, resultado.getTotalPages());
        assertEquals(2, resultado.getContent().size());

        assertEquals("Ana Souza", resultado.getContent().get(0).getNome());

        assertEquals("Carlos Oliveira", resultado.getContent().get(1).getNome());

        assertTrue(resultado.getContent().stream()
                .allMatch(publicador ->
                        congregacao1.getId().equals(publicador.getCongregacaoId())));

        assertTrue(resultado.getContent().stream()
                .allMatch(PublicadorResponseDTO::getAtivo));

        assertFalse(resultado.getContent().stream()
                .anyMatch(publicador ->
                        publicadorJoao.getId().equals(publicador.getId())));
    }
    
    @Test
    void deveRetornarListaVaziaQuandoNaoHouverPublicadoresAtivosNaCongregacao() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Sem Ativos")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("João da Silva");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.semativo@teste.com");
        request.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado = publicadorService.criar(request);

        publicadorService.desativar(criado.getId());

        PageResponse<PublicadorResponseDTO> resultado =
                publicadorService.listarPorCongregacao(
                        congregacao.getId(),
                        PageRequest.of(0, 10)
                );

        assertNotNull(resultado);
        assertTrue(resultado.getContent().isEmpty());
        assertEquals(0, resultado.getTotalElements());
        assertEquals(0, resultado.getTotalPages());
        assertTrue(resultado.isFirst());
        assertTrue(resultado.isLast());
    }
    
    @Test
    void naoDeveDesativarPublicadorQuandoNaoExiste() {

        Long idInexistente = 999999L;

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> publicadorService.desativar(idInexistente)
        );

        assertEquals(
                "Publicador não encontrado com ID: 999999",
                exception.getMessage()
        );
    }
    
    @Test
    void naoDeveReativarPublicadorQuandoNaoExiste() {

        Long idInexistente = 999999L;

        EntityNotFoundException exception = assertThrows(
                EntityNotFoundException.class,
                () -> publicadorService.reativar(idInexistente)
        );

        assertEquals(
                "Publicador não encontrado com ID: 999999",
                exception.getMessage()
        );
    }
    
    @Test
    void deveManterAmesmaPessoaAoAtualizarPublicador() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO criarRequest = new PublicadorRequestDTO();
        criarRequest.setNome("João da Silva");
        criarRequest.setDataNascimento(LocalDate.of(1990, 5, 10));
        criarRequest.setTelefone("55999999999");
        criarRequest.setEmail("joao@teste.com");
        criarRequest.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado = publicadorService.criar(criarRequest);

        Publicador publicadorAntes =
                publicadorRepository.findById(criado.getId()).orElseThrow();

        Long pessoaIdAntes = publicadorAntes.getPessoa().getId();

        PublicadorRequestDTO atualizarRequest = new PublicadorRequestDTO();
        atualizarRequest.setNome("João Atualizado");
        atualizarRequest.setDataNascimento(LocalDate.of(1991, 6, 15));
        atualizarRequest.setTelefone("55888888888");
        atualizarRequest.setEmail("joao.atualizado@teste.com");
        atualizarRequest.setCongregacaoId(congregacao.getId());

        publicadorService.atualizar(criado.getId(), atualizarRequest);

        Publicador publicadorDepois =
                publicadorRepository.findById(criado.getId()).orElseThrow();

        Long pessoaIdDepois = publicadorDepois.getPessoa().getId();

        assertEquals(pessoaIdAntes, pessoaIdDepois);
        assertEquals("João Atualizado", publicadorDepois.getPessoa().getNome());
        assertEquals(
                LocalDate.of(1991, 6, 15),
                publicadorDepois.getPessoa().getDataNascimento()
        );
        assertEquals("55888888888", publicadorDepois.getPessoa().getTelefone());
        assertEquals(
                "joao.atualizado@teste.com",
                publicadorDepois.getPessoa().getEmail()
        );
    }
    
    @Test
    void deveManterPublicadorInativoAoDesativarNovamente() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("João da Silva");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.idempotente@teste.com");
        request.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado = publicadorService.criar(request);

        publicadorService.desativar(criado.getId());
        publicadorService.desativar(criado.getId());

        Publicador publicador =
                publicadorRepository.findById(criado.getId()).orElseThrow();

        Pessoa pessoa =
                pessoaRepository.findById(publicador.getPessoa().getId()).orElseThrow();

        assertFalse(publicador.getAtivo());
        assertEquals(SituacaoPessoa.INATIVO, pessoa.getSituacao());
    }
    
    @Test
    void deveManterPublicadorAtivoAoReativarNovamente() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("João da Silva");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.reativacao@teste.com");
        request.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado = publicadorService.criar(request);

        publicadorService.desativar(criado.getId());
        publicadorService.reativar(criado.getId());
        publicadorService.reativar(criado.getId());

        Publicador publicador =
                publicadorRepository.findById(criado.getId()).orElseThrow();

        Pessoa pessoa =
                pessoaRepository.findById(publicador.getPessoa().getId()).orElseThrow();

        assertTrue(publicador.getAtivo());
        assertEquals(SituacaoPessoa.ATIVO, pessoa.getSituacao());
    }
    
    
    @Test
    void deveManterPublicadorInativoAoAtualizarDados() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO criarRequest = new PublicadorRequestDTO();
        criarRequest.setNome("João da Silva");
        criarRequest.setDataNascimento(LocalDate.of(1990, 5, 10));
        criarRequest.setTelefone("55999999999");
        criarRequest.setEmail("joao.inativo@teste.com");
        criarRequest.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado =
                publicadorService.criar(criarRequest);

        publicadorService.desativar(criado.getId());

        PublicadorRequestDTO atualizarRequest = new PublicadorRequestDTO();
        atualizarRequest.setNome("João Atualizado");
        atualizarRequest.setDataNascimento(LocalDate.of(1991, 6, 15));
        atualizarRequest.setTelefone("55888888888");
        atualizarRequest.setEmail("joao.atualizado@teste.com");
        atualizarRequest.setCongregacaoId(congregacao.getId());

        publicadorService.atualizar(
                criado.getId(),
                atualizarRequest
        );

        Publicador publicador =
                publicadorRepository.findById(criado.getId()).orElseThrow();

        Pessoa pessoa =
                pessoaRepository.findById(publicador.getPessoa().getId()).orElseThrow();

        assertFalse(publicador.getAtivo());

        assertEquals(
                SituacaoPessoa.INATIVO,
                pessoa.getSituacao()
        );

        assertEquals("João Atualizado", pessoa.getNome());
        assertEquals(
                LocalDate.of(1991, 6, 15),
                pessoa.getDataNascimento()
        );
        assertEquals("55888888888", pessoa.getTelefone());
        assertEquals(
                "joao.atualizado@teste.com",
                pessoa.getEmail()
        );
    }
    
    @Test
    void deveRemoverPublicadorDaListagemAposDesativacao() {

        Congregacao congregacao = congregacaoRepository.save(
                Congregacao.builder()
                        .nome("Congregação Teste")
                        .numero("001")
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );

        PublicadorRequestDTO request = new PublicadorRequestDTO();
        request.setNome("João da Silva");
        request.setDataNascimento(LocalDate.of(1990, 5, 10));
        request.setTelefone("55999999999");
        request.setEmail("joao.listagem@teste.com");
        request.setCongregacaoId(congregacao.getId());

        PublicadorResponseDTO criado =
                publicadorService.criar(request);

        PageResponse<PublicadorResponseDTO> antes =
                publicadorService.listarPorCongregacao(
                        congregacao.getId(),
                        PageRequest.of(0, 10)
                );

        assertEquals(1, antes.getTotalElements());
        assertEquals(1, antes.getContent().size());
        assertEquals(criado.getId(), antes.getContent().get(0).getId());

        publicadorService.desativar(criado.getId());

        PageResponse<PublicadorResponseDTO> depois =
                publicadorService.listarPorCongregacao(
                        congregacao.getId(),
                        PageRequest.of(0, 10)
                );

        assertNotNull(depois);
        assertTrue(depois.getContent().isEmpty());
        assertEquals(0, depois.getTotalElements());
        assertEquals(0, depois.getTotalPages());
    }
}