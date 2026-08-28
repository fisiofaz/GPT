package com.gpt.dominio.dto.pedido;

import com.gpt.dominio.enums.StatusPedidoPublicador;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class PedidoPublicadorDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {
        @NotNull(message = "O ID do publicador é obrigatório")
        private Long publicadorId;

        @NotNull(message = "O ID da publicação é obrigatório")
        private Long publicacaoId;

        @NotNull(message = "O ID da congregação é obrigatório")
        private Long congregacaoId;

        @NotNull(message = "A quantidade é obrigatória")
        @Min(value = 1, message = "A quantidade mínima é 1")
        private Integer quantidade;

        private String observacoes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long publicadorId;
        private String publicadorNome;
        private Long publicacaoId;
        private String publicacaoCodigo;
        private String publicacaoTitulo;
        private Long congregacaoId;
        private Integer quantidade;
        private LocalDateTime dataSolicitacao;
        private LocalDateTime dataAtendimento;
        private StatusPedidoPublicador status;
        private String observacoes;
        private Long pedidoBetelId;
    }
}