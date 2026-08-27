package com.gpt.modulos.publicacao.dto;

import com.gpt.modulos.publicacao.model.TipoMovimentacao;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record MovimentacaoEstoqueDTO(
        @NotNull(message = "O tipo de movimentação é obrigatório.")
        TipoMovimentacao tipo,

        @NotNull(message = "A quantidade é obrigatória.")
        @Positive(message = "A quantidade deve ser maior que zero.")
        Integer quantidade,

        Long publicadorId, // Opcional (obrigatório se tipo for SAIDA para publicador)
        String observacoes
) {}