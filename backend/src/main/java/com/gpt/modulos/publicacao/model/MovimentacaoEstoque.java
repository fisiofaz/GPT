package com.gpt.modulos.publicacao.model;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.publicacao.enums.TipoMovimentacao;
import com.gpt.modulos.publicador.model.Publicador;
import com.gpt.modulos.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_movimentacao_estoque")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimentacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicacao_id", nullable = false)
    private Publicacao publicacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congregacao_id", nullable = false)
    private Congregacao congregacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMovimentacao tipo;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(name = "quantidade_anterior", nullable = false)
    private Integer quantidadeAnterior;

    @Column(name = "quantidade_posterior", nullable = false)
    private Integer quantidadePosterior;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicador_id")
    private Publicador publicador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsavel_id", nullable = false)
    private Usuario responsavel;

    @Column(length = 255)
    private String observacoes;

    @CreationTimestamp
    @Column(name = "data_movimentacao", updatable = false)
    private LocalDateTime dataMovimentacao;
    
    @PrePersist
    public void prePersist() {
        if (this.dataMovimentacao == null) {
            this.dataMovimentacao = LocalDateTime.now();
        }
    }
}