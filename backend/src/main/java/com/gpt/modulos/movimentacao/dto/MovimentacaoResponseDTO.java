package com.gpt.modulos.movimentacao.dto;

import java.time.LocalDateTime;

import com.gpt.modulos.movimentacao.enums.TipoMovimentacao;

public record MovimentacaoResponseDTO(
        Long id,
        Long publicacaoId,
        String publicacaoCodigo,
        String publicacaoTitulo,
        TipoMovimentacao tipo,
        Integer quantidade,
        Integer quantidadeAnterior,
        Integer quantidadePosterior,
        Long publicadorId,
        String publicadorNome,
        String responsavelNome,
        String observacoes,
        LocalDateTime dataMovimentacao
) {}