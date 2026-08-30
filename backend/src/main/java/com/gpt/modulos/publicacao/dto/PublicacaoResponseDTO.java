package com.gpt.modulos.publicacao.dto;

import com.gpt.modulos.publicacao.enums.CategoriaPublicacao;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;

import java.time.LocalDateTime;

public record PublicacaoResponseDTO(
        Long id,
        String codigo,
        String titulo,
        CategoriaPublicacao categoria,
        FormatoPublicacao formato,
        IdiomaPublicacao idioma,
        Integer quantidadeEstoque,
        Integer estoqueMinimo,
        boolean alertaEstoqueBaixo,
        Long congregacaoId,
        String congregacaoNome,
        Boolean ativo,
        LocalDateTime criadoEm
) {}