package com.gpt.modulos.publicacao.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.publicacao.dto.*;
import com.gpt.modulos.publicacao.model.*;
import com.gpt.modulos.publicacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.model.Usuario;
import com.gpt.modulos.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicacaoService {

    private final PublicacaoRepository publicacaoRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final CongregacaoRepository congregacaoRepository;
    private final PublicadorRepository publicadorRepository;
    private final UsuarioRepository usuarioRepository; // <-- Injeção adicionada

    @Transactional(readOnly = true)
    public List<PublicacaoResponseDTO> listarPorCongregacao(Long congregacaoId) {
        return publicacaoRepository.findByCongregacaoIdAndAtivoTrueOrderByTituloAsc(congregacaoId)
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    @Transactional
    public PublicacaoResponseDTO cadastrar(PublicacaoRequestDTO dto, Usuario responsavel) {
        if (dto.congregacaoId() == null) {
            throw new IllegalArgumentException("O ID da congregação é obrigatório.");
        }

        if (publicacaoRepository.existsByCodigoIgnoreCaseAndCongregacaoId(dto.codigo().trim(), dto.congregacaoId())) {
            throw new IllegalArgumentException("Já existe uma publicação com o código '" + dto.codigo() + "' cadastrada nesta congregação.");
        }

        Congregacao congregacao = congregacaoRepository.findById(dto.congregacaoId())
                .orElseThrow(() -> new IllegalArgumentException("Congregação não encontrada com ID: " + dto.congregacaoId()));

        int qtdInicial = dto.quantidadeEstoque() != null ? dto.quantidadeEstoque() : 0;
        int estoqueMin = dto.estoqueMinimo() != null ? dto.estoqueMinimo() : 5;

        Publicacao publicacao = Publicacao.builder()
                .codigo(dto.codigo().trim().toUpperCase())
                .titulo(dto.titulo().trim())
                .categoria(dto.categoria())
                .idioma(dto.idioma() != null && !dto.idioma().isBlank() ? dto.idioma().trim() : "Português")
                .quantidadeEstoque(qtdInicial)
                .estoqueMinimo(estoqueMin)
                .congregacao(congregacao)
                .ativo(true)
                .build();

        Publicacao salva = publicacaoRepository.save(publicacao);

        // Registra a primeira entrada no histórico se começou com estoque > 0
        if (qtdInicial > 0) {
            Usuario usuarioFinal = responsavel;
            if (usuarioFinal == null) {
                usuarioFinal = usuarioRepository.findAll().stream().findFirst().orElse(null);
            }

            if (usuarioFinal != null) {
                MovimentacaoEstoque movInicial = MovimentacaoEstoque.builder()
                        .publicacao(salva)
                        .congregacao(congregacao)
                        .tipo(TipoMovimentacao.ENTRADA)
                        .quantidade(qtdInicial)
                        .quantidadeAnterior(0)
                        .quantidadePosterior(qtdInicial)
                        .responsavel(usuarioFinal)
                        .observacoes("Estoque inicial de cadastro")
                        .build();
                movimentacaoRepository.save(movInicial);
            }
        }

        return converterParaResponseDTO(salva);
    }

    @Transactional
    public MovimentacaoResponseDTO movimentarEstoque(Long publicacaoId, MovimentacaoEstoqueDTO dto, Usuario responsavel) {
        Publicacao publicacao = publicacaoRepository.findById(publicacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Publicação não encontrada com ID: " + publicacaoId));

        int qtdAnterior = publicacao.getQuantidadeEstoque() != null ? publicacao.getQuantidadeEstoque() : 0;
        int qtdMovimento = dto.quantidade();
        int qtdPosterior;

        Publicador publicador = null;
        if (dto.publicadorId() != null) {
            publicador = publicadorRepository.findById(dto.publicadorId()).orElse(null);
        }

        switch (dto.tipo()) {
            case ENTRADA -> qtdPosterior = qtdAnterior + qtdMovimento;
            case SAIDA -> {
                if (qtdAnterior < qtdMovimento) {
                    throw new IllegalArgumentException("Estoque insuficiente. Quantidade disponível: " + qtdAnterior);
                }
                qtdPosterior = qtdAnterior - qtdMovimento;
            }
            case AJUSTE -> qtdPosterior = qtdMovimento;
            default -> throw new IllegalArgumentException("Tipo de movimentação inválido.");
        }

        publicacao.setQuantidadeEstoque(qtdPosterior);
        publicacaoRepository.save(publicacao);

        Usuario usuarioFinal = responsavel;
        if (usuarioFinal == null) {
            usuarioFinal = usuarioRepository.findAll().stream().findFirst().orElse(null);
        }

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .publicacao(publicacao)
                .congregacao(publicacao.getCongregacao())
                .tipo(dto.tipo())
                .quantidade(qtdMovimento)
                .quantidadeAnterior(qtdAnterior)
                .quantidadePosterior(qtdPosterior)
                .publicador(publicador)
                .responsavel(usuarioFinal)
                .observacoes(dto.observacoes())
                .build();

        MovimentacaoEstoque salva = movimentacaoRepository.save(movimentacao);

        return new MovimentacaoResponseDTO(
                salva.getId(),
                publicacao.getId(),
                publicacao.getCodigo(),
                publicacao.getTitulo(),
                salva.getTipo(),
                salva.getQuantidade(),
                salva.getQuantidadeAnterior(),
                salva.getQuantidadePosterior(),
                publicador != null ? publicador.getId() : null,
                publicador != null ? publicador.getNome() : null,
                usuarioFinal != null ? usuarioFinal.getNome() : "Sistema",
                salva.getObservacoes(),
                salva.getDataMovimentacao()
        );
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponseDTO> listarHistoricoGeral(Long congregacaoId) {
        return movimentacaoRepository.findByCongregacaoIdOrderByDataMovimentacaoDesc(congregacaoId)
                .stream()
                .map(m -> new MovimentacaoResponseDTO(
                        m.getId(),
                        m.getPublicacao().getId(),
                        m.getPublicacao().getCodigo(),
                        m.getPublicacao().getTitulo(),
                        m.getTipo(),
                        m.getQuantidade(),
                        m.getQuantidadeAnterior(),
                        m.getQuantidadePosterior(),
                        m.getPublicador() != null ? m.getPublicador().getId() : null,
                        m.getPublicador() != null ? m.getPublicador().getNome() : null,
                        m.getResponsavel() != null ? m.getResponsavel().getNome() : "Sistema",
                        m.getObservacoes(),
                        m.getDataMovimentacao()
                ))
                .toList();
    }

    private PublicacaoResponseDTO converterParaResponseDTO(Publicacao p) {
        int estoque = p.getQuantidadeEstoque() != null ? p.getQuantidadeEstoque() : 0;
        int minimo = p.getEstoqueMinimo() != null ? p.getEstoqueMinimo() : 0;

        return new PublicacaoResponseDTO(
                p.getId(),
                p.getCodigo(),
                p.getTitulo(),
                p.getCategoria(),
                p.getIdioma(),
                estoque,
                minimo,
                estoque <= minimo,
                p.getCongregacao().getId(),
                p.getCongregacao().getNome(),
                p.getAtivo(),
                p.getCriadoEm()
        );
    }
}