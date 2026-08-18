package com.gpt.modulos.publicacao.dto;

import com.gpt.modulos.publicacao.model.CategoriaPublicacao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicacaoResponseDTO {

    private Long id;
    private String codigo;
    private String titulo;
    private CategoriaPublicacao categoria;
    private String idioma;
    private Boolean ativo;
}