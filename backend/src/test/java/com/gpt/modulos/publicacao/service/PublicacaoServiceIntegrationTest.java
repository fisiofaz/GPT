package com.gpt.modulos.publicacao.service;

import com.gpt.BackendApplication;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.publicacao.dto.PublicacaoRequestDTO;
import com.gpt.modulos.publicacao.dto.PublicacaoResponseDTO;
import com.gpt.modulos.publicacao.enums.CategoriaPublicacao;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.model.PublicacaoEstoque;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
@Transactional
class PublicacaoServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private PublicacaoService publicacaoService;

    @Autowired
    private PublicacaoRepository publicacaoRepository;

    @Autowired
    private PublicacaoEstoqueRepository publicacaoEstoqueRepository;

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @Test
    void deveCadastrarPublicacaoComEstoqueDaCongregacao() {

        Congregacao congregacao = criarCongregacao(
                "Congregação Publicação",
                "001"
        );

        PublicacaoRequestDTO request = new PublicacaoRequestDTO(
                "bi12",
                "Bíblia Sagrada",
                CategoriaPublicacao.BIBLIA,
                FormatoPublicacao.NORMAL,
                IdiomaPublicacao.PORTUGUES,
                20,
                5,
                congregacao.getId()
        );

        PublicacaoResponseDTO response =
                publicacaoService.cadastrar(request, null);

        assertNotNull(response.id());
        assertEquals("BI12", response.codigo());
        assertEquals("Bíblia Sagrada", response.titulo());
        assertEquals(20, response.quantidadeEstoque());
        assertEquals(5, response.estoqueMinimo());
        assertFalse(response.alertaEstoqueBaixo());
        assertEquals(congregacao.getId(), response.congregacaoId());
        assertEquals(congregacao.getNome(), response.congregacaoNome());
        assertTrue(response.ativo());

        Publicacao publicacao =
                publicacaoRepository.findById(response.id())
                        .orElseThrow();

        assertEquals("BI12", publicacao.getCodigo());
        assertEquals("Bíblia Sagrada", publicacao.getTitulo());
        assertTrue(publicacao.getAtivo());

        PublicacaoEstoque estoque =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                response.id(),
                                congregacao.getId()
                        )
                        .orElseThrow();

        assertEquals(20, estoque.getQuantidade());
        assertEquals(5, estoque.getEstoqueMinimo());
        assertTrue(estoque.getAtivo());
    }

    @Test
    void naoDeveCadastrarPublicacaoComCodigoDuplicado() {

        Congregacao congregacao = criarCongregacao(
                "Congregação Código",
                "002"
        );

        PublicacaoRequestDTO primeira = new PublicacaoRequestDTO(
                "teste-duplicado",
                "Publicação Teste",
                CategoriaPublicacao.BIBLIA,
                null,
                null,
                10,
                5,
                congregacao.getId()
        );

        PublicacaoResponseDTO criada =
                publicacaoService.cadastrar(primeira, null);

        assertNotNull(criada.id());

        Publicacao persistida = publicacaoRepository
                .findById(criada.id())
                .orElseThrow(() -> new AssertionError(
                        "A publicação não foi encontrada pelo ID após o cadastro."
                ));

        assertEquals("TESTE-DUPLICADO", persistida.getCodigo());

        assertTrue(
                publicacaoRepository
                        .findByCodigoIgnoreCase("TESTE-DUPLICADO")
                        .isPresent(),
                "A publicação existe pelo ID, mas não foi encontrada pelo código."
        );

        PublicacaoRequestDTO duplicada = new PublicacaoRequestDTO(
                "TESTE-DUPLICADO",
                "Publicação Duplicada",
                CategoriaPublicacao.BIBLIA,
                null,
                null,
                15,
                5,
                congregacao.getId()
        );

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> publicacaoService.cadastrar(duplicada, null)
        );

        assertEquals(
                "Já existe uma publicação com o código 'TESTE-DUPLICADO'.",
                exception.getMessage()
        );

        assertTrue(
                publicacaoRepository
                        .findByCodigoIgnoreCase("teste-duplicado")
                        .isPresent()
        );
    }

    @Test
    void deveAtualizarPublicacaoEEstoqueMinimo() {

        Congregacao congregacao = criarCongregacao(
                "Congregação Atualização",
                "003"
        );

        PublicacaoRequestDTO criacao = new PublicacaoRequestDTO(
                "teste-atualizacao",
                "Título Original",
                CategoriaPublicacao.LIVRO,
                FormatoPublicacao.NORMAL,
                IdiomaPublicacao.PORTUGUES,
                20,
                5,
                congregacao.getId()
        );

        PublicacaoResponseDTO criada =
                publicacaoService.cadastrar(criacao, null);

        PublicacaoRequestDTO atualizacao = new PublicacaoRequestDTO(
                "teste-atualizacao",
                "Título Atualizado",
                CategoriaPublicacao.LIVRO,
                FormatoPublicacao.NORMAL,
                IdiomaPublicacao.PORTUGUES,
                null,
                10,
                congregacao.getId()
        );

        PublicacaoResponseDTO atualizada =
                publicacaoService.atualizar(
                        criada.id(),
                        atualizacao
                );

        assertEquals(criada.id(), atualizada.id());
        assertEquals("TESTE-ATUALIZACAO", atualizada.codigo());
        assertEquals("Título Atualizado", atualizada.titulo());
        assertEquals(20, atualizada.quantidadeEstoque());
        assertEquals(10, atualizada.estoqueMinimo());
        assertFalse(atualizada.alertaEstoqueBaixo());

        PublicacaoEstoque estoque =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                criada.id(),
                                congregacao.getId()
                        )
                        .orElseThrow();

        assertEquals(20, estoque.getQuantidade());
        assertEquals(10, estoque.getEstoqueMinimo());
    }

    @Test
    void deveListarSomentePublicacoesComEstoqueAtivoDaCongregacao() {

        Congregacao congregacao = criarCongregacao(
                "Congregação Listagem",
                "004"
        );

        PublicacaoRequestDTO primeira = new PublicacaoRequestDTO(
                "zz",
                "Publicação Z",
                CategoriaPublicacao.LIVRO,
                null,
                null,
                10,
                5,
                congregacao.getId()
        );

        PublicacaoRequestDTO segunda = new PublicacaoRequestDTO(
                "aa",
                "Publicação A",
                CategoriaPublicacao.LIVRO,
                null,
                null,
                8,
                5,
                congregacao.getId()
        );

        PublicacaoResponseDTO publicacaoZ =
                publicacaoService.cadastrar(primeira, null);

        publicacaoService.cadastrar(segunda, null);

        PublicacaoEstoque estoqueZ =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                publicacaoZ.id(),
                                congregacao.getId()
                        )
                        .orElseThrow();

        estoqueZ.setAtivo(false);
        publicacaoEstoqueRepository.save(estoqueZ);

        List<PublicacaoResponseDTO> resultado =
                publicacaoService.listarPorCongregacao(
                        congregacao.getId()
                );

        assertEquals(1, resultado.size());
        assertEquals("AA", resultado.get(0).codigo());
        assertEquals("Publicação A", resultado.get(0).titulo());
        assertTrue(resultado.get(0).ativo());
    }

    @Test
    void deveInativarPublicacaoESeusEstoques() {

        Congregacao congregacao = criarCongregacao(
                "Congregação Exclusão",
                "005"
        );

        PublicacaoRequestDTO request = new PublicacaoRequestDTO(
        		"teste-inativacao",
                "Lições da Bíblia",
                CategoriaPublicacao.LIVRO,
                null,
                null,
                15,
                5,
                congregacao.getId()
        );

        PublicacaoResponseDTO criada =
                publicacaoService.cadastrar(request, null);

        publicacaoService.deletar(criada.id());

        Publicacao publicacao =
                publicacaoRepository.findById(criada.id())
                        .orElseThrow();

        PublicacaoEstoque estoque =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                criada.id(),
                                congregacao.getId()
                        )
                        .orElseThrow();

        assertFalse(publicacao.getAtivo());
        assertFalse(estoque.getAtivo());

        List<PublicacaoResponseDTO> resultado =
                publicacaoService.listarPorCongregacao(
                        congregacao.getId()
                );

        assertTrue(resultado.isEmpty());
    }

    private Congregacao criarCongregacao(
            String nome,
            String numero
    ) {
        return congregacaoRepository.save(
                Congregacao.builder()
                        .nome(nome)
                        .numero(numero)
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );
    }
}