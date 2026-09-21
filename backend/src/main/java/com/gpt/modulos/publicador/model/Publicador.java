package com.gpt.modulos.publicador.model;

import com.gpt.modulos.congregacao.model.Congregacao;
import com.gpt.modulos.pessoa.model.Pessoa;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_publicador")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Publicador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pessoa_id", nullable = false, unique = true)
    private Pessoa pessoa;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean ativo = true;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congregacao_id", nullable = false)
    private Congregacao congregacao;

    @CreationTimestamp
    @Column(name = "criado_em", updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}