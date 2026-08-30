package com.gpt.modulos.pedido.dto;

import com.gpt.modulos.pedido.enums.OrigemItemPedido;
import com.gpt.modulos.pedido.enums.StatusPedidoBetel;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

public class PedidoBetelDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemRequest {
        @NotNull(message = "O ID da publicação é obrigatório")
        private Long publicacaoId;

        @NotNull(message = "A quantidade solicitada é obrigatória")
        @Min(value = 1, message = "A quantidade mínima é 1")
        private Integer quantidadeSolicitada;

        private OrigemItemPedido origem;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriarRequest {
        @NotNull(message = "O ID da congregação é obrigatório")
        private Long congregacaoId;

        private String numeroPedido;

        @NotBlank(message = "O mês/ano de referência é obrigatório (ex: 2026-09)")
        private String mesAnoReferencia;

        private String observacoes;

        @NotEmpty(message = "O pedido deve conter pelo menos um item")
        @Valid
        private List<ItemRequest> itens;

        private List<Long> pedidosPublicadoresIds; // IDs de pedidos especiais que serão vinculados
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConferirItemRequest {
        @NotNull(message = "O ID do item do pedido é obrigatório")
        private Long itemId;

        @NotNull(message = "A quantidade recebida é obrigatória")
        @Min(value = 0, message = "A quantidade recebida não pode ser negativa")
        private Integer quantidadeRecebida;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConferirPedidoRequest {
        @NotEmpty(message = "Informe os itens recebidos")
        @Valid
        private List<ConferirItemRequest> itensRecebidos;

        private String observacoes;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemResponse {
        private Long id;
        private Long publicacaoId;
        private String publicacaoCodigo;
        private String publicacaoTitulo;
        private Integer quantidadeSolicitada;
        private Integer quantidadeRecebida;
        private OrigemItemPedido origem;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long congregacaoId;
        private String congregacaoNome;
        private String numeroPedido;
        private String mesAnoReferencia;
        private LocalDateTime dataCriacao;
        private LocalDateTime dataEnvio;
        private LocalDateTime dataRecebimento;
        private StatusPedidoBetel status;
        private String observacoes;
        private Integer totalItens;
        private List<ItemResponse> itens;
    }
}