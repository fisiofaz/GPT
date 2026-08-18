package com.gpt.modulos.congregacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CongregacaoRequestDTO {

    @NotBlank(message = "O nome da congregação é obrigatório")
    @Size(max = 150, message = "O nome não pode ter mais de 150 caracteres")
    private String nome;

    @NotBlank(message = "A cidade é obrigatória")
    @Size(max = 100, message = "A cidade não pode ter mais de 100 caracteres")
    private String cidade;

    @NotBlank(message = "O estado (UF) é obrigatório")
    @Size(min = 2, max = 2, message = "O estado deve conter exatamente 2 caracteres (UF)")
    private String estado;
}