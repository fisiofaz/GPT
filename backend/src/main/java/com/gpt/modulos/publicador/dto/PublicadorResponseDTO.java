package com.gpt.modulos.publicador.dto;

import java.time.LocalDate;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicadorResponseDTO {
    private Long id;
    private String nome;
    private LocalDate dataNascimento;
    private String telefone;
    private String email;
    private Boolean ativo;
    private Long congregacaoId;
}