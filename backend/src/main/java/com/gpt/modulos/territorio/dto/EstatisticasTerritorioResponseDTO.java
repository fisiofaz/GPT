
package com.gpt.modulos.territorio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstatisticasTerritorioResponseDTO {

    private long totalTerritorios;

    private long territoriosDisponiveis;

    private long territoriosEmTrabalho;

    private long territoriosCadastradosNoPeriodo;

    private long retiradasNoPeriodo;

    private long devolucoesNoPeriodo;
}
