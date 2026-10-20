package com.gpt.modulos.publicador.dto;

import com.gpt.modulos.publicador.model.EventoHistoricoPublicador;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoPublicadorResponseDTO {

    private Long id;

    private Long publicadorId;

    private String nomePublicador;

    private Long congregacaoId;

    private EventoHistoricoPublicador evento;

    private LocalDateTime dataEvento;

    private Long usuarioResponsavelId;

    private String observacoes;
}