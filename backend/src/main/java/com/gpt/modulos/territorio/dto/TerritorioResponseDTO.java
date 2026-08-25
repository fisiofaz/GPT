package com.gpt.modulos.territorio.dto;

import com.gpt.modulos.territorio.model.StatusTerritorio;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TerritorioResponseDTO {

    private Long id;
    private String numero;
    private String nome;
    private String descricao;
    private String poligonoGeojson;
    private StatusTerritorio status;
    private Long congregacaoId;
    private String congregacaoNome;
    private LocalDateTime criadoEm;
}