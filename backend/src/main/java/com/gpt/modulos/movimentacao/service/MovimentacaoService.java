package com.gpt.modulos.movimentacao.service;

import com.gpt.modulos.movimentacao.dto.AjusteEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoResponseDTO;
import com.gpt.modulos.movimentacao.model.MovimentacaoEstoque;
import com.gpt.modulos.movimentacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.model.PublicacaoEstoque;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.publicador.repository.PublicadorRepository;
import com.gpt.modulos.usuario.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimentacaoService {

    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final PublicacaoRepository publicacaoRepository;
    private final PublicacaoEstoqueRepository publicacaoEstoqueRepository;
    private final PublicadorRepository publicadorRepository;

    @Transactional
    public MovimentacaoResponseDTO movimentar(
            Long publicacaoId,
            Long congregacaoId,
            MovimentacaoEstoqueDTO dto,
            Usuario responsavel
    ) {

        if (dto.tipo() == null) {
            throw new IllegalArgumentException(
                    "O tipo de movimentação é obrigatório."
            );
        }

        if (dto.tipo().name().equals("AJUSTE")) {
            throw new IllegalArgumentException(
                    "Para ajuste de estoque utilize o endpoint de ajuste."
            );
        }

        Publicacao publicacao = publicacaoRepository
                .findById(publicacaoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Publicação não encontrada com ID: " + publicacaoId
                ));

        PublicacaoEstoque estoque =
                buscarEstoqueAtivo(
                        publicacaoId,
                        congregacaoId
                );

        int quantidadeAnterior =
                obterQuantidadeAtual(estoque);

        int quantidadePosterior;

        switch (dto.tipo()) {

            case ENTRADA -> quantidadePosterior =
                    quantidadeAnterior + dto.quantidade();

            case SAIDA -> {

                if (dto.quantidade() > quantidadeAnterior) {
                    throw new IllegalArgumentException(
                            "Estoque insuficiente. "
                                    + "Disponível: "
                                    + quantidadeAnterior
                    );
                }

                quantidadePosterior =
                        quantidadeAnterior - dto.quantidade();
            }

            case AJUSTE -> throw new IllegalArgumentException(
                    "Para ajuste de estoque utilize o endpoint de ajuste."
            );

            default -> throw new IllegalArgumentException(
                    "Tipo de movimentação não suportado."
            );
        }

        Publicador publicador = obterPublicador(dto.publicadorId());

        estoque.setQuantidade(quantidadePosterior);
        publicacaoEstoqueRepository.save(estoque);

        MovimentacaoEstoque movimentacao =
                MovimentacaoEstoque.builder()
                        .publicacao(publicacao)
                        .congregacao(estoque.getCongregacao())
                        .tipo(dto.tipo())
                        .quantidade(dto.quantidade())
                        .quantidadeAnterior(quantidadeAnterior)
                        .quantidadePosterior(quantidadePosterior)
                        .publicador(publicador)
                        .responsavel(responsavel)
                        .observacoes(dto.observacoes())
                        .build();

        MovimentacaoEstoque salva =
                movimentacaoRepository.save(movimentacao);

        return converterParaResponseDTO(salva);
    }

    @Transactional
    public MovimentacaoResponseDTO ajustarEstoque(
            AjusteEstoqueDTO dto,
            Usuario responsavel
    ) {

        Publicacao publicacao = publicacaoRepository
                .findById(dto.getPublicacaoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Publicação não encontrada com ID: "
                                + dto.getPublicacaoId()
                ));

        PublicacaoEstoque estoque =
                buscarEstoqueAtivo(
                        dto.getPublicacaoId(),
                        dto.getCongregacaoId()
                );

        int quantidadeAnterior =
                obterQuantidadeAtual(estoque);

        int quantidadePosterior = dto.getQuantidade();

        estoque.setQuantidade(quantidadePosterior);
        publicacaoEstoqueRepository.save(estoque);

        MovimentacaoEstoque movimentacao =
                MovimentacaoEstoque.builder()
                        .publicacao(publicacao)
                        .congregacao(estoque.getCongregacao())
                        .tipo(
                                com.gpt.modulos.movimentacao.enums.TipoMovimentacao.AJUSTE
                        )
                        .quantidade(quantidadePosterior)
                        .quantidadeAnterior(quantidadeAnterior)
                        .quantidadePosterior(quantidadePosterior)
                        .responsavel(responsavel)
                        .build();

        MovimentacaoEstoque salva =
                movimentacaoRepository.save(movimentacao);

        return converterParaResponseDTO(salva);
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponseDTO> listarHistoricoGeral(
            Long congregacaoId
    ) {
        return movimentacaoRepository
                .findByCongregacaoIdOrderByDataMovimentacaoDesc(
                        congregacaoId
                )
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoResponseDTO> listarPorPublicacao(
            Long publicacaoId
    ) {
        return movimentacaoRepository
                .findByPublicacaoIdOrderByDataMovimentacaoDesc(
                        publicacaoId
                )
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    private PublicacaoEstoque buscarEstoqueAtivo(
            Long publicacaoId,
            Long congregacaoId
    ) {

        PublicacaoEstoque estoque =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                publicacaoId,
                                congregacaoId
                        )
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Estoque da publicação não encontrado "
                                        + "para a congregação."
                        ));

        if (!estoque.getAtivo()) {
            throw new IllegalArgumentException(
                    "O estoque da publicação está inativo."
            );
        }

        if (!estoque.getPublicacao().getAtivo()) {
            throw new IllegalArgumentException(
                    "A publicação está inativa."
            );
        }

        return estoque;
    }

    private int obterQuantidadeAtual(
            PublicacaoEstoque estoque
    ) {
        return estoque.getQuantidade() != null
                ? estoque.getQuantidade()
                : 0;
    }

    private Publicador obterPublicador(
            Long publicadorId
    ) {

        if (publicadorId == null) {
            return null;
        }

        return publicadorRepository
                .findById(publicadorId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Publicador não encontrado com ID: "
                                + publicadorId
                ));
    }

    private MovimentacaoResponseDTO converterParaResponseDTO(
            MovimentacaoEstoque movimentacao
    ) {

        Publicacao publicacao =
                movimentacao.getPublicacao();

        Long publicadorId = null;
        String publicadorNome = null;

        if (movimentacao.getPublicador() != null) {

            publicadorId =
                    movimentacao.getPublicador().getId();

            if (movimentacao.getPublicador().getPessoa() != null) {
                publicadorNome =
                        movimentacao.getPublicador()
                                .getPessoa()
                                .getNome();
            }
        }

        String responsavelNome = null;

        if (movimentacao.getResponsavel() != null
                && movimentacao.getResponsavel().getPessoa() != null) {

            responsavelNome =
                    movimentacao.getResponsavel()
                            .getPessoa()
                            .getNome();
        }

        return new MovimentacaoResponseDTO(
                movimentacao.getId(),
                publicacao.getId(),
                publicacao.getCodigo(),
                publicacao.getTitulo(),
                movimentacao.getTipo(),
                movimentacao.getQuantidade(),
                movimentacao.getQuantidadeAnterior(),
                movimentacao.getQuantidadePosterior(),
                publicadorId,
                publicadorNome,
                responsavelNome,
                movimentacao.getObservacoes(),
                movimentacao.getDataMovimentacao()
        );
    }
}