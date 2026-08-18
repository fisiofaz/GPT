package com.gpt.modulos.publicacao.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PedidoPublicacaoRequestDTO {

    @NotNull(message = "O publicador é obrigatório")
    private Long publicadorId;

    @NotNull(message = "A congregação é obrigatória")
    private Long congregacaoId;

    @NotNull(message = "A publicação é obrigatória")
    private Long publicacaoId;

    @NotNull(message = "A quantidade é obrigatória")
    @Min(value = 1, message = "A quantidade mínima do pedido é 1")
    private Integer quantidade;

    private String observacoes;
}