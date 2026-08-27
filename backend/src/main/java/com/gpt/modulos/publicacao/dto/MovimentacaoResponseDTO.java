package com.gpt.modulos.publicacao.dto;

import com.gpt.modulos.publicacao.model.TipoMovimentacao;
import java.time.LocalDateTime;

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