package com.gpt.modulos.pedido.service;

import com.gpt.BackendApplication;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.pedido.dto.PedidoBetelDTO;
import com.gpt.modulos.pedido.dto.PedidoPublicadorDTO;
import com.gpt.modulos.pedido.enums.OrigemItemPedido;
import com.gpt.modulos.pedido.enums.StatusPedidoBetel;
import com.gpt.modulos.pedido.enums.StatusPedidoPublicador;
import com.gpt.modulos.pedido.model.PedidoPublicador;
import com.gpt.modulos.pedido.repository.PedidoPublicadorRepository;
import com.gpt.modulos.pessoa.model.Pessoa;
import com.gpt.modulos.pessoa.repository.PessoaRepository;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.model.PublicacaoEstoque;
import com.gpt.modulos.publicacao.enums.CategoriaPublicacao;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;

import org.junit.jupiter.api.Test;
import org.springframework.security.core.Authentication;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest(classes = BackendApplication.class)
@ActiveProfiles("test")
@Transactional
class PedidoServiceIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres =
            new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private PedidoPublicadorRepository pedidoPublicadorRepository;

    @Autowired
    private CongregacaoRepository congregacaoRepository;

    @Autowired
    private PublicacaoRepository publicacaoRepository;

    @Autowired
    private PublicacaoEstoqueRepository publicacaoEstoqueRepository;

    @Autowired
    private MovimentacaoEstoqueRepository movimentacaoEstoqueRepository;

    @Autowired
    private PublicadorRepository publicadorRepository;

    @Autowired
    private PessoaRepository pessoaRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void limparContextoDeSeguranca() {
        org.springframework.security.core.context.SecurityContextHolder
                .clearContext();
    }

    @Test
    void deveCriarPedidoPublicador() {

        Congregacao congregacao = criarCongregacao("Congregação Pedido 1");

        Publicacao publicacao = criarPublicacao(
                "PED-001",
                "Publicação Pedido 1"
        );

        Publicador publicador = criarPublicador(
                congregacao,
                "Publicador Pedido 1"
        );
        
        PedidoPublicadorDTO.Request dto =
                new PedidoPublicadorDTO.Request();

        dto.setPublicadorId(publicador.getId());
        dto.setPublicacaoId(publicacao.getId());
        dto.setCongregacaoId(congregacao.getId());
        dto.setQuantidade(3);
        dto.setObservacoes("Pedido de teste");
        
        Usuario usuario = criarUsuario(
                congregacao,
                "Administrador Pedido 1",
                "admin.pedido1@gpt.test"
        );

        configurarUsuarioAutenticado(usuario);


        PedidoPublicadorDTO.Response response =
                pedidoService.criarPedidoPublicador(dto);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(publicador.getId(), response.getPublicadorId());
        assertEquals(publicacao.getId(), response.getPublicacaoId());
        assertEquals(congregacao.getId(), response.getCongregacaoId());
        assertEquals(3, response.getQuantidade());
        assertEquals(
                StatusPedidoPublicador.PENDENTE,
                response.getStatus()
        );
    }

    @Test
    void naoDeveCriarPedidoPublicadorComQuantidadeInvalida() {

        Congregacao congregacao = criarCongregacao("Congregação Pedido 2");

        Publicacao publicacao = criarPublicacao(
                "PED-002",
                "Publicação Pedido 2"
        );

        Publicador publicador = criarPublicador(
                congregacao,
                "Publicador Pedido 2"
        );
        
        PedidoPublicadorDTO.Request dto =
                new PedidoPublicadorDTO.Request();

        dto.setPublicadorId(publicador.getId());
        dto.setPublicacaoId(publicacao.getId());
        dto.setCongregacaoId(congregacao.getId());
        dto.setQuantidade(0);
        
        Usuario usuario = criarUsuario(
                congregacao,
                "Administrador Pedido 2",
                "admin.pedido2@gpt.test"
        );

        configurarUsuarioAutenticado(usuario);

        assertThrows(
                IllegalArgumentException.class,
                () -> pedidoService.criarPedidoPublicador(dto)
        );
    }

    @Test
    void naoDeveCriarPedidoPublicadorParaPublicacaoInativa() {

        Congregacao congregacao = criarCongregacao("Congregação Pedido 3");

        Publicacao publicacao = criarPublicacao(
                "PED-003",
                "Publicação Inativa"
        );

        publicacao.setAtivo(false);
        publicacaoRepository.saveAndFlush(publicacao);

        Publicador publicador = criarPublicador(
                congregacao,
                "Publicador Pedido 3"
        );

        PedidoPublicadorDTO.Request dto =
                new PedidoPublicadorDTO.Request();

        dto.setPublicadorId(publicador.getId());
        dto.setPublicacaoId(publicacao.getId());
        dto.setCongregacaoId(congregacao.getId());
        dto.setQuantidade(2);
        
        Usuario usuario = criarUsuario(
                congregacao,
                "Administrador Pedido 3",
                "admin.pedido3@gpt.test"
        );

        configurarUsuarioAutenticado(usuario);

        assertThrows(
                IllegalStateException.class,
                () -> pedidoService.criarPedidoPublicador(dto)
        );
    }

    // ============================================================
    // 2. PEDIDO BETEL
    // ============================================================

    @Test
    void deveCriarPedidoBetelComoRascunho() {

        Congregacao congregacao = criarCongregacao(
                "Congregação Betel 1"
        );

        Publicacao publicacao = criarPublicacao(
                "BET-001",
                "Publicação Betel 1"
        );

        PedidoBetelDTO.CriarRequest dto =
                new PedidoBetelDTO.CriarRequest();

        dto.setCongregacaoId(congregacao.getId());
        dto.setNumeroPedido("BET-001");
        dto.setMesAnoReferencia("09/2026");
        dto.setObservacoes("Pedido Betel teste");

        PedidoBetelDTO.ItemRequest item =
                new PedidoBetelDTO.ItemRequest();

        item.setPublicacaoId(publicacao.getId());
        item.setQuantidadeSolicitada(10);
        item.setOrigem(OrigemItemPedido.ESTOQUE);

        dto.setItens(List.of(item));
        dto.setPedidosPublicadoresIds(List.of());

        PedidoBetelDTO.Response response =
                pedidoService.criarPedidoBetel(dto);

        assertNotNull(response);
        assertNotNull(response.getId());
        assertEquals(
                StatusPedidoBetel.RASCUNHO,
                response.getStatus()
        );
        assertEquals(1, response.getTotalItens());
        assertEquals(
                10,
                response.getItens().get(0).getQuantidadeSolicitada()
        );
    }

    @Test
    void naoDeveVincularPedidoPublicadorDeOutraCongregacao() {

        Congregacao congregacao1 =
                criarCongregacao("Congregação Betel 2A");

        Congregacao congregacao2 =
                criarCongregacao("Congregação Betel 2B");

        Publicacao publicacao = criarPublicacao(
                "BET-002",
                "Publicação Betel 2"
        );

        Publicador publicador = criarPublicador(
                congregacao2,
                "Publicador Betel 2"
        );
        
        PedidoPublicador pedidoPublicador =
                criarPedidoPublicador(
                        publicador,
                        publicacao,
                        congregacao2,
                        2
                );

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao1,
                        publicacao,
                        5
                );

        dto.setPedidosPublicadoresIds(
                List.of(pedidoPublicador.getId())
        );

        assertThrows(
                IllegalArgumentException.class,
                () -> pedidoService.criarPedidoBetel(dto)
        );
    }

    @Test
    void naoDeveVincularPedidoPublicadorQueNaoEstejaPendente() {

        Congregacao congregacao =
                criarCongregacao("Congregação Betel 3");

        Publicacao publicacao = criarPublicacao(
                "BET-003",
                "Publicação Betel 3"
        );

        Publicador publicador = criarPublicador(
                congregacao,
                "Publicador Betel 3"
        );

        PedidoPublicador pedidoPublicador =
                criarPedidoPublicador(
                        publicador,
                        publicacao,
                        congregacao,
                        2
                );

        pedidoPublicador.setStatus(
                StatusPedidoPublicador.CANCELADO
        );

        pedidoPublicadorRepository.saveAndFlush(
                pedidoPublicador
        );

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao,
                        publicacao,
                        5
                );

        dto.setPedidosPublicadoresIds(
                List.of(pedidoPublicador.getId())
        );

        assertThrows(
                IllegalStateException.class,
                () -> pedidoService.criarPedidoBetel(dto)
        );
    }

    // ============================================================
    // 3. ENVIO DO PEDIDO BETEL
    // ============================================================

    @Test
    void deveMarcarPedidoBetelComoEnviado() {

        Congregacao congregacao =
                criarCongregacao("Congregação Envio 1");

        Publicacao publicacao = criarPublicacao(
                "ENV-001",
                "Publicação Envio 1"
        );

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao,
                        publicacao,
                        5
                );

        PedidoBetelDTO.Response criado =
                pedidoService.criarPedidoBetel(dto);

        PedidoBetelDTO.Response enviado =
                pedidoService.marcarComoEnviado(criado.getId());

        assertEquals(
                StatusPedidoBetel.ENVIADO,
                enviado.getStatus()
        );

        assertNotNull(enviado.getDataEnvio());
    }

    @Test
    void naoDeveEnviarPedidoBetelMaisDeUmaVez() {

        Congregacao congregacao =
                criarCongregacao("Congregação Envio 2");

        Publicacao publicacao = criarPublicacao(
                "ENV-002",
                "Publicação Envio 2"
        );

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao,
                        publicacao,
                        5
                );

        PedidoBetelDTO.Response criado =
                pedidoService.criarPedidoBetel(dto);

        pedidoService.marcarComoEnviado(criado.getId());

        assertThrows(
                IllegalStateException.class,
                () -> pedidoService.marcarComoEnviado(
                        criado.getId()
                )
        );
    }

    // ============================================================
    // 4. ATENDIMENTO DO PEDIDO PUBLICADOR
    // ============================================================

    @Test
    void deveAtenderPedidoPublicadorERegistrarSaidaNoEstoque() {

        Congregacao congregacao =
                criarCongregacao("Congregação Saída");

        Publicacao publicacao =
                criarPublicacao("SAI-001", "Publicação Saída");

        criarEstoque(
                publicacao,
                congregacao,
                10
        );

        Publicador publicador = criarPublicador(
                congregacao,
                "Publicador Saída"
        );

        PedidoPublicador pedido =
                criarPedidoPublicador(
                        publicador,
                        publicacao,
                        congregacao,
                        3
                );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Saída",
                        "responsavel.saida@gpt.test"
                );

        configurarUsuarioAutenticado(responsavel);

        pedidoService.marcarPedidoPublicadorAtendido(
                pedido.getId()
        );

        PedidoPublicador atualizado =
                pedidoPublicadorRepository.findById(
                        pedido.getId()
                ).orElseThrow();

        PublicacaoEstoque estoque =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                publicacao.getId(),
                                congregacao.getId()
                        )
                        .orElseThrow();

        assertEquals(
                StatusPedidoPublicador.ATENDIDO,
                atualizado.getStatus()
        );

        assertNotNull(atualizado.getDataAtendimento());

        assertEquals(7, estoque.getQuantidade());

        assertEquals(
                1,
                movimentacaoEstoqueRepository.count()
        );
    }

    // ============================================================
    // 5. RECEBIMENTO BETEL
    // ============================================================

    @Test
    void deveReceberPedidoBetelERegistrarEntradaNoEstoque() {

        Congregacao congregacao =
                criarCongregacao("Congregação Recebimento");

        Publicacao publicacao =
                criarPublicacao(
                        "REC-001",
                        "Publicação Recebimento"
                );

        criarEstoque(
                publicacao,
                congregacao,
                5
        );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Recebimento",
                        "responsavel.recebimento@gpt.test"
                );

        configurarUsuarioAutenticado(responsavel);

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao,
                        publicacao,
                        10
                );

        PedidoBetelDTO.Response criado =
                pedidoService.criarPedidoBetel(dto);

        pedidoService.marcarComoEnviado(criado.getId());

        PedidoBetelDTO.ConferirItemRequest item =
                new PedidoBetelDTO.ConferirItemRequest();

        item.setItemId(
                criado.getItens().get(0).getId()
        );
        item.setQuantidadeRecebida(10);

        PedidoBetelDTO.ConferirPedidoRequest conferencia =
                new PedidoBetelDTO.ConferirPedidoRequest();

        conferencia.setItensRecebidos(List.of(item));

        PedidoBetelDTO.Response recebido =
                pedidoService.registrarRecebimento(
                        criado.getId(),
                        conferencia
                );

        PublicacaoEstoque estoque =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                publicacao.getId(),
                                congregacao.getId()
                        )
                        .orElseThrow();

        assertEquals(
                StatusPedidoBetel.RECEBIDO_TOTAL,
                recebido.getStatus()
        );

        assertEquals(
                15,
                estoque.getQuantidade()
        );

        assertEquals(
                1,
                movimentacaoEstoqueRepository.count()
        );
    }

    @Test
    void naoDeveReceberPedidoBetelDuasVezes() {

        Congregacao congregacao =
                criarCongregacao("Congregação Recebimento 2");

        Publicacao publicacao =
                criarPublicacao(
                        "REC-002",
                        "Publicação Recebimento 2"
                );

        criarEstoque(
                publicacao,
                congregacao,
                5
        );

        Usuario responsavel =
                criarUsuario(
                        congregacao,
                        "Responsável Recebimento 2",
                        "responsavel.recebimento2@gpt.test"
                );

        configurarUsuarioAutenticado(responsavel);

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao,
                        publicacao,
                        10
                );

        PedidoBetelDTO.Response criado =
                pedidoService.criarPedidoBetel(dto);

        pedidoService.marcarComoEnviado(criado.getId());

        PedidoBetelDTO.ConferirItemRequest item =
                new PedidoBetelDTO.ConferirItemRequest();

        item.setItemId(
                criado.getItens().get(0).getId()
        );
        item.setQuantidadeRecebida(10);

        PedidoBetelDTO.ConferirPedidoRequest conferencia =
                new PedidoBetelDTO.ConferirPedidoRequest();

        conferencia.setItensRecebidos(List.of(item));

        pedidoService.registrarRecebimento(
                criado.getId(),
                conferencia
        );

        assertThrows(
                IllegalStateException.class,
                () -> pedidoService.registrarRecebimento(
                        criado.getId(),
                        conferencia
                )
        );
    }

    // ============================================================
    // 6. EDIÇÃO / EXCLUSÃO
    // ============================================================

    @Test
    void naoDeveEditarPedidoBetelEnviado() {

        Congregacao congregacao =
                criarCongregacao("Congregação Edição");

        Publicacao publicacao =
                criarPublicacao(
                        "EDI-001",
                        "Publicação Edição"
                );

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao,
                        publicacao,
                        5
                );

        PedidoBetelDTO.Response criado =
                pedidoService.criarPedidoBetel(dto);

        pedidoService.marcarComoEnviado(criado.getId());

        assertThrows(
                IllegalStateException.class,
                () -> pedidoService.atualizarPedidoBetel(
                        criado.getId(),
                        dto
                )
        );
    }

    @Test
    void naoDeveExcluirPedidoBetelEnviado() {

        Congregacao congregacao =
                criarCongregacao("Congregação Exclusão");

        Publicacao publicacao =
                criarPublicacao(
                        "EXC-001",
                        "Publicação Exclusão"
                );

        PedidoBetelDTO.CriarRequest dto =
                criarRequestBetel(
                        congregacao,
                        publicacao,
                        5
                );

        PedidoBetelDTO.Response criado =
                pedidoService.criarPedidoBetel(dto);

        pedidoService.marcarComoEnviado(criado.getId());

        assertThrows(
                IllegalStateException.class,
                () -> pedidoService.excluirPedidoBetel(
                        criado.getId()
                )
        );
    }

    // ============================================================
    // HELPERS
    // ============================================================

    private Congregacao criarCongregacao(String nome) {

        return congregacaoRepository.saveAndFlush(
                Congregacao.builder()
                        .nome(nome)
                        .numero("001")
                        .cidade("Teste")
                        .estado("SC")
                        .numeroCircuito("01")
                        .build()
        );
    }

    private Publicacao criarPublicacao(
            String codigo,
            String titulo
    ) {

        return publicacaoRepository.saveAndFlush(
                Publicacao.builder()
                        .codigo(codigo)
                        .titulo(titulo)
                        .categoria(CategoriaPublicacao.LIVRO)
                        .formato(FormatoPublicacao.NORMAL)
                        .idioma(IdiomaPublicacao.PORTUGUES)
                        .ativo(true)
                        .build()
        );
    }

    private PublicacaoEstoque criarEstoque(
            Publicacao publicacao,
            Congregacao congregacao,
            int quantidade
    ) {

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

    private Publicador criarPublicador(
            Congregacao congregacao,
            String nome
    ) {
        Pessoa pessoa = pessoaRepository.saveAndFlush(
                Pessoa.builder()
                        .nome(nome)
                        .email(nome.toLowerCase().replace(" ", ".") + "@gpt.test")
                        .build()
        );

        return publicadorRepository.saveAndFlush(
                Publicador.builder()
                        .pessoa(pessoa)
                        .congregacao(congregacao)
                        .ativo(true)
                        .build()
        );
    }

    private PedidoPublicador criarPedidoPublicador(
            Publicador publicador,
            Publicacao publicacao,
            Congregacao congregacao,
            int quantidade
    ) {

        return pedidoPublicadorRepository.saveAndFlush(
                PedidoPublicador.builder()
                        .publicador(publicador)
                        .publicacao(publicacao)
                        .congregacao(congregacao)
                        .quantidade(quantidade)
                        .dataSolicitacao(
                                java.time.LocalDateTime.now()
                        )
                        .status(StatusPedidoPublicador.PENDENTE)
                        .build()
        );
    }

    private Usuario criarUsuario(
            Congregacao congregacao,
            String nome,
            String email
    ) {

        Pessoa pessoa = pessoaRepository.saveAndFlush(
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

    private PedidoBetelDTO.CriarRequest criarRequestBetel(
            Congregacao congregacao,
            Publicacao publicacao,
            int quantidade
    ) {

        PedidoBetelDTO.CriarRequest dto =
                new PedidoBetelDTO.CriarRequest();

        dto.setCongregacaoId(congregacao.getId());
        dto.setNumeroPedido("PED-BETEL");
        dto.setMesAnoReferencia("09/2026");
        dto.setItens(
                List.of(
                        criarItem(
                                publicacao,
                                quantidade
                        )
                )
        );
        dto.setPedidosPublicadoresIds(List.of());

        return dto;
    }

    private PedidoBetelDTO.ItemRequest criarItem(
            Publicacao publicacao,
            int quantidade
    ) {

        PedidoBetelDTO.ItemRequest item =
                new PedidoBetelDTO.ItemRequest();

        item.setPublicacaoId(publicacao.getId());
        item.setQuantidadeSolicitada(quantidade);
        item.setOrigem(OrigemItemPedido.ESTOQUE);

        return item;
    }

    private void configurarUsuarioAutenticado(Usuario usuario) {

        Authentication authentication =
                org.mockito.Mockito.mock(Authentication.class);

        org.mockito.Mockito.when(authentication.getName())
                .thenReturn(usuario.getEmail());

        org.mockito.Mockito.when(authentication.getAuthorities())
                .thenAnswer(invocation ->
                        java.util.List.of(
                                new SimpleGrantedAuthority("ROLE_ADMIN_GERAL")
                        )
                );

        SecurityContextHolder.getContext()
                .setAuthentication(authentication);
    }
}