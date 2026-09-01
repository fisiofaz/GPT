package com.gpt.modulos.congregacao.dto;

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
public class CongregacaoResponseDTO {

    private Long id;
    private String nome;
    private String numero;
    private String cidade;
    private String estado;
    private LocalDateTime criadoEm;
}