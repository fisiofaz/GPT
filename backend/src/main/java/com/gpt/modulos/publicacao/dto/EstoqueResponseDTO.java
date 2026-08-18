package com.gpt.modulos.publicacao.dto;

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
public class EstoqueResponseDTO {

    private Long id;
    private Long congregacaoId;
    private Long publicacaoId;
    private String publicacaoCodigo;
    private String publicacaoTitulo;
    private Integer quantidadeDisponivel;
    private LocalDateTime atualizadoEm;
}