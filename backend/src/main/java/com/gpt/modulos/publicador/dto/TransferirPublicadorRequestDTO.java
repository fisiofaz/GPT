package com.gpt.modulos.publicador.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TransferirPublicadorRequestDTO {

    @NotNull(message = "A congregação de destino é obrigatória.")
    private Long congregacaoDestinoId;
}