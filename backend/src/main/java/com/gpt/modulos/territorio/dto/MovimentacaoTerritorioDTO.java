package com.gpt.modulos.territorio.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MovimentacaoTerritorioDTO {

    @NotNull(message = "O ID do publicador é obrigatório")
    private Long publicadorId;

    private String observacoes;
}