package com.gpt.modulos.publicacao.dto;

import com.gpt.modulos.publicacao.model.StatusPedido;
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
public class PedidoPublicacaoResponseDTO {

    private Long id;
    private Long publicadorId;
    private String publicadorNome;
    private Long congregacaoId;
    private Long publicacaoId;
    private String publicacaoCodigo;
    private String publicacaoTitulo;
    private Integer quantidade;
    private StatusPedido status;
    private String observacoes;
    private LocalDateTime criadoEm;
    private LocalDateTime atendidoEm;
}