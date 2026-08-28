package com.gpt.servico;

import com.gpt.dominio.dto.pedido.PedidoBetelDTO;
import com.gpt.dominio.dto.pedido.PedidoPublicadorDTO;
import com.gpt.dominio.enums.*;
import com.gpt.dominio.model.*;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.publicacao.model.MovimentacaoEstoque;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import com.gpt.repositorio.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoPublicadorRepository pedidoPublicadorRepo;
    private final PedidoBetelRepository pedidoBetelRepo;
    private final PublicadorRepository publicadorRepo;
    private final PublicacaoRepository publicacaoRepo;
    private final CongregacaoRepository congregacaoRepo;
    private final MovimentacaoEstoqueRepository movimentacaoEstoqueRepo;
    private final UsuarioRepository usuarioRepo;

    // ==========================================
    // FLUXO 1: PEDIDOS DE PUBLICADORES
    // ==========================================

    @Transactional
    public PedidoPublicadorDTO.Response criarPedidoPublicador(PedidoPublicadorDTO.Request dto) {
        Publicador publicador = publicadorRepo.findById(dto.getPublicadorId())
                .orElseThrow(() -> new EntityNotFoundException("Publicador não encontrado."));
        Publicacao publicacao = publicacaoRepo.findById(dto.getPublicacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Publicação não encontrada."));
        Congregacao congregacao = congregacaoRepo.findById(dto.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));

        PedidoPublicador pedido = PedidoPublicador.builder()
                .publicador(publicador)
                .publicacao(publicacao)
                .congregacao(congregacao)
                .quantidade(dto.getQuantidade())
                .dataSolicitacao(LocalDateTime.now())
                .status(StatusPedidoPublicador.PENDENTE)
                .observacoes(dto.getObservacoes())
                .build();

        return toPedidoPublicadorResponse(pedidoPublicadorRepo.save(pedido));
    }

    @Transactional(readOnly = true)
    public List<PedidoPublicadorDTO.Response> listarPedidosPublicadores(Long congregacaoId, StatusPedidoPublicador status) {
        List<PedidoPublicador> lista = (status == null)
                ? pedidoPublicadorRepo.findByCongregacaoIdOrderByDataSolicitacaoDesc(congregacaoId)
                : pedidoPublicadorRepo.findByCongregacaoIdAndStatusOrderByDataSolicitacaoAsc(congregacaoId, status);

        return lista.stream().map(this::toPedidoPublicadorResponse).collect(Collectors.toList());
    }

    @Transactional
    public void cancelarPedidoPublicador(Long id) {
        PedidoPublicador pedido = pedidoPublicadorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido de publicador não encontrado."));
        pedido.setStatus(StatusPedidoPublicador.CANCELADO);
        pedidoPublicadorRepo.save(pedido);
    }

    @Transactional
    public void marcarPedidoPublicadorAtendido(Long id) {
        PedidoPublicador pedido = pedidoPublicadorRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido de publicador não encontrado."));
        pedido.setStatus(StatusPedidoPublicador.ATENDIDO);
        pedido.setDataAtendimento(LocalDateTime.now());
        pedidoPublicadorRepo.save(pedido);
    }

    // ==========================================
    // FLUXO 2: PEDIDO CONSOLIDADO PARA BETEL
    // ==========================================

    @Transactional
    public PedidoBetelDTO.Response criarPedidoBetel(PedidoBetelDTO.CriarRequest dto) {
        Congregacao congregacao = congregacaoRepo.findById(dto.getCongregacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Congregação não encontrada."));

        PedidoBetel pedidoBetel = PedidoBetel.builder()
                .congregacao(congregacao)
                .numeroPedido(dto.getNumeroPedido())
                .mesAnoReferencia(dto.getMesAnoReferencia())
                .dataCriacao(LocalDateTime.now())
                .status(StatusPedidoBetel.RASCUNHO)
                .observacoes(dto.getObservacoes())
                .itens(new ArrayList<>())
                .build();

        for (PedidoBetelDTO.ItemRequest itemDto : dto.getItens()) {
            Publicacao publicacao = publicacaoRepo.findById(itemDto.getPublicacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Publicação ID " + itemDto.getPublicacaoId() + " não encontrada."));

            ItemPedidoBetel item = ItemPedidoBetel.builder()
                    .pedidoBetel(pedidoBetel)
                    .publicacao(publicacao)
                    .quantidadeSolicitada(itemDto.getQuantidadeSolicitada())
                    .quantidadeRecebida(0)
                    .origem(itemDto.getOrigem() != null ? itemDto.getOrigem() : OrigemItemPedido.ESTOQUE)
                    .build();

            pedidoBetel.getItens().add(item);
        }

        PedidoBetel salvo = pedidoBetelRepo.save(pedidoBetel);

        // Vincula os pedidos de publicadores incluídos neste pedido
        if (dto.getPedidosPublicadoresIds() != null && !dto.getPedidosPublicadoresIds().isEmpty()) {
            List<PedidoPublicador> pedidosPub = pedidoPublicadorRepo.findAllById(dto.getPedidosPublicadoresIds());
            for (PedidoPublicador pp : pedidosPub) {
                pp.setPedidoBetel(salvo);
                pp.setStatus(StatusPedidoPublicador.INCLUIDO_NO_PEDIDO);
            }
            pedidoPublicadorRepo.saveAll(pedidosPub);
        }

        return toPedidoBetelResponse(salvo);
    }

    @Transactional(readOnly = true)
    public List<PedidoBetelDTO.Response> listarPedidosBetel(Long congregacaoId) {
        return pedidoBetelRepo.findByCongregacaoIdOrderByDataCriacaoDesc(congregacaoId)
                .stream()
                .map(this::toPedidoBetelResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PedidoBetelDTO.Response buscarPedidoBetelPorId(Long id) {
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));
        return toPedidoBetelResponse(pedido);
    }

    @Transactional
    public PedidoBetelDTO.Response marcarComoEnviado(Long id) {
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));
        pedido.setStatus(StatusPedidoBetel.ENVIADO);
        pedido.setDataEnvio(LocalDateTime.now());
        return toPedidoBetelResponse(pedidoBetelRepo.save(pedido));
    }

    // ==========================================
    // FLUXO 3: RECEBIMENTO & ENTRADA NO ESTOQUE
    // ==========================================

    @Transactional
    public PedidoBetelDTO.Response registrarRecebimento(Long pedidoBetelId, PedidoBetelDTO.ConferirPedidoRequest dto) {
        PedidoBetel pedido = pedidoBetelRepo.findById(pedidoBetelId)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));

        // Recupera o usuário logado para auditoria
        Usuario responsavel = obterUsuarioLogado();

        boolean todoRecebido = true;
        boolean algumRecebido = false;

        for (PedidoBetelDTO.ConferirItemRequest conf : dto.getItensRecebidos()) {
            ItemPedidoBetel item = pedido.getItens().stream()
                    .filter(i -> i.getId().equals(conf.getItemId()))
                    .findFirst()
                    .orElseThrow(() -> new EntityNotFoundException("Item ID " + conf.getItemId() + " não pertence ao pedido."));

            item.setQuantidadeRecebida(conf.getQuantidadeRecebida());

            if (conf.getQuantidadeRecebida() > 0) {
                algumRecebido = true;

                // 1. Atualiza o estoque da congregação
                Publicacao publicacao = item.getPublicacao();
                int estoqueAnterior = publicacao.getQuantidadeEstoque() != null ? publicacao.getQuantidadeEstoque() : 0;
                int novoEstoque = estoqueAnterior + conf.getQuantidadeRecebida();
                publicacao.setQuantidadeEstoque(novoEstoque);
                publicacaoRepo.save(publicacao);

                // 2. Registra na tabela de auditoria com todas as colunas NOT NULL preenchidas
                MovimentacaoEstoque mov = MovimentacaoEstoque.builder()
                        .publicacao(publicacao)
                        .congregacao(pedido.getCongregacao())
                        .responsavel(responsavel) // <-- Preenchimento obrigatório
                        .tipo(TipoMovimentacao.ENTRADA)
                        .quantidade(conf.getQuantidadeRecebida())
                        .quantidadeAnterior(estoqueAnterior)
                        .quantidadePosterior(novoEstoque)
                        .dataMovimentacao(LocalDateTime.now())
                        .observacoes("Entrada automática via Remessa Betel - Pedido: " + (pedido.getNumeroPedido() != null ? pedido.getNumeroPedido() : pedido.getId()))
                        .build();
                movimentacaoEstoqueRepo.save(mov);
            }

            if (conf.getQuantidadeRecebida() < item.getQuantidadeSolicitada()) {
                todoRecebido = false;
            }
        }

        pedido.setDataRecebimento(LocalDateTime.now());
        pedido.setStatus(todoRecebido ? StatusPedidoBetel.RECEBIDO_TOTAL : (algumRecebido ? StatusPedidoBetel.RECEBIDO_PARCIAL : StatusPedidoBetel.ENVIADO));
        if (dto.getObservacoes() != null) {
            pedido.setObservacoes(dto.getObservacoes());
        }

        // Atualiza pedidos especiais de publicadores vinculados para ATENDIDO
        List<PedidoPublicador> pedidosPubVinculados = pedidoPublicadorRepo.findByPedidoBetelId(pedidoBetelId);
        for (PedidoPublicador pp : pedidosPubVinculados) {
            pp.setStatus(StatusPedidoPublicador.ATENDIDO);
            pp.setDataAtendimento(LocalDateTime.now());
        }
        pedidoPublicadorRepo.saveAll(pedidosPubVinculados);

        return toPedidoBetelResponse(pedidoBetelRepo.save(pedido));
    }

    private Usuario obterUsuarioLogado() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getName() != null) {
            return usuarioRepo.findByEmail(auth.getName())
                    .orElse(null);
        }
        return null;
    }
    
    @Transactional
    public PedidoBetelDTO.Response atualizarPedidoBetel(Long id, PedidoBetelDTO.CriarRequest dto) {
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));

        if (pedido.getStatus() == StatusPedidoBetel.RECEBIDO_TOTAL) {
            throw new IllegalStateException("Pedidos já recebidos e com estoque atualizado não podem ser editados.");
        }

        pedido.setNumeroPedido(dto.getNumeroPedido());
        pedido.setMesAnoReferencia(dto.getMesAnoReferencia());
        pedido.setObservacoes(dto.getObservacoes());

        // Limpa itens antigos e reconstrói
        pedido.getItens().clear();
        for (PedidoBetelDTO.ItemRequest itemDto : dto.getItens()) {
            Publicacao publicacao = publicacaoRepo.findById(itemDto.getPublicacaoId())
                    .orElseThrow(() -> new EntityNotFoundException("Publicação ID " + itemDto.getPublicacaoId() + " não encontrada."));

            ItemPedidoBetel item = ItemPedidoBetel.builder()
                    .pedidoBetel(pedido)
                    .publicacao(publicacao)
                    .quantidadeSolicitada(itemDto.getQuantidadeSolicitada())
                    .quantidadeRecebida(0)
                    .origem(itemDto.getOrigem() != null ? itemDto.getOrigem() : OrigemItemPedido.ESTOQUE)
                    .build();

            pedido.getItens().add(item);
        }

        return toPedidoBetelResponse(pedidoBetelRepo.save(pedido));
    }

    @Transactional
    public void excluirPedidoBetel(Long id) {
        PedidoBetel pedido = pedidoBetelRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pedido Betel não encontrado."));

        if (pedido.getStatus() == StatusPedidoBetel.RECEBIDO_TOTAL) {
            throw new IllegalStateException("Pedidos já finalizados/recebidos no estoque não podem ser excluídos diretamente.");
        }

        // Desvincula pedidos de publicadores para voltarem a ficar PENDENTE
        List<PedidoPublicador> vinculados = pedidoPublicadorRepo.findByPedidoBetelId(id);
        for (PedidoPublicador pp : vinculados) {
            pp.setPedidoBetel(null);
            pp.setStatus(StatusPedidoPublicador.PENDENTE);
        }
        pedidoPublicadorRepo.saveAll(vinculados);

        pedidoBetelRepo.delete(pedido);
    }

   

    // ==========================================
    // MAPPERS PRIVADOS
    // ==========================================

    private PedidoPublicadorDTO.Response toPedidoPublicadorResponse(PedidoPublicador entity) {
        return PedidoPublicadorDTO.Response.builder()
                .id(entity.getId())
                .publicadorId(entity.getPublicador().getId())
                .publicadorNome(entity.getPublicador().getNome())
                .publicacaoId(entity.getPublicacao().getId())
                .publicacaoCodigo(entity.getPublicacao().getCodigo())
                .publicacaoTitulo(entity.getPublicacao().getTitulo())
                .congregacaoId(entity.getCongregacao().getId())
                .quantidade(entity.getQuantidade())
                .dataSolicitacao(entity.getDataSolicitacao())
                .dataAtendimento(entity.getDataAtendimento())
                .status(entity.getStatus())
                .observacoes(entity.getObservacoes())
                .pedidoBetelId(entity.getPedidoBetel() != null ? entity.getPedidoBetel().getId() : null)
                .build();
    }

    private PedidoBetelDTO.Response toPedidoBetelResponse(PedidoBetel entity) {
        List<PedidoBetelDTO.ItemResponse> itens = entity.getItens().stream()
                .map(i -> PedidoBetelDTO.ItemResponse.builder()
                        .id(i.getId())
                        .publicacaoId(i.getPublicacao().getId())
                        .publicacaoCodigo(i.getPublicacao().getCodigo())
                        .publicacaoTitulo(i.getPublicacao().getTitulo())
                        .quantidadeSolicitada(i.getQuantidadeSolicitada())
                        .quantidadeRecebida(i.getQuantidadeRecebida())
                        .origem(i.getOrigem())
                        .build())
                .collect(Collectors.toList());

        return PedidoBetelDTO.Response.builder()
                .id(entity.getId())
                .congregacaoId(entity.getCongregacao().getId())
                .congregacaoNome(entity.getCongregacao().getNome())
                .numeroPedido(entity.getNumeroPedido())
                .mesAnoReferencia(entity.getMesAnoReferencia())
                .dataCriacao(entity.getDataCriacao())
                .dataEnvio(entity.getDataEnvio())
                .dataRecebimento(entity.getDataRecebimento())
                .status(entity.getStatus())
                .observacoes(entity.getObservacoes())
                .totalItens(itens.size())
                .itens(itens)
                .build();
    }
}