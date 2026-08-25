package com.gpt.modulos.territorio.model;

import com.gpt.modulos.publicador.model.Publicador;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_historico_territorio")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class HistoricoTerritorio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "territorio_id", nullable = false)
    private Territorio territorio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publicador_id", nullable = false)
    private Publicador publicador;

    @CreationTimestamp
    @Column(name = "data_retirada", nullable = false, updatable = false)
    private LocalDateTime dataRetirada;

    @Column(name = "data_devolucao")
    private LocalDateTime dataDevolucao;

    @Column(columnDefinition = "TEXT")
    private String observacoes;
}