package com.gpt.modulos.publicacao.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstatisticasPublicacaoResponseDTO {

    private long totalPublicacoes;
    private long estoquesAtivos;
    private long estoquesBaixos;
    private long estoquesZerados;
    private long totalExemplares;

    private long entradasNoPeriodo;
    private long saidasNoPeriodo;
    private long ajustesNoPeriodo;

    private long exemplaresEntradosNoPeriodo;
    private long exemplaresSaidosNoPeriodo;
}