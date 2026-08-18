package com.gpt.modulos.publicacao.dto;

import com.gpt.modulos.publicacao.model.CategoriaPublicacao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PublicacaoRequestDTO {

    @NotBlank(message = "O código/símbolo é obrigatório")
    @Size(max = 30, message = "O código não pode exceder 30 caracteres")
    private String codigo;

    @NotBlank(message = "O título é obrigatório")
    @Size(max = 150, message = "O título não pode exceder 150 caracteres")
    private String titulo;

    @NotNull(message = "A categoria é obrigatória")
    private CategoriaPublicacao categoria;

    private String idioma;
}