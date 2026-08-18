package com.gpt.modulos.publicacao.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AjusteEstoqueDTO {

    @NotNull(message = "A congregação é obrigatória")
    private Long congregacaoId;

    @NotNull(message = "A publicação é obrigatória")
    private Long publicacaoId;

    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 0, message = "A quantidade não pode ser negativa")
    private Integer quantidade;
}