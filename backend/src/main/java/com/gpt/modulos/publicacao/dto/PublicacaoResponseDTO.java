package com.gpt.modulos.publicacao.dto;

import com.gpt.modulos.publicacao.model.CategoriaPublicacao;
import java.time.LocalDateTime;

public record PublicacaoResponseDTO(
        Long id,
        String codigo,
        String titulo,
        CategoriaPublicacao categoria,
        String idioma,
        Integer quantidadeEstoque,
        Integer estoqueMinimo,
        boolean alertaEstoqueBaixo,
        Long congregacaoId,
        String congregacaoNome,
        Boolean ativo,
        LocalDateTime criadoEm
) {}