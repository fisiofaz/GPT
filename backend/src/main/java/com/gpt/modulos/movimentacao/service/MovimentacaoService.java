
package com.gpt.modulos.movimentacao.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.dto.AjusteEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoEstoqueDTO;
import com.gpt.modulos.movimentacao.dto.MovimentacaoResponseDTO;
import com.gpt.modulos.movimentacao.enums.TipoMovimentacao;
import com.gpt.modulos.movimentacao.model.MovimentacaoEstoque;
import com.gpt.modulos.movimentacao.model.PublicacaoEstoque;
import com.gpt.modulos.movimentacao.repository.MovimentacaoEstoqueRepository;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.publicacao.model.Publicacao;
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
public class MovimentacaoService {

    private final MovimentacaoEstoqueRepository movimentacaoRepository;
    private final PublicacaoRepository publicacaoRepository;
    private final PublicacaoEstoqueRepository publicacaoEstoqueRepository;
    private final PublicadorRepository publicadorRepository;
    private final CongregacaoRepository congregacaoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public MovimentacaoResponseDTO movimentar(
            Long publicacaoId,
            Long congregacaoId,
            MovimentacaoEstoqueDTO dto,
            Usuario responsavel
    ) {
        validarResponsavel(responsavel);
        
        Usuario responsavelGerenciado = usuarioRepository.findById(responsavel.getId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Usuário responsável não encontrado."
                ));

        if (dto == null || dto.tipo() == null) {
            throw new IllegalArgumentException(
                    "O tipo de movimentação é obrigatório."
            );
        }

        if (dto.quantidade() <= 0) {
            throw new IllegalArgumentException(
                    "A quantidade deve ser maior que zero."
            );
        }

        if (dto.tipo() == TipoMovimentacao.AJUSTE) {
            throw new IllegalArgumentException(
                    "Para ajuste de estoque utilize o endpoint de ajuste."
            );
        }

        Publicacao publicacao = publicacaoRepository
                .findById(publicacaoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Publicação não encontrada com ID: " + publicacaoId
                ));

        if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
            throw new IllegalArgumentException(
                    "A publicação está inativa."
            );
        }

        PublicacaoEstoque estoque;

        if (dto.tipo() == TipoMovimentacao.ENTRADA) {
            estoque = obterOuCriarEstoqueParaEntrada(
                    publicacao,
                    congregacaoId
            );
        } else if (dto.tipo() == TipoMovimentacao.SAIDA) {
            estoque = buscarEstoqueAtivo(
                    publicacaoId,
                    congregacaoId
            );
        } else {
            throw new IllegalArgumentException(
                    "Tipo de movimentação não suportado."
            );
        }

        int quantidadeAnterior = obterQuantidadeAtual(estoque);
        int quantidadePosterior;

        switch (dto.tipo()) {
            case ENTRADA -> quantidadePosterior =
                    Math.addExact(quantidadeAnterior, dto.quantidade());

            case SAIDA -> {
                if (dto.quantidade() > quantidadeAnterior) {
                    throw new IllegalArgumentException(
                            "Estoque insuficiente. Disponível: "
                                    + quantidadeAnterior
                    );
                }

                quantidadePosterior =
                        quantidadeAnterior - dto.quantidade();
            }

            default -> throw new IllegalArgumentException(
                    "Tipo de movimentação não suportado."
            );
        }

        Publicador publicador = obterPublicador(dto.publicadorId());

        estoque.setQuantidade(quantidadePosterior);
        publicacaoEstoqueRepository.save(estoque);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .publicacao(publicacao)
                .congregacao(estoque.getCongregacao())
                .tipo(dto.tipo())
                .quantidade(dto.quantidade())
                .quantidadeAnterior(quantidadeAnterior)
                .quantidadePosterior(quantidadePosterior)
                .publicador(publicador)
                .responsavel(responsavelGerenciado)
                .observacoes(dto.observacoes())
                .build();

        MovimentacaoEstoque salva =
                movimentacaoRepository.saveAndFlush(movimentacao);

        MovimentacaoEstoque movimentacaoCompleta =
                movimentacaoRepository.findWithDetailsById(salva.getId())
                        .orElseThrow(() -> new IllegalStateException(
                                "Não foi possível recuperar a movimentação registrada."
                        ));

        return converterParaResponseDTO(movimentacaoCompleta);
    }

    @Transactional
    public MovimentacaoResponseDTO ajustarEstoque(
            AjusteEstoqueDTO dto,
            Usuario responsavel
    ) {
        validarResponsavel(responsavel);

        if (dto == null
                || dto.getPublicacaoId() == null
                || dto.getCongregacaoId() == null
                || dto.getQuantidade() == null
                || dto.getQuantidade() < 0) {
            throw new IllegalArgumentException(
                    "Informe publicação, congregação e quantidade válida."
            );
        }

        Publicacao publicacao = publicacaoRepository
                .findById(dto.getPublicacaoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Publicação não encontrada com ID: "
                                + dto.getPublicacaoId()
                ));

        if (!Boolean.TRUE.equals(publicacao.getAtivo())) {
            throw new IllegalArgumentException(
                    "A publicação está inativa."
            );
        }

        PublicacaoEstoque estoque = buscarEstoqueAtivo(
                dto.getPublicacaoId(),
                dto.getCongregacaoId()
        );

        int quantidadeAnterior = obterQuantidadeAtual(estoque);
        int quantidadePosterior = dto.getQuantidade();

        estoque.setQuantidade(quantidadePosterior);
        publicacaoEstoqueRepository.save(estoque);

        MovimentacaoEstoque movimentacao = MovimentacaoEstoque.builder()
                .publicacao(publicacao)
                .congregacao(estoque.getCongregacao())
                .tipo(TipoMovimentacao.AJUSTE)
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

    private PublicacaoEstoque obterOuCriarEstoqueParaEntrada(
            Publicacao publicacao,
            Long congregacaoId
    ) {
        if (congregacaoId == null) {
            throw new IllegalArgumentException(
                    "A congregação é obrigatória."
            );
        }

        var estoqueExistente =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                publicacao.getId(),
                                congregacaoId
                        );

        if (estoqueExistente.isPresent()) {
            PublicacaoEstoque estoque = estoqueExistente.get();

            if (!Boolean.TRUE.equals(estoque.getAtivo())) {
                throw new IllegalArgumentException(
                        "O estoque da publicação está inativo."
                );
            }

            return estoque;
        }

        Congregacao congregacao = congregacaoRepository
                .findById(congregacaoId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Congregação não encontrada com ID: "
                                + congregacaoId
                ));

        PublicacaoEstoque novoEstoque = PublicacaoEstoque.builder()
                .publicacao(publicacao)
                .congregacao(congregacao)
                .quantidade(0)
                .estoqueMinimo(5)
                .ativo(true)
                .build();

        return publicacaoEstoqueRepository.save(novoEstoque);
    }

    private PublicacaoEstoque buscarEstoqueAtivo(
            Long publicacaoId,
            Long congregacaoId
    ) {
        PublicacaoEstoque estoque = publicacaoEstoqueRepository
                .findByPublicacaoIdAndCongregacaoId(
                        publicacaoId,
                        congregacaoId
                )
                .orElseThrow(() -> new IllegalArgumentException(
                        "Estoque da publicação não encontrado "
                                + "para a congregação."
                ));

        if (!Boolean.TRUE.equals(estoque.getAtivo())) {
            throw new IllegalArgumentException(
                    "O estoque da publicação está inativo."
            );
        }

        if (!Boolean.TRUE.equals(estoque.getPublicacao().getAtivo())) {
            throw new IllegalArgumentException(
                    "A publicação está inativa."
            );
        }

        return estoque;
    }

    private int obterQuantidadeAtual(PublicacaoEstoque estoque) {
        return estoque.getQuantidade() != null
                ? estoque.getQuantidade()
                : 0;
    }

    private void validarResponsavel(Usuario responsavel) {
        if (responsavel == null || responsavel.getId() == null) {
            throw new IllegalArgumentException(
                    "É necessário um usuário autenticado "
                            + "para registrar a movimentação."
            );
        }
    }

    private Publicador obterPublicador(Long publicadorId) {
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
        Publicacao publicacao = movimentacao.getPublicacao();

        Long publicadorId = null;
        String publicadorNome = null;

        if (movimentacao.getPublicador() != null) {
            publicadorId = movimentacao.getPublicador().getId();

            if (movimentacao.getPublicador().getPessoa() != null) {
                publicadorNome = movimentacao.getPublicador()
                        .getPessoa()
                        .getNome();
            }
        }

        String responsavelNome = null;

        if (movimentacao.getResponsavel() != null
                && movimentacao.getResponsavel().getPessoa() != null) {
            responsavelNome = movimentacao.getResponsavel()
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