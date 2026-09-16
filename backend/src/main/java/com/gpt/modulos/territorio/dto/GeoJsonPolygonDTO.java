package com.gpt.modulos.territorio.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GeoJsonPolygonDTO {

    @NotBlank(message = "O tipo do GeoJSON é obrigatório")
    private String type;

    @NotEmpty(message = "As coordenadas do Polygon são obrigatórias")
    private List<List<List<Double>>> coordinates;
}
