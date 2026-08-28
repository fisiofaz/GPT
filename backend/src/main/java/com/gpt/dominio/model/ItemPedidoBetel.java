package com.gpt.dominio.model;

import com.gpt.dominio.enums.OrigemItemPedido;
import com.gpt.modulos.publicacao.model.Publicacao;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_itens_pedido_betel")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemPedidoBetel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_betel_id", nullable = false)
    private PedidoBetel pedidoBetel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicacao_id", nullable = false)
    private Publicacao publicacao;

    @Column(name = "quantidade_solicitada", nullable = false)
    private Integer quantidadeSolicitada;

    @Column(name = "quantidade_recebida")
    @Builder.Default
    private Integer quantidadeRecebida = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private OrigemItemPedido origem = OrigemItemPedido.ESTOQUE;
}