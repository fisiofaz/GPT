package com.gpt.modulos.territorio.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AtualizarPoligonoRequestDTO {

    @NotNull(message = "O GeoJSON é obrigatório")
    @Valid
    private GeoJsonPolygonDTO poligonoGeojson;
}
