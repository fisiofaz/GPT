package com.gpt.modulos.publicador.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicadorResponseDTO {
    private Long id;
    private String nome;
    private String telefone;
    private Boolean ativo;
    private Long congregacaoId;
}