package com.gpt.modulos.territorio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TerritorioRequestDTO {

    @NotBlank(message = "O número do território é obrigatório")
    @Size(max = 20, message = "O número não pode exceder 20 caracteres")
    private String numero;

    @NotBlank(message = "O nome/bairro do território é obrigatório")
    @Size(max = 150, message = "O nome não pode exceder 150 caracteres")
    private String nome;

    private String descricao;

    @NotNull(message = "A congregação é obrigatória")
    private Long congregacaoId;
}