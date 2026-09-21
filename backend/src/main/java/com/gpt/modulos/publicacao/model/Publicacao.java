package com.gpt.modulos.publicacao.model;

import com.gpt.modulos.publicacao.enums.CategoriaPublicacao;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_publicacao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Publicacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CategoriaPublicacao categoria;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    @Builder.Default
    private FormatoPublicacao formato = FormatoPublicacao.NORMAL;
    
    @Enumerated(EnumType.STRING)
    @Column(length = 40)
    @Builder.Default
    private IdiomaPublicacao idioma = IdiomaPublicacao.PORTUGUES;
    
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