package com.gpt.modulos.publicacao.dto;

import com.gpt.dominio.enums.CategoriaPublicacao;
import com.gpt.dominio.enums.FormatoPublicacao;
import com.gpt.dominio.enums.IdiomaPublicacao;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record PublicacaoRequestDTO(
        @NotBlank(message = "O código é obrigatório (ex: bi12, th, lff).")
        String codigo,

        @NotBlank(message = "O título da publicação é obrigatório.")
        String titulo,

        @NotNull(message = "A categoria é obrigatória.")
        CategoriaPublicacao categoria,
        
        FormatoPublicacao formato,

        IdiomaPublicacao idioma,
        
        @PositiveOrZero(message = "A quantidade inicial deve ser zero ou positiva.")
        Integer quantidadeEstoque,

        @PositiveOrZero(message = "O estoque mínimo deve ser zero ou positivo.")
        Integer estoqueMinimo,

        @NotNull(message = "A congregação é obrigatória.")
        Long congregacaoId
) {}