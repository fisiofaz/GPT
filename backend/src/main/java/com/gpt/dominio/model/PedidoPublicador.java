package com.gpt.dominio.model;

import com.gpt.dominio.enums.StatusPedidoPublicador;
import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.publicacao.model.Publicacao;
import com.gpt.modulos.publicador.model.Publicador;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_pedidos_publicadores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PedidoPublicador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicador_id", nullable = false)
    private Publicador publicador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicacao_id", nullable = false)
    private Publicacao publicacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congregacao_id", nullable = false)
    private Congregacao congregacao;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "data_solicitacao", nullable = false)
    private LocalDateTime dataSolicitacao;

    @Column(name = "data_atendimento")
    private LocalDateTime dataAtendimento;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusPedidoPublicador status;

    @Column(length = 255)
    private String observacoes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_betel_id")
    private PedidoBetel pedidoBetel;

    @PrePersist
    public void prePersist() {
        if (this.dataSolicitacao == null) {
            this.dataSolicitacao = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = StatusPedidoPublicador.PENDENTE;
        }
    }
}