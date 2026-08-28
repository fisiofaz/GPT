package com.gpt.modulos.publicacao.dto;

import java.time.LocalDateTime;

import com.gpt.dominio.enums.TipoMovimentacao;

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