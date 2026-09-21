package com.gpt.modulos.movimentacao.service;

import com.gpt.BackendApplication;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.dto.AjusteEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoResponseDTO;
import com.gpt.modulos.movimentacao.enums.TipoMovimentacao;
import com.gpt.modulos.movimentacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicacao.enums.CategoriaPublicacao;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.model.PublicacaoEstoque;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
@Transactional
class MovimentacaoServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MovimentacaoService movimentacaoService;

    @Autowired
    private MovimentacaoEstoqueRepository movimentacaoRepository;

    @Autowired
    private PublicacaoRepository publicacaoRepository;

    @Autowired
    private PublicacaoEstoqueRepository publicacaoEstoqueRepository;

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Test
    void deveRegistrarEntradaEAumentarEstoque() {

        Congregacao congregacao =
                criarCongregacao("Congregação Entrada", "101");

        PublicacaoEstoque estoque =
                criarPublicacaoComEstoque(
                        congregacao,
                        "teste-entrada",
                        10
                );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Entrada",
                        "entrada@gpt.test"
                );

        MovimentacaoEstoqueDTO dto =
                new MovimentacaoEstoqueDTO(
                        TipoMovimentacao.ENTRADA,
                        5,
                        null,
                        "Entrada de teste"
                );

        MovimentacaoResponseDTO resposta =
                movimentacaoService.movimentar(
                        estoque.getPublicacao().getId(),
                        congregacao.getId(),
                        dto,
                        responsavel
                );

        assertNotNull(resposta.id());
        assertEquals(TipoMovimentacao.ENTRADA, resposta.tipo());
        assertEquals(5, resposta.quantidade());
        assertEquals(10, resposta.quantidadeAnterior());
        assertEquals(15, resposta.quantidadePosterior());
        assertEquals("Entrada de teste", resposta.observacoes());

        PublicacaoEstoque estoqueAtualizado =
                publicacaoEstoqueRepository
                        .findById(estoque.getId())
                        .orElseThrow();

        assertEquals(15, estoqueAtualizado.getQuantidade());

        assertEquals(1, movimentacaoRepository.count());
    }

    @Test
    void deveRegistrarSaidaEDiminuirEstoque() {

        Congregacao congregacao =
                criarCongregacao("Congregação Saída", "102");

        PublicacaoEstoque estoque =
                criarPublicacaoComEstoque(
                        congregacao,
                        "teste-saida",
                        20
                );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Saída",
                        "saida@gpt.test"
                );
        
        MovimentacaoEstoqueDTO dto =
                new MovimentacaoEstoqueDTO(
                        TipoMovimentacao.SAIDA,
                        7,
                        null,
                        "Saída de teste"
                );

        MovimentacaoResponseDTO resposta =
                movimentacaoService.movimentar(
                        estoque.getPublicacao().getId(),
                        congregacao.getId(),
                        dto,
                        responsavel
                );

        assertNotNull(resposta.id());
        assertEquals(TipoMovimentacao.SAIDA, resposta.tipo());
        assertEquals(7, resposta.quantidade());
        assertEquals(20, resposta.quantidadeAnterior());
        assertEquals(13, resposta.quantidadePosterior());

        PublicacaoEstoque estoqueAtualizado =
                publicacaoEstoqueRepository
                        .findById(estoque.getId())
                        .orElseThrow();

        assertEquals(13, estoqueAtualizado.getQuantidade());

        assertEquals(1, movimentacaoRepository.count());
    }

    @Test
    void naoDevePermitirSaidaMaiorQueEstoqueDisponivel() {

        Congregacao congregacao =
                criarCongregacao("Congregação Insuficiente", "103");

        PublicacaoEstoque estoque =
                criarPublicacaoComEstoque(
                        congregacao,
                        "teste-insuficiente",
                        5
                );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Insuficiente",
                        "insuficiente@gpt.test"
                );

        MovimentacaoEstoqueDTO dto =
                new MovimentacaoEstoqueDTO(
                        TipoMovimentacao.SAIDA,
                        6,
                        null,
                        "Tentativa de saída maior que estoque"
                );

        IllegalArgumentException exception =
                assertThrows(
                        IllegalArgumentException.class,
                        () -> movimentacaoService.movimentar(
                                estoque.getPublicacao().getId(),
                                congregacao.getId(),
                                dto,
                                responsavel
                        )
                );

        assertEquals(
                "Estoque insuficiente. Disponível: 5",
                exception.getMessage()
        );

        PublicacaoEstoque estoqueAtualizado =
                publicacaoEstoqueRepository
                        .findById(estoque.getId())
                        .orElseThrow();

        assertEquals(5, estoqueAtualizado.getQuantidade());

        assertEquals(0, movimentacaoRepository.count());
    }

    @Test
    void deveAjustarEstoqueParaQuantidadeInformada() {

        Congregacao congregacao =
                criarCongregacao("Congregação Ajuste", "104");

        PublicacaoEstoque estoque =
                criarPublicacaoComEstoque(
                        congregacao,
                        "teste-ajuste",
                        12
                );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Ajuste",
                        "ajuste@gpt.test"
                );

        AjusteEstoqueDTO dto = new AjusteEstoqueDTO();
        dto.setCongregacaoId(congregacao.getId());
        dto.setPublicacaoId(estoque.getPublicacao().getId());
        dto.setQuantidade(30);

        MovimentacaoResponseDTO resposta =
                movimentacaoService.ajustarEstoque(
                        dto,
                        responsavel
                );

        assertNotNull(resposta.id());
        assertEquals(TipoMovimentacao.AJUSTE, resposta.tipo());
        assertEquals(30, resposta.quantidade());
        assertEquals(12, resposta.quantidadeAnterior());
        assertEquals(30, resposta.quantidadePosterior());

        PublicacaoEstoque estoqueAtualizado =
                publicacaoEstoqueRepository
                        .findById(estoque.getId())
                        .orElseThrow();

        assertEquals(30, estoqueAtualizado.getQuantidade());

        assertEquals(1, movimentacaoRepository.count());
    }

    @Test
    void deveListarHistoricoDaCongregacaoEdaPublicacao() {

        Congregacao congregacao =
                criarCongregacao("Congregação Histórico", "105");

        PublicacaoEstoque estoque =
                criarPublicacaoComEstoque(
                        congregacao,
                        "teste-historico",
                        10
                );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Histórico",
                        "historico@gpt.test"
                );

        MovimentacaoEstoqueDTO entrada =
                new MovimentacaoEstoqueDTO(
                        TipoMovimentacao.ENTRADA,
                        5,
                        null,
                        "Entrada histórico"
                );

        movimentacaoService.movimentar(
                estoque.getPublicacao().getId(),
                congregacao.getId(),
                entrada,
                responsavel
        );

        MovimentacaoEstoqueDTO saida =
                new MovimentacaoEstoqueDTO(
                        TipoMovimentacao.SAIDA,
                        3,
                        null,
                        "Saída histórico"
                );

        movimentacaoService.movimentar(
                estoque.getPublicacao().getId(),
                congregacao.getId(),
                saida,
                responsavel
        );

        List<MovimentacaoResponseDTO> historicoCongregacao =
                movimentacaoService.listarHistoricoGeral(
                        congregacao.getId()
                );

        List<MovimentacaoResponseDTO> historicoPublicacao =
                movimentacaoService.listarPorPublicacao(
                        estoque.getPublicacao().getId()
                );

        assertEquals(2, historicoCongregacao.size());
        assertEquals(2, historicoPublicacao.size());

        assertTrue(
                historicoCongregacao.stream()
                        .anyMatch(m ->
                                m.tipo() == TipoMovimentacao.ENTRADA
                                        && m.quantidade() == 5
                        )
        );

        assertTrue(
                historicoCongregacao.stream()
                        .anyMatch(m ->
                                m.tipo() == TipoMovimentacao.SAIDA
                                        && m.quantidade() == 3
                        )
        );
    }

    private Congregacao criarCongregacao(
            String nome,
            String numero
    ) {

        return congregacaoRepository.saveAndFlush(
                Congregacao.builder()
                        .nome(nome)
                        .numero(numero)
                        .cidade("Santa Maria")
                        .estado("RS")
                        .numeroCircuito("RS-01")
                        .build()
        );
    }

    private PublicacaoEstoque criarPublicacaoComEstoque(
            Congregacao congregacao,
            String codigo,
            int quantidade
    ) {

        Publicacao publicacao =
                publicacaoRepository.saveAndFlush(
                        Publicacao.builder()
                                .codigo(codigo.toUpperCase())
                                .titulo("Publicação " + codigo)
                                .categoria(CategoriaPublicacao.BIBLIA)
                                .formato(FormatoPublicacao.NORMAL)
                                .idioma(IdiomaPublicacao.PORTUGUES)
                                .ativo(true)
                                .build()
                );

        return publicacaoEstoqueRepository.saveAndFlush(
                PublicacaoEstoque.builder()
                        .publicacao(publicacao)
                        .congregacao(congregacao)
                        .quantidade(quantidade)
                        .estoqueMinimo(5)
                        .ativo(true)
                        .build()
        );
    }

    private Usuario criarUsuario(
            Congregacao congregacao,
            String nome,
            String email
    ) {

        Pessoa pessoa =
                pessoaRepository.saveAndFlush(
                        Pessoa.builder()
                                .nome(nome)
                                .email(email)
                                .build()
                );

        return usuarioRepository.saveAndFlush(
                Usuario.builder()
                        .pessoa(pessoa)
                        .nome(nome)
                        .email(email)
                        .senha("senha-teste")
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );
    }
}