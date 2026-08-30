package com.gpt.modulos.pedido.model;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.pedido.enums.StatusPedidoBetel;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tb_pedidos_betel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoBetel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congregacao_id", nullable = false)
    private Congregacao congregacao;

    @Column(name = "numero_pedido", length = 50)
    private String numeroPedido;

    @Column(name = "mes_ano_referencia", nullable = false, length = 7)
    private String mesAnoReferencia; // Ex: "2026-09"

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao;

    @Column(name = "data_envio")
    private LocalDateTime dataEnvio;

    @Column(name = "data_recebimento")
    private LocalDateTime dataRecebimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusPedidoBetel status;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @OneToMany(mappedBy = "pedidoBetel", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ItemPedidoBetel> itens = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (this.dataCriacao == null) {
            this.dataCriacao = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusPedidoBetel.RASCUNHO;
        }
    }
}