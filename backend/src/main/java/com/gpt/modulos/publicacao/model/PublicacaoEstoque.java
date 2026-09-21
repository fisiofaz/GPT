package com.gpt.modulos.publicacao.model;

import com.gpt.modulos.congregacao.model.Congregacao;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "tb_publicacao_estoque",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_publicacao_estoque_publicacao_congregacao",
                        columnNames = {"publicacao_id", "congregacao_id"}
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicacaoEstoque {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "publicacao_id", nullable = false)
    private Publicacao publicacao;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "congregacao_id", nullable = false)
    private Congregacao congregacao;

    @Column(nullable = false)
    @Builder.Default
    private Integer quantidade = 0;

    @Column(name = "estoque_minimo", nullable = false)
    @Builder.Default
    private Integer estoqueMinimo = 5;

    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}