package com.gpt.modulos.publicacao.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.publicacao.dto.*;
import com.gpt.modulos.publicacao.model.EstoquePublicacao;
import com.gpt.modulos.publicacao.model.PedidoPublicacao;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.model.StatusPedido;
import com.gpt.modulos.publicacao.repository.EstoquePublicacaoRepository;
import com.gpt.modulos.publicacao.repository.PedidoPublicacaoRepository;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicacaoService {

    private final PublicacaoRepository publicacaoRepository;
    private final EstoquePublicacaoRepository estoqueRepository;
    private final PedidoPublicacaoRepository pedidoRepository;
    private final CongregacaoRepository congregacaoRepository;
    private final UsuarioRepository usuarioRepository;

    // --- Catálogo ---

    @Transactional
    public PublicacaoResponseDTO cadastrarPublicacao(PublicacaoRequestDTO request) {
        if (publicacaoRepository.existsByCodigo(request.getCodigo())) {
            throw new IllegalArgumentException("Publicação já cadastrada com o código: " + request.getCodigo());
        }

        Publicacao publicacao = Publicacao.builder()
                .codigo(request.getCodigo().toLowerCase())
                .titulo(request.getTitulo())
                .categoria(request.getCategoria())
                .idioma(request.getIdioma() != null ? request.getIdioma() : "Português")
                .ativo(true)
                .build();

        return converterParaPublicacaoDTO(publicacaoRepository.save(publicacao));
    }

    @Transactional(readOnly = true)
    public List<PublicacaoResponseDTO> listarCatalogo() {
        return publicacaoRepository.findByAtivoTrue().stream()
                .map(this::converterParaPublicacaoDTO)
                .collect(Collectors.toList());
    }

    // --- Estoque ---

    @Transactional
    public EstoqueResponseDTO atualizarEstoque(AjusteEstoqueDTO request) {
        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Congregação não encontrada"));

        Publicacao publicacao = publicacaoRepository.findById(request.getPublicacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Publicação não encontrada"));

        EstoquePublicacao estoque = estoqueRepository
                .findByPublicacaoIdAndCongregacaoId(request.getPublicacaoId(), request.getCongregacaoId())
                .orElse(EstoquePublicacao.builder()
                        .congregacao(congregacao)
                        .publicacao(publicacao)
                        .quantidadeDisponivel(0)
                        .build());

        estoque.setQuantidadeDisponivel(request.getQuantidade());
        return converterParaEstoqueDTO(estoqueRepository.save(estoque));
    }

    @Transactional(readOnly = true)
    public List<EstoqueResponseDTO> listarEstoquePorCongregacao(Long congregacaoId) {
        return estoqueRepository.findByCongregacaoId(congregacaoId).stream()
                .map(this::converterParaEstoqueDTO)
                .collect(Collectors.toList());
    }

    // --- Pedidos ---

    @Transactional
    public PedidoPublicacaoResponseDTO solicitarPublicacao(PedidoPublicacaoRequestDTO request) {
        Usuario publicador = usuarioRepository.findById(request.getPublicadorId())
                .orElseThrow(() -> new IllegalArgumentException("Publicador não encontrado"));

        Congregacao congregacao = congregacaoRepository.findById(request.getCongregacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Congregação não encontrada"));

        Publicacao publicacao = publicacaoRepository.findById(request.getPublicacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Publicação não encontrada"));

        PedidoPublicacao pedido = PedidoPublicacao.builder()
                .publicador(publicador)
                .congregacao(congregacao)
                .publicacao(publicacao)
                .quantidade(request.getQuantidade())
                .status(StatusPedido.PENDENTE)
                .observacoes(request.getObservacoes())
                .build();

        return converterParaPedidoDTO(pedidoRepository.save(pedido));
    }

    @Transactional
    public PedidoPublicacaoResponseDTO atenderPedido(Long pedidoId) {
        PedidoPublicacao pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new IllegalArgumentException("Pedido não encontrado"));

        if (pedido.getStatus() != StatusPedido.PENDENTE) {
            throw new IllegalStateException("Apenas pedidos pendentes podem ser atendidos");
        }

        // Busca o estoque da congregação
        EstoquePublicacao estoque = estoqueRepository
                .findByPublicacaoIdAndCongregacaoId(pedido.getPublicacao().getId(), pedido.getCongregacao().getId())
                .orElseThrow(() -> new IllegalStateException("Esta publicação não possui estoque cadastrado nesta congregação"));

        if (estoque.getQuantidadeDisponivel() < pedido.getQuantidade()) {
            throw new IllegalStateException("Estoque insuficiente para atender o pedido. Disponível: " 
                    + estoque.getQuantidadeDisponivel() + " | Solicitado: " + pedido.getQuantidade());
        }

        // Baixa automática no estoque
        estoque.setQuantidadeDisponivel(estoque.getQuantidadeDisponivel() - pedido.getQuantidade());
        estoqueRepository.save(estoque);

        pedido.setStatus(StatusPedido.ENTREGUE);
        pedido.setAtendidoEm(LocalDateTime.now());

        return converterParaPedidoDTO(pedidoRepository.save(pedido));
    }

    @Transactional(readOnly = true)
    public List<PedidoPublicacaoResponseDTO> listarPedidosPorCongregacao(Long congregacaoId) {
        return pedidoRepository.findByCongregacaoIdOrderByCriadoEmDesc(congregacaoId).stream()
                .map(this::converterParaPedidoDTO)
                .collect(Collectors.toList());
    }

    // --- Conversores ---

    private PublicacaoResponseDTO converterParaPublicacaoDTO(Publicacao p) {
        return PublicacaoResponseDTO.builder()
                .id(p.getId())
                .codigo(p.getCodigo())
                .titulo(p.getTitulo())
                .categoria(p.getCategoria())
                .idioma(p.getIdioma())
                .ativo(p.getAtivo())
                .build();
    }

    private EstoqueResponseDTO converterParaEstoqueDTO(EstoquePublicacao e) {
        return EstoqueResponseDTO.builder()
                .id(e.getId())
                .congregacaoId(e.getCongregacao().getId())
                .publicacaoId(e.getPublicacao().getId())
                .publicacaoCodigo(e.getPublicacao().getCodigo())
                .publicacaoTitulo(e.getPublicacao().getTitulo())
                .quantidadeDisponivel(e.getQuantidadeDisponivel())
                .atualizadoEm(e.getAtualizadoEm())
                .build();
    }

    private PedidoPublicacaoResponseDTO converterParaPedidoDTO(PedidoPublicacao p) {
        return PedidoPublicacaoResponseDTO.builder()
                .id(p.getId())
                .publicadorId(p.getPublicador().getId())
                .publicadorNome(p.getPublicador().getNome())
                .congregacaoId(p.getCongregacao().getId())
                .publicacaoId(p.getPublicacao().getId())
                .publicacaoCodigo(p.getPublicacao().getCodigo())
                .publicacaoTitulo(p.getPublicacao().getTitulo())
                .quantidade(p.getQuantidade())
                .status(p.getStatus())
                .observacoes(p.getObservacoes())
                .criadoEm(p.getCriadoEm())
                .atendidoEm(p.getAtendidoEm())
                .build();
    }
}