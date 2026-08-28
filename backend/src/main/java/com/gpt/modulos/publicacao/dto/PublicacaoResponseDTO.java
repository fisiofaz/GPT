package com.gpt.modulos.publicacao.dto;

import com.gpt.dominio.enums.CategoriaPublicacao;
import com.gpt.dominio.enums.FormatoPublicacao;
import com.gpt.dominio.enums.IdiomaPublicacao;

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