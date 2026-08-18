package com.gpt.modulos.territorio.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoTerritorioResponseDTO {

    private Long id;
    private Long territorioId;
    private String territorioNumero;
    private Long publicadorId;
    private String publicadorNome;
    private LocalDateTime dataRetirada;
    private LocalDateTime dataDevolucao;
    private String observacoes;
}
