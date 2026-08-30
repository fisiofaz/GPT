package com.gpt.modulos.publicacao.model;

import com.gpt.modulos.publicacao.enums.CategoriaPublicacao;
import com.gpt.modulos.publicacao.enums.FormatoPublicacao;
import com.gpt.modulos.publicacao.enums.IdiomaPublicacao;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tb_catalogo_mestre")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogoMestre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private CategoriaPublicacao categoria;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private FormatoPublicacao formato = FormatoPublicacao.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    @Builder.Default
    private IdiomaPublicacao idioma = IdiomaPublicacao.PORTUGUES;

    @Column(length = 255)
    private String descricao;
}