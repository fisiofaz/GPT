package com.gpt.modulos.usuario.model;

import com.gpt.modulos.congregacao.model.Congregacao;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "tb_usuario")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nome;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(nullable = false)
    private String senha;

    // Relacionamento com a congregação (Tenant) - Pode ser nulo para Admin Geral
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "congregacao_id")
    private Congregacao congregacao;

    @Builder.Default
    @Column(nullable = false)
    private Boolean ativo = true;

    // Relacionamento Many-to-Many para permitir Papéis Acumuláveis
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "tb_usuario_role",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private LocalDateTime atualizadoEm;
}