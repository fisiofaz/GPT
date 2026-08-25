package com.gpt.modulos.publicador.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublicadorRequestDTO {

    @NotBlank(message = "O nome do publicador é obrigatório")
    @Size(max = 150, message = "O nome não pode exceder 150 caracteres")
    private String nome;

    @Size(max = 20, message = "O telefone não pode exceder 20 caracteres")
    private String telefone;

    @NotNull(message = "A congregação é obrigatória")
    private Long congregacaoId;
}