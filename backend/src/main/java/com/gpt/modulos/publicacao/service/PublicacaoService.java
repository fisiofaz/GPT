package com.gpt.modulos.publicacao.service;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.congregacao.repository.CongregacaoRepository;
import com.gpt.modulos.movimentacao.repository.PublicacaoEstoqueRepository;
import com.gpt.modulos.publicacao.dto.PublicacaoRequestDTO;
import com.gpt.modulos.publicacao.dto.PublicacaoResponseDTO;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicacao.model.PublicacaoEstoque;
import com.gpt.modulos.publicacao.repository.PublicacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublicacaoService {

    private final PublicacaoRepository publicacaoRepository;
    private final PublicacaoEstoqueRepository publicacaoEstoqueRepository;
    private final CongregacaoRepository congregacaoRepository;

    @Transactional(readOnly = true)
    public List<PublicacaoResponseDTO> listarPorCongregacao(
            Long congregacaoId
    ) {
        return publicacaoEstoqueRepository
                .findByCongregacaoIdAndAtivoTrueOrderByPublicacaoTituloAsc(
                        congregacaoId
                )
                .stream()
                .map(this::converterParaResponseDTO)
                .toList();
    }

    @Transactional
    public PublicacaoResponseDTO cadastrar(
            PublicacaoRequestDTO dto,
            com.gpt.modulos.usuario.model.Usuario responsavel
    ) {

        if (dto.congregacaoId() == null) {
            throw new IllegalArgumentException(
                    "O ID da congregação é obrigatório."
            );
        }

        if (publicacaoRepository.existsByCodigoIgnoreCase(
                dto.codigo().trim()
        )) {
            throw new IllegalArgumentException(
                    "Já existe uma publicação com o código '"
                            + dto.codigo()
                            + "'."
            );
        }

        Congregacao congregacao = congregacaoRepository
                .findById(dto.congregacaoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Congregação não encontrada com ID: "
                                + dto.congregacaoId()
                ));

        Publicacao publicacao = Publicacao.builder()
                .codigo(dto.codigo().trim().toUpperCase())
                .titulo(dto.titulo().trim())
                .categoria(dto.categoria())
                .formato(
                        dto.formato() != null
                                ? dto.formato()
                                : FormatoPublicacao.NORMAL
                )
                .idioma(
                        dto.idioma() != null
                                ? dto.idioma()
                                : IdiomaPublicacao.PORTUGUES
                )
                .ativo(true)
                .build();

        Publicacao salva = publicacaoRepository.saveAndFlush(publicacao);

        int quantidadeInicial =
                dto.quantidadeEstoque() != null
                        ? dto.quantidadeEstoque()
                        : 0;

        int estoqueMinimo =
                dto.estoqueMinimo() != null
                        ? dto.estoqueMinimo()
                        : 5;

        PublicacaoEstoque estoque = PublicacaoEstoque.builder()
                .publicacao(salva)
                .congregacao(congregacao)
                .quantidade(quantidadeInicial)
                .estoqueMinimo(estoqueMinimo)
                .ativo(true)
                .build();

        publicacaoEstoqueRepository.save(estoque);

        return converterParaResponseDTO(estoque);
    }

    @Transactional
    public PublicacaoResponseDTO atualizar(
            Long id,
            PublicacaoRequestDTO dto
    ) {

        Publicacao publicacao = publicacaoRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Publicação não encontrada com ID: " + id
                ));

        publicacao.setTitulo(dto.titulo().trim());
        publicacao.setCategoria(dto.categoria());

        publicacao.setFormato(
                dto.formato() != null
                        ? dto.formato()
                        : FormatoPublicacao.NORMAL
        );

        publicacao.setIdioma(
                dto.idioma() != null
                        ? dto.idioma()
                        : IdiomaPublicacao.PORTUGUES
        );

        Publicacao atualizada =
                publicacaoRepository.save(publicacao);

        if (dto.congregacaoId() == null) {
            throw new IllegalArgumentException(
                    "O ID da congregação é obrigatório."
            );
        }

        PublicacaoEstoque estoque =
                publicacaoEstoqueRepository
                        .findByPublicacaoIdAndCongregacaoId(
                                id,
                                dto.congregacaoId()
                        )
                        .orElseThrow(() -> new IllegalArgumentException(
                                "Estoque da publicação não encontrado "
                                        + "para a congregação informada."
                        ));

        if (dto.estoqueMinimo() != null) {
            estoque.setEstoqueMinimo(dto.estoqueMinimo());
        }

        PublicacaoEstoque estoqueAtualizado =
                publicacaoEstoqueRepository.save(estoque);

        return converterParaResponseDTO(estoqueAtualizado);
    }

    @Transactional
    public void deletar(Long id) {

        Publicacao publicacao = publicacaoRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Publicação não encontrada com ID: " + id
                ));

        publicacao.setAtivo(false);
        publicacaoRepository.save(publicacao);

        List<PublicacaoEstoque> estoques =
                publicacaoEstoqueRepository.findByPublicacaoId(id);

        estoques.forEach(estoque -> estoque.setAtivo(false));

        publicacaoEstoqueRepository.saveAll(estoques);
    }

    private PublicacaoResponseDTO converterParaResponseDTO(
            PublicacaoEstoque estoque
    ) {

        Publicacao publicacao = estoque.getPublicacao();
        Congregacao congregacao = estoque.getCongregacao();

        int quantidade = estoque.getQuantidade() != null
                ? estoque.getQuantidade()
                : 0;

        int minimo = estoque.getEstoqueMinimo() != null
                ? estoque.getEstoqueMinimo()
                : 0;

        return new PublicacaoResponseDTO(
                publicacao.getId(),
                publicacao.getCodigo(),
                publicacao.getTitulo(),
                publicacao.getCategoria(),
                publicacao.getFormato(),
                publicacao.getIdioma(),
                quantidade,
                minimo,
                quantidade <= minimo,
                congregacao.getId(),
                congregacao.getNome(),
                publicacao.getAtivo() && estoque.getAtivo(),
                publicacao.getCriadoEm()
        );
    }
}