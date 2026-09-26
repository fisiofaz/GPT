package com.gpt.modulos.publicador.model;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_historico_publicador")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HistoricoPublicador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "publicador_id", nullable = false)
    private Long publicadorId;

    @Column(name = "nome_publicador", nullable = false, length = 150)
    private String nomePublicador;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "congregacao_id", nullable = false)
    private Congregacao congregacao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EventoHistoricoPublicador evento;

    @Column(name = "data_evento", nullable = false)
    private LocalDateTime dataEvento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_responsavel_id")
    private Usuario usuarioResponsavel;

    @Column(length = 500)
    private String observacoes;

    @PrePersist
    protected void prePersist() {
        if (dataEvento == null) {
            dataEvento = LocalDateTime.now();
        }
    }
}